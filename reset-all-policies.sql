-- Reset all policies to fix infinite recursion
-- This will create simple, non-recursive policies

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view groups they belong to" ON gym_groups;
DROP POLICY IF EXISTS "Users can view groups they belong to or by invite code" ON gym_groups;
DROP POLICY IF EXISTS "Allow searching groups by invite code" ON gym_groups;
DROP POLICY IF EXISTS "Users can create their own groups" ON gym_groups;
DROP POLICY IF EXISTS "Group owners can update their groups" ON gym_groups;
DROP POLICY IF EXISTS "Group owners can delete their groups" ON gym_groups;

DROP POLICY IF EXISTS "Users can view members of groups they belong to" ON group_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON group_members;
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
DROP POLICY IF EXISTS "Group owners can manage their group members" ON group_members;
DROP POLICY IF EXISTS "Group owners can manage members" ON group_members;
DROP POLICY IF EXISTS "Users can join groups via invitations" ON group_members;
DROP POLICY IF EXISTS "Users can update their own membership" ON group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON group_members;

-- Create SIMPLE policies for gym_groups
CREATE POLICY "gym_groups_select" ON gym_groups FOR SELECT USING (
  -- Users can see groups they created
  auth.uid() = created_by
  OR
  -- Users can see groups by invite code (for joining)
  invite_code IS NOT NULL
);

CREATE POLICY "gym_groups_insert" ON gym_groups FOR INSERT WITH CHECK (
  auth.uid() = created_by
);

CREATE POLICY "gym_groups_update" ON gym_groups FOR UPDATE USING (
  auth.uid() = created_by
);

CREATE POLICY "gym_groups_delete" ON gym_groups FOR DELETE USING (
  auth.uid() = created_by
);

-- Create SIMPLE policies for group_members
CREATE POLICY "group_members_select" ON group_members FOR SELECT USING (
  -- Users can see their own memberships
  auth.uid() = user_id
);

CREATE POLICY "group_members_insert" ON group_members FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "group_members_update" ON group_members FOR UPDATE USING (
  auth.uid() = user_id
);

CREATE POLICY "group_members_delete" ON group_members FOR DELETE USING (
  auth.uid() = user_id
);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ All policies reset successfully!';
    RAISE NOTICE '🔓 Simple, non-recursive policies created';
    RAISE NOTICE '⚡ Should fix infinite recursion issues';
END $$; 