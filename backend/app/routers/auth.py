from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User

from app.schemas.auth import (
    UserRegister,
    UserLogin,
    Token,
    UserResponse,
    UserUpdate,
    ChangePassword,
    MessageResponse,
)

from app.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)


router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)


# ==========================================
# Register
# ==========================================

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):

    existing_email = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )

    existing_username = (
        db.query(User)
        .filter(User.username == user_data.username)
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken."
        )

    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# ==========================================
# Login
# ==========================================

@router.post(
    "/login",
    response_model=Token
)
def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.email == credentials.email)
        .first()
    )

    invalid_credentials = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if user is None:
        raise invalid_credentials

    if not verify_password(credentials.password, user.hashed_password):
        raise invalid_credentials

    access_token = create_access_token(
        data={"sub": user.email}
    )

    return Token(
        access_token=access_token,
        token_type="bearer"
    )


# ==========================================
# Current User
# ==========================================

@router.get(
    "/me",
    response_model=UserResponse
)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user


@router.put(
    "/me",
    response_model=UserResponse
)
def update_me(
    updates: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if updates.username is not None:

        existing = (
            db.query(User)
            .filter(
                User.username == updates.username,
                User.id != current_user.id
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken."
            )

        current_user.username = updates.username

    if updates.profile_image is not None:
        current_user.profile_image = updates.profile_image

    db.commit()
    db.refresh(current_user)

    return current_user


# ==========================================
# Change Password
# ==========================================

@router.put(
    "/change-password",
    response_model=MessageResponse
)
def change_password(
    data: ChangePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if not verify_password(data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Old password is incorrect."
        )

    current_user.hashed_password = hash_password(data.new_password)
    db.commit()

    return MessageResponse(message="Password updated successfully.")
