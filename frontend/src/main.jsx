import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, NavLink, Route, Routes, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });
api.interceptors.request.use(c => {
  const t = localStorage.getItem('es_token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && !err.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('es_token');
      localStorage.removeItem('es_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

const pics = {
  tech: [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=85'
  ],
  business: [
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=85'
  ],
  music: [
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=85'
  ],
  education: [
    'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=85'
  ],
  health: [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=85'
  ],
  food: [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85'
  ],
  expo: [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=85'
  ]
};

function pickVariant(list, seed) {
  const str = String(seed || '');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
  }
  return list[Math.abs(hash) % list.length];
}

function imageFor(e) {
  if (e?.imageUrl) return e.imageUrl;
  const t = ((e?.theme || '') + ' ' + (e?.title || '')).toLowerCase();
  const seed = e?._id || e?.title || 'event';
  
  if (t.includes('tech') || t.includes('innovat') || t.includes('ai') || t.includes('software') || t.includes('cyber')) {
    return pickVariant(pics.tech, seed);
  }
  if (t.includes('business') || t.includes('trade') || t.includes('financ') || t.includes('market') || t.includes('startup')) {
    return pickVariant(pics.business, seed);
  }
  if (t.includes('music') || t.includes('art') || t.includes('fest') || t.includes('cultur') || t.includes('film') || t.includes('design')) {
    return pickVariant(pics.music, seed);
  }
  if (t.includes('educat') || t.includes('learn') || t.includes('school') || t.includes('univers') || t.includes('teach') || t.includes('acad')) {
    return pickVariant(pics.education, seed);
  }
  if (t.includes('health') || t.includes('medic') || t.includes('pharma') || t.includes('wellness') || t.includes('care')) {
    return pickVariant(pics.health, seed);
  }
  if (t.includes('food') || t.includes('culinary') || t.includes('dine') || t.includes('cook') || t.includes('restaur')) {
    return pickVariant(pics.food, seed);
  }
  return pickVariant(pics.expo, seed);
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('es_user') || 'null');
  } catch {
    return null;
  }
}

// 24-Hour Time Slots (48 intervals of 30 minutes from 12:00 AM to 11:30 PM)
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = (i % 2) * 30;
  const val = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const label = `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
  return { value: val, label };
});

const MONTHS = [
  { value: '01', label: 'Jan' },
  { value: '02', label: 'Feb' },
  { value: '03', label: 'Mar' },
  { value: '04', label: 'Apr' },
  { value: '05', label: 'May' },
  { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' },
  { value: '08', label: 'Aug' },
  { value: '09', label: 'Sep' },
  { value: '10', label: 'Oct' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dec' }
];

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const YEARS = ['2026', '2027', '2028', '2029', '2030'];

function handleLogout() {
  localStorage.removeItem('es_token');
  localStorage.removeItem('es_user');
  window.location.href = '/login';
}

function ConfirmModal({ isOpen, title, message, confirmText = 'Confirm', confirmVariant = 'danger', onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="custom-modal-backdrop" onClick={onCancel}>
      <div className="custom-modal-card" onClick={e => e.stopPropagation()}>
        <div className="custom-modal-icon">⚠️</div>
        <h4>{title || 'Are you sure?'}</h4>
        <p>{message}</p>
        <div className="custom-modal-actions">
          <button className="btn btn-light-outline" onClick={onCancel}>Cancel</button>
          <button className={`btn ${confirmVariant === 'danger' ? 'btn-danger' : 'btn-purple'}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewModal({ isOpen, onClose, onReviewSubmitted, user, fixedExpo, defaultExpoId, confirmedExpos = [] }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedExpo, setSelectedExpo] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  function handleStarClick(star) {
    if (star === rating) {
      // Clicking the active star removes it
      setRating(prev => Math.max(1, prev - 1));
    } else {
      setRating(star);
    }
  }

  useEffect(() => {
    if (fixedExpo) {
      setSelectedExpo(fixedExpo._id || fixedExpo.id);
    } else if (defaultExpoId) {
      setSelectedExpo(defaultExpoId);
    } else if (confirmedExpos.length > 0) {
      setSelectedExpo(confirmedExpos[0].id);
    }
  }, [fixedExpo, defaultExpoId, confirmedExpos, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please write a short review or feedback.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/reviews', {
        rating,
        comment: comment.trim(),
        expoId: selectedExpo || undefined
      });
      setMsg(res.data.message || 'Review submitted successfully!');
      if (onReviewSubmitted) onReviewSubmitted(res.data.data);
      setTimeout(() => {
        setMsg('');
        setComment('');
        setRating(5);
        onClose();
      }, 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="custom-modal-backdrop" onClick={onClose}>
      <div className="custom-modal-card text-start" style={{ maxWidth: '520px', textAlign: 'left' }} onClick={e => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="m-0" style={{ fontSize: '19px', fontWeight: '800' }}>✍️ Share Your Attendee Experience</h4>
          <button className="btn btn-sm btn-light border-0" onClick={onClose}>✕</button>
        </div>

        {msg ? (
          <div className="text-center py-4">
            <div style={{ fontSize: '46px', marginBottom: '12px' }}>✅</div>
            <h5 className="fw-bold text-success mb-2">Review Published Successfully!</h5>
            <p className="text-muted small mb-4">{msg}</p>
            <button className="btn btn-purple px-4" onClick={() => { setMsg(''); setComment(''); onClose(); }}>
              Done / Close
            </button>
          </div>
        ) : (
          <>
            <p className="text-muted small mb-3">
              Your verified review will appear publicly on EventSphere showcasing the confirmed event you attended.
            </p>

            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            <form onSubmit={handleSubmit}>
              {/* Confirmed Event Display or Selector */}
              {fixedExpo ? (
                <div className="mb-3">
                  <label className="fw-bold small d-block mb-1">Confirmed Event</label>
                  <div className="p-2 px-3 rounded border bg-light d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ fontSize: '18px' }}>🎪</span>
                      <strong className="text-dark small">{fixedExpo.title}</strong>
                    </div>
                    <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '10px' }}>
                      Confirmed
                    </span>
                  </div>
                </div>
              ) : confirmedExpos.length > 0 ? (
                <div className="mb-3">
                  <label className="fw-bold small d-block mb-1">Select Confirmed Event *</label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedExpo}
                    onChange={e => setSelectedExpo(e.target.value)}
                    required
                  >
                    {confirmedExpos.map(exp => (
                      <option key={exp.id} value={exp.id}>
                        🎪 {exp.title}
                      </option>
                    ))}
                  </select>
                  <small className="text-muted" style={{ fontSize: '11px' }}>
                    Only events with active confirmed tickets are listed. Cancelled bookings cannot be reviewed.
                  </small>
                </div>
              ) : (
                <div className="alert alert-warning py-2 small mb-3">
                  ⚠️ No active confirmed bookings found. Cancelled bookings cannot be reviewed.
                </div>
              )}

              <div className="mb-3">
                <label className="fw-bold small d-block mb-1">Your Rating</label>
                <div className="d-flex gap-2 align-items-center">
                  {[1, 2, 3, 4, 5].map(star => {
                    const isFilled = star <= rating;
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => handleStarClick(star)}
                        title={`${star} Star${star > 1 ? 's' : ''}`}
                        style={{
                          background: 'none',
                          border: 'none',
                          outline: 'none',
                          boxShadow: 'none',
                          cursor: 'pointer',
                          fontSize: '32px',
                          color: isFilled ? '#f59e0b' : '#94a3b8',
                          padding: '0 2px',
                          lineHeight: 1,
                          transition: 'color 0.15s ease'
                        }}
                      >
                        {isFilled ? '★' : '☆'}
                      </button>
                    );
                  })}
                  <span className="ms-2 fw-bold text-warning small">{rating} / 5 Stars</span>
                </div>
              </div>

              <div className="mb-3">
                <label className="fw-bold small d-block mb-1">Your Profile</label>
                <div className="d-flex align-items-center gap-2 p-2 bg-light rounded border">
                  <span className="fw-bold small">{user?.name || 'Attendee'}</span>
                  <span className="admin-badge badge-attendee">Verified Attendee</span>
                </div>
              </div>

              <div className="mb-3">
                <label className="fw-bold small d-block mb-1">Your Experience / Feedback</label>
                <textarea
                  className="form-control"
                  rows={4}
                  required
                  placeholder="Tell us about your event experience, speaker talks, stall exhibits, and venue arrangements..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                <button type="button" className="btn btn-light-outline" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-purple" disabled={loading || !confirmedExpos.length}>
                  {loading ? 'Submitting...' : 'Post Review ↗'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   MODERN BRAND LOGO COMPONENT
   ========================================================================== */
function BrandLogo({ subtitle = 'PLAN · ATTEND · EXPERIENCE', size = 'normal', className = '', to = '/' }) {
  return (
    <Link className={`brand-logo-wrap size-${size} ${className}`} to={to}>
      <div className="brand-logo-icon">
        <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="brand-svg">
          <defs>
            <linearGradient id="esCoreGrad" x1="6" y1="6" x2="38" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="50%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
            <linearGradient id="esRingGrad" x1="2" y1="22" x2="42" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <radialGradient id="esGlowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ambient Glow */}
          <circle cx="22" cy="22" r="18" fill="url(#esGlowGrad)" opacity="0.3" />

          {/* Tilted Orbital Ring 1 */}
          <ellipse cx="22" cy="22" rx="19.5" ry="7.5" transform="rotate(-28 22 22)" stroke="url(#esRingGrad)" strokeWidth="2.2" strokeDasharray="3 1.5" opacity="0.9" />

          {/* 3D Sphere Core */}
          <circle cx="22" cy="22" r="11" fill="url(#esCoreGrad)" />

          {/* Latitude & Longitude contours for 3D sphere feel */}
          <path d="M12.5 22 C12.5 16, 31.5 16, 31.5 22 C31.5 28, 12.5 28, 12.5 22 Z" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none" />
          <ellipse cx="22" cy="22" rx="5" ry="11" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" fill="none" />

          {/* Specular Highlight */}
          <circle cx="18" cy="18" r="2.8" fill="#ffffff" opacity="0.85" />
          <circle cx="16" cy="16" r="1" fill="#ffffff" opacity="0.95" />

          {/* Tilted Orbital Ring 2 */}
          <ellipse cx="22" cy="22" rx="19.5" ry="6.5" transform="rotate(40 22 22)" stroke="url(#esRingGrad)" strokeWidth="1.6" opacity="0.65" />

          {/* Event Star Sparkle */}
          <path d="M37 13 L38 16 L41 17 L38 18 L37 21 L36 18 L33 17 L36 16 Z" fill="#38bdf8" />
        </svg>
      </div>
      <div className="brand-logo-text">
        <span className="brand-title">Event<span className="brand-title-accent">Sphere</span></span>
        {subtitle && <small className="brand-subtitle">{subtitle}</small>}
      </div>
    </Link>
  );
}

/* ==========================================================================
   PUBLIC NAVBAR & LAYOUT
   ========================================================================== */
function Nav({ user }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const role = user?.role;

  // Auto-close mobile navbar on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const closeNav = () => setOpen(false);

  const roleMeta = {
    admin: { label: 'Admin', icon: '👑', colorClass: 'badge-nav-admin' },
    organizer: { label: 'Organizer', icon: '🎪', colorClass: 'badge-nav-organizer' },
    exhibitor: { label: 'Exhibitor', icon: '🏢', colorClass: 'badge-nav-exhibitor' },
    attendee: { label: 'Attendee', icon: '🎟️', colorClass: 'badge-nav-attendee' }
  };
  const meta = roleMeta[role] || { label: role || 'Member', icon: '👤', colorClass: 'badge-nav-attendee' };
  const initials = user?.name
    ? user.name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark site-nav sticky-top">
      <div className="container">
        <div onClick={closeNav}>
          <BrandLogo to={isAuthPage ? "/login" : "/"} subtitle="PLAN · ATTEND · EXPERIENCE" />
        </div>
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className={`collapse navbar-collapse ${open ? 'show' : ''}`}>
          <div className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
            {!isAuthPage && (
              <>
                <Link className="nav-link" to="/" onClick={closeNav}>Home</Link>
                <Link className="nav-link" to="/events" onClick={closeNav}>Explore Events</Link>
                <Link className="nav-link" to="/schedule" onClick={closeNav}>Schedule</Link>
              </>
            )}
            
            {user && role === 'attendee' && (
              <Link className="nav-link" to="/bookings" onClick={closeNav}>My Bookings</Link>
            )}
            {user && role === 'exhibitor' && (
              <Link className="nav-link text-info fw-bold" to="/exhibitors" onClick={closeNav}>🏢 Exhibitor Portal</Link>
            )}
            {user && role === 'organizer' && (
              <Link className="nav-link text-warning fw-bold" to="/organizer/expos" onClick={closeNav}>🎪 Organizer Portal</Link>
            )}
            {user && role === 'admin' && (
              <Link className="nav-link text-info fw-bold" to="/admin/dashboard" onClick={closeNav}>⚡ Admin Panel</Link>
            )}

            {user ? (
              <div className="nav-profile-group ms-lg-2">
                <div className="nav-profile-pill">
                  <div className="nav-profile-avatar">
                    {initials}
                  </div>
                  <div className="nav-profile-details">
                    <div className="d-flex align-items-center gap-2">
                      <span className="nav-profile-name">{user.name}</span>
                      <span className={`nav-profile-role ${meta.colorClass}`}>
                        <span>{meta.icon}</span> {meta.label}
                      </span>
                    </div>
                    <span className="nav-profile-email">{user.email}</span>
                  </div>
                </div>
                <button
                  className="btn-nav-logout"
                  onClick={() => {
                    closeNav();
                    handleLogout();
                  }}
                  title="Sign Out"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            ) : isAuthPage ? (
              location.pathname === '/login' ? (
                <Link className="btn btn-purple ms-lg-2" to="/register" onClick={closeNav}>Create Account</Link>
              ) : (
                <Link className="btn btn-nav-outline ms-lg-2" to="/login" onClick={closeNav}>Sign In</Link>
              )
            ) : (
              <>
                <Link className="btn btn-nav-outline ms-lg-2" to="/login" onClick={closeNav}>Login</Link>
                <Link className="btn btn-purple" to="/register" onClick={closeNav}>Create Account</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div>
          <BrandLogo to="/" subtitle="PLAN · ATTEND · EXPERIENCE" />
          <p className="mt-2 text-muted small">Pakistan's premier event & expo management network.</p>
        </div>
        <div>
          <b>Explore</b>
          <Link to="/events">Events</Link>
          <Link to="/schedule">Schedule</Link>
          <Link to="/exhibitors">Exhibitors</Link>
        </div>
        <div>
          <b>Your Account</b>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/bookings">My Bookings</Link>
        </div>
        <div>
          <b>Stay Connected</b>
          <p>Discover experiences that bring people together.</p>
          <span className="footer-social">in&nbsp;&nbsp; ◎ &nbsp; f</span>
        </div>
      </div>
      <div className="container footer-bottom">
        © {new Date().getFullYear()} EventSphere Management <span>Made for memorable moments.</span>
      </div>
    </footer>
  );
}

function PublicLayout({ user, children }) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      <Nav user={user} />
      {children}
      {!isAuthPage && <Footer />}
    </>
  );
}

