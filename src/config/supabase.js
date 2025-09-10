import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Validate configuration
if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
  console.warn('⚠️ Supabase URL not configured. Please set VITE_SUPABASE_URL in your .env file')
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
  console.warn('⚠️ Supabase Anon Key not configured. Please set VITE_SUPABASE_ANON_KEY in your .env file')
}

// Create Supabase client with better error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database schema constants
export const TABLES = {
  USERS: 'gym_users',
  ENTRIES: 'gym_entries',
  GROUPS: 'gym_groups'
}

// Check if Supabase is configured
export function isSupabaseConfigured() {
  return supabaseUrl !== 'https://your-project.supabase.co' && 
         supabaseAnonKey !== 'your-anon-key' &&
         supabaseUrl.startsWith('https://') &&
         supabaseAnonKey.length > 20
}

// Test Supabase connection
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('gym_groups').select('count').limit(1)
    if (error && error.code !== 'PGRST116') { // PGRST116 is "relation does not exist" which is expected if tables aren't created yet
      throw error
    }
    return { success: true, message: 'Supabase connection successful' }
  } catch (error) {
    console.error('Supabase connection test failed:', error)
    return { 
      success: false, 
      message: `Supabase connection failed: ${error.message}`,
      error 
    }
  }
}

// Get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  return user
}

// Sign up with email and password
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

// Sign in with email and password
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Listen to auth changes
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}

// Database utility functions
export async function createGroup(name, description = '') {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  
  const { data, error } = await supabase
    .from(TABLES.GROUPS)
    .insert([{ name, description, created_by: user.id }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getUserGroups() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  
  const { data, error } = await supabase
    .from(TABLES.GROUPS)
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function createUser(groupId, name, color = '#3b82f6') {
  const { data, error } = await supabase
    .from(TABLES.USERS)
    .insert([{ group_id: groupId, name, color }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getGroupUsers(groupId) {
  const { data, error } = await supabase
    .from(TABLES.USERS)
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data
}

export async function createEntry(groupId, userId, date, points = 0) {
  const { data, error } = await supabase
    .from(TABLES.ENTRIES)
    .upsert([{ group_id: groupId, user_id: userId, date, points }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getGroupEntries(groupId, startDate, endDate) {
  const { data, error } = await supabase
    .from(TABLES.ENTRIES)
    .select(`
      *,
      ${TABLES.USERS}(name, color)
    `)
    .eq('group_id', groupId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
  
  if (error) throw error
  return data
}
