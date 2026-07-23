import { collection, deleteDoc, doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../firebase";

function randomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/** Returns the current user's share code, generating and persisting one on first call. */
export async function ensureShareCode(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const existing = snap.exists() ? snap.data().shareCode : null;
  if (existing) return existing;
  const code = randomCode();
  await setDoc(ref, { shareCode: code }, { merge: true });
  return code;
}

/** Links to a partner by their share code. The lookup + both writes happen server-side (see functions/index.js). */
export async function linkPartnerByCode(code, myDisplayName) {
  const linkPartner = httpsCallable(functions, "linkPartner");
  const { data } = await linkPartner({ code, myDisplayName });
  return data; // { partnerName }
}

/** Live subscription to the current user's profile doc (mode, partnerId, partnerName, shareCode). */
export function subscribeToProfile(uid, cb) {
  return onSnapshot(doc(db, "users", uid), (snap) => cb(snap.exists() ? snap.data() : null), () => cb(null));
}

/** Live subscription to a linked partner's shared goals (read-only from our side). */
export function subscribeToPartnerGoals(partnerId, cb) {
  return onSnapshot(
    collection(db, "users", partnerId, "sharedGoals"),
    (snap) => cb(snap.docs.map((d) => d.data())),
    () => cb([])
  );
}

/** Upserts one of our own goals into our sharedGoals subcollection (visible to a linked partner only). */
export async function pushSharedGoal(uid, goal) {
  await setDoc(doc(db, "users", uid, "sharedGoals", goal.id), goal);
}

/** Removes a goal from our sharedGoals subcollection (e.g. it was un-shared or deleted). */
export async function removeSharedGoal(uid, goalId) {
  await deleteDoc(doc(db, "users", uid, "sharedGoals", goalId)).catch(() => {});
}
