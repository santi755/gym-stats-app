-- Simple fix: Add policy to allow invite code searches without touching existing policies

-- Add a new policy specifically for invite code searches
CREATE POLICY "Allow searching groups by invite code" ON gym_groups 
FOR SELECT 
TO authenticated 
USING (invite_code IS NOT NULL);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Invite code search policy added successfully!';
    RAISE NOTICE '🔓 Users can now find groups by invite code';
END $$; 