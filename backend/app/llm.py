
import os
from dotenv import load_dotenv
from google import genai
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

def explain_guide(question, guide_title, guide_steps, current_step, mode="normal"):
    if client is None:
        return "AI assistance is currently unavailable. Please follow the instructions shown on screen."

    personality = (
        "You may add at most ONE short playful cheer at the very end "
        "(for example 'you ate that!'). Never use slang inside the steps."
        if mode == "genz" else
        "Use a warm tone, like a kind grandchild. Use plain words only."
    )

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
    7. {personality}

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


def ask_question(question, context_text, guide_title=None, mode="normal"):
    if client is None:
        return "AI help is off right now. Please try the Learn steps on this screen instead."
    guide_line = f"Best matching guide: {guide_title}." if guide_title else "No matching guide found."
    personality = (
        "You may add at most ONE short playful cheer at the very end "
        "(for example 'you ate that!'). Never use slang inside the steps."
        if mode == "genz" else
        "Use a warm tone, like a kind grandchild. Use plain words only."
    )
    prompt = f"""
    You are Sahaj, a friendly technology assistant for older adults.

    The user asked: {question}

    {guide_line}
    Helper notes from the official guides:
    {context_text}

    Rules:
    1. Answer in very simple English, like explaining to a grandparent.
    2. Use short numbered steps (at most 5). No jargon, no abbreviations.
    3. Only use steps supported by the helper notes. Never invent phone settings.
    4. Never ask for or repeat OTPs, PINs, passwords, or bank details.
    5. If the question is not about phones or the guides, politely say you can only help with phone and laptop topics.
    6. {personality}

    Return only the answer.
    """
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text
    except Exception:
        return "Sorry, I couldn't answer just now. Please try again, or follow the Learn steps."
