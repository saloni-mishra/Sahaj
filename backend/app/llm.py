
import os
from dotenv import load_dotenv
from google import genai
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

def explain_guide(question, guide_title, guide_steps, current_step):
    if client is None:
        return "AI assistance is currently unavailable. Please follow the instructions shown on screen."

    prompt = f"""
    You are Sahaj, a friendly technology assistant for older adults.

    The user asked: {question}

    Guide topic: {guide_title}

    Official guide instructions:
    {guide_steps}

    Current step: {current_step}

    Your task:
    1. Explain the current step in very simple English.
    2. Use short, clear sentences.
    3. Avoid technical words.
    4. Give only information supported by the official guide.
    5. Never invent phone settings or steps.
    6. If the question is unrelated to the guide, politely say that you can only help with this topic.

    Return only the explanation. Do not repeat the entire guide.
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        return response.text

    except Exception:
        return "Sorry, I couldn't explain this right now. Please try again."
