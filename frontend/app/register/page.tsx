"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerCustomer } from "@/lib/api";
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


// ─── Register Page ────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    first_name: "", last_name: "", username: "",
    email: "", password: "", phone: "", address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

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
      router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`); // Redirect to new auth flow tab
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