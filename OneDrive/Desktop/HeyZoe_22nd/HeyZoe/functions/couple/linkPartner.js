const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { db } = require("../lib/admin");

/**
 * linkPartner — atomically links two accounts by share code.
 *
 * The client can't safely look a user up by an arbitrary field itself
 * (Firestore security rules can't cleanly restrict that kind of query —
 * see firestore.rules), so the lookup and both resulting writes happen
 * here with the Admin SDK, which bypasses client rules entirely.
 */
const linkPartner = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign-in is required to link a partner.");
  }
  const { code, myDisplayName } = request.data || {};
  if (typeof code !== "string" || !code.trim()) {
    throw new HttpsError("invalid-argument", "Enter your partner's code.");
  }

  const uid = request.auth.uid;
  const normalized = code.trim().toUpperCase();

  const snap = await db.collection("users").where("shareCode", "==", normalized).limit(1).get();
  if (snap.empty) {
    throw new HttpsError("not-found", "That code doesn't match anyone — ask your partner for a fresh one.");
  }
  const partnerDoc = snap.docs[0];
  if (partnerDoc.id === uid) {
    throw new HttpsError("invalid-argument", "That's your own code.");
  }

  const partnerData = partnerDoc.data();
  const myRef = db.collection("users").doc(uid);
  const mySnap = await myRef.get();
  const myName = (mySnap.exists && mySnap.data().displayName) || myDisplayName || "Partner";
  const partnerName = partnerData.displayName || "Partner";

  const batch = db.batch();
  batch.set(myRef, { partnerId: partnerDoc.id, mode: "couple", partnerName, displayName: myName }, { merge: true });
  batch.set(partnerDoc.ref, { partnerId: uid, mode: "couple", partnerName: myName }, { merge: true });
  await batch.commit();

  return { partnerName };
});

module.exports = { linkPartner };
