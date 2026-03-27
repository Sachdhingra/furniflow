// Supabase client configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://db.asdxrxekepmwghkzyqvk.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzZHhyeGVrZXBtd2doa3p5cXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MTcyMDAsImV4cCI6MjA0ODM5MzIwMH0.BfLJLsLAm2rWjLdpLBSHQQV0a3b-0XK3L0jJk6L9b3s'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Table names
export const TABLES = {
  USERS: 'users',
  LEADS: 'leads',
  SERVICES: 'services',
  JOBS: 'jobs',
  CLAIMS: 'claims',
  TRIPS: 'trips',
  SITE_VISITS: 'siteVisits'
}

// Auth helpers
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export function getCurrentUser() {
  return supabase.auth.getUser()
}

// Generic CRUD helpers
export async function getAll(table, orderBy = 'createdAt', ascending = false) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order(orderBy, { ascending })
  if (error) throw error
  return data
}

export async function getById(table, id) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function insert(table, row) {
  const { data, error } = await supabase
    .from(table)
    .insert(row)
    .select()
  if (error) throw error
  return data[0]
}

export async function update(table, id, updates) {
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq('id', id)
    .select()
  if (error) throw error
  return data[0]
}

export async function remove(table, id) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
  if (error) throw error
}

// Custom queries
export async function getLeadsByUser(userId) {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('createdBy', userId)
    .order('leadDate', { ascending: false })
  if (error) throw error
  return data
}

export async function getJobsByUser(userId) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('assignedTo', userId)
    .order('scheduledDate', { ascending: false })
  if (error) throw error
  return data
}

export async function getTodayVisits() {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('siteVisits')
    .select('*')
    .eq('visitDate', today)
  if (error) throw error
  return data
}

export async function getDashboardStats() {
  const today = new Date().toISOString().split('T')[0]
  
  const [leads, services, jobs, visits] = await Promise.all([
    supabase.from('leads').select('id, leadValue'),
    supabase.from('services').select('id, serviceValue').eq('serviceType', 'Paid'),
    supabase.from('jobs').select('id'),
    supabase.from('siteVisits').select('id').eq('visitDate', today)
  ])
  
  return {
    totalLeads: leads.data?.length || 0,
    pipelineValue: leads.data?.reduce((sum, l) => sum + (l.leadValue || 0), 0) || 0,
    totalServices: services.data?.length || 0,
    serviceRevenue: services.data?.reduce((sum, s) => sum + (s.serviceValue || 0), 0) || 0,
    totalJobs: jobs.data?.length || 0,
    todayVisits: visits.data?.length || 0
  }
}