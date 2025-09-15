import { supabase } from './httpConfig.js'

export async function getCurrentUser() {
  console.log('getCurrentUser')
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      return null
    }
    return user
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

// Sign up with email and password
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

// Listen to auth changes
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}
