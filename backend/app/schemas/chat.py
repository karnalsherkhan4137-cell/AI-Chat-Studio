from datetime import datetime
from typing import List

from pydantic import BaseModel, ConfigDict


# ----------------------------
# Create Chat
# ----------------------------

class ChatCreate(BaseModel):
    title: str


# ----------------------------
# Rename Chat
# ----------------------------

class ChatRename(BaseModel):
    title: str


# ----------------------------
# Send Message
# ----------------------------

class MessageCreate(BaseModel):
    message: str


# ----------------------------
# Message Response
# ----------------------------

class MessageResponse(BaseModel):
    id: int
    sender: str
    message: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# ----------------------------
# Chat Response
# ----------------------------

class ChatResponse(BaseModel):
    id: int
    title: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# ----------------------------
# Chat History
# ----------------------------

class ChatHistory(BaseModel):
    id: int
    title: str
    created_at: datetime
    messages: List[MessageResponse]

    model_config = ConfigDict(
        from_attributes=True
    )