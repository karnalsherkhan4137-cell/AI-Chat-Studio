from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    DATABASE_URL: str

    SECRET_KEY: str

    ALGORITHM: str

    ACCESS_TOKEN_EXPIRE_MINUTES: int
    GEMINI_API_KEY: str | None = Field(default=None)
    GEMINI_MODEL: str = "gemini-2.5-flash"


    class Config:
        env_file = Path(__file__).resolve().parent.parent / ".env"


settings = Settings()