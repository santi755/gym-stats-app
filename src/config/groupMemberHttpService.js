import { supabase, TABLES } from './httpConfig.js'

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