export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[#080808] text-white selection:bg-[#d4af37] selection:text-black">
            {/* 
        ====================================================
        LEFT SIDE: BRANDING & IMAGE (Fixed/Static part)
        ====================================================
      */}
            <div className="hidden lg:flex w-1/2 flex-col justify-between relative overflow-hidden p-12 lg:p-16">
                {/* Background Overlay */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 transition-opacity duration-1000"
                        style={{
                            backgroundImage: "url('/images/auth-bg-car.jpg')", // Ensure you have this image in public/images/
                            backgroundPosition: "center 30%",
                        }}
                    />
                </div>

                {/* Top Logo Area */}
                <div className="relative z-20 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#d4af37] flex items-center justify-center font-bold text-black text-xl">
                        IG
                    </div>
                    <span className="text-xl font-light tracking-[0.2em] uppercase text-[#d4af37]">
                        IGL Web
                    </span>
                </div>

                {/* Center Motivation Copy */}
                <div className="relative z-20 max-w-lg mb-12">
                    <h2 className="text-4xl lg:text-5xl font-light leading-tight mb-6">
                        Premium <span className="font-semibold text-[#d4af37]">Care</span> <br />
                        For Premium <span className="font-semibold text-[#d4af37]">Cars</span>.
                    </h2>
                    <p className="text-zinc-400 text-lg leading-relaxed">
                        Experience world-class automotive luxury and precision engineering services right at your fingertips.
                    </p>
                </div>

                {/* Bottom Contact/Address */}
                <div className="relative z-20 flex items-center gap-8 text-sm text-zinc-500">
                    <div className="flex items-center gap-2 hover:text-[#d4af37] transition-colors cursor-pointer">
                        <span>📞</span> <span>+971 50 123 4567</span>
                    </div>
                    <div className="flex items-center gap-2 hover:text-[#d4af37] transition-colors cursor-pointer">
                        <span>📍</span> <span>Dubai, UAE</span>
                    </div>
                </div>
            </div>

            {/* 
        ====================================================
        RIGHT SIDE: DYNAMIC FORM & DRAWER ({children})
        ====================================================
      */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative px-4 sm:px-8 py-12">
                {/* Ambient Glow */}
                <div
                    className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-[120px]"
                    style={{ background: "radial-gradient(circle, #d4af37 0%, transparent 70%)" }}
                />

                {/* Back Button (Optional logic can be added here) */}
                <div className="absolute top-8 left-8 lg:hidden flex items-center gap-3 z-30">
                    <div className="w-8 h-8 rounded-full bg-[#d4af37] flex items-center justify-center font-bold text-black text-sm">
                        IG
                    </div>
                    <span className="text-sm font-medium tracking-widest uppercase text-[#d4af37]">
                        IGL Web
                    </span>
                </div>

                {/* Form Container (Dynamic Content) */}
                <div className="w-full max-w-md relative z-20 flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {children}
                </div>

                {/* 
          ====================================================
          PROFESSIONAL DRAWER / ADVERTISEMENT (Trust Factor)
          ====================================================
        */}
                <div className="w-full max-w-md mt-10 relative z-20 pt-6 border-t border-zinc-800/50">
                    <div className="rounded-xl p-5 bg-gradient-to-br from-[#111111] to-[#161616] border border-[#d4af37]/20 shadow-2xl flex items-start gap-4 hover:border-[#d4af37]/40 transition-colors group">
                        <div className="w-12 h-12 rounded-full bg-[#0a0a0a] flex items-center justify-center flex-shrink-0 border border-zinc-800 group-hover:bg-[#d4af37]/10 transition-colors">
                            <span className="text-xl">⭐</span>
                        </div>
                        <div>
                            <h4 className="text-[#d4af37] font-medium text-sm mb-1 uppercase tracking-wider flex items-center gap-2">
                                Limited Time Offer
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                            </h4>
                            <p className="text-zinc-400 text-xs leading-relaxed mb-3">
                                Book your first premium diagnostic via our new app and get <strong className="text-white">15% off</strong>. Valid for Dubai residents.
                            </p>
                            <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-semibold uppercase tracking-widest">
                                <span className="flex items-center gap-1">🛡️ ISO Certified</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">✅ 5-Star Reviews</span>
                            </div>
                        </div>
                    </div>

                    {/* Floating WhatsApp Bubble for Help */}
                    <div className="absolute -right-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                        <div className="bg-[#25D366] w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/20">
                            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
