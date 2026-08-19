from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.user import User
from app.models.chat import Chat
from app.models.message import Message

from app.schemas.chat import (
    ChatCreate,
    ChatRename,
    ChatResponse,
    ChatHistory,
    MessageCreate,
    MessageResponse,
)

from app.services.ai_service import generate_response
from app.security import get_current_user


router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


# ==========================================
# Create New Chat
# ==========================================

@router.post(
    "/new",
    response_model=ChatResponse,
    status_code=status.HTTP_201_CREATED
)
def create_chat(
    chat: ChatCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    new_chat = Chat(
        title=chat.title,
        user_id=current_user.id
    )

    db.add(new_chat)

    db.commit()

    db.refresh(new_chat)

    return new_chat


# ==========================================
# Get All Chats
# ==========================================

@router.get(
    "/",
    response_model=list[ChatResponse]
)
def get_chats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    chats = (
        db.query(Chat)
        .filter(Chat.user_id == current_user.id)
        .order_by(Chat.created_at.desc())
        .all()
    )

    return chats
# ==========================================
# Get Single Chat
# ==========================================

@router.get(
    "/{chat_id}",
    response_model=ChatResponse
)
def get_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    chat = (
        db.query(Chat)
        .filter(
            Chat.id == chat_id,
            Chat.user_id == current_user.id
        )
        .first()
    )

    if chat is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found."
        )

    return chat


# ==========================================
# Get All Messages in a Chat
# ==========================================

@router.get(
    "/{chat_id}/messages",
    response_model=list[MessageResponse]
)
def get_chat_messages(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    chat = (
        db.query(Chat)
        .filter(
            Chat.id == chat_id,
            Chat.user_id == current_user.id
        )
        .first()
    )

    if chat is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found."
        )

    messages = (
        db.query(Message)
        .filter(Message.chat_id == chat_id)
        .order_by(Message.created_at.asc())
        .all()
    )

    return messages


# ==========================================
# Get Chat History
# ==========================================

@router.get(
    "/history/{chat_id}",
    response_model=ChatHistory
)
def get_chat_history(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    chat = (
        db.query(Chat)
        .filter(
            Chat.id == chat_id,
            Chat.user_id == current_user.id
        )
        .first()
    )

    if chat is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found."
        )

    return chat


# ==========================================
# Send Message (user message -> AI reply)
# ==========================================

@router.post(
    "/{chat_id}/messages",
    response_model=list[MessageResponse],
    status_code=status.HTTP_201_CREATED
)
def send_message(
    chat_id: int,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    chat = (
        db.query(Chat)
        .filter(
            Chat.id == chat_id,
            Chat.user_id == current_user.id
        )
        .first()
    )

    if chat is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found."
        )

    user_message = Message(
        chat_id=chat.id,
        sender="user",
        message=payload.message,
    )
    db.add(user_message)

    ai_reply_text = generate_response(payload.message)

    ai_message = Message(
        chat_id=chat.id,
        sender="assistant",
        message=ai_reply_text,
    )
    db.add(ai_message)

    db.commit()
    db.refresh(user_message)
    db.refresh(ai_message)

    return [user_message, ai_message]


# ==========================================
# Rename Chat
# ==========================================

@router.put(
    "/{chat_id}",
    response_model=ChatResponse
)
def rename_chat(
    chat_id: int,
    chat_data: ChatRename,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    chat = (
        db.query(Chat)
        .filter(
            Chat.id == chat_id,
            Chat.user_id == current_user.id
        )
        .first()
    )

    if chat is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found."
        )

    chat.title = chat_data.title

    db.commit()
    db.refresh(chat)

    return chat


# ==========================================
# Delete Chat
# ==========================================

@router.delete(
    "/{chat_id}"
)
def delete_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    chat = (
        db.query(Chat)
        .filter(
            Chat.id == chat_id,
            Chat.user_id == current_user.id
        )
        .first()
    )

    if chat is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found."
        )

    db.delete(chat)
    db.commit()

    return {
        "message": "Chat deleted successfully."
    }