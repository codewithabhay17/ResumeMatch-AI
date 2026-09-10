import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PasswordStrength({ password }) {
  const score = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  const colors = ["#E7E5E2", "#FF7A6B", "#F4A340", "#8B7CF6", "#35B879"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  if (!password) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= score ? colors[score] : "#E7E5E2", transition: "background 0.3s" }} />
        ))}
      </div>
      <span style={{ fontSize: 12, color: colors[score], fontWeight: 600 }}>{labels[score]}</span>
    </div>
  );
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password && password === confirm) {
      try {
        await useAuth().updatePassword(password);
        setDone(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F5", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "var(--font-sans)" }}>
      <div className="card" style={{ width: "100%", maxWidth: 440, padding: 48 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "#EDE9FF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>

        {!done ? (
          <>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "#171717", marginBottom: 10, letterSpacing: "-0.02em" }}>
              Create a new password
            </h1>
            <p style={{ fontSize: 15, color: "#666666", marginBottom: 32 }}>Choose a strong password for your account.</p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#171717", marginBottom: 8 }}>New password</label>
                <input className="input-field" type="password" placeholder="Create a strong password" value={password} onChange={e => setPassword(e.target.value)} required />
                <PasswordStrength password={password} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#171717", marginBottom: 8 }}>Confirm password</label>
                <input className="input-field" type="password" placeholder="Confirm your password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
                {confirm && password !== confirm && (
                  <p style={{ fontSize: 12, color: "#FF7A6B", marginTop: 6 }}>Passwords don't match.</p>
                )}
              </div>

              <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: 16 }}>
                Reset Password
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#D6F5E5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#35B879" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#171717", marginBottom: 12 }}>
              Password updated.
            </h2>
            <p style={{ fontSize: 15, color: "#666666", lineHeight: 1.65, marginBottom: 32 }}>
              Your password has been updated successfully. Sign in with your new password.
            </p>
            <button className="btn-primary" onClick={() => navigate("/login")} style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: 16 }}>
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
