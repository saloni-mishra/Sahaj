from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from app.content import get_brands, get_all_guides,  get_guide_step, find_guides_for_question, get_guide_context, get_scam_quiz, get_tips, get_words, get_emoji_quiz, get_missions, get_genz_words, get_hindi_words
from pydantic import BaseModel
from app.safety import check_message
from app.llm import explain_guide, ask_question, explain_receipt, show_sahaj, decode_chat, ask_general, MAX_PHOTO_BYTES, ALLOWED_PHOTO_TYPES, sniff_image
from fastapi.middleware.cors import CORSMiddleware
from app.paypal import (
    get_access_token,
    create_order,
    capture_order,
    PayPalError,
    UnknownItemError,
    DEFAULT_ITEM,
    PRACTICE_ITEMS,
    FRONTEND_URL,
)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    # FRONTEND_URL comes from .env, so deploying only needs a new value there.
    allow_origins=list({"http://localhost:5173", FRONTEND_URL}),
    allow_methods=["*"],
    allow_headers=["*"],
)


class MessageRequest(BaseModel):
    message: str
    lang: str = "en"


class ExplainRequest(BaseModel):
    guide_id: str
    brand: str
    step: int = 1
    question: str = "Please explain this step in very simple words."
    mode: str = "normal"
    lang: str = "en"

class AskRequest(BaseModel):
    question: str
    mode: str = "normal"
    lang: str = "en"


class ExplainReceiptRequest(BaseModel):
    order_id: str = ""
    status: str = ""
    amount: str = ""
    item: str = ""
    mode: str = "normal"


class DecodeRequest(BaseModel):
    message: str = ""
    mode: str = "normal"


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/brands")
def brands():
    return get_brands()


@app.get("/api/guides")
def guides(lang: str = "en"):
    return get_all_guides(lang)


@app.get("/api/scam-quiz")
def scam_quiz(lang: str = "en"):
    return get_scam_quiz(lang)


@app.get("/api/tips")
def tips():
    return get_tips()


@app.get("/api/words")
def words():
    return get_words()


@app.get("/api/hindi-words")
def hindi_words():
    # Everyday phone words for the separate Hindi Fun experience.
    return get_hindi_words()


@app.get("/api/emoji-quiz")
def emoji_quiz(lang: str = "en"):
    return get_emoji_quiz(lang)


@app.get("/api/missions")
def missions(lang: str = "en"):
    return get_missions(lang)


@app.get("/api/genz")
def genz():
    return get_genz_words()


@app.get("/api/guide/{guide_id}")
def guide(guide_id: str, brand: str, step: int = 1, lang: str = "en"):
    result = get_guide_step(guide_id, brand, step, lang)

    if result is None:
        raise HTTPException(404, "Guide or step not found")

    return result


@app.post("/api/safety/check")
def safety_check(request: MessageRequest):
    result = check_message(request.message, request.lang)

    return result


@app.post("/api/guide/explain")
def guide_explain(request: ExplainRequest):
    step_data = get_guide_step(
        request.guide_id,
        request.brand,
        request.step,
        request.lang,
    )
    if step_data is None:
        raise HTTPException(
            status_code=404,
            detail="Guide, brand, or step not found"
        )
    try:
        # Use the official step text as context so Gemini stays accurate.
        context = f"Step {step_data['step_number']} of {step_data['total_steps']}: {step_data['text']}"
        if request.mode == "hindi":
            mode = "hindi"
        elif request.mode == "genz":
            mode = "genz"
        else:
            mode = "normal"
        question = request.question
        if mode == "hindi" and question.strip().lower() == "please explain this step in very simple words.":
            question = "कृपया इस स्टेप को बहुत आसान हिंदी में समझाइए।"
        explanation = explain_guide(
            question,
            step_data["title"],
            context,
            step_data["text"],
            mode,
        )
    except Exception:
        # Never crash: always return a friendly message instead.
        if request.mode == "hindi":
            explanation = "माफ़ कीजिए, अभी मैं इसे समझा नहीं पा रहा हूँ। कृपया स्क्रीन पर दिए गए निर्देशों का पालन करें।"
        else:
            explanation = "Sorry, I couldn't explain this right now. Please follow the instructions shown on screen."
    return {
        "guide_id": request.guide_id,
        "step_number": step_data["step_number"],
        "explanation": explanation,
    }


@app.post("/api/ask")
def ask(request: AskRequest):
    is_hindi = request.mode == "hindi" or request.lang == "hi"
    question = (request.question or "").strip()
    if not question:
        detail = "कृपया पहले एक सवाल लिखिए।" if is_hindi else "Please ask a question."
        raise HTTPException(status_code=400, detail=detail)

    # Safety first: warn if the question smells like OTP/PIN/password sharing.
    safety = check_message(question, "hi" if is_hindi else "en")
    safety_warning = None
    if safety.get("risk") in ("MEDIUM", "HIGH"):
        if is_hindi:
            safety_warning = (
                "सुरक्षा की बात: अपना OTP, PIN, पासवर्ड या बैंक की जानकारी "
                "किसी के साथ साझा न करें। " + " ".join(safety.get("actions", []))
            )
        else:
            safety_warning = (
                "Safety note: never share your OTP, PIN, password, or bank details "
                "with anyone. " + " ".join(safety.get("actions", []))
            )

    matches = find_guides_for_question(
        question, lang="hi" if is_hindi else "en"
    )
    guide = matches[0] if matches else None
    mode = "hindi" if is_hindi else ("genz" if request.mode == "genz" else "normal")
    fallback = (
        "माफ़ कीजिए, अभी जवाब नहीं मिल पाया। फिर से कोशिश कीजिए, या सीखने वाले पेज पर क़दम देखिए।"
        if is_hindi
        else "Sorry, I couldn't answer just now. Please try again, or follow the Learn steps."
    )

    if guide is None:
        # No guide passed the match threshold: general help, clearly labelled.
        try:
            answer = ask_general(question, mode)
        except Exception:
            answer = None
        if not answer:
            answer = fallback
        context = ""
    else:
        context = get_guide_context(guide)
        try:
            answer = ask_question(
                question, context, guide["title"] if guide else None, mode
            )
        except Exception:
            answer = fallback
    return {
        "answer": answer,
        "guide_id": guide["id"] if guide else None,
        "guide_title": guide["title"] if guide else None,
        "safety_warning": safety_warning,
    }


