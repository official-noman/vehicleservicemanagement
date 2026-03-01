"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOtp } from "@/lib/api";

export default function VerifyOtpPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (!email) {
            router.push("/register");
        }
        inputRefs.current[0]?.focus();
    }, [email, router]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const next = [...otp];
        next[index] = value;
        setOtp(next);
        setError("");
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
        if (!email) return;

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
                router.push("/login"); // Redirect to login after success
            }, 1500);
        } catch {
            setError("Invalid OTP. Please check your email and try again.");
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    if (!email) return null; // Or a loading spinner while redirecting

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#080808" }}>
            {/* Glow orb */}
            <div
                className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-10 blur-3xl"
                style={{ background: "radial-gradient(ellipse, #d4af37 0%, transparent 70%)" }}
            />

            <div
                className="relative w-full max-w-md rounded-2xl p-8 border"
                style={{
                    background: "linear-gradient(145deg, #111111, #1a1a1a)",
                    borderColor: "rgba(212,175,55,0.25)",
                    boxShadow: "0 0 80px rgba(212,175,55,0.06), 0 30px 60px rgba(0,0,0,0.5)",
                    animation: "fadeIn 0.4s ease-out forwards",
                }}
            >
                <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
           @keyframes successPop {
            0%   { transform: scale(0.5); opacity: 0; }
            70%  { transform: scale(1.15); }
            100% { transform: scale(1); opacity: 1; }
          }
          .success-icon { animation: successPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        `}</style>
                {/* Top gold bar */}
                <div
                    className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
                    style={{ background: "linear-gradient(90deg, transparent, #d4af37, transparent)" }}
                />

                {success ? (
                    <div className="text-center py-6">
                        <div className="text-5xl mb-4 success-icon inline-block">✅</div>
                        <h2 className="text-2xl font-light text-amber-400 tracking-wider mb-2">Verified!</h2>
                        <p className="text-zinc-400 text-sm">Account activated successfully.<br /> Redirecting to Login...</p>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-center mb-6">
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg"
                                style={{
                                    background: "rgba(212,175,55,0.05)",
                                    border: "1px solid rgba(212,175,55,0.2)",
                                    boxShadow: "inset 0 0 20px rgba(212,175,55,0.05)"
                                }}
                            >
                                ✉️
                            </div>
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-light tracking-wide text-amber-500 mb-2">
                                Verify Your Account
                            </h2>
                            <p className="text-zinc-400 text-sm">
                                Enter the 6-digit verification code sent to
                            </p>
                            <p className="text-amber-300 text-sm font-medium mt-1 tracking-wide truncate">{email}</p>
                        </div>

                        <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
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
                                    className="w-12 h-14 text-center text-2xl font-semibold rounded-lg border focus:outline-none transition-all duration-300"
                                    style={{
                                        background: "#0a0a0a",
                                        borderColor: digit ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.08)",
                                        color: "#f0c940",
                                        caretColor: "#d4af37",
                                        boxShadow: digit ? "0 0 15px rgba(212,175,55,0.15)" : "inset 0 2px 4px rgba(0,0,0,0.5)",
                                    }}
                                />
                            ))}
                        </div>

                        {error && (
                            <p className="text-center text-red-400 text-sm mb-6 bg-red-950/30 border border-red-900/50 rounded-lg py-3 px-4 shadow-inner">
                                {error}
                            </p>
                        )}

                        <button
                            onClick={handleVerify}
                            disabled={loading || otp.join("").length < 6}
                            className="w-full py-3.5 rounded-lg font-bold text-sm tracking-widest uppercase transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                            style={{
                                background: loading ? "rgba(212,175,55,0.4)" : "linear-gradient(135deg, #d4af37 0%, #a87b1e 100%)",
                                color: "#050505",
                                boxShadow: "0 8px 25px rgba(212,175,55,0.25)",
                                textShadow: "0 1px 2px rgba(255,255,255,0.2)"
                            }}
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>

                        <div className="text-center mt-6">
                            <button
                                className="text-xs text-zinc-500 hover:text-amber-400 transition-colors uppercase tracking-widest font-medium"
                            >
                                Resend Code
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
