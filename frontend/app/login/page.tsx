"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginuser } from "@/lib/api";
import { motion, AnimatePresence, cubicBezier } from "framer-motion";
import { ArrowRight, Mail, Lock, KeyRound, Chrome } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: cubicBezier(0.22, 1, 0.36, 1) },
  }),
};

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("customer");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ username: "", password: "", otp: "" });
  const [focused, setFocused] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (role === "customer" && step === 1) {
      setStep(2);
      return;
    }

    try {
      const data = await loginuser({
        username: formData.username,
        password: formData.password,
      });

      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("userRole", data.role);

      alert("Login Successful!");
      router.push("/customer/dashboard");
    } catch (error) {
      alert("Login Failed! Check your credentials.");
      console.error(error);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row bg-[#050505] overflow-hidden"
      style={{ fontFamily: "'Oswald', 'Inter', sans-serif" }}
    >
      {/* ─── LEFT PANEL ──────────────────────────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-1/2 min-h-screen overflow-hidden">
        {/* Bg image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=2070&auto=format&fit=crop')",
          }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-[#050505]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-transparent to-[#050505]/30" />

        {/* Gold vertical accent line */}
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#D4AF37]/60 to-transparent" />

        {/* Top logo mark */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-10 left-10"
        >
          <span className="text-[#D4AF37] text-xl font-black tracking-[0.35em] uppercase">
            IGL
          </span>
          <span className="text-white/30 text-xl font-thin tracking-[0.35em] uppercase ml-2">
            WEB
          </span>
        </motion.div>

        {/* Bottom slogan */}
        <div className="absolute bottom-12 left-10 right-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-12 h-[2px] bg-[#D4AF37] mb-5" />
            <h2 className="text-5xl font-black tracking-tight leading-none text-white uppercase">
              EXCELLENCE
              <br />
              <span className="text-[#D4AF37]">IN MOTION.</span>
            </h2>
            <p className="mt-4 text-white/40 text-sm font-light tracking-widest uppercase">
              Dubai&apos;s Premier Luxury Car Care
            </p>
          </motion.div>
        </div>

        {/* Decorative corner grid lines */}
        <div
          className="absolute bottom-0 right-0 w-48 h-48 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(#D4AF37 1px, transparent 1px), linear-gradient(90deg, #D4AF37 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* ─── RIGHT PANEL ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-between min-h-screen bg-[#0a0a0a] px-8 py-12 sm:px-14 lg:px-16">
        {/* Mobile logo */}
        <div className="flex lg:hidden mb-10">
          <span className="text-[#D4AF37] text-lg font-black tracking-[0.35em] uppercase">IGL</span>
          <span className="text-white/30 text-lg font-thin tracking-[0.35em] uppercase ml-2">WEB</span>
        </div>

        {/* Form area — vertically centred */}
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          {/* Header */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-10"
          >
            <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase mb-3 font-light">
              Welcome Back
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white uppercase leading-tight">
              Sign In
            </h1>
          </motion.div>

          {/* Google CTA */}
          <motion.button
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            type="button"
            className="group w-full flex items-center justify-center gap-3 bg-white text-[#050505] font-bold text-sm tracking-widest uppercase px-6 py-4 rounded-none mb-8 transition-all duration-300 hover:bg-[#D4AF37] hover:text-black relative overflow-hidden"
          >
            {/* Slide-in gold shimmer */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-[#D4AF37] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
            <Chrome size={18} className="relative z-10 flex-shrink-0" />
            <span className="relative z-10">Continue with Google</span>
          </motion.button>

          {/* Divider */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-4 mb-8"
          >
            <div className="flex-1 h-[1px] bg-white/10" />
            <span className="text-white/30 text-[10px] tracking-[0.2em] uppercase whitespace-nowrap font-light">
              Or continue with email
            </span>
            <div className="flex-1 h-[1px] bg-white/10" />
          </motion.div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-7"
                >
                  {/* Username field */}
                  <div className="relative">
                    <div
                      className={`flex items-center gap-3 border-b transition-colors duration-300 pb-3 ${
                        focused === "username" ? "border-[#D4AF37]" : "border-white/15"
                      }`}
                    >
                      <Mail
                        size={15}
                        className={`flex-shrink-0 transition-colors duration-300 ${
                          focused === "username" ? "text-[#D4AF37]" : "text-white/30"
                        }`}
                      />
                      <div className="flex-1 relative">
                        <label
                          className={`absolute transition-all duration-300 pointer-events-none text-xs tracking-widest uppercase font-light ${
                            formData.username || focused === "username"
                              ? "-top-4 text-[10px] text-[#D4AF37]"
                              : "top-0 text-white/30"
                          }`}
                        >
                          Username / Email
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.username}
                          onFocus={() => setFocused("username")}
                          onBlur={() => setFocused(null)}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="w-full bg-transparent text-white text-sm pt-1 focus:outline-none tracking-wide"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="relative">
                    <div
                      className={`flex items-center gap-3 border-b transition-colors duration-300 pb-3 ${
                        focused === "password" ? "border-[#D4AF37]" : "border-white/15"
                      }`}
                    >
                      <Lock
                        size={15}
                        className={`flex-shrink-0 transition-colors duration-300 ${
                          focused === "password" ? "text-[#D4AF37]" : "text-white/30"
                        }`}
                      />
                      <div className="flex-1 relative">
                        <label
                          className={`absolute transition-all duration-300 pointer-events-none text-xs tracking-widest uppercase font-light ${
                            formData.password || focused === "password"
                              ? "-top-4 text-[10px] text-[#D4AF37]"
                              : "top-0 text-white/30"
                          }`}
                        >
                          Password
                        </label>
                        <input
                          type="password"
                          required
                          value={formData.password}
                          onFocus={() => setFocused("password")}
                          onBlur={() => setFocused(null)}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full bg-transparent text-white text-sm pt-1 focus:outline-none tracking-widest"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="text-white/40 text-xs tracking-widest uppercase mb-6 font-light">
                    OTP sent to your registered email
                  </p>
                  <div className="relative">
                    <div
                      className={`flex items-center gap-3 border-b transition-colors duration-300 pb-3 ${
                        focused === "otp" ? "border-[#D4AF37]" : "border-white/15"
                      }`}
                    >
                      <KeyRound
                        size={15}
                        className={`flex-shrink-0 transition-colors duration-300 ${
                          focused === "otp" ? "text-[#D4AF37]" : "text-white/30"
                        }`}
                      />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="6-digit OTP"
                        onFocus={() => setFocused("otp")}
                        onBlur={() => setFocused(null)}
                        onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                        className="flex-1 bg-transparent text-white text-xl tracking-[0.6em] focus:outline-none placeholder:text-white/20 placeholder:text-sm placeholder:tracking-widest"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="mt-4 text-white/30 text-xs tracking-widest uppercase hover:text-[#D4AF37] transition-colors duration-200"
                  >
                    ← Back
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.div
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-10"
            >
              <button
                type="submit"
                className="group w-full flex items-center justify-between bg-[#D4AF37] text-black font-black text-sm tracking-[0.2em] uppercase px-6 py-4 transition-all duration-300 hover:bg-white overflow-hidden relative"
              >
                <span className="relative z-10">
                  {step === 1 ? (role === "customer" ? "Send OTP" : "Sign In") : "Verify & Sign In"}
                </span>
                <span className="relative z-10 w-8 h-8 flex items-center justify-center bg-black/10 rounded-full group-hover:translate-x-1 transition-transform duration-300">
                  <ArrowRight size={16} />
                </span>
              </button>
            </motion.div>

            {/* Create account */}
            {step === 1 && (
              <motion.p
                custom={5}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mt-6 text-center text-white/30 text-xs tracking-widest uppercase"
              >
                No account?{" "}
                <Link
                  href="/register"
                  className="text-[#D4AF37] hover:text-white transition-colors duration-200 font-medium"
                >
                  Create One
                </Link>
              </motion.p>
            )}
          </form>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex items-center justify-center gap-6 mt-10"
        >
          <Link
            href="/privacy"
            className="text-white/20 text-[10px] tracking-widest uppercase hover:text-white/50 transition-colors duration-200"
          >
            Privacy Policy
          </Link>
          <div className="w-[3px] h-[3px] rounded-full bg-white/20" />
          <Link
            href="/terms"
            className="text-white/20 text-[10px] tracking-widest uppercase hover:text-white/50 transition-colors duration-200"
          >
            Terms of Service
          </Link>
        </motion.div>
      </div>
    </div>
  );
}