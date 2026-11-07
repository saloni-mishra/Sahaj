# Sahaj — AI tech-buddy for older adults ("the grandkid you can always ask")

Learn (step-by-step phone/laptop guides with pictures) + Practice (PayPal Sandbox practice payment) + Safe or Scam? (detective game + checker) + Missions (sticker collection + streak) + Ask Sahaj (chat, floating button everywhere) + Fun (words + emoji + WhatsApp share). Warm notebook design, big text, big tactile buttons, Normal/Gen-Z style toggle.

## Practice Mode uses Sandbox test money

The "Try a practice payment" button uses **PayPal Sandbox**. No real money is charged or moved. You log in with a PayPal Sandbox buyer account, not a real account.

## Setup

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env` (never commit this file — it is in `.gitignore`):

```
PAYPAL_CLIENT_ID=your-sandbox-client-id
PAYPAL_CLIENT_SECRET=your-sandbox-client-secret
PAYPAL_API=https://api-m.sandbox.paypal.com
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your-key-optional
```

Run it:

```bash
.\venv\Scripts\python -m uvicorn app.main:app --reload
```

Swagger docs: http://127.0.0.1:8000/docs

Routes: `GET /api/health`, `GET /api/brands`, `GET /api/guides`, `GET /api/guide/{id}?brand=&step=`, `POST /api/guide/explain`, `POST /api/ask`, `POST /api/safety/check`, `GET /api/missions`, `GET /api/scam-quiz`, `GET /api/tips`, `GET /api/words`, `GET /api/genz`, `GET /api/emoji-quiz`, `GET /api/paypal/check`, `POST /api/paypal/create-order`, `POST /api/paypal/capture/{order_id}`.

Features: Learn step-through with pictures, read-aloud, "Explain this step simply" (Gemini), "Ask family on WhatsApp" on every step, floating Ask Sahaj chat (voice in + read-aloud, safety warnings), Normal/Gen-Z style toggle with tap-to-understand slang, Safe or Scam? detective game in a phone mockup + paste-a-message checker, Missions page (7 stickers, streak, Today's Mission, auto-complete from guides/games), My-progress stars (browser-saved), Tip of the day, Fun page (tech word, Gen-Z word with desi analogies, emoji quiz, share stars on WhatsApp), mascot + celebration screens + mobile bottom nav.

### 2. Frontend (React + Vite)

```bash
cd frontend/frontend
npm install
npm run dev
```

Point it at the backend with `frontend/frontend/.env` (also git-ignored):

```
VITE_API_URL=http://127.0.0.1:8000
```

If `VITE_API_URL` is missing, the app falls back to `http://127.0.0.1:8000`.

### 3. Guide images (optional)

Pictures live in `frontend/frontend/public/guides/<brand>/<guide_id>/stepN.png` and are linked into `backend/content/guides.json` with:

```bash
cd backend
.\venv\Scripts\python link_guide_images.py --dry-run
.\venv\Scripts\python link_guide_images.py
```

### 4. Deploy notes

- Frontend on Vercel: `frontend/frontend/vercel.json` rewrites all routes to `/index.html` so `/learn`, `/missions`, `/safe-or-scam`, `/fun` and `/practice/payment/success` work on refresh.
- Backend: set the same `backend/.env` values as environment variables on your host, and set `FRONTEND_URL` to your Vercel URL.
- Fonts work offline: headings (Fraunces) + body (Atkinson Hyperlegible) are bundled via `@fontsource`.

## Secrets

Never print or commit `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, or `GEMINI_API_KEY`. Both `.env` files are git-ignored.
