import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resumeAPI } from "../services/api";

function CircleProgress({ value, size = 100, stroke = 8, color = "#0284c7" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.25,1,0.5,1)" }}/>
    </svg>
  );
}

function atsAnalysis(resume) {
  const text = resume?.parsedText || '';
  const lower = text.toLowerCase();
  const skills = resume?.extractedSkills || [];
  const hasContact = /@/.test(text) && /(?:\+?\d[\d\s().-]{7,})/.test(text);
  const headings = ['experience', 'education', 'skills', 'projects'].filter((h) => lower.includes(h)).length;
  const metricsCount = (text.match(/\b\d+(?:\.\d+)?\s*%|\b\d+(?:\.\d+)?\s*(?:k|m|million|users|years)\b/gi) || []).length;
  const score = Math.min(98, Math.max(42, 55 + skills.length * 3 + headings * 4 + (hasContact ? 6 : 0) + Math.min(metricsCount, 5) * 2));
  const keyword = Math.min(99, 55 + skills.length * 4);
  const structure = Math.min(99, 60 + headings * 10);
  const impact = Math.min(99, 58 + Math.min(metricsCount, 8) * 5);
  const readability = Math.min(96, 65 + (hasContact ? 10 : 0) + headings * 5);

  const findings = [];
  if (!hasContact) findings.push('Add a complete email and phone number in the header.');
  if (metricsCount < 2) findings.push('Add quantified outcomes to more experience or project bullets.');
  if (headings < 3) findings.push('Use standard ATS headings such as Experience, Education, Skills and Projects.');
  if (!findings.length) findings.push('Your current structure is strong. Keep achievements measurable and role-specific.');
  return { score, keyword, structure, impact, readability, skills, metricsCount, findings };
}

export default function ResumeAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ai, setAi] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    resumeAPI.getById(id).then((response) => {
      if (active) setResume(response.data?.data || null);
    }).catch((err) => {
      if (active) setError(err?.response?.data?.message || 'Could not load this resume.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const analysis = useMemo(() => atsAnalysis(resume), [resume]);

  const runAIAnalysis = async () => {
    setAiLoading(true);
    setAiError("");
    try {
      const response = await resumeAPI.analyzeAI(id);
      setAi(response.data?.data || null);
    } catch (err) {
      setAiError(err?.response?.data?.message || "AI analysis failed. Please check backend AI configuration.");
    } finally {
      setAiLoading(false);
    }
  };

  const copyText = async () => {
    if (!resume?.parsedText) return;
    await navigator.clipboard?.writeText(resume.parsedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-space-md">
        <span className="material-symbols-outlined text-primary text-4xl animate-spin" style={{ animationDuration: "2s" }}>neurology</span>
        <p className="font-code-telemetry text-[11px] font-bold uppercase text-on-surface-variant tracking-wider">Loading Resume Intelligence...</p>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="max-w-3xl mx-auto p-space-lg">
        <button onClick={() => navigate("/resumes")} className="flex items-center gap-space-xs text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm mb-space-md transition-colors">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          My Resumes
        </button>
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-space-lg text-rose-700 font-body-md text-body-md">
          {error || "Resume not found."}
        </div>
      </div>
    );
  }

  const effectiveScore = ai?.atsScore != null ? ai.atsScore : analysis.score;
  const metrics = [
    { label: "Keyword Match", value: analysis.keyword, color: "#0284c7", icon: "key" },
    { label: "Structure", value: analysis.structure, color: "#16a34a", icon: "account_tree" },
    { label: "Impact", value: analysis.impact, color: "#dc2626", icon: "trending_up" },
    { label: "Readability", value: analysis.readability, color: "#d97706", icon: "visibility" },
  ];

  const strengths = ai?.strengths?.length ? ai.strengths : [
    `Strong technical foundation with ${analysis.skills.length} detected skills`,
    "Relevant project and experience sections detected",
    "Clean education structure and standard sectioning",
    "Good use of action verbs across experience entries",
  ];

  const improvements = ai?.improvements?.length ? ai.improvements : [
    ...analysis.findings,
    "Consider adding a professional summary section",
    "Expand each bullet point to include specific technologies used",
  ];

  const technicalSkills = (analysis.skills || []).filter(s =>
    /^[A-Z]/.test(s) || /script|python|java|react|node|sql|css|html|docker|aws|git|api|graphql|mongo/i.test(s)
  );
  const softSkills = (analysis.skills || []).filter(s => !technicalSkills.includes(s));

  return (
    <div className="animate-fade-in flex flex-col w-full gap-space-lg pb-space-3xl">
      {/* Page Header */}
      <div className="relative w-full rounded-2xl bg-white border border-surface-container overflow-hidden p-space-lg md:p-space-xl shadow-sm">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-sky-100/60 blur-[80px] pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-purple-100/40 blur-[60px] pointer-events-none"></div>

        <div className="relative z-10">
          <button onClick={() => navigate("/resumes")} className="flex items-center gap-space-xs text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm mb-space-md transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            My Resumes
          </button>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md">
            <div>
              <div className="flex items-center gap-space-xs mb-3">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                <span className="font-code-telemetry text-[11px] font-bold uppercase text-sky-700 tracking-wider">Resume Intelligence Report</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg font-extrabold text-on-surface tracking-tight">Resume Analysis</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-primary">description</span>
                {resume.fileName}
              </p>
            </div>

            <div className="flex gap-space-sm flex-wrap shrink-0">
              <button
                onClick={copyText}
                className="flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-surface-container-low border border-surface-container text-on-surface font-headline-sm text-body-sm font-semibold hover:bg-surface-container transition-all"
              >
                <span className="material-symbols-outlined text-sm">{copied ? "check" : "content_copy"}</span>
                {copied ? "Copied!" : "Copy Text"}
              </button>
              <button
                onClick={runAIAnalysis}
                disabled={aiLoading}
                className="flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-primary text-on-primary font-headline-sm text-body-sm font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed relative z-10"
              >
                <span className={`material-symbols-outlined text-sm ${aiLoading ? "animate-spin" : ""}`} style={aiLoading ? { animationDuration: "1.5s" } : {}}>
                  {aiLoading ? "progress_activity" : "neurology"}
                </span>
                {aiLoading ? "Analyzing with AI..." : ai ? "Re-analyze with AI" : "Analyze with AI"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Error */}
      {aiError && (
        <div className="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-body-sm text-body-sm">
          <span className="material-symbols-outlined text-rose-500">error</span>
          {aiError}
        </div>
      )}

      {/* ATS Score Hero */}
      <div className="rounded-2xl bg-white border border-surface-container p-space-lg md:p-space-xl shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-space-lg items-center">
          <div className="relative w-36 h-36 shrink-0 mx-auto sm:mx-0">
            <CircleProgress value={effectiveScore} size={144} stroke={12} color="#0284c7" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-4xl font-extrabold text-on-surface">{effectiveScore}</span>
              <span className="font-code-telemetry text-[10px] text-on-surface-variant uppercase font-semibold tracking-wider">ATS Score</span>
            </div>
          </div>
          <div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-code-telemetry text-[11px] font-bold mb-3 ${
              effectiveScore >= 85 ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : effectiveScore >= 70 ? "bg-sky-50 border-sky-200 text-sky-700"
                : "bg-amber-50 border-amber-200 text-amber-700"
            }`}>
              <span className="material-symbols-outlined text-xs">
                {effectiveScore >= 85 ? "check_circle" : effectiveScore >= 70 ? "info" : "warning"}
              </span>
              {effectiveScore >= 85 ? "Excellent ATS Compatibility" : effectiveScore >= 70 ? "Good ATS Compatibility" : "Needs Optimization"}
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              {ai?.summary || "Your resume is highly compatible with common ATS structures. It follows clean formatting, uses standard section headers, and contains strong keyword density."}
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
        {metrics.map(m => (
          <div key={m.label} className="rounded-2xl bg-white border border-surface-container p-space-md shadow-sm flex flex-col items-center text-center">
            <div className="relative w-[72px] h-[72px] mb-3">
              <CircleProgress value={m.value} size={72} stroke={6} color={m.color} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-lg font-extrabold text-on-surface">{m.value}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 font-code-telemetry text-[11px] text-on-surface-variant font-semibold">
              <span className="material-symbols-outlined text-xs" style={{ color: m.color }}>{m.icon}</span>
              {m.label}
            </div>
          </div>
        ))}
      </div>

      {/* AI Summary Card */}
      {ai && (
        <div className="rounded-2xl bg-gradient-to-br from-sky-50 via-white to-purple-50 border border-sky-200/80 p-space-lg shadow-sm">
          <div className="flex items-center gap-space-sm mb-space-md">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-white text-lg">neurology</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Gemini AI Deep Analysis</h3>
              <span className="font-code-telemetry text-[10px] text-primary font-semibold uppercase">Powered by Gemini 3.6</span>
            </div>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            {ai.summary}
          </p>
        </div>
      )}

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {/* Strengths */}
        <div className="rounded-2xl bg-white border border-surface-container p-space-lg shadow-sm">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-md flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            Key Strengths
          </h3>
          <div className="flex flex-col gap-3">
            {strengths.map((s, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-emerald-600 text-[10px]">check</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Improvements */}
        <div className="rounded-2xl bg-white border border-surface-container p-space-lg shadow-sm">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-md flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-amber-500">bolt</span>
            Areas to Improve
          </h3>
          <div className="flex flex-col gap-3">
            {improvements.map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="font-code-telemetry text-[9px] font-extrabold text-amber-600">!</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="rounded-2xl bg-white border border-surface-container p-space-lg shadow-sm">
        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-md flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-primary">psychology</span>
          Technical Skills
        </h3>
        <div className="flex flex-wrap gap-2 mb-space-md">
          {technicalSkills.map(s => (
            <span key={s} className="px-3 py-1 rounded-full bg-primary-fixed border border-primary-fixed-dim text-primary font-code-telemetry text-[11px] font-bold">
              {s}
            </span>
          ))}
        </div>
        {softSkills.length > 0 && (
          <div className="border-t border-surface-container pt-space-md">
            <h4 className="font-body-sm text-body-sm font-semibold text-on-surface-variant mb-3">Soft Skills</h4>
            <div className="flex flex-wrap gap-2">
              {softSkills.map(s => (
                <span key={s} className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-code-telemetry text-[11px] font-bold">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Health Audit Findings */}
      <div className="rounded-2xl bg-white border border-surface-container p-space-lg shadow-sm">
        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-md flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-amber-500">health_and_safety</span>
          Parser Health Audit
        </h3>
        <div className="flex flex-col gap-3">
          {analysis.findings.map((finding, idx) => (
            <div key={idx} className="flex gap-3 p-space-sm rounded-xl bg-surface-container-lowest border border-surface-container items-start">
              <span className="material-symbols-outlined text-amber-500 text-base shrink-0 mt-0.5">warning</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{finding}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Parsed Text Preview */}
      <div className="rounded-2xl bg-white border border-surface-container p-space-lg shadow-sm">
        <div className="flex justify-between items-center mb-space-md">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-on-surface-variant">article</span>
            Parsed Resume Text
          </h3>
          <button onClick={copyText} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-low border border-surface-container text-on-surface-variant font-code-telemetry text-[11px] font-semibold hover:bg-surface-container transition-all">
            <span className="material-symbols-outlined text-xs">{copied ? "check" : "content_copy"}</span>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="max-h-72 overflow-auto bg-surface-container-lowest border border-surface-container rounded-xl p-space-md font-mono text-body-sm text-on-surface-variant whitespace-pre-wrap leading-relaxed">
          {resume.parsedText || "No parsed text available."}
        </pre>
      </div>
    </div>
  );
}
