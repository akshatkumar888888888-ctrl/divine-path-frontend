const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mcitvidfhwwetcqjmgsb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jaXR2aWRmaHd3ZXRjcWptZ3NiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjY2OTAyNiwiZXhwIjoyMDkyMjQ1MDI2fQ.mZbJpaJ65m0I1q_fY6pgylldZ-bhKsQCCvwssRa6MOY';
const JWT_SECRET = 'secureid_super_secret_key_2026';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid ID or password' });
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  }
  return res.status(404).json({ error: 'Not found' });
}