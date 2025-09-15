import { supabase, TABLES } from './httpConfig.js'

const TABLE = TABLES.USERS

export async function getGroupUsers(groupId) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
  }
  



// Legacy functions for backward compatibility
export async function createUser(groupId, name, color = '#3b82f6') {
    const { data, error } = await supabase
      .from(TABLE)
      .insert([{ group_id: groupId, name, color }])
      .select()
      .single()
    
    if (error) throw error
    return data
  }