from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.database.database import Base, engine

# Models
from app.models.user import User
from app.models.chat import ChatHistory

# Routers
from app.api.user import router as user_router
from app.api.ai import router as ai_router

app = FastAPI(
    title="AI Medical Assistant API",
    description="Backend API for AI Medical Assistant",
    version="1.0.0"
)

# Database
Base.metadata.create_all(bind=engine)

# Static Files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")

# Include Routers
app.include_router(user_router)
app.include_router(ai_router)


@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {"request": request}
    )


@app.get("/login", response_class=HTMLResponse)
def login_page(request: Request):
    return templates.TemplateResponse(
        "login.html",
        {"request": request}
    )

@app.get("/register", response_class=HTMLResponse)
def register_page(request: Request):
    return templates.TemplateResponse(
        "register.html",
        {"request": request}
    )


@app.get("/chat", response_class=HTMLResponse)
def chat_page(request: Request):
    return templates.TemplateResponse(
        "chat.html",
        {"request": request}
    )