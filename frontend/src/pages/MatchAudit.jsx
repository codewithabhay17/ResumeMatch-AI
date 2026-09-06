import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { matchAPI, jobAPI } from '../services/api';

function CircleProgress({ value, size = 100, stroke = 8, color = '#6C5CE7' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F0EEE9" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.25,1,0.5,1)' }}/>
    </svg>
  );
}

function getMatchLabel(score) {
  if (score >= 85) return { label: 'Excellent Match', color: '#35B879', bg: '#D6F5E5' };
  if (score >= 70) return { label: 'Strong Match', color: '#6C5CE7', bg: '#EDE9FF' };
  if (score >= 55) return { label: 'Good Match', color: '#F4A340', bg: '#FEF0D9' };
  return { label: 'Partial Match', color: '#8A8A8A', bg: '#F0EEE9' };
}

function getScoreColor(score) {
  if (score >= 85) return '#35B879';
  if (score >= 70) return '#6C5CE7';
  if (score >= 55) return '#F4A340';
  return '#FF7A6B';
}

export default function MatchAudit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [match, setMatch] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    loadMatch();
  }, [id]);

  const loadMatch = async () => {
    try {
      setLoading(true);
      const matchRes = await matchAPI.getById(id);
      const matchData = matchRes.data?.data?.match || matchRes.data?.data || matchRes.data;
      setMatch(matchData);

      if (matchData?.jobId) {
        try {
          const jobRes = await jobAPI.getById(matchData.jobId);
          setJob(jobRes.data?.data?.job || jobRes.data?.data || jobRes.data);
        } catch (_) {}
      }
    } catch (err) {
      setError('Failed to load match data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
        <div style={{ width: 48, height: 48, border: '3px solid #EDE9FF', borderTopColor: '#6C5CE7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#8A8A8A', fontSize: 14 }}>Loading match intelligence...</p>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#171717', marginBottom: 8 }}>Match Not Found</h2>
        <p style={{ color: '#666666', marginBottom: 24 }}>{error || 'This match audit could not be loaded.'}</p>
        <button className="btn-primary" onClick={() => navigate('/jobs')}>Browse Jobs</button>
      </div>
    );
  }

  const score = match.overallScore || match.score || 0;
  const matchLabel = getMatchLabel(score);
  const scoreColor = getScoreColor(score);

  // Build breakdown from real data
  const breakdown = [
    { label: 'Skills Match', value: match.skillsScore || match.skillMatch || 0, color: '#35B879' },
    { label: 'Experience Match', value: match.experienceScore || match.experienceMatch || 0, color: '#6C5CE7' },
    { label: 'Education Match', value: match.educationScore || match.educationMatch || 0, color: '#35B879' },
    { label: 'AI Semantic Match', value: match.semanticScore || match.aiMatch || 0, color: '#FF7A6B' },
  ];

  const strengths = match.strengths || match.matchedSkills?.map(s => `Your ${s} expertise directly aligns with job requirements`) || [];
  const gaps = match.gaps || match.missingSkills?.map(s => `${s} experience would improve your match score`) || [];
  const haveSkills = match.matchedSkills || [];
  const improveSkills = match.missingSkills || [];
  const keywords = match.suggestedKeywords || match.keywords || [];

  const jobTitle = job?.title || match.jobTitle || 'Job Position';
  const company = job?.company || match.company || '';

  return (
    <div className="animate-fade-in" style={{ maxWidth: 900, margin: '0 auto' }}>
      <button className="btn-ghost" onClick={() => navigate(job ? `/jobs/${match.jobId}` : '/jobs')} style={{ marginBottom: 20, paddingLeft: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back to Job
      </button>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: '#171717', marginBottom: 6, letterSpacing: '-0.02em' }}>
          Job Match Intelligence
        </h1>
        <p style={{ fontSize: 14, color: '#8A8A8A' }}>
          {jobTitle}{company ? ` · ${company}` : ''}
        </p>
      </div>

      {/* Main score */}
      <div className="card" style={{ padding: 36, marginBottom: 20, display: 'flex', gap: 36, alignItems: 'center', flexWrap: 'wrap', background: 'linear-gradient(135deg, rgba(53,184,121,0.04) 0%, white 100%)' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <CircleProgress value={score} size={140} stroke={12} color={scoreColor} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, color: scoreColor }}>{score}%</span>
            <span style={{ fontSize: 11, color: '#8A8A8A', fontWeight: 600, textTransform: 'uppercase' }}>Overall</span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: matchLabel.bg, color: matchLabel.color, borderRadius: 8, padding: '6px 14px', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            {matchLabel.label}
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#171717', marginBottom: 16 }}>
            {score >= 70 ? "You're a strong candidate for this role." : "Here's how you can improve your candidacy."}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {breakdown.map(item => (
              <div key={item.label} style={{ background: '#FAFAF8', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ fontSize: 11, color: '#8A8A8A', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: item.value > 0 ? item.color : '#D4D2CE' }}>
                  {item.value > 0 ? `${item.value}%` : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(strengths.length > 0 || gaps.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Strengths */}
          {strengths.length > 0 && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#171717', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>💪</span> What makes you a strong match?
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {strengths.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#D6F5E5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#35B879" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <p style={{ fontSize: 13, color: '#444444', lineHeight: 1.5 }}>{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gaps */}
          {gaps.length > 0 && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#171717', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>🎯</span> What could improve your match?
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {gaps.map((g, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#FEF0D9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <span style={{ fontSize: 9, color: '#C47800', fontWeight: 900 }}>!</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#444444', lineHeight: 1.5 }}>{g}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skills comparison */}
      {(haveSkills.length > 0 || improveSkills.length > 0) && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#171717', marginBottom: 20 }}>Skills comparison</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {haveSkills.length > 0 && (
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#35B879', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Skills you already have</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {haveSkills.map(s => (
                    <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 500, background: '#D6F5E5', color: '#35B879', border: '1px solid #A8E8C4' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {improveSkills.length > 0 && (
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#F4A340', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Skills to strengthen</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {improveSkills.map(s => (
                    <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 500, background: '#FEF0D9', color: '#C47800', border: '1px solid #F4D090' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {keywords.length > 0 && (
            <div style={{ borderTop: '1px solid #E7E5E2', marginTop: 20, paddingTop: 20 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#6C5CE7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Suggested resume keywords</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {keywords.map(k => (
                  <span key={k} className="skill-chip" style={{ fontSize: 12 }}>{k}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ background: '#EDE9FF', borderRadius: 14, padding: '16px 20px', marginBottom: 32, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p style={{ fontSize: 13, color: '#666666', lineHeight: 1.6 }}>
          This score is an AI estimate based on your resume and job description. It is not a guarantee of hiring or employment. Use this as guidance to improve your application, not as a definitive measure of your candidacy.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingBottom: 40 }}>
        <button className="btn-secondary" onClick={() => navigate('/jobs')}>Browse More Jobs</button>
        {job?.applicationUrl && (
          <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ textDecoration: 'none' }}>Apply Now</a>
        )}
      </div>
    </div>
  );
}
