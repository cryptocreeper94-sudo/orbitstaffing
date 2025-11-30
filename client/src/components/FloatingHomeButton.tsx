import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { Link, useLocation } from "wouter";

const EXCLUDED_PATHS = ['/', '/home', '/studio-landing.html'];

export function FloatingHomeButton() {
  const [location] = useLocation();

  if (EXCLUDED_PATHS.includes(location)) {
    return null;
  }

  return (
    <Link href="/">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-14 right-6 z-40 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-lg shadow-slate-900/50 hover:shadow-slate-900/70 border border-slate-600/50 transition-shadow duration-300"
        data-testid="button-floating-home"
        aria-label="Go to Home"
      >
        <Home className="w-5 h-5" />
      </motion.button>
    </Link>
  );
}
