import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, isFirebaseConfigured } from "../services/firebase";
import { pushSharedGoal, removeSharedGoal, subscribeToPartnerGoals, subscribeToProfile } from "../services/couple";

const DEFAULT_PROFILE = { mode: "individual", partnerId: null, partnerName: "", shareCode: null };

/**
 * Bridges the local-first app state (goals live in localStorage, see
 * useAppState) with the couple-mode data that has to live in Firestore so
 * a partner's device can see it. Two responsibilities:
 *
 * 1. Subscribes to our own `users/{uid}` doc, which is the source of truth
 *    for whether we're in couple mode and who we're linked to.
 * 2. Mirrors any goal marked `shared: true` into our `sharedGoals`
 *    subcollection (and removes it if un-shared), and subscribes to our
 *    partner's `sharedGoals` so we can show their side of things.
 *
 * Goals that are never marked shared never touch Firestore at all — this
 * hook only sees what the user explicitly opted to share.
 */
export function useCouple(goals) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [partnerGoals, setPartnerGoals] = useState([]);
  const [uid, setUid] = useState(auth.currentUser?.uid || null);
  const prevSharedIdsRef = useRef(new Set());

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid || null));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !uid) {
      setProfile(DEFAULT_PROFILE);
      return;
    }
    return subscribeToProfile(uid, (data) => setProfile({ ...DEFAULT_PROFILE, ...data }));
  }, [uid]);

  useEffect(() => {
    if (!isFirebaseConfigured || !profile.partnerId) {
      setPartnerGoals([]);
      return;
    }
    return subscribeToPartnerGoals(profile.partnerId, setPartnerGoals);
  }, [profile.partnerId]);

  // Keep sharedGoals mirrored whenever the local goal list changes.
  useEffect(() => {
    if (!isFirebaseConfigured || !uid || profile.mode !== "couple") return;
    const shared = goals.filter((g) => g.shared);
    const sharedIds = new Set(shared.map((g) => g.id));
    shared.forEach((g) => pushSharedGoal(uid, g).catch(() => {}));
    prevSharedIdsRef.current.forEach((id) => {
      if (!sharedIds.has(id)) removeSharedGoal(uid, id);
    });
    prevSharedIdsRef.current = sharedIds;
  }, [goals, uid, profile.mode]);

  return { profile, partnerGoals, uid };
}