@app.get("/api/paypal/items")
def paypal_items():
    # Labels + display amounts come from the server. The browser only
    # sends back an item id; it can never set a price.
    return [
        {"id": item_id, "label": item["label"], "amount": item["amount"]}
        for item_id, item in PRACTICE_ITEMS.items()
    ]


@app.post("/api/explain-receipt")
def explain_receipt_route(request: ExplainReceiptRequest):
    # Only order facts arrive here — never secrets or credentials.
    mode = "genz" if request.mode == "genz" else "normal"
    order_id = (request.order_id or "")[:64]
    status = (request.status or "")[:32]
    amount = (request.amount or "")[:32]
    item = (request.item or "")[:120]
    try:
        explanation = explain_receipt(order_id, status, amount, item, mode)
    except Exception:
        explanation = None
    if not explanation:
        # Static fallback: Gemini off or failed. Always plain and true.
        amount_line = f"${amount}" if amount else "the test amount"
        if mode == "genz":
            explanation = (
                f"Your {amount_line} went from you, through PayPal, to the seller. "
                f"Payment is complete — you ate that! "
                "This was test money. No real money moved."
            )
        else:
            explanation = (
                f"Your {amount_line} went from you, through PayPal, to the seller. "
                "The payment is complete. "
                "This was test money. No real money moved."
            )
    return {"explanation": explanation}


@app.post("/api/show-sahaj")
async def show_sahaj_route(image: UploadFile = File(...), mode: str = Form("normal")):
    # Photo help: the image is read, forwarded to Gemini, and forgotten.
    # Never stored, never logged.
    use_mode = "genz" if mode == "genz" else "normal"
    try:
        data = await image.read()
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read that photo.")
    if not data or len(data) > MAX_PHOTO_BYTES:
        raise HTTPException(status_code=413, detail="Photo is too big. Please send one under 2 MB.")
    content_type = (image.content_type or "").lower()
    if content_type not in ALLOWED_PHOTO_TYPES or not sniff_image(data):
        raise HTTPException(status_code=415, detail="Please send a JPEG, PNG, or WEBP photo.")
    try:
        answer = show_sahaj(data, content_type, use_mode)
    except Exception:
        answer = None
    if not answer:
        if use_mode == "genz":
            answer = "Hmm, let me cook — I could not read that photo. Try a clearer picture with the full screen in it."
        else:
            answer = "Sorry, I could not read that photo. Please try a clearer picture with the full screen in it."
    return {"answer": answer}


@app.post("/api/decode")
def decode_chat_route(request: DecodeRequest):
    text = (request.message or "").strip()[:500]
    if not text:
        raise HTTPException(status_code=400, detail="Please paste a message first.")
    mode = "genz" if request.mode == "genz" else "normal"
    try:
        answer = decode_chat(text, mode)
    except Exception:
        answer = None
    if not answer:
        if mode == "genz":
            answer = "Hmm, let me cook — I could not decode that. Try a shorter message."
        else:
            answer = "Sorry, I could not decode that right now. Please try a shorter message."
    explanation, reply = answer, ""
    for line in answer.splitlines():
        if line.strip().lower().startswith("reply:"):
            reply = line.split(":", 1)[1].strip()[:120]
            explanation = answer.replace(line, "").strip()
            break
    return {"explanation": explanation, "reply": reply}


@app.get("/api/paypal/check")
def check_paypal():
    try:
        get_access_token()
        return {
            "connected": True,
            "message": "PayPal Sandbox connection successful."
        }
    except Exception:
        return {
            "connected": False,
            "message": "Could not connect to PayPal Sandbox."
        }


# item_id is optional, so calling this with no body still works as before.
@app.post("/api/paypal/create-order")
def paypal_create_order(item_id: str = DEFAULT_ITEM):
    try:
        return create_order(item_id)
    except UnknownItemError:
        raise HTTPException(
            status_code=400,
            detail="Unknown practice item."
        )
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Could not create PayPal practice order."
        )


@app.post("/api/paypal/capture/{order_id}")
def paypal_capture_order(order_id: str):
    try:
        result = capture_order(order_id)
    except PayPalError as error:
        if error.issue == "ORDER_NOT_APPROVED":
            raise HTTPException(
                status_code=409,
                detail="The payment was not approved yet. No money was taken."
            )
        raise HTTPException(
            status_code=502,
            detail="Could not capture PayPal payment."
        )
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Could not capture PayPal payment."
        )

    # Only report success when PayPal says the payment is really complete.
    if result.get("status") != "COMPLETED":
        raise HTTPException(
            status_code=409,
            detail="The payment is not completed. No money was taken."
        )

    return result