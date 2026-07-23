import { useEffect, useState } from "react";

export function useNotifications() {
  const [lastNotification, setLastNotification] = useState(null);

  useEffect(() => {
    const handler = (event) => setLastNotification(event.detail);
    window.addEventListener("heyzoe:notify", handler);
    return () => window.removeEventListener("heyzoe:notify", handler);
  }, []);

  return { lastNotification };
}
