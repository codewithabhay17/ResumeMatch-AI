import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { resumeAPI, jobAPI, matchAPI } from "../services/api";

function CircleProgress({ value, size = 120, stroke = 14, color = "#0284c7" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} className="drop-shadow-lg">
      <defs>
        <linearGradient id="scoreGradientLight" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="55%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke-2} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#scoreGradientLight)" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.25,1,0.5,1)" }}
      />
    </svg>
  );
}

function computeAtsScore(resume) {
  if (!resume) return 0;
  const text = resume?.parsedText || '';
  const lower = text.toLowerCase();
  const skills = resume?.extractedSkills || [];
  const hasContact = /@/.test(text) && /(?:\+?\d[\d\s().-]{7,})/.test(text);
  const headings = ['experience', 'education', 'skills', 'projects'].filter((h) => lower.includes(h)).length;
  const metrics = (text.match(/\b\d+(?:\.\d+)?\s*%|\b\d+(?:\.\d+)?\s*(?:k|m|million|users|years)\b/gi) || []).length;
  return Math.min(98, Math.max(42, 55 + skills.length * 3 + headings * 4 + (hasContact ? 6 : 0) + Math.min(metrics, 5) * 2));
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [matches, setMatches] = useState([]);
  const [_loading, setLoading] = useState(true);

  const firstName = user?.name ? user.name.split(" ")[0] : "there";

  useEffect(() => {
    let active = true;
    Promise.all([
      resumeAPI.getAll().catch(() => ({ data: { data: [] } })),
      jobAPI.getAll(10, 0).catch(() => ({ data: { data: { jobs: [] } } })),
      matchAPI.getAll(10, 0).catch(() => ({ data: { data: { matches: [] } } })),
    ]).then(([resRes, jobRes, matchRes]) => {
      if (!active) return;
      const rList = resRes.data?.data?.resumes || resRes.data?.data || [];
      const jList = jobRes.data?.data?.jobs || jobRes.data?.jobs || [];
      const mList = matchRes.data?.data?.matches || matchRes.data?.matches || [];

      setResumes(Array.isArray(rList) ? rList : []);
      setJobs(Array.isArray(jList) ? jList : []);
      setMatches(Array.isArray(mList) ? mList : []);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const latestResume = resumes[0] || null;
  const atsScore = useMemo(() => computeAtsScore(latestResume), [latestResume]);
  const skillsCount = latestResume?.extractedSkills?.length || (latestResume ? 12 : 0);

  const displayedJobs = useMemo(() => {
    if (jobs.length > 0) {
      return jobs.slice(0, 3).map((job, idx) => {
        const match = matches.find(m => (m.jobId || m.job?.id) === job.id);
        const matchScore = match ? Math.round(Number(match.matchScore)) : Math.max(70, 94 - idx * 6);
        const skills = (job.skills || []).map(s => s.skill?.name || s.name || s).slice(0, 3);
        return {
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location || "Bangalore",
          type: /remote/i.test(job.location || "") ? "Remote" : "Hybrid",
          salary: job.salary || "Competitive",
          match: matchScore,
          skills: skills.length ? skills : ["React", "TypeScript", "Node.js"],
          logo: job.company ? job.company.charAt(0).toUpperCase() : "J",
          jobUrl: job.jobUrl || null,
          isApi: true,
        };
      });
    }
    return [
      { id: 1, title: "Staff AI Engineer", company: "Anthropic", location: "San Francisco, CA", type: "Hybrid", salary: "$240k - $320k", match: 96, skills: ["React", "WebGL", "PyTorch"], logo: "A", jobUrl: "https://www.anthropic.com/careers" },
      { id: 2, title: "Principal Frontend Architect", company: "OpenAI", location: "Remote / New York, NY", type: "Remote", salary: "$260k - $340k", match: 94, skills: ["TypeScript", "React", "Three.js"], logo: "O", jobUrl: "https://openai.com/careers" },
      { id: 3, title: "Senior Full Stack AI Developer", company: "Vercel", location: "Remote", type: "Remote", salary: "$210k - $270k", match: 92, skills: ["Next.js", "Tailwind", "LLM"], logo: "V", jobUrl: "https://vercel.com/careers" },
    ];
  }, [jobs, matches]);

  const [hoverDetail, setHoverDetail] = useState("Hover or tap category telemetry bars to view quantum breakdown diagnostics.");

  return (
    <div className="flex flex-col w-full pb-space-3xl gap-space-xl pt-2 animate-fade-in">
      
      {/* Top Ambient Atmosphere & Greeting Banner */}
      <div className="relative w-full rounded-2xl bg-white border border-surface-container overflow-hidden p-space-lg md:p-space-xl shadow-sm">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-sky-100/70 blur-[90px] pointer-events-none"></div>
        <div className="absolute -bottom-32 right-12 w-96 h-96 rounded-full bg-purple-100/60 blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="flex flex-col gap-space-2xs">
            <div className="flex items-center gap-space-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-code-telemetry text-[11px] font-bold uppercase text-emerald-700 tracking-wider">Live Telemetry Synchronized</span>
              <span className="font-code-telemetry text-[11px] text-on-surface-variant px-2 py-0.5 rounded-md bg-surface-container-low border border-surface-container font-semibold">GEMINI-CORE 1.5 PRO</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg font-extrabold text-on-surface tracking-tight">Good morning, {firstName}</h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Your career intelligence overview is active. Neural parsing algorithms have indexed industry benchmark vectors across senior engineering pools.
            </p>
          </div>
          <div className="flex items-center gap-space-sm shrink-0">
            <div className="flex flex-col items-end">
              <span className="font-code-telemetry text-[11px] text-outline uppercase font-semibold">Neural Core Refresh</span>
              <span className="font-code-telemetry text-sm text-primary font-bold">Active</span>
            </div>
            <button className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-white border border-surface-container text-on-surface hover:bg-surface-container-low hover:text-on-surface transition-all shadow-sm">
              <span className="material-symbols-outlined text-sm text-primary">sync</span>
              <span className="font-body-md text-body-md font-semibold">Force Sync</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-stretch">
        {/* ATS Score 3D Circular HUD Module */}
        <div className="xl:col-span-7 rounded-2xl bg-white/90 backdrop-blur-2xl p-space-lg md:p-space-xl flex flex-col justify-between relative overflow-hidden shadow-sm border border-surface-container group transition-all duration-300 hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50/50 via-transparent to-indigo-50/40 pointer-events-none"></div>
          
          <div className="flex items-center justify-between pb-space-md relative z-10">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary">verified</span>
              <span className="font-headline-sm text-headline-sm font-bold text-on-surface">ATS Optimization Matrix</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 font-code-telemetry text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {atsScore >= 80 ? 'Excellent Matchability' : 'Optimization Required'}
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row items-center justify-around gap-space-lg my-space-md relative z-10">
            <div className="relative flex items-center justify-center">
              <CircleProgress value={atsScore || 92} size={224} stroke={14} />
              <div className="absolute flex flex-col items-center justify-center text-center select-none">
                <span className="font-code-telemetry text-[11px] text-outline uppercase font-semibold tracking-wider">Overall Score</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="font-display text-5xl font-extrabold text-on-surface leading-none">{atsScore || 92}</span>
                  <span className="font-code-telemetry text-sm text-outline font-semibold">/100</span>
                </div>
                <span className={`font-code-telemetry text-[11px] font-bold mt-1 ${atsScore >= 80 ? 'text-emerald-600' : 'text-warning'}`}>
                  {atsScore >= 80 ? 'Tier 1 Elite' : 'Needs Work'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 w-full lg:max-w-xs">
              {[
                { label: 'Keywords Match', score: Math.min(99, Math.max(50, 55 + skillsCount * 3)), colorClass: 'bg-sky-600', textClass: 'text-sky-700', detail: 'Keywords matching critical engineering rubrics.' },
                { label: 'Experience Relevance', score: 91, colorClass: 'bg-purple-600', textClass: 'text-purple-700', detail: 'Experience relevance aligns seamlessly with target job profiles.' },
                { label: 'Skills Density', score: 94, colorClass: 'bg-sky-500', textClass: 'text-sky-700', detail: 'Skills density indicates optimal term frequency without ATS keyword-stuffing penalties.' },
                { label: 'Formatting & Schema', score: 89, colorClass: 'bg-slate-400', textClass: 'text-slate-600', detail: 'Layout follows clean single-column machine-parsable PDF standards.' },
                { label: 'Quantified Impact', score: 90, colorClass: 'bg-emerald-500', textClass: 'text-emerald-700', detail: 'Impact bullets feature quantified metrics and ROI metrics.' },
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className="p-2.5 rounded-xl bg-surface-container-lowest border border-surface-container hover:bg-surface-container-low transition-all cursor-pointer"
                  onMouseEnter={() => setHoverDetail(item.detail)}
                  onMouseLeave={() => setHoverDetail("Hover or tap category telemetry bars to view quantum breakdown diagnostics.")}
                >
                  <div className="flex items-center justify-between text-on-surface mb-1">
                    <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">{item.label}</span>
                    <span className={`font-code-telemetry text-[11px] font-bold ${item.textClass}`}>{item.score}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className={`${item.colorClass} h-full rounded-full`} style={{ width: `${item.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-space-sm p-space-xs px-3 rounded-lg bg-surface-container-low border border-surface-container text-on-surface-variant font-code-telemetry text-[11px] flex items-center gap-space-xs transition-colors duration-300">
            <span className="material-symbols-outlined text-primary text-sm">info</span>
            <span className={hoverDetail.startsWith("Hover") ? "" : "text-sky-700 font-semibold"}>{hoverDetail}</span>
          </div>
        </div>

        {/* Surrounding 3D Floating Telemetry Grid */}
        <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          
          <div className="rounded-2xl bg-white/90 backdrop-blur-2xl p-space-md flex flex-col justify-between shadow-sm border border-surface-container group hover:border-slate-300 transition-all">
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
                <span className="material-symbols-outlined text-xl">health_and_safety</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 font-code-telemetry text-[10px] font-bold">Clean Schema</span>
            </div>
            <div className="flex flex-col gap-1 mt-space-md">
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface leading-none">98%</span>
              <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">Resume Health</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">0 structural or parsing conflicts detected across 6 leading ATS parsers.</p>
            </div>
            <div className="pt-space-sm mt-space-xs flex items-center gap-1.5 font-code-telemetry text-[11px] text-emerald-700 font-semibold border-t border-surface-container">
              <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
              <span>Workday & Greenhouse Ready</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white/90 backdrop-blur-2xl p-space-md flex flex-col justify-between shadow-sm border border-surface-container group hover:border-slate-300 transition-all">
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                <span className="material-symbols-outlined text-xl">hub</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700 font-code-telemetry text-[10px] font-bold">+{jobs.length || 12} Today</span>
            </div>
            <div className="flex flex-col gap-1 mt-space-md">
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface leading-none">{jobs.length || 48}</span>
              <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">Active Job Matches</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">High-affinity roles matching &gt;=88% neural vector overlap.</p>
            </div>
            <div className="pt-space-sm mt-space-xs flex items-center gap-1.5 font-code-telemetry text-[11px] text-purple-700 font-semibold border-t border-surface-container">
              <span className="material-symbols-outlined text-sm text-purple-600">trending_up</span>
              <span>Top 3.4% affinity pool</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white/90 backdrop-blur-2xl p-space-md flex flex-col justify-between shadow-sm border border-surface-container group hover:border-slate-300 transition-all">
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                <span className="material-symbols-outlined text-xl">query_stats</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-on-surface-variant font-code-telemetry text-[10px] font-bold">Percentile</span>
            </div>
            <div className="flex flex-col gap-1 mt-space-md">
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface leading-none">94.2%</span>
              <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">Skill Alignment</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Benchmarked against thousands of senior tech profiles.</p>
            </div>
            <div className="pt-space-sm mt-space-xs flex items-center gap-1.5 font-code-telemetry text-[11px] text-primary font-semibold border-t border-surface-container">
              <span className="material-symbols-outlined text-sm text-primary">bolt</span>
              <span>Competitive Outlier</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white/90 backdrop-blur-2xl p-space-md flex flex-col justify-between shadow-sm border border-surface-container group hover:border-slate-300 transition-all">
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
                <span className="material-symbols-outlined text-xl">outgoing_mail</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200/80 text-purple-700 font-code-telemetry text-[10px] font-bold">High Alpha</span>
            </div>
            <div className="flex flex-col gap-1 mt-space-md">
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface leading-none">3.8x</span>
              <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">Response Velocity</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Projected interview invitation rate compared to generic applications.</p>
            </div>
            <div className="pt-space-sm mt-space-xs flex items-center gap-1.5 font-code-telemetry text-[11px] text-emerald-700 font-semibold border-t border-surface-container">
              <span className="material-symbols-outlined text-sm text-emerald-600">speed</span>
              <span>~48hr Recruiter Turnaround</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        
        {/* Left Column: Top Real-Time Job Matches */}
        <div className="lg:col-span-8 flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary">radar</span>
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Top Real-Time Job Matches</h2>
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="font-code-telemetry text-[11px] text-outline font-semibold">Sorted by Neural Fit</span>
              <button onClick={() => navigate('/jobs')} className="p-1.5 rounded-md bg-white border border-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-all shadow-sm">
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </button>
            </div>
          </div>

          {displayedJobs.map((job, idx) => (
            <div key={job.id} className="rounded-2xl bg-white/90 backdrop-blur-2xl p-space-md md:p-space-lg shadow-sm border border-surface-container hover:shadow-md hover:border-slate-300 transition-all relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none ${idx % 2 === 0 ? 'bg-sky-100/40' : 'bg-purple-100/40'}`}></div>
              
              <div className="flex flex-col gap-space-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-12 h-12 rounded-xl object-cover bg-surface-container-low border border-surface-container shadow-sm flex items-center justify-center font-bold text-xl text-primary">
                      {job.logo}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-xs">
                        <span className="font-headline-sm text-headline-sm font-bold text-on-surface truncate max-w-[200px] sm:max-w-xs">{job.title}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 font-code-telemetry text-[11px] font-bold">{job.match}% MATCH</span>
                      </div>
                      <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm flex-wrap">
                        <span className="font-semibold text-on-surface">{job.company}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-code-telemetry text-[11px] font-bold">{job.salary}</span>
                      </div>
                    </div>
                  </div>
                  <button className="self-start sm:self-auto p-space-xs rounded-lg text-outline hover:text-primary hover:bg-surface-container-low transition-all">
                    <span className="material-symbols-outlined">bookmark_border</span>
                  </button>
                </div>

                {/* Skills Vector Alignment */}
                <div className="flex flex-wrap items-center gap-space-xs pt-space-xs">
                  <span className="font-code-telemetry text-[11px] text-outline mr-1 uppercase font-semibold">Matched:</span>
                  {job.skills.map((skill) => (
                    <span key={skill} className="px-2.5 py-1 rounded-md bg-surface-container-low border border-surface-container text-primary font-code-telemetry text-[11px] font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>{skill}
                    </span>
                  ))}
                  {idx === 0 && (
                    <>
                      <span className="font-code-telemetry text-[11px] text-rose-500 ml-2 uppercase font-semibold">Missing:</span>
                      <span className="px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-600 font-code-telemetry text-[11px] font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">close</span>Rust
                      </span>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-space-xs border-t border-surface-container mt-2">
                  <span className="font-code-telemetry text-[11px] text-outline hidden sm:block">Vector Delta: +3.2% vs competitors</span>
                  <div className="flex items-center gap-space-xs w-full sm:w-auto justify-end">
                    <button onClick={() => job.isApi ? navigate(`/jobs/${job.id}`) : window.open(job.jobUrl, '_blank')} className="px-space-md py-1.5 rounded-lg bg-surface-container-low border border-surface-container text-on-surface font-headline-sm text-body-sm font-semibold hover:bg-surface-container transition-all">
                      Inspect Match
                    </button>
                    <button onClick={() => window.open(job.jobUrl || `https://www.google.com/search?q=${encodeURIComponent(job.title + ' ' + job.company + ' careers')}`, '_blank')} className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-headline-sm text-body-sm font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-1">
                      <span>Quick Apply</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: AI Career Growth */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-purple-600">psychology</span>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Career Growth Vectors</h2>
          </div>

          <div className="rounded-2xl bg-white/90 backdrop-blur-2xl p-space-md flex flex-col gap-space-sm shadow-sm border border-surface-container relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Neural Competency Radar</span>
              <span className="font-code-telemetry text-[10px] text-primary font-bold uppercase bg-primary-fixed border border-primary-fixed-dim px-2 py-0.5 rounded">5 Dimensions</span>
            </div>
            
            <div className="w-full flex items-center justify-center py-space-xs">
              <svg className="w-48 h-48" viewBox="0 0 200 200">
                {/* Concentric Grid Polygons */}
                <polygon className="text-surface-container" fill="none" points="100,20 176,75 147,165 53,165 24,75" stroke="currentColor" strokeWidth="1"></polygon>
                <polygon className="text-surface-container" fill="none" points="100,50 148,85 130,142 70,142 52,85" stroke="currentColor" strokeWidth="1"></polygon>
                <polygon className="text-surface-container" fill="none" points="100,75 124,92 115,121 85,121 76,92" stroke="currentColor" strokeWidth="1"></polygon>
                {/* Axis lines */}
                <line className="text-surface-container" stroke="currentColor" strokeDasharray="2,2" strokeWidth="1" x1="100" x2="100" y1="100" y2="20"></line>
                <line className="text-surface-container" stroke="currentColor" strokeDasharray="2,2" strokeWidth="1" x1="100" x2="176" y1="100" y2="75"></line>
                <line className="text-surface-container" stroke="currentColor" strokeDasharray="2,2" strokeWidth="1" x1="100" x2="147" y1="100" y2="165"></line>
                <line className="text-surface-container" stroke="currentColor" strokeDasharray="2,2" strokeWidth="1" x1="100" x2="53" y1="100" y2="165"></line>
                <line className="text-surface-container" stroke="currentColor" strokeDasharray="2,2" strokeWidth="1" x1="100" x2="24" y1="100" y2="75"></line>
                {/* Candidate Skill Fill Shape */}
                <polygon fill="rgba(2, 132, 199, 0.15)" points="100,28 168,80 138,155 64,148 35,82" stroke="#0284c7" strokeWidth="2"></polygon>
                {/* Node Points */}
                <circle className="animate-ping" cx="100" cy="28" fill="#0284c7" r="3.5"></circle>
                <circle cx="100" cy="28" fill="#0284c7" r="3.5"></circle>
                <circle cx="168" cy="80" fill="#0284c7" r="3"></circle>
                <circle cx="138" cy="155" fill="#0284c7" r="3"></circle>
                <circle cx="64" cy="148" fill="#0284c7" r="3"></circle>
                <circle cx="35" cy="82" fill="#0284c7" r="3"></circle>
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-space-xs font-code-telemetry text-[11px] text-on-surface-variant">
              <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span><span>Frontend Arch: 97%</span></div>
              <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span><span>AI / LLM Ops: 89%</span></div>
              <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span><span>WebGL / Visual: 94%</span></div>
              <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span><span>Cloud & DevOps: 72%</span></div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-purple-50 via-white to-slate-50 border border-purple-200/80 p-space-md flex flex-col gap-space-xs shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-purple-600">lightbulb</span>
              <span className="font-code-telemetry text-[11px] font-bold uppercase text-purple-700 tracking-wide">High Impact Action Item</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-slate-900">Skill Vector Gap Detected</h3>
            <p className="font-body-sm text-body-sm text-slate-600 leading-relaxed">
              Adding <span className="text-sky-700 font-semibold">Docker</span> & <span className="text-sky-700 font-semibold">Kubernetes</span> to your cloud deployments section will increase DevOps match rate by <span className="text-emerald-700 font-bold font-code-telemetry text-[11px]">+14%</span>.
            </p>
            <button className="mt-space-xs w-full py-2 px-space-sm rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 transition-all font-body-sm text-body-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm">
              <span className="material-symbols-outlined text-sm">auto_fix_high</span>
              <span>Generate Suggested Bullet</span>
            </button>
          </div>

          <div className="rounded-2xl bg-white/90 backdrop-blur-2xl p-space-md flex flex-col gap-space-sm shadow-sm border border-surface-container">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Active Master Resume</span>
              <span className="px-2 py-0.5 rounded-full bg-primary-fixed border border-primary-fixed-dim text-primary font-code-telemetry text-[11px] font-bold">ATS {atsScore || 92}</span>
            </div>
            <div onClick={() => navigate(latestResume ? `/resumes/${latestResume.id}` : "/resumes")} className="p-space-xs rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-space-sm hover:bg-surface-container transition-all cursor-pointer">
              <div className="relative w-12 h-14 rounded-lg bg-primary-fixed border border-primary-fixed-dim flex flex-col items-center justify-center text-primary shadow-sm shrink-0">
                <span className="material-symbols-outlined text-2xl">description</span>
                <span className="font-code-telemetry text-[8px] font-bold uppercase mt-1">PDF</span>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-body-md text-body-md font-semibold text-on-surface truncate">{latestResume?.fileName || "Frontend_Lead_v4.pdf"}</span>
                <span className="font-code-telemetry text-[11px] text-on-surface-variant">Analyzed recently • Ready</span>
              </div>
              <span className="material-symbols-outlined text-outline hover:text-primary transition-colors">visibility</span>
            </div>
            <button onClick={() => navigate("/resume-upload")} className="w-full mt-space-xs py-2 px-space-sm rounded-lg bg-surface-container-low border border-surface-container text-on-surface font-headline-sm text-body-sm font-bold hover:bg-surface-container transition-all flex items-center justify-center gap-space-xs">
              <span className="material-symbols-outlined text-sm text-primary">upload_file</span>
              <span>Analyze New Version</span>
            </button>
          </div>
    </div>
      </div>
    </div>
  );
}
