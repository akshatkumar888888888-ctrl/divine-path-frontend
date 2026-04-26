const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mcitvidfhwwetcqjmgsb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jaXR2aWRmaHd3ZXRjcWptZ3NiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjY2OTAyNiwiZXhwIjoyMDkyMjQ1MDI2fQ.mZbJpaJ65m0I1q_fY6pgylldZ-bhKsQCCvwssRa6MOY';
const JWT_SECRET = 'secureid_super_secret_key_2026';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function verify(authHeader) {
  if (!authHeader) throw new Error('No token');
  return jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = req.url.replace('/api', '');

  if (req.method === 'POST' && url === '/login') {
    const { id, password, role } = req.body;
    const { data: user, error } = await supabase.from('users').select('*').eq('id', id).eq('role', role).single();
    if (error || !user) return res.status(401).json({ error: 'Invalid ID or password' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid ID or password' });
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  }

  let u;
  try { u = verify(req.headers.authorization); }
  catch { return res.status(401).json({ error: 'Invalid token' }); }

  if (req.method === 'GET' && url.startsWith('/student/')) {
    const sid = url.split('/')[2];
    const [p, a, f, r, m, t, an] = await Promise.all([
      supabase.from('students').select('*').eq('id', sid).single(),
      supabase.from('attendance').select('*').eq('student_id', sid),
      supabase.from('fees').select('*').eq('student_id', sid),
      supabase.from('results').select('*').eq('student_id', sid),
      supabase.from('materials').select('*'),
      supabase.from('timetable').select('*'),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }),
    ]);
    return res.json({ profile: p.data, attendance: a.data, fees: f.data, results: r.data, materials: m.data, timetable: t.data, announcements: an.data });
  }

  if (u.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'GET' && url === '/admin/students') {
    const { data } = await supabase.from('students').select('*');
    return res.json(data);
  }
  if (req.method === 'POST' && url === '/admin/students') {
    const { id, name, batch, phone, password } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    await supabase.from('users').insert({ id, name, password_hash, role: 'user' });
    await supabase.from('students').insert({ id, name, batch, phone });
    return res.json({ success: true });
  }
  if (req.method === 'DELETE' && url.startsWith('/admin/students/')) {
    const id = url.split('/')[3];
    await supabase.from('students').delete().eq('id', id);
    await supabase.from('users').delete().eq('id', id);
    return res.json({ success: true });
  }
  if (req.method === 'GET' && url.startsWith('/admin/attendance/')) {
    const parts = url.split('/');
    const sid = parts[3];
    const month = parts[4];
    const nextMonth = String(parseInt(month.split('-')[1]) + 1).padStart(2, '0');
    const { data } = await supabase.from('attendance').select('*').eq('student_id', sid).gte('date', month + '-01').lt('date', month.split('-')[0] + '-' + nextMonth + '-01').order('date', { ascending: true });
    return res.json(data);
  }
  if (req.method === 'POST' && url === '/admin/attendance') {
    const { student_id, date, present } = req.body;
    await supabase.from('attendance').insert({ student_id, date, present });
    return res.json({ success: true });
  }
  if (req.method === 'PATCH' && url.startsWith('/admin/attendance/')) {
    const id = url.split('/')[3];
    await supabase.from('attendance').update({ present: req.body.present }).eq('id', id);
    return res.json({ success: true });
  }
  if (req.method === 'GET' && url.startsWith('/admin/fees/')) {
    const sid = url.split('/')[3];
    const { data } = await supabase.from('fees').select('*').eq('student_id', sid).order('due_date', { ascending: true });
    return res.json(data);
  }
  if (req.method === 'POST' && url === '/admin/fees') {
    const { student_id, amount, due_date } = req.body;
    await supabase.from('fees').insert({ student_id, amount, due_date });
    return res.json({ success: true });
  }
  if (req.method === 'PATCH' && url.startsWith('/admin/fees/')) {
    const id = url.split('/')[3];
    const { paid } = req.body;
    const paid_date = paid ? new Date().toISOString().slice(0, 10) : null;
    await supabase.from('fees').update({ paid, paid_date }).eq('id', id);
    return res.json({ success: true });
  }
  if (req.method === 'DELETE' && url.startsWith('/admin/fees/')) {
    const id = url.split('/')[3];
    await supabase.from('fees').delete().eq('id', id);
    return res.json({ success: true });
  }
  if (req.method === 'GET' && url === '/admin/results') {
    const { data } = await supabase.from('results').select('*, students(name)').order('exam_date', { ascending: false });
    return res.json(data);
  }
  if (req.method === 'POST' && url === '/admin/results') {
    const { student_id, subject, marks, total_marks, exam_date } = req.body;
    await supabase.from('results').insert({ student_id, subject, marks, total_marks, exam_date });
    return res.json({ success: true });
  }
  if (req.method === 'DELETE' && url.startsWith('/admin/results/')) {
    const id = url.split('/')[3];
    await supabase.from('results').delete().eq('id', id);
    return res.json({ success: true });
  }
  if (req.method === 'GET' && url === '/admin/materials') {
    const { data } = await supabase.from('materials').select('*').order('uploaded_at', { ascending: false });
    return res.json(data);
  }
  if (req.method === 'POST' && url === '/admin/materials') {
    const { title, subject, file_url } = req.body;
    await supabase.from('materials').insert({ title, subject, file_url });
    return res.json({ success: true });
  }
  if (req.method === 'DELETE' && url.startsWith('/admin/materials/')) {
    const id = url.split('/')[3];
    await supabase.from('materials').delete().eq('id', id);
    return res.json({ success: true });
  }
  if (req.method === 'GET' && url === '/admin/timetable') {
    const { data } = await supabase.from('timetable').select('*').order('day');
    return res.json(data);
  }
  if (req.method === 'POST' && url === '/admin/timetable') {
    const { day, subject, time, teacher } = req.body;
    await supabase.from('timetable').insert({ day, subject, time, teacher });
    return res.json({ success: true });
  }
  if (req.method === 'DELETE' && url.startsWith('/admin/timetable/')) {
    const id = url.split('/')[3];
    await supabase.from('timetable').delete().eq('id', id);
    return res.json({ success: true });
  }
  if (req.method === 'GET' && url === '/admin/announcements') {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    return res.json(data);
  }
  if (req.method === 'POST' && url === '/admin/announcements') {
    const { title, message } = req.body;
    await supabase.from('announcements').insert({ title, message });
    return res.json({ success: true });
  }
  if (req.method === 'DELETE' && url.startsWith('/admin/announcements/')) {
    const id = url.split('/')[3];
    await supabase.from('announcements').delete().eq('id', id);
    return res.json({ success: true });
  }

  return res.status(404).json({ error: 'Not found' });
}