AI-Powered Personal Diagnostic Assistant

---

## Overview

Raven is an NLP-driven medical chatbot designed to act as a personal health assistant. It allows users to describe symptoms through text or voice, submit images of visible symptoms, and receive structured health guidance — including possible conditions, recommended next steps, treatment information, and specialist referrals. The system is grounded in a curated medical knowledge base and uses retrieval-augmented generation (RAG) to ensure responses are accurate and contextually relevant.

---

## Core Features

### 1. Symptom Search — Text Input
- Users can describe symptoms in natural, conversational language (e.g., *"I have a sore throat and mild fever for two days"*)

### 2. Symptom Search — Voice Input
- Users can speak their symptoms directly via a microphone interface
- Speech-to-text transcription converts audio to text in real time using Whisper (OpenAI) or Web Speech API

### 3. Image Capture — Visual Symptom Analysis
- Users can upload or capture photos of visible symptoms (rashes, wounds, swelling, eye conditions, etc.)
- A vision-language model analyzes the image
- Image analysis output is combined with any text/voice description for a richer diagnostic context
- Supported visual categories include: skin conditions, eye redness/discharge, wound assessment, and swelling/inflammation

### 4. AI-Powered Recommendations
- **Possible Conditions:** The system presents a ranked list of potential conditions consistent with the reported symptoms, along with brief explanations
- **Treatment Plans:** General treatment information is provided for each condition — home remedies, OTC medications, lifestyle adjustments, and when to escalate
- **Specialist Advice:** Based on the symptom profile, the system recommends the appropriate type of specialist (e.g., dermatologist, cardiologist, ENT) and explains why
- **Follow-up Questions:** The bot asks clarifying questions to narrow the differential (e.g., *"Is the rash itchy or painful? Does it spread?"*)

### 5. Emergency Safety Layer
- A dedicated classifier runs before every LLM call to detect red-flag symptoms requiring immediate emergency care
- Trigger conditions include: chest pain with shortness of breath, signs of stroke (FAST), severe allergic reactions, suicidal ideation, and loss of consciousness
- On detection, the system immediately bypasses the LLM and returns a hardcoded emergency directive with local emergency contact guidance
- This layer cannot be overridden by conversation context or user prompts


---

## System Architecture

```
User Input (Text / Voice / Image)
        │
        ▼
 ┌─────────────────────┐
 │  Input Processor    │  
 └─────────┬───────────┘
           │
           ▼
 ┌─────────────────────┐
 │  Safety Classifier  │  
 └─────────┬───────────┘
           │
           ▼
 ┌─────────────────────┐
 │  Medical NER        │ 
 └─────────┬───────────┘
           │
           ▼
 ┌─────────────────────┐
 │  LLM (GPT API)      │  
 └─────────┬───────────┘
           │
           ▼
 ┌─────────────────────┐
 │  Response           │  
 └─────────┬───────────┘
           │
           ▼
      User Interface (React)
```

---


## Tech Stack

| Component | Technology |
|---|---|
| LLM | GPT OpenAI API |
| Backend | Python 3.11 + FastAPI |
| Frontend | React |
| Database | MongoDB |

---

## Ethical and Legal Considerations

- All responses include an automatic disclaimer that the bot is not a substitute for professional medical advice
- No personally identifiable health data is stored in production without explicit user consent
- The system is designed for informational and educational use only

---

## Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd ai-chatbot

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Add your API_KEY and other keys to .env

# Run the backend
uvicorn backend.main:app --reload

# Run the frontend (separate terminal)
npm run dev
```