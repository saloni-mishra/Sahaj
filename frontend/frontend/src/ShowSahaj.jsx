const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Photos are never stored: read, forwarded to Gemini, forgotten.
export const MAX_PHOTO = 2 * 1024 * 1024;

// Upload a screen photo. Returns { ok, text } or { ok:false, key } where
// key is a copy.jsx string id (photoTooBig / photoError).
export async function sendPhoto(file, mode) {
  if (!file) return { ok: false, key: "photoError" };
  if (file.size > MAX_PHOTO) return { ok: false, key: "photoTooBig" };
  const form = new FormData();
  form.append("image", file);
  form.append("mode", mode === "genz" ? "genz" : "normal");
  try {
    const r = await fetch(`${API}/api/show-sahaj`, { method: "POST", body: form });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      if (r.status === 413) return { ok: false, key: "photoTooBig" };
      throw new Error(data.detail || "photo failed");
    }
    return { ok: true, text: data.answer || "" };
  } catch {
    return { ok: false, key: "photoError" };
  }
}
