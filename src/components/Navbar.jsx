import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full bg-[#0A0D1F] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          🏀 <span>NBA QUIZ</span>
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 text-lg font-medium">
          <Link className="hover:text-yellow-400" to="/">Home</Link>
          <Link className="hover:text-yellow-400" to="/quiz-start">Quiz</Link>
          <Link className="hover:text-yellow-400" to="/leaderboard">Leaderboard</Link>
          <Link className="hover:text-yellow-400" to="/achievements">Achievements</Link>
          <Link className="hover:text-yellow-400" to="/store">Store</Link>
          <Link className="hover:text-yellow-400" to="/profile">Profile</Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-[#0A0D1F] border-t border-white/10 flex flex-col p-4 text-center gap-4 text-lg">
          <Link onClick={() => setOpen(false)} to="/">Home</Link>
          <Link onClick={() => setOpen(false)} to="/quiz-start">Quiz</Link>
          <Link onClick={() => setOpen(false)} to="/leaderboard">Leaderboard</Link>
          <Link onClick={() => setOpen(false)} to="/achievements">Achievements</Link>
          <Link onClick={() => setOpen(false)} to="/store">Store</Link>
          <Link onClick={() => setOpen(false)} to="/profile">Profile</Link>
        </div>
      )}
    </nav>
  );
}