/* ==========================================================================
   PROFESSIONAL SIDEBAR DASHBOARD LAYOUT (FOR ADMIN & ORGANIZER)
   ========================================================================== */
function DashboardLayout({ user, title, subtitle, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = user?.role;

  // Authorization Guard
  if (!user) return <Navigate to="/login" replace />;
  if (role !== 'admin' && role !== 'organizer' && role !== 'exhibitor') return <Navigate to="/" replace />;

  const adminLinks = [
    { to: '/admin/dashboard', icon: '📊', label: 'Overview & Metrics' },
    { to: '/admin/users', icon: '👥', label: 'User Management' },
    { to: '/admin/expos', icon: '🎪', label: 'Expos & Events' },
    { to: '/admin/exhibitors', icon: '🏢', label: 'Exhibitor Approvals' },
    { to: '/admin/bookings', icon: '🎫', label: 'All Bookings' },
  ];

  const organizerLinks = [
    { to: '/organizer/expos', icon: '🎪', label: 'My Expos' },
    { to: '/organizer/sessions', icon: '🎤', label: 'Sessions & Schedule' },
    { to: '/organizer/exhibitors', icon: '🏢', label: 'Booth Applications' },
    { to: '/organizer/bookings', icon: '🎟️', label: 'Attendee Bookings' },
  ];

  const exhibitorLinks = [
    { to: '/exhibitors', icon: '🏢', label: 'Booth Portal' },
  ];

  const links = role === 'admin' ? adminLinks : role === 'organizer' ? organizerLinks : exhibitorLinks;

  return (
    <div className="admin-wrapper">
      <div className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)} />
      
      {/* LEFT SIDEBAR */}
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-brand" onClick={() => setMobileOpen(false)}>
          <BrandLogo 
            to={role === 'admin' ? '/admin/dashboard' : role === 'organizer' ? '/organizer/expos' : '/exhibitors'}
            subtitle={role === 'admin' ? 'SUPER ADMIN CONSOLE' : role === 'organizer' ? 'ORGANIZER PORTAL' : 'EXHIBITOR PORTAL'}
          />
        </div>

        <div className="sidebar-menu">
          <span className="sidebar-menu-title">Main Navigation</span>
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="sidebar-link-icon">{l.icon}</span>
              <span>{l.label}</span>
            </NavLink>
          ))}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn-toggle-sidebar"
              onClick={() => {
                if (window.innerWidth > 991) {
                  setCollapsed(!collapsed);
                } else {
                  setMobileOpen(!mobileOpen);
                }
              }}
              aria-label="Toggle Sidebar"
              title="Toggle Sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div className="admin-topbar-title">
              <h4>{title}</h4>
              <span>{subtitle}</span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="user-header-profile">
              <div className="user-avatar">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
              </div>
              <div className="user-info-meta d-none d-sm-flex">
                <div className="d-flex align-items-center gap-2">
                  <span className="user-info-name">{user?.name}</span>
                  <span className={`admin-badge badge-${role}`}>
                    {role === 'admin' ? '👑 Admin' : role === 'organizer' ? '🎪 Organizer' : role === 'exhibitor' ? '🏢 Exhibitor' : '🎟️ Attendee'}
                  </span>
                </div>
                <span className="user-info-email">{user?.email}</span>
              </div>
            </div>

            <button className="btn-logout-header" onClick={handleLogout} title="Sign Out">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="admin-body">
          {children}
        </main>
      </div>
    </div>
  );
}

/* ==========================================================================
   ADMIN PAGES (DEDICATED INDIVIDUAL PAGES)
   ========================================================================== */

// 1. Admin Overview & Metrics Page
function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalExpos: 0, totalBookings: 0, totalRevenue: 0, roleCounts: {} });
  const [recentBookings, setRecentBookings] = useState([]);

  const loadData = () => {
    api.get('/users/stats').then(r => setStats(r.data.data || {})).catch(() => {});
    api.get('/bookings').then(r => setRecentBookings(r.data.data || [])).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const processRefund = async (id) => {
    try {
      await api.patch(`/bookings/${id}/refund`);
      loadData();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to process refund');
    }
  };

  return (
    <div>
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <span className="stat-card-label">Total Users</span>
            <span className="stat-card-num">{stats.totalUsers || 0}</span>
            <div className="d-flex flex-wrap gap-1 mt-2">
              <span className="admin-badge badge-admin">{stats.roleCounts?.admin || 0} Admin</span>
              <span className="admin-badge badge-organizer">{stats.roleCounts?.organizer || 0} Org</span>
              <span className="admin-badge badge-exhibitor">{stats.roleCounts?.exhibitor || 0} Exh</span>
              <span className="admin-badge badge-attendee">{stats.roleCounts?.attendee || 0} Att</span>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <span className="stat-card-label">Total Expos</span>
            <span className="stat-card-num">{stats.totalExpos || 0}</span>
            <small className="text-muted mt-2">Active upcoming platform events</small>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <span className="stat-card-label">Active Bookings</span>
            <div className="d-flex align-items-baseline gap-2">
              <span className="stat-card-num">{stats.totalBookings || 0}</span>
              {Boolean(stats.cancelledBookings) && (
                <span className="badge bg-light text-muted border" style={{ fontSize: '10px' }}>
                  {stats.cancelledBookings} Cancelled
                </span>
              )}
            </div>
            <small className="text-muted mt-2">Confirmed active reservations</small>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="stat-card">
            <span className="stat-card-label">Total Revenue</span>
            <span className="stat-card-num" style={{ color: '#7435ed' }}>Rs. {(stats.totalRevenue || 0).toLocaleString()}</span>
            <small className="text-muted mt-2">Confirmed ticket sales</small>
          </div>
        </div>
      </div>

      <div className="dashboard-events">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Recent Platform Bookings <span>Latest {recentBookings.slice(0, 6).length}</span></h2>
          <Link to="/admin/bookings" className="btn btn-sm btn-outline-secondary">View All Reservations →</Link>
        </div>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Attendee</th>
                <th>Event</th>
                <th>Ticket Type</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.slice(0, 6).map(b => (
                <tr key={b._id}>
                  <td><b>{b.user?.name || 'N/A'}</b><br /><small className="text-muted">{b.user?.email}</small></td>
                  <td>{b.expo?.title || 'N/A'}</td>
                  <td>{b.ticketType}</td>
                  <td>{b.quantity}</td>
                  <td><b>Rs. {(b.total || 0).toLocaleString()}</b></td>
                  <td>
                    <span className="badge bg-light text-dark border">
                      {b.paymentMethod === 'online' ? `💳 Online (${(b.paymentProvider || 'Card').toUpperCase()})` : '🏢 Venue Desk'}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge badge-${b.status}`}>{b.status}</span>
                    {b.paymentStatus === 'refund_pending' && (
                      <div className="mt-1">
                        <span className="badge bg-warning text-dark d-block mb-1">Refund Pending (24h)</span>
                        <button
                          className="btn btn-sm btn-outline-success py-0 px-2"
                          style={{ fontSize: '11px' }}
                          onClick={() => processRefund(b._id)}
                          title="Mark refund as completed"
                        >
                          Approve Refund ✓
                        </button>
                      </div>
                    )}
                    {b.paymentStatus === 'refunded' && (
                      <div className="badge bg-success text-white d-block mt-1">Refunded ✓</div>
                    )}
                    {b.paymentStatus === 'paid' && b.status === 'confirmed' && (
                      <div className="small text-success fw-bold mt-1">Paid</div>
                    )}
                    {b.paymentMethod === 'venue' && b.status === 'cancelled' && (
                      <div className="small text-muted mt-1">No payment deducted</div>
                    )}
                  </td>
                </tr>
              ))}
              {!recentBookings.length && (
                <tr><td colSpan="7" className="text-center py-4 text-muted">No reservations recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 2. Admin User Management Page
function AdminUsers({ user }) {
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'organizer' });
  const [userMsg, setUserMsg] = useState('');
  const [userBusy, setUserBusy] = useState(false);

  const loadUsers = () => api.get('/users').then(r => setUsers(r.data.data || [])).catch(() => {});

  useEffect(() => { loadUsers(); }, []);

  async function createUser(e) {
    e.preventDefault();
    setUserBusy(true);
    setUserMsg('');
    try {
      const r = await api.post('/users', userForm);
      setUserMsg(r.data.message || 'User created successfully!');
      setUserForm({ name: '', email: '', password: '', role: 'organizer' });
      loadUsers();
    } catch (err) {
      setUserMsg(err.response?.data?.message || 'Failed to create user');
    } finally {
      setUserBusy(false);
    }
  }

  async function changeRole(userId, newRole) {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update role');
    }
  }

  async function removeUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${userId}`);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete user');
    }
  }

  const filteredUsers = users.filter(u => {
    const m = (u.name + ' ' + u.email).toLowerCase().includes(userSearch.toLowerCase());
    const r = userRoleFilter === 'all' || u.role === userRoleFilter;
    return m && r;
  });

  return (
    <div className="dashboard-layout">
      {/* Create User Form */}
      <form className="dashboard-form" onSubmit={createUser}>
        <h2>Create User & Assign Role</h2>
        <p className="text-muted small">Add new administrators, organizers, exhibitors, or attendees.</p>

        <label>Full Name</label>
        <input className="form-control" required value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} placeholder="e.g. Asad Rauf" />

        <label>Email Address</label>
        <input type="email" className="form-control" required value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} placeholder="user@eventsphere.com" />

        <label>Password</label>
        <input type="password" className="form-control" minLength="6" required value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} placeholder="Min 6 characters" />

        <label>Assign Role</label>
        <select className="form-select" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
          <option value="organizer">Organizer (Manage Expos & Sessions)</option>
          <option value="exhibitor">Exhibitor (Apply for Booths)</option>
          <option value="attendee">Attendee (Standard User)</option>
          <option value="admin">Admin (System Access)</option>
        </select>

        <button className="btn btn-purple mt-3 w-100" disabled={userBusy}>
          {userBusy ? 'Creating...' : 'Create Account & Assign Role ↗'}
        </button>
        {userMsg && <div className="alert alert-info mt-3">{userMsg}</div>}
      </form>

      {/* Users Directory */}
      <div className="dashboard-events">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Users Directory <span>{filteredUsers.length}</span></h2>
        </div>
        <div className="row g-2 mb-3">
          <div className="col-7">
            <input className="form-control form-control-sm" placeholder="Search by name or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
          </div>
          <div className="col-5">
            <select className="form-select form-select-sm" value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="organizer">Organizer</option>
              <option value="exhibitor">Exhibitor</option>
              <option value="attendee">Attendee</option>
            </select>
          </div>
        </div>
        <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
          {filteredUsers.map(u => (
            <div className="manage-event" key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <b>{u.name}</b>
                <small>{u.email}</small>
                <span className={`admin-badge badge-${u.role} mt-1`}>{u.role}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                {u._id !== user?.id && (
                  <button className="btn btn-sm btn-outline-danger" onClick={() => removeUser(u._id)} title="Delete user">✕</button>
                )}
              </div>
            </div>
          ))}
          {!filteredUsers.length && <div className="empty-state">No matching users found.</div>}
        </div>
      </div>
    </div>
  );
}

