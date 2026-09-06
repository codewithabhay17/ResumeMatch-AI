import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowUpRight, Check, CheckCircle2, ChevronRight, Clock3,
  Copy, ExternalLink, FileText, Lightbulb, LoaderCircle, Sparkles,
  Target, TrendingUp, X, XCircle, Zap
} from 'lucide-react';
import { matchAPI } from '../services/api';

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function scoreTone(score) {
  if (score >= 85) return { ring: '#4cd7f6', text: '#4cd7f6', label: 'High Affinity Candidate' };
  if (score >= 70) return { ring: '#c0c1ff', text: '#c0c1ff', label: 'Strong Candidate' };
  if (score >= 50) return { ring: '#ffb690', text: '#ffb690', label: 'Potential Fit' };
  return { ring: '#ff8b55', text: '#ff8b55', label: 'Needs Development' };
}

function parseAiAnalysis(text = '') {
  const clean = text.replace(/\r/g, '').trim();
  if (!clean) return { assessment: '', strengths: [], development: [], nextSteps: [] };

  const lines = clean.split('\n').map((line) => line.trim()).filter(Boolean);
  const sections = { assessment: [], strengths: [], development: [], nextSteps: [] };
  let active = 'assessment';

  for (const raw of lines) {
    const line = raw.replace(/^\s*(?:\d+[.)]|[-*•])\s*/, '').trim();
    const lower = line.toLowerCase();
    if (lower.includes('strength')) { active = 'strengths'; continue; }
    if (lower.includes('develop') || lower.includes('skill to')) { active = 'development'; continue; }
    if (lower.includes('next step') || lower.includes('actionable')) { active = 'nextSteps'; continue; }
    if (/^\d+[.)]/.test(raw) && active === 'assessment') { sections.assessment.push(line); continue; }
    sections[active].push(line);
  }

  const splitBullets = (items) => items.flatMap((item) => item.split(/\s*\|\s*/).filter(Boolean));
  const assessment = sections.assessment.join(' ').replace(/^assessment:\s*/i, '').trim();
  return {
    assessment,
    strengths: splitBullets(sections.strengths).slice(0, 4),
    development: splitBullets(sections.development).slice(0, 4),
    nextSteps: splitBullets(sections.nextSteps).slice(0, 4),
  };
}

function scoreRing(score) {
  const circumference = 2 * Math.PI * 50;
  const offset = circumference * (1 - clamp(score) / 100);
  return { circumference, offset };
}

export default function MatchAuditReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    matchAPI.getById(id)
      .then((response) => { if (alive) setMatch(response.data?.data || response.data); })
      .catch((err) => { if (alive) setError(err.response?.data?.message || 'Unable to load this match audit.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);

  const score = clamp(match?.matchScore);
  const tone = scoreTone(score);
  const ring = scoreRing(score);
  const matched = Array.isArray(match?.matchedSkills) ? match.matchedSkills : [];
  const missing = Array.isArray(match?.missingSkills) ? match.missingSkills : [];
  const jobSkills = match?.job?.skills || [];
  const ai = useMemo(() => parseAiAnalysis(match?.aiAnalysis || ''), [match?.aiAnalysis]);

  const dimensions = useMemo(() => {
    const total = matched.length + missing.length;
    const skillFit = total ? (matched.length / total) * 100 : score;
    const critical = jobSkills.length
      ? (jobSkills.filter((item) => item.required && matched.includes(item.skill?.name?.toLowerCase())).length /
          Math.max(1, jobSkills.filter((item) => item.required).length)) * 100
      : skillFit;
    return [
      { label: 'Core Tech Stack', value: Math.round(skillFit), note: `${matched.length}/${Math.max(1, total)} listed skills matched`, icon: CheckCircle2 },
      { label: 'Critical Requirements', value: Math.round(critical), note: `${jobSkills.filter((item) => item.required).length || 'No'} critical requirements evaluated`, icon: Target },
      { label: 'Overall Match Index', value: Math.round(score), note: 'Weighted across the available job signals', icon: TrendingUp },
    ];
  }, [matched, missing, jobSkills, score]);

  const updateStatus = async (nextStatus) => {
    if (!match || statusUpdating) return;
    setStatusUpdating(true);
    try {
      const response = await matchAPI.updateStatus(match.id, nextStatus);
      setMatch((current) => ({ ...current, ...(response.data?.data || response.data), status: nextStatus }));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update application status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const copyAudit = async () => {
    if (!match) return;
    const text = [
      `ResuMatch AI — Match Audit`,
      `${match.job?.title || 'Role'} at ${match.job?.company || 'Company'}`,
      `Match Index: ${Math.round(score)}%`,
      `Matched skills: ${matched.join(', ') || 'None'}`,
      `Missing skills: ${missing.join(', ') || 'None'}`,
      ai.assessment ? `Assessment: ${ai.assessment}` : '',
    ].filter(Boolean).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError('Clipboard access is unavailable in this browser.');
    }
  };

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="flex items-center gap-3 rounded-2xl border border-white/[.07] bg-[#171b26] px-5 py-4 text-sm text-[#a7a9b8]"><LoaderCircle className="h-5 w-5 animate-spin text-[#4cd7f6]" /> Loading match audit…</div></div>;
  }

  if (error && !match) {
    return <div className="mx-auto max-w-2xl rounded-2xl border border-[#ff8b55]/20 bg-[#171b26] p-8 text-center"><XCircle className="mx-auto h-8 w-8 text-[#ff8b55]" /><h1 className="mt-4 font-display text-xl font-semibold text-white">Match audit unavailable</h1><p className="mt-2 text-sm text-[#8f93a7]">{error}</p><button onClick={() => navigate('/jobs')} className="mt-5 rounded-xl bg-[#a5a7ff] px-4 py-2.5 text-sm font-semibold text-[#11133d]">Back to jobs</button></div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-xl border border-white/[.07] bg-[#171b26] px-3 py-2 text-xs font-semibold text-[#a7a9b8] hover:text-white"><ArrowLeft className="h-4 w-4" /> Back</button>
        <div className="flex items-center gap-2">
          <button onClick={copyAudit} className="inline-flex items-center gap-2 rounded-xl border border-white/[.07] bg-[#171b26] px-3 py-2 text-xs font-semibold text-[#a7a9b8] hover:text-white">{copied ? <Check className="h-4 w-4 text-[#4cd7f6]" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy audit'}</button>
          {match?.job?.jobUrl && <a href={match.job.jobUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#a5a7ff] px-3 py-2 text-xs font-semibold text-[#11133d] hover:bg-[#c0c1ff]">Apply <ExternalLink className="h-4 w-4" /></a>}
        </div>
      </div>

      {error && <div className="flex items-center gap-2 rounded-xl border border-[#ff8b55]/20 bg-[#ff8b55]/10 px-4 py-3 text-xs text-[#ffb690]"><Zap className="h-4 w-4" />{error}<button className="ml-auto" onClick={() => setError('')}><X className="h-4 w-4" /></button></div>}

      <section className="relative overflow-hidden rounded-3xl border border-white/[.07] bg-[#171b26] p-5 shadow-[0_25px_70px_rgba(0,0,0,.18)] sm:p-7">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#8083ff]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#4cd7f6]/10 blur-3xl" />
        <div className="relative grid gap-7 lg:grid-cols-[1fr_300px] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-[#4cd7f6]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#4cd7f6]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4cd7f6]" /> Live audit completed</span><span className="inline-flex items-center gap-1 rounded-full bg-white/[.04] px-2.5 py-1 text-[10px] font-semibold text-[#8f93a7]"><Clock3 className="h-3 w-3" /> AI + skills engine</span></div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[.14em] text-[#6f7384]">Resume vs job match audit</p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">{match?.job?.title || 'Target role'}</h1>
            <p className="mt-1 text-sm font-medium text-[#4cd7f6]">{match?.job?.company || 'Company'} <span className="px-1 text-[#555a6b]">•</span> {match?.job?.location || 'Location not specified'}</p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#a7a9b8]">{ai.assessment || `Your resume currently matches ${Math.round(score)}% of the available requirements for this role. Review the matched and missing skills below before applying.`}</p>
            <div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full bg-[#8083ff]/10 px-3 py-1.5 text-xs font-semibold text-[#c0c1ff]">{tone.label}</span><span className="rounded-full bg-[#4cd7f6]/10 px-3 py-1.5 text-xs font-semibold text-[#4cd7f6]">{matched.length} matched skills</span><span className="rounded-full bg-[#ffb690]/10 px-3 py-1.5 text-xs font-semibold text-[#ffb690]">{missing.length} skill gaps</span></div>
          </div>
          <div className="mx-auto w-full max-w-[250px]">
            <div className="relative mx-auto aspect-square max-w-[220px]">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-label={`${Math.round(score)} percent match`}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="#262a35" strokeWidth="9" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="url(#matchGradient)" strokeWidth="9.5" strokeLinecap="round" strokeDasharray={ring.circumference} strokeDashoffset={ring.offset} />
                <defs><linearGradient id="matchGradient" x1="0%" x2="100%" y1="0%" y2="100%"><stop offset="0%" stopColor="#4cd7f6" /><stop offset="60%" stopColor="#8083ff" /><stop offset="100%" stopColor="#c0c1ff" /></linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center"><div className="font-display text-5xl font-bold tracking-tight text-white">{Math.round(score)}<span className="text-2xl text-[#4cd7f6]">%</span></div><span className="mt-1 text-[10px] font-bold uppercase tracking-[.14em] text-[#777c8e]">Match index</span></div>
            </div>
          </div>
        </div>
        <div className="relative mt-7 grid grid-cols-3 gap-2 rounded-2xl bg-[#0a0e18]/50 p-2 text-center"><div className="rounded-xl py-2"><span className="block text-[10px] text-[#777c8e]">Status</span><strong className="mt-1 block text-xs capitalize text-white">{match?.status || 'active'}</strong></div><div className="rounded-xl py-2"><span className="block text-[10px] text-[#777c8e]">Matched</span><strong className="mt-1 block text-xs text-[#4cd7f6]">{matched.length}</strong></div><div className="rounded-xl py-2"><span className="block text-[10px] text-[#777c8e]">Gaps</span><strong className="mt-1 block text-xs text-[#ffb690]">{missing.length}</strong></div></div>
      </section>

      <section className="rounded-2xl border border-white/[.06] bg-[#171b26] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-[#4cd7f6]" /><h2 className="font-display text-lg font-semibold text-white">Dimensional scoring</h2></div><span className="rounded-md bg-white/[.05] px-2 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-[#8f93a7]">Weighted</span></div>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {dimensions.map(({ label, value, note, icon: Icon }) => <div key={label}><div className="flex items-center justify-between gap-3"><span className="flex items-center gap-1.5 text-sm font-semibold text-[#dfe2f1]"><Icon className="h-4 w-4 text-[#4cd7f6]" />{label}</span><span className="font-display text-sm font-bold text-[#c0c1ff]">{value}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#313540]"><div className="h-full rounded-full bg-gradient-to-r from-[#4cd7f6] to-[#8083ff] transition-all duration-700" style={{ width: `${value}%` }} /></div><p className="mt-2 text-[11px] leading-5 text-[#777c8e]">{note}</p></div>)}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#4cd7f6]/10 bg-[#171b26] p-5 sm:p-6"><div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-[#4cd7f6]" /><h2 className="font-display text-lg font-semibold text-white">Matched capabilities</h2></div><p className="mt-1 text-xs text-[#777c8e]">Skills already represented in your parsed resume.</p><div className="mt-5 flex flex-wrap gap-2">{matched.length ? matched.map((skill) => <span key={skill} className="inline-flex items-center gap-1.5 rounded-xl border border-[#4cd7f6]/15 bg-[#4cd7f6]/[.07] px-3 py-2 text-xs font-semibold text-[#a8eefd]"><Check className="h-3.5 w-3.5" />{skill}</span>) : <span className="text-xs text-[#777c8e]">No matched skills were recorded for this audit.</span>}</div></section>
        <section className="rounded-2xl border border-[#ffb690]/10 bg-[#171b26] p-5 sm:p-6"><div className="flex items-center gap-2"><Target className="h-5 w-5 text-[#ffb690]" /><h2 className="font-display text-lg font-semibold text-white">Skill gaps</h2></div><p className="mt-1 text-xs text-[#777c8e]">Prioritize these requirements before applying or interviewing.</p><div className="mt-5 flex flex-wrap gap-2">{missing.length ? missing.map((skill) => <span key={skill} className="inline-flex items-center gap-1.5 rounded-xl border border-[#ffb690]/15 bg-[#ffb690]/[.06] px-3 py-2 text-xs font-semibold text-[#ffcfb8]"><X className="h-3.5 w-3.5" />{skill}</span>) : <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#4cd7f6]"><CheckCircle2 className="h-4 w-4" />No recorded skill gaps.</span>}</div></section>
      </div>

      <section className="rounded-2xl border border-white/[.06] bg-[#171b26] p-5 sm:p-6">
        <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-[#c0c1ff]" /><h2 className="font-display text-lg font-semibold text-white">AI career guidance</h2></div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/[.06] bg-[#0f131d]/70 p-4"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#6f7384]">Strengths</p><div className="mt-3 space-y-2">{(ai.strengths.length ? ai.strengths : matched.slice(0, 3)).map((item, index) => <div key={`${item}-${index}`} className="flex gap-2 text-xs leading-5 text-[#c7c4d7]"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4cd7f6]" />{item}</div>)}</div></div>
          <div className="rounded-2xl border border-white/[.06] bg-[#0f131d]/70 p-4"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#6f7384]">Develop next</p><div className="mt-3 space-y-2">{(ai.development.length ? ai.development : missing.slice(0, 3)).map((item, index) => <div key={`${item}-${index}`} className="flex gap-2 text-xs leading-5 text-[#c7c4d7]"><Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ffb690]" />{item}</div>)}</div></div>
          <div className="rounded-2xl border border-white/[.06] bg-[#0f131d]/70 p-4"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#6f7384]">Next steps</p><div className="mt-3 space-y-2">{(ai.nextSteps.length ? ai.nextSteps : ['Review the role requirements', 'Tailor your resume keywords', 'Prepare evidence for matched skills']).map((item, index) => <div key={`${item}-${index}`} className="flex gap-2 text-xs leading-5 text-[#c7c4d7]"><ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#c0c1ff]" />{item}</div>)}</div></div>
        </div>
        {!match?.aiAnalysis && <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#8083ff]/15 bg-[#8083ff]/[.06] p-3 text-[11px] leading-5 text-[#9296a9]"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#c0c1ff]" />AI analysis was not stored for this match. The guidance above uses the available skill signals as a fallback.</div>}
      </section>

      <section className="rounded-2xl border border-white/[.06] bg-[#171b26] p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#6f7384]">Application workflow</p><h2 className="mt-1 font-display text-lg font-semibold text-white">Move this match forward</h2></div><div className="flex flex-wrap gap-2"><button disabled={statusUpdating} onClick={() => updateStatus('dismissed')} className="rounded-xl border border-white/[.07] bg-white/[.03] px-3 py-2 text-xs font-semibold text-[#8f93a7] hover:text-white">Dismiss</button><button disabled={statusUpdating} onClick={() => updateStatus('applied')} className="rounded-xl border border-[#4cd7f6]/15 bg-[#4cd7f6]/[.08] px-3 py-2 text-xs font-semibold text-[#4cd7f6] hover:bg-[#4cd7f6]/[.12]">Mark applied</button></div></div></section>

      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 text-[11px] text-[#6f7384]"><span className="inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" />Generated from your stored resume/job data</span><Link to="/jobs" className="inline-flex items-center gap-1 font-semibold text-[#c0c1ff] hover:text-white">Back to job discovery <ArrowUpRight className="h-3.5 w-3.5" /></Link></div>
    </div>
  );
}
