-- Fix missing RLS policy for gym_entries
-- This allows users to view entries from groups they belong to

-- Drop existing policies that might be problematic
DROP POLICY IF EXISTS "Users can view entries in their groups" ON gym_entries;
DROP POLICY IF EXISTS "Users can create their own entries" ON gym_entries;
DROP POLICY IF EXISTS "Users can update their own entries" ON gym_entries;
DROP POLICY IF EXISTS "Users can delete their own entries" ON gym_entries;

-- Create simple, working policies for gym_entries
CREATE POLICY "gym_entries_select" ON gym_entries FOR SELECT USING (
  -- Users can see entries from groups where they are members
  EXISTS (SELECT 1 FROM group_members WHERE group_members.group_id = gym_entries.group_id AND group_members.user_id = auth.uid())
);

CREATE POLICY "gym_entries_insert" ON gym_entries FOR INSERT WITH CHECK (
  -- Users can create entries for their own member record in groups they belong to
  EXISTS (SELECT 1 FROM group_members WHERE group_members.id = gym_entries.member_id AND group_members.user_id = auth.uid())
);

CREATE POLICY "gym_entries_update" ON gym_entries FOR UPDATE USING (
  -- Users can update their own entries
  EXISTS (SELECT 1 FROM group_members WHERE group_members.id = gym_entries.member_id AND group_members.user_id = auth.uid())
);

CREATE POLICY "gym_entries_delete" ON gym_entries FOR DELETE USING (
  -- Users can delete their own entries
  EXISTS (SELECT 1 FROM group_members WHERE group_members.id = gym_entries.member_id AND group_members.user_id = auth.uid())
);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ gym_entries policies created successfully!';
    RAISE NOTICE '🔓 Users can now access gym entries from their groups';
    RAISE NOTICE '📊 Dashboard should work without 406 errors';
END $$; 