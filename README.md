# Raven Health AI

![Raven Health AI](assets/health-tech-pic.avif)

**Raven** is an AI-powered personal health assistant that helps users understand their symptoms and make informed decisions about seeking medical care. Using natural language processing and large language models, Raven lets users describe symptoms via text or voice, submit photos of visible conditions, and receive structured guidance — including possible conditions, treatment information, and specialist recommendations.

The system is grounded in a curated medical knowledge base using retrieval-augmented generation (RAG) to keep responses accurate and evidence-based. A dedicated safety layer detects emergency symptoms and immediately directs users to appropriate emergency services, bypassing the AI entirely.

> **Disclaimer:** Raven is an informational tool only and is not a substitute for professional medical advice, diagnosis, or treatment. 

---

## Key Features

- **Text & Voice Symptom Input** — Describe symptoms conversationally or speak them aloud via real-time speech-to-text
- **Visual Symptom Analysis** — Upload or capture images of visible conditions for AI-assisted visual assessment
- **AI Recommendations** — Receive a ranked list of possible conditions, general treatment plans, and specialist referral suggestions
- **Emergency Safety Layer** — Automatically detects red-flag symptoms and routes users to emergency care before any AI processing
- **RAG-Powered Responses** — Answers grounded in authoritative sources (MedlinePlus, NHS, ICD-10) via a vector knowledge base
- **Medical NER** — Extracts and normalizes medical entities from natural language

---

## Tech Stack

| Component | Technology |
|---|---|
| LLM | GPT OpenAI API |
| Backend | Python 3.11 + FastAPI |
| Frontend | React |
| Database | MongoDB |
| Speech-to-Text | OpenAI Whisper |
| Medical NER | scispaCy + MedSpaCy |
| Knowledge Base | FAISS + sentence-transformers |

---

## Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd ai-chatbot

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows

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

---

## Project Structure

```
ai-chatbot/phases/
├── backend/         # FastAPI app, RAG pipeline, safety classifier, NER, voice, vision
├── frontend/        # React UI — chat interface, image upload, voice recorder
├── data/            # Medical knowledge base documents and vector store index
├── assets/          # Static assets
└── tests/           # Unit and integration tests
```

---

## Ethical Considerations

- Responses always include a disclaimer that Raven is not a diagnostic tool
- No personally identifiable health data is stored without explicit user consent
- Emergency pathways are hardcoded and cannot be suppressed by user input or prompt manipulation
- Designed for educational and informational use only