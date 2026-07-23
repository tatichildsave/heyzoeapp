const { initializeApp, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// Guard against re-initialization if this module is ever required more
// than once in the same process (e.g. by tests, or multiple functions
// importing it independently).
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

module.exports = { db };
