import os
import base64
import json
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, quote
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET")
BASE_URL = os.getenv(
    "PAYPAL_BASE_URL",
    "https://api-m.sandbox.paypal.com"
)

# Where PayPal sends the buyer back to. Set FRONTEND_URL in .env when you deploy.
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")

# Stop waiting if PayPal does not answer (seconds).
TIMEOUT = 15

# Prices live on the server. The browser only ever sends an item id, never an amount.
PRACTICE_ITEMS = {
    "practice-5": {
        "amount": "5.00",
        "label": "Practice payment",
        "description": "Sahaj Digital Payment Practice"
    },
    "chai-tip": {
        "amount": "1.00",
        "label": "Chai tip",
        "description": "Sahaj Practice: a small thank-you tip"
    },
    "samosa-2": {
        "amount": "2.00",
        "label": "Samosa money",
        "description": "Sahaj Practice: samosa money"
    },
}
DEFAULT_ITEM = "practice-5"


class PayPalError(Exception):
    """Something went wrong talking to PayPal.

    code  = HTTP status PayPal answered with (None if we never got an answer)
    issue = PayPal's reason, e.g. ORDER_NOT_APPROVED
    """

    def __init__(self, message, code=None, issue=None):
        super().__init__(message)
        self.code = code
        self.issue = issue


class UnknownItemError(Exception):
    """The item id is not in PRACTICE_ITEMS."""


def _error_details(error):
    """Read PayPal's error body. Returns (issue, raw_text)."""
    try:
        raw = error.read().decode()
    except Exception:
        return None, ""

    issue = None
    try:
        body = json.loads(raw)
        details = body.get("details") or []
        if details and isinstance(details[0], dict):
            issue = details[0].get("issue")
        issue = issue or body.get("name") or body.get("error")
    except (ValueError, AttributeError):
        pass

    return issue, raw


def _send(request, what):
    """Send a request to PayPal and return the JSON answer.

    Every failure becomes a PayPalError, and the real reason is printed
    in the terminal so you can see it while developing.
    """
    try:
        with urlopen(request, timeout=TIMEOUT) as response:
            return json.loads(response.read().decode())

    except HTTPError as error:
        issue, raw = _error_details(error)
        print(f"PayPal {what} failed: HTTP {error.code}, issue={issue}")
        print("PayPal error details:", raw)
        raise PayPalError(f"PayPal {what} failed.", code=error.code, issue=issue)

    except URLError as error:
        print(f"PayPal {what}: connection error:", error.reason)
        raise PayPalError("Could not connect to PayPal.")

    except (TimeoutError, ValueError) as error:
        print(f"PayPal {what}: timed out or sent an unreadable answer:", error)
        raise PayPalError("PayPal did not answer properly.")


def _summarise(result):
    """Turn PayPal's order JSON into the small dictionary the frontend needs."""
    unit = result.get("purchase_units", [{}])[0]
    captures = unit.get("payments", {}).get("captures", [])
    capture = captures[0] if captures else {}
    amount = capture.get("amount") or {}

    return {
        "order_id": result["id"],
        "status": result["status"],
        "capture_id": capture.get("id"),
        "capture_status": capture.get("status"),
        "amount": amount.get("value"),
        "currency": amount.get("currency_code", "USD"),
        "description": unit.get("description"),
    }


def get_access_token():
    if not CLIENT_ID or not CLIENT_SECRET:
        raise PayPalError("PayPal credentials are missing.")

    credentials = f"{CLIENT_ID}:{CLIENT_SECRET}"
    encoded_credentials = base64.b64encode(
        credentials.encode()
    ).decode()

    request = Request(
        f"{BASE_URL}/v1/oauth2/token",
        data=urlencode({"grant_type": "client_credentials"}).encode(),
        headers={
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        method="POST"
    )

    result = _send(request, "login")

    try:
        return result["access_token"]
    except KeyError:
        raise PayPalError("Could not connect to PayPal Sandbox.")


def create_order(item_id=DEFAULT_ITEM):
    item = PRACTICE_ITEMS.get(item_id)
    if item is None:
        raise UnknownItemError(item_id)

    access_token = get_access_token()

    order_data = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "description": item["description"],
                "amount": {
                    "currency_code": "USD",
                    "value": item["amount"]
                }
            }
        ],
        "payment_source": {
            "paypal": {
                "experience_context": {
                    "brand_name": "Sahaj",
                    "user_action": "PAY_NOW",
                    "shipping_preference": "NO_SHIPPING",
                    "return_url": f"{FRONTEND_URL}/practice/payment/success",
                    "cancel_url": f"{FRONTEND_URL}/practice/payment/cancel"
                }
            }
        }
    }

    request = Request(
        f"{BASE_URL}/v2/checkout/orders",
        data=json.dumps(order_data).encode(),
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        },
        method="POST"
    )

    result = _send(request, "order creation")

    # With payment_source.paypal, PayPal names the buyer link "payer-action".
    # Older style orders call it "approve". Accept both.
    approval_url = None
    for link in result.get("links", []):
        if link.get("rel") in ("payer-action", "approve"):
            approval_url = link.get("href")
            break

    if not approval_url:
        print("PayPal approval link was not returned. Order response:", result)
        raise PayPalError("PayPal approval link was not returned.")

    return {
        "order_id": result["id"],
        "approval_url": approval_url
    }


def get_order(order_id):
    """Ask PayPal how an order stands (used when a capture was already done)."""
    access_token = get_access_token()

    request = Request(
        f"{BASE_URL}/v2/checkout/orders/{quote(order_id, safe='')}",
        headers={"Authorization": f"Bearer {access_token}"},
        method="GET"
    )

    return _summarise(_send(request, "order lookup"))


def capture_order(order_id):
    access_token = get_access_token()

    request = Request(
        f"{BASE_URL}/v2/checkout/orders/{quote(order_id, safe='')}/capture",
        data=b"{}",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        },
        method="POST"
    )

    try:
        return _summarise(_send(request, "capture"))

    except PayPalError as error:
        # The buyer may have refreshed the success page, so this order could
        # already be captured. PayPal answers 422 in that case. Look the order
        # up: if it is COMPLETED, report that instead of an error.
        if error.code == 422 and error.issue != "ORDER_NOT_APPROVED":
            order = get_order(order_id)
            if order["status"] == "COMPLETED":
                order["already_captured"] = True
                return order
        raise