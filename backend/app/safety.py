
import re
import math


def check_message(message):
    text = message.lower()

    reasons = []
    actions = []
    score = 0

    # Rule 1: OTP requests
    otp_words = [
        "share your otp",
        "send otp",
        "tell me your otp",
        "provide otp",
        "otp immediately",
        "share the otp",
        "send me the code",
        "share the verification code",
        "tell me the verification code"
    ]

    for word in otp_words:
        if word in text:
            reasons.append("The message asks you to share an OTP.")
            actions.append("Never share your OTP with anyone.")
            score += 40
            break

    # Rule 2: Urgent threats
    urgent_words = [
        "account will be blocked",
        "account suspended",
        "account access will be terminated",
        "immediately",
        "within 24 hours",
        "act now",
        "urgent action required",
        "verify immediately"
    ]

    for word in urgent_words:
        if word in text:
            reasons.append("The message uses urgency or threatens you.")
            actions.append("Do not panic or act in a hurry.")
            score += 20
            break

    # Rule 3: Upfront payment requests
    payment_words = [
        "pay registration fee",
        "pay processing fee",
        "send money to get a job",
        "pay to receive your prize",
        "pay to unlock your job offer",
        "pay to confirm your job",
        "send money to receive",
        "pay an advance fee"
    ]

    for word in payment_words:
        if word in text:
            reasons.append("The message asks for an upfront payment.")
            actions.append("Verify the organisation before sending money.")
            score += 30
            break

    # Rule 4: Shortened links
    short_link_pattern = r"https?://(?:www\.)?(?:bit\.ly|tinyurl\.com|t\.co|goo\.gl|is\.gd)(?:/|$)"

    if re.search(short_link_pattern, text):
        reasons.append("The message contains a shortened link.")
        actions.append("Avoid opening shortened links from unknown senders.")
        score += 15

    # Rule 5: Remote access requests
    remote_access_words = [
        "install anydesk",
        "install teamviewer",
        "download anydesk",
        "download teamviewer",
        "give remote access",
        "allow remote access",
        "share your screen"
    ]

    for word in remote_access_words:
        if word in text:
            reasons.append("The message asks for remote access to your device.")
            actions.append("Do not give remote access to unknown people.")
            score += 35
            break

    # Rule 6: Password and PIN requests
    sensitive_words = [
        "share your password",
        "send your password",
        "tell me your password",
        "share your pin",
        "share your atm pin",
        "send your pin",
        "tell me your pin",
        "share your banking details",
        "send your bank details",
        "enter your atm pin",
        "share your debit card details",
        "share your credit card details"
    ]

    for word in sensitive_words:
        if word in text:
            reasons.append("The message asks for sensitive banking or login information.")
            actions.append("Never share your password, PIN, or banking details with anyone.")
            score += 40
            break

    # Rule 7: UPI and direct payment requests
    upi_words = [
        "send money through upi",
        "pay through upi",
        "transfer money to this upi id",
        "scan this qr code to pay",
        "make a payment to this upi id",
        "send payment immediately",
        "transfer the amount immediately",
        "pay using google pay",
        "pay using phonepe",
        "pay using paytm"
    ]

    for word in upi_words:
        if word in text:
            reasons.append("The message asks for a direct digital payment.")
            actions.append("Verify the recipient before making any digital payment.")
            score += 30
            break

    # Calculate risk score
    risk_score = 100 * (1 - math.exp(-score / 38))

    if risk_score < 25:
        risk = "LOW"
    elif risk_score < 65:
        risk = "MEDIUM"
    else:
        risk = "HIGH"

    if not reasons:
        reasons.append("No known suspicious patterns were detected.")
        actions.append("Still verify the sender before sharing personal information.")

    return {
        "risk": risk,
        "score": round(risk_score),
        "reasons": reasons,
        "actions": actions
    }


if __name__ == "__main__":
    message = "Your bank account will be blocked today. Share your OTP immediately."

    result = check_message(message)

    print(result)
