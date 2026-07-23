import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, isFirebaseConfigured } from "../services/firebase";
import { recordBooking, saveExpertProfile, subscribeToBookingCount, subscribeToExperts, subscribeToMyExpertProfile } from "../services/experts";
import { SEED_EXPERTS } from "../constants/experts";

export function useExperts() {
  const [uid, setUid] = useState(auth.currentUser?.uid || null);
  const [experts, setExperts] = useState(SEED_EXPERTS);
  const [myProfile, setMyProfile] = useState(null);
  const [myBookingCount, setMyBookingCount] = useState(0);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid || null));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToExperts(setExperts);
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !uid) {
      setMyProfile(null);
      return;
    }
    return subscribeToMyExpertProfile(uid, setMyProfile);
  }, [uid]);

  useEffect(() => {
    if (!isFirebaseConfigured || !uid) {
      setMyBookingCount(0);
      return;
    }
    return subscribeToBookingCount(uid, setMyBookingCount);
  }, [uid]);

  const publishProfile = async (profile) => {
    if (!uid) throw new Error("Not signed in");
    await saveExpertProfile(uid, profile);
  };

  const bookExpert = async (expertId) => {
    if (!uid || expertId.startsWith("exp-")) return; // seed experts aren't real bookable accounts
    await recordBooking(expertId, uid);
  };

  return { uid, experts, myProfile, myBookingCount, publishProfile, bookExpert };
}
