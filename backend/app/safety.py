
import re
import math


# Hindi versions of the fixed safety messages. The detection rules and
# scores stay exactly the same; only the wording shown to the user changes.
HINDI_REASONS = {
    "The message asks you to share an OTP.": "यह मैसेज आपसे OTP साझा करने को कह रहा है।",
    "The message uses urgency or threatens you.": "यह मैसेज जल्दबाज़ी करा रहा है या डरा रहा है।",
    "The message asks for an upfront payment.": "यह मैसेज पहले पैसे देने को कह रहा है।",
    "The message uses a refund bait.": "यह मैसेज रिफ़ंड का लालच दे रहा है।",
    "The message contains a shortened link.": "इस मैसेज में छोटा किया हुआ लिंक है।",
    "The message asks for remote access to your device.": "यह मैसेज आपके फ़ोन या कंप्यूटर का रिमोट एक्सेस माँग रहा है।",
    "The message asks for sensitive banking or login information.": "यह मैसेज बैंक या लॉगिन की गोपनीय जानकारी माँग रहा है।",
    "The message asks for a direct digital payment.": "यह मैसेज सीधे ऑनलाइन भुगतान करने को कह रहा है।",
    "No known suspicious patterns were detected.": "इस मैसेज में कोई जाना-पहचाना शक वाला पैटर्न नहीं मिला।",
}

HINDI_ACTIONS = {
    "Never share your OTP with anyone.": "अपना OTP कभी किसी के साथ साझा न करें।",
    "Do not panic or act in a hurry.": "घबराइए नहीं और जल्दबाज़ी में कुछ न कीजिए।",
    "Verify the organisation before sending money.": "पैसे भेजने से पहले संस्था की पुष्टि कीजिए।",
    "Do not pay any fee to receive a refund.": "रिफ़ंड पाने के लिए कोई फ़ीस न भरें।",
    "Avoid opening shortened links from unknown senders.": "अनजान लोगों के छोटे लिंक न खोलिए।",
    "Do not give remote access to unknown people.": "अनजान लोगों को अपने फ़ोन या कंप्यूटर का रिमोट एक्सेस न दीजिए।",
    "Never share your password, PIN, or banking details with anyone.": "अपना पासवर्ड, PIN या बैंक की जानकारी कभी किसी को न बताइए।",
    "Verify the recipient before making any digital payment.": "ऑनलाइन भुगतान से पहले पैसे पाने वाले की पुष्टि कीजिए।",
    "Still verify the sender before sharing personal information.": "निजी जानकारी साझा करने से पहले भेजने वाले की पुष्टि कीजिए।",
}


def check_message(message, lang="en"):
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
        "tell me the verification code",
        "ओटीपी बताइए",
        "ओटीपी भेजिए",
        "ओटीपी दीजिए",
        "ओटीपी साझा",
        "otp बताइए",
        "otp भेजिए",
        "otp साझा",
        "कोड भेजिए",
        "वेरिफिकेशन कोड"
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
        "verify immediately",
        "खाता बंद हो जाएगा",
        "खाता बंद",
        "तुरंत करें",
        "24 घंटे में",
        "आज रात",
        "जल्दी कीजिए",
        "आज पाने के लिए",
        "आज ही पाने",
        "आज ही भरें",
        "आज भरें",
        "आज ही भुगतान"
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
        "pay an advance fee",
        "रजिस्ट्रेशन फीस",
        "रजिस्ट्रेशन फ़ीस",
        "प्रोसेसिंग फीस",
        "प्रोसेसिंग फ़ीस",
        "पहले पैसे भेजिए",
        "फीस भरिए",
        "फ़ीस भरिए",
        "फीस भरने",
        "फ़ीस भरने",
        "इनाम पाने के लिए पैसे"
    ]

    for word in payment_words:
        if word in text:
            reasons.append("The message asks for an upfront payment.")
            actions.append("Verify the organisation before sending money.")
            score += 30
            break

    # Rule 4: Refund bait
    refund_words = [
        "रिफंड तैयार",
        "रिफ़ंड तैयार",
        "रिफंड पाने",
        "रिफ़ंड पाने",
        "रिफंड प्रोसेस",
        "रिफ़ंड प्रोसेस",
        "पैसे वापस पाने"
    ]

    for word in refund_words:
        if word in text:
            reasons.append("The message uses a refund bait.")
            actions.append("Do not pay any fee to receive a refund.")
            score += 30
            break

    # Rule 5: Shortened links
    short_link_pattern = r"https?://(?:www\.)?(?:bit\.ly|tinyurl\.com|t\.co|goo\.gl|is\.gd)(?:/|$)"

    if re.search(short_link_pattern, text):
        reasons.append("The message contains a shortened link.")
        actions.append("Avoid opening shortened links from unknown senders.")
        score += 15

    # Rule 6: Remote access requests
    remote_access_words = [
        "install anydesk",
        "install teamviewer",
        "download anydesk",
        "download teamviewer",
        "give remote access",
        "allow remote access",
        "share your screen",
        "स्क्रीन साझा",
        "रिमोट एक्सेस"
    ]

    for word in remote_access_words:
        if word in text:
            reasons.append("The message asks for remote access to your device.")
            actions.append("Do not give remote access to unknown people.")
            score += 35
            break

    # Rule 7: Password and PIN requests
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
        "share your credit card details",
        "पिन बताइए",
        "पासवर्ड बताइए",
        "बैंक की जानकारी",
        "एटीएम पिन",
        "कार्ड की जानकारी"
    ]

    for word in sensitive_words:
        if word in text:
            reasons.append("The message asks for sensitive banking or login information.")
            actions.append("Never share your password, PIN, or banking details with anyone.")
            score += 40
            break

    # Rule 8: UPI and direct payment requests
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
        "pay using paytm",
        "upi पर भेजिए",
        "यूपीआई पर भेजिए",
        "qr स्कैन",
        "स्कैन करके भुगतान",
        "गूगल पे से",
        "फोनपे से",
        "पेटीएम से"
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

    result = {
        "risk": risk,
        "score": round(risk_score),
        "reasons": reasons,
        "actions": actions
    }

    if lang == "hi":
        result["reasons"] = [HINDI_REASONS.get(item, item) for item in reasons]
        result["actions"] = [HINDI_ACTIONS.get(item, item) for item in actions]

    return result


if __name__ == "__main__":
    message = "Your bank account will be blocked today. Share your OTP immediately."

    result = check_message(message)

    print(result)
