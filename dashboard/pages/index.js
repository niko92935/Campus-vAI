import React, { useCallback, useEffect, useState } from 'react';

// ---- Backend connection ------------------------------------------------ ----
const API_BASE =
  typeof window !== 'undefined' && window.location.hostname.includes('ts.net')
    ? 'https://niko.tailf5f9d7.ts.net'
    : 'http://localhost:8000';

const ADMIN_KEY =
  (typeof window !== 'undefined' && (window.localStorage.getItem('ml_admin_key') || '')) ||
  'mindlink-admin-2026';

const ADMIN_HEADERS = { 'x-admin-key': ADMIN_KEY, 'Content-Type': 'application/json' };

const uploadUrl = (file, key) => `${API_BASE}/api/uploads/${file}?key=${encodeURIComponent(key || ADMIN_KEY)}`;

const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || '?';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [version, setVersion] = useState('1.1.0');
  const [bundleUrl, setBundleUrl] = useState('');
  const [notice, setNotice] = useState('');
  const [notices, setNotices] = useState([
    { id: 1, title: 'Server Maintenance', message: 'Proxmox node sync scheduled at midnight.', date: '2026-06-10' }
  ]);
  const [toast, setToast] = useState('');

  // real backend data
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [otaVersion, setOtaVersion] = useState('1.0.0');
  const [backendOk, setBackendOk] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [uRes, rRes, oRes] = await Promise.all([
        fetch(`${API_BASE}/api/users`, { headers: { 'x-admin-key': ADMIN_KEY } }),
        fetch(`${API_BASE}/api/users/requests`, { headers: { 'x-admin-key': ADMIN_KEY } }),
        fetch(`${API_BASE}/api/ota/check`),
      ]);
      setBackendOk(uRes.ok);
      if (uRes.ok) setUsers((await uRes.json()).users || []);
      if (rRes.ok) setRequests((await rRes.json()).requests || []);
      if (oRes.ok) {
        const ota = await oRes.json();
        setOtaVersion(ota.currentVersion || '1.0.0');
      }
    } catch {
      setBackendOk(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const timer = setInterval(() => loadData(true), 20000);
    return () => clearInterval(timer);
  }, [loadData]);

  const act = async (id, action, reason) => {
    setBusyId(id);
    try {
      const res = await fetch(`${API_BASE}/api/users/${id}/status`, {
        method: 'POST',
        headers: ADMIN_HEADERS,
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const label = { approve: 'approved ✅', reject: 'rejected ❌', suspend: 'suspended ⏸️', reactivate: 're-activated ✅' }[action] || action;
        triggerToast(data.user ? `${data.user.name} ${label}` : `User ${label}`);
        await loadData(true);
      } else {
        triggerToast(`⚠️ ${data?.message || 'Action failed'}`);
      }
    } catch {
      triggerToast('⚠️ Backend unreachable');
    } finally {
      setBusyId(null);
    }
  };

  const handlePublishOTA = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/ota/publish`, {
        method: 'POST',
        headers: ADMIN_HEADERS,
        body: JSON.stringify({ version, bundleUrl }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(`🚀 OTA v${version} pushed — updateAvailable flag is live!`);
        await loadData(true);
      } else {
        triggerToast(`⚠️ ${data?.message || 'Publish failed'}`);
      }
    } catch {
      triggerToast('⚠️ Backend unreachable');
    }
  };

  const handlePostNotice = (e) => {
    e.preventDefault();
    if (!notice.trim()) return;
    setNotices([{ id: Date.now(), title: 'System Broadcast', message: notice, date: 'Today' }, ...notices]);
    setNotice('');
    triggerToast('📢 Notice broadcasted to students & teachers.');
  };

  const activeUsers = users.filter((u) => u.status === 'active');
  const teachers = activeUsers.filter((u) => u.role === 'teacher');
  const pendingCount = requests.length;

  return (
    <div className="layout">
      {toast && <div className="toast">{toast}</div>}

      {/* Sidebar with Profile at Bottom */}
      <aside className="sidebar">
        <div className="logo-area">
          <div className="logo-icon">👑</div>
          <div className="logo-text">
            <h2>MindLink</h2>
            <span>Enterprise Core</span>
          </div>
        </div>

        <div className="nav-section">
          <p className="nav-category">CORE MODULES</p>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'server', label: 'Server & Proxmox', icon: '🖥️' },
            { id: 'users', label: 'Users & Teachers', icon: '👥' },
            { id: 'notice', label: 'Notice Board', icon: '📢' },
            { id: 'release', label: 'App OTA Release', icon: '🚀' },
            { id: 'settings', label: 'Settings', icon: '⚙️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span className="icon">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'users' && pendingCount > 0 ? (
                <span className="nav-badge">{pendingCount}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Super Admin Profile at Sidebar Bottom */}
        <div className="sidebar-footer">
          <div className="profile-pill">
            <div className="avatar">SA</div>
            <div className="profile-info">
              <span className="name">Super Admin</span>
              <span className="role">Laptop Node • SQLite</span>
            </div>
          </div>
          <div className="cluster-status">
            <span className={`dot ${backendOk ? '' : 'dot-off'}`}></span>
            <div>
              <p className="cluster-title">{backendOk ? 'Backend Online' : 'Backend Offline'}</p>
              <p className="cluster-sub">:8000 • Funnel :443/:8443</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="viewport">
          {activeTab === 'dashboard' && (
            <div className="view-grid">
              <div className="card span-full hero-card">
                <div>
                  <h2>Ecosystem Overview</h2>
                  <p>Central server handling backend APIs, teacher modules, and automated mobile updates.</p>
                </div>
                <div className={`hero-badge ${backendOk ? '' : 'hero-bad'}`}>
                  Status: {loading ? 'Checking…' : backendOk ? 'Optimal' : 'Backend Offline'}
                </div>
              </div>

              <div className="stat-box">
                <span className="stat-icon">👥</span>
                <div>
                  <p className="stat-label">Total Users</p>
                  <h3 className="stat-val">{loading ? '…' : activeUsers.length}</h3>
                </div>
              </div>
              <div className="stat-box">
                <span className="stat-icon">🎓</span>
                <div>
                  <p className="stat-label">Active Teachers</p>
                  <h3 className="stat-val">{loading ? '…' : teachers.length}</h3>
                </div>
              </div>
              <div className="stat-box clickable" onClick={() => setActiveTab('users')}>
                <span className="stat-icon">⏳</span>
                <div>
                  <p className="stat-label">Pending Requests</p>
                  <h3 className={`stat-val ${pendingCount > 0 ? 'stat-alert' : ''}`}>
                    {loading ? '…' : pendingCount}
                  </h3>
                </div>
              </div>
              <div className="stat-box">
                <span className="stat-icon">📦</span>
                <div>
                  <p className="stat-label">Active App Ver</p>
                  <h3 className="stat-val">v{loading ? '…' : otaVersion}</h3>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'server' && (
            <div className="view-stack">
              <div className="section-head">
                <h2>Local Server Node</h2>
                <button className="btn-sec" onClick={() => loadData()}>Refresh Status</button>
              </div>
              <div className="grid-3">
                <div className="panel">
                  <div className="panel-top">
                    <h3>SQLite DB</h3>
                    <span className={`pill ${backendOk ? 'gold' : 'red'}`}>{backendOk ? 'Running' : 'Offline'}</span>
                  </div>
                  <p className="panel-desc">Single-file store for accounts, ID cards and OTA state. Copy-paste portable to Proxmox.</p>
                  <div className="panel-meta">backend/data/mindlink.db</div>
                </div>
                <div className="panel">
                  <div className="panel-top">
                    <h3>NestJS Core API</h3>
                    <span className={`pill ${backendOk ? 'gold' : 'red'}`}>{backendOk ? 'Running' : 'Offline'}</span>
                  </div>
                  <p className="panel-desc">Backend service routing traffic between web and mobile — auth, users, uploads, OTA.</p>
                  <div className="panel-meta">Port: 8000 • Public via Funnel</div>
                </div>
                <div className="panel">
                  <div className="panel-top">
                    <h3>Admin Dashboard</h3>
                    <span className="pill gold">Running</span>
                  </div>
                  <p className="panel-desc">Next.js admin panel — user approvals, verification queue and OTA deployment.</p>
                  <div className="panel-meta">Port: 3000 • Funnel :8443</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="view-stack">
              {/* Pending signup requests */}
              <div className="section-head">
                <h2>Pending Signup Requests</h2>
                <span className="pill gold">{loading ? '…' : `${pendingCount} waiting`}</span>
              </div>

              {!loading && requests.length === 0 && (
                <div className="card-box empty-box">🎉 No pending requests — every signup has been reviewed.</div>
              )}

              <div className="request-stack">
                {requests.map((r) => (
                  <div key={r.id} className="request-card">
                    <div className="request-info">
                      <div className="td-user">
                        <div className="av">{initials(r.name)}</div>
                        <div>
                          <p className="t-bold">{r.name}</p>
                          <p className="t-sub">{r.email}</p>
                          <p className="t-sub">
                            {r.role === 'teacher' ? '👩‍🏫 Teacher' : '🎓 Student'} • {r.rollNumber} • {r.phone}
                          </p>
                          <p className="t-sub">Applied: {String(r.createdAt || '').slice(0, 10)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="id-cards">
                      <a href={uploadUrl(r.idCardFront)} target="_blank" rel="noreferrer" className="id-card-link">
                        <img src={uploadUrl(r.idCardFront)} alt="ID front" className="id-img" />
                        <span>Front</span>
                      </a>
                      <a href={uploadUrl(r.idCardBack)} target="_blank" rel="noreferrer" className="id-card-link">
                        <img src={uploadUrl(r.idCardBack)} alt="ID back" className="id-img" />
                        <span>Back</span>
                      </a>
                    </div>
                    <div className="request-actions">
                      <button className="btn-prim" disabled={busyId === r.id} onClick={() => act(r.id, 'approve')}>
                        ✅ Approve
                      </button>
                      <button
                        className="btn-sec"
                        disabled={busyId === r.id}
                        onClick={() => {
                          const reason = window.prompt('Rejection reason:') || '';
                          if (reason !== null) act(r.id, 'reject', reason);
                        }}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Managed users */}
              <div className="section-head">
                <h2>User & Teacher Directory</h2>
                <button className="btn-sec" onClick={() => loadData()}>🔄 Refresh</button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name & Email</th>
                      <th>Role</th>
                      <th>ID</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="td-user">
                            <div className="av">{initials(u.name)}</div>
                            <div>
                              <p className="t-bold">{u.name}</p>
                              <p className="t-sub">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          {u.role === 'teacher' ? (
                            <span className="badge amber">Teacher</span>
                          ) : (
                            <span className="badge gold">Student</span>
                          )}
                        </td>
                        <td><span className="t-sub">{u.rollNumber}</span></td>
                        <td>
                          {u.status === 'active' ? (
                            <><span className="status gold"></span> Active</>
                          ) : u.status === 'suspended' ? (
                            <><span className="status red"></span> Suspended</>
                          ) : (
                            <><span className="status gray"></span> {u.status}</>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            {u.status === 'active' ? (
                              <button className="btn-action" disabled={busyId === u.id} onClick={() => act(u.id, 'suspend')}>
                                Suspend
                              </button>
                            ) : (
                              <button className="btn-action" disabled={busyId === u.id} onClick={() => act(u.id, 'reactivate')}>
                                Reactivate
                              </button>
                            )}
                            <a className="btn-action" href={uploadUrl(u.idCardFront)} target="_blank" rel="noreferrer">ID Card</a>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && !loading && (
                      <tr>
                        <td colSpan={5}><span className="t-sub">No approved users yet.</span></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'notice' && (
            <div className="view-stack">
              <div className="section-head">
                <h2>Broadcast Notice Board</h2>
              </div>
              <div className="card-box">
                <form onSubmit={handlePostNotice} className="form-row">
                  <input
                    type="text"
                    value={notice}
                    onChange={(e) => setNotice(e.target.value)}
                    placeholder="Write a system notice for all mobile app users..."
                    className="text-input"
                  />
                  <button type="submit" className="btn-prim">Broadcast</button>
                </form>
              </div>
              <div className="notice-stack">
                {notices.map(n => (
                  <div key={n.id} className="notice-card">
                    <div>
                      <span className="n-tag">{n.title}</span>
                      <p className="n-msg">{n.message}</p>
                    </div>
                    <span className="n-date">{n.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'release' && (
            <div className="view-stack">
              <div className="section-head">
                <h2>OTA Auto-Update Deployment</h2>
                <span className="pill gold">Active Sync</span>
              </div>
              <div className="card-box">
                <p className="box-desc">
                  Publish a new app version so the mobile app reports “update available”.
                  Current live version: <strong>v{otaVersion}</strong>. The actual bundle is served by the next APK build.
                </p>
                <form onSubmit={handlePublishOTA} className="form-stack">
                  <div className="field">
                    <label>Version Tag</label>
                    <input
                      type="text"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      className="text-input"
                    />
                  </div>
                  <div className="field">
                    <label>Bundle CDN URL (optional)</label>
                    <input
                      type="text"
                      value={bundleUrl}
                      onChange={(e) => setBundleUrl(e.target.value)}
                      className="text-input"
                    />
                  </div>
                  <button type="submit" className="btn-glow">🚀 Push OTA Update to All Devices</button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="view-stack">
              <div className="section-head">
                <h2>Platform Settings</h2>
              </div>
              <div className="card-box">
                <p className="box-desc">Local server configuration — change the admin key here (stored in this browser).</p>
                <div className="form-stack">
                  <div className="field">
                    <label>Admin Key</label>
                    <input
                      type="text"
                      defaultValue={ADMIN_KEY}
                      className="text-input"
                      onChange={(e) => window.localStorage.setItem('ml_admin_key', e.target.value)}
                    />
                  </div>
                  <p className="t-sub">Backend: {API_BASE} • data/mindlink.db + data/uploads/</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        body { background: #0c0a09; color: #f5f5f4; }

        .layout { display: flex; height: 100vh; overflow: hidden; background: #0c0a09; }

        /* Elite Toast */
        .toast { position: fixed; top: 24px; right: 24px; background: linear-gradient(135deg, #d4af37, #aa771c); color: #0c0a09; padding: 14px 24px; border-radius: 12px; font-weight: 700; font-size: 14px; z-index: 9999; box-shadow: 0 10px 30px rgba(212,175,55,0.3); animation: popIn 0.25s ease; }
        @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        /* Sidebar - Rich Obsidian & Gold Palette */
        .sidebar { width: 280px; background: #12100e; border-right: 1px solid #231f1b; display: flex; flex-direction: column; }
        .logo-area { padding: 28px 24px; display: flex; align-items: center; gap: 14px; border-bottom: 1px solid #231f1b; }
        .logo-icon { font-size: 26px; background: linear-gradient(135deg, #2a241e, #1a1612); padding: 10px; border-radius: 14px; border: 1px solid #3d342a; }
        .logo-text h2 { font-size: 18px; font-weight: 700; color: #fafaf9; letter-spacing: -0.5px; }
        .logo-text span { font-size: 11px; color: #d4af37; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

        .nav-section { padding: 24px 16px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .nav-category { font-size: 10px; font-weight: 700; color: #78716c; letter-spacing: 1px; padding: 0 12px 8px 12px; }
        .nav-link { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; border: none; background: transparent; color: #a8a29e; font-size: 14px; font-weight: 500; cursor: pointer; text-align: left; transition: all 0.2s; }
        .nav-link:hover { background: #1c1815; color: #fff; }
        .nav-link.active { background: linear-gradient(135deg, rgba(212,175,55,0.12), rgba(170,119,28,0.08)); color: #facc15; font-weight: 600; border: 1px solid rgba(212,175,55,0.3); box-shadow: 0 4px 20px rgba(212,175,55,0.05); }
        .nav-link .icon { font-size: 16px; }
        .nav-badge { margin-left: auto; background: linear-gradient(135deg, #d4af37, #aa771c); color: #0c0a09; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 10px; }

        /* Sidebar Footer with Profile & Cluster Status */
        .sidebar-footer { padding: 20px 24px; border-top: 1px solid #231f1b; display: flex; flex-direction: column; gap: 14px; background: #0e0c0b; }
        .profile-pill { display: flex; align-items: center; gap: 12px; background: #181411; padding: 12px 14px; border-radius: 14px; border: 1px solid #29231e; }
        .avatar { width: 36px; height: 36px; background: linear-gradient(135deg, #d4af37, #aa771c); color: #0c0a09; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; box-shadow: 0 2px 10px rgba(212,175,55,0.3); }
        .profile-info .name { font-size: 13px; font-weight: 700; color: #fff; display: block; }
        .profile-info .role { font-size: 11px; color: #d4af37; }

        .cluster-status { display: flex; align-items: center; gap: 10px; padding: 0 4px; }
        .dot { width: 8px; height: 8px; background: #d4af37; border-radius: 50%; box-shadow: 0 0 10px #d4af37; }
        .dot-off { background: #ef4444; box-shadow: 0 0 10px #ef4444; }
        .cluster-title { font-size: 12px; font-weight: 600; color: #e7e5e4; }
        .cluster-sub { font-size: 10px; color: #78716c; }

        /* Main Content */
        .main-content { flex: 1; display: flex; flex-direction: column; overflow-y: auto; background: #0c0a09; }

        /* Viewport */
        .viewport { padding: 40px; flex: 1; max-width: 1350px; width: 100%; margin: 0 auto; }

        /* Grid Layouts */
        .view-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .view-stack { display: flex; flex-direction: column; gap: 24px; }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }

        .span-full { grid-column: span 4; }
        .hero-card { background: linear-gradient(135deg, #16120f, #1e1915); border: 1px solid #2d241d; padding: 32px; border-radius: 18px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .hero-card h2 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; letter-spacing: -0.5px; }
        .hero-card p { font-size: 14px; color: #a8a29e; max-width: 700px; }
        .hero-badge { background: rgba(212,175,55,0.15); color: #facc15; border: 1px solid rgba(212,175,55,0.3); padding: 8px 18px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        .hero-bad { background: rgba(239,68,68,0.15); color: #f87171; border-color: rgba(239,68,68,0.3); }

        .stat-box { background: #12100e; border: 1px solid #231f1b; padding: 22px; border-radius: 16px; display: flex; align-items: center; gap: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
        .stat-box.clickable { cursor: pointer; transition: border-color 0.2s; }
        .stat-box.clickable:hover { border-color: rgba(212,175,55,0.4); }
        .stat-icon { font-size: 22px; background: #1a1612; padding: 12px; border-radius: 12px; border: 1px solid #2e2620; }
        .stat-label { font-size: 12px; color: #78716c; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-val { font-size: 24px; font-weight: 800; color: #fff; margin-top: 4px; }
        .stat-alert { color: #facc15; }

        /* Panels & Cards */
        .panel { background: #12100e; border: 1px solid #231f1b; padding: 26px; border-radius: 16px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
        .panel-top { display: flex; align-items: center; justify-content: space-between; }
        .panel-top h3 { font-size: 16px; font-weight: 700; color: #fff; }
        .panel-desc { font-size: 13px; color: #a8a29e; line-height: 1.5; flex: 1; }
        .panel-meta { font-size: 11px; font-weight: 700; color: #78716c; border-top: 1px solid #231f1b; padding-top: 14px; }

        .pill { padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .pill.gold { background: rgba(212,175,55,0.15); color: #facc15; border: 1px solid rgba(212,175,55,0.3); }
        .pill.red { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }

        /* Section Heads */
        .section-head { display: flex; align-items: center; justify-content: space-between; }
        .section-head h2 { font-size: 20px; font-weight: 700; color: #fff; letter-spacing: -0.5px; }

        /* Pending Requests Queue */
        .request-stack { display: flex; flex-direction: column; gap: 16px; }
        .request-card { background: #12100e; border: 1px solid rgba(212,175,55,0.18); border-radius: 16px; padding: 22px; display: grid; grid-template-columns: 1.2fr auto auto; gap: 20px; align-items: center; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
        .request-actions { display: flex; flex-direction: column; gap: 10px; }
        .request-actions .btn-prim, .request-actions .btn-sec { padding: 10px 18px; font-size: 12px; }
        .request-actions .btn-prim:disabled, .request-actions .btn-sec:disabled { opacity: 0.5; cursor: wait; }

        .id-cards { display: flex; gap: 10px; }
        .id-card-link { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; color: #78716c; text-transform: uppercase; letter-spacing: 0.5px; text-decoration: none; }
        .id-img { width: 82px; height: 54px; object-fit: cover; border-radius: 8px; border: 1px solid #332a22; background: #1a1612; }
        .id-card-link:hover .id-img { border-color: #d4af37; }

        .empty-box { color: #a8a29e; text-align: center; }

        /* Tables */
        .table-wrap { background: #12100e; border: 1px solid #231f1b; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th { background: #181411; padding: 16px 24px; font-size: 11px; font-weight: 700; color: #78716c; letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid #231f1b; }
        td { padding: 16px 24px; border-top: 1px solid #231f1b; font-size: 13px; }
        .td-user { display: flex; align-items: center; gap: 12px; }
        .av { width: 34px; height: 34px; background: #1a1612; color: #d4af37; border: 1px solid #332a22; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px; flex-shrink: 0; }
        .t-bold { font-weight: 700; color: #fff; }
        .t-sub { font-size: 11px; color: #78716c; }

        .badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }
        .badge.amber { background: rgba(217,119,6,0.15); color: #f59e0b; border: 1px solid rgba(217,119,6,0.3); }
        .badge.gold { background: rgba(212,175,55,0.15); color: #facc15; border: 1px solid rgba(212,175,55,0.3); }

        .status { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 6px; }
        .status.gold { background: #facc15; box-shadow: 0 0 8px #facc15; }
        .status.red { background: #ef4444; box-shadow: 0 0 8px #ef4444; }
        .status.gray { background: #78716c; }

        /* Forms & Cards */
        .card-box { background: #12100e; border: 1px solid #231f1b; padding: 28px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
        .box-desc { font-size: 13px; color: #a8a29e; margin-bottom: 20px; line-height: 1.5; }
        .form-row { display: flex; gap: 12px; }
        .form-stack { display: flex; flex-direction: column; gap: 18px; max-width: 500px; }
        .field { display: flex; flex-direction: column; gap: 8px; }
        .field label { font-size: 12px; font-weight: 700; color: #a8a29e; text-transform: uppercase; letter-spacing: 0.5px; }

        .text-input { flex: 1; background: #0c0a09; border: 1px solid #231f1b; padding: 14px 18px; border-radius: 12px; color: #fff; font-size: 13px; outline: none; transition: all 0.2s; }
        .text-input:focus { border-color: #d4af37; box-shadow: 0 0 10px rgba(212,175,55,0.15); }

        /* Buttons */
        .btn-prim { background: linear-gradient(135deg, #d4af37, #aa771c); color: #0c0a09; border: none; padding: 12px 22px; border-radius: 12px; font-weight: 800; font-size: 13px; cursor: pointer; transition: opacity 0.2s; box-shadow: 0 4px 15px rgba(212,175,55,0.2); }
        .btn-prim:hover { opacity: 0.9; }
        .btn-sec { background: #181411; color: #fff; border: 1px solid #2e2620; padding: 12px 20px; border-radius: 12px; font-weight: 700; font-size: 13px; cursor: pointer; transition: background 0.2s; }
        .btn-sec:hover { background: #221a15; }
        .btn-action { text-decoration: none; background: #181411; color: #facc15; border: 1px solid rgba(212,175,55,0.3); padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; }
        .btn-glow { background: linear-gradient(135deg, #d4af37, #b45309); color: #0c0a09; border: none; padding: 14px; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; box-shadow: 0 4px 25px rgba(212,175,55,0.3); transition: transform 0.2s; }
        .btn-glow:hover { transform: translateY(-1px); }

        /* Notice List */
        .notice-stack { display: flex; flex-direction: column; gap: 14px; margin-top: 16px; }
        .notice-card { background: #12100e; border: 1px solid #231f1b; padding: 20px 26px; border-radius: 14px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .n-tag { background: rgba(212,175,55,0.15); color: #facc15; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .n-msg { font-size: 13px; color: #e7e5e4; margin-top: 6px; }
        .n-date { font-size: 11px; color: #78716c; font-weight: 600; }

        @media (max-width: 1100px) {
          .request-card { grid-template-columns: 1fr; }
          .request-actions { flex-direction: row; }
        }
      `}</style>
    </div>
  );
}
