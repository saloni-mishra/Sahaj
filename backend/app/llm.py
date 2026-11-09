
import os
from dotenv import load_dotenv
from google import genai
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

# Plain mode: warm, simple, no slang at all. Instructions stay clear.
SYSTEM_NORMAL = """You are Sahaj, a friendly technology assistant for older adults.
Rules:
1. Use very simple English, like explaining to a grandparent.
2. Use short, clear sentences. No slang, no trendy words, no abbreviations.
3. Give only information supported by the official guide notes.
4. Never invent phone settings or steps.
5. Never ask for or repeat OTPs, PINs, passwords, or bank details.
6. If the question is unrelated to phones or laptops, politely say you can only help with phone and laptop topics."""

# Gen-Z mode: instructions stay just as clear and plain as Normal mode.
# Slang appears ONLY in short reactions/cheers, never inside steps or safety text.
SYSTEM_GENZ = """You are Sahaj, a friendly technology assistant for older adults, speaking in a playful Gen-Z style.
Rules:
1. Instructions and steps must stay very simple, clear, and plain — exactly like Normal mode.
2. Slang is allowed ONLY as a short reaction at the very start or end (at most ONE phrase, e.g. 'no cap', 'you ate that', 'let me cook', "let's gooo", 'lowkey').
3. NEVER put slang inside numbered steps, safety warnings, OTP/PIN advice, or payment instructions.
4. Give only information supported by the official guide notes. Never invent phone settings or steps.
5. Never ask for or repeat OTPs, PINs, passwords, or bank details.
6. If the question is unrelated to phones or laptops, politely say you can only help with phone and laptop topics."""

SYSTEM_HINDI = """आप 'सहज' हैं—एक विनम्र, धैर्यवान और मददगार साथी, जो बुज़ुर्गों को बिना किसी झिझक के फ़ोन और लैपटॉप चलाना सिखाते हैं।

बातचीत के नियम:
1. भाषा एकदम सहज, साफ़ और रोज़मर्रा की बोलचाल वाली हिंदी रखें। भारी-भरकम या किताबी शब्दों से बचें।
2. हमेशा देवनागरी लिपि का ही इस्तेमाल करें।
3. वाक्य छोटे, सीधे और समझने में आसान हों। एक बार में केवल एक ही बात कहें।
4. तकनीकी शब्दों को आसान उदाहरणों से समझाएँ। फ़ोन के बटनों, मेन्यू और सेटिंग्स के नाम ठीक वैसे ही अंग्रेज़ी या लिप्यंतरण में लिखें जैसे वे स्क्रीन पर दिखाई देते हैं (उदा. Settings, Display, Bluetooth)।
5. अपनी तरफ़ से कोई नया नियम, मेन्यू या मनगढ़ंत स्टेप न जोड़ें; केवल दी गई आधिकारिक गाइड की जानकारी पर ही टिके रहें।
6. बात करने का लहज़ा हमेशा आदरपूर्ण, धीमा और अपनत्व भरा होना चाहिए—जैसे कोई बच्चा अपने दादा-दादी या माता-पिता को प्यार से समझा रहा हो। बनावटी उत्साह, स्लैंग या ट्रेंडी शब्दों का प्रयोग बिल्कुल न करें।
7. सुरक्षा का कड़ा नियम: कभी भी OTP, ATM PIN, पासवर्ड, UPI पिन या बैंक से जुड़ी कोई भी निजी जानकारी न माँगें, न दर्ज करें और न ही दोहराएँ।
8. अगर सवाल फ़ोन या लैपटॉप से संबंधित नहीं है, तो विनम्रता से कहें कि आप केवल फ़ोन और लैपटॉप के विषय में ही मदद कर सकते हैं।
9. अगर गाइड में किसी चीज़ का रूप, रंग, निशान या जगह नहीं बताई गई है, तो उसके बारे में अपनी तरफ़ से जानकारी न जोड़ें।
"""

