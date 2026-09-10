import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { validateName, validateEmail, validatePassword, validatePasswordMatch } from "../utils/validation";

function PasswordStrength({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const barColors = ["bg-surface-container", "bg-rose-500", "bg-amber-500", "bg-purple-500", "bg-emerald-500"];
  const textColors = ["", "text-rose-600", "text-amber-600", "text-purple-600", "text-emerald-600"];

  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1.5">
        {[1,2,3,4].map(i => (
          <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i <= score ? barColors[score] : "bg-surface-container"}`} />
        ))}
      </div>
      <span className={`font-code-telemetry text-[11px] font-bold ${textColors[score]}`}>{labels[score]}</span>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [agreed, setAgreed] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");

    const nameVal = validateName(form.name);
    if (!nameVal.valid) { setError(nameVal.error); return; }

    const emailVal = validateEmail(form.email);
    if (!emailVal.valid) { setError(emailVal.error); return; }

    const passVal = validatePassword(form.password);
    if (!passVal.valid) { setError(passVal.error); return; }

    const matchVal = validatePasswordMatch(form.password, form.confirm);
    if (!matchVal.valid) { setError(matchVal.error); return; }

    if (!agreed) { setError("Please accept the terms to continue."); return; }

    setLoading(true);
    try {
      await register(nameVal.value, emailVal.value, form.password);
      navigate("/onboarding");
    } catch (err) {
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#f8fafc]">
      {/* Left panel - Branding */}
      <div className="hidden md:flex relative overflow-hidden flex-col justify-between p-12"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #7c3aed 55%, #0284c7 100%)" }}>
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-purple-400/20 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-sky-400/20 blur-[80px] pointer-events-none"></div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-xl">neurology</span>
          </div>
          <div>
            <div className="font-headline-sm text-headline-sm font-bold text-white leading-none">ResuMatch</div>
            <div className="font-code-telemetry text-[10px] text-purple-200 font-semibold uppercase tracking-wider">v4.2 Quantum</div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
            <span className="font-code-telemetry text-[11px] font-bold uppercase text-purple-300 tracking-wider">Join the AI Revolution</span>
          </div>
          <h2 className="font-display text-display-mobile font-extrabold text-white leading-tight tracking-tight mb-4">
            Start your<br />AI career<br />journey.
          </h2>
          <p className="font-body-lg text-body-lg text-white/70 mb-10 leading-relaxed">
            Get ATS analysis, neural job matching, and career growth vectors — all powered by Gemini AI.
          </p>

          <div className="flex flex-col gap-3">
            {[
              { icon: "verified", label: "Instant ATS Scoring", desc: "Score your resume in seconds" },
              { icon: "hub", label: "Smart Job Matching", desc: "AI-curated opportunities" },
              { icon: "auto_fix_high", label: "Resume Optimization", desc: "Targeted improvement suggestions" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-white text-base">{item.icon}</span>
                </div>
                <div>
                  <div className="font-body-md text-body-md font-semibold text-white">{item.label}</div>
                  <div className="font-code-telemetry text-[10px] text-white/50">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative font-code-telemetry text-[11px] text-white/30 uppercase tracking-wider">
          Your career intelligence, in one place.
        </p>
      </div>

      {/* Right panel - Form */}
      <div className="flex items-center justify-center p-8 bg-[#f8fafc] overflow-y-auto">
        <div className="w-full max-w-[440px] py-8">
          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-xl">neurology</span>
            </div>
            <div className="font-headline-sm text-headline-sm font-bold text-on-surface">ResuMatch</div>
          </div>

          <div className="mb-8">
            <h1 className="font-headline-lg text-headline-lg font-extrabold text-on-surface tracking-tight mb-2">Create account</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Start your AI-powered career intelligence journey.</p>
          </div>

          {error && (
            <div className="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-body-sm text-body-sm mb-6">
              <span className="material-symbols-outlined text-rose-500 text-base">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Full Name */}
            <div>
              <label className="block font-body-sm text-body-sm font-semibold text-on-surface mb-2">Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">person</span>
                <input
                  type="text"
                  placeholder="Alex Johnson"
                  value={form.name}
                  required
                  onChange={set("name")}
                  className="w-full bg-white border border-surface-container rounded-xl pl-10 pr-4 py-3 font-body-md text-body-md text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block font-body-sm text-body-sm font-semibold text-on-surface mb-2">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">alternate_email</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  required
                  onChange={set("email")}
                  className="w-full bg-white border border-surface-container rounded-xl pl-10 pr-4 py-3 font-body-md text-body-md text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-body-sm text-body-sm font-semibold text-on-surface mb-2">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">lock</span>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Min 8 chars, upper + number"
                  value={form.password}
                  required
                  onChange={set("password")}
                  className="w-full bg-white border border-surface-container rounded-xl pl-10 pr-12 py-3 font-body-md text-body-md text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-lg">{showPass ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block font-body-sm text-body-sm font-semibold text-on-surface mb-2">Confirm Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">lock_open</span>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={form.confirm}
                  required
                  onChange={set("confirm")}
                  className="w-full bg-white border border-surface-container rounded-xl pl-10 pr-4 py-3 font-body-md text-body-md text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                />
                {form.confirm && (
                  <span className={`material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-lg ${form.password === form.confirm ? "text-emerald-500" : "text-rose-400"}`}>
                    {form.password === form.confirm ? "check_circle" : "cancel"}
                  </span>
                )}
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="w-4 h-4 rounded accent-primary mt-0.5 shrink-0"
              />
              <span className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                I agree to the <a href="#" className="text-primary font-semibold hover:underline">Terms of Service</a> and <a href="#" className="text-primary font-semibold hover:underline">Privacy Policy</a>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-space-xs py-3 rounded-xl bg-primary text-on-primary font-headline-sm text-body-md font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><span className="material-symbols-outlined text-sm animate-spin" style={{ animationDuration: "1s" }}>progress_activity</span> Creating account...</>
              ) : (
                <><span className="material-symbols-outlined text-sm">rocket_launch</span> Create Account</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-surface-container"></div>
            <span className="font-code-telemetry text-[11px] text-outline font-semibold uppercase">or</span>
            <div className="flex-1 h-px bg-surface-container"></div>
          </div>

          {/* Google */}
          <button 
            type="button"
            onClick={async () => {
              try {
                await useAuth().loginWithProvider('google');
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
            Sign up with Google
          </button>

          <p className="text-center mt-8 font-body-md text-body-md text-on-surface-variant">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
