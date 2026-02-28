"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerCustomer, verifyOtp } from "@/lib/api";
import PhoneInput from "@/components/ui/PhoneInput";

// ─── Types ───────────────────────────────────────────────────────────────────
interface FormData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}

// ─── OTP Modal ───────────────────────────────────────────────────────────────
function OtpModal({
  email,
  onVerified,
  onClose,
}: {
  email: string;
  onVerified: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first box on open
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Accept only digits
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setError("");
    // Move to next box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otp];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await verifyOtp({ email, otp: code });
      setSuccess(true);
      setTimeout(() => {
        onVerified();
        router.push("/login");
      }, 1500);
    } catch {
      setError("Invalid OTP. Please check your email and try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(6px)",
        animation: "backdropIn 0.2s ease forwards",
      }}
    >
      {/* Animated modal card */}
      <div
        className="relative w-full max-w-md rounded-2xl p-8 border"
        style={{
          background: "linear-gradient(145deg, #111111, #1a1a1a)",
          borderColor: "#d4af37",
          boxShadow: "0 0 60px rgba(212,175,55,0.12), 0 20px 60px rgba(0,0,0,0.6)",
          animation: "modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        }}
      >
        {/* Keyframe definitions */}
        <style>{`
          @keyframes backdropIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes modalIn {
            from { opacity: 0; transform: translateY(24px) scale(0.96); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes successPop {
            0%   { transform: scale(0.5); opacity: 0; }
            70%  { transform: scale(1.15); }
            100% { transform: scale(1); opacity: 1; }
          }
          .success-icon { animation: successPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        `}</style>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-amber-400 text-lg transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Gold accent top bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
          style={{ background: "linear-gradient(90deg, transparent, #d4af37, transparent)" }}
        />

        {success ? (
          /* Success state */
          <div className="text-center py-6">
            <div className="text-5xl mb-4 success-icon inline-block">✅</div>
            <h2 className="text-2xl font-light text-amber-400 tracking-wider mb-2">Verified!</h2>
            <p className="text-zinc-400 text-sm">Redirecting you to login…</p>
          </div>
        ) : (
          <>
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)" }}
              >
                📧
              </div>
            </div>

            {/* Heading */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-light tracking-wider text-amber-400 mb-1">
                Verify Your Email
              </h2>
              <p className="text-zinc-400 text-sm">
                We sent a 6-digit code to
              </p>
              <p className="text-amber-300 text-sm font-medium mt-1 truncate">{email}</p>
            </div>

            {/* OTP boxes */}
            <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-11 h-14 text-center text-xl font-bold rounded-lg border-2 transition-all duration-200 focus:outline-none"
                  style={{
                    background: "#0d0d0d",
                    borderColor: digit ? "#d4af37" : "rgba(255,255,255,0.1)",
                    color: "#f0c940",
                    caretColor: "#d4af37",
                    boxShadow: digit ? "0 0 12px rgba(212,175,55,0.2)" : "none",
                  }}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <p className="text-center text-red-400 text-xs mb-4 bg-red-900/20 border border-red-800/40 rounded-lg py-2 px-3">
                {error}
              </p>
            )}

            {/* Verify button */}
            <button
              onClick={handleVerify}
              disabled={loading || otp.join("").length < 6}
              className="w-full py-3 rounded-lg font-semibold text-sm tracking-wider uppercase transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: loading ? "rgba(212,175,55,0.6)" : "linear-gradient(135deg, #d4af37, #b8942a)",
                color: "#000000",
                boxShadow: "0 4px 20px rgba(212,175,55,0.25)",
              }}
            >
              {loading ? "Verifying…" : "Verify & Activate"}
            </button>

            {/* Resend hint */}
            <p className="text-center text-zinc-600 text-xs mt-4">
              Didn&apos;t receive the code? Check your spam folder.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Register Page ────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    first_name: "", last_name: "", username: "",
    email: "", password: "", phone: "", address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      user: {
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      },
      profile: {
        address: formData.address || "Dubai",
        mobile: formData.phone,
      },
    };

    try {
      await registerCustomer(payload);
      setShowOtpModal(true); // Open OTP modal — do NOT redirect yet
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response
      ) {
        const data = (err.response as { data?: { detail?: string } }).data;
        setError(data?.detail ?? "Registration failed. Please try again.");
      } else {
        setError("Registration failed. Check your details and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg px-4 py-3 text-sm text-white transition-all duration-200 focus:outline-none placeholder:text-zinc-600";
  const inputStyle = {
    background: "#0d0d0d",
    border: "1px solid rgba(255,255,255,0.08)",
  };
  const inputFocusStyle = "focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30";

  return (
    <>
      {/* OTP Modal */}
      {showOtpModal && (
        <OtpModal
          email={formData.email}
          onVerified={() => setShowOtpModal(false)}
          onClose={() => setShowOtpModal(false)}
        />
      )}

      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#080808" }}>
        {/* Gold glow orb */}
        <div
          className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(ellipse, #d4af37 0%, transparent 70%)" }}
        />

        <div
          className="relative w-full max-w-lg rounded-2xl p-8 border"
          style={{
            background: "linear-gradient(145deg, #111111, #161616)",
            borderColor: "rgba(212,175,55,0.25)",
            boxShadow: "0 0 80px rgba(212,175,55,0.06), 0 30px 60px rgba(0,0,0,0.5)",
          }}
        >
          {/* Top gold bar */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
            style={{ background: "linear-gradient(90deg, transparent, #d4af37, transparent)" }}
          />

          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-xs tracking-[0.3em] text-amber-600 uppercase mb-2">IGL Web</p>
            <h1
              className="text-3xl font-light tracking-widest uppercase mb-1"
              style={{ color: "#d4af37" }}
            >
              Join Us
            </h1>
            <p className="text-zinc-500 text-sm">Create your premium customer account</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg text-sm text-red-400 border border-red-800/40 bg-red-900/20">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* First + Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-widest">
                  First Name
                </label>
                <input
                  type="text" required
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className={`${inputClass} ${inputFocusStyle}`}
                  style={inputStyle}
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-widest">
                  Last Name
                </label>
                <input
                  type="text" required
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className={`${inputClass} ${inputFocusStyle}`}
                  style={inputStyle}
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-widest">
                Username
              </label>
              <input
                type="text" required
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={`${inputClass} ${inputFocusStyle}`}
                style={inputStyle}
                placeholder="johndoe123"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-widest">
                Email Address
              </label>
              <input
                type="email" required
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`${inputClass} ${inputFocusStyle}`}
                style={inputStyle}
                placeholder="john@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-widest">
                Phone Number
              </label>
              <PhoneInput
                value={formData.phone}
                onChange={(val) => setFormData({ ...formData, phone: val })}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-widest">
                Password
              </label>
              <input
                type="password" required minLength={8}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`${inputClass} ${inputFocusStyle}`}
                style={inputStyle}
                placeholder="Min 8 characters"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg font-semibold text-sm tracking-widest uppercase mt-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #d4af37, #b8942a)",
                color: "#000000",
                boxShadow: "0 4px 24px rgba(212,175,55,0.3)",
              }}
            >
              {loading ? "Creating Account…" : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center mt-6 mb-4">
            <div className="flex-grow border-t border-zinc-800" />
            <div className="flex-grow border-t border-zinc-800" />
          </div>

          {/* Sign in link */}
          <p className="text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium transition-colors duration-200 hover:underline underline-offset-4"
              style={{ color: "#d4af37" }}
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}