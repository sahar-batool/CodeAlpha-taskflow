import { Outlet } from "react-router-dom";
import { LogOut } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";
import { initials } from "../lib/utils";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";

export default function AppLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell />
            <span className="hidden text-sm font-medium text-slate-600 sm:block">{user.name}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              {initials(user.name)}
            </span>
            <button onClick={logout} aria-label="Log out" title="Log out" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
    </div>
  );
}