import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../services/firebase";
import { enableGoalReminders, disableGoalReminders, markAppOpened } from "../services/push";

export function usePushReminders(uid) {
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | requesting | granted | denied | unsupported

  useEffect(() => {
    if (!isFirebaseConfigured || !uid) return;
    return onSnapshot(doc(db, "users", uid), (snap) => setEnabled(!!snap.data()?.remindersEnabled), () => {});
  }, [uid]);

  // "Has the app been opened recently" is the other half of the reminder
  // logic (see services/push) — ping on load and whenever the tab is
  // brought back into focus, not just once.
  useEffect(() => {
    if (!isFirebaseConfigured || !uid) return;
    markAppOpened(uid);
    const onVisible = () => { if (document.visibilityState === "visible") markAppOpened(uid); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [uid]);

  const enable = async () => {
    setStatus("requesting");
    const result = await enableGoalReminders(uid);
    setStatus(result);
    return result;
  };

  const disable = async () => {
    await disableGoalReminders(uid);
    setStatus("idle");
  };

  return { enabled, status, enable, disable };
}
