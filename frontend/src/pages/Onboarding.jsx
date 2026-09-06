import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resumeAPI } from "../services/api";

const skillsList = ["JavaScript", "TypeScript", "Python", "Java", "React", "Vue", "Angular", "Node.js", "Express", "SQL", "PostgreSQL", "MongoDB", "Redis", "AWS", "Docker", "Kubernetes", "Git", "GraphQL", "REST APIs", "Machine Learning", "Data Analysis", "Figma", "CSS", "HTML"];

const levels = [
  { id: "student", label: "Student", desc: "Currently enrolled in college or university", icon: "🎓" },
  { id: "entry", label: "Entry Level", desc: "0–2 years of experience", icon: "🌱" },
  { id: "mid", label: "Mid Level", desc: "2–5 years of experience", icon: "⚡" },
  { id: "experienced", label: "Experienced", desc: "5+ years of experience", icon: "🏆" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState("Software Developer");
  const [level, setLevel] = useState("entry");
  const [selectedSkills, setSelectedSkills] = useState(["React", "JavaScript", "Node.js"]);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const toggleSkill = (s) =>
    setSelectedSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const steps = ["Profile", "Skills", "Resume"];

  const handleFinish = async () => {
    if (file) {
      setUploading(true);
      setError("");
      try {
        const response = await resumeAPI.upload(file);
        const newResume = response?.data?.data;
        if (newResume?.id) {
          navigate(`/analysis-loading?id=${newResume.id}`);
        } else {
          navigate("/dashboard");
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to upload resume. You can still proceed to Dashboard.");
        setTimeout(() => navigate("/dashboard"), 1500);
      } finally {
        setUploading(false);
      }
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 20px", fontFamily: "var(--font-sans)" }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #6C5CE7, #8B7CF6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#171717" }}>ResuMatch AI</span>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 40 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: i < step ? "#35B879" : i === step ? "#6C5CE7" : "#E7E5E2",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: i <= step ? "white" : "#8A8A8A",
              fontWeight: 700, fontSize: 13,
              transition: "background 0.3s",
            }}>
              {i < step ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              ) : i + 1}
            </div>
            <span style={{ fontSize: 13, fontWeight: i === step ? 600 : 400, color: i === step ? "#171717" : "#8A8A8A", marginLeft: 8, marginRight: i < steps.length - 1 ? 0 : 0 }}>{s}</span>
            {i < steps.length - 1 && (
              <div style={{ width: 40, height: 2, background: i < step ? "#35B879" : "#E7E5E2", margin: "0 16px", transition: "background 0.3s" }} />
            )}
          </div>
        ))}
      </div>

      <div className="card animate-fade-in" style={{ width: "100%", maxWidth: 520, padding: 40 }}>
        {error && (
          <div style={{ background: "#FFE8E5", border: "1px solid #FF7A6B", borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 14, color: "#FF7A6B" }}>
            {error}
          </div>
        )}

        {step === 0 && (
          <>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#171717", marginBottom: 8 }}>Tell us about yourself</h2>
            <p style={{ fontSize: 15, color: "#666666", marginBottom: 32 }}>Help us personalize your job matches.</p>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#171717", marginBottom: 8 }}>Your role or career goal</label>
              <input className="input-field" type="text" placeholder="e.g. Software Developer, Data Analyst..." value={role} onChange={e => setRole(e.target.value)} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#171717", marginBottom: 12 }}>Experience level</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {levels.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setLevel(l.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                      borderRadius: 12, cursor: "pointer", textAlign: "left",
                      background: level === l.id ? "#EDE9FF" : "white",
                      border: level === l.id ? "2px solid #6C5CE7" : "2px solid #E7E5E2",
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{l.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: level === l.id ? "#6C5CE7" : "#171717" }}>{l.label}</div>
                      <div style={{ fontSize: 12, color: "#8A8A8A" }}>{l.desc}</div>
                    </div>
                    {level === l.id && (
                      <div style={{ marginLeft: "auto", width: 20, height: 20, borderRadius: "50%", background: "#6C5CE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#171717", marginBottom: 8 }}>Your skills</h2>
            <p style={{ fontSize: 15, color: "#666666", marginBottom: 28 }}>Select the skills you're confident in. ({selectedSkills.length} selected)</p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {skillsList.map(s => (
                <button
                  key={s}
                  onClick={() => toggleSkill(s)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    background: selectedSkills.includes(s) ? "#EDE9FF" : "white",
                    border: selectedSkills.includes(s) ? "1.5px solid #6C5CE7" : "1.5px solid #E7E5E2",
                    color: selectedSkills.includes(s) ? "#6C5CE7" : "#666666",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#171717", marginBottom: 8 }}>Upload your resume</h2>
            <p style={{ fontSize: 15, color: "#666666", marginBottom: 28 }}>We'll analyze it and find the best matches for you.</p>

            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => {
                e.preventDefault();
                setDragging(false);
                const f = e.dataTransfer.files[0];
                if (f) setFile(f);
              }}
              style={{
                border: `2px dashed ${dragging ? "#6C5CE7" : file ? "#35B879" : "#D4D2CE"}`,
                borderRadius: 16,
                padding: "40px 24px",
                textAlign: "center",
                background: dragging ? "#EDE9FF" : file ? "#D6F5E5" : "#FAFAF8",
                transition: "all 0.2s",
                cursor: "pointer",
              }}
              onClick={() => document.getElementById("onboard-file-input")?.click()}
            >
              <input id="onboard-file-input" type="file" accept=".pdf,.txt,application/pdf,text/plain" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
              <div style={{ width: 56, height: 56, borderRadius: 14, background: file ? "#35B879" : "#EDE9FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                {file ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                )}
              </div>
              {file ? (
                <>
                  <p style={{ fontWeight: 600, fontSize: 15, color: "#35B879", marginBottom: 4 }}>{file.name}</p>
                  <p style={{ fontSize: 13, color: "#8A8A8A" }}>{(file.size / 1024).toFixed(0)} KB · Click to change</p>
                </>
              ) : (
                <>
                  <p style={{ fontWeight: 600, fontSize: 15, color: "#171717", marginBottom: 6 }}>Drop your resume here</p>
                  <p style={{ fontSize: 14, color: "#8A8A8A", marginBottom: 4 }}>or browse from your computer</p>
                  <p style={{ fontSize: 12, color: "#B8B5AF" }}>PDF, TXT · Max 5MB</p>
                </>
              )}
            </div>
          </>
        )}

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 36 }}>
          <button
            className="btn-ghost"
            onClick={() => step > 0 ? setStep(s => s - 1) : navigate("/")}
            disabled={uploading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            {step === 0 ? "Back" : "Previous"}
          </button>
          <button
            className="btn-primary"
            onClick={() => step < 2 ? setStep(s => s + 1) : handleFinish()}
            disabled={uploading}
          >
            {step === 2 ? (uploading ? "Processing..." : file ? "Analyze Resume" : "Skip for now") : "Continue"}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
