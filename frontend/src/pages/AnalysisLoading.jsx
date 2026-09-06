import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resumeAPI } from "../services/api";

const stages = [
  { label: "Reading resume structure", duration: 1500 },
  { label: "Extracting skills and keywords", duration: 2500 },
  { label: "Evaluating ATS compatibility", duration: 3000 },
  { label: "Generating AI recommendations", duration: 2000 },
];

export default function AnalysisLoading() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get("id");
  const [currentStage, setCurrentStage] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let stage = 0;
    const interval = setInterval(() => {
      stage++;
      if (stage < stages.length) {
        setCurrentStage(stage);
      } else {
        clearInterval(interval);
      }
    }, 2000);

    // Run real AI analysis in the background
    if (resumeId) {
      resumeAPI.analyzeAI(resumeId)
        .then(() => {
          setDone(true);
        })
        .catch((err) => {
          console.warn("AI Analysis background error:", err);
          // Even if Gemini fails, let user proceed to the review page where heuristic score is displayed
          setDone(true);
        });
    } else {
      // If no ID passed, check existing resumes or redirect to /resumes
      resumeAPI.getAll().then((res) => {
        const list = res.data?.data?.resumes || res.data?.data || [];
        if (list.length > 0) {
          navigate(`/resumes/${list[0].id}`, { replace: true });
        } else {
          setDone(true);
        }
      }).catch(() => {
        setDone(true);
      });
    }

    return () => clearInterval(interval);
  }, [resumeId, navigate]);

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => {
        if (resumeId) {
          navigate(`/resumes/${resumeId}`, { replace: true });
        } else {
          navigate("/resumes", { replace: true });
        }
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [done, resumeId, navigate]);

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, fontFamily: "var(--font-sans)" }}>
      {/* Neural visualization */}
      <div style={{ position: "relative", width: 180, height: 180, marginBottom: 48 }}>
        {/* Outer pulse rings */}
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `${2/i}px solid rgba(108,92,231,${0.15/i})`,
            animation: `pulse-ring ${1.5 + i * 0.5}s ease-in-out ${i * 0.3}s infinite`,
          }} />
        ))}
        {/* Center orb */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 80, height: 80,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6C5CE7, #8B7CF6)",
          boxShadow: "0 16px 48px rgba(108,92,231,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="animate-spin-slow">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
          </svg>
        </div>
        {/* Orbiting dots */}
        {[0, 90, 180, 270].map((deg, i) => (
          <div key={i} style={{
            position: "absolute",
            top: "50%", left: "50%",
            width: 10, height: 10,
            borderRadius: "50%",
            background: ["#6C5CE7", "#35B879", "#FF7A6B", "#F4A340"][i],
            transform: `rotate(${deg}deg) translateX(70px) translateY(-50%)`,
            animation: `spin-slow ${2 + i * 0.3}s linear infinite`,
            boxShadow: `0 4px 12px ${["rgba(108,92,231,0.4)", "rgba(53,184,121,0.4)", "rgba(255,122,107,0.4)", "rgba(244,163,64,0.4)"][i]}`,
          }} />
        ))}
      </div>

      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "#171717", marginBottom: 10, letterSpacing: "-0.02em" }}>
          Analyzing your resume…
        </h1>
        <p style={{ fontSize: 16, color: "#666666", maxWidth: 440 }}>
          Our AI is reviewing structure, skills, keywords and measurable impact.
        </p>
      </div>

      {/* Stage list */}
      <div className="card" style={{ width: "100%", maxWidth: 400, padding: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {stages.map((stage, i) => {
            const isCompleted = i < currentStage || done;
            const isCurrent = i === currentStage && !done;
            return (
              <div key={stage.label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: isCompleted ? "#35B879" : isCurrent ? "#EDE9FF" : "#F0EEE9",
                  border: isCurrent ? "2px solid #6C5CE7" : "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.3s",
                }}>
                  {isCompleted ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : isCurrent ? (
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6C5CE7", animation: "pulse-ring 1.5s ease-in-out infinite" }} />
                  ) : (
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#D1CFC9" }} />
                  )}
                </div>
                <span style={{
                  fontSize: 14,
                  fontWeight: isCurrent ? 600 : 400,
                  color: isCompleted ? "#35B879" : isCurrent ? "#171717" : "#8A8A8A",
                  transition: "color 0.3s",
                }}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>

        {done && (
          <div style={{ marginTop: 24, padding: "14px 18px", background: "#D6F5E5", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#35B879", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#35B879" }}>Analysis complete! Redirecting…</span>
          </div>
        )}
      </div>
    </div>
  );
}
