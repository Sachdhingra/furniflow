const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://db.asdxrxekepmwghkzyqvk.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzZHhyeGVrZXBtd2doa3p5cXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MTcyMDAsImV4cCI6MjA0ODM5MzIwMH0.BfLJLsLAm2rWjLdpLBSHQQV0a3b-0XK3L0jJk6L9b3s';
const supabase = createClient(supabaseUrl, supabaseKey);

const SECRET = process.env.JWT_SECRET || 'furniflow-secret-key-2024';

function generateId() { return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9); }

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try { req.user = jwt.verify(token, SECRET); next(); } 
  catch (e) { res.status(401).json({ error: 'Invalid token' }); }
};

// Auth
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).eq('active', true).single();
    if (error || !data || data.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: data.id, name: data.name, role: data.role }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: data.id, name: data.name, email: data.email, role: data.role, phone: data.phone } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Leads
app.get('/api/leads', authenticate, async (req, res) => {
  try { const { data } = await supabase.from('leads').select('*').order('leadDate', { ascending: false }); res.json(data || []); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/leads', authenticate, async (req, res) => {
  const { customerName, phone, address, productCategory, leadValue, status, nextFollowUp, remarks, isSiteLead } = req.body;
  const id = generateId();
  const leadDate = new Date().toISOString().split('T')[0];
  try {
    const { data, error } = await supabase.from('leads').insert([{ id, customerName, phone, address, productCategory, leadValue: leadValue || 0, leadDate, nextFollowUp, remarks, status: status || 'lead', createdBy: req.user.id, isSiteLead: isSiteLead || false, locked: true }]).select();
    if (error) throw error;
    res.json({ id: data[0].id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/leads/:id', authenticate, async (req, res) => {
  const { customerName, phone, address, productCategory, leadValue, status, nextFollowUp, remarks } = req.body;
  try { const { error } = await supabase.from('leads').update({ customerName, phone, address, productCategory, leadValue, status, nextFollowUp, remarks }).eq('id', req.params.id); if (error) throw error; res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/leads/:id', authenticate, async (req, res) => {
  try { const { error } = await supabase.from('leads').delete().eq('id', req.params.id); if (error) throw error; res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// Services
app.get('/api/services', authenticate, async (req, res) => {
  try { const { data } = await supabase.from('services').select('*').order('requestDate', { ascending: false }); res.json(data || []); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/services', authenticate, async (req, res) => {
  const { customerName, phone, address, serviceType, serviceValue, requestDate, attendDate, remarks } = req.body;
  const id = generateId();
  try { const { data, error } = await supabase.from('services').insert([{ id, customerName, phone, address, serviceType, serviceValue: serviceValue || 0, requestDate: requestDate || new Date().toISOString().split('T')[0], attendDate, remarks, status: 'pending', createdBy: req.user.id }]).select(); if (error) throw error; res.json({ id: data[0].id }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/services/:id', authenticate, async (req, res) => {
  const { status, attendDate } = req.body;
  try { const { error } = await supabase.from('services').update({ status, attendDate }).eq('id', req.params.id); if (error) throw error; res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/services/:id', authenticate, async (req, res) => {
  try { const { error } = await supabase.from('services').delete().eq('id', req.params.id); if (error) throw error; res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// Jobs
app.get('/api/jobs', authenticate, async (req, res) => {
  try { let query = supabase.from('jobs').select('*').order('scheduledDate', { ascending: false }); if (req.user.role === 'field_agent') query = query.eq('assignedTo', req.user.id); const { data } = await query; res.json(data || []); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/jobs', authenticate, async (req, res) => {
  const { leadId, customerName, phone, address, productCategory, jobType, paymentStatus, scheduledDate } = req.body;
  const id = generateId();
  const createdAt = new Date().toISOString().split('T')[0];
  try { const { data, error } = await supabase.from('jobs').insert([{ id, leadId, customerName, phone, address, productCategory, jobType, paymentStatus, status: 'created', createdAt, scheduledDate }]).select(); if (error) throw error; res.json({ id: data[0].id }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/jobs/:id', authenticate, async (req, res) => {
  const { status, assignedTo, scheduledDate, acceptedAt, travelStartAt, reachedAt, completedAt, images, remarks, incompleteReason } = req.body;
  try { const { error } = await supabase.from('jobs').update({ status, assignedTo, scheduledDate, acceptedAt, travelStartAt, reachedAt, completedAt, images, remarks, incompleteReason }).eq('id', req.params.id); if (error) throw error; res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/jobs/:id', authenticate, async (req, res) => {
  try { const { error } = await supabase.from('jobs').delete().eq('id', req.params.id); if (error) throw error; res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// Claims
app.get('/api/claims', authenticate, async (req, res) => {
  try { const { data } = await supabase.from('claims').select('*').order('bookingDate', { ascending: false }); res.json(data || []); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/claims', authenticate, async (req, res) => {
  const { serviceId, customerName, phone, bookingDate, partNumber, reason, dueDate } = req.body;
  const id = generateId();
  try { const { data, error } = await supabase.from('claims').insert([{ id, serviceId, customerName, phone, bookingDate, partNumber, reason, dueDate, status: 'pending', createdBy: req.user.id }]).select(); if (error) throw error; res.json({ id: data[0].id }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/claims/:id', authenticate, async (req, res) => {
  const { status } = req.body;
  try { const { error } = await supabase.from('claims').update({ status }).eq('id', req.params.id); if (error) throw error; res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/claims/:id', authenticate, async (req, res) => {
  try { const { error } = await supabase.from('claims').delete().eq('id', req.params.id); if (error) throw error; res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// Site Visits
app.get('/api/sitevisits', authenticate, async (req, res) => {
  try { const { data } = await supabase.from('siteVisits').select('*').order('visitDate', { ascending: false }); res.json(data || []); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/trips', authenticate, async (req, res) => {
  const id = generateId();
  const date = new Date().toISOString().split('T')[0];
  const startTime = new Date().toTimeString().slice(0, 5);
  try { const { data, error } = await supabase.from('trips').insert([{ id, userId: req.user.id, date, startTime, status: 'active' }]).select(); if (error) throw error; res.json({ id: data[0].id }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/trips/active', authenticate, async (req, res) => {
  try { const { data } = await supabase.from('trips').select('*').eq('userId', req.user.id).eq('status', 'active').single(); res.json(data); }
  catch (e) { res.json(null); }
});

app.put('/api/trips/:id', authenticate, async (req, res) => {
  const { status } = req.body;
  const endTime = status === 'completed' ? new Date().toTimeString().slice(0, 5) : null;
  try { const { error } = await supabase.from('trips').update({ status, endTime }).eq('id', req.params.id); if (error) throw error; res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/sitevisits', authenticate, async (req, res) => {
  const { tripId, customerName, phone, address, visitDate, visitTime, visitType, payment, photos, remarks, gpsLat, gpsLng } = req.body;
  const id = generateId();
  try { const { data, error } = await supabase.from('siteVisits').insert([{ id, tripId, customerName, phone, address, visitDate: visitDate || new Date().toISOString().split('T')[0], visitTime, visitType, payment: payment || 0, photos, remarks, gpsLat, gpsLng, createdBy: req.user.id, locked: false }]).select(); if (error) throw error; res.json({ id: data[0].id }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// Users
app.get('/api/users', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try { const { data } = await supabase.from('users').select('id, name, email, phone, role, active'); res.json(data || []); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/users', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { name, email, phone, role, password } = req.body;
  const id = generateId();
  try { const { data, error } = await supabase.from('users').insert([{ id, name, email, phone, password: password || 'changeme', role, active: true }]).select(); if (error) throw error; res.json({ id: data[0].id }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/users/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { name, email, phone, role, active, password } = req.body;
  try { const { error } = await supabase.from('users').update({ name, email, phone, role, active, ...(password && { password }) }).eq('id', req.params.id); if (error) throw error; res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/users/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try { const { error } = await supabase.from('users').delete().eq('id', req.params.id); if (error) throw error; res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// Dashboard
app.get('/api/dashboard', authenticate, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const [leads, services, jobs, siteVisits] = await Promise.all([
      supabase.from('leads').select('id, leadValue'),
      supabase.from('services').select('id, serviceValue').eq('serviceType', 'Paid'),
      supabase.from('jobs').select('id'),
      supabase.from('siteVisits').select('id').eq('visitDate', today)
    ]);
    res.json({ totalLeads: leads.data?.length || 0, pipelineValue: leads.data?.reduce((sum, l) => sum + (l.leadValue || 0), 0) || 0, totalServices: services.data?.length || 0, serviceRevenue: services.data?.reduce((sum, s) => sum + (s.serviceValue || 0), 0) || 0, totalJobs: jobs.data?.length || 0, todayVisits: siteVisits.data?.length || 0 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Clear all data
app.post('/api/clear-all', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    const tables = ['leads', 'services', 'jobs', 'claims', 'trips', 'siteVisits'];
    for (const table of tables) {
      const { data } = await supabase.from(table).select('id');
      if (data && data.length > 0) for (const row of data) await supabase.from(table).delete().eq('id', row.id);
    }
    res.json({ success: true, message: 'All data cleared' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Seed default users on first run
async function seedUsers() {
  const { data } = await supabase.from('users').select('id').limit(1);
  if (!data || data.length === 0) {
    const users = [
      { id: 'u1', name: 'John Admin', email: 'john@furniflow.com', phone: '+91 98765 43210', password: 'admin123', role: 'admin', active: true },
      { id: 'u2', name: 'Sarah Sales', email: 'sarah@furniflow.com', phone: '+91 98765 43211', password: 'admin123', role: 'sales', active: true },
      { id: 'u3', name: 'Mike Service', email: 'mike@furniflow.com', phone: '+91 98765 43212', password: 'admin123', role: 'service_head', active: true },
      { id: 'u4', name: 'Tom Agent', email: 'tom@furniflow.com', phone: '+91 98765 43213', password: 'admin123', role: 'field_agent', active: true },
      { id: 'u5', name: 'Emily Agent', email: 'emily@furniflow.com', phone: '+91 98765 43214', password: 'admin123', role: 'field_agent', active: true },
      { id: 'u6', name: 'Raj Site', email: 'raj@furniflow.com', phone: '+91 98765 43215', password: 'admin123', role: 'site_agent', active: true },
    ];
    await supabase.from('users').insert(users);
  }
}
seedUsers().then(() => console.log('Users seeded'));

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;