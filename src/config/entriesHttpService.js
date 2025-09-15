import { supabase, TABLES } from './httpConfig.js'

const TABLE = TABLES.ENTRIES


// Entry functions (updated for new member system)
export async function createEntry(groupId, memberId, date, points = 0) {
    const { data, error } = await supabase
      .from(TABLE)
      .upsert([{ group_id: groupId, member_id: memberId, date, points }])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
  
  export async function getGroupEntries(groupId, startDate, endDate) {
    const { data, error } = await supabase
      .from(TABLE)
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