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









