import os

from dotenv import load_dotenv
from google import genai
from sqlalchemy.orm import Session

from app.models.chat import ChatHistory

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

# Sirf development ke liye
for model in client.models.list():
    print(model.name, model.supported_actions)


def chat_with_ai(db: Session, message: str, user_id: int):
    try:
        medical_prompt = f"""
You are an AI Medical Assistant.

Rules:
1. Answer ONLY medical and healthcare-related questions.
2. If the user asks a non-medical question, politely reply:
   "I am an AI Medical Assistant and can only help with health and medical topics."
3. Never claim to be a licensed doctor.
4. Never give a final diagnosis.
5. For emergencies (chest pain, difficulty breathing, severe bleeding, unconsciousness), advise the user to seek immediate medical care.
6. Keep answers clear and easy to understand.
7. Keep responses between 150 and 250 words unless the user explicitly asks for a detailed explanation.
8. Use bullet points where appropriate.

User Question:
{message}
"""

        response = client.models.generate_content(
            model="gemini-3.1-flash-lite-preview",
            contents=medical_prompt
        )

        chat = ChatHistory(
            user_id=user_id,
            question=message,
            answer=response.text
        )

        db.add(chat)
        db.commit()

        return {
            "response": response.text
        }

    except Exception as e:
        return {
            "response": str(e)
        }


def delete_chat(db: Session, chat_id: int, user_id: int):
    chat = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.id == chat_id,
            ChatHistory.user_id == user_id
        )
        .first()
    )

    if not chat:
        return {
            "message": "Chat not found"
        }

    db.delete(chat)
    db.commit()

    return {
        "message": "Chat deleted successfully"
    }