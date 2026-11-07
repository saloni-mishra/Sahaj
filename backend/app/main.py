from fastapi import FastAPI, HTTPException
from app.content import get_brands, get_all_guides,  get_guide_step, find_guides_for_question, get_guide_context, get_scam_quiz, get_tips, get_words, get_emoji_quiz, get_missions, get_genz_words
from pydantic import BaseModel
from app.safety import check_message
from app.llm import explain_guide, ask_question
from fastapi.middleware.cors import CORSMiddleware
from app.paypal import (
    get_access_token,
    create_order,
    capture_order,
    PayPalError,
    UnknownItemError,
    DEFAULT_ITEM,
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


class ExplainRequest(BaseModel):
    guide_id: str
    brand: str
    step: int = 1
    question: str = "Please explain this step in very simple words."
    mode: str = "normal"


class AskRequest(BaseModel):
    question: str
    mode: str = "normal"


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/brands")
def brands():
    return get_brands()


@app.get("/api/guides")
def guides():
    return get_all_guides()


@app.get("/api/scam-quiz")
def scam_quiz():
    return get_scam_quiz()


@app.get("/api/tips")
def tips():
    return get_tips()


@app.get("/api/words")
def words():
    return get_words()


@app.get("/api/emoji-quiz")
def emoji_quiz():
    return get_emoji_quiz()


@app.get("/api/missions")
def missions():
    return get_missions()


@app.get("/api/genz")
def genz():
    return get_genz_words()


@app.get("/api/guide/{guide_id}")
def guide(guide_id: str, brand: str, step: int = 1):
    result = get_guide_step(guide_id, brand, step)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Guide, brand, or step not found"
        )

    return result


@app.post("/api/safety/check")
def safety_check(request: MessageRequest):
    result = check_message(request.message)

    return result


@app.post("/api/guide/explain")
def guide_explain(request: ExplainRequest):
    step_data = get_guide_step(request.guide_id, request.brand, request.step)
    if step_data is None:
        raise HTTPException(
            status_code=404,
            detail="Guide, brand, or step not found"
        )
    try:
        # Use the official step text as context so Gemini stays accurate.
        context = f"Step {step_data['step_number']} of {step_data['total_steps']}: {step_data['text']}"
        mode = "genz" if request.mode == "genz" else "normal"
        explanation = explain_guide(
            request.question,
            step_data["title"],
            context,
            step_data["text"],
            mode,
        )
    except Exception:
        # Never crash: always return a friendly message instead.
        explanation = "Sorry, I couldn't explain this right now. Please follow the instructions shown on screen."
    return {
        "guide_id": request.guide_id,
        "step_number": step_data["step_number"],
        "explanation": explanation,
    }


@app.post("/api/ask")
def ask(request: AskRequest):
    question = (request.question or "").strip()
    if not question:
        raise HTTPException(status_code=400, detail="Please ask a question.")
    # Safety first: warn if the question smells like OTP/PIN/password sharing.
    safety = check_message(question)
    safety_warning = None
    if safety.get("risk") in ("MEDIUM", "HIGH"):
        safety_warning = (
            "Safety note: never share your OTP, PIN, password, or bank details "
            "with anyone. " + " ".join(safety.get("actions", []))
        )
    matches = find_guides_for_question(question)
    guide = matches[0] if matches else None
    context = get_guide_context(guide)
    mode = "genz" if request.mode == "genz" else "normal"
    try:
        answer = ask_question(
            question, context, guide["title"] if guide else None, mode
        )
    except Exception:
        answer = "Sorry, I couldn't answer just now. Please try again, or follow the Learn steps."
    return {
        "answer": answer,
        "guide_id": guide["id"] if guide else None,
        "guide_title": guide["title"] if guide else None,
        "safety_warning": safety_warning,
    }


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