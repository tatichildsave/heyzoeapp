import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase";
import { trackEvent } from "../analytics";

/**
 * Beta feedback: write-only from the client's perspective (see
 * firestore.rules — nobody can read this back through the app, only via
 * Firebase Console or the Admin SDK). Tagged with the submitter's uid so
 * a specific report can be cross-referenced against their other data if
 * they mention it, but there's no UI anywhere that lets them (or anyone
 * else) see past submissions.
 */
export async function submitFeedback(uid, { type, text }) {
  if (!isFirebaseConfigured) throw new Error("Feedback needs a connected Firebase project.");
  if (!text?.trim()) throw new Error("Feedback can't be empty.");

  await addDoc(collection(db, "feedback"), {
    submittedBy: uid || null,
    type,
    text: text.trim().slice(0, 2000),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : null,
    createdAt: serverTimestamp(),
  });

  trackEvent("feedback_submitted", { type });
}
