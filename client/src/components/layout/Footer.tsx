import { CalendarDays } from "lucide-react";
import { Link } from "react-router";

export const Footer = () => (
  <footer className="border-t border-stone-200 bg-white py-5 mt-4">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
      <Link to="/" className="flex items-center gap-2 text-stone-500 text-sm">
        <CalendarDays className="h-4 w-4 text-amber-600" />
        <span className="font-medium text-stone-700">EventPulse</span>
      </Link>
      <p className="text-xs text-stone-400">
        © {new Date().getFullYear()} EventPulse. All rights reserved.
      </p>
    </div>
  </footer>
);
