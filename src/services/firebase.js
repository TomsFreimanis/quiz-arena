// src/services/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  arrayUnion,
} from "firebase/firestore";

// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

/* -------------------------------------------------------------------------- */
/*          🔵 Garantē ka Firestore dokumentam vienmēr ir visi lauki         */
/* -------------------------------------------------------------------------- */
export const ensureUserDocument = async (uid, email, name, photo) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // JAUNS LIETOTĀJS → izveido dokumentu
    await setDoc(ref, {
      email: email || "",
      name: name || "",
      photo: photo || "",
      points: 0,
      coins: 0,
      level: 1,
      xp: 0,
      gamesPlayed: 0,
      history: [],
      unlockedTopics: [],
      boosts: {
        doubleXP: 0,
        freezeTime: 0,
        fiftyFifty: 0,
        hint: 0,
        skip: 0,
        golden: 0,
        vip: false,
      },
      dailyReward: {
        lastClaim: null,
        streak: 0,
      },
      achievements: [], // 🏆 NEW
      joinedAt: new Date().toISOString(),
    });

    return; // DONE
  }

  // ESOŠAM lietotājam → pievieno trūkstošos laukus
  const data = snap.data();
  const patch = {};

  if (data.points == null) patch.points = 0;
  if (data.coins == null) patch.coins = 0;
  if (data.level == null) patch.level = 1;
  if (data.xp == null) patch.xp = 0;
  if (data.gamesPlayed == null) patch.gamesPlayed = 0;
  if (!Array.isArray(data.history)) patch.history = [];
  if (!Array.isArray(data.unlockedTopics)) patch.unlockedTopics = [];
  if (!Array.isArray(data.achievements)) patch.achievements = []; // 🏆 NEW
  if (data.dailyReward == null)
    patch.dailyReward = { lastClaim: null, streak: 0 };

  if (data.boosts == null)
    patch.boosts = {
      doubleXP: 0,
      freezeTime: 0,
      fiftyFifty: 0,
      hint: 0,
      skip: 0,
      golden: 0,
      vip: false,
    };

  if (Object.keys(patch).length > 0) {
    await updateDoc(ref, patch);
  }
};

/* -------------------------------------------------------------------------- */
/*                       🔐 GOOGLE LOGIN (WORKS 100%)                         */
/* -------------------------------------------------------------------------- */
export const signInWithGoogle = async () => {
  const res = await signInWithPopup(auth, googleProvider);
  const u = res.user;

  await ensureUserDocument(u.uid, u.email, u.displayName, u.photoURL);

  return res;
};

/* -------------------------------------------------------------------------- */
/*                        🔵 EMAIL SIGN UP (Register)                         */
/* -------------------------------------------------------------------------- */
export const signUpWithEmail = async (email, password, name = "") => {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  const u = res.user;

  await ensureUserDocument(u.uid, email, name, "");

  return res;
};

/* -------------------------------------------------------------------------- */
/*                         🔵 EMAIL LOGIN (SIGN IN)                           */
/* -------------------------------------------------------------------------- */
export const signInUserWithEmail = async (email, password) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  const u = res.user;

  // OBLIGĀTI jāizsauc arī šeit:
  await ensureUserDocument(u.uid, u.email, u.displayName, u.photoURL);

  return res;
};

/* -------------------------------------------------------------------------- */
export const logout = () => signOut(auth);

// 🔧 Drošs update helper – izveido dokumentu, ja nav
export const updateUserSafe = async (uid, updates) => {
  if (!uid) return;
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, updates, { merge: true });
  } else {
    await updateDoc(ref, updates);
  }
};

/* -------------------------------------------------------------------------- */
/*                            🔍 USER DATA                                    */
/* -------------------------------------------------------------------------- */
export const getUserData = async (uid) => {
  if (!uid) return null;
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
};

/* -------------------------------------------------------------------------- */
/*                          🟡 POINTS / COINS / XP                             */
/* -------------------------------------------------------------------------- */
export const addPoints = (uid, pts) =>
  updateDoc(doc(db, "users", uid), { points: increment(pts) });

export const addCoins = (uid, c) =>
  updateDoc(doc(db, "users", uid), { coins: increment(c) });

export const addXP = async (uid, xpToAdd) => {
  if (!uid || !xpToAdd) return;
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  const currentXP = data.xp || 0;
  const currentLevel = data.level || 1;

  const newXP = currentXP + xpToAdd;
  const threshold = 100 * currentLevel;

  if (newXP >= threshold) {
    await updateDoc(ref, {
      level: currentLevel + 1,
      xp: newXP - threshold,
    });
  } else {
    await updateDoc(ref, { xp: newXP });
  }
};

/* -------------------------------------------------------------------------- */
/*                           📝 GAME HISTORY                                   */
/* -------------------------------------------------------------------------- */
export const saveGameHistory = (uid, topic, score) =>
  updateDoc(doc(db, "users", uid), {
    gamesPlayed: increment(1),
    history: arrayUnion({
      topic,
      score,
      date: new Date().toISOString(),
    }),
  });

/* -------------------------------------------------------------------------- */
/*                            🧪 BOOST CONSUME                                 */
/* -------------------------------------------------------------------------- */
export const consumeBoost = async (uid, key) => {
  if (!uid || !key) return;
  if (key === "vip") return; // VIP nav patērējams

  await updateDoc(doc(db, "users", uid), {
    [`boosts.${key}`]: increment(-1),
  });
};

/* -------------------------------------------------------------------------- */
/*                      🏆 ACHIEVEMENTS – UNLOCK HELPER                        */
/* -------------------------------------------------------------------------- */
export const unlockAchievements = async (uid, ids) => {
  if (!uid || !ids || ids.length === 0) return;

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  const current = snap.exists() && Array.isArray(snap.data().achievements)
    ? snap.data().achievements
    : [];

  const set = new Set(current);
  ids.forEach((id) => set.add(id));

  await updateDoc(ref, {
    achievements: Array.from(set),
  });
};

/* -------------------------------------------------------------------------- */
/*                         🛒 PURCHASE ITEMS                                   */
/* -------------------------------------------------------------------------- */
export const purchaseItem = async (uid, item) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const user = snap.data();

  if (user.coins < item.price) return { ok: false, reason: "not_enough_coins" };

  const update = { coins: increment(-item.price) };

  if (item.type === "topic") update.unlockedTopics = arrayUnion(item.unlockKey);

  if (item.type === "boost")
    update[`boosts.${item.boostKey}`] = increment(1);

  if (item.type === "vip") update[`boosts.vip`] = true;

  await updateDoc(ref, update);
  return { ok: true };
};
