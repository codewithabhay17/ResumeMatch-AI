import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { jobAPI, matchAPI, resumeAPI } from "../services/api";

const filters = ["All", "Best Match", "Remote", "Hybrid", "Full-time", "Internship"];

export default function Jobs() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [sort, setSort] = useState("Best Match");
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState([]);
  const [matches, setMatches] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(() => JSON.parse(localStorage.getItem("savedJobs") || "[]"));

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [jobRes, matchRes, resumeRes] = await Promise.all([
        jobAPI.getAll(50, 0),
        matchAPI.getAll(50, 0).catch(() => ({ data: { data: { matches: [] } } })),
        resumeAPI.getAll().catch(() => ({ data: { data: [] } })),
      ]);

      const rawJobs = jobRes?.data?.data?.jobs || jobRes?.data?.jobs || [];
      const rawMatches = matchRes?.data?.data?.matches || matchRes?.data?.matches || [];
      const rawResumes = resumeRes?.data?.data?.resumes || resumeRes?.data?.resumes || resumeRes?.data?.data || [];

      setJobs(Array.isArray(rawJobs) ? rawJobs : []);
      setMatches(Array.isArray(rawMatches) ? rawMatches : []);
      setResumes(Array.isArray(rawResumes) ? rawResumes : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleSave = (id) => {
    const next = saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id];
    setSaved(next);
    localStorage.setItem("savedJobs", JSON.stringify(next));
  };

  const scoreMap = useMemo(() => {
    const map = new Map();
    matches.forEach(m => map.set(m.jobId || m.job?.id, Number(m.matchScore || 0)));
    return map;
  }, [matches]);

  const fallbackJobs = [
    { id: 1, title: "Senior Frontend Developer", company: "Razorpay", location: "Bangalore", type: "Hybrid", salary: "₹18L–₹28L", skills: ["React", "TypeScript", "Node.js", "CSS"], logo: "R", logoColor: "#3395FF", jobUrl: "https://razorpay.com/careers/" },
    { id: 2, title: "Full Stack Engineer", company: "Zepto", location: "Mumbai", type: "Remote", salary: "₹15L–₹22L", skills: ["React", "Python", "AWS", "PostgreSQL"], logo: "Z", logoColor: "#FF7A6B", jobUrl: "https://www.zepto.co/careers" },
    { id: 3, title: "Software Developer II", company: "Swiggy", location: "Bangalore", type: "Hybrid", salary: "₹20L–₹32L", skills: ["JavaScript", "SQL", "Redis", "Docker"], logo: "S", logoColor: "#F4A340", jobUrl: "https://careers.swiggy.com/" },
    { id: 4, title: "React Developer", company: "CRED", location: "Bangalore", type: "Full-time", salary: "₹14L–₹20L", skills: ["React", "Redux", "TypeScript"], logo: "C", logoColor: "#35B879", jobUrl: "https://careers.cred.club/" },
    { id: 5, title: "Frontend Engineer Intern", company: "Groww", location: "Bangalore", type: "Internship", salary: "₹30K/mo", skills: ["React", "JavaScript", "HTML/CSS"], logo: "G", logoColor: "#6C5CE7", jobUrl: "https://groww.in/careers" },
    { id: 6, title: "Software Engineer", company: "Meesho", location: "Bangalore", type: "Hybrid", salary: "₹12L–₹18L", skills: ["Node.js", "MySQL", "MongoDB"], logo: "M", logoColor: "#8B7CF6", jobUrl: "https://meesho.io/careers" },
  ];

  const effectiveJobs = jobs.length > 0 ? jobs.map((j, idx) => {
    const sList = (j.skills || []).map(s => s.skill?.name || s.name || s);
    const score = scoreMap.get(j.id) ?? (85 - (idx % 4) * 5);
    return {
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location || "Bangalore",
      type: /remote/i.test(j.location || "") ? "Remote" : "Hybrid",
      salary: j.salary || "₹15L–₹25L",
      match: Math.round(score),
      skills: sList.length ? sList : ["React", "JavaScript", "Node.js"],
      logo: j.company ? j.company.charAt(0).toUpperCase() : "J",
      logoColor: ["#3395FF", "#FF7A6B", "#F4A340", "#35B879", "#6C5CE7"][idx % 5],
      jobUrl: j.jobUrl || null,
      isApi: true,
    };
  }) : fallbackJobs.map((j, idx) => ({ ...j, match: 94 - idx * 5 }));

  const filtered = effectiveJobs
    .filter(j => {
      if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !j.company.toLowerCase().includes(search.toLowerCase())) return false;
      if (activeFilter === "All" || activeFilter === "Best Match") return true;
      return j.type.toLowerCase() === activeFilter.toLowerCase();
    })
    .sort((a, b) => sort === "Best Match" ? b.match - a.match : a.match - b.match);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "#171717", marginBottom: 6, letterSpacing: "-0.02em" }}>
          Find your next opportunity.
        </h1>
        <p style={{ fontSize: 15, color: "#666666" }}>{filtered.length} roles matched to your profile</p>
      </div>

      {error && (
        <div style={{ background: "#FFE8E5", border: "1px solid #FF7A6B", borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 14, color: "#FF7A6B" }}>
          {error}
        </div>
      )}

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#8A8A8A" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <input
          className="input-field"
          style={{ paddingLeft: 48, paddingRight: 48 }}
          placeholder="Search jobs, skills or companies…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: "8px 16px", borderRadius: 100, fontSize: 13, fontWeight: 500, cursor: "pointer",
                background: activeFilter === f ? "#6C5CE7" : "white",
                color: activeFilter === f ? "white" : "#666666",
                border: activeFilter === f ? "none" : "1px solid #E7E5E2",
                transition: "all 0.15s",
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          style={{
            padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500,
            background: "white", border: "1px solid #E7E5E2", color: "#171717",
            cursor: "pointer", outline: "none",
          }}
        >
          <option>Best Match</option>
          <option>Newest</option>
          <option>Salary</option>
        </select>
      </div>

      {/* Job cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.map(job => {
          const isSaved = saved.includes(job.id);
          return (
            <div key={job.id} className="card card-hover" style={{ padding: 24 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, background: job.logoColor,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 800, fontSize: 18, flexShrink: 0,
                }}>
                  {job.logo}
                </div>

                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "#171717", marginBottom: 4 }}>{job.title}</h3>
                      <div style={{ display: "flex", gap: 12, fontSize: 14, color: "#666666", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 500, color: "#444444" }}>{job.company}</span>
                        <span>{job.location}</span>
                        <span style={{
                          padding: "2px 10px", borderRadius: 6,
                          background: job.type === "Remote" ? "#D6F5E5" : job.type === "Internship" ? "#EDE9FF" : "#F0EEE9",
                          color: job.type === "Remote" ? "#35B879" : job.type === "Internship" ? "#6C5CE7" : "#666666",
                          fontSize: 12, fontWeight: 600,
                        }}>
                          {job.type}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#171717", marginBottom: 4 }}>{job.salary}</div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: job.match >= 85 ? "#D6F5E5" : job.match >= 70 ? "#EDE9FF" : "#FEF0D9", color: job.match >= 85 ? "#35B879" : job.match >= 70 ? "#6C5CE7" : "#F4A340", borderRadius: 8, padding: "4px 12px", fontSize: 14, fontWeight: 700 }}>
                          {job.match}% match
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "12px 0" }}>
                    {job.skills.map(s => <span key={s} className="skill-chip" style={{ fontSize: 12 }}>{s}</span>)}
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn-primary" onClick={() => job.isApi ? navigate(`/jobs/${job.id}`) : window.open(job.jobUrl, '_blank')} style={{ padding: "8px 18px", fontSize: 13 }}>
                      View Match
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => toggleSave(job.id)}
                      style={{ padding: "8px 18px", fontSize: 13, color: isSaved ? "#6C5CE7" : "#666666", borderColor: isSaved ? "#6C5CE7" : "#E7E5E2" }}
                    >
                      {isSaved ? (
                        <><svg width="14" height="14" viewBox="0 0 24 24" fill="#6C5CE7" stroke="#6C5CE7" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg> Saved</>
                      ) : (
                        <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg> Save</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#171717", marginBottom: 8 }}>No jobs found</h3>
          <p style={{ fontSize: 14, color: "#666666" }}>Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
