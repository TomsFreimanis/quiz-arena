// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./services/firebase";

// Pages
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Login from "./pages/Login";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import QuizStart from "./pages/QuizStart";
import Store from "./pages/Store";
import Achievements from "./pages/Achievements";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">

        {/* 🔥 NBA DARK NAVBAR */}
        <nav className="sticky top-0 z-50 bg-slate-950/90 border-b border-yellow-500/40 backdrop-blur-xl shadow-[0_0_25px_rgba(0,0,0,0.7)]">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

            {/* LOGO */}
            <Link
              to="/"
              className="text-yellow-300 font-extrabold text-xl tracking-wide hover:text-yellow-200 transition"
            >
              🏀 NBA QUIZ
            </Link>

            {/* 📌 Desktop Menu */}
            <div className="hidden md:flex items-center gap-6 text-sm font-semibold">

              <Link to="/" className="text-slate-300 hover:text-yellow-300">Home</Link>

              <Link to="/quiz-start" className="text-slate-300 hover:text-yellow-300">Quiz</Link>

              <Link to="/leaderboard" className="text-slate-300 hover:text-yellow-300">Leaderboard</Link>

              <Link to="/achievements" className="text-slate-300 hover:text-yellow-300">Achievements</Link>

              <Link to="/profile" className="text-slate-300 hover:text-yellow-300">Profile</Link>

              {/* Store only if logged in */}
              {user && (
                <Link to="/store" className="text-yellow-400 hover:text-yellow-300">
                  🛒 Store
                </Link>
              )}

              {/* Auth */}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300"
                >
                  Logout
                </button>
              ) : (
                <Link to="/login" className="text-emerald-300 hover:text-emerald-200">
                  Login
                </Link>
              )}
            </div>

            {/* 📱 Mobile Menu */}
            <MobileMenu user={user} handleLogout={handleLogout} />
          </div>
        </nav>

        {/* ROUTER */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/quiz-start" element={<QuizStart />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/store" element={<Store />} />
            <Route path="/login" element={<Login />} />
            <Route path="/achievements" element={<Achievements />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

/* ---------------------------------------------------------------
   📱 MOBILE MENU COMPONENT
---------------------------------------------------------------- */
function MobileMenu({ user, handleLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-yellow-300 text-2xl"
      >
        ☰
      </button>

      {open && (
        <div className="absolute right-0 mt-3 bg-slate-900 border border-yellow-600/30 rounded-xl shadow-xl p-4 w-48 text-sm text-slate-200 space-y-3">
          <Link onClick={() => setOpen(false)} to="/">Home</Link>
          <Link onClick={() => setOpen(false)} to="/quiz-start">Quiz</Link>
          <Link onClick={() => setOpen(false)} to="/leaderboard">Leaderboard</Link>
          <Link onClick={() => setOpen(false)} to="/achievements">Achievements</Link>
          <Link onClick={() => setOpen(false)} to="/profile">Profile</Link>

          {user && (
            <Link onClick={() => setOpen(false)} to="/store" className="text-yellow-300">
              🛒 Store
            </Link>
          )}

          {user ? (
            <button
              onClick={() => {
                setOpen(false);
                handleLogout();
              }}
              className="text-red-400"
            >
              Logout
            </button>
          ) : (
            <Link onClick={() => setOpen(false)} to="/login" className="text-emerald-300">
              Login
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
