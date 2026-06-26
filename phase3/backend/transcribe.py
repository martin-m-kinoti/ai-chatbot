from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from openai import OpenAI
import os

router = APIRouter()


class TranscribeResponse(BaseModel):
    text: str


@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe(audio: UploadFile = File(...)):
    client = OpenAI(api_key=os.getenv("API_KEY"))
    try:
        content = await audio.read()
        mime = audio.content_type or "audio/webm"
        filename = audio.filename or "recording.webm"
        response = client.audio.transcriptions.create(
            model="whisper-1",
            file=(filename, content, mime),
        )
        return TranscribeResponse(text=response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
