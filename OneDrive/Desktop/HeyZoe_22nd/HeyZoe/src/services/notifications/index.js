export function notify(message, type = "info") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("heyzoe:notify", { detail: { message, type } }));
}
