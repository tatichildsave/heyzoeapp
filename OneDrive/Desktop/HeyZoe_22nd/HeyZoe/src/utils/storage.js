export function ensureStorage() {
  if (typeof window === "undefined") return;
  if (window.storage) return;

  window.storage = {
    async get(key) {
      const value = localStorage.getItem(key);
      return { value: value || null };
    },
    async set(key, value) {
      localStorage.setItem(key, value);
      return true;
    },
    async delete(key) {
      localStorage.removeItem(key);
      return true;
    },
  };
}
