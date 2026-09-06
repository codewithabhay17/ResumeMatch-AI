import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh', background: '#F7F7F5',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 32, fontFamily: 'var(--font-sans)', textAlign: 'center'
    }}>
      {/* 3D path illustration */}
      <div className="animate-float" style={{ marginBottom: 40 }}>
        <div style={{ position: 'relative', width: 160, height: 120 }}>
          <svg viewBox="0 0 160 120" width="160" height="120">
            <defs>
              <linearGradient id="roadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#D4D2CE" />
                <stop offset="100%" stopColor="#E7E5E2" />
              </linearGradient>
            </defs>
            {/* Road */}
            <polygon points="60,10 100,10 160,110 0,110" fill="url(#roadGrad)" />
            {/* Dashes */}
            <line x1="80" y1="30" x2="80" y2="50" stroke="white" strokeWidth="4" strokeDasharray="8,6"/>
            <line x1="80" y1="60" x2="80" y2="80" stroke="white" strokeWidth="5" strokeDasharray="8,6"/>
            <line x1="80" y1="88" x2="80" y2="100" stroke="white" strokeWidth="6" strokeDasharray="8,6"/>
            {/* Sign */}
            <rect x="48" y="8" width="32" height="20" rx="4" fill="#6C5CE7"/>
            <text x="64" y="22" textAnchor="middle" fill="white" fontSize="10" fontWeight="800">404</text>
            <rect x="63" y="28" width="2" height="10" fill="#8A8A8A"/>
          </svg>
          {/* Question mark orb */}
          <div style={{
            position: 'absolute', top: -10, right: -10,
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF7A6B, #FFB3AB)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(255,122,107,0.4)',
            fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'white',
          }}>?</div>
        </div>
      </div>

      <div style={{ fontFamily: 'var(--font-display)', fontSize: 80, fontWeight: 900, color: '#E7E5E2', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 16 }}>
        404
      </div>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: '#171717', marginBottom: 12, letterSpacing: '-0.02em' }}>
        This career path doesn&apos;t exist.
      </h1>
      <p style={{ fontSize: 16, color: '#666666', marginBottom: 36 }}>
        Let&apos;s get you back on track.
      </p>
      <button className="btn-primary" onClick={() => navigate('/dashboard')} style={{ fontSize: 16, padding: '14px 28px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        Back to Dashboard
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </button>
    </div>
  );
}
