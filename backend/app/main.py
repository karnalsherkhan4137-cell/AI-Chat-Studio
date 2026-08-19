from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base
from app.database import engine

# Import models so SQLAlchemy registers them
from app.models.user import User
from app.routers.auth import router as auth_router
from app.routers.chat import router as chat_router


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AI Chat Studio API",
    version="1.0.0",
    description="Backend API for AI Chat Studio"
)

app.include_router(auth_router)
app.include_router(chat_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "Welcome to AI Chat Studio API",
        "status": "Running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }