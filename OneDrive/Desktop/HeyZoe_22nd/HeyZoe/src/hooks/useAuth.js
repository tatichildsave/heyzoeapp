import { useEffect, useState } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth, isFirebaseConfigured } from "../services/firebase";

/**
 * Every user gets signed in anonymously in the background, with zero UI
 * and zero extra onboarding steps. This gives every request a Firebase
 * UID, which askZoe (the AI proxy function) requires before it will run —
 * otherwise anyone with the function URL could rack up API usage on our key.
 *
 * Anonymous accounts can later be upgraded to email/password via
 * linkWithCredential (see AUTH_FEATURES.md) without losing any data or UID,
 * so "guest mode" and "signed-in mode" stay the same account under the hood.
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
        return;
      }
      if (!isFirebaseConfigured) {
        // No Firebase project wired up — nothing to sign into yet.
        setUser(null);
        setLoading(false);
        return;
      }
      signInAnonymously(auth).catch((err) => {
        console.error("Anonymous sign-in failed", err);
        setLoading(false);
      });
      // onAuthStateChanged will fire again once the anonymous sign-in resolves.
    });
    return () => unsubscribe();
  }, []);

  return { user, loading };
}
