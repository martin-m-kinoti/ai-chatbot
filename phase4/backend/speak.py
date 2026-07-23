from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from openai import OpenAI
import os

router = APIRouter()


class SpeakRequest(BaseModel):
    text: str


@router.post("/speak")
async def speak(req: SpeakRequest):
    client = OpenAI(api_key=os.getenv("API_KEY"))
    try:
        response = client.audio.speech.create(
            model="tts-1",
            voice="sage",
            input=req.text,
        )
        return StreamingResponse(
            response.iter_bytes(chunk_size=4096),
            media_type="audio/mpeg",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