// 3. Admin Expos Management Page
function AdminExpos() {
  const [events, setEvents] = useState([]);
  const [expoForm, setExpoForm] = useState({
    title: '',
    eventDay: '15',
    eventMonth: '11',
    eventYear: '2026',
    startTime: '10:00',
    endTime: '18:00',
    location: '',
    description: '',
    theme: '',
    imageUrl: '',
    boothCount: 30
  });
  const [expoMsg, setExpoMsg] = useState('');

  const loadExpos = () => api.get('/expos').then(r => setEvents(r.data.data || [])).catch(() => {});

  useEffect(() => { loadExpos(); }, []);

  async function createExpo(e) {
    e.preventDefault();
    try {
      const dateStr = `${expoForm.eventYear}-${expoForm.eventMonth}-${expoForm.eventDay}T${expoForm.startTime || '10:00'}:00`;
      const startDate = new Date(dateStr);

      let endDate = undefined;
      if (expoForm.endTime) {
        const endDateStr = `${expoForm.eventYear}-${expoForm.eventMonth}-${expoForm.eventDay}T${expoForm.endTime}:00`;
        endDate = new Date(endDateStr).toISOString();
      }

      await api.post('/expos', {
        title: expoForm.title,
        date: startDate.toISOString(),
        endDate,
        location: expoForm.location,
        description: expoForm.description,
        theme: expoForm.theme,
        imageUrl: expoForm.imageUrl,
        boothCount: expoForm.boothCount
      });
      setExpoMsg('Expo created successfully!');
      setExpoForm({ title: '', eventDay: '15', eventMonth: '11', eventYear: '2026', startTime: '10:00', endTime: '18:00', location: '', description: '', theme: '', imageUrl: '', boothCount: 30 });
      loadExpos();
    } catch (err) {
      setExpoMsg(err.response?.data?.message || 'Failed to create expo');
    }
  }

  async function removeExpo(id) {
    if (!confirm('Delete this event?')) return;
    try {
      await api.delete(`/expos/${id}`);
      loadExpos();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  }

  return (
    <div className="dashboard-layout">
      <form className="dashboard-form" onSubmit={createExpo}>
        <h2>Publish New Expo</h2>
        <label>Event Title</label>
        <input className="form-control" required value={expoForm.title} onChange={e => setExpoForm({ ...expoForm, title: e.target.value })} />
        <label className="fw-bold small mb-1">Event Date (Day / Month / Year) *</label>
        <div className="row g-2 mb-2">
          <div className="col-4">
            <select
              className="form-select"
              required
              value={expoForm.eventDay}
              onChange={e => setExpoForm({ ...expoForm, eventDay: e.target.value })}
            >
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="col-4">
            <select
              className="form-select"
              required
              value={expoForm.eventMonth}
              onChange={e => setExpoForm({ ...expoForm, eventMonth: e.target.value })}
            >
              {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className="col-4">
            <select
              className="form-select"
              required
              value={expoForm.eventYear}
              onChange={e => setExpoForm({ ...expoForm, eventYear: e.target.value })}
            >
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="row g-2 mb-2">
          <div className="col-md-6">
            <label className="fw-bold small mb-1">Daily Start Time *</label>
            <select
              className="form-select"
              required
              value={expoForm.startTime}
              onChange={e => setExpoForm({ ...expoForm, startTime: e.target.value })}
            >
              {TIME_SLOTS.map(t => (
                <option key={t.value} value={t.value}>⏰ {t.label}</option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="fw-bold small mb-1">Daily Ending Time <small className="text-muted fw-normal">(Optional)</small></label>
            <select
              className="form-select"
              value={expoForm.endTime}
              onChange={e => setExpoForm({ ...expoForm, endTime: e.target.value })}
            >
              <option value="">No End Time</option>
              {TIME_SLOTS.map(t => (
                <option key={t.value} value={t.value}>⏰ {t.label}</option>
              ))}
            </select>
          </div>
        </div>
        <label>Location Venue</label>
        <input className="form-control" required value={expoForm.location} onChange={e => setExpoForm({ ...expoForm, location: e.target.value })} />
        <label>Category / Theme</label>
        <input className="form-control" value={expoForm.theme} onChange={e => setExpoForm({ ...expoForm, theme: e.target.value })} placeholder="e.g. Technology & Innovation" />
        <label>Banner Image URL <small className="text-muted fw-normal">(Optional — paste custom link or leave blank for auto image)</small></label>
        <input type="url" className="form-control" value={expoForm.imageUrl} onChange={e => setExpoForm({ ...expoForm, imageUrl: e.target.value })} placeholder="https://example.com/banner.jpg" />
        {expoForm.imageUrl && (
          <div className="mt-2 text-center" style={{ maxHeight: '130px', overflow: 'hidden', borderRadius: '8px', border: '1px solid #e2ddf0' }}>
            <img src={expoForm.imageUrl} alt="Banner Preview" style={{ width: '100%', height: '130px', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
        )}
        <label>Available Booths / Stall Capacity</label>
        <input type="number" min="1" max="500" className="form-control" required value={expoForm.boothCount} onChange={e => setExpoForm({ ...expoForm, boothCount: e.target.value })} placeholder="e.g. 40" />
        <label>Description</label>
        <textarea className="form-control" rows="3" value={expoForm.description} onChange={e => setExpoForm({ ...expoForm, description: e.target.value })} placeholder="Brief summary of the expo..." />
        <button className="btn btn-purple mt-3">Publish Expo ↗</button>
        {expoMsg && <div className="alert alert-info mt-3">{expoMsg}</div>}
      </form>

      <div className="dashboard-events">
        <h2>All Platform Expos <span>{events.length}</span></h2>
        <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
          {events.map(e => (
            <div className="manage-event" key={e._id}>
              <div>
                <b>{e.title}</b>
                <small>{e.location} · {new Date(e.date).toLocaleDateString()}</small>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <span className="text-muted small">{e.theme || 'General'}</span>
                  <span className="admin-badge badge-organizer">{e.boothCount || 30} Booths</span>
                </div>
              </div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => removeExpo(e._id)}>Delete</button>
            </div>
          ))}
          {!events.length && <div className="empty-state">No expos published yet.</div>}
        </div>
      </div>
    </div>
  );
}

// Shared Exhibitor Table Component (Used by both Admin and Organizer for 100% sync)
function ExhibitorsTable({ exhibitorApps, boothInputs, setBoothInputs, updateAppStatus }) {
  return (
    <div className="table-responsive">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Contact / Exhibitor</th>
            <th>Expo</th>
            <th>Products / Pitch</th>
            <th>Assign Booth</th>
            <th>Status &amp; Actions</th>
          </tr>
        </thead>
        <tbody>
          {exhibitorApps.map(a => {
            const currentBooth = boothInputs[a._id] !== undefined ? boothInputs[a._id] : (a.booth || '');
            const isApproved = a.status === 'approved';
            const isRejected = a.status === 'rejected';

            return (
              <tr key={a._id}>
                <td>
                  <strong className="text-dark" style={{ fontSize: '14px' }}>{a.company}</strong>
                </td>
                <td>
                  <div className="fw-semibold text-dark">{a.user?.name || 'Exhibitor'}</div>
                  <small className="text-muted">{a.contact || a.user?.email || 'No contact'}</small>
                </td>
                <td>
                  <span className="badge bg-light text-dark border">
                    🎪 {a.expo?.title || 'General Expo'}
                  </span>
                </td>
                <td>
                  <div className="fw-semibold" style={{ color: '#17182c' }}>{a.products || 'Products'}</div>
                  {a.description && (
                    <small className="text-muted d-block mt-1">{a.description}</small>
                  )}
                </td>
                <td>
                  <div className="d-flex flex-column gap-1">
                    <input
                      className="form-control form-control-sm"
                      style={{ width: '120px', fontWeight: 600 }}
                      placeholder="e.g. B-04"
                      value={currentBooth}
                      onChange={e => setBoothInputs(prev => ({ ...prev, [a._id]: e.target.value }))}
                    />
                    {a.booth && (
                      <small className="text-success fw-bold" style={{ fontSize: '11px' }}>
                        ✓ Assigned: {a.booth}
                      </small>
                    )}
                  </div>
                </td>
                <td>
                  <div className="d-flex flex-column gap-2" style={{ minWidth: '135px' }}>
                    <div>
                      {isApproved && (
                        <span className="badge bg-success text-white py-1 px-2 fw-bold" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                          ✓ APPROVED
                        </span>
                      )}
                      {isRejected && (
                        <span className="badge bg-danger text-white py-1 px-2 fw-bold" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                          ✕ REJECTED
                        </span>
                      )}
                      {!isApproved && !isRejected && (
                        <span className="badge bg-warning text-dark py-1 px-2 fw-bold" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                          ⏳ PENDING
                        </span>
                      )}
                    </div>
                    <div className="d-flex gap-1 flex-wrap">
                      <button
                        className={`btn btn-sm ${isApproved ? 'btn-outline-success' : 'btn-success'} py-0 px-2`}
                        title={isApproved ? 'Save / Update Booth' : 'Approve Application'}
                        onClick={() => updateAppStatus(a._id, 'approved')}
                      >
                        {isApproved ? 'Update ✓' : 'Approve ✓'}
                      </button>
                      {!isRejected ? (
                        <button
                          className="btn btn-sm btn-outline-danger py-0 px-2"
                          title="Reject Application"
                          onClick={() => updateAppStatus(a._id, 'rejected')}
                        >
                          Reject ✕
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-secondary py-0 px-2"
                          title="Set back to Pending"
                          onClick={() => updateAppStatus(a._id, 'pending')}
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
          {!exhibitorApps.length && (
            <tr>
              <td colSpan="6" className="text-center py-4 text-muted">
                No exhibitor applications found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// 4. Admin Exhibitor Approvals Page
function AdminExhibitors() {
  const [exhibitorApps, setExhibitorApps] = useState([]);
  const [boothInputs, setBoothInputs] = useState({});

  const loadExhibitors = () => api.get('/exhibitors').then(r => setExhibitorApps(r.data.data || [])).catch(() => {});

  useEffect(() => { loadExhibitors(); }, []);

  async function updateAppStatus(appId, status) {
    try {
      const current = exhibitorApps.find(a => a._id === appId);
      const booth = boothInputs[appId] !== undefined ? boothInputs[appId] : (current?.booth || '');
      await api.patch(`/exhibitors/${appId}/status`, { status, booth });
      loadExhibitors();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update status');
    }
  }

  return (
    <div className="dashboard-events">
      <h2>Exhibitor Booth Applications <span>{exhibitorApps.length}</span></h2>
      <ExhibitorsTable
        exhibitorApps={exhibitorApps}
        boothInputs={boothInputs}
        setBoothInputs={setBoothInputs}
        updateAppStatus={updateAppStatus}
      />
    </div>
  );
}

// 5. Admin All Bookings Page
function AdminBookings() {
  const [allBookings, setAllBookings] = useState([]);
  const [search, setSearch] = useState('');

  const loadBookings = () => api.get('/bookings').then(r => setAllBookings(r.data.data || [])).catch(() => {});

  useEffect(() => {
    loadBookings();
  }, []);

  const processRefund = async (id) => {
    try {
      await api.patch(`/bookings/${id}/refund`);
      loadBookings();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to process refund');
    }
  };

  const filtered = allBookings.filter(b => {
    const text = (b.user?.name + ' ' + b.user?.email + ' ' + b.expo?.title).toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="dashboard-events">
      <div className="d-flex justify-content-between align-items-sm-center flex-column flex-sm-row gap-2 mb-3">
        <h2 className="m-0">All Platform Reservations <span>{filtered.length}</span></h2>
        <input
          className="form-control form-control-sm"
          style={{ maxWidth: '280px', width: '100%' }}
          placeholder="Search by attendee or expo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Attendee</th>
              <th>Event</th>
              <th>Date</th>
              <th>Ticket</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b._id}>
                <td><b>{b.user?.name || 'N/A'}</b><br /><small className="text-muted">{b.user?.email}</small></td>
                <td>{b.expo?.title || 'N/A'}<br /><small className="text-muted">{b.expo?.location}</small></td>
                <td><small>{b.expo?.date ? new Date(b.expo.date).toLocaleDateString() : ''}</small></td>
                <td>{b.ticketType}</td>
                <td>{b.quantity}</td>
                <td><b>Rs. {(b.total || 0).toLocaleString()}</b></td>
                <td>
                  <span className="badge bg-light text-dark border">
                    {b.paymentMethod === 'online' ? `💳 Online (${(b.paymentProvider || 'Card').toUpperCase()})` : '🏢 Venue Desk'}
                  </span>
                </td>
                <td>
                  <span className={`admin-badge badge-${b.status}`}>{b.status}</span>
                  {b.paymentStatus === 'refund_pending' && (
                    <div className="mt-1">
                      <span className="badge bg-warning text-dark d-block mb-1">Refund Pending (24h)</span>
                      <button
                        className="btn btn-sm btn-outline-success py-0 px-2"
                        style={{ fontSize: '11px' }}
                        onClick={() => processRefund(b._id)}
                        title="Mark refund as completed"
                      >
                        Approve Refund ✓
                      </button>
                    </div>
                  )}
                  {b.paymentStatus === 'refunded' && (
                    <div className="badge bg-success text-white d-block mt-1">Refunded ✓</div>
                  )}
                  {b.paymentStatus === 'paid' && b.status === 'confirmed' && (
                    <div className="small text-success fw-bold mt-1">Paid</div>
                  )}
                  {b.paymentMethod === 'venue' && b.status === 'cancelled' && (
                    <div className="small text-muted mt-1">No payment deducted</div>
                  )}
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan="8" className="text-center py-4 text-muted">No bookings match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ==========================================================================
   ORGANIZER PAGES (DEDICATED INDIVIDUAL PAGES)
   ========================================================================== */

function OrganizerExpos() {
  const [events, setEvents] = useState([]);
  const [expoForm, setExpoForm] = useState({
    title: '',
    eventDay: '15',
    eventMonth: '11',
    eventYear: '2026',
    startTime: '10:00',
    endTime: '18:00',
    location: '',
    description: '',
    theme: '',
    imageUrl: '',
    boothCount: 30
  });
  const [expoMsg, setExpoMsg] = useState('');

  const loadExpos = () => api.get('/expos').then(r => setEvents(r.data.data || [])).catch(() => {});
  useEffect(() => { loadExpos(); }, []);

  async function createExpo(e) {
    e.preventDefault();
    try {
      const dateStr = `${expoForm.eventYear}-${expoForm.eventMonth}-${expoForm.eventDay}T${expoForm.startTime || '10:00'}:00`;
      const startDate = new Date(dateStr);

      let endDate = undefined;
      if (expoForm.endTime) {
        const endDateStr = `${expoForm.eventYear}-${expoForm.eventMonth}-${expoForm.eventDay}T${expoForm.endTime}:00`;
        endDate = new Date(endDateStr).toISOString();
      }

      await api.post('/expos', {
        title: expoForm.title,
        date: startDate.toISOString(),
        endDate,
        location: expoForm.location,
        description: expoForm.description,
        theme: expoForm.theme,
        imageUrl: expoForm.imageUrl,
        boothCount: expoForm.boothCount
      });
      setExpoMsg('Expo created successfully!');
      setExpoForm({ title: '', eventDay: '15', eventMonth: '11', eventYear: '2026', startTime: '10:00', endTime: '18:00', location: '', description: '', theme: '', imageUrl: '', boothCount: 30 });
      loadExpos();
    } catch (err) {
      setExpoMsg(err.response?.data?.message || 'Failed to create expo');
    }
  }

  async function removeExpo(id) {
    if (!confirm('Delete this event?')) return;
    try {
      await api.delete(`/expos/${id}`);
      loadExpos();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  }

  return (
    <div className="dashboard-layout">
      <form className="dashboard-form" onSubmit={createExpo}>
        <h2>Publish a New Expo</h2>
        <label>Event Title</label>
        <input className="form-control" required value={expoForm.title} onChange={e => setExpoForm({ ...expoForm, title: e.target.value })} />
        <label className="fw-bold small mb-1">Event Date (Day / Month / Year) *</label>
        <div className="row g-2 mb-2">
          <div className="col-4">
            <select
              className="form-select"
              required
              value={expoForm.eventDay}
              onChange={e => setExpoForm({ ...expoForm, eventDay: e.target.value })}
            >
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="col-4">
            <select
              className="form-select"
              required
              value={expoForm.eventMonth}
              onChange={e => setExpoForm({ ...expoForm, eventMonth: e.target.value })}
            >
              {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className="col-4">
            <select
              className="form-select"
              required
              value={expoForm.eventYear}
              onChange={e => setExpoForm({ ...expoForm, eventYear: e.target.value })}
            >
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="row g-2 mb-2">
          <div className="col-md-6">
            <label className="fw-bold small mb-1">Daily Start Time *</label>
            <select
              className="form-select"
              required
              value={expoForm.startTime}
              onChange={e => setExpoForm({ ...expoForm, startTime: e.target.value })}
            >
              {TIME_SLOTS.map(t => (
                <option key={t.value} value={t.value}>⏰ {t.label}</option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="fw-bold small mb-1">Daily Ending Time <small className="text-muted fw-normal">(Optional)</small></label>
            <select
              className="form-select"
              value={expoForm.endTime}
              onChange={e => setExpoForm({ ...expoForm, endTime: e.target.value })}
            >
              <option value="">No End Time</option>
              {TIME_SLOTS.map(t => (
                <option key={t.value} value={t.value}>⏰ {t.label}</option>
              ))}
            </select>
          </div>
        </div>
        <label>Location Venue</label>
        <input className="form-control" required value={expoForm.location} onChange={e => setExpoForm({ ...expoForm, location: e.target.value })} />
        <label>Category / Theme</label>
        <input className="form-control" value={expoForm.theme} onChange={e => setExpoForm({ ...expoForm, theme: e.target.value })} placeholder="e.g. Technology & Innovation" />
        <label>Banner Image URL <small className="text-muted fw-normal">(Optional — paste custom link or leave blank for auto image)</small></label>
        <input type="url" className="form-control" value={expoForm.imageUrl} onChange={e => setExpoForm({ ...expoForm, imageUrl: e.target.value })} placeholder="https://example.com/banner.jpg" />
        {expoForm.imageUrl && (
          <div className="mt-2 text-center" style={{ maxHeight: '130px', overflow: 'hidden', borderRadius: '8px', border: '1px solid #e2ddf0' }}>
            <img src={expoForm.imageUrl} alt="Banner Preview" style={{ width: '100%', height: '130px', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
        )}
        <label>Available Booths / Stall Capacity</label>
        <input type="number" min="1" max="500" className="form-control" required value={expoForm.boothCount} onChange={e => setExpoForm({ ...expoForm, boothCount: e.target.value })} placeholder="e.g. 40" />
        <label>Description</label>
        <textarea className="form-control" rows="3" value={expoForm.description} onChange={e => setExpoForm({ ...expoForm, description: e.target.value })} placeholder="Brief summary of the expo..." />
        <button className="btn btn-purple mt-3">Publish Expo ↗</button>
        {expoMsg && <div className="alert alert-info mt-3">{expoMsg}</div>}
      </form>

      <div className="dashboard-events">
        <h2>Your Expos <span>{events.length}</span></h2>
        <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
          {events.map(e => (
            <div className="manage-event" key={e._id}>
              <div>
                <b>{e.title}</b>
                <small>{e.location} · {new Date(e.date).toLocaleDateString()}</small>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <span className="text-muted small">{e.theme || 'General'}</span>
                  <span className="admin-badge badge-organizer">{e.boothCount || 30} Booths</span>
                </div>
              </div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => removeExpo(e._id)}>Delete</button>
            </div>
          ))}
          {!events.length && <div className="empty-state">No expos published yet.</div>}
        </div>
      </div>
    </div>
  );
}

function OrganizerSessions() {
  const [events, setEvents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sessionForm, setSessionForm] = useState({ expo: '', title: '', speaker: '', startTime: '', endTime: '', location: '', topic: '' });
  const [sessionMsg, setSessionMsg] = useState('');

  const loadData = () => {
    api.get('/expos').then(r => {
      setEvents(r.data.data || []);
      if (r.data.data?.length && !sessionForm.expo) setSessionForm(f => ({ ...f, expo: r.data.data[0]._id }));
    }).catch(() => {});
    api.get('/sessions').then(r => setSessions(r.data.data || [])).catch(() => {});
  };

  useEffect(() => { loadData(); }, []);

  async function createSession(e) {
    e.preventDefault();
    setSessionMsg('');
    try {
      const targetExpo = events.find(ev => ev._id === sessionForm.expo) || events[0];
      if (!targetExpo) {
        setSessionMsg('Please select an expo');
        return;
      }

      if (!sessionForm.startTime) {
        setSessionMsg('Please enter a Start Time');
        return;
      }

      const [startH, startM] = sessionForm.startTime.split(':').map(Number);
      const expoBaseDate = new Date(targetExpo.date);
      const fullStartTime = new Date(expoBaseDate);
      fullStartTime.setHours(startH, startM, 0, 0);

      let fullEndTime = undefined;
      if (sessionForm.endTime) {
        const [endH, endM] = sessionForm.endTime.split(':').map(Number);
        const endD = new Date(expoBaseDate);
        if (endH < startH || (endH === startH && endM <= startM)) {
          endD.setDate(endD.getDate() + 1);
        }
        endD.setHours(endH, endM, 0, 0);
        fullEndTime = endD.toISOString();
      }

      await api.post('/sessions', {
        expo: sessionForm.expo || targetExpo._id,
        title: sessionForm.title,
        speaker: sessionForm.speaker,
        location: sessionForm.location,
        topic: sessionForm.topic,
        startTime: fullStartTime.toISOString(),
        endTime: fullEndTime
      });
      setSessionMsg('✅ Session successfully added to schedule!');
      setSessionForm({ expo: events[0]?._id || '', title: '', speaker: '', startTime: '', endTime: '', location: '', topic: '' });
      loadData();
    } catch (err) {
      setSessionMsg(err.response?.data?.message || 'Failed to create session');
    }
  }

  async function removeSession(id) {
    if (!confirm('Delete this session?')) return;
    try {
      await api.delete(`/sessions/${id}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  }

  const selectedExpo = events.find(e => e._id === sessionForm.expo) || events[0];

  const formatExpoDate = (d) => {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return String(d);
    }
  };

  const formatExpoTime = (start, end) => {
    if (!start) return '';
    try {
      const s = new Date(start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      if (!end) return s;
      const e = new Date(end).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      return `${s} – ${e}`;
    } catch {
      return '';
    }
  };

  return (
    <div className="dashboard-layout">
      <form className="dashboard-form" onSubmit={createSession}>
        <h2>Add Session to Schedule</h2>
        <label>Select Expo</label>
        <select className="form-select" required value={sessionForm.expo} onChange={e => setSessionForm({ ...sessionForm, expo: e.target.value })}>
          {events.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
        </select>

        {selectedExpo && selectedExpo.date && (
          <div
            style={{
              backgroundColor: '#f8fafc',
              color: '#0f172a',
              border: '1.5px solid #cbd5e1',
              borderRadius: '10px',
              padding: '12px 14px',
              marginTop: '10px',
              marginBottom: '10px'
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '12px', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              📌 Selected Expo Schedule &amp; Timing
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', color: '#0f172a' }}>
              <div>
                <strong style={{ color: '#1e293b' }}>📅 Date: </strong>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>{formatExpoDate(selectedExpo.date)}</span>
              </div>
              <div>
                <strong style={{ color: '#1e293b' }}>⏰ Expo Hours: </strong>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>{formatExpoTime(selectedExpo.date, selectedExpo.endDate)}</span>
              </div>
            </div>
          </div>
        )}

        <label className="mt-3">Session Title</label>
        <input className="form-control" required value={sessionForm.title} onChange={e => setSessionForm({ ...sessionForm, title: e.target.value })} placeholder="e.g. AI Keynote" />
        <label>Speaker / Presenter Name</label>
        <input className="form-control" required value={sessionForm.speaker} onChange={e => setSessionForm({ ...sessionForm, speaker: e.target.value })} placeholder="e.g. Dr. Sarah Jenkins" />
        
        <div className="row g-2 mb-3">
          <div className="col-6">
            <label className="fw-semibold small">Start Time *</label>
            <select
              className="form-select"
              required
              value={sessionForm.startTime}
              onChange={e => setSessionForm({ ...sessionForm, startTime: e.target.value })}
            >
              <option value="">-- Select Start Time --</option>
              {TIME_SLOTS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="col-6">
            <label className="fw-semibold small">End Time <small className="text-muted fw-normal">(Optional)</small></label>
            <select
              className="form-select"
              value={sessionForm.endTime}
              onChange={e => setSessionForm({ ...sessionForm, endTime: e.target.value })}
            >
              <option value="">No End Time</option>
              {TIME_SLOTS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <label>Topic / Hall Location</label>
        <input className="form-control" value={sessionForm.location} onChange={e => setSessionForm({ ...sessionForm, location: e.target.value })} placeholder="e.g. Main Hall" />
        <button className="btn btn-purple mt-3">Add Session ↗</button>
        {sessionMsg && <div className="alert alert-info mt-3">{sessionMsg}</div>}
      </form>

      <div className="dashboard-events">
        <h2>Scheduled Sessions <span>{sessions.length}</span></h2>
        <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
          {sessions.map(s => (
            <div className="manage-event" key={s._id}>
              <div>
                <b>{s.title}</b>
                <small>
                  {s.speaker} · {s.location || 'Main Stage'} (
                  {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {s.endTime ? ` - ${new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                  )
                </small>
                <small className="text-muted">{s.expo?.title}</small>
              </div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => removeSession(s._id)}>Delete</button>
            </div>
          ))}
          {!sessions.length && <div className="empty-state">No sessions added yet.</div>}
        </div>
      </div>
    </div>
  );
}

function OrganizerExhibitors() {
  const [exhibitorApps, setExhibitorApps] = useState([]);
  const [boothInputs, setBoothInputs] = useState({});

  const load = () => api.get('/exhibitors').then(r => setExhibitorApps(r.data.data || [])).catch(() => {});
  useEffect(() => { load(); }, []);

  async function updateAppStatus(appId, status) {
    try {
      const current = exhibitorApps.find(a => a._id === appId);
      const booth = boothInputs[appId] !== undefined ? boothInputs[appId] : (current?.booth || '');
      await api.patch(`/exhibitors/${appId}/status`, { status, booth });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update status');
    }
  }

  return (
    <div className="dashboard-events">
      <h2>Exhibitor Applications for Your Expos <span>{exhibitorApps.length}</span></h2>
      <ExhibitorsTable
        exhibitorApps={exhibitorApps}
        boothInputs={boothInputs}
        setBoothInputs={setBoothInputs}
        updateAppStatus={updateAppStatus}
      />
    </div>
  );
}

function OrganizerBookings() {
  const [bookings, setBookings] = useState([]);

  const loadBookings = () => {
    api.get('/bookings').then(r => setBookings(r.data.data || [])).catch(() => {});
  };

  useEffect(() => { loadBookings(); }, []);

  const processRefund = async (id) => {
    try {
      await api.patch(`/bookings/${id}/refund`);
      loadBookings();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to process refund');
    }
  };

  return (
    <div className="dashboard-events">
      <h2>Attendee Bookings <span>{bookings.length}</span></h2>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Attendee</th>
              <th>Event</th>
              <th>Ticket</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status &amp; Refund</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b._id}>
                <td><b>{b.user?.name || 'N/A'}</b><br /><small className="text-muted">{b.user?.email}</small></td>
                <td>{b.expo?.title || 'N/A'}</td>
                <td>{b.ticketType}</td>
                <td>{b.quantity}</td>
                <td><b>Rs. {(b.total || 0).toLocaleString()}</b></td>
                <td>
                  <span className="badge bg-light text-dark border">
                    {b.paymentMethod === 'online' ? `💳 Online (${(b.paymentProvider || 'Card').toUpperCase()})` : '🏢 Venue Desk'}
                  </span>
                </td>
                <td>
                  <span className={`admin-badge badge-${b.status}`}>{b.status}</span>
                  {b.paymentStatus === 'refund_pending' && (
                    <div className="mt-1">
                      <span className="badge bg-warning text-dark d-block mb-1">Refund Pending (24h)</span>
                      <button
                        className="btn btn-sm btn-outline-success py-0 px-2"
                        style={{ fontSize: '11px' }}
                        onClick={() => processRefund(b._id)}
                        title="Mark refund as completed"
                      >
                        Approve Refund ✓
                      </button>
                    </div>
                  )}
                  {b.paymentStatus === 'refunded' && (
                    <div className="badge bg-success text-white d-block mt-1">Refunded ✓</div>
                  )}
                  {b.paymentStatus === 'paid' && b.status === 'confirmed' && (
                    <div className="small text-success fw-bold mt-1">Paid</div>
                  )}
                  {b.paymentMethod === 'venue' && b.status === 'cancelled' && (
                    <div className="small text-muted mt-1">No payment deducted</div>
                  )}
                </td>
              </tr>
            ))}
            {!bookings.length && (
              <tr><td colSpan="7" className="text-center py-4 text-muted">No bookings recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ==========================================================================
   PUBLIC & CONSUMER PAGES
   ========================================================================== */

function EventCard({ event }) {
  return (
    <article className="event-card">
      <Link to={`/events/${event._id}`} className="event-photo">
        <img src={imageFor(event)} alt={event.title} />
        <span className="photo-tag">FEATURED EVENT</span>
      </Link>
      <div className="event-info">
        <div className="event-date">
          <b>{new Date(event.date).toLocaleDateString('en', { day: '2-digit' })}</b>
          <span>{new Date(event.date).toLocaleDateString('en', { month: 'short' })}</span>
        </div>
        <div className="event-copy">
          <span className="eyebrow">{event.theme || 'EXPO & CONFERENCE'}</span>
          <h3><Link to={`/events/${event._id}`}>{event.title}</Link></h3>
          <p><i className="bi bi-geo-alt" /> {event.location}</p>
          <div className="event-bottom">
            <span>
              ◷ {new Date(event.date).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}
              {event.endDate ? ` - ${new Date(event.endDate).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}` : ''}
            </span>
            <Link to={`/events/${event._id}`} className="text-link">Explore event ↗</Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function Home() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [reviews, setReviews] = useState([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [confirmedExpos, setConfirmedExpos] = useState([]);
  const location = useLocation();
  const user = getUser();

  const categories = [
    { id: 'all', label: 'All Expos', icon: '🌟' },
    { id: 'tech', label: 'Technology & AI', icon: '💻', keywords: ['tech', 'ai', 'software', 'innovat', 'cyber', 'data'] },
    { id: 'business', label: 'Business & Trade', icon: '💼', keywords: ['business', 'trade', 'financ', 'startup', 'market'] },
    { id: 'arts', label: 'Arts & Culture', icon: '🎨', keywords: ['art', 'music', 'cultur', 'design', 'film'] },
    { id: 'education', label: 'Education & Career', icon: '🎓', keywords: ['educat', 'learn', 'career', 'study', 'student'] },
    { id: 'health', label: 'Health & Wellness', icon: '🏥', keywords: ['health', 'medic', 'pharma', 'wellness'] }
  ];

  useEffect(() => {
    api.get('/expos')
      .then(r => setEvents(r.data.data || []))
      .catch(() => setError('Unable to connect to the backend server. Please verify the API is running.'));

    api.get('/reviews')
      .then(r => setReviews(r.data.data || []))
      .catch(() => {});

    const currentUser = getUser();
    if (currentUser?.role === 'attendee') {
      api.get('/reviews/can-review')
        .then(r => {
          setCanReview(Boolean(r.data?.canReview));
          setConfirmedExpos(r.data?.confirmedExpos || []);
        })
        .catch(() => {
          setCanReview(false);
          setConfirmedExpos([]);
        });
    } else {
      setCanReview(false);
      setConfirmedExpos([]);
    }
  }, [location.key]);

  const filtered = useMemo(() => {
    return events.filter(e => {
      const text = ((e.title || '') + ' ' + (e.theme || '') + ' ' + (e.location || '')).toLowerCase();
      const matchesQuery = !query || text.includes(query.toLowerCase());
      
      if (activeCategory === 'all') return matchesQuery;
      
      const currentCat = categories.find(c => c.id === activeCategory);
      const matchesCat = currentCat?.keywords?.some(k => text.includes(k));
      return matchesQuery && matchesCat;
    });
  }, [events, query, activeCategory]);

  const spotlight = events[0] || null;

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-image" />
        <div className="container hero-content-grid">
          <div className="hero-text">
            <span className="hero-pill">✨ &nbsp;PAKISTAN'S #1 PREMIER EVENT & EXPO HUB</span>
            <h1>Discover, Book &amp; Experience<br /><span className="hero-gradient-text">Extraordinary Expos.</span></h1>
            <p>
              Connect with leading exhibitors, visionary speakers, and thousands of professionals across Pakistan.
              Secure VIP &amp; General passes in seconds with instant digital confirmation and 24-hour refund protection.
            </p>
            
            <div className="hero-actions">
              <Link to="/events" className="btn btn-purple btn-lg">Explore All Expos <span>↗</span></Link>
              {user ? (
                user.role === 'attendee' ? (
                  <Link to="/bookings" className="btn btn-glass btn-lg">My Bookings</Link>
                ) : user.role === 'exhibitor' ? (
                  <Link to="/exhibitors" className="btn btn-glass btn-lg">🏢 Exhibitor Portal</Link>
                ) : (
                  <Link to="/admin/dashboard" className="btn btn-glass btn-lg">⚡ Admin Panel</Link>
                )
              ) : (
                <Link to="/register" className="btn btn-glass btn-lg">Join EventSphere Free</Link>
              )}
            </div>

            {/* TRUST & STATS BAR */}
            <div className="hero-trust-bar">
              <div className="hero-trust-item">
                <div className="hero-trust-badge">🎟️</div>
                <div className="hero-trust-info">
                  <strong>15,000+ Passes</strong>
                  <small>Booked by Attendees</small>
                </div>
              </div>
              <div className="hero-trust-item">
                <div className="hero-trust-badge">🏢</div>
                <div className="hero-trust-info">
                  <strong>100+ Brands</strong>
                  <small>Verified Exhibitors</small>
                </div>
              </div>
              <div className="hero-trust-item">
                <div className="hero-trust-badge">⚡</div>
                <div className="hero-trust-info">
                  <strong>24h Fast Refund</strong>
                  <small>Automated Online Protection</small>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: INTERACTIVE SPOTLIGHT CARD */}
          {spotlight ? (
            <div className="hero-spotlight-card">
              <div className="spotlight-top-badge">
                <span className="pulse-dot" /> FEATURED SPOTLIGHT EXPO
              </div>
              <div className="spotlight-img-wrap">
                <img src={imageFor(spotlight)} alt={spotlight.title} />
                <span className="spotlight-venue-tag">📍 {spotlight.location}</span>
              </div>
              <div className="spotlight-info">
                <span className="eyebrow">{spotlight.theme || 'PREMIER EXHIBITION'}</span>
                <h3>{spotlight.title}</h3>
                <div className="spotlight-meta">
                  <span>📅 {new Date(spotlight.date).toLocaleDateString('en', { dateStyle: 'medium' })}</span>
                  <span>🎟️ VIP &amp; General Available</span>
                </div>
                <div className="spotlight-actions">
                  <div className="spotlight-price">
                    <small>Passes Starting At</small>
                    <strong>Rs. 1,500</strong>
                  </div>
                  {user?.role === 'exhibitor' ? (
                    <Link to={`/events/${spotlight._id}`} className="btn btn-purple">
                      Explore Event <span>↗</span>
                    </Link>
                  ) : (
                    <Link to={`/book/${spotlight._id}`} className="btn btn-purple">
                      Reserve Ticket <span>↗</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="hero-stat">
              <span className="stat-icon">✦</span>
              <strong>Ideas meet<br />opportunity.</strong>
              <small>One platform. Endless possibilities.</small>
            </div>
          )}
        </div>
      </section>

      {/* INTERACTIVE CATEGORY FILTER STRIP */}
      <section className="category-filter-section container">
        <div className="category-filter-bar">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-filter-pill ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
          <Link to="/events" className="ms-auto btn btn-light-outline text-nowrap py-1 px-3 d-none d-md-inline-block">
            All Categories ↗
          </Link>
        </div>
      </section>

      {/* FEATURED EXPOS GRID */}
      <section className="section-space container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">UPCOMING GATHERINGS</span>
            <h2>Curated Expos &amp; <em>Conferences</em></h2>
            <p>Handpicked industry experiences worth putting on your calendar.</p>
          </div>
          <Link className="btn btn-light-outline" to="/events">View All Expos ↗</Link>
        </div>

        {/* Live Search & Filter Counter */}
        <div className="search-line">
          <span>⌕</span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search expos by title, topic (AI, Business, Health) or city..."
          />
          <small>{filtered.length} EXPOS AVAILABLE</small>
        </div>

        {error && <div className="alert alert-warning">{error}</div>}

        <div className="row g-4">
          {filtered.slice(0, 6).map(e => (
            <div className="col-lg-4 col-md-6" key={e._id}>
              <EventCard event={e} />
            </div>
          ))}
        </div>

        {!filtered.length && !error && (
          <div className="empty-state">
            <h4>No expos found</h4>
            <p className="text-muted">No events currently match your search or selected category.</p>
            <button className="btn btn-purple mt-2" onClick={() => { setQuery(''); setActiveCategory('all'); }}>
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* HOW IT WORKS FOR ATTENDEES */}
      <section className="section-space container pt-0">
        <div className="text-center mx-auto mb-4" style={{ maxWidth: '700px' }}>
          <span className="eyebrow">EFFORTLESS ATTENDANCE</span>
          <h2 className="mt-2">How EventSphere <em>Works</em></h2>
          <p className="text-muted">From discovery to venue check-in, everything is designed for your seamless experience.</p>
        </div>

        <div className="how-it-works-grid">
          <div className="process-card">
            <span className="process-step-num">01</span>
            <div className="process-icon">🔍</div>
            <h4>Browse &amp; Discover</h4>
            <p>Explore curated summits, technology expos, and trade shows filtered by industry, date, or city.</p>
          </div>

          <div className="process-card">
            <span className="process-step-num">02</span>
            <div className="process-icon">💳</div>
            <h4>Instant 1-Click Booking</h4>
            <p>Select General, VIP, or Student passes. Pay securely via Card, JazzCash, EasyPaisa, or at the Venue.</p>
          </div>

          <div className="process-card">
            <span className="process-step-num">03</span>
            <div className="process-icon">🎟️</div>
            <h4>Smooth Venue Check-In</h4>
            <p>Access your passes in "My Bookings" on any device. Check-in directly at the registration desk in seconds.</p>
          </div>
        </div>
      </section>

      {/* WHY ATTENDEES LOVE EVENTSPHERE */}
      <section className="why-section">
        <div className="container">
          <div className="text-center mx-auto mb-4" style={{ maxWidth: '700px' }}>
            <span className="eyebrow">ATTENDEE ADVANTAGES</span>
            <h2 className="mt-2 text-white">Why Attend With <em>EventSphere</em></h2>
            <p className="text-muted">Built from the ground up for convenience, transparency, and top-tier networking.</p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">⚡</div>
              <h4>Instant Digital Passes</h4>
              <p>Instant confirmation right after booking. Never worry about printing or losing physical paper tickets.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">🛡️</div>
              <h4>24-Hour Easy Refund</h4>
              <p>Plans changed? Cancel online within 24 hours for a prompt, automatic refund to your original payment method.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">🏢</div>
              <h4>Direct Exhibitor Hub</h4>
              <p>Browse exhibiting brands in advance, explore booth locations, and plan your networking agenda efficiently.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">📍</div>
              <h4>Premier Pakistan Venues</h4>
              <p>Hosted at leading convention spaces including Karachi Expo Centre, Lahore Expo Centre &amp; Pak-China Centre.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ATTENDEE REVIEWS & EXPERIENCES (DYNAMIC) */}
      <section className="section-space container">
        <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
          <div>
            <span className="eyebrow">ATTENDEE EXPERIENCES</span>
            <h2 className="mt-2 mb-1">Loved by <em>Attendees</em></h2>
            <p className="text-muted m-0">Verified reviews from attendees with confirmed event passes.</p>
          </div>
          {canReview && (
            <button className="btn btn-purple" onClick={() => setReviewModalOpen(true)}>
              ✍️ Write a Review
            </button>
          )}
        </div>

        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          onReviewSubmitted={newRev => setReviews(prev => [newRev, ...prev])}
          user={user}
          confirmedExpos={confirmedExpos}
        />

        <div className="testimonials-grid">
          {reviews.slice(0, 6).map((rev, idx) => (
            <div className="testimonial-card" key={rev._id || idx}>
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="testimonial-stars">
                    {'★'.repeat(Math.min(5, Math.max(1, rev.rating || 5)))}
                    {'☆'.repeat(Math.max(0, 5 - (rev.rating || 5)))}
                  </div>
                  <span className="admin-badge badge-attendee">Verified Attendee</span>
                </div>
                {rev.expoTitle && (
                  <div className="mb-2">
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: '#f3e8ff',
                        color: '#7c3aed',
                        border: '1px solid #ddd6fe',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}
                    >
                      🎪 {rev.expoTitle}
                    </span>
                  </div>
                )}
                <p className="testimonial-quote">"{rev.comment}"</p>
              </div>
              <div className="testimonial-author">
                <div className="testimonial-avatar">
                  {(rev.userName || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="testimonial-meta">
                  <strong>{rev.userName}</strong>
                  <small>{new Date(rev.createdAt || Date.now()).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</small>
                </div>
              </div>
            </div>
          ))}
          {!reviews.length && (
            <div className="text-center p-5 text-muted w-100 bg-white rounded-3 border">
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
              <h5 className="fw-bold mb-1">No attendee reviews yet</h5>
              <p className="small mb-0 text-muted">Once attendees confirm their event passes, their verified reviews will be featured here.</p>
            </div>
          )}
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="container">
        <div className="home-cta-banner">
          <div className="cta-banner-content">
            <span className="eyebrow text-white opacity-75">START YOUR JOURNEY TODAY</span>
            <h2>Ready to experience Pakistan's premier expos?</h2>
            <p>
              Join over 15,000+ professionals discovering innovation summits, B2B trade shows, and industry conferences.
            </p>
            <div className="cta-banner-actions">
              <Link to="/events" className="btn btn-purple btn-lg">Browse Upcoming Expos <span>↗</span></Link>
              {!user && (
                <Link to="/register" className="btn btn-glass btn-lg">Create Free Account</Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Events() {
  const [events, setEvents] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    api.get('/expos').then(r => setEvents(r.data.data || [])).catch(() => {});
  }, []);

  const list = events.filter(e => (e.title + ' ' + e.location + ' ' + e.theme).toLowerCase().includes(q.toLowerCase()));

  return (
    <main className="container page-space">
      <div className="page-intro">
        <span className="eyebrow">FIND YOUR NEXT EXPERIENCE</span>
        <h1>Explore <em>events</em></h1>
        <p>Discover expos, conferences and experiences happening around you.</p>
      </div>
      <div className="search-line">
        <span>⌕</span>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by event, category or city..." />
        <small>{list.length} RESULTS</small>
      </div>
      <div className="row g-4 mt-2">
        {list.map(e => <div className="col-md-6 col-xl-4" key={e._id}><EventCard event={e} /></div>)}
      </div>
      {!list.length && <div className="empty-state">No events available right now.</div>}
    </main>
  );
}

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');
  const user = getUser();

  useEffect(() => {
    api.get(`/expos/${id}`).then(r => setEvent(r.data.data)).catch(e => setError(e.response?.data?.message || 'Event could not be loaded'));
    api.get(`/sessions?expo=${id}`).then(r => setSessions(r.data.data || [])).catch(() => {});
  }, [id]);

  if (error) return <main className="container page-space"><div className="alert alert-warning">{error}</div><Link to="/events">Back to events</Link></main>;
  if (!event) return <main className="container page-space">Loading event...</main>;

  return (
    <main className="container page-space">
      <Link to="/events" className="back-link">← All events</Link>
      <div className="detail-hero">
        <img src={imageFor(event)} alt={event.title} />
        <div>
          <span className="eyebrow">{event.theme || 'EVENTSPHERE EXPERIENCE'}</span>
          <h1>{event.title}</h1>
          <p>{event.description}</p>
          <div className="detail-meta">
            <span>📅 {new Date(event.date).toLocaleDateString('en', { dateStyle: 'long' })}</span>
            <span>◷ {new Date(event.date).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}{event.endDate ? ` - ${new Date(event.endDate).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}` : ''}</span>
            <span>📍 {event.location}</span>
          </div>
          {user ? (
            user.role === 'attendee' ? (
              <Link to={`/book/${event._id}`} className="btn btn-purple btn-lg mt-3">Book your place ↗</Link>
            ) : (
              <div className="mt-3 p-3 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                <span className="small d-block mb-2 text-white">
                  🏢 <b>Exhibitor Account</b>: Ticket booking is reserved for attendees. You can explore event details or apply for booth space in your portal.
                </span>
                <Link to="/exhibitors" className="btn btn-purple btn-sm">
                  Apply for Booth in Exhibitor Portal ↗
                </Link>
              </div>
            )
          ) : (
            <Link
              to="/login"
              onClick={() => sessionStorage.setItem('es_redirect', `/book/${event._id}`)}
              className="btn btn-purple btn-lg mt-3"
            >
              🔒 Sign In to Book Seats ↗
            </Link>
          )}
        </div>
      </div>
      <div className="detail-columns">
        <div>
          <h2>About this event</h2>
          <p>{event.description}</p>
          <p>Join attendees, exhibitors and industry professionals for a day of ideas, networking and discovery.</p>

          {sessions.length > 0 && (
            <div className="mt-4 pt-4 border-top">
              <span className="eyebrow text-purple">EVENT TIMELINE &amp; AGENDAS</span>
              <h3 className="fw-bold mt-1 mb-3">Keynote Talks &amp; Sessions ({sessions.length})</h3>
              <div className="d-flex flex-column gap-3">
                {sessions.map(s => {
                  const speakerInitials = (s.speaker || 'S').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <div className="schedule-card" key={s._id} style={{ margin: 0 }}>
                      <div className="schedule-time-box">
                        <div className="schedule-time-main">
                          ⏰ {new Date(s.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                          {s.endTime && (
                            <> – {new Date(s.endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}</>
                          )}
                        </div>
                        <div className="text-muted small mt-1">
                          📅 {new Date(s.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>

                      <div className="flex-grow-1">
                        <h4
                          className="fw-bold my-1"
                          style={{
                            fontFamily: 'Manrope, sans-serif',
                            fontSize: '19px',
                            color: '#0f172a'
                          }}
                        >
                          {s.title}
                        </h4>

                        <div className="d-flex align-items-center gap-3 mt-2 flex-wrap">
                          <div className="d-flex align-items-center gap-2">
                            <div className="schedule-avatar">{speakerInitials}</div>
                            <div>
                              <div className="small fw-bold" style={{ color: '#1e293b' }}>
                                🎤 {s.speaker || 'Featured Speaker'}
                              </div>
                              <div className="text-muted" style={{ fontSize: '11px' }}>Presenter</div>
                            </div>
                          </div>

                          <div className="vr d-none d-sm-block my-1" style={{ height: '24px' }} />

                          <div className="small text-muted d-flex align-items-center gap-1">
                            <span>📍</span>
                            <strong style={{ color: '#475569' }}>{s.location || 'Main Stage / Hall'}</strong>
                          </div>

                          {s.topic && (
                            <span className="badge bg-light text-dark border" style={{ fontSize: '11px' }}>
                              🏷️ {s.topic}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="ticket-note">
          <span className="eyebrow">YOUR EXPERIENCE STARTS HERE</span>
          <h3>Save your seat.</h3>
          <p>Choose your ticket and confirm your booking online.</p>
          {user ? (
            user.role === 'attendee' ? (
              <Link to={`/book/${event._id}`} className="text-link">See ticket options ↗</Link>
            ) : (
              <Link to="/exhibitors" className="text-link">🏢 Apply for Booth in Portal ↗</Link>
            )
          ) : (
            <Link
              to="/login"
              onClick={() => sessionStorage.setItem('es_redirect', `/book/${event._id}`)}
              className="text-link"
            >
              Sign in to choose tickets ↗
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}

function Book() {
  const { id } = useParams();
  const nav = useNavigate();
  const user = getUser();

  if (!user) {
    sessionStorage.setItem('es_redirect', `/book/${id}`);
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'attendee') {
    return (
      <main className="container page-space">
        <div className="card shadow-sm border-0 p-4 p-md-5 text-center my-4 mx-auto" style={{ maxWidth: '620px', borderRadius: '20px', background: '#ffffff', border: '1px solid #fee2e2' }}>
          <div style={{ fontSize: '48px', marginBottom: '14px' }}>🏢</div>
          <h2 className="fw-bold text-danger mb-2">Ticket Reservation Restricted</h2>
          <p className="text-muted mb-4">
            You are logged in with an <b>{user.role?.toUpperCase()}</b> account. Exhibitors can explore all expos and apply for booth allocations in the Exhibitor Portal. Ticket bookings are reserved for Attendees.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/exhibitors" className="btn btn-purple px-4">
              Go to Exhibitor Portal ↗
            </Link>
            <Link to="/events" className="btn btn-light-outline px-4">
              Explore Events
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const [event, setEvent] = useState(null);
  const [ticket, setTicket] = useState('General');
  const [qty, setQty] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' | 'venue'
  const [paymentProvider, setPaymentProvider] = useState('card'); // 'card' | 'jazzcash' | 'easypaisa'
  const [cardData, setCardData] = useState({ number: '4242 •••• •••• 4242', exp: '12/28', cvc: '123' });
  const [walletPhone, setWalletPhone] = useState('0300 1234567');
  const [processing, setProcessing] = useState(false);
  const [msg, setMsg] = useState('');
  const [confirmedData, setConfirmedData] = useState(null);
  const prices = { General: 1500, VIP: 3500, Student: 800 };

  useEffect(() => {
    api.get(`/expos/${id}`).then(r => setEvent(r.data.data)).catch(() => setMsg('Event not found'));
  }, [id]);

  async function submit() {
    if (!localStorage.getItem('es_token')) return nav('/login');
    setProcessing(true);
    setMsg('');

    // Simulate online processing delay for realism
    if (paymentMethod === 'online') {
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      const r = await api.post('/bookings', {
        expo: id,
        ticketType: ticket,
        quantity: Number(qty),
        paymentMethod,
        paymentProvider: paymentMethod === 'online' ? paymentProvider : 'venue'
      });
      setConfirmedData({
        message: r.data.message,
        ticket,
        quantity: qty,
        total: prices[ticket] * qty,
        isOnline: paymentMethod === 'online'
      });
      setProcessing(false);
    } catch (e) {
      setMsg(e.response?.data?.message || 'Booking failed');
      setProcessing(false);
    }
  }

  if (!event) return <main className="container page-space">{msg || 'Loading...'}</main>;

  const total = prices[ticket] * qty;

  return (
    <main className="container page-space">
      <div className="page-intro">
        <span className="eyebrow">RESERVE YOUR PLACE</span>
        <h1>Book your <em>experience</em></h1>
        <p>{event.title}</p>
      </div>

      {confirmedData ? (
        <div className="card shadow-sm border-0 p-4 p-md-5 text-center my-4 mx-auto" style={{ maxWidth: '620px', borderRadius: '20px', background: '#ffffff', border: '1px solid #dcfce7' }}>
          <div style={{ fontSize: '52px', marginBottom: '14px' }}>🎉</div>
          <h2 className="fw-bold text-success mb-2">Booking Confirmed Successfully!</h2>
          <p className="text-muted mb-3" style={{ fontSize: '15px' }}>
            {confirmedData.message}
          </p>

          <div className="bg-light p-3 rounded-3 text-start mb-3 border">
            <div className="d-flex justify-content-between py-1 border-bottom">
              <span className="text-muted small">Event:</span>
              <strong className="small">{event.title}</strong>
            </div>
            <div className="d-flex justify-content-between py-1 border-bottom">
              <span className="text-muted small">Ticket &amp; Qty:</span>
              <strong className="small">{confirmedData.ticket} ({confirmedData.quantity} ticket)</strong>
            </div>
            <div className="d-flex justify-content-between py-1 border-bottom">
              <span className="text-muted small">Total:</span>
              <strong className="small" style={{ color: '#7c3aed' }}>Rs. {confirmedData.total.toLocaleString()}</strong>
            </div>
            <div className="d-flex justify-content-between py-1">
              <span className="text-muted small">Payment:</span>
              <strong className="small">{confirmedData.isOnline ? 'Online Verified ✓' : 'Pay at Venue Desk'}</strong>
            </div>
          </div>

          <div className="alert alert-success border-success text-start p-3 mb-4" style={{ background: '#f0fdf4' }}>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span style={{ fontSize: '18px' }}>⭐</span>
              <strong className="small text-success">Review Access Unlocked!</strong>
            </div>
            <p className="small text-dark mb-0">
              Because your booking is confirmed, you can now write a review in the <b>Reviews Section on the Home Page</b>, or directly in your <b>Bookings Page</b> anytime.
            </p>
          </div>

          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/bookings" className="btn btn-purple btn-lg px-4">
              View in My Bookings ↗
            </Link>
            <Link to="/" className="btn btn-light-outline btn-lg px-4">
              Return to Home Page
            </Link>
          </div>
        </div>
      ) : (
      <div className="booking-layout">
        <div className="booking-event">
          <img src={imageFor(event)} alt={event.title} />
          <h3>{event.title}</h3>
          <p>📅 {new Date(event.date).toLocaleDateString('en', { dateStyle: 'long' })}</p>
          <p>📍 {event.location}</p>
        </div>
        <div className="booking-box">
          <h2>1. Select your ticket</h2>
          {Object.entries(prices).map(([name, price]) => (
            <button key={name} className={`ticket-option ${ticket === name ? 'selected' : ''}`} onClick={() => setTicket(name)}>
              <span>
                <b>{name}</b>
                <small>{name === 'VIP' ? 'Priority access & premium seating' : name === 'Student' ? 'Valid student ID required' : 'Standard event access'}</small>
              </span>
              <strong>Rs. {price.toLocaleString()}</strong>
            </button>
          ))}
          <label className="mt-3">Number of tickets</label>
          <select className="form-select" value={qty} onChange={e => setQty(e.target.value)}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n}>{n}</option>)}
          </select>

          <h2 className="mt-4">2. Choose Payment Method</h2>
          <div className="payment-methods-grid">
            <button
              type="button"
              className={`payment-method-btn ${paymentMethod === 'online' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('online')}
            >
              <span className="payment-method-title">💳 Pay Online</span>
              <span className="payment-method-desc">Debit/Credit Card, JazzCash, EasyPaisa</span>
            </button>

            <button
              type="button"
              className={`payment-method-btn ${paymentMethod === 'venue' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('venue')}
            >
              <span className="payment-method-title">🏢 Pay at Venue</span>
              <span className="payment-method-desc">Cash or Card at Entrance Desk</span>
            </button>
          </div>

          {paymentMethod === 'online' ? (
            <div className="payment-details-box">
              <label className="fw-bold mb-2">Select Provider</label>
              <div className="online-submethods">
                <button
                  type="button"
                  className={`online-subbtn ${paymentProvider === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentProvider('card')}
                >
                  💳 Card
                </button>
                <button
                  type="button"
                  className={`online-subbtn ${paymentProvider === 'jazzcash' ? 'active' : ''}`}
                  onClick={() => setPaymentProvider('jazzcash')}
                >
                  📱 JazzCash
                </button>
                <button
                  type="button"
                  className={`online-subbtn ${paymentProvider === 'easypaisa' ? 'active' : ''}`}
                  onClick={() => setPaymentProvider('easypaisa')}
                >
                  📱 EasyPaisa
                </button>
              </div>

              {paymentProvider === 'card' ? (
                <div>
                  <label>Card Number</label>
                  <input
                    className="form-control form-control-sm mb-2"
                    value={cardData.number}
                    onChange={e => setCardData({ ...cardData, number: e.target.value })}
                    placeholder="4242 •••• •••• 4242"
                  />
                  <div className="row g-2">
                    <div className="col-6">
                      <label>Expiry</label>
                      <input
                        className="form-control form-control-sm"
                        value={cardData.exp}
                        onChange={e => setCardData({ ...cardData, exp: e.target.value })}
                        placeholder="MM/YY"
                      />
                    </div>
                    <div className="col-6">
                      <label>CVC</label>
                      <input
                        className="form-control form-control-sm"
                        value={cardData.cvc}
                        onChange={e => setCardData({ ...cardData, cvc: e.target.value })}
                        placeholder="CVC"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label>{paymentProvider === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} Mobile Number</label>
                  <input
                    className="form-control form-control-sm mb-2"
                    value={walletPhone}
                    onChange={e => setWalletPhone(e.target.value)}
                    placeholder="0300 1234567"
                  />
                  <small className="text-muted">Instant mock authorization will be triggered on your mobile account.</small>
                </div>
              )}
            </div>
          ) : (
            <div className="venue-notice-box">
              <b>ℹ️ Pay at Venue Selected:</b>
              <p className="mb-0 mt-1 small">Your seat will be reserved. You can pay Rs. {total.toLocaleString()} via cash or card at the entrance desk upon arrival.</p>
            </div>
          )}

          <div className="total-line">
            <span>Total Payable</span>
            <strong>Rs. {total.toLocaleString()}</strong>
          </div>

          <button
            className="btn btn-purple w-100"
            onClick={submit}
            disabled={processing}
          >
            {processing ? (
              paymentMethod === 'online' ? 'Processing Secure Payment...' : 'Reserving Seat...'
            ) : (
              paymentMethod === 'online' ? `Pay Rs. ${total.toLocaleString()} & Confirm ↗` : `Confirm Reservation (Pay at Venue) ↗`
            )}
          </button>

          {msg && <div className="alert alert-info mt-3 mb-0">{msg}</div>}
          <small className="secure-note">
            {paymentMethod === 'online' ? '🔒 256-bit encrypted simulated online payment gateway' : '🎟️ Official venue counter seat reservation'}
          </small>
        </div>
      </div>
      )}
    </main>
  );
}

function MyBookings() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState('');
  const [cancellationNotice, setCancellationNotice] = useState(null);
  const [cancelModalId, setCancelModalId] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewExpo, setSelectedReviewExpo] = useState(null);
  const user = getUser();

  const confirmedExpos = useMemo(() => {
    const list = [];
    const seen = new Set();
    for (const b of items) {
      if (b.status === 'confirmed' && b.expo && !seen.has(b.expo._id)) {
        seen.add(b.expo._id);
        list.push({ id: b.expo._id, title: b.expo.title });
      }
    }
    return list;
  }, [items]);

  const load = () => api.get('/bookings/mine').then(r => setItems(r.data.data || [])).catch(e => setMsg(e.response?.data?.message || 'Please login to view bookings'));
  useEffect(() => { load(); }, []);

  async function confirmCancel() {
    if (!cancelModalId) return;
    try {
      const r = await api.patch(`/bookings/${cancelModalId}/cancel`);
      setCancellationNotice({
        message: r.data.message,
        isOnline: r.data.isOnlineRefund
      });
      setCancelModalId(null);
      load();
    } catch (e) {
      setMsg(e.response?.data?.message || 'Could not cancel');
      setCancelModalId(null);
    }
  }

  return (
    <main className="container page-space">
      <ConfirmModal
        isOpen={Boolean(cancelModalId)}
        title="Cancel Booking?"
        message="Are you sure you want to cancel this booking? This will release your reserved tickets."
        confirmText="Yes, Cancel Booking"
        confirmVariant="danger"
        onConfirm={confirmCancel}
        onCancel={() => setCancelModalId(null)}
      />

      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => { setReviewModalOpen(false); setSelectedReviewExpo(null); }}
        user={user}
        fixedExpo={selectedReviewExpo}
      />

      <div className="page-intro">
        <span className="eyebrow">YOUR EVENT JOURNEY</span>
        <h1>My <em>bookings</em></h1>
        <p>All your reservations, together in one place.</p>
      </div>

      {cancellationNotice && (
        <div className={`alert ${cancellationNotice.isOnline ? 'alert-warning border-warning' : 'alert-info border-info'} shadow-sm my-3 position-relative`}>
          <button
            type="button"
            className="btn btn-sm btn-link text-muted position-absolute top-0 end-0 m-2 p-1 text-decoration-none"
            onClick={() => setCancellationNotice(null)}
            title="Dismiss notice"
          >
            ✕
          </button>
          <div className="d-flex align-items-center gap-2 mb-1 pe-4">
            <span style={{ fontSize: '20px' }}>{cancellationNotice.isOnline ? '⏳' : '✅'}</span>
            <strong className="fs-6">{cancellationNotice.isOnline ? 'Online Refund Initiated (24 Hours)' : 'Booking Cancelled'}</strong>
          </div>
          <p className="mb-1 small pe-4">{cancellationNotice.message}</p>
          <p className="mb-0 small text-danger fw-bold">
            ℹ️ Note: Review privilege has been disabled for this cancelled booking. You can only review events with active confirmed tickets.
          </p>
        </div>
      )}

      {items.some(b => b.status === 'confirmed') && (
        <div className="alert alert-success border-success shadow-sm my-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span style={{ fontSize: '20px' }}>🎉</span>
              <strong className="fs-6">Booking Confirmed! You can now review this event.</strong>
            </div>
            <p className="mb-0 small text-dark">
              You can share your feedback on the <b>Home Page (Reviews Section)</b> or directly below in your bookings. If you cancel, review access will be disabled.
            </p>
          </div>
          <div>
            <Link to="/" className="btn btn-sm btn-outline-success">Home Page Reviews ↗</Link>
          </div>
        </div>
      )}

      {msg && <div className="alert alert-info">{msg}</div>}

      {items.map(b => (
        <div className="booking-row" key={b._id} style={{ alignItems: 'flex-start' }}>
          <img src={b.expo ? imageFor(b.expo) : pics.expo} alt="event" />
          <div className="flex-grow-1">
            <h3>{b.expo?.title || 'Event'}</h3>
            <p>{b.ticketType} · {b.quantity} ticket(s) · <b>Rs. {(b.total || 0).toLocaleString()}</b></p>
            <small>{b.expo?.location || ''}</small>
            
            <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
              <span className="badge bg-light text-dark border">
                {b.paymentMethod === 'online' ? `💳 Online (${(b.paymentProvider || 'Card').toUpperCase()})` : '🏢 Pay at Venue Desk'}
              </span>
              {b.paymentStatus === 'paid' && b.status === 'confirmed' && (
                <span className="badge bg-success">PAID</span>
              )}
              {b.paymentStatus === 'refund_pending' && (
                <span className="badge bg-warning text-dark">REFUND PENDING (24h)</span>
              )}
              {b.paymentStatus === 'refunded' && (
                <span className="badge bg-success">REFUNDED ✓</span>
              )}
            </div>

            {b.status === 'cancelled' && (
              <div className={`refund-notice-box mt-2 ${b.paymentStatus === 'refunded' ? 'bg-success-subtle text-success border-success' : ''}`}>
                <b>Refund & Cancellation Status:</b>
                <p className="mb-0 small">
                  {b.paymentStatus === 'refunded'
                    ? `Your refund of Rs. ${(b.total || 0).toLocaleString()} has been processed and successfully returned to your original ${(b.paymentProvider || 'card').toUpperCase()} account.`
                    : b.paymentMethod === 'online'
                    ? `Your booking has been cancelled. Your online payment of Rs. ${(b.total || 0).toLocaleString()} will be refunded to your original payment method within 24 hours.`
                    : 'Your booking has been cancelled successfully. Since you selected "Pay at Venue", no charges were deducted.'}
                </p>
              </div>
            )}
          </div>

          <div className="text-end">
            <span className={`status ${b.status}`}>{b.status}</span>
            {b.status === 'confirmed' ? (
              <>
                <button className="btn btn-sm btn-outline-danger d-block mt-2" onClick={() => setCancelModalId(b._id)}>
                  Cancel Booking
                </button>
                <button
                  className="btn btn-sm btn-purple d-block mt-2"
                  onClick={() => {
                    setSelectedReviewExpo(b.expo);
                    setReviewModalOpen(true);
                  }}
                >
                  ★ Review Event
                </button>
              </>
            ) : (
              <small className="d-block text-muted mt-2" style={{ fontSize: '10px' }}>
                Review disabled (Cancelled)
              </small>
            )}
          </div>
        </div>
      ))}

      {!items.length && !msg && (
        <div className="empty-state">No bookings yet. <Link to="/events">Explore events</Link></div>
      )}
    </main>
  );
}

function Schedule() {
  const [items, setItems] = useState([]);
  const [expos, setExpos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/sessions'),
      api.get('/expos')
    ]).then(([sRes, eRes]) => {
      setItems(sRes.data.data || []);
      setExpos(eRes.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const formatDuration = (start, end) => {
    if (!start || !end) return null;
    const diffMs = new Date(end) - new Date(start);
    if (diffMs <= 0) return null;
    const mins = Math.round(diffMs / 60000);
    if (mins < 60) return `${mins} mins`;
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return rem > 0 ? `${hrs}h ${rem}m` : `${hrs} hr${hrs > 1 ? 's' : ''}`;
  };

  const filteredItems = items.filter(s => {
    const q = searchTerm.toLowerCase();
    if (!q) return true;
    return (
      (s.title && s.title.toLowerCase().includes(q)) ||
      (s.speaker && s.speaker.toLowerCase().includes(q)) ||
      (s.location && s.location.toLowerCase().includes(q)) ||
      (s.topic && s.topic.toLowerCase().includes(q)) ||
      (s.expo?.title && s.expo.title.toLowerCase().includes(q))
    );
  });

  return (
    <main className="container page-space">
      {/* HERO BANNER */}
      <div className="schedule-hero-banner">
        <span className="eyebrow text-white opacity-75">LIVE AGENDAS &amp; KEYNOTES</span>
        <h1 className="fw-bold mb-2 text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Event <em>Schedule</em>
        </h1>
        <p className="mb-0 text-white opacity-85" style={{ maxWidth: '650px', fontSize: '15px' }}>
          Explore keynotes, speaker sessions, workshops, and panel presentations scheduled across all premier expos.
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="card border-0 shadow-sm p-3 mb-4 rounded-4" style={{ background: '#ffffff', border: '1px solid #e9e8f1' }}>
        <div className="input-group">
          <span className="input-group-text bg-light border-end-0">🔍</span>
          <input
            type="text"
            className="form-control border-start-0 bg-light"
            placeholder="Search session title, speaker, hall, or expo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="btn btn-light border" onClick={() => setSearchTerm('')}>✕ Clear</button>
          )}
        </div>
      </div>

      {/* SESSIONS LIST */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-purple mb-2" role="status" />
          <p className="text-muted small">Loading schedules...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="schedule-list">
          {filteredItems.map(s => {
            const duration = formatDuration(s.startTime, s.endTime);
            const speakerInitials = (s.speaker || 'S').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
            const expoObj = s.expo?._id ? s.expo : expos.find(e => e._id === (s.expo?._id || s.expo));

            return (
              <div className="schedule-card" key={s._id}>
                {/* TIME & DATE BOX */}
                <div className="schedule-time-box">
                  <div className="schedule-time-main">
                    ⏰ {new Date(s.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                    {s.endTime && (
                      <> – {new Date(s.endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}</>
                    )}
                  </div>
                  <div className="text-muted small mt-1">
                    📅 {new Date(s.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  {duration && (
                    <span
                      className="badge border mt-2"
                      style={{
                        fontSize: '11px',
                        backgroundColor: '#f3e8ff',
                        color: '#7e22ce',
                        borderColor: '#d8b4fe'
                      }}
                    >
                      ⏱️ {duration}
                    </span>
                  )}
                </div>

                {/* MAIN CONTENT */}
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                    <span
                      className="badge rounded-pill"
                      style={{
                        backgroundColor: '#f3e8ff',
                        color: '#7e22ce',
                        border: '1px solid #d8b4fe',
                        padding: '5px 12px',
                        fontSize: '12px'
                      }}
                    >
                      🎪 {expoObj?.title || 'Premier Expo'}
                    </span>
                    {s.topic && (
                      <span className="badge bg-light text-dark border" style={{ fontSize: '11px' }}>
                        🏷️ {s.topic}
                      </span>
                    )}
                  </div>

                  <h3
                    className="fw-bold my-1"
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '20px',
                      color: '#0f172a',
                      letterSpacing: '-0.3px'
                    }}
                  >
                    {s.title}
                  </h3>

                  <div className="d-flex align-items-center gap-3 mt-2 flex-wrap">
                    <div className="d-flex align-items-center gap-2">
                      <div className="schedule-avatar">{speakerInitials}</div>
                      <div>
                        <div className="small fw-bold" style={{ color: '#1e293b' }}>
                          🎤 {s.speaker || 'Featured Speaker'}
                        </div>
                        <div className="text-muted" style={{ fontSize: '11px' }}>Keynote Presenter</div>
                      </div>
                    </div>

                    <div className="vr d-none d-sm-block my-1" style={{ height: '24px' }} />

                    <div className="small text-muted d-flex align-items-center gap-1">
                      <span>📍</span>
                      <strong style={{ color: '#475569' }}>{s.location || 'Main Stage / Hall A'}</strong>
                    </div>
                  </div>
                </div>

                {/* EXPO LINK BUTTON */}
                {expoObj?._id && (
                  <div className="flex-shrink-0 text-end">
                    <Link to={`/events/${expoObj._id}`} className="btn btn-purple btn-sm px-3">
                      View Expo ↗
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-5 text-center bg-white border rounded-4 shadow-sm my-4">
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🗓️</div>
          <h4 className="fw-bold mb-1">No sessions match your search</h4>
          <p className="text-muted small mb-3">
            {searchTerm
              ? 'Try clearing your search keywords to view other sessions.'
              : 'Sessions will appear here once organizers schedule talks and agendas.'}
          </p>
          {searchTerm && (
            <div>
              <button
                className="btn btn-purple btn-sm px-4"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function ExhibitorHub() {
  const user = getUser();
  const isExhibitor = user?.role === 'exhibitor';
  const [expos, setExpos] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [form, setForm] = useState({ expo: '', company: '', products: '', description: '', contact: '' });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const loadData = () => {
    api.get('/expos').then(r => {
      setExpos(r.data.data || []);
      if (r.data.data?.length && !form.expo) setForm(f => ({ ...f, expo: r.data.data[0]._id }));
    }).catch(() => {});
    if (isExhibitor) {
      api.get('/exhibitors/mine').then(r => setMyApps(r.data.data || [])).catch(() => {});
    }
  };

  useEffect(() => { loadData(); }, [isExhibitor]);

  async function apply(e) {
    e.preventDefault();
    if (!isExhibitor) return setMsg('Please log in with an Exhibitor account to apply.');
    setBusy(true);
    setMsg('');
    try {
      const r = await api.post('/exhibitors/apply', form);
      setMsg(r.data.message || 'Application submitted successfully!');
      setForm({ expo: expos[0]?._id || '', company: '', products: '', description: '', contact: '' });
      loadData();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container page-space">
      <div className="page-intro">
        <span className="eyebrow">{isExhibitor ? 'EXHIBITOR MANAGEMENT PORTAL' : 'MEET THE COMMUNITY'}</span>
        <h1>Exhibitor <em>hub</em></h1>
        <p>{isExhibitor ? 'Apply for expo booths and track your application approval status.' : 'Discover opportunities to showcase your brand.'}</p>
      </div>

      {isExhibitor ? (
        <div className="dashboard-layout mb-5">
          <form className="dashboard-form" onSubmit={apply}>
            <h2>Apply for a Booth</h2>
            <p className="text-muted small">Select an upcoming expo and provide brand details for organizer review.</p>
            <label>Select Expo / Event</label>
            <select className="form-select" required value={form.expo} onChange={e => setForm({ ...form, expo: e.target.value })}>
              {expos.map(e => <option key={e._id} value={e._id}>{e.title} ({new Date(e.date).toLocaleDateString()})</option>)}
            </select>
            <label>Company / Brand Name</label>
            <input className="form-control" required value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="e.g. Nexus Tech" />
            <label>Industry / Products</label>
            <input className="form-control" required value={form.products} onChange={e => setForm({ ...form, products: e.target.value })} placeholder="e.g. AI, Cloud Solutions" />
            <label>Contact Phone / WhatsApp</label>
            <input className="form-control" required value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="+92 300 1234567" />
            <label>Brief Description / Requirements</label>
            <textarea className="form-control" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Tell us what you will be exhibiting..." />
            <button className="btn btn-purple mt-3 w-100" disabled={busy}>{busy ? 'Submitting...' : 'Submit Booth Application ↗'}</button>
            {msg && <div className="alert alert-info mt-3">{msg}</div>}
          </form>

          <div className="dashboard-events">
            <h2>My Booth Applications <span>{myApps.length}</span></h2>
            <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
              {myApps.map(a => (
                <div className="manage-event" key={a._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <b>{a.expo?.title || 'Expo Event'}</b>
                    <small>Company: {a.company}</small>
                    <small>Contact: {a.contact}</small>
                    {a.booth && <span className="admin-badge badge-organizer mt-1">Booth: {a.booth}</span>}
                  </div>
                  <div>
                    <span className={`admin-badge badge-${a.status}`}>{a.status}</span>
                  </div>
                </div>
              ))}
              {!myApps.length && <div className="empty-state">No booth applications yet. Fill the form to apply.</div>}
            </div>
          </div>
        </div>
      ) : (
        <div className="exhibitor-callout">
          <div>
            <span className="eyebrow">SHOWCASE YOUR BRAND</span>
            <h2>Bring your business<br />to the <em>floor.</em></h2>
            <p>Apply for a booth at one of our upcoming expos and connect with a focused audience.</p>
          </div>
          <button className="btn btn-purple" onClick={() => { if (!localStorage.getItem('es_token')) window.location.href = '/login'; else setMsg('Only Exhibitor accounts can apply for booths. Please contact admin to set your role as Exhibitor.'); }}>
            Become an exhibitor ↗
          </button>
        </div>
      )}

      {msg && !isExhibitor && <div className="alert alert-info mb-4">{msg}</div>}
      <h2 className="sub-heading">Upcoming Opportunities</h2>
      <div className="row g-4">{expos.map(e => <div className="col-md-6" key={e._id}><EventCard event={e} /></div>)}</div>
    </main>
  );
}

// Role portal redirection helper
function getPortalRoute(role) {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'organizer') return '/organizer/expos';
  if (role === 'exhibitor') return '/exhibitors';
  return '/bookings';
}

// 1. Dedicated Login Page
function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      const payload = {
        email: (form.email || '').trim(),
        password: (form.password || '').trim()
      };
      const r = await api.post('/auth/login', payload);
      localStorage.setItem('es_token', r.data.token);
      localStorage.setItem('es_user', JSON.stringify(r.data.user));

      const savedRedirect = sessionStorage.getItem('es_redirect');
      sessionStorage.removeItem('es_redirect');

      if (savedRedirect && r.data.user.role === 'attendee') {
        window.location.href = savedRedirect;
      } else {
        window.location.href = getPortalRoute(r.data.user.role);
      }
    } catch (err) {
      setMsg(err.response?.data?.message || err.message || 'Login failed. Please check credentials.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-visual">
        <img src={pics.expo} alt="Event venue" />
        <div>
          <span className="eyebrow">WELCOME TO EVENTSPHERE</span>
          <h2>Where connections<br /><em>come to life.</em></h2>
          <p>Sign in to enter your role dashboard and access live features.</p>
        </div>
      </div>
      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit}>
          <span className="eyebrow text-purple">SECURE ACCESS</span>
          <h1 className="fw-bold mb-2">Sign In</h1>
          <p className="text-muted mb-4">Enter your registered email and password to access your portal.</p>

          <label className="fw-semibold">Email Address</label>
          <input
            type="email"
            className="form-control mb-3"
            required
            placeholder="e.g. user@eventsphere.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />

          <label className="fw-semibold">Password</label>
          <input
            type="password"
            className="form-control mb-3"
            required
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />

          <button className="btn btn-purple w-100 mt-2" disabled={busy}>
            {busy ? 'Signing In...' : 'Sign In to Portal ↗'}
          </button>

          {msg && <div className="alert alert-danger mt-3 py-2 small">{msg}</div>}

          <div className="auth-switch mt-4">
            New to EventSphere? <Link to="/register" className="fw-bold text-purple">Create an Account</Link>
          </div>
        </form>
      </div>
    </main>
  );
}

// 2. Dedicated Register / Signup Page
function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'attendee' });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      const r = await api.post('/auth/register', form);
      if (r.data.token) {
        localStorage.setItem('es_token', r.data.token);
        localStorage.setItem('es_user', JSON.stringify(r.data.user));

        const savedRedirect = sessionStorage.getItem('es_redirect');
        sessionStorage.removeItem('es_redirect');

        if (savedRedirect && r.data.user.role === 'attendee') {
          window.location.href = savedRedirect;
        } else {
          window.location.href = getPortalRoute(r.data.user.role);
        }
      } else {
        setMsg('Account created successfully! Redirecting to sign in...');
        setTimeout(() => { window.location.href = '/login'; }, 1500);
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Registration failed. Check details.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-visual">
        <img src={pics.business[0] || pics.expo} alt="Event community" />
        <div>
          <span className="eyebrow">JOIN EVENTSPHERE</span>
          <h2>Experience &amp; organize<br /><em>Pakistan's premier expos.</em></h2>
          <p>Create your account and select your role to unlock your custom dashboard.</p>
        </div>
      </div>
      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit}>
          <span className="eyebrow text-purple">START YOUR JOURNEY</span>
          <h1 className="fw-bold mb-2">Create Account</h1>
          <p className="text-muted mb-4">Choose your role and get immediate access to your dashboard.</p>

          <label className="fw-semibold">Full Name</label>
          <input
            type="text"
            className="form-control mb-3"
            required
            placeholder="e.g. Ali Ahmed"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />

          <label className="fw-semibold">Email Address</label>
          <input
            type="email"
            className="form-control mb-3"
            required
            placeholder="e.g. ali@domain.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />

          <label className="fw-semibold">Password <small className="text-muted fw-normal">(min 6 chars)</small></label>
          <input
            type="password"
            className="form-control mb-3"
            minLength="6"
            required
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />

          <label className="fw-semibold">Choose Your Role</label>
          <select
            className="form-select mb-3"
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
          >
            <option value="attendee">🎟️ Attendee (Explore Expos &amp; Book Tickets)</option>
            <option value="organizer">🎪 Organizer (Host Expos &amp; Schedule Sessions)</option>
            <option value="exhibitor">🏢 Exhibitor (Apply for Booths &amp; Spaces)</option>
          </select>

          <button className="btn btn-purple w-100 mt-2" disabled={busy}>
            {busy ? 'Creating Account...' : 'Create Account & Enter Portal ↗'}
          </button>

          {msg && <div className="alert alert-danger mt-3 py-2 small">{msg}</div>}

          <div className="auth-switch mt-4">
            Already have an account? <Link to="/login" className="fw-bold text-purple">Sign in</Link>
          </div>
        </form>
      </div>
    </main>
  );
}

function SmartRedirect({ user }) {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'organizer') return <Navigate to="/organizer/expos" replace />;
  if (user.role === 'exhibitor') return <Navigate to="/exhibitors" replace />;
  return <Navigate to="/bookings" replace />;
}

/* ==========================================================================
   APP ROUTER
   ========================================================================== */
function App() {
  const user = getUser();

  return (
    <Routes>
      {/* Public & Attendee Routes */}
      <Route
        path="/"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : (
            <PublicLayout user={user}><Home /></PublicLayout>
          )
        }
      />
      <Route
        path="/home"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : (
            <PublicLayout user={user}><Home /></PublicLayout>
          )
        }
      />
      <Route path="/events" element={!user ? <Navigate to="/login" replace /> : <PublicLayout user={user}><Events /></PublicLayout>} />
      <Route path="/events/:id" element={!user ? <Navigate to="/login" replace /> : <PublicLayout user={user}><EventDetails /></PublicLayout>} />
      <Route
        path="/book/:id"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : (
            <PublicLayout user={user}><Book /></PublicLayout>
          )
        }
      />
      <Route
        path="/bookings"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : (
            <PublicLayout user={user}><MyBookings /></PublicLayout>
          )
        }
      />
      <Route path="/schedule" element={!user ? <Navigate to="/login" replace /> : <PublicLayout user={user}><Schedule /></PublicLayout>} />
      <Route path="/exhibitors" element={!user ? <Navigate to="/login" replace /> : <PublicLayout user={user}><ExhibitorHub /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout user={user}><Login /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout user={user}><Register /></PublicLayout>} />

      {/* Admin Dedicated Individual Routes (Professional Sidebar Layout) */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route
        path="/admin/dashboard"
        element={
          <DashboardLayout user={user} title="Admin Overview" subtitle="System metrics, revenue, and recent platform activity">
            <AdminDashboard />
          </DashboardLayout>
        }
      />
      <Route
        path="/admin/users"
        element={
          <DashboardLayout user={user} title="User Management" subtitle="Create accounts, assign roles, and manage users directory">
            <AdminUsers user={user} />
          </DashboardLayout>
        }
      />
      <Route
        path="/admin/expos"
        element={
          <DashboardLayout user={user} title="Expos Management" subtitle="Publish, inspect, and remove platform expos">
            <AdminExpos />
          </DashboardLayout>
        }
      />
      <Route
        path="/admin/exhibitors"
        element={
          <DashboardLayout user={user} title="Exhibitor Approvals" subtitle="Review booth applications and allocate event floor space">
            <AdminExhibitors />
          </DashboardLayout>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <DashboardLayout user={user} title="All Bookings" subtitle="Complete record of all ticket reservations across the platform">
            <AdminBookings />
          </DashboardLayout>
        }
      />

      {/* Organizer Dedicated Individual Routes (Professional Sidebar Layout) */}
      <Route path="/organizer" element={<Navigate to="/organizer/expos" replace />} />
      <Route
        path="/organizer/expos"
        element={
          <DashboardLayout user={user} title="My Expos" subtitle="Create and manage your expos and conferences">
            <OrganizerExpos />
          </DashboardLayout>
        }
      />
      <Route
        path="/organizer/sessions"
        element={
          <DashboardLayout user={user} title="Sessions & Schedule" subtitle="Schedule keynote talks, speakers, and agenda">
            <OrganizerSessions />
          </DashboardLayout>
        }
      />
      <Route
        path="/organizer/exhibitors"
        element={
          <DashboardLayout user={user} title="Booth Requests" subtitle="Review exhibitors applying for your events">
            <OrganizerExhibitors />
          </DashboardLayout>
        }
      />
      <Route
        path="/organizer/bookings"
        element={
          <DashboardLayout user={user} title="Attendee List" subtitle="View attendee bookings for your expos">
            <OrganizerBookings />
          </DashboardLayout>
        }
      />

      {/* Smart Redirect */}
      <Route path="/dashboard" element={<SmartRedirect user={user} />} />
      <Route path="*" element={<PublicLayout user={user}><main className="container page-space"><h2>Page not found</h2><Link to="/">Go home</Link></main></PublicLayout>} />
    </Routes>
  );
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
