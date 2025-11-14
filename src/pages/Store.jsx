// src/pages/Store.jsx
import { useEffect, useState } from "react";
import { auth, getUserData, purchaseItem } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";

const ITEMS = [
  {
    id: "freeze_pack",
    name: "Freeze Time x3",
    desc: "+12s pie taimeriem (3 reizes).",
    price: 60,
    type: "boost",
    boostKey: "freezeTime",
  },
  {
    id: "doublexp_pack",
    name: "Double XP x3",
    desc: "Dubulto XP 3 spēlēm.",
    price: 80,
    type: "boost",
    boostKey: "doubleXP",
  },
  {
    id: "fifty_pack",
    name: "50/50 x3",
    desc: "Noņem 2 nepareizas atbildes (3 reizes).",
    price: 70,
    type: "boost",
    boostKey: "fiftyFifty",
  },
  {
    id: "skip_pack",
    name: "Skip x3",
    desc: "Izlaid 3 jautājumus bez soda.",
    price: 50,
    type: "boost",
    boostKey: "skip",
  },
  {
    id: "golden_pack",
    name: "Golden Question x2",
    desc: "2 golden jautājumi ar x3 punktiem.",
    price: 90,
    type: "boost",
    boostKey: "golden",
  },
  {
    id: "vip_pass",
    name: "VIP Pass",
    desc: "XP bonuss, atbalsts Ultra režīmam nākotnē.",
    price: 200,
    type: "vip",
  },
  {
    id: "ultra_mode",
    name: "Ultra LeBron Unlock",
    desc: "Atbloķē ULTRA LEBRON MODE bez VIP.",
    price: 150,
    type: "topic",
    unlockKey: "mode_ultra",
  },
];

export default function Store() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setFirebaseUser(u);
      if (u) {
        const data = await getUserData(u.uid);
        setUserData(data);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleBuy = async (item) => {
    if (!firebaseUser) {
      alert("🔑 Lai pirktu, lūdzu pieslēdzies.");
      return;
    }

    setBuyingId(item.id);
    try {
      const res = await purchaseItem(firebaseUser.uid, item);
      if (!res.ok) {
        if (res.reason === "not_enough_coins") {
          alert("❌ Nepietiek monētu.");
        } else {
          alert("❌ Neizdevās iegādāties priekšmetu.");
        }
      } else {
        const fresh = await getUserData(firebaseUser.uid);
        setUserData(fresh);
      }
    } catch (err) {
      console.error("Purchase error:", err);
      alert("❌ Kļūda pirkuma laikā.");
    } finally {
      setBuyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-slate-950 to-yellow-700">
        <p className="text-yellow-200 animate-pulse">Ielādē NBA veikalu...</p>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-slate-950 to-yellow-700">
        <div className="bg-slate-950/80 border border-yellow-500/40 rounded-3xl p-8 text-center text-white max-w-md w-full">
          <h1 className="text-2xl font-bold mb-3">NBA Market 🛒</h1>
          <p className="text-sm text-slate-300 mb-4">
            Lai iegādātos boostus un atslēgtu ULTRA LEBRON MODE, lūdzu
            pieslēdzies.
          </p>
          <a
            href="/login"
            className="inline-flex px-5 py-2 rounded-xl bg-yellow-400 text-slate-900 font-semibold hover:bg-yellow-300"
          >
            🔑 Pieslēgties
          </a>
        </div>
      </div>
    );
  }

  const coins = userData?.coins ?? 0;
  const boosts = userData?.boosts || {};
  const unlockedTopics = userData?.unlockedTopics || [];
  const isVIP = boosts.vip === true;
  const hasUltra = unlockedTopics.includes("mode_ultra") || isVIP;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-slate-950 to-yellow-700 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-slate-950/85 border border-yellow-400/40 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.9)] p-8 max-w-5xl w-full text-white"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold mb-1">
              NBA Market 🛒
            </h1>
            <p className="text-slate-300 text-sm">
              Izmanto monētas, lai pirktu boostus un atslēgtu augstāka līmeņa
              režīmus.
            </p>
          </div>
          <div className="text-right text-xs md:text-sm">
            <p className="text-yellow-300 font-semibold">
              {firebaseUser.displayName || firebaseUser.email}
            </p>
            <p className="text-slate-300">
              💰 Monētas:{" "}
              <span className="text-yellow-300 font-bold">{coins}</span>
            </p>
            <p className="text-slate-400 mt-1">
              VIP:{" "}
              {isVIP ? (
                <span className="text-purple-300 font-semibold">
                  Aktīvs 👑
                </span>
              ) : (
                <span className="text-slate-500">Nav</span>
              )}
            </p>
            <p className="text-slate-400 text-[11px]">
              Ultra LeBron Mode:{" "}
              {hasUltra ? (
                <span className="text-emerald-300 font-semibold">
                  Atbloķēts
                </span>
              ) : (
                <span className="text-slate-500">Bloķēts</span>
              )}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {ITEMS.map((item) => {
            let owned = false;
            if (item.type === "vip" && isVIP) owned = true;
            if (item.type === "topic" && hasUltra && item.unlockKey === "mode_ultra")
              owned = true;

            return (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.04 }}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-sm shadow-lg flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-base font-semibold mb-1">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-300 mb-3">
                    {item.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-slate-300">
                    Cena:{" "}
                    <span className="text-yellow-300 font-semibold">
                      {item.price} 💰
                    </span>
                  </div>
                  <button
                    onClick={() => !owned && handleBuy(item)}
                    disabled={owned || buyingId === item.id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      owned
                        ? "bg-slate-700 text-slate-300 cursor-not-allowed"
                        : "bg-yellow-400 text-slate-900 hover:bg-yellow-300"
                    }`}
                  >
                    {owned
                      ? "✅ Iegādāts"
                      : buyingId === item.id
                      ? "Pērk..."
                      : "Pirkt"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
