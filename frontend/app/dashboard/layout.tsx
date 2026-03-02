"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarClock,
  CarFront,
  ReceiptText,
  Settings2,
  ChevronRight,
  LogOut,
  Bell,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview",     href: "/dashboard" },
  { icon: CalendarClock,   label: "Appointments", href: "/dashboard/appointments" },
  { icon: CarFront,        label: "Garage",       href: "/dashboard/garage" },
  { icon: ReceiptText,     label: "Invoices",     href: "/dashboard/invoices" },
  { icon: Settings2,       label: "Settings",     href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className="flex min-h-screen bg-[#050505] overflow-hidden"
      style={{ fontFamily: "'Oswald', 'Inter', sans-serif" }}
    >
      {/* ─── SIDEBAR ──────────────────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: expanded ? 220 : 68 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col justify-between bg-[#080808] border-r border-[#1a1a1a] py-6 z-40 shrink-0 overflow-hidden"
      >
        {/* Gold top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-[#D4AF37] via-[#f0cd6b] to-transparent" />

        {/* Logo mark */}
        <div className="flex items-center px-4 mb-10 overflow-hidden">
          <div className="w-9 h-9 rounded-none bg-[#D4AF37] flex items-center justify-center shrink-0">
            <Zap size={18} className="text-black" fill="black" />
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
                className="ml-3 text-white font-black text-sm tracking-[0.25em] uppercase whitespace-nowrap"
              >
                IGL <span className="text-[#D4AF37]">WEB</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav items */}
        <nav className="flex-1 flex flex-col gap-1 px-3">
          {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`group relative flex items-center gap-3 px-3 py-3 transition-all duration-200 overflow-hidden ${
                  active
                    ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                    : "text-white/35 hover:text-white hover:bg-white/5"
                }`}
              >
                {/* Active indicator */}
                {active && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#D4AF37]"
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                <Icon size={18} className="shrink-0" />
                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs font-medium tracking-[0.15em] uppercase whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed state */}
                {!expanded && (
                  <div className="pointer-events-none absolute left-full ml-3 px-3 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] text-white text-[10px] tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                    {label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="flex flex-col gap-1 px-3 mt-6">
          <button className="group flex items-center gap-3 px-3 py-3 text-white/30 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 overflow-hidden">
            <LogOut size={18} className="shrink-0" />
            <AnimatePresence>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs tracking-[0.15em] uppercase whitespace-nowrap"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-white/50 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-all duration-200 z-50"
        >
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.35 }}>
            <ChevronRight size={12} />
          </motion.div>
        </button>
      </motion.aside>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-[#1a1a1a] bg-[#050505]/80 backdrop-blur-sm sticky top-0 z-30">
          <div>
            <p className="text-[#D4AF37] text-[10px] tracking-[0.3em] uppercase font-light">
              Good Morning
            </p>
            <h2 className="text-white font-black text-lg tracking-wide uppercase">
              Mohammed Al-Rashid
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification bell */}
            <button className="relative w-9 h-9 flex items-center justify-center border border-[#1a1a1a] text-white/40 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-all duration-200">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            </button>
            {/* Avatar */}
            <div className="w-9 h-9 bg-[#D4AF37] flex items-center justify-center text-black font-black text-sm">
              MA
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}