import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resumeAPI } from "../services/api";

export default function ResumeUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [state, setState] = useState("idle"); // idle | uploading | complete | error
  const [progress, setProgress] = useState(0);
  const [uploadedResumeId, setUploadedResumeId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFile = async (f) => {
    if (!f) return;
    if (f.type !== "application/pdf" && f.type !== "text/plain") {
      setErrorMessage("Only PDF and TXT files are supported.");
      setState("error");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setErrorMessage("File size must be 5 MB or smaller.");
      setState("error");
      return;
    }

    setFile(f);
    setState("uploading");
    setProgress(15);

    try {
      const response = await resumeAPI.upload(f, (p) => {
        setProgress(Math.max(15, p));
      });
      const data = response?.data?.data;
      if (data?.id) setUploadedResumeId(data.id);
      setState("complete");
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || err?.message || "Upload failed. Please check the file and try again.");
      setState("error");
    }
  };

  return (
    <div className="animate-fade-in flex flex-col w-full gap-space-xl pb-space-3xl">
      {/* Page Header */}
      <div className="relative w-full rounded-2xl bg-white border border-surface-container overflow-hidden p-space-lg md:p-space-xl shadow-sm">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-sky-100/60 blur-[80px] pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-space-xs mb-3">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
            <span className="font-code-telemetry text-[11px] font-bold uppercase text-sky-700 tracking-wider">Neural Document Parser</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-extrabold text-on-surface tracking-tight">Upload Resume</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-xl">
            Let AI understand your experience, skills, and career direction. Supports PDF & TXT, up to 5 MB.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg items-start">
        {/* Main Upload Zone */}
        <div className="lg:col-span-2">
          {state === "idle" || state === "uploading" ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => {
                e.preventDefault();
                setDragging(false);
                const f = e.dataTransfer.files[0];
                if (f) handleFile(f);
              }}
              onClick={() => state === "idle" && document.getElementById("upload-input")?.click()}
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden cursor-pointer flex flex-col items-center justify-center text-center p-space-3xl
                ${dragging ? "border-primary bg-primary-fixed/40 scale-[1.01]" : state !== "idle" ? "border-primary bg-white" : "border-surface-container bg-white hover:border-primary/60 hover:bg-surface-container-lowest"}
              `}
              style={{ minHeight: 340 }}
            >
              <input id="upload-input" type="file" accept=".pdf,.txt,application/pdf,text/plain" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
              
              {/* Ambient orbs */}
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-sky-100/50 blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-purple-100/40 blur-3xl pointer-events-none"></div>

              {state === "idle" && (
                <div className="relative z-10 flex flex-col items-center gap-space-md">
                  {/* Document illustration */}
                  <div className="relative w-24 h-28 animate-float">
                    <div className="w-full h-full rounded-2xl flex flex-col p-4 gap-2 shadow-xl" style={{ background: "linear-gradient(135deg, #0284c7 0%, #7c3aed 100%)" }}>
                      <div className="h-1.5 bg-white/70 rounded-full"></div>
                      <div className="h-1.5 bg-white/50 rounded-full w-3/4"></div>
                      <div className="h-1.5 bg-white/50 rounded-full"></div>
                      <div className="h-1.5 bg-white/30 rounded-full w-5/6"></div>
                      <div className="h-1.5 bg-white/30 rounded-full w-2/3"></div>
                      <div className="mt-auto flex gap-1">
                        {["ML","AI","TS"].map(t => (
                          <span key={t} className="text-[7px] px-1.5 py-0.5 rounded bg-white/25 text-white font-bold">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                      <span className="material-symbols-outlined text-white text-sm">upload</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-1">
                      {dragging ? "Release to upload" : "Drop your resume here"}
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">or <span className="text-primary font-semibold">browse from computer</span></p>
                    <p className="font-code-telemetry text-[11px] text-outline mt-2">PDF, TXT · Max 5 MB</p>
                  </div>
                </div>
              )}

              {state === "uploading" && (
                <div className="relative z-10 flex flex-col items-center gap-space-md w-full max-w-xs">
                  <div className="w-16 h-16 rounded-2xl bg-primary-fixed border border-primary-fixed-dim flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-primary text-3xl animate-spin" style={{ animationDuration: "2s" }}>neurology</span>
                  </div>
                  <div>
                    <p className="font-headline-sm text-headline-sm font-bold text-on-surface mb-1">Parsing with AI...</p>
                    <p className="font-code-telemetry text-[11px] text-outline">{file?.name}</p>
                  </div>
                  <div className="w-full">
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-primary to-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flex justify-between mt-2 font-code-telemetry text-[11px] text-on-surface-variant">
                      <span>Processing document</span>
                      <span className="text-primary font-semibold">{progress}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          ) : state === "complete" ? (
            <div className="relative rounded-2xl bg-white border border-emerald-200/80 overflow-hidden p-space-xl flex flex-col items-center text-center shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-sky-50/30 pointer-events-none"></div>
              <div className="relative z-10 flex flex-col items-center gap-space-md">
                <div className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-emerald-600 text-4xl">check_circle</span>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-space-xs mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-code-telemetry text-[11px] font-bold uppercase text-emerald-700">Document Indexed Successfully</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-1">Resume Parsed & Ready</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    <span className="font-semibold text-on-surface">{file?.name}</span> is ready for full AI intelligence review.
                  </p>
                </div>
                <div className="flex gap-space-sm flex-wrap justify-center">
                  <button
                    className="flex items-center gap-space-xs px-space-lg py-space-sm rounded-xl bg-primary text-on-primary font-headline-sm text-body-md font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-all"
                    onClick={() => navigate(uploadedResumeId ? `/analysis-loading?id=${uploadedResumeId}` : "/resumes")}
                  >
                    <span className="material-symbols-outlined text-sm">neurology</span>
                    Analyze Resume
                  </button>
                  <button
                    className="flex items-center gap-space-xs px-space-lg py-space-sm rounded-xl bg-surface-container-low border border-surface-container text-on-surface font-headline-sm text-body-md font-semibold hover:bg-surface-container transition-all"
                    onClick={() => { setState("idle"); setFile(null); setProgress(0); }}
                  >
                    Upload Another
                  </button>
                </div>
              </div>
            </div>

          ) : (
            <div className="relative rounded-2xl bg-white border border-rose-200/80 overflow-hidden p-space-xl flex flex-col items-center text-center shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-transparent to-transparent pointer-events-none"></div>
              <div className="relative z-10 flex flex-col items-center gap-space-md">
                <div className="w-20 h-20 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-rose-500 text-4xl">error</span>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-space-xs mb-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span className="font-code-telemetry text-[11px] font-bold uppercase text-rose-700">Upload Failed</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-1">Could Not Process File</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {errorMessage || "We couldn't process that file. Please check the format and try again."}
                  </p>
                </div>
                <button
                  className="flex items-center gap-space-xs px-space-lg py-space-sm rounded-xl bg-primary text-on-primary font-headline-sm text-body-md font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-all"
                  onClick={() => { setState("idle"); setFile(null); setProgress(0); setErrorMessage(""); }}
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Info Panel */}
        <div className="flex flex-col gap-space-md">
          {/* Feature chips */}
          {[
            { icon: "description", label: "PDF & TXT", desc: "Accepted formats", color: "text-sky-600", bg: "bg-sky-50 border-sky-100" },
            { icon: "lock", label: "Secure & Private", desc: "Your data is encrypted", color: "text-purple-600", bg: "bg-purple-50 border-purple-100" },
            { icon: "bolt", label: "Under 30 seconds", desc: "Fast AI parsing", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
            { icon: "auto_fix_high", label: "AI-Powered Analysis", desc: "Skills & ATS scoring", color: "text-primary", bg: "bg-primary-fixed border-primary-fixed-dim" },
          ].map(item => (
            <div key={item.label} className="rounded-2xl bg-white border border-surface-container p-space-md flex items-center gap-space-sm shadow-sm hover:border-slate-300 transition-all">
              <div className={`p-2.5 rounded-xl border ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
              </div>
              <div>
                <div className="font-headline-sm text-body-md font-semibold text-on-surface">{item.label}</div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">{item.desc}</div>
              </div>
            </div>
          ))}

          {/* AI telemetry info card */}
          <div className="rounded-2xl bg-gradient-to-br from-sky-50 via-white to-indigo-50 border border-sky-200/80 p-space-md shadow-sm">
            <div className="flex items-center gap-space-xs mb-space-sm">
              <span className="material-symbols-outlined text-primary text-sm">info</span>
              <span className="font-code-telemetry text-[11px] font-bold uppercase text-primary tracking-wide">What Happens Next</span>
            </div>
            <div className="flex flex-col gap-2">
              {[
                "Text extracted & normalized",
                "Skills & keywords detected",
                "ATS score computed",
                "Job matches calculated",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
                  <span className="font-code-telemetry text-[10px] font-bold text-primary bg-primary-fixed border border-primary-fixed-dim px-1.5 py-0.5 rounded">{`0${i+1}`}</span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
