import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: checked ? '#6C5CE7' : '#D4D2CE',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: 'white',
        position: 'absolute', top: 3,
        left: checked ? 23 : 3,
        transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
      }} />
    </button>
  );
}

function SettingRow({ label, desc, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #F0EEE9' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#171717' }}>{label}</div>
        {desc && <div style={{ fontSize: 13, color: '#8A8A8A', marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0, marginLeft: 20 }}>{children}</div>
    </div>
  );
}

const sections = [
  { id: 'account', label: 'Account', icon: '👤' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'privacy', label: 'Privacy & Security', icon: '🔒' },
  { id: 'ai', label: 'AI Preferences', icon: '🤖' },
  { id: 'appearance', label: 'Appearance', icon: '🎨' },
  { id: 'data', label: 'Data & Privacy', icon: '📋' },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('account');
  const [toggles, setToggles] = useState({
    emailJobMatches: true,
    emailWeeklyDigest: true,
    emailResumeTips: false,
    pushMatches: true,
    twoFactor: false,
    aiInsights: true,
    aiAutoAnalyze: true,
    shareAnalytics: false,
    darkMode: false,
    compactView: false,
  });

  const toggle = k => setToggles(prev => ({ ...prev, [k]: !prev[k] }));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const userInitial = (user?.name || 'U')[0].toUpperCase();
  const userName = user?.name || 'User';
  const userEmail = user?.email || 'No email';

  return (
    <div className="animate-fade-in" style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#171717', marginBottom: 28, letterSpacing: '-0.02em' }}>
        Settings
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
        {/* Section nav */}
        <div className="card" style={{ padding: 12, height: 'fit-content' }}>
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 12px',
                borderRadius: 10, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                background: activeSection === s.id ? '#EDE9FF' : 'transparent',
                color: activeSection === s.id ? '#6C5CE7' : '#666666',
                fontSize: 14, fontWeight: activeSection === s.id ? 600 : 400,
                transition: 'all 0.15s',
                marginBottom: 2,
              }}
            >
              <span>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card" style={{ padding: 28 }}>
          {activeSection === 'account' && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#171717', marginBottom: 20 }}>Account</h2>
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: '#FAFAF8', borderRadius: 12, marginBottom: 20 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #6C5CE7, #FF7A6B)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 18 }}>
                    {userInitial}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#171717' }}>{userName}</div>
                    <div style={{ fontSize: 13, color: '#8A8A8A' }}>{userEmail}</div>
                  </div>
                  <button className="btn-secondary" style={{ marginLeft: 'auto', padding: '8px 14px', fontSize: 13 }} onClick={() => navigate('/profile')}>Edit</button>
                </div>
                <SettingRow label="Email address" desc={userEmail}>
                  <button className="btn-ghost" style={{ fontSize: 13, color: '#6C5CE7' }}>Change →</button>
                </SettingRow>
                <SettingRow label="Change password" desc="Update your account password">
                  <button className="btn-ghost" onClick={() => navigate('/reset-password')} style={{ fontSize: 13, color: '#6C5CE7' }}>Update →</button>
                </SettingRow>
                <SettingRow label="Plan" desc="Free plan · Unlimited resume analyses">
                  <button className="btn-primary" style={{ padding: '6px 14px', fontSize: 12 }}>Upgrade</button>
                </SettingRow>
              </div>
              <div style={{ borderTop: '1px solid #E7E5E2', paddingTop: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#FF7A6B', marginBottom: 12 }}>Danger Zone</h3>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    onClick={logout}
                    style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid #FFD4CE', background: '#FFF5F3', color: '#FF7A6B', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                  >
                    Sign Out
                  </button>
                  {!showDeleteConfirm ? (
                    <button onClick={() => setShowDeleteConfirm(true)} style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid #E7E5E2', background: 'transparent', color: '#8A8A8A', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                      Delete Account
                    </button>
                  ) : (
                    <div style={{ background: '#FFF5F3', border: '1px solid #FFD4CE', borderRadius: 12, padding: 16, width: '100%' }}>
                      <p style={{ fontSize: 14, color: '#444444', marginBottom: 14 }}>Are you sure? This will permanently delete all your data. This action cannot be undone.</p>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button style={{ padding: '8px 16px', borderRadius: 8, background: '#FF7A6B', color: 'white', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Yes, delete my account</button>
                        <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeSection === 'notifications' && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#171717', marginBottom: 20 }}>Notifications</h2>
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Email</h4>
                <SettingRow label="New job matches" desc="Notify when new jobs match your profile">
                  <ToggleSwitch checked={toggles.emailJobMatches} onChange={() => toggle('emailJobMatches')} />
                </SettingRow>
                <SettingRow label="Weekly digest" desc="Summary of your career activity each Monday">
                  <ToggleSwitch checked={toggles.emailWeeklyDigest} onChange={() => toggle('emailWeeklyDigest')} />
                </SettingRow>
                <SettingRow label="Resume improvement tips" desc="Periodic tips to improve your resume">
                  <ToggleSwitch checked={toggles.emailResumeTips} onChange={() => toggle('emailResumeTips')} />
                </SettingRow>
              </div>
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Push</h4>
                <SettingRow label="Match notifications" desc="Real-time alerts for high-match jobs">
                  <ToggleSwitch checked={toggles.pushMatches} onChange={() => toggle('pushMatches')} />
                </SettingRow>
              </div>
            </>
          )}

          {activeSection === 'privacy' && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#171717', marginBottom: 20 }}>Privacy & Security</h2>
              <SettingRow label="Two-factor authentication" desc="Add an extra layer of security to your account">
                <ToggleSwitch checked={toggles.twoFactor} onChange={() => toggle('twoFactor')} />
              </SettingRow>
              <SettingRow label="Active sessions" desc="See where you're currently signed in">
                <button className="btn-ghost" style={{ fontSize: 13, color: '#6C5CE7' }}>View →</button>
              </SettingRow>
            </>
          )}

          {activeSection === 'ai' && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#171717', marginBottom: 20 }}>AI Preferences</h2>
              <SettingRow label="AI-powered insights" desc="Get personalized career recommendations">
                <ToggleSwitch checked={toggles.aiInsights} onChange={() => toggle('aiInsights')} />
              </SettingRow>
              <SettingRow label="Auto-analyze new resumes" desc="Automatically run analysis when you upload">
                <ToggleSwitch checked={toggles.aiAutoAnalyze} onChange={() => toggle('aiAutoAnalyze')} />
              </SettingRow>
              <SettingRow label="Share anonymized data" desc="Help improve AI accuracy for all users">
                <ToggleSwitch checked={toggles.shareAnalytics} onChange={() => toggle('shareAnalytics')} />
              </SettingRow>
            </>
          )}

          {activeSection === 'appearance' && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#171717', marginBottom: 20 }}>Appearance</h2>
              <SettingRow label="Dark mode" desc="Switch to a darker interface (coming soon)">
                <ToggleSwitch checked={toggles.darkMode} onChange={() => toggle('darkMode')} />
              </SettingRow>
              <SettingRow label="Compact view" desc="Show more content with reduced spacing">
                <ToggleSwitch checked={toggles.compactView} onChange={() => toggle('compactView')} />
              </SettingRow>
            </>
          )}

          {activeSection === 'data' && (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#171717', marginBottom: 20 }}>Data & Privacy</h2>
              <SettingRow label="Download your data" desc="Get a copy of all your data and analyses">
                <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }}>Download</button>
              </SettingRow>
              <SettingRow label="Clear resume data" desc="Remove all stored resume information">
                <button style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #FFD4CE', background: '#FFF5F3', color: '#FF7A6B', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Clear</button>
              </SettingRow>
              <div style={{ marginTop: 20, padding: 16, background: '#FAFAF8', borderRadius: 12, fontSize: 13, color: '#666666', lineHeight: 1.65 }}>
                Your resume data is stored securely and never shared with employers without your consent. AI analysis is performed in isolated environments and your data is never used to train external models without explicit opt-in.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
