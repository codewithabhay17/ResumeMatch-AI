import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const savedJobsData = [
  { id: 1, title: 'Software Developer II', company: 'Swiggy', location: 'Bangalore', type: 'Hybrid', salary: '₹20L–₹32L', match: 82, status: 'Interested', logo: 'S', logoColor: '#F4A340' },
  { id: 2, title: 'Frontend Engineer', company: 'PhonePe', location: 'Bangalore', type: 'Full-time', salary: '₹16L–₹24L', match: 76, status: 'Applied', logo: 'P', logoColor: '#6C5CE7' },
  { id: 3, title: 'React Developer', company: 'Zepto', location: 'Mumbai', type: 'Remote', salary: '₹14L–₹20L', match: 71, status: 'Archived', logo: 'Z', logoColor: '#FF7A6B' },
];

const statusColors = {
  Applied: { text: '#6C5CE7', bg: '#EDE9FF' },
  Interested: { text: '#35B879', bg: '#D6F5E5' },
  Archived: { text: '#8A8A8A', bg: '#F0EEE9' },
};

const tabs = ['All', 'Applied', 'Interested', 'Archived'];

export default function SavedJobs() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');

  const filtered = savedJobsData.filter(j => activeTab === 'All' || j.status === activeTab);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#171717', marginBottom: 6, letterSpacing: '-0.02em' }}>
          Saved Opportunities
        </h1>
        <p style={{ fontSize: 15, color: '#666666' }}>Track and manage your saved job applications.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#F0EEE9', padding: 4, borderRadius: 12, marginBottom: 24, width: 'fit-content' }}>
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', border: 'none',
              background: activeTab === t ? 'white' : 'transparent',
              color: activeTab === t ? '#171717' : '#666666',
              boxShadow: activeTab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {t}
            {t === 'Applied' && (
              <span style={{ marginLeft: 6, fontSize: 11, background: '#EDE9FF', color: '#6C5CE7', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>
                {savedJobsData.filter(j => j.status === 'Applied').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#EDE9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#171717', marginBottom: 8 }}>No saved jobs yet</h3>
          <p style={{ fontSize: 14, color: '#666666', marginBottom: 24 }}>Browse jobs and save the ones that interest you.</p>
          <button className="btn-primary" onClick={() => navigate('/jobs')}>Browse Jobs</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(job => {
            const sc = statusColors[job.status] || { text: '#8A8A8A', bg: '#F0EEE9' };
            return (
              <div key={job.id} className="card card-hover" style={{ padding: 22, display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: job.logoColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
                  {job.logo}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: 15, color: '#171717', marginBottom: 3 }}>{job.title}</h3>
                      <div style={{ fontSize: 13, color: '#666666' }}>{job.company} · {job.location} · {job.type} · {job.salary}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: job.match >= 80 ? '#35B879' : '#6C5CE7' }}>{job.match}% match</span>
                      <span style={{ padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: sc.text, background: sc.bg }}>{job.status}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button className="btn-secondary" onClick={() => navigate(`/jobs/${job.id}`)} style={{ padding: '8px 14px', fontSize: 13 }}>View</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
