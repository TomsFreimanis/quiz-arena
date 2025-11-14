import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";


export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full bg-[#0a0d14] text-white px-6 py-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <span className="text-orange-400 text-2xl">🏀</span> NBA QUIZ
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex gap-6 text-lg">
          <Link to="/" className="hover:text-orange-400">Home</Link>
          <Link to="/quiz-start" className="hover:text-orange-400">Quiz</Link>
          <Link to="/leaderboard" className="hover:text-orange-400">Leaderboard</Link>
          <Link to="/achievements" className="hover:text-orange-400">Achievements</Link>
          <Link to="/store" className="hover:text-orange-400">Store</Link>
          <Link to="/profile" className="hover:text-orange-400">Profile</Link>
        </div>

        {/* Hamburger icon */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden mt-4 bg-[#131722] rounded-lg p-4 flex flex-col gap-4 text-lg shadow-md">
          <Link to="/" className="hover:text-orange-400" onClick={() => setOpen(false)}>Home</Link>
          <Link to="/quiz-start" className="hover:text-orange-400" onClick={() => setOpen(false)}>Quiz</Link>
          <Link to="/leaderboard" className="hover:text-orange-400" onClick={() => setOpen(false)}>Leaderboard</Link>
          <Link to="/achievements" className="hover:text-orange-400" onClick={() => setOpen(false)}>Achievements</Link>
          <Link to="/store" className="hover:text-orange-400" onClick={() => setOpen(false)}>Store</Link>
          <Link to="/profile" className="hover:text-orange-400" onClick={() => setOpen(false)}>Profile</Link>
        </div>
      )}
    </nav>
  );
}
