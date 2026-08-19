from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional


# -----------------------------
# Register Schema
# -----------------------------

class UserRegister(BaseModel):
    username: str = Field(
        ...,
        min_length=3,
        max_length=50
    )

    email: EmailStr

    password: str = Field(
        ...,
        min_length=8,
        max_length=100
    )


# -----------------------------
# Login Schema
# -----------------------------

class UserLogin(BaseModel):
    email: EmailStr
    password: str


# -----------------------------
# JWT Token Schema
# -----------------------------

class Token(BaseModel):
    access_token: str
    token_type: str


# -----------------------------
# Token Payload
# -----------------------------

class TokenData(BaseModel):
    email: Optional[str] = None


# -----------------------------
# User Response
# -----------------------------

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    profile_image: str
    is_active: int

    model_config = ConfigDict(
        from_attributes=True
    )


# -----------------------------
# User Profile Update
# -----------------------------

class UserUpdate(BaseModel):

    username: Optional[str] = Field(
        default=None,
        min_length=3,
        max_length=50
    )

    profile_image: Optional[str] = None


# -----------------------------
# Change Password
# -----------------------------

class ChangePassword(BaseModel):

    old_password: str

    new_password: str = Field(
        ...,
        min_length=8,
        max_length=100
    )


# -----------------------------
# API Message Response
# -----------------------------

class MessageResponse(BaseModel):
    message: str