import { addDoc, collection, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { SEED_EXPERTS } from "../../constants/experts";

/**
 * Live subscription to the public expert directory. Real (Firestore-listed)
 * experts are merged with the seed set so the marketplace never looks empty
 * on a fresh install — seed ids ("exp-1"...) never collide with real
 * listings, which are keyed by the owner's uid.
 */
export function subscribeToExperts(cb) {
  return onSnapshot(
    collection(db, "experts"),
    (snap) => cb([...snap.docs.map((d) => ({ id: d.id, ...d.data() })), ...SEED_EXPERTS]),
    () => cb(SEED_EXPERTS)
  );
}

/** Live subscription to the current user's own expert listing, if they have one. */
export function subscribeToMyExpertProfile(uid, cb) {
  return onSnapshot(doc(db, "experts", uid), (snap) => cb(snap.exists() ? { id: snap.id, ...snap.data() } : null), () => cb(null));
}

/** Publishes or updates the current user's expert listing (doc id == their uid). */
export async function saveExpertProfile(uid, profile) {
  await setDoc(doc(db, "experts", uid), profile, { merge: true });
}

/** Records a lightweight booking receipt so the expert's session count is real, not mocked. */
export async function recordBooking(expertId, myUid) {
  await addDoc(collection(db, "experts", expertId, "bookings"), { bookedByUid: myUid, at: serverTimestamp() });
}

/** Live count of an expert's own bookings — only they can read this (see firestore.rules). */
export function subscribeToBookingCount(expertId, cb) {
  return onSnapshot(collection(db, "experts", expertId, "bookings"), (snap) => cb(snap.size), () => cb(0));
}
