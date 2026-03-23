import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Layout, User, MapPin, Mail, Phone, Zap, Sparkles, PenTool, Trash2 } from 'lucide-react';

const Home = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const fetchSessions = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/sessions')
      .then(res => res.json())
      .then(data => { if (data.sessions) setSessions(data.sessions); })
      .catch(err => console.error('Failed to load sessions', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSessions(); }, []);

  const handleCreateSession = () => navigate(`/board/${crypto.randomUUID()}`);

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this session? This cannot be undone.')) return;
    setDeletingId(sessionId);
    try {
      const resp = await fetch(`http://localhost:5000/api/sessions/${sessionId}`, { method: 'DELETE' });
      const result = await resp.json().catch(() => ({}));

      if (resp.status === 403 && result.rls_blocked) {
        alert('⚠️ Cannot delete: Row Level Security is enabled on your Supabase sessions table.\n\nFix: Go to Supabase Dashboard → Table Editor → sessions → Disable RLS.');
        setDeletingId(null);
        return;
      }

      if (!resp.ok) {
        alert(`Delete failed: ${result.error || resp.statusText}`);
        setDeletingId(null);
        return;
      }

      // Re-fetch from server as source of truth
      fetchSessions();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Network error during delete.');
    } finally {
      setDeletingId(null);
    }
  };


  return (
    <div style={{
      minHeight: '100vh', width: '100vw',
      background: 'var(--bg-primary)', color: 'var(--text-primary)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      overflowX: 'hidden'
    }}>

      {/* ── TOP NAV ── */}
      <nav style={{
        width: '100%', maxWidth: '1100px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '28px 40px 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', background: '#FFD600',
            borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <PenTool size={18} color="#0a0a0a" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            NoteCraft
          </span>
          <span className="badge" style={{ marginLeft: '8px' }}>Studio v5</span>
        </div>

        <button
          onClick={handleCreateSession}
          className="btn-pill btn-solid-blue"
          style={{ padding: '10px 24px', borderRadius: '6px', gap: '8px' }}
        >
          <Zap size={16} />
          New Session
        </button>
      </nav>

      {/* ── HERO ── */}
      <div className="animate-soft" style={{
        textAlign: 'center', maxWidth: '800px',
        padding: '80px 40px 60px', margin: '0 auto'
      }}>
        {/* Yellow accent bar */}
        <div style={{
          display: 'inline-block', width: '48px', height: '4px',
          background: '#FFD600', borderRadius: '2px', marginBottom: '32px'
        }} />

        <h1 style={{
          fontWeight: 700, fontSize: 'clamp(3rem, 6vw, 5.5rem)',
          lineHeight: 1.02, letterSpacing: '-0.04em',
          marginBottom: '24px', color: 'var(--text-primary)'
        }}>
          Your ideas,<br />
          <span style={{
            background: 'linear-gradient(135deg, #FFD600 0%, #FF9500 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            brilliantly
          </span>{' '}crafted.
        </h1>

        <p style={{
          color: 'var(--text-secondary)', fontSize: '1.15rem',
          lineHeight: 1.7, marginBottom: '48px', fontWeight: 400
        }}>
          AI-powered visual workspace. Draw, sketch, and create with
          texture-rich tools designed for thinkers.
        </p>

        <button
          onClick={handleCreateSession}
          className="btn-solid-blue"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            padding: '18px 48px', borderRadius: '8px', fontSize: '1rem',
            fontWeight: 700, letterSpacing: '0.02em', cursor: 'pointer',
            border: 'none', fontFamily: 'Space Grotesk, sans-serif',
            background: 'var(--text-primary)', color: 'var(--bg-primary)',
            boxShadow: 'var(--shadow-hover)', transition: 'all 0.2s ease'
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = '#FFD600';
            e.currentTarget.style.color = '#0a0a0a';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'var(--text-primary)';
            e.currentTarget.style.color = 'var(--bg-primary)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Sparkles size={20} />
          Launch Creative Session
          <ArrowRight size={20} />
        </button>

        {/* Feature chips */}
        <div style={{
          display: 'flex', gap: '12px', justifyContent: 'center',
          flexWrap: 'wrap', marginTop: '40px'
        }}>
          {['50 Textures', 'AI Pen', 'Voice Input', 'Magic Studio', 'Web Assets'].map(f => (
            <span key={f} style={{
              padding: '6px 16px', borderRadius: '4px',
              border: '1.5px solid var(--border-color)',
              fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)',
              letterSpacing: '0.04em', textTransform: 'uppercase'
            }}>{f}</span>
          ))}
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div style={{
        width: '100%', maxWidth: '1100px', padding: '0 40px',
        display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px'
      }}>
        <div style={{ height: '1px', flex: 1, background: 'var(--border-color)' }} />
        <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em',
          color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Recent Sessions
        </span>
        <div style={{ height: '1px', flex: 1, background: 'var(--border-color)' }} />
      </div>

      {/* ── SESSIONS ── */}
      <div style={{ width: '100%', maxWidth: '1100px', padding: '0 40px 40px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {[1,2,3].map(i => (
              <div key={i} className="shimmer" style={{ height: '140px', borderRadius: '8px' }} />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 40px',
            border: '2px dashed var(--border-color)', borderRadius: '8px',
            background: 'var(--bg-card)'
          }}>
            <div style={{
              width: '56px', height: '56px', background: 'var(--accent-yellow)',
              borderRadius: '8px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 20px'
            }}>
              <PenTool size={28} color="#0a0a0a" />
            </div>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600, margin: 0 }}>
              No sessions yet. Create your first one above!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {sessions.map(s => (
              <div
                key={s.id}
                className="card"
                onClick={() => deletingId !== s.id && navigate(`/board/${s.id}`)}
                style={{
                  padding: '24px', cursor: deletingId === s.id ? 'default' : 'pointer',
                  display: 'flex', flexDirection: 'column', gap: '14px',
                  opacity: deletingId === s.id ? 0.5 : 1,
                  transition: 'opacity 0.2s ease',
                }}
              >
                {/* Top row: dots + delete */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FFD600' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--border-color)' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--border-color)' }} />
                  </div>
                  <button
                    onClick={e => handleDelete(e, s.id)}
                    disabled={deletingId === s.id}
                    title="Delete session"
                    style={{
                      width: '28px', height: '28px', border: '1.5px solid var(--border-color)',
                      borderRadius: '5px',
                      background: deletingId === s.id ? '#dc2626' : 'var(--bg-secondary)',
                      cursor: deletingId === s.id ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s', padding: 0,
                    }}
                    onMouseOver={e => { if (deletingId !== s.id) { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.borderColor = '#dc2626'; } }}
                    onMouseOut={e => { if (deletingId !== s.id) { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; } }}
                  >
                    {deletingId === s.id
                      ? <span style={{ fontSize: '0.6rem', color: '#fff', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                      : <Trash2 size={13} color="var(--text-muted)" />
                    }
                  </button>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                    {s.name}
                  </h3>
                  <p style={{ margin: '5px 0 0', fontSize: '0.72rem', color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '0.72rem', fontWeight: 700, color: '#FFD600', letterSpacing: '0.05em' }}>
                  OPEN WORKSPACE <ArrowRight size={13} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── ABOUT ── */}
      <div style={{
        width: '100%', maxWidth: '1100px', padding: '0 40px 80px',
        marginTop: '20px'
      }}>
        <div style={{
          background: 'var(--bg-card)', border: '1.5px solid var(--border-color)',
          borderRadius: '8px', padding: '48px', display: 'flex',
          gap: '48px', alignItems: 'flex-start', flexWrap: 'wrap'
        }}>
          <div style={{
            width: '72px', height: '72px', background: '#FFD600',
            borderRadius: '8px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0
          }}>
            <User size={36} color="#0a0a0a" />
          </div>

          <div style={{ flex: 1, minWidth: '280px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '0.65rem', fontWeight: 700,
              color: 'var(--accent-yellow)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Lead Architect
            </p>
            <h3 style={{ margin: '0 0 20px', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
              Dhruv Meena
            </h3>
            <p style={{ margin: '0 0 32px', color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem',
              borderLeft: '3px solid #FFD600', paddingLeft: '16px' }}>
              "NoteCraft is built to democratize digital creativity. As a developer at IIT Patna,
              I wanted to break barriers between imagination and execution."
            </p>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px'
            }}>
              {[
                { icon: <User size={14} />, label: 'Institute', val: 'IIT Patna' },
                { icon: <Mail size={14} />, label: 'Email', val: 'dhruv123meena@gmail.com' },
                { icon: <Phone size={14} />, label: 'Contact', val: '+91 7850899192' },
                { icon: <MapPin size={14} />, label: 'Location', val: 'Bihta, Bihar' },
              ].map(item => (
                <div key={item.label}>
                  <p style={{ margin: '0 0 2px', fontSize: '0.65rem', fontWeight: 700,
                    letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase',
                    display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {item.icon} {item.label}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.val}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
