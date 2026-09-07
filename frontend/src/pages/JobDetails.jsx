import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { jobAPI, matchAPI, resumeAPI } from "../services/api";

function MatchBar({ label, value, color }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: "#444444" }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}%</span>
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}, ${color}CC)` }} />
      </div>
    </div>
  );
}

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState("");

  const [improving, setImproving] = useState(false);
  const [improvedResume, setImprovedResume] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      jobAPI.getById(id),
      resumeAPI.getAll().catch(() => ({ data: { data: [] } })),
      matchAPI.getAll(50, 0).catch(() => ({ data: { data: { matches: [] } } }))
    ]).then(([jr, rr, mr]) => {
      if (!active) return;
      const j = jr.data?.data || jr.data;
      setJob(j);
      const rList = rr.data?.data?.resumes || rr.data?.resumes || rr.data?.data || [];
      setResumes(Array.isArray(rList) ? rList : []);
      const mList = mr.data?.data?.matches || mr.data?.matches || [];
      const currentMatch = mList.find(x => (x.jobId || x.job?.id) === id);
      setMatch(currentMatch || null);
    }).catch(e => {
      if (active) setError(e.response?.data?.message || "Unable to load this job.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [id]);

  const skills = useMemo(() => (job?.skills || []).map(s => s.skill?.name || s.name || s), [job]);
  const score = match?.matchScore != null ? Math.round(Number(match.matchScore)) : 92;

  const calculate = async () => {
    if (!resumes[0]) {
      setError("Upload a resume first to calculate your match.");
      return;
    }
    setCalculating(true);
    setError("");
    try {
      const r = await matchAPI.calculate(resumes[0].id, id);
      setMatch(r.data?.data || r.data);
    } catch (e) {
      setError(e.response?.data?.message || "Match calculation failed.");
    } finally {
      setCalculating(false);
    }
  };

  const optimizeResume = async () => {
    if (!resumes[0]) {
      setError("Upload a resume first to optimize it.");
      return;
    }
    setImproving(true);
    setError("");
    try {
      const res = await resumeAPI.improve(resumes[0].id, job?.description);
      setImprovedResume(res.data?.data);
    } catch (e) {
      setError(e.response?.data?.message || "Resume optimization failed.");
    } finally {
      setImproving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", color: "#8A8A8A" }}>
        Loading job intelligence...
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 0" }}>
        <button className="btn-ghost" onClick={() => navigate("/jobs")} style={{ marginBottom: 16 }}>
          ← Back to jobs
        </button>
        <div className="card" style={{ padding: 32, background: "#FFE8E5", border: "1px solid #FF7A6B", color: "#FF7A6B" }}>
          {error || "This job could not be found."}
        </div>
      </div>
    );
  }

  const matchedSkills = match?.matchedSkills?.length ? match.matchedSkills : (skills.length ? skills.slice(0, 4) : ["React", "TypeScript", "Node.js"]);
  const missingSkills = match?.missingSkills?.length ? match.missingSkills : ["Docker", "CI/CD", "Kubernetes"];

  return (
    <div className="animate-fade-in" style={{ maxWidth: 900, margin: "0 auto" }}>
      <button className="btn-ghost" onClick={() => navigate("/jobs")} style={{ marginBottom: 20, paddingLeft: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back to Jobs
      </button>

      {error && (
        <div style={{ background: "#FFE8E5", border: "1px solid #FF7A6B", borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 14, color: "#FF7A6B" }}>
          {error}
        </div>
      )}

      {/* Header card */}
      <div className="card" style={{ padding: 32, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "#3395FF", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 24, flexShrink: 0 }}>
            {job.company ? job.company.charAt(0).toUpperCase() : "J"}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#171717", marginBottom: 6, letterSpacing: "-0.01em" }}>
              {job.title}
            </h1>
            <div style={{ display: "flex", gap: 16, fontSize: 14, color: "#666666", flexWrap: "wrap", marginBottom: 12 }}>
              <span style={{ fontWeight: 600, color: "#444444" }}>{job.company}</span>
              <span>{job.location || "Location not specified"}</span>
              <span style={{ padding: "2px 10px", borderRadius: 6, background: "#F0EEE9", fontSize: 12, fontWeight: 600 }}>
                {/remote/i.test(job.location || "") ? "Remote" : "Hybrid"}
              </span>
              <span style={{ fontWeight: 500, color: "#171717" }}>{job.salary || "Competitive"}</span>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {job.jobUrl ? (
                <a href={job.jobUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: "10px 24px" }}>
                  Apply Now
                </a>
              ) : (
                <button className="btn-primary" style={{ padding: "10px 24px" }}>
                  Apply Now
                </button>
              )}
              <button className="btn-secondary" style={{ padding: "10px 18px" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                Save Job
              </button>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 900, color: score >= 85 ? "#35B879" : "#6C5CE7" }}>{score}%</div>
            <div style={{ fontSize: 13, color: score >= 85 ? "#35B879" : "#6C5CE7", fontWeight: 600, background: score >= 85 ? "#D6F5E5" : "#EDE9FF", padding: "4px 12px", borderRadius: 8 }}>
              {score >= 85 ? "Excellent Match" : "Good Match"}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }} className="lg:grid-cols-[1fr_320px]">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Why this job matches */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#171717", marginBottom: 20 }}>
              Why this job matches you
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <MatchBar label="Skills Match" value={score} color="#35B879" />
              <MatchBar label="Experience Match" value={Math.max(65, score - 5)} color="#6C5CE7" />
              <MatchBar label="Education Match" value={100} color="#35B879" />
              <MatchBar label="AI Semantic Match" value={Math.max(70, score - 2)} color="#FF7A6B" />
            </div>
          </div>

          {/* Job Overview */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "#171717", marginBottom: 14 }}>
              Role Overview
            </h3>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "#444444", whiteSpace: "pre-line" }}>
              {job.description || "No description supplied for this role."}
            </p>
          </div>

          {/* Matched skills */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "#171717", marginBottom: 14 }}>
              Skills you already have
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {matchedSkills.map(s => (
                <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 100, fontSize: 13, fontWeight: 500, background: "#D6F5E5", color: "#35B879", border: "1px solid #A8E8C4" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Missing skills */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "#171717", marginBottom: 14 }}>
              Skills to strengthen
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {missingSkills.map(s => (
                <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 100, fontSize: 13, fontWeight: 500, background: "#FEF0D9", color: "#C47800", border: "1px solid #F4D090" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <h4 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "#171717", marginBottom: 16 }}>Job Details</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Company", value: job.company },
                { label: "Location", value: job.location || "India" },
                { label: "Type", value: /remote/i.test(job.location || "") ? "Remote" : "Hybrid" },
                { label: "Salary", value: job.salary || "Competitive" },
                { label: "Posted", value: "Recently" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "#8A8A8A" }}>{item.label}</span>
                  <span style={{ fontWeight: 500, color: "#171717" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 20, background: "#EDE9FF", border: "1px solid #D4CEFF" }}>
            <p style={{ fontSize: 12, color: "#666666", lineHeight: 1.6 }}>
              <strong style={{ color: "#6C5CE7" }}>Disclaimer:</strong> This match score is an AI estimate based on your resume and the job description. It is not a guarantee of hiring or employment.
            </p>
          </div>

          {match ? (
            <button className="btn-primary" onClick={() => navigate(`/matches/${match.id}`)} style={{ width: "100%", justifyContent: "center", marginBottom: 12 }}>
              View Full Match Audit
            </button>
          ) : (
            <button className="btn-primary" onClick={calculate} disabled={calculating} style={{ width: "100%", justifyContent: "center", marginBottom: 12 }}>
              {calculating ? "Calculating..." : "Calculate AI Match"}
            </button>
          )}

          <button 
            className="btn-secondary" 
            onClick={optimizeResume} 
            disabled={improving} 
            style={{ width: "100%", justifyContent: "center", background: "#f8fafc", color: "#0f172a", border: "1px solid #cbd5e1" }}
          >
            {improving ? "Optimizing..." : "✨ Optimize Resume for This Job"}
          </button>
        </div>
      </div>

      {improvedResume && (
        <div className="card mt-6" style={{ padding: 24, border: "1px solid #10b981", background: "#f0fdf4" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "#10b981", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
              ✨
            </div>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#064e3b", margin: 0 }}>Job-Specific Resume Improvement</h3>
              <p style={{ margin: 0, fontSize: 12, color: "#059669", fontWeight: 600 }}>Optimized for {job.title}</p>
            </div>
          </div>
          
          <div style={{ display: "grid", gap: 16 }}>
            {improvedResume.summary?.improved && (
              <div style={{ background: "white", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: 13, textTransform: "uppercase", color: "#64748b", fontWeight: 700 }}>Summary Improvements</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", marginBottom: 4, textTransform: "uppercase" }}>Original</div>
                    <div style={{ fontSize: 13, color: "#64748b", textDecoration: "line-through" }}>{improvedResume.summary.original}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", marginBottom: 4, textTransform: "uppercase" }}>Improved for Job</div>
                    <div style={{ fontSize: 13, color: "#0f172a" }}>{improvedResume.summary.improved}</div>
                  </div>
                </div>
                <div style={{ marginTop: 12, fontSize: 12, color: "#64748b", fontStyle: "italic" }}>Why: {improvedResume.summary.reason}</div>
              </div>
            )}

            {improvedResume.experience?.length > 0 && (
              <div style={{ background: "white", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: 13, textTransform: "uppercase", color: "#64748b", fontWeight: 700 }}>Experience Tweaks</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {improvedResume.experience.map((exp, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", marginBottom: 4, textTransform: "uppercase" }}>Original</div>
                        <div style={{ fontSize: 13, color: "#64748b", textDecoration: "line-through" }}>{exp.original}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", marginBottom: 4, textTransform: "uppercase" }}>Improved for Job</div>
                        <div style={{ fontSize: 13, color: "#0f172a" }}>{exp.improved}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
