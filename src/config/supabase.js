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
  USERS: 'gym_users', // Deprecated - for backward compatibility
  ENTRIES: 'gym_entries',
  GROUPS: 'gym_groups',
  GROUP_MEMBERS: 'group_members',
  GROUP_INVITATIONS: 'group_invitations',
  USER_PREFERENCES: 'user_preferences'
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

// User Preferences functions
export async function getUserPreferences() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  
  const { data, error } = await supabase
    .from(TABLES.USER_PREFERENCES)
    .select('*')
    .eq('auth_user_id', user.id)
    .single()
  
  if (error && error.code === 'PGRST116') {
    // No preferences found, create default ones
    return await createUserPreferences()
  }
  
  if (error) throw error
  return data
}

export async function createUserPreferences(currentGroupId = null, selectedGymUserId = null) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  
  const { data, error } = await supabase
    .from(TABLES.USER_PREFERENCES)
    .insert({
      auth_user_id: user.id,
      current_group_id: currentGroupId,
      selected_gym_user_id: selectedGymUserId
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateUserPreferences(updates) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  
  const { data, error } = await supabase
    .from(TABLES.USER_PREFERENCES)
    .update(updates)
    .eq('auth_user_id', user.id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Group functions
export async function createGroup(name, description = '') {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  
  const { data, error } = await supabase
    .from(TABLES.GROUPS)
    .insert([{ name, description, created_by: user.id }])
    .select()
    .single()
  
  if (error) throw error
  
  // Automatically add creator as owner member
  await joinGroup(data.id, user.email?.split('@')[0] || 'Owner', '#3b82f6', 'owner')
  
  // Set this as the current group in preferences
  await updateUserPreferences({ current_group_id: data.id })
  
  return data
}

export async function getUserGroups() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  
  // Get groups where user is either creator or member
  const { data, error } = await supabase
    .from(TABLES.GROUPS)
    .select(`
      *,
      group_members!inner(role)
    `)
    .eq('group_members.user_id', user.id)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Group membership functions
export async function joinGroup(groupId, displayName, color = '#3b82f6', role = 'member') {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  
  const { data, error } = await supabase
    .from(TABLES.GROUP_MEMBERS)
    .insert({
      group_id: groupId,
      user_id: user.id,
      display_name: displayName,
      color,
      role
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function joinGroupByInviteCode(inviteCode, displayName, color = '#3b82f6') {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  
  // Find group by invite code
  const { data: group, error: groupError } = await supabase
    .from(TABLES.GROUPS)
    .select('id, name')
    .eq('invite_code', inviteCode.toUpperCase())
    .single()
  
  if (groupError) throw new Error('Código de invitación inválido')
  
  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from(TABLES.GROUP_MEMBERS)
    .select('id')
    .eq('group_id', group.id)
    .eq('user_id', user.id)
    .single()
  
  if (existingMember) {
    throw new Error('Ya eres miembro de este grupo')
  }
  
  // Join the group
  const member = await joinGroup(group.id, displayName, color, 'member')
  
  // Set as current group
  await updateUserPreferences({ current_group_id: group.id })
  
  return { group, member }
}

export async function getGroupMembers(groupId) {
  const { data, error } = await supabase
    .from(TABLES.GROUP_MEMBERS)
    .select('*')
    .eq('group_id', groupId)
    .order('joined_at', { ascending: true })
  
  if (error) throw error
  return data
}

export async function updateGroupMember(memberId, updates) {
  const { data, error } = await supabase
    .from(TABLES.GROUP_MEMBERS)
    .update(updates)
    .eq('id', memberId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function leaveGroup(groupId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  
  const { error } = await supabase
    .from(TABLES.GROUP_MEMBERS)
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', user.id)
  
  if (error) throw error
  
  // Clear current group if leaving current group
  const preferences = await getUserPreferences()
  if (preferences.current_group_id === groupId) {
    await updateUserPreferences({ current_group_id: null })
  }
  
  return true
}

// Group invitation functions
export async function createGroupInvitation(groupId, email = null) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  
  // Get group invite code
  const { data: group } = await supabase
    .from(TABLES.GROUPS)
    .select('invite_code')
    .eq('id', groupId)
    .single()
  
  const { data, error } = await supabase
    .from(TABLES.GROUP_INVITATIONS)
    .insert({
      group_id: groupId,
      invited_by: user.id,
      email,
      invite_code: group.invite_code
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getGroupInvitations(groupId) {
  const { data, error } = await supabase
    .from(TABLES.GROUP_INVITATIONS)
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Entry functions (updated for new member system)
export async function createEntry(groupId, memberId, date, points = 0) {
  const { data, error } = await supabase
    .from(TABLES.ENTRIES)
    .upsert([{ group_id: groupId, member_id: memberId, date, points }])
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
      group_members(display_name, color, user_id)
    `)
    .eq('group_id', groupId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
  
  if (error) throw error
  return data
}

// Get current user's member record for a group
export async function getCurrentMember(groupId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  
  const { data, error } = await supabase
    .from(TABLES.GROUP_MEMBERS)
    .select('*')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single()
  
  if (error) throw error
  return data
}

// Legacy functions for backward compatibility
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