def explain_guide(question, guide_title, guide_steps, current_step, mode="normal"):
    if client is None:
        return "AI assistance is currently unavailable. Please follow the instructions shown on screen."

    if mode == "hindi":
     system = SYSTEM_HINDI
    elif mode == "genz":
     system = SYSTEM_GENZ
    else:
     system = SYSTEM_NORMAL
    reaction_rule = (
        "You may add at most ONE short playful cheer at the very end, never inside the steps."
        if mode == "genz" else
        "Use a warm tone, like a kind grandchild. Use plain words only."
    )

    prompt = f"""
    {system}

    The user asked: {question}

    Guide topic: {guide_title}

    Official guide instructions:
    {guide_steps}

    Current step: {current_step}

    Your task:
    1. Explain the current step in the same language as the system instructions.
    2. Use short, clear sentences.
    3. Avoid difficult technical words. Keep actual phone setting names in English when needed.
    4. Give only information supported by the official guide.
    5. Never invent phone settings or steps.
    6. If the question is unrelated to the guide, politely say that you can only help with this topic.
    7. {reaction_rule}

    Return only the explanation. Do not repeat the entire guide.
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        return response.text

    except Exception:
        if mode == "hindi":
            return "माफ़ कीजिए, अभी मैं इसे समझा नहीं पा रहा हूँ। कृपया स्क्रीन पर दिए गए निर्देशों का पालन करें।"
        if mode == "genz":
            return "Hmm, let me cook — that did not work. Please follow the steps on the screen."
        return "Sorry, I couldn't explain this right now. Please follow the instructions shown on screen."


def ask_question(question, context_text, guide_title=None, mode="normal"):
    if client is None:
        if mode == "hindi":
            return "माफ़ कीजिए, अभी एआई मदद उपलब्ध नहीं है। कृपया स्क्रीन पर दिए सीखने वाले क़दम देखिए।"
        return "AI help is off right now. Please try the Learn steps on this screen instead."

    if mode == "hindi":
        system = SYSTEM_HINDI
        guide_line = (
            f"सबसे मिलती-जुलती गाइड: {guide_title}।"
            if guide_title
            else "कोई मिलती-जुलती गाइड नहीं मिली।"
        )
        answer_rule = (
            "उत्तर आसान, रोज़मर्रा की हिंदी (देवनागरी) में दीजिए। "
            "फ़ोन के सेटिंग, बटन और मेन्यू के नाम अंग्रेज़ी में ही रखिए।"
        )
        reaction_rule = "लहज़ा अपनापन भरा और आदरपूर्ण रखिए। स्लैंग या मज़ाक़ न कीजिए।"
    else:
        system = SYSTEM_GENZ if mode == "genz" else SYSTEM_NORMAL
        guide_line = (
            f"Best matching guide: {guide_title}." if guide_title else "No matching guide found."
        )
        answer_rule = "Answer in very simple English, like explaining to a grandparent."
        reaction_rule = (
            "You may add at most ONE short playful cheer at the very end, never inside the steps."
            if mode == "genz" else
            "Use a warm tone, like a kind grandchild. Use plain words only."
        )

    prompt = f"""
    {system}

    The user asked: {question}

    {guide_line}
    Helper notes from the official guides:
    {context_text}

    Rules:
    1. {answer_rule}
    2. Use short numbered steps (at most 5). No jargon, no abbreviations.
    3. Only use steps supported by the helper notes. Never invent phone settings.
    4. Never ask for or repeat OTPs, PINs, passwords, or bank details.
    5. If the question is not about phones or the guides, politely say you can only help with phone and laptop topics.
    6. {reaction_rule}

    Return only the answer.
    """
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text
    except Exception:
        if mode == "hindi":
            return "माफ़ कीजिए, अभी जवाब नहीं मिल पाया। फिर से कोशिश कीजिए, या सीखने वाले पेज पर क़दम देखिए।"
        if mode == "genz":
            return "Hmm, let me cook — that did not work. Please try again, or follow the Learn steps."
        return "Sorry, I couldn't answer just now. Please try again, or follow the Learn steps."


def explain_receipt(order_id, status, amount, item, mode="normal"):
    """Plain-words receipt explainer. Only order facts in, never secrets."""
    if client is None:
        return None
    system = SYSTEM_GENZ if mode == "genz" else SYSTEM_NORMAL
    reaction_rule = (
        "You may add at most ONE short playful cheer at the very end."
        if mode == "genz" else
        "Use a warm tone, like a kind grandchild. Use plain words only."
    )
    prompt = f"""
    {system}

    A practice payment just finished in PayPal Sandbox (test money, not real money).
    Order id: {order_id}
    Status: {status}
    Amount: {amount}
    What it was: {item}

    Your task: explain in 3 or 4 very short sentences what just happened.
    1. Say the money moved from the buyer, through PayPal, to the seller.
    2. Say the amount and that the payment is complete.
    3. Remind them this was test money — no real money moved.
    4. {reaction_rule}

    Return only the explanation.
    """
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text
    except Exception:
        return None


MAX_PHOTO_BYTES = 2 * 1024 * 1024
ALLOWED_PHOTO_TYPES = {"image/jpeg", "image/png", "image/webp"}


def sniff_image(data):
    """Magic-byte check so we only forward real images to Gemini."""
    if not data:
        return False
    if data[:3] == b"\xff\xd8\xff":
        return True  # JPEG
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return True  # PNG
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return True  # WEBP
    if data[:4] in (b"GIF8",):
        return True  # GIF
    return False


def decode_chat(message, mode="normal"):
    """Decode group-chat slang simply and suggest one short, safe reply."""
    if client is None:
        return None
    system = SYSTEM_GENZ if mode == "genz" else SYSTEM_NORMAL
    reaction_rule = (
        "You may add at most ONE short playful cheer at the very end."
        if mode == "genz" else
        "Use a warm tone, like a kind grandchild. Use plain words only."
    )
    prompt = (
        system + "\n\nAn older adult pasted this family group-chat message:\n"
        + message + "\n\nYour task:\n"
        "1. Explain in very simple words what the tricky or slang words mean. One short line each.\n"
        "2. Then on its own line write exactly: Reply: followed by ONE short, polite reply "
        "(at most 15 words) the user can send. It must be safe and kind.\n"
        "3. Never invent meanings. If a word is unclear, say you are not sure.\n"
        "4. " + reaction_rule + "\n\nKeep the whole answer short."
    )
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text
    except Exception:
        return None


def ask_general(question, mode="normal"):
    """General phone help when no official guide matches. Short, safe, honest."""
    if client is None:
        return None

    if mode == "hindi":
        system = SYSTEM_HINDI
        answer_rule = (
            "उत्तर आसान, रोज़मर्रा की हिंदी (देवनागरी) में दीजिए। "
            "फ़ोन के सेटिंग, बटन और मेन्यू के नाम अंग्रेज़ी में ही रखिए।"
        )
        start_line = "सामान्य क़दम — आपका फ़ोन थोड़ा अलग दिख सकता है।"
        money_rule = (
            "अगर सवाल पैसे, भुगतान, OTP, PIN, पासवर्ड, बैंक या UPI ऐप, "
            "या खाता रिकवरी से जुड़ा हो, तो क़दम न दीजिए। कहिए कि भरोसेमंद "
            "परिवार वाले या बैंक की आधिकारिक सहायता से मदद लें।"
        )
        end_rule = "अंत में पूछिए कि उनके पास कौन-सा फ़ोन है, ताकि अगली बार और सटीक मदद मिल सके।"
        reaction_rule = "लहज़ा अपनापन भरा और आदरपूर्ण रखिए। स्लैंग या मज़ाक़ न कीजिए।"
    else:
        system = SYSTEM_GENZ if mode == "genz" else SYSTEM_NORMAL
        answer_rule = "Answer in very simple English, like explaining to a grandparent."
        start_line = "General steps - your phone may look a little different."
        money_rule = (
            "if the question involves money, payments, OTPs, PINs, passwords, "
            "bank or UPI apps, or account recovery, do NOT give steps. Instead say: "
            "please ask a trusted family member or the official support for help with this."
        )
        end_rule = "End by asking which phone brand and model they have, so you can be more specific next time."
        reaction_rule = (
            "You may add at most ONE short playful cheer at the very end."
            if mode == "genz" else
            "Use a warm tone, like a kind grandchild. Use plain words only."
        )

    prompt = (
        system + "\n\nThe user asked:\n" + question + "\n\nYour task:\n"
        "1. " + answer_rule + "\n"
        "2. Give short numbered steps (at most 5) that work on most phones.\n"
        "3. Start with the line: " + start_line + "\n"
        "4. HARD RULE: " + money_rule + "\n"
        "5. Never ask for or repeat OTPs, PINs, passwords, or bank details.\n"
        "6. " + end_rule + "\n"
        "7. " + reaction_rule + "\n\nReturn only the answer."
    )
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text
    except Exception:
        return None


def show_sahaj(image_bytes, mime_type, mode="normal"):
    """Look at a screen photo: what is it, anything risky, next safe taps."""
    if client is None:
        return None
    system = SYSTEM_GENZ if mode == "genz" else SYSTEM_NORMAL
    reaction_rule = (
        "You may add at most ONE short playful cheer at the very end."
        if mode == "genz" else
        "Use a warm tone, like a kind grandchild. Use plain words only."
    )
    prompt = f"""
    {system}

    The user sent a photo of their phone or computer screen.

    Your task:
    1. Say in one short sentence what screen this looks like.
    2. Say clearly whether anything looks risky: a payment request, an OTP or PIN ask, an unknown link, or pressure to act fast. If nothing looks risky, say so plainly.
    3. Give the next 1 to 3 safe taps, as short numbered steps.
    4. Never ask for OTPs, PINs, passwords, or bank details.
    5. {reaction_rule}

    Keep the whole answer short. Return only the answer.
    """
    try:
        from google.genai import types
        part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[part, prompt]
        )
        return response.text
    except Exception:
        return None
