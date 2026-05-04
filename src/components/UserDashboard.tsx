import React, { useEffect, useState } from 'react';
import { LogOut, LayoutDashboard, User as UserIcon, BarChart3, Clock, BookOpen, Bell, Calendar } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../supabaseClient';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const theme = {
  primary: '#D4651A',
  primaryLight: '#FFF3E0',
  primaryBorder: '#FFD9B0',
  primaryDark: '#B5430A',
  text: '#1a0a00',
  textMuted: '#8B4513',
  bg: '#FFFAF5',
  cardBg: '#FFFFFF',
  navBg: '#FFF8F0',
};

export default function UserDashboard({ user, onLogout }: DashboardProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [flash, setFlash] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [unreadCount, setUnreadCount] = useState(0);

  const showFlash = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(null), 3000); };

  const fetchData = () => {
    const token = localStorage.getItem('token');
    fetch(`${import.meta.env.VITE_API_URL}/api/student/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()).then((d) => {
      setData(d);
      setLoading(false);
      const lastSeen = localStorage.getItem('lastSeenAnnouncement');
      if (d.announcements && d.announcements.length > 0) {
        if (!lastSeen) {
          setUnreadCount(d.announcements.length);
        } else {
          const idx = d.announcements.findIndex((a: any) => a.id === lastSeen);
          setUnreadCount(idx === -1 ? d.announcements.length : idx);
        }
      }
    });
  };

  const markAnnouncementsRead = () => {
    if (data?.announcements?.length > 0) {
      localStorage.setItem('lastSeenAnnouncement', data.announcements[0].id);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchData();
    const channel = supabase.channel(`student-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance', filter: `student_id=eq.${user.id}` }, () => { fetchData(); showFlash('Attendance updated!'); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fees', filter: `student_id=eq.${user.id}` }, () => { fetchData(); showFlash('Fees updated!'); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'results', filter: `student_id=eq.${user.id}` }, () => { fetchData(); showFlash('Results updated!'); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => { fetchData(); showFlash('New announcement!'); setUnreadCount(c => c + 1); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'materials' }, () => { fetchData(); showFlash('New material!'); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timetable' }, () => { fetchData(); showFlash('Timetable updated!'); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user.id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg }}>
      <p style={{ color: theme.textMuted, fontSize: 14 }}>Loading your dashboard...</p>
    </div>
  );

  const totalClasses = data.attendance?.length || 0;
  const presentClasses = data.attendance?.filter((a: any) => a.present).length || 0;
  const attendancePct = totalClasses ? Math.round((presentClasses / totalClasses) * 100) : 0;
  const pendingFees = data.fees?.filter((f: any) => !f.paid) || [];
  const monthlyAttendance = data.attendance?.filter((a: any) => a.date?.startsWith(selectedMonth)) || [];
  const monthlyPresent = monthlyAttendance.filter((a: any) => a.present).length;
  const monthlyAbsent = monthlyAttendance.length - monthlyPresent;
  const monthlyPct = monthlyAttendance.length ? Math.round((monthlyPresent / monthlyAttendance.length) * 100) : 0;

  const navItems = [
    { id: 'overview', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'attendance', label: 'Attend', icon: <Clock className="w-5 h-5" /> },
    { id: 'fees', label: 'Fees', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'results', label: 'Results', icon: <UserIcon className="w-5 h-5" /> },
    { id: 'materials', label: 'Notes', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'timetable', label: 'Time', icon: <Calendar className="w-5 h-5" /> },
    { id: 'announcements', label: 'News', icon: <Bell className="w-5 h-5" /> },
  ];

  const card = { background: theme.cardBg, borderRadius: 20, border: `1px solid ${theme.primaryBorder}`, padding: '20px', marginBottom: 16, boxShadow: '0 2px 12px rgba(212,101,26,0.08)' };

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      {flash && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 50, background: theme.primary, color: 'white', padding: '12px 20px', borderRadius: 16, fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(212,101,26,0.4)' }}>
          {flash}
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex" style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 240, background: 'white', borderRight: `1px solid ${theme.primaryBorder}`, flexDirection: 'column', padding: 24, gap: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="logo" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
          <span style={{ fontWeight: 700, fontSize: 16, color: theme.primary }}>Divine Path</span>
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); if (item.id === 'announcements') markAnnouncementsRead(); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s', background: activeTab === item.id ? theme.primary : 'transparent', color: activeTab === item.id ? 'white' : theme.textMuted, position: 'relative' }}>
              {item.icon}{item.label}
              {item.id === 'announcements' && unreadCount > 0 && (
                <span style={{ marginLeft: 'auto', background: '#CC3333', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount}</span>
              )}
            </button>
          ))}
        </nav>
        <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: 'transparent', color: '#CC3333' }}>
          <LogOut className="w-5 h-5" />Sign Out
        </button>
      </div>

      {/* Mobile Top Bar */}
      <div className="md:hidden" style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'white', borderBottom: `1px solid ${theme.primaryBorder}`, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/logo.png" alt="logo" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: theme.primary }}>Divine Path</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => { setActiveTab('announcements'); markAnnouncementsRead(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: 4 }}>
            <Bell style={{ width: 20, height: 20, color: theme.primary }} />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: -2, right: -2, background: '#CC3333', color: 'white', borderRadius: '50%', width: 16, height: 16, fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount}</span>
            )}
          </button>
          <button onClick={onLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CC3333' }}>
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-60" style={{ paddingTop: 64, paddingBottom: 80 }}>
        <div className="md:pt-8" style={{ padding: '16px' }}>
          <header style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: theme.text }}>Welcome, {user.name}</h1>
            <p style={{ fontSize: 11, color: theme.textMuted, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>ID: {user.id} - {data.profile?.batch}</p>
          </header>

          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
                <StatCard title="Attendance" value={`${attendancePct}%`} sub={`${presentClasses}/${totalClasses}`} color={theme.primary} />
                <StatCard title="Pending Fees" value={`Rs.${pendingFees.reduce((s: number, f: any) => s + f.amount, 0)}`} sub={`${pendingFees.length} due`} color="#CC3333" />
                <StatCard title="Avg Marks" value={data.results?.length ? `${Math.round(data.results.reduce((s: number, r: any) => s + (r.marks / r.total_marks) * 100, 0) / data.results.length)}%` : 'N/A'} sub="all subjects" color="#1a7a1a" />
              </div>
              <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color: theme.text }}>Latest Announcements</h3>
                  {unreadCount > 0 && <span style={{ background: '#CC3333', color: 'white', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{unreadCount} new</span>}
                </div>
                {data.announcements?.length === 0 && <p style={{ color: theme.textMuted, fontSize: 13 }}>No announcements yet.</p>}
                {data.announcements?.slice(0, 3).map((a: any) => (
                  <div key={a.id} style={{ background: theme.primaryLight, borderRadius: 12, padding: '12px 14px', marginBottom: 8, borderLeft: `3px solid ${theme.primary}` }}>
                    <p style={{ fontWeight: 600, fontSize: 13, color: theme.text }}>{a.title}</p>
                    <p style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>{a.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div>
              <div style={card}>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: theme.text, marginBottom: 12 }}>Overall Attendance</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <MiniStat label="Overall" value={`${attendancePct}%`} color="#1a7a1a" bg="#f0fff0" />
                  <MiniStat label="Present" value={presentClasses} color="#1a5fa0" bg="#f0f8ff" />
                  <MiniStat label="Absent" value={totalClasses - presentClasses} color="#CC3333" bg="#fff0f0" />
                </div>
              </div>
              <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color: theme.text }}>Monthly Attendance</h3>
                  <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
                    style={{ border: `1.5px solid ${theme.primaryBorder}`, borderRadius: 10, padding: '6px 12px', fontSize: 13, outline: 'none', color: theme.text, background: theme.bg }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <MiniStat label="This Month" value={`${monthlyPct}%`} color="#1a7a1a" bg="#f0fff0" />
                  <MiniStat label="Present" value={monthlyPresent} color="#1a5fa0" bg="#f0f8ff" />
                  <MiniStat label="Absent" value={monthlyAbsent} color="#CC3333" bg="#fff0f0" />
                </div>
                {monthlyAttendance.length === 0 && <p style={{ color: theme.textMuted, fontSize: 13 }}>No records for this month.</p>}
                {monthlyAttendance.map((a: any) => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: theme.primaryLight, borderRadius: 12, marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: theme.text }}>{a.date}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 8, background: a.present ? '#d4edda' : '#f8d7da', color: a.present ? '#1a7a1a' : '#CC3333' }}>
                      {a.present ? 'Present' : 'Absent'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div style={card}>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: theme.text, marginBottom: 12 }}>Fees Status</h3>
              {data.fees?.length === 0 && <p style={{ color: theme.textMuted, fontSize: 13 }}>No fee records yet.</p>}
              {data.fees?.map((f: any) => (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: theme.primaryLight, borderRadius: 12, marginBottom: 8 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>Rs.{f.amount}</p>
                    <p style={{ fontSize: 12, color: theme.textMuted }}>Due: {f.due_date}</p>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 8, background: f.paid ? '#d4edda' : '#f8d7da', color: f.paid ? '#1a7a1a' : '#CC3333' }}>
                    {f.paid ? 'Paid' : 'Due'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'results' && (
            <div style={card}>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: theme.text, marginBottom: 12 }}>Results</h3>
              {data.results?.length === 0 && <p style={{ color: theme.textMuted, fontSize: 13 }}>No results yet.</p>}
              {data.results?.map((r: any) => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: theme.primaryLight, borderRadius: 12, marginBottom: 8 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>{r.subject}</p>
                    <p style={{ fontSize: 12, color: theme.textMuted }}>{r.exam_date}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: theme.primary }}>{r.marks}/{r.total_marks}</p>
                    <p style={{ fontSize: 12, color: theme.textMuted }}>{Math.round((r.marks / r.total_marks) * 100)}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'materials' && (
            <div style={card}>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: theme.text, marginBottom: 12 }}>Study Materials</h3>
              {data.materials?.length === 0 && <p style={{ color: theme.textMuted, fontSize: 13 }}>No materials yet.</p>}
              {data.materials?.map((m: any) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: theme.primaryLight, borderRadius: 12, marginBottom: 8 }}>
                  <div style={{ flex: 1, marginRight: 12 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>{m.title}</p>
                    <p style={{ fontSize: 12, color: theme.textMuted }}>{m.subject}</p>
                  </div>
                  <a href={m.file_url} target="_blank" rel="noreferrer"
                    style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 10, background: theme.primary, color: 'white', textDecoration: 'none' }}>
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'timetable' && (
            <div style={card}>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: theme.text, marginBottom: 12 }}>Timetable</h3>
              {data.timetable?.length === 0 && <p style={{ color: theme.textMuted, fontSize: 13 }}>No timetable yet.</p>}
              {data.timetable?.map((t: any) => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: theme.primaryLight, borderRadius: 12, marginBottom: 8 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>{t.day} - {t.subject}</p>
                    <p style={{ fontSize: 12, color: theme.textMuted }}>{t.teacher}</p>
                  </div>
                  <span style={{ fontSize: 12, color: theme.textMuted }}>{t.time}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'announcements' && (
            <div style={card}>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: theme.text, marginBottom: 12 }}>Announcements</h3>
              {data.announcements?.length === 0 && <p style={{ color: theme.textMuted, fontSize: 13 }}>No announcements yet.</p>}
              {data.announcements?.map((a: any) => (
                <div key={a.id} style={{ background: theme.primaryLight, borderRadius: 12, padding: '12px 14px', marginBottom: 8, borderLeft: `3px solid ${theme.primary}` }}>
                  <p style={{ fontWeight: 600, fontSize: 13, color: theme.text }}>{a.title}</p>
                  <p style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>{a.message}</p>
                  <p style={{ fontSize: 11, color: '#B5430A', marginTop: 6 }}>{new Date(a.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: `1px solid ${theme.primaryBorder}`, zIndex: 40, display: 'flex' }}>
        {navItems.map((item) => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); if (item.id === 'announcements') markAnnouncementsRead(); }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0', gap: 2, fontSize: 9, fontWeight: 600, border: 'none', cursor: 'pointer', background: 'transparent', color: activeTab === item.id ? theme.primary : '#9e9e9e', position: 'relative' }}>
            <div style={{ padding: 6, borderRadius: 10, background: activeTab === item.id ? theme.primaryLight : 'transparent', color: activeTab === item.id ? theme.primary : '#9e9e9e', position: 'relative' }}>
              {item.icon}
              {item.id === 'announcements' && unreadCount > 0 && (
                <span style={{ position: 'absolute', top: -2, right: -2, background: '#CC3333', color: 'white', borderRadius: '50%', width: 14, height: 14, fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount}</span>
              )}
            </div>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, color }: any) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '16px', border: '1px solid #FFD9B0', boxShadow: '0 2px 8px rgba(212,101,26,0.08)' }}>
      <p style={{ fontSize: 12, color: '#8B4513', fontWeight: 500 }}>{title}</p>
      <h4 style={{ fontSize: 22, fontWeight: 800, color, marginTop: 4 }}>{value}</h4>
      <p style={{ fontSize: 11, color: '#B5430A', marginTop: 2 }}>{sub}</p>
    </div>
  );
}

function MiniStat({ label, value, color, bg }: any) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: '12px', textAlign: 'center' }}>
      <p style={{ fontSize: 20, fontWeight: 800, color }}>{value}</p>
      <p style={{ fontSize: 11, color: '#8B4513', marginTop: 2 }}>{label}</p>
    </div>
  );
}