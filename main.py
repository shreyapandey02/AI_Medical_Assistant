from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.database.database import Base, engine
from app.models.user import User
from app.models.chat import ChatHistory
from app.api.user import router as user_router
from app.api.ai import router as ai_router

app = FastAPI(
    title="AI Medical Assistant API",
    description="Backend API for AI-powered medical assistant",
    version="1.0.0",
)

templates = Jinja2Templates(directory="templates")

app.mount("/static", StaticFiles(directory="static"), name="static")

Base.metadata.create_all(bind=engine)

app.include_router(user_router)
app.include_router(ai_router)


@app.get("/")
def home(request: Request):
    print("HOME PAGE OPENED")
    return templates.TemplateResponse(
        request=request,
        name="index.html"
    )


@app.get("/login", response_class=HTMLResponse)
def login_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="login.html"
    )


@app.get("/register", response_class=HTMLResponse)
def register_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="register.html"
    )

@app.get("/chat", response_class=HTMLResponse)
def chat_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="chat.html"
    )