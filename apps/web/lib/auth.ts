const GUEST_MODE_KEY = "bazar_guest_mode";

export function setGuestMode(enabled: boolean) {
  if (typeof window === "undefined") return;
  if (enabled) {
    localStorage.setItem(GUEST_MODE_KEY, "1");
    return;
  }
  localStorage.removeItem(GUEST_MODE_KEY);
}

export function isGuestMode() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(GUEST_MODE_KEY) === "1";
}

export function clearGuestMode() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_MODE_KEY);
}
