function randomId(len = 16) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[arr[i] % alphabet.length];
  return out;
}

const STORAGE_KEY = "pp_guest_id";

export function getOrCreateGuestId(): string {
  if (typeof window === "undefined") return "server";
  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing && existing.length >= 8) return existing;
  const id = `g_${randomId(18)}`;
  window.localStorage.setItem(STORAGE_KEY, id);
  return id;
}

