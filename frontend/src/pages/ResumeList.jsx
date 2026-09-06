import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { resumeAPI } from "../services/api";

function formatBytes(bytes = 0) {
  if (!bytes) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDate(date) {
  if (!date) return 'Recently uploaded';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
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

export default function ResumeList() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadResumes = async () => {
    setLoading(true);
    try {
      const res = await resumeAPI.getAll();
      const raw = res.data?.data?.resumes || res.data?.data || [];
      setList(Array.isArray(raw) ? raw : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load resumes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadResumes(); }, []);

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await resumeAPI.delete(id);
      setList(prev => prev.filter(x => x.id !== id));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete resume.");
    }
  };

  return (
    <div className="animate-fade-in flex flex-col w-full gap-space-xl pb-space-3xl">
      {/* Page Header */}
      <div className="relative w-full rounded-2xl bg-white border border-surface-container overflow-hidden p-space-lg md:p-space-xl shadow-sm">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-purple-100/50 blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-space-xs mb-3">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
              <span className="font-code-telemetry text-[11px] font-bold uppercase text-purple-700 tracking-wider">Resume Vault</span>
              <span className="font-code-telemetry text-[11px] text-on-surface-variant px-2 py-0.5 rounded-md bg-surface-container-low border border-surface-container font-semibold">{list.length} Document{list.length !== 1 ? "s" : ""}</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg font-extrabold text-on-surface tracking-tight">My Resumes</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">All your career documents in one intelligent vault.</p>
          </div>
          <button
            className="flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-primary text-on-primary font-headline-sm text-body-md font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-all shrink-0"
            onClick={() => navigate("/resume-upload")}
          >
            <span className="material-symbols-outlined text-sm">upload_file</span>
            Upload Resume
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-body-sm text-body-sm">
          <span className="material-symbols-outlined text-rose-500">error</span>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-space-md">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin" style={{ animationDuration: "2s" }}>neurology</span>
          <p className="font-code-telemetry text-[11px] font-bold uppercase text-on-surface-variant tracking-wider">Loading Resume Vault...</p>
        </div>

      ) : list.length === 0 ? (
        <div className="rounded-2xl bg-white border border-surface-container p-space-3xl flex flex-col items-center text-center shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-primary-fixed border border-primary-fixed-dim flex items-center justify-center mb-space-lg shadow-sm">
            <span className="material-symbols-outlined text-primary text-4xl">description</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-2">No Resumes Yet</h3>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-space-lg">
            Upload your first resume to begin your career analysis and discover AI-powered job matches.
          </p>
          <button
            className="flex items-center gap-space-xs px-space-lg py-space-sm rounded-xl bg-primary text-on-primary font-headline-sm text-body-md font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-all"
            onClick={() => navigate("/resume-upload")}
          >
            <span className="material-symbols-outlined text-sm">upload_file</span>
            Upload Your First Resume
          </button>
        </div>

      ) : (
        <div className="flex flex-col gap-space-md">
          {list.map((r) => {
            const ats = computeAtsScore(r);
            const status = ats >= 85 ? "Excellent" : ats >= 70 ? "Good" : "Fair";
            const statusStyles = {
              Excellent: "bg-emerald-50 border-emerald-200/80 text-emerald-700",
              Good: "bg-primary-fixed border-primary-fixed-dim text-primary",
              Fair: "bg-amber-50 border-amber-200/80 text-amber-700",
            };
            const skillCount = r.extractedSkills?.length || 0;

            return (
              <div key={r.id} className="rounded-2xl bg-white border border-surface-container p-space-md md:p-space-lg flex flex-wrap items-center gap-space-md shadow-sm hover:shadow-md hover:border-slate-300 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50/50 rounded-full blur-2xl pointer-events-none"></div>

                {/* Document icon */}
                <div className="relative w-14 h-16 rounded-xl bg-primary-fixed border border-primary-fixed-dim flex flex-col items-center justify-center text-primary shadow-sm shrink-0">
                  <span className="material-symbols-outlined text-2xl">description</span>
                  <span className="font-code-telemetry text-[8px] font-bold uppercase mt-0.5">PDF</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-[180px]">
                  <div className="font-headline-sm text-body-md font-semibold text-on-surface mb-1 truncate">{r.fileName}</div>
                  <div className="flex items-center gap-3 font-code-telemetry text-[11px] text-on-surface-variant flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">calendar_today</span>
                      {formatDate(r.createdAt)}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">psychology</span>
                      {skillCount} skills
                    </span>
                    <span>·</span>
                    <span>{formatBytes(r.fileSize)}</span>
                  </div>
                </div>

                {/* ATS score */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="font-display text-3xl font-extrabold text-on-surface leading-none">{ats}</div>
                  <div className="font-code-telemetry text-[10px] text-on-surface-variant uppercase font-semibold">ATS Score</div>
                </div>

                {/* Status badge */}
                <span className={`px-3 py-1 rounded-full border font-code-telemetry text-[11px] font-bold ${statusStyles[status]}`}>
                  {status}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-space-xs shrink-0">
                  <button
                    onClick={() => navigate(`/resumes/${r.id}`)}
                    className="px-space-md py-1.5 rounded-lg bg-surface-container-low border border-surface-container text-on-surface font-headline-sm text-body-sm font-semibold hover:bg-surface-container transition-all"
                  >
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/analysis-loading?id=${r.id}`)}
                    className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-headline-sm text-body-sm font-bold shadow-sm shadow-primary/20 hover:opacity-90 transition-all"
                  >
                    Analyze
                  </button>
                  <button
                    onClick={(e) => handleDelete(r.id, e)}
                    className="p-2 rounded-lg text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-200"
                    title="Delete"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
