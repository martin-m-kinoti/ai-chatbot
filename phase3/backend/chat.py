from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv
load_dotenv()

router = APIRouter()

SYSTEM_PROMPT = """You are Raven, an AI-powered personal health assistant. \
You help users understand their symptoms and make informed decisions about seeking medical care.

Guidelines:
- Always remind users you are not a substitute for professional medical advice
- Be empathetic and clear — avoid jargon unless you explain it
- Structure responses: possible conditions, general guidance, and when to see a doctor
- Ask one clarifying follow-up question to narrow down the symptom picture
- Never diagnose definitively — use phrases like "this may be consistent with" or "could suggest"
- If symptoms sound serious but not immediately life-threatening, recommend seeing a doctor soon
"""


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[Message] = []


class ChatResponse(BaseModel):
    reply: str


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    client = OpenAI(api_key=os.getenv("API_KEY"))

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend([m.model_dump() for m in req.history])
    messages.append({"role": "user", "content": req.message})

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
        )
        return ChatResponse(reply=response.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
