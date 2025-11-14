// src/pages/Leaderboard.jsx
import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { motion } from "framer-motion";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const q = query(
          collection(db, "users"),
          orderBy("points", "desc"),
          limit(10)
        );

        const snap = await getDocs(q);
        const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setLeaders(users);
      } catch (e) {
        console.error("❌ Leaderboard error:", e);
      }
      setLoading(false);
    }

    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-yellow-400">
        Loading NBA Leaderboard...
      </div>
    );
  }

  if (leaders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-gray-300">
        No players yet 😢
      </div>
    );
  }

  const rankStyles = {
    0: "from-yellow-400 to-yellow-600 border-yellow-500",
    1: "from-gray-300 to-gray-500 border-gray-400",
    2: "from-orange-300 to-orange-500 border-orange-400",
    default: "from-purple-800 to-black border-purple-700",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-yellow-700 px-4 py-10 text-white">
      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center text-4xl font-extrabold text-yellow-400 tracking-widest mb-10"
      >
        🏀 TOP 10 NBA GOATS
      </motion.h1>

      <div className="max-w-2xl mx-auto space-y-4">
        {leaders.map((u, i) => {
          const style = rankStyles[i] || rankStyles.default;

          return (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={`
                p-4 rounded-2xl border backdrop-blur-xl 
                bg-gradient-to-r ${style}
                shadow-[0_0_25px_rgba(0,0,0,0.6)]
                flex justify-between items-center
              `}
            >
              {/* LEFT SIDE */}
              <div className="flex items-center gap-4">
                <div className="text-3xl font-extrabold text-black drop-shadow">
                  #{i + 1}
                </div>

                <img
                  src={u.photo || "/default-avatar.png"}
                  className={`
                    w-14 h-14 rounded-full border-4 
                    ${i === 0 ? "border-yellow-300" : ""}
                    ${i === 1 ? "border-gray-300" : ""}
                    ${i === 2 ? "border-orange-400" : ""}
                  `}
                />

                <div>
                  <p className="text-lg font-bold">
                    {u.name || "Anonīms"}
                  </p>
                  <p className="text-xs text-gray-200">
                    {u.email}
                  </p>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="text-right">
                <p className="text-xl font-extrabold text-yellow-300">
                  {u.points ?? 0} pts
                </p>
                <p className="text-sm text-gray-200">
                  XP: {u.xp ?? 0}
                </p>
                <p className="text-sm text-gray-200">
                  💰 {u.coins ?? 0}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
