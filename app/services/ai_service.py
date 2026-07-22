import os

from dotenv import load_dotenv
from google import genai
from sqlalchemy.orm import Session

from app.models.chat import ChatHistory
from app.schemas.ai import ChatResponse

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def chat_with_ai(
    db: Session,
    message: str,
    user_id: int
):

    medical_prompt = f"""
You are an AI Medical Assistant.

Rules:
- Answer ONLY medical and healthcare-related questions.
- If the question is not medical, politely refuse and say that you only answer medical questions.
- Never claim to be a real doctor.
- Never provide dangerous or harmful advice.
- Recommend consulting a healthcare professional whenever necessary.
- If it is an emergency, advise the user to seek immediate medical attention.
- Use simple English.
- Use bullet points whenever possible.
- Keep the answer between 100 and 150 words.
- Never exceed 150 words.
- Do not write unnecessary introductions.

User Question:
{message}
"""

    try:

        response = client.models.generate_content(
            model="models/gemini-3.5-flash",
            contents=medical_prompt
        )

        print("\n================ GEMINI RESPONSE ================")
        print(response)
        print("=================================================\n")

        if getattr(response, "text", None):
            answer = response.text
            
            print("ANSWER FROM GEMINI:")
            print(answer)

        elif (
            hasattr(response, "candidates")
            and response.candidates
            and response.candidates[0].content.parts
        ):
            answer = response.candidates[0].content.parts[0].text

        else:
            answer = "Sorry! I couldn't generate a response."

    except Exception as e:

        print("\n============= GEMINI ERROR =============")
        print(e)
        print("========================================\n")

        answer = f"Error: {str(e)}"

    chat = ChatHistory(
        user_id=user_id,
        question=message,
        answer=answer
    )

    db.add(chat)
    db.commit()
    db.refresh(chat)

    return ChatResponse(
        response=answer
    )


def delete_chat(
    db: Session,
    chat_id: int,
    user_id: int
):

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
            "message": "Chat not found."
        }

    db.delete(chat)
    db.commit()

    return {
        "message": "Chat deleted successfully."
    }