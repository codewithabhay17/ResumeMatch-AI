import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const defaultSkills = ['React', 'JavaScript', 'Node.js', 'PostgreSQL', 'AWS', 'Git'];

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || 'User',
    title: user?.title || 'Software Developer',
    location: user?.location || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  });

  const completionItems = [
    { label: 'Profile Photo', done: false },
    { label: 'Work Experience', done: !!(user?.name) },
    { label: 'Skills', done: true },
    { label: 'Education', done: false },
    { label: 'Resume Uploaded', done: true },
    { label: 'Career Preferences', done: false },
    { label: 'Portfolio Link', done: false },
  ];
  const completion = Math.round((completionItems.filter(i => i.done).length / completionItems.length) * 100);

  const userInitial = (form.name || 'U')[0].toUpperCase();

  const handleSave = () => {
    // In a real app, this would call an API to save the profile
    setEditing(false);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#171717', letterSpacing: '-0.02em' }}>Your Profile</h1>
        <button
          className={editing ? 'btn-primary' : 'btn-secondary'}
          onClick={() => editing ? handleSave() : setEditing(true)}
          style={{ fontSize: 14, padding: '10px 20px' }}
        >
          {editing ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Save Changes
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
              Edit Profile
            </>
          )}
        </button>
      </div>

      {/* Profile header */}
      <div className="card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6C5CE7, #FF7A6B)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: 28,
              flexShrink: 0,
            }}>{userInitial}</div>
            {editing && (
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: '#6C5CE7', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid white' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
              </div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ fontSize: 18, fontWeight: 700 }} placeholder="Full name" />
                <input className="input-field" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Professional title" />
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#171717', marginBottom: 4 }}>{form.name}</h2>
                <p style={{ fontSize: 15, fontWeight: 500, color: '#666666', marginBottom: 8 }}>{form.title}</p>
              </>
            )}
            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#8A8A8A', flexWrap: 'wrap' }}>
              {form.location && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {form.location}
                </span>
              )}
              {form.email && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  {form.email}
                </span>
              )}
            </div>
          </div>

          {/* Completion ring */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ position: 'relative', width: 70, height: 70, margin: '0 auto 8px' }}>
              <svg width="70" height="70" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="35" cy="35" r="28" fill="none" stroke="#F0EEE9" strokeWidth="6"/>
                <circle cx="35" cy="35" r="28" fill="none" stroke="#35B879" strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 * (1 - completion / 100)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: '#171717' }}>{completion}%</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#8A8A8A', fontWeight: 500 }}>Profile Complete</div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#171717', marginBottom: 20 }}>Personal Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {[
            { label: 'Full Name', key: 'name' },
            { label: 'Professional Title', key: 'title' },
            { label: 'Location', key: 'location' },
            { label: 'Email', key: 'email' },
            { label: 'Phone', key: 'phone' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{f.label}</label>
              {editing ? (
                <input
                  className="input-field"
                  value={form[f.key] || ''}
                  onChange={e => setForm({...form, [f.key]: e.target.value})}
                  placeholder={`Enter ${f.label.toLowerCase()}`}
                />
              ) : (
                <p style={{ fontSize: 15, color: form[f.key] ? '#171717' : '#B8B5AF', fontWeight: 400 }}>
                  {form[f.key] || `No ${f.label.toLowerCase()} set`}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#171717', marginBottom: 16 }}>Bio</h3>
        {editing ? (
          <textarea
            className="input-field"
            value={form.bio}
            onChange={e => setForm({...form, bio: e.target.value})}
            placeholder="Tell us about yourself..."
            style={{ minHeight: 100, resize: 'vertical' }}
          />
        ) : (
          <p style={{ fontSize: 15, color: form.bio ? '#444444' : '#B8B5AF', lineHeight: 1.65 }}>
            {form.bio || 'No bio added yet. Click Edit Profile to add one.'}
          </p>
        )}
      </div>

      {/* Skills */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#171717', marginBottom: 16 }}>Skills</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {defaultSkills.map(s => <span key={s} className="skill-chip">{s}</span>)}
          {editing && (
            <button style={{ padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 500, background: 'white', border: '1.5px dashed #D4CEFF', color: '#6C5CE7', cursor: 'pointer' }}>
              + Add Skill
            </button>
          )}
        </div>
      </div>

      {/* Profile completion checklist */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#171717', marginBottom: 16 }}>Complete your profile</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {completionItems.map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: item.done ? '#D6F5E5' : '#F0EEE9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.done ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#35B879" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#B8B5AF' }} />
                )}
              </div>
              <span style={{ fontSize: 14, color: item.done ? '#444444' : '#666666' }}>{item.label}</span>
              {!item.done && <span style={{ marginLeft: 'auto', fontSize: 12, color: '#6C5CE7', fontWeight: 500, cursor: 'pointer' }}>Add →</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="card" style={{ padding: 24, marginBottom: 32, borderColor: '#FFD4CE' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: '#FF7A6B', marginBottom: 12 }}>Danger Zone</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={logout}
            style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid #FFD4CE', background: '#FFF5F3', color: '#FF7A6B', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
