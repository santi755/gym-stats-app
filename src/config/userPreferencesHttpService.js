import { supabase, TABLES } from './httpConfig.js'

const TABLE = TABLES.USER_PREFERENCES

export async function createUserPreferences(currentGroupId = null, selectedGymUserId = null, user) {
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from(TABLE)
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

  export async function updateUserPreferences(updates, user) {
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq('auth_user_id', user.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // User Preferences functions
export async function getUserPreferences(user) {
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('auth_user_id', user.id)
      .single()
    
    if (error && error.code === 'PGRST116') {
      // No preferences found, create default ones
      return await createUserPreferences(user)
    }
    
    if (error) throw error
    return data
  }