import base64
import json
import os

from dotenv import load_dotenv
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from openai import OpenAI
from pydantic import BaseModel, ValidationError

load_dotenv()

router = APIRouter()

client = OpenAI(api_key=os.getenv("API_KEY"))

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

IMAGE_SYSTEM_PROMPT = SYSTEM_PROMPT + """
The user has attached a photo of a visible symptom (e.g. skin, eye, swelling, wound).

Additional guidelines for photo analysis:
- Describe only what is visibly observable (color, shape, texture, size relative to \
  visible landmarks, distribution) before offering possibilities
- Be explicit that photo quality, lighting, and camera angle limit what can be assessed, \
  and that a definitive assessment requires in-person examination
- Never confirm or rule out a condition based on the image alone
- If the image shows signs that could indicate a medical emergency (e.g. spreading redness \
  with fever, signs of severe allergic reaction, deep or heavily bleeding wounds, \
  discoloration suggesting poor circulation), lead with a clear recommendation to seek \
  urgent in-person care before anything else
"""

MAX_IMAGE_BYTES = 8 * 1024 * 1024  # 8MB
ACCEPTED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic"}


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[Message] = []


class ChatResponse(BaseModel):
    reply: str


def _call_openai(messages: list[dict]) -> str:
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
        )
        return response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend([m.model_dump() for m in req.history])
    messages.append({"role": "user", "content": req.message})

    reply = _call_openai(messages)
    return ChatResponse(reply=reply)


@router.post("/chat/image", response_model=ChatResponse)
async def chat_image(
    image: UploadFile = File(...),
    message: str = Form(""),
    history: str = Form("[]"),
):
    """
    Handles chat with an image attachment. Supports text + image together.
    
    - image: required image file (JPEG, PNG, WEBP, HEIC)
    - message: optional text describing the symptom or question
    - history: JSON array of previous messages for context
    """
    
    # File validation
    if image.content_type not in ACCEPTED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image type. Please upload a JPEG, PNG, WEBP, or HEIC file.",
        )

    contents = await image.read()
    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"Image is too large. Max size is {MAX_IMAGE_BYTES // (1024 * 1024)}MB.",
        )
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    # History
    try:
        history_raw = json.loads(history)
        parsed_history = [Message(**m) for m in history_raw]
    except (json.JSONDecodeError, ValidationError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid history payload.")

    # --- Build the data URI for the vision model ---
    b64_image = base64.b64encode(contents).decode("utf-8")
    data_uri = f"data:{image.content_type};base64,{b64_image}"

    user_text = message.strip() or "Here's a photo of the symptom I'm asking about."

    messages = [{"role": "system", "content": IMAGE_SYSTEM_PROMPT}]
    messages.extend([m.model_dump() for m in parsed_history])
    messages.append(
        {
            "role": "user",
            "content": [
                {"type": "text", "text": user_text},
                {"type": "image_url", "image_url": {"url": data_uri, "detail": "high"}},
            ],
        }
    )

    reply = _call_openai(messages)
    return ChatResponse(reply=reply)