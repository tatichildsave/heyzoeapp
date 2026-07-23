import { collection, doc, getDoc, getDocs, limit, query, setDoc, updateDoc, where } from "firebase/firestore";
import { auth } from "../firebase";
import { db } from "../firebase";

const requireAuth = () => {
  if (!auth.currentUser) {
    throw new Error("Authentication required for Firestore access.");
  }
};

export const getUserDoc = async (uid) => {
  requireAuth();
  try {
    return await getDoc(doc(db, "users", uid));
  } catch (error) {
    throw new Error(`Failed to read user document: ${error?.message || "unknown error"}`);
  }
};

export const setUserDoc = async (uid, data) => {
  requireAuth();
  try {
    return await setDoc(doc(db, "users", uid), data);
  } catch (error) {
    throw new Error(`Failed to write user document: ${error?.message || "unknown error"}`);
  }
};

export const updateUserDoc = async (uid, data) => {
  requireAuth();
  try {
    return await updateDoc(doc(db, "users", uid), data);
  } catch (error) {
    throw new Error(`Failed to update user document: ${error?.message || "unknown error"}`);
  }
};

export const findUserByShareCode = async (shareCode) => {
  requireAuth();
  const normalized = String(shareCode || "").trim().toUpperCase();
  if (!normalized) throw new Error("Share code is required.");
  try {
    const q = query(collection(db, "users"), where("shareCode", "==", normalized), limit(1));
    return await getDocs(q);
  } catch (error) {
    throw new Error(`Failed to find user by share code: ${error?.message || "unknown error"}`);
  }
};
