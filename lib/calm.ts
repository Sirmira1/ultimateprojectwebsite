/**
 * Calm mode — the same site with the theatrics turned down.
 * True when the visitor's OS asks for reduced motion, or when they
 * flip the header/console toggle (persisted in localStorage).
 * Every animated system checks this one function.
 */

export function calmMode(): boolean {
  if (typeof window === "undefined") return false;
  let stored = false;
  try {
    stored = localStorage.getItem("calm") === "1";
  } catch {
    /* private browsing — media query still applies */
  }
  return (
    stored || window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** True only when the user chose calm mode themselves (not via OS). */
export function calmChosen(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("calm") === "1";
  } catch {
    return false;
  }
}

export function toggleCalm(): void {
  try {
    localStorage.setItem("calm", calmChosen() ? "0" : "1");
  } catch {
    return;
  }
  location.reload();
}
