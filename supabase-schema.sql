-- Gym Stats App - Supabase Database Schema
-- Run this SQL in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create gym_groups table
CREATE TABLE IF NOT EXISTS gym_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gym_users table
CREATE TABLE IF NOT EXISTS gym_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES gym_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gym_entries table
CREATE TABLE IF NOT EXISTS gym_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES gym_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES gym_users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gym_entries_group_date ON gym_entries(group_id, date);
CREATE INDEX IF NOT EXISTS idx_gym_entries_user_date ON gym_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_gym_users_group ON gym_users(group_id);

-- Enable Row Level Security (RLS)
ALTER TABLE gym_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gym_groups
CREATE POLICY "Users can view their own groups" ON gym_groups
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create groups" ON gym_groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own groups" ON gym_groups
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own groups" ON gym_groups
  FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for gym_users
CREATE POLICY "Users can view users in their groups" ON gym_users
  FOR SELECT USING (
    group_id IN (
      SELECT id FROM gym_groups WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create users in their groups" ON gym_users
  FOR INSERT WITH CHECK (
    group_id IN (
      SELECT id FROM gym_groups WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update users in their groups" ON gym_users
  FOR UPDATE USING (
    group_id IN (
      SELECT id FROM gym_groups WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete users in their groups" ON gym_users
  FOR DELETE USING (
    group_id IN (
      SELECT id FROM gym_groups WHERE created_by = auth.uid()
    )
  );

-- RLS Policies for gym_entries
CREATE POLICY "Users can view entries in their groups" ON gym_entries
  FOR SELECT USING (
    group_id IN (
      SELECT id FROM gym_groups WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create entries in their groups" ON gym_entries
  FOR INSERT WITH CHECK (
    group_id IN (
      SELECT id FROM gym_groups WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update entries in their groups" ON gym_entries
  FOR UPDATE USING (
    group_id IN (
      SELECT id FROM gym_groups WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete entries in their groups" ON gym_entries
  FOR DELETE USING (
    group_id IN (
      SELECT id FROM gym_groups WHERE created_by = auth.uid()
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_gym_groups_updated_at 
  BEFORE UPDATE ON gym_groups 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gym_users_updated_at 
  BEFORE UPDATE ON gym_users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gym_entries_updated_at 
  BEFORE UPDATE ON gym_entries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
