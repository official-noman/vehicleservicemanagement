"use client";
import { motion, Variants, cubicBezier } from "framer-motion";
import {
  CalendarCheck,
  Wallet,
  Wrench,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Headphones,
  CheckCircle2,
  Circle,
  Loader2,
  Clock4,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── DATA ──────────────────────────────────────────────────────────────────────

const STATS = [
  {
    label: "Active Bookings",
    value: "3",
    sub: "+1 this week",
    trend: "up",
    icon: CalendarCheck,
    accent: "#D4AF37",
  },
  {
    label: "Total Spent (AED)",
    value: "12,480",
    sub: "-8% vs last month",
    trend: "down",
    icon: Wallet,
    accent: "#60a5fa",
  },
  {
    label: "Vehicles in Service",
    value: "2",
    sub: "Est. ready in 2 days",
    trend: "neutral",
    icon: Wrench,
    accent: "#34d399",
  },
  {
    label: "Reward Points",
    value: "4,750",
    sub: "Tier: Platinum",
    trend: "up",
    icon: Star,
    accent: "#f472b6",
  },
];

const CHART_DATA = [
  { month: "Sep", services: 2, spend: 3200 },
  { month: "Oct", services: 4, spend: 5800 },
  { month: "Nov", services: 3, spend: 4100 },
  { month: "Dec", services: 6, spend: 9400 },
  { month: "Jan", services: 4, spend: 7200 },
  { month: "Feb", services: 5, spend: 8600 },
  { month: "Mar", services: 7, spend: 12480 },
];

const TIMELINE = [
  { id: 1, label: "Vehicle Intake",       time: "09:00 AM", status: "done" },
  { id: 2, label: "Initial Inspection",   time: "09:45 AM", status: "done" },
  { id: 3, label: "Engine Diagnostics",   time: "11:00 AM", status: "done" },
  { id: 4, label: "Repair & Parts Fit",   time: "01:30 PM", status: "active" },
  { id: 5, label: "Final Polish & Detail",time: "04:00 PM", status: "pending" },
  { id: 6, label: "Quality Sign-off",     time: "05:30 PM", status: "pending" },
  { id: 7, label: "Ready for Collection", time: "06:00 PM", status: "pending" },
];

const RECENT = [
  { car: "Porsche 911 GT3",   service: "Full Service + Ceramic Coat", date: "Feb 14, 2025", amount: "AED 3,850", status: "Completed" },
  { car: "Mercedes G-Wagon",  service: "Engine Overhaul",             date: "Jan 28, 2025", amount: "AED 7,200", status: "Completed" },
  { car: "BMW M4 Competition",service: "Brake System + Fluid Change", date: "Jan 05, 2025", amount: "AED 1,430", status: "Completed" },
];

// ─── HELPERS ───────────────────────────────────────────────────────────────────

const fadeUp = (delay = 0): Variants => ({
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { delay, duration: 0.55, ease: cubicBezier(0.22, 1, 0.36, 1) } },
});

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "done")
    return <CheckCircle2 size={18} className="text-[#D4AF37]" fill="#D4AF37" fillOpacity={0.15} />;
  if (status === "active")
    return <Loader2 size={18} className="text-[#D4AF37] animate-spin" />;
  return <Circle size={18} className="text-white/20" />;
};

// Custom Recharts tooltip
interface TooltipProps {
  active?: boolean;
  payload?: { value?: number }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111] border border-[#1a1a1a] px-4 py-3 text-xs">
      <p className="text-white/40 tracking-widest uppercase mb-1">{label}</p>
      <p className="text-[#D4AF37] font-black">AED {payload[1]?.value?.toLocaleString()}</p>
      <p className="text-white/60">{payload[0]?.value} services</p>
    </div>
  );
};

// ─── COMPONENTS ────────────────────────────────────────────────────────────────

function StatCard({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const Icon = stat.icon;
  return (
    <motion.div
      variants={fadeUp(index * 0.08)}
      initial="hidden"
      animate="visible"
      className="group relative bg-[#0c0c0c] border border-[#1a1a1a] p-6 overflow-hidden hover:border-[#D4AF37]/30 transition-all duration-400"
    >
      {/* Background glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 0% 0%, ${stat.accent}08 0%, transparent 60%)` }}
      />

      {/* Corner accent */}
      <div
        className="absolute top-0 right-0 w-16 h-px opacity-60 transition-all duration-300 group-hover:w-24"
        style={{ background: `linear-gradient(to left, ${stat.accent}, transparent)` }}
      />
      <div
        className="absolute top-0 right-0 h-16 w-px opacity-60"
        style={{ background: `linear-gradient(to bottom, ${stat.accent}, transparent)` }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-10 h-10 flex items-center justify-center"
            style={{ background: `${stat.accent}15`, border: `1px solid ${stat.accent}25` }}
          >
            <Icon size={18} style={{ color: stat.accent }} />
          </div>
          <div
            className={`flex items-center gap-1 text-[10px] tracking-widest uppercase font-medium ${
              stat.trend === "up"
                ? "text-emerald-400"
                : stat.trend === "down"
                ? "text-red-400"
                : "text-white/30"
            }`}
          >
            {stat.trend === "up" && <ArrowUpRight size={12} />}
            {stat.trend === "down" && <ArrowDownRight size={12} />}
          </div>
        </div>

        <p className="text-[10px] tracking-[0.25em] uppercase text-white/40 mb-1">{stat.label}</p>
        <p className="text-3xl font-black text-white tracking-tight">{stat.value}</p>
        <p className="text-[10px] text-white/30 mt-1 tracking-wide">{stat.sub}</p>
      </div>
    </motion.div>
  );
}

// ─── PAGE ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8 max-w-350" style={{ fontFamily: "'Oswald', 'Inter', sans-serif" }}>

      {/* ── PAGE HEADER ── */}
      <motion.div variants={fadeUp(0)} initial="hidden" animate="visible">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[#D4AF37] text-[10px] tracking-[0.4em] uppercase mb-1">Overview</p>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">
              Master Dashboard
            </h1>
          </div>
          <p className="text-white/25 text-xs tracking-widest uppercase">
            Mon, Mar 02 · Dubai, UAE
          </p>
        </div>
        <div className="mt-4 h-px bg-linear-to-r from-[#D4AF37]/40 via-[#1a1a1a] to-transparent" />
      </motion.div>

      {/* ── STAT GRID ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} />
        ))}
      </div>

      {/* ── MIDDLE ROW: TIMELINE + CHART ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6">

        {/* SERVICE TIMELINE */}
        <motion.div
          variants={fadeUp(0.3)}
          initial="hidden"
          animate="visible"
          className="bg-[#0c0c0c] border border-[#1a1a1a] p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-1">Live Tracking</p>
              <h3 className="text-base font-black text-white uppercase tracking-wide">Service Status</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[#D4AF37] text-[10px] tracking-widest uppercase">Live</span>
            </div>
          </div>

          {/* Car tag */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] px-4 py-3 mb-6 flex items-center justify-between">
            <div>
              <p className="text-white font-black text-sm tracking-wide">Porsche 911 GT3</p>
              <p className="text-white/35 text-[10px] tracking-widest uppercase">Plate: D 59430</p>
            </div>
            <div className="text-right">
              <p className="text-[#D4AF37] text-[10px] tracking-widest uppercase">Step 4/7</p>
              <p className="text-white/40 text-[10px]">~2h left</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative mb-6">
            <div className="h-0.5 bg-[#1a1a1a] w-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "54%" }}
                transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="h-full bg-linear-to-r from-[#D4AF37] to-[#f0cd6b]"
              />
            </div>
            <p className="text-right text-[10px] text-white/30 mt-1">54% Complete</p>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {TIMELINE.map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-3"
              >
                <StatusIcon status={step.status} />
                <div className="flex-1">
                  <p
                    className={`text-xs font-medium tracking-wide ${
                      step.status === "done"
                        ? "text-white/50 line-through"
                        : step.status === "active"
                        ? "text-white font-black"
                        : "text-white/25"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-white/25">
                  <Clock4 size={10} />
                  <span className="text-[10px] tracking-wide">{step.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AREA CHART */}
        <motion.div
          variants={fadeUp(0.35)}
          initial="hidden"
          animate="visible"
          className="bg-[#0c0c0c] border border-[#1a1a1a] p-6"
        >
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-1">Analytics</p>
              <h3 className="text-base font-black text-white uppercase tracking-wide">Service History</h3>
            </div>
            <div className="flex gap-3">
              {["3M", "6M", "1Y"].map((t, i) => (
                <button
                  key={t}
                  className={`text-[10px] tracking-widest uppercase px-3 py-1.5 transition-all duration-200 ${
                    i === 1
                      ? "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30"
                      : "text-white/30 border border-[#1a1a1a] hover:text-white/60"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-5 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-[#D4AF37]" />
              <span className="text-[10px] text-white/40 tracking-widest uppercase">Spend (AED)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-[#60a5fa]" />
              <span className="text-[10px] text-white/40 tracking-widest uppercase">Services</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={CHART_DATA} margin={{ top: 10, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#D4AF37" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1a1a1a" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#ffffff30", fontSize: 10, fontFamily: "Oswald", letterSpacing: "0.1em" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#ffffff25", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#D4AF37", strokeWidth: 1, strokeDasharray: "4 4", strokeOpacity: 0.4 }} />
              <Area
                type="monotone"
                dataKey="services"
                stroke="#60a5fa"
                strokeWidth={1.5}
                fill="url(#blueGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#60a5fa", strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="spend"
                stroke="#D4AF37"
                strokeWidth={2}
                fill="url(#goldGrad)"
                dot={false}
                activeDot={{ r: 5, fill: "#D4AF37", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Summary metrics below chart */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-[#1a1a1a]">
            {[
              { label: "Total Services",   value: "31",          sub: "Last 7 months" },
              { label: "Avg Spend",        value: "AED 7,254",   sub: "Per month" },
              { label: "Peak Month",       value: "March",       sub: "AED 12,480" },
            ].map((m) => (
              <div key={m.label}>
                <p className="text-[10px] text-white/30 tracking-widest uppercase mb-1">{m.label}</p>
                <p className="text-white font-black text-base">{m.value}</p>
                <p className="text-white/25 text-[10px]">{m.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── RECENT SERVICES TABLE ── */}
      <motion.div
        variants={fadeUp(0.45)}
        initial="hidden"
        animate="visible"
        className="bg-[#0c0c0c] border border-[#1a1a1a] overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1a1a1a]">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-1">Records</p>
            <h3 className="text-base font-black text-white uppercase tracking-wide">Recent Services</h3>
          </div>
          <button className="flex items-center gap-1 text-[#D4AF37] text-[10px] tracking-widest uppercase hover:gap-2 transition-all duration-200">
            View All <ChevronRight size={12} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                {["Vehicle", "Service", "Date", "Amount", "Status"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-[10px] tracking-[0.25em] uppercase text-white/25 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT.map((row, i) => (
                <motion.tr
                  key={row.car}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                  className="border-b border-[#111] hover:bg-[#D4AF37]/3 transition-colors duration-200 group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <p className="text-white text-sm font-bold tracking-wide">{row.car}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white/50 text-xs tracking-wide">{row.service}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white/40 text-xs tracking-wider">{row.date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[#D4AF37] text-sm font-black">{row.amount}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-[10px] tracking-widest uppercase">
                      <CheckCircle2 size={10} />
                      {row.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── QUICK ACTIONS (floating sticky bar) ── */}
      <motion.div
        variants={fadeUp(0.55)}
        initial="hidden"
        animate="visible"
        className="sticky bottom-8 flex items-center justify-end gap-3 pointer-events-none"
      >
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Live support */}
          <button className="group flex items-center gap-2 bg-[#0c0c0c] border border-[#1a1a1a] hover:border-white/20 text-white/50 hover:text-white px-5 py-3 text-[11px] tracking-[0.2em] uppercase font-medium transition-all duration-300 shadow-2xl">
            <Headphones size={15} className="group-hover:text-[#D4AF37] transition-colors duration-200" />
            Live Support
          </button>

          {/* Book Service */}
          <button className="group relative flex items-center gap-2 bg-[#D4AF37] text-black px-6 py-3 text-[11px] tracking-[0.2em] uppercase font-black transition-all duration-300 hover:bg-white shadow-2xl shadow-[#D4AF37]/20 overflow-hidden">
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
            <Plus size={15} className="relative z-10" />
            <span className="relative z-10">Book New Service</span>
          </button>
        </div>
      </motion.div>

      {/* Bottom padding */}
      <div className="h-6" />
    </div>
  );
}