import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { validateEmail, validatePassword } from "../utils/validation";

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithProvider } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");

    const emailVal = validateEmail(email);
    if (!emailVal.valid) { setError(emailVal.error); return; }

    const passVal = validatePassword(password);
    if (!passVal.valid) { setError(passVal.error); return; }

    setLoading(true);
    try {
      await login(emailVal.value, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#f8fafc]">
      {/* Left panel - Branding */}
      <div className="hidden md:flex relative overflow-hidden flex-col justify-between p-12"
        style={{ background: "linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #7c3aed 100%)" }}>
        {/* Ambient orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-sky-400/20 blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-32 right-0 w-80 h-80 rounded-full bg-purple-500/25 blur-[80px] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-xl">neurology</span>
          </div>
          <div>
            <div className="font-headline-sm text-headline-sm font-bold text-white leading-none">ResuMatch</div>
            <div className="font-code-telemetry text-[10px] text-sky-200 font-semibold uppercase tracking-wider">v4.2 Quantum</div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-code-telemetry text-[11px] font-bold uppercase text-emerald-300 tracking-wider">AI Engine Online</span>
          </div>
          <h2 className="font-display text-display-mobile font-extrabold text-white leading-tight tracking-tight mb-4">
            Welcome<br />back.
          </h2>
          <p className="font-body-lg text-body-lg text-white/70 mb-10 leading-relaxed">
            Continue building a stronger career profile with neural-powered intelligence.
          </p>

          {/* Telemetry stat cards */}
          <div className="flex flex-col gap-3">
            {[
              { icon: "verified", label: "ATS Score", value: "94 / 100", badge: "Tier 1 Elite", color: "text-emerald-300" },
              { icon: "hub", label: "Job Matches", value: "48 opportunities", badge: "+12 Today", color: "text-sky-300" },
              { icon: "psychology", label: "Skills Detected", value: "16 technical skills", badge: "Trending", color: "text-purple-300" },
            ].map((item) => (
              <div key={item.label} className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3 flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <span className={`material-symbols-outlined text-lg ${item.color}`}>{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-code-telemetry text-[10px] text-white/50 uppercase">{item.label}</div>
                  <div className="font-headline-sm text-body-md font-semibold text-white">{item.value}</div>
                </div>
                <span className={`font-code-telemetry text-[10px] font-bold ${item.color}`}>{item.badge}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative font-code-telemetry text-[11px] text-white/30 uppercase tracking-wider">
          Your career intelligence, in one place.
        </p>
      </div>

      {/* Right panel - Form */}
      <div className="flex items-center justify-center p-8 bg-[#f8fafc]">
        <div className="w-full max-w-[440px]">
          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-xl">neurology</span>
            </div>
            <div>
              <div className="font-headline-sm text-headline-sm font-bold text-on-surface leading-none">ResuMatch</div>
              <div className="font-code-telemetry text-[10px] text-primary font-semibold uppercase tracking-wider">v4.2 Quantum</div>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="font-headline-lg text-headline-lg font-extrabold text-on-surface tracking-tight mb-2">Sign in</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Enter your credentials to access your intelligence dashboard.</p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-body-sm text-body-sm mb-6">
              <span className="material-symbols-outlined text-rose-500 text-base">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
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
                  className="w-full bg-white border border-surface-container rounded-xl pl-10 pr-4 py-3 font-body-md text-body-md text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-body-sm text-body-sm font-semibold text-on-surface">Password</label>
                <Link to="/forgot-password" className="font-code-telemetry text-[11px] text-primary font-semibold hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">lock</span>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  required
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white border border-surface-container rounded-xl pl-10 pr-12 py-3 font-body-md text-body-md text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-lg">{showPass ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded accent-primary"
              />
              <span className="font-body-sm text-body-sm text-on-surface-variant">Remember me for 30 days</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-space-xs py-3 rounded-xl bg-primary text-on-primary font-headline-sm text-body-md font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><span className="material-symbols-outlined text-sm animate-spin" style={{ animationDuration: "1s" }}>progress_activity</span> Signing in...</>
              ) : (
                <><span className="material-symbols-outlined text-sm">login</span> Sign In</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-surface-container"></div>
            <span className="font-code-telemetry text-[11px] text-outline font-semibold uppercase">or continue with</span>
            <div className="flex-1 h-px bg-surface-container"></div>
          </div>

          {/* Google */}
          <button 
            type="button"
            onClick={async () => {
              try {
                await loginWithProvider('google');
              } catch (err) {
                setError(err.message);
              }
            }}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white border border-surface-container text-on-surface font-headline-sm text-body-md font-semibold hover:bg-surface-container-low transition-all shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center mt-8 font-body-md text-body-md text-on-surface-variant">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
