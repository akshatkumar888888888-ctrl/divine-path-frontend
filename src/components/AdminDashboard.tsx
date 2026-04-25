import React, { useEffect, useState, useRef } from 'react';
import { LogOut, LayoutDashboard, Users, Bell, BookOpen, Calendar, BarChart3, Plus, Trash2, CheckCircle, XCircle, Search, ChevronDown, Menu, X } from 'lucide-react';
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
};

function StudentSelect({ students, value, onChange, placeholder = 'Select Student' }: any) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const filtered = students.filter((s: any) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );
  const selected = students.find((s: any) => s.id === value);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: theme.bg, border: `1.5px solid ${theme.primaryBorder}`, borderRadius: 12, padding: '10px 14px', fontSize: 13, cursor: 'pointer', color: selected ? theme.text : theme.textMuted }}>
        <span>{selected ? `${selected.name} (${selected.id})` : placeholder}</span>
        <ChevronDown size={16} color={theme.textMuted} />
      </button>
      {open && (
        <div style={{ position: 'absolute', zIndex: 50, width: '100%', marginTop: 4, background: 'white', border: `1.5px solid ${theme.primaryBorder}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 24px rgba(212,101,26,0.15)' }}>
          <div style={{ padding: 8, borderBottom: `1px solid ${theme.primaryBorder}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Search size={14} color={theme.textMuted} />
            <input autoFocus placeholder="Search student..." value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: theme.text, width: '100%' }} />
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <p style={{ padding: 12, fontSize: 12, color: theme.textMuted }}>No students found</p>
            ) : filtered.map((s: any) => (
              <button key={s.id} type="button" onClick={() => { onChange(s.id); setOpen(false); setSearch(''); }}
                style={{ width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: 13, border: 'none', cursor: 'pointer', background: value === s.id ? theme.primaryLight : 'transparent', color: value === s.id ? theme.primary : theme.text }}>
                {s.name} <span style={{ color: theme.textMuted, fontSize: 11 }}>({s.id}) • {s.batch}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [flash, setFlash] = useState<string | null>(null);
  const [fees, setFees] = useState<any[]>([]);
  const [selectedFeeStudent, setSelectedFeeStudent] = useState('');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [newStudent, setNewStudent] = useState({ id: '', name: '', batch: '', phone: '', password: '' });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '' });
  const [newMaterial, setNewMaterial] = useState({ title: '', subject: '', file_url: '' });
  const [newFee, setNewFee] = useState({ student_id: '', amount: '', due_date: '' });
  const [newResult, setNewResult] = useState({ student_id: '', subject: '', marks: '', total_marks: '', exam_date: '' });
  const [newAttendance, setNewAttendance] = useState({ student_id: '', date: '', present: true });
  const [newTimetable, setNewTimetable] = useState({ day: '', subject: '', time: '', teacher: '' });

  const token = localStorage.getItem('token');
  const showFlash = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(null), 3000); };

  const fetchStudents = () => fetch(`${import.meta.env.VITE_API_URL}/api/admin/students`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setStudents(Array.isArray(d) ? d : []));
  const fetchAttendance = (sid: string, month: string) => { if (!sid) return; fetch(`${import.meta.env.VITE_API_URL}/api/admin/attendance/${sid}/${month}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setAttendance(Array.isArray(d) ? d : [])); };
  const fetchFees = (sid: string) => { if (!sid) return; fetch(`${import.meta.env.VITE_API_URL}/api/admin/fees/${sid}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setFees(Array.isArray(d) ? d : [])); };
  const fetchAnnouncements = () => fetch(`${import.meta.env.VITE_API_URL}/api/admin/announcements`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setAnnouncements(Array.isArray(d) ? d : []));
  const fetchTimetable = () => fetch(`${import.meta.env.VITE_API_URL}/api/admin/timetable`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setTimetable(Array.isArray(d) ? d : []));
  const fetchMaterials = () => fetch(`${import.meta.env.VITE_API_URL}/api/admin/materials`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setMaterials(Array.isArray(d) ? d : []));
  const fetchResults = () => fetch(`${import.meta.env.VITE_API_URL}/api/admin/results`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setResults(Array.isArray(d) ? d : []));

  useEffect(() => {
    fetchStudents(); fetchAnnouncements(); fetchTimetable(); fetchMaterials(); fetchResults();
    const channel = supabase.channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => { fetchStudents(); showFlash('Students updated!'); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => { fetchAttendance(selectedStudent, selectedMonth); showFlash('Attendance updated!'); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fees' }, () => { fetchFees(selectedFeeStudent); showFlash('Fees updated!'); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => { fetchAnnouncements(); showFlash('Announcements updated!'); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timetable' }, () => { fetchTimetable(); showFlash('Timetable updated!'); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'materials' }, () => { fetchMaterials(); showFlash('Materials updated!'); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'results' }, () => { fetchResults(); showFlash('Results updated!'); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => { if (selectedStudent) fetchAttendance(selectedStudent, selectedMonth); }, [selectedStudent, selectedMonth]);
  useEffect(() => { if (selectedFeeStudent) fetchFees(selectedFeeStudent); }, [selectedFeeStudent]);

  const addStudent = async () => { const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/students`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(newStudent) }); if (res.ok) { setNewStudent({ id: '', name: '', batch: '', phone: '', password: '' }); fetchStudents(); showFlash('Student added!'); } };
  const deleteStudent = async (id: string) => { await fetch(`${import.meta.env.VITE_API_URL}/api/admin/students/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); fetchStudents(); showFlash('Student deleted!'); };
  const toggleAttendance = async (record: any) => { await fetch(`${import.meta.env.VITE_API_URL}/api/admin/attendance/${record.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ present: !record.present }) }); fetchAttendance(selectedStudent, selectedMonth); showFlash('Attendance updated!'); };
  const addAttendance = async () => { await fetch(`${import.meta.env.VITE_API_URL}/api/admin/attendance`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(newAttendance) }); fetchAttendance(selectedStudent, selectedMonth); showFlash('Attendance marked!'); };
  const toggleFeePaid = async (fee: any) => { await fetch(`${import.meta.env.VITE_API_URL}/api/admin/fees/${fee.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ paid: !fee.paid }) }); fetchFees(selectedFeeStudent); showFlash('Fee updated!'); };
  const deleteFee = async (id: string) => { await fetch(`${import.meta.env.VITE_API_URL}/api/admin/fees/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); fetchFees(selectedFeeStudent); showFlash('Fee deleted!'); };
  const addFee = async () => { await fetch(`${import.meta.env.VITE_API_URL}/api/admin/fees`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(newFee) }); setNewFee({ student_id: '', amount: '', due_date: '' }); showFlash('Fee added!'); };
  const addAnnouncement = async () => { await fetch(`${import.meta.env.VITE_API_URL}/api/admin/announcements`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(newAnnouncement) }); setNewAnnouncement({ title: '', message: '' }); fetchAnnouncements(); showFlash('Announcement posted!'); };
  const deleteAnnouncement = async (id: string) => { await fetch(`${import.meta.env.VITE_API_URL}/api/admin/announcements/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); fetchAnnouncements(); showFlash('Announcement deleted!'); };
  const addMaterial = async () => { await fetch(`${import.meta.env.VITE_API_URL}/api/admin/materials`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(newMaterial) }); setNewMaterial({ title: '', subject: '', file_url: '' }); fetchMaterials(); showFlash('Material added!'); };
  const deleteMaterial = async (id: string) => { await fetch(`${import.meta.env.VITE_API_URL}/api/admin/materials/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); fetchMaterials(); showFlash('Material deleted!'); };
  const addResult = async () => { await fetch(`${import.meta.env.VITE_API_URL}/api/admin/results`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(newResult) }); setNewResult({ student_id: '', subject: '', marks: '', total_marks: '', exam_date: '' }); fetchResults(); showFlash('Result added!'); };
  const deleteResult = async (id: string) => { await fetch(`${import.meta.env.VITE_API_URL}/api/admin/results/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); fetchResults(); showFlash('Result deleted!'); };
  const addTimetable = async () => { await fetch(`${import.meta.env.VITE_API_URL}/api/admin/timetable`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(newTimetable) }); setNewTimetable({ day: '', subject: '', time: '', teacher: '' }); fetchTimetable(); showFlash('Timetable added!'); };
  const deleteTimetable = async (id: string) => { await fetch(`${import.meta.env.VITE_API_URL}/api/admin/timetable/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); fetchTimetable(); showFlash('Timetable deleted!'); };

  const presentCount = attendance.filter(a => a.present).length;
  const absentCount = attendance.filter(a => !a.present).length;
  const attendancePct = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0;
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'students', label: 'Students', icon: <Users size={18} /> },
    { id: 'attendance', label: 'Attendance', icon: <Calendar size={18} /> },
    { id: 'fees', label: 'Fees', icon: <BarChart3 size={18} /> },
    { id: 'results', label: 'Results', icon: <BarChart3 size={18} /> },
    { id: 'materials', label: 'Materials', icon: <BookOpen size={18} /> },
    { id: 'timetable', label: 'Timetable', icon: <Calendar size={18} /> },
    { id: 'announcements', label: 'Announcements', icon: <Bell size={18} /> },
  ];

  const input = { width: '100%', padding: '10px 14px', borderRadius: 12, border: `1.5px solid ${theme.primaryBorder}`, background: theme.bg, fontSize: 13, outline: 'none', color: theme.text, boxSizing: 'border-box' as const };
  const card = { background: theme.cardBg, borderRadius: 20, border: `1px solid ${theme.primaryBorder}`, padding: 20, marginBottom: 16, boxShadow: '0 2px 12px rgba(212,101,26,0.08)' };
  const btn = { background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`, color: 'white', border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(212,101,26,0.3)' };

  return (
    <div style={{ minHeight: '100vh', background: theme.bg }}>
      {flash && <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 50, background: theme.primary, color: 'white', padding: '12px 20px', borderRadius: 16, fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(212,101,26,0.4)' }}>⚡ {flash}</div>}

      {/* Mobile overlay */}
      {sidebarOpen && <div className="md:hidden" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 240, background: 'white', borderRight: `1px solid ${theme.primaryBorder}`, display: 'flex', flexDirection: 'column', padding: 20, gap: 24, zIndex: 50, transform: sidebarOpen ? 'translateX(0)' : undefined, transition: 'transform 0.3s' }}
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.png" alt="logo" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <p style={{ fontWeight: 800, fontSize: 14, color: theme.primary }}>Divine Path</p>
              <p style={{ fontSize: 10, color: theme.textMuted }}>Admin Panel</p>
            </div>
          </div>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textMuted }}>
            <X size={18} />
          </button>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          {navItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s', background: activeTab === item.id ? theme.primaryLight : 'transparent', color: activeTab === item.id ? theme.primary : theme.textMuted, borderLeft: activeTab === item.id ? `3px solid ${theme.primary}` : '3px solid transparent' }}>
              {item.icon}{item.label}
            </button>
          ))}
        </nav>

        <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, border: `1px solid #ffcccc`, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: '#fff5f5', color: '#CC3333' }}>
          <LogOut size={18} />Logout
        </button>
      </div>

      {/* Mobile Top Bar */}
      <div className="md:hidden" style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'white', borderBottom: `1px solid ${theme.primaryBorder}`, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 40 }}>
        <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textMuted }}>
          <Menu size={22} />
        </button>
        <span style={{ fontWeight: 700, fontSize: 16, color: theme.primary }}>Admin Panel</span>
        <div style={{ width: 22 }} />
      </div>

      {/* Main */}
      <div className="md:ml-60" style={{ paddingTop: 64, paddingBottom: 20 }}>
        <div style={{ padding: 16 }}>
          <header style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: theme.text }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <p style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>Divine Path Admin • Live updates ⚡</p>
          </header>

          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <ACard label="Students" value={students.length} color={theme.primary} />
              <ACard label="Materials" value={materials.length} color="#7c3aed" />
              <ACard label="Announcements" value={announcements.length} color="#1a5fa0" />
              <ACard label="Status" value="Online" color="#1a7a1a" />
            </div>
          )}

          {activeTab === 'students' && (
            <div>
              <div style={card}>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: theme.text, marginBottom: 12 }}>Add New Student</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {(['id', 'name', 'batch', 'phone', 'password'] as const).map((field) => (
                    <input key={field} placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                      value={newStudent[field]} onChange={(e) => setNewStudent({ ...newStudent, [field]: e.target.value })}
                      type={field === 'password' ? 'password' : 'text'} style={input} />
                  ))}
                </div>
                <button onClick={addStudent} style={{ ...btn, marginTop: 12 }}>Add Student</button>
              </div>
              <div style={card}>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: theme.text, marginBottom: 12 }}>All Students ({students.length})</h3>
                {students.length === 0 && <p style={{ color: theme.textMuted, fontSize: 13 }}>No students yet.</p>}
                {students.map((s: any) => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: theme.primaryLight, borderRadius: 12, marginBottom: 8 }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>{s.name}</p>
                      <p style={{ fontSize: 11, color: theme.textMuted }}>ID: {s.id} • {s.batch} • {s.phone}</p>
                    </div>
                    <button onClick={() => deleteStudent(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CC3333' }}><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div>
              <div style={card}>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: theme.text, marginBottom: 12 }}>View Monthly Attendance</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <StudentSelect students={students} value={selectedStudent} onChange={setSelectedStudent} />
                  <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={input} />
                </div>
                {selectedStudent && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                      <MiniStat label="Attendance" value={`${attendancePct}%`} color="#1a7a1a" bg="#f0fff0" />
                      <MiniStat label="Present" value={presentCount} color="#1a5fa0" bg="#f0f8ff" />
                      <MiniStat label="Absent" value={absentCount} color="#CC3333" bg="#fff0f0" />
                    </div>
                    {attendance.length === 0 && <p style={{ color: theme.textMuted, fontSize: 13 }}>No records for this month.</p>}
                    {attendance.map((a: any) => (
                      <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: theme.primaryLight, borderRadius: 12, marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: theme.text }}>{a.date}</span>
                        <button onClick={() => toggleAttendance(a)}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: a.present ? '#d4edda' : '#f8d7da', color: a.present ? '#1a7a1a' : '#CC3333' }}>
                          {a.present ? <><CheckCircle size={14} />Present</> : <><XCircle size={14} />Absent</>}
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
              <div style={card}>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: theme.text, marginBottom: 12 }}>Add Attendance Record</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <StudentSelect students={students} value={newAttendance.student_id} onChange={(v: string) => setNewAttendance({ ...newAttendance, student_id: v })} />
                  <input type="date" value={newAttendance.date} onChange={(e) => setNewAttendance({ ...newAttendance, date: e.target.value })} style={input} />
                  <select value={newAttendance.present.toString()} onChange={(e) => setNewAttendance({ ...newAttendance, present: e.target.value === 'true' })} style={input}>
                    <option value="true">Present</option>
                    <option value="false">Absent</option>
                  </select>
                </div>
                <button onClick={addAttendance} style={{ ...btn, marginTop: 12 }}>Mark Attendance</button>
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div>
              <div style={card}>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: theme.text, marginBottom: 12 }}>View Student Fees</h3>
                <div style={{ marginBottom: 12 }}><StudentSelect students={students} value={selectedFeeStudent} onChange={setSelectedFeeStudent} /></div>
                {selectedFeeStudent && (
                  <>
                    {fees.length === 0 && <p style={{ color: theme.textMuted, fontSize: 13 }}>No fee records.</p>}
                    {fees.map((f: any) => (
                      <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: theme.primaryLight, borderRadius: 12, marginBottom: 8 }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>Rs.{f.amount}</p>
                          <p style={{ fontSize: 11, color: theme.textMuted }}>Due: {f.due_date}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button onClick={() => toggleFeePaid(f)} style={{ padding: '4px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: f.paid ? '#d4edda' : '#f8d7da', color: f.paid ? '#1a7a1a' : '#CC3333' }}>
                            {f.paid ? 'Paid ✅' : 'Due ❌'}
                          </button>
                          <button onClick={() => deleteFee(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CC3333' }}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
              <div style={card}>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: theme.text, marginBottom: 12 }}>Add Fee</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <StudentSelect students={students} value={newFee.student_id} onChange={(v: string) => setNewFee({ ...newFee, student_id: v })} />
                  <input placeholder="Amount" value={newFee.amount} onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })} style={input} />
                  <input type="date" value={newFee.due_date} onChange={(e) => setNewFee({ ...newFee, due_date: e.target.value })} style={input} />
                </div>
                <button onClick={addFee} style={{ ...btn, marginTop: 12 }}>Add Fee</button>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div>
              <div style={card}>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: theme.text, marginBottom: 12 }}>Add Result</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <StudentSelect students={students} value={newResult.student_id} onChange={(v: string) => setNewResult({ ...newResult, student_id: v })} />
                  {(['subject', 'marks', 'total_marks'] as const).map((field) => (
                    <input key={field} placeholder={field.replace('_', ' ').toUpperCase()} value={newResult[field]} onChange={(e) => setNewResult({ ...newResult, [field]: e.target.value })} style={input} />
                  ))}
                  <input type="date" value={newResult.exam_date} onChange={(e) => setNewResult({ ...newResult, exam_date: e.target.value })} style={input} />
                </div>
                <button onClick={addResult} style={{ ...btn, marginTop: 12 }}>Add Result</button>
              </div>
              <div style={card}>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: theme.text, marginBottom: 12 }}>All Results ({results.length})</h3>
                {results.length === 0 && <p style={{ color: theme.textMuted, fontSize: 13 }}>No results yet.</p>}
                {results.map((r: any) => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: theme.primaryLight, borderRadius: 12, marginBottom: 8 }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>{r.students?.name} — {r.subject}</p>
                      <p style={{ fontSize: 11, color: theme.textMuted }}>{r.exam_date}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: theme.primary }}>{r.marks}/{r.total_marks}</span>
                      <button onClick={() => deleteResult(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CC3333' }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div>
              <div style={card}>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: theme.text, marginBottom: 12 }}>Add Study Material</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input placeholder="Title" value={newMaterial.title} onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })} style={input} />
                  <input placeholder="Subject" value={newMaterial.subject} onChange={(e) => setNewMaterial({ ...newMaterial, subject: e.target.value })} style={input} />
                  <input placeholder="PDF URL or Google Drive link" value={newMaterial.file_url} onChange={(e) => setNewMaterial({ ...newMaterial, file_url: e.target.value })} style={{ ...input, gridColumn: '1 / -1' }} />
                </div>
                <button onClick={addMaterial} style={{ ...btn, marginTop: 12 }}>Add Material</button>
                <p style={{ fontSize: 11, color: theme.textMuted, marginTop: 8 }}>Tip: Upload to Google Drive → Share → Copy link → Paste here</p>
              </div>
              <div style={card}>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: theme.text, marginBottom: 12 }}>All Materials ({materials.length})</h3>
                {materials.length === 0 && <p style={{ color: theme.textMuted, fontSize: 13 }}>No materials yet.</p>}
                {materials.map((m: any) => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: theme.primaryLight, borderRadius: 12, marginBottom: 8 }}>
                    <div style={{ flex: 1, marginRight: 12 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>{m.title}</p>
                      <p style={{ fontSize: 11, color: theme.textMuted }}>{m.subject}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <a href={m.file_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 8, background: theme.primaryLight, color: theme.primary, textDecoration: 'none', border: `1px solid ${theme.primaryBorder}` }}>View</a>
                      <button onClick={() => deleteMaterial(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CC3333' }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'timetable' && (
            <div>
              <div style={card}>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: theme.text, marginBottom: 12 }}>Add Timetable Entry</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <select value={newTimetable.day} onChange={(e) => setNewTimetable({ ...newTimetable, day: e.target.value })} style={input}>
                    <option value="">Select Day</option>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input placeholder="Subject" value={newTimetable.subject} onChange={(e) => setNewTimetable({ ...newTimetable, subject: e.target.value })} style={input} />
                  <input placeholder="Time (e.g. 9:00 AM - 10:30 AM)" value={newTimetable.time} onChange={(e) => setNewTimetable({ ...newTimetable, time: e.target.value })} style={input} />
                  <input placeholder="Teacher" value={newTimetable.teacher} onChange={(e) => setNewTimetable({ ...newTimetable, teacher: e.target.value })} style={input} />
                </div>
                <button onClick={addTimetable} style={{ ...btn, marginTop: 12 }}>Add Entry</button>
              </div>
              <div style={card}>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: theme.text, marginBottom: 12 }}>Current Timetable ({timetable.length})</h3>
                {timetable.length === 0 && <p style={{ color: theme.textMuted, fontSize: 13 }}>No timetable entries yet.</p>}
                {timetable.map((t: any) => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: theme.primaryLight, borderRadius: 12, marginBottom: 8 }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>{t.day} — {t.subject}</p>
                      <p style={{ fontSize: 11, color: theme.textMuted }}>{t.teacher} • {t.time}</p>
                    </div>
                    <button onClick={() => deleteTimetable(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CC3333' }}><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'announcements' && (
            <div>
              <div style={card}>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: theme.text, marginBottom: 12 }}>Post Announcement</h3>
                <input placeholder="Title" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} style={{ ...input, marginBottom: 10 }} />
                <textarea placeholder="Message" value={newAnnouncement.message} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })} rows={4}
                  style={{ ...input, resize: 'vertical' }} />
                <button onClick={addAnnouncement} style={{ ...btn, marginTop: 12 }}>Post Announcement</button>
              </div>
              <div style={card}>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: theme.text, marginBottom: 12 }}>All Announcements ({announcements.length})</h3>
                {announcements.length === 0 && <p style={{ color: theme.textMuted, fontSize: 13 }}>No announcements yet.</p>}
                {announcements.map((a: any) => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 14px', background: theme.primaryLight, borderRadius: 12, marginBottom: 8, borderLeft: `3px solid ${theme.primary}` }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>{a.title}</p>
                      <p style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>{a.message}</p>
                      <p style={{ fontSize: 11, color: theme.primaryDark, marginTop: 6 }}>{new Date(a.created_at).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => deleteAnnouncement(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CC3333', marginLeft: 12 }}><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ACard({ label, value, color }: any) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 16, border: '1px solid #FFD9B0', boxShadow: '0 2px 8px rgba(212,101,26,0.08)' }}>
      <p style={{ fontSize: 11, color: '#8B4513', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</p>
      <h4 style={{ fontSize: 24, fontWeight: 800, color, marginTop: 4 }}>{value}</h4>
    </div>
  );
}

function MiniStat({ label, value, color, bg }: any) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: 12, textAlign: 'center' }}>
      <p style={{ fontSize: 20, fontWeight: 800, color }}>{value}</p>
      <p style={{ fontSize: 11, color: '#8B4513', marginTop: 2 }}>{label}</p>
    </div>
  );
}