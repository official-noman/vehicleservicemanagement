"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginuser } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("customer");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ username: "", password: "", otp: "" });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // কাস্টমারের জন্য OTP স্টেপ সিমুলেশন
    if (role === "customer" && step === 1) {
      setStep(2);
      return;
    }

    try {
      // API Call (OTP ভেরিফাই হওয়ার পর বা Admin/Staff এর জন্য)
      const data = await loginuser({
        username: formData.username,
        password: formData.password,
      });

      // টোকেন ও রোল সেভ করা
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("userRole", data.role);

      alert("Login Successful!");

      // রোল অনুযায়ী ড্যাশবোর্ডে পাঠানো

      router.push("/customer/dashboard");

    } catch (error) {
      alert("Login Failed! Check your credentials.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white p-4">
      <div className="w-full max-w-md bg-[#121212] border border-zinc-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light tracking-wider text-amber-500 mb-2">IGL WEB</h1>
          <p className="text-zinc-400 text-sm">Sign in to your account</p>
        </div>


        <form onSubmit={handleLoginSubmit} className="space-y-5">
          {step === 1 ? (
            <>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wide">
                  Username / Email
                </label>
                <input
                  type="text"
                  required
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Enter username or email"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wide">Password</label>
                <input
                  type="password"
                  required
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  placeholder="••••••••"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wide">Enter 6-digit OTP</label>
              <input
                type="text"
                maxLength={6}
                required
                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white tracking-[0.5em] text-center text-lg focus:outline-none focus:border-amber-500"
                placeholder="------"
              />
            </div>
          )}

          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-3 rounded-lg mt-4 transition-colors duration-200">
            {step === 1 ? (role === "customer" ? "Send OTP" : "Sign In") : "Verify & Sign In"}
          </button>

          {step === 1 && (
            <div className="mt-6">
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-zinc-800"></div>
                {/* <span className="mx-3 text-xs text-zinc-600 uppercase tracking-wider">or</span> */}
                <div className="flex-grow border-t border-zinc-800"></div>
              </div>
              <p className="text-center text-sm text-zinc-500 mt-4">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-amber-500 hover:text-amber-400 font-medium transition-colors duration-200 underline-offset-4 hover:underline"
                >
                  Create Account
                </Link>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}