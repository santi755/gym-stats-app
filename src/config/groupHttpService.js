import { supabase, TABLES } from './httpConfig.js'

// Get current group
export async function getCurrentGroup(groupId) {
    if (!groupId) {
      return null
    }
    
    const { data, error } = await supabase.from(TABLES.GROUPS).select('*').eq('id', groupId).single()
    return data
  }

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
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError
    if (!user) throw new Error('User not authenticated')
  
    const { data, error } = await supabase
      .from(TABLES.GROUPS)
      .select(`
        *,
        ${TABLES.GROUP_MEMBERS}!inner(
          role,
          user_id
        )
      `)
      // Filtramos por la relación
      .eq(`${TABLES.GROUP_MEMBERS}.user_id`, user.id)
      .order('created_at', { ascending: false })
  
    if (error) throw error
  
    // group_members ya viene filtrado al usuario actual
    return (data ?? []).map(g => ({
      ...g,
      group_members: g.group_members?.map(m => ({ role: m.role })) ?? []
    }))
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
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError
    if (!user) throw new Error('User not authenticated')
  
    // Buscar grupo por invite_code y traer si el usuario ya es miembro
    const { data: group, error: groupError } = await supabase
      .from(TABLES.GROUPS)
      .select(`
        id,
        name,
        ${TABLES.GROUP_MEMBERS} (
          id,
          user_id
        )
      `)
      .eq('invite_code', inviteCode.toUpperCase())
      .eq(`${TABLES.GROUP_MEMBERS}.user_id`, user.id) // filtramos los miembros a SOLO el usuario
      .single()
  
    if (groupError) throw new Error('Código de invitación inválido')
  
    // Si ya aparece membership, significa que el usuario está dentro
    if (group.group_members?.length > 0) {
      throw new Error('Ya eres miembro de este grupo')
    }
  
    // Join the group
    const member = await joinGroup(group.id, displayName, color, 'member')
  
    // Set as current group
    await updateUserPreferences({ current_group_id: group.id })
  
    return { group, member }
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
  