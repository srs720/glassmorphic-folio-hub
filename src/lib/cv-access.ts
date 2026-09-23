// Browser-side helpers for remembering which approved email opened the CV.
const KEY = "cv_access_email";

export function saveCvAccessEmail(email: string) {
  try {
    const value = email.trim().toLowerCase();
    sessionStorage.setItem(KEY, value);
    document.cookie = `cv_access_email=${encodeURIComponent(value)}; Path=/cv; SameSite=Strict; Max-Age=28800`;
  } catch {
    /* storage unavailable */
  }
}

export function readCvAccessEmail(): string | null {
  try {
    const stored = sessionStorage.getItem(KEY);
    if (stored) return stored;
    const match = document.cookie
      .split(";")
      .map((p) => p.trim())
      .find((p) => p.startsWith("cv_access_email="));
    return match ? decodeURIComponent(match.slice("cv_access_email=".length)) : null;
  } catch {
    return null;
  }
}

export function clearCvAccessEmail() {
  try {
    sessionStorage.removeItem(KEY);
    document.cookie = "cv_access_email=; Path=/cv; Max-Age=0";
  } catch {
    /* ignore */
  }
}
