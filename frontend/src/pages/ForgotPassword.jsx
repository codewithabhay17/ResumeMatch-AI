import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-8">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-sky-100/60 blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-purple-100/50 blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20">
            <span className="material-symbols-outlined text-white text-xl">neurology</span>
          </div>
          <div>
            <div className="font-headline-sm text-headline-sm font-bold text-on-surface leading-none">ResuMatch</div>
            <div className="font-code-telemetry text-[10px] text-primary font-semibold uppercase tracking-wider">v4.2 Quantum</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-surface-container shadow-sm p-space-xl overflow-hidden relative">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-sky-50/80 blur-2xl pointer-events-none"></div>

          {!sent ? (
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-primary-fixed border border-primary-fixed-dim flex items-center justify-center mb-space-lg shadow-sm">
                <span className="material-symbols-outlined text-primary text-3xl">lock_reset</span>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  <span className="font-code-telemetry text-[11px] font-bold uppercase text-primary tracking-wider">Password Recovery</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg font-extrabold text-on-surface tracking-tight mb-2">Forgot password?</h1>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Enter your email and we&apos;ll send you a secure password reset link.
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); if (email) setSent(true); }} className="flex flex-col gap-5">
                <div>
                  <label className="block font-body-sm text-body-sm font-semibold text-on-surface mb-2">Email Address</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">alternate_email</span>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      required
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-surface-container rounded-xl pl-10 pr-4 py-3 font-body-md text-body-md text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-space-xs py-3 rounded-xl bg-primary text-on-primary font-headline-sm text-body-md font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                  Send Reset Link
                </button>
              </form>
            </div>

          ) : (
            <div className="relative z-10 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-space-lg shadow-sm">
                <span className="material-symbols-outlined text-emerald-600 text-3xl">mark_email_read</span>
              </div>
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-code-telemetry text-[11px] font-bold uppercase text-emerald-700 tracking-wider">Email Dispatched</span>
              </div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-3">Check your inbox.</h2>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed max-w-sm">
                We sent a secure reset link to <strong className="text-on-surface">{email}</strong>. Check your inbox and follow the instructions.
              </p>
              <div className="mt-space-md p-space-sm rounded-xl bg-surface-container-low border border-surface-container font-code-telemetry text-[11px] text-on-surface-variant flex items-center gap-2 w-full justify-center">
                <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                Link expires in 15 minutes
              </div>
            </div>
          )}

          {/* Back link */}
          <div className="mt-space-lg pt-space-md border-t border-surface-container text-center">
            <Link to="/login" className="inline-flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
