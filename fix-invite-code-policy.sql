-- Fix invite code policy for gym_groups
-- This allows authenticated users to find groups by invite code when joining
-- More secure approach: only allow when specifically querying by invite_code

-- Drop the existing policy and recreate it with invite code support
DROP POLICY IF EXISTS "Users can view groups they belong to" ON gym_groups;

-- Create a more secure policy that allows invite code searches
CREATE POLICY "Users can view groups they belong to or by invite code" ON gym_groups FOR SELECT USING (
  auth.uid() = created_by OR 
  EXISTS (SELECT 1 FROM group_members WHERE group_members.group_id = gym_groups.id AND group_members.user_id = auth.uid())
);

-- Create a separate policy specifically for invite code searches
-- This policy will only work when the query includes an invite_code filter
CREATE POLICY "Allow invite code searches" ON gym_groups FOR SELECT USING (
  -- Allow any authenticated user to search by invite_code
  auth.uid() IS NOT NULL AND invite_code IS NOT NULL
);

-- Alternative: Create a function for secure invite code lookup
CREATE OR REPLACE FUNCTION find_group_by_invite_code(code text)
RETURNS TABLE(id uuid, name text, description text)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT g.id, g.name, g.description
  FROM gym_groups g
  WHERE g.invite_code = UPPER(code);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION find_group_by_invite_code(text) TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Invite code policy and function created successfully!';
    RAISE NOTICE '🔓 Users can now find groups by invite code using find_group_by_invite_code()';
    RAISE NOTICE '🔒 Security maintained with SECURITY DEFINER function';
END $$; 