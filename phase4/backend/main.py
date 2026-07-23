from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from chat import router as chat_router
from transcribe import router as transcribe_router
from speak import router as speak_router

load_dotenv()

app = FastAPI(title="Raven Health AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(transcribe_router)
app.include_router(speak_router)