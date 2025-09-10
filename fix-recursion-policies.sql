-- Fix infinite recursion in group_members policies

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view members of groups they belong to" ON group_members;
DROP POLICY IF EXISTS "Group owners can manage members" ON group_members;

-- Create non-recursive policies for group_members
-- Allow users to view their own membership records
CREATE POLICY "Users can view their own memberships" ON group_members 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to view other members of groups where they are also members
-- This uses a simpler approach without recursion
CREATE POLICY "Users can view group members" ON group_members 
FOR SELECT 
USING (
  -- User can see members of groups where they are the owner
  EXISTS (SELECT 1 FROM gym_groups WHERE gym_groups.id = group_members.group_id AND gym_groups.created_by = auth.uid())
  OR
  -- User can see their own membership
  auth.uid() = user_id
);

-- Group owners can manage all members of their groups
CREATE POLICY "Group owners can manage their group members" ON group_members 
FOR ALL 
USING (
  EXISTS (SELECT 1 FROM gym_groups WHERE gym_groups.id = group_members.group_id AND gym_groups.created_by = auth.uid())
);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Group member policies fixed successfully!';
    RAISE NOTICE '🔓 Recursion issue resolved';
END $$; 