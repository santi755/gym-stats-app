-- Gym Stats App - Supabase Database Schema (FULL RESET)
-- Run this SQL in your Supabase SQL editor

-- Create the gym_groups table
create table gym_groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text default '',
  invite_code text unique not null default encode(gen_random_bytes(6), 'base64'),
  created_by uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create group_members table (users that belong to groups)
create table group_members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references gym_groups(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  display_name text not null,
  color text default '#3b82f6',
  avatar text,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(group_id, user_id)
);

-- Create the gym_entries table (daily points) - now references group_members instead of gym_users
create table gym_entries (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references gym_groups(id) on delete cascade not null,
  member_id uuid references group_members(id) on delete cascade not null,
  date date not null,
  points integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(group_id, member_id, date)
);

-- Create group_invitations table
create table group_invitations (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references gym_groups(id) on delete cascade not null,
  invited_by uuid references auth.users(id) on delete cascade not null,
  email text,
  invite_code text not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'expired')),
  expires_at timestamp with time zone default (timezone('utc'::text, now()) + interval '7 days'),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  used_at timestamp with time zone
);

-- Keep gym_users table for backward compatibility (deprecated)
create table gym_users (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references gym_groups(id) on delete cascade not null,
  name text not null,
  color text default '#3b82f6',
  avatar text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_preferences table to store current group and selected user
create table user_preferences (
  id uuid default gen_random_uuid() primary key,
  auth_user_id uuid references auth.users(id) on delete cascade unique not null,
  current_group_id uuid references gym_groups(id) on delete set null,
  selected_gym_user_id uuid references gym_users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) - FIRST enable RLS, then create policies
alter table gym_groups enable row level security;
alter table group_members enable row level security;
alter table gym_entries enable row level security;
alter table group_invitations enable row level security;
alter table gym_users enable row level security;
alter table user_preferences enable row level security;

-- Create policies for gym_groups (simplified first)
create policy "Users can create their own groups" on gym_groups for insert with check (auth.uid() = created_by);
create policy "Group owners can update their groups" on gym_groups for update using (auth.uid() = created_by);
create policy "Group owners can delete their groups" on gym_groups for delete using (auth.uid() = created_by);

-- Create policies for group_members (basic first)
create policy "Users can join groups via invitations" on group_members for insert with check (auth.uid() = user_id);
create policy "Users can update their own membership" on group_members for update using (auth.uid() = user_id);
create policy "Users can leave groups" on group_members for delete using (auth.uid() = user_id);

-- Now create the complex policies that reference other tables
create policy "Users can view groups they belong to" on gym_groups for select using (
  auth.uid() = created_by OR 
  exists (select 1 from group_members where group_members.group_id = gym_groups.id and group_members.user_id = auth.uid())
);

create policy "Users can view members of groups they belong to" on group_members for select using (
  exists (select 1 from group_members gm where gm.group_id = group_members.group_id and gm.user_id = auth.uid())
);

create policy "Group owners can manage members" on group_members for all using (
  exists (select 1 from gym_groups where gym_groups.id = group_members.group_id and gym_groups.created_by = auth.uid())
);

-- Create policies for gym_entries
create policy "Users can view entries in their groups" on gym_entries for select using (
  exists (select 1 from group_members where group_members.group_id = gym_entries.group_id and group_members.user_id = auth.uid())
);
create policy "Users can create their own entries" on gym_entries for insert with check (
  exists (select 1 from group_members where group_members.id = gym_entries.member_id and group_members.user_id = auth.uid())
);
create policy "Users can update their own entries" on gym_entries for update using (
  exists (select 1 from group_members where group_members.id = gym_entries.member_id and group_members.user_id = auth.uid())
);
create policy "Users can delete their own entries" on gym_entries for delete using (
  exists (select 1 from group_members where group_members.id = gym_entries.member_id and group_members.user_id = auth.uid())
);

-- Create policies for group_invitations
create policy "Users can view invitations for their groups" on group_invitations for select using (
  exists (select 1 from gym_groups where gym_groups.id = group_invitations.group_id and gym_groups.created_by = auth.uid())
);
create policy "Group owners can create invitations" on group_invitations for insert with check (
  exists (select 1 from gym_groups where gym_groups.id = group_invitations.group_id and gym_groups.created_by = auth.uid())
);
create policy "Group owners can update invitations" on group_invitations for update using (
  exists (select 1 from gym_groups where gym_groups.id = group_invitations.group_id and gym_groups.created_by = auth.uid())
);

-- Create policies for gym_users (backward compatibility)
create policy "Users can view users in their groups" on gym_users for select using (
  exists (select 1 from gym_groups where gym_groups.id = gym_users.group_id and gym_groups.created_by = auth.uid())
);
create policy "Users can create users in their groups" on gym_users for insert with check (
  exists (select 1 from gym_groups where gym_groups.id = gym_users.group_id and gym_groups.created_by = auth.uid())
);
create policy "Users can update users in their groups" on gym_users for update using (
  exists (select 1 from gym_groups where gym_groups.id = gym_users.group_id and gym_groups.created_by = auth.uid())
);
create policy "Users can delete users in their groups" on gym_users for delete using (
  exists (select 1 from gym_groups where gym_groups.id = gym_users.group_id and gym_groups.created_by = auth.uid())
);

-- Create policies for user_preferences
create policy "Users can view their own preferences" on user_preferences for select using (auth.uid() = auth_user_id);
create policy "Users can create their own preferences" on user_preferences for insert with check (auth.uid() = auth_user_id);
create policy "Users can update their own preferences" on user_preferences for update using (auth.uid() = auth_user_id);
create policy "Users can delete their own preferences" on user_preferences for delete using (auth.uid() = auth_user_id);

-- Create indexes for better performance
create index idx_gym_groups_invite_code on gym_groups(invite_code);
create index idx_group_members_group_id on group_members(group_id);
create index idx_group_members_user_id on group_members(user_id);
create index idx_group_members_group_user on group_members(group_id, user_id);
create index idx_gym_entries_group_id on gym_entries(group_id);
create index idx_gym_entries_member_id on gym_entries(member_id);
create index idx_gym_entries_date on gym_entries(date);
create index idx_gym_entries_group_member_date on gym_entries(group_id, member_id, date);
create index idx_group_invitations_invite_code on group_invitations(invite_code);
create index idx_group_invitations_group_id on group_invitations(group_id);
create index idx_gym_users_group_id on gym_users(group_id);
create index idx_user_preferences_auth_user_id on user_preferences(auth_user_id);

-- Create updated_at triggers
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language 'plpgsql';

create trigger update_gym_groups_updated_at before update on gym_groups for each row execute procedure update_updated_at_column();
create trigger update_group_members_updated_at before update on group_members for each row execute procedure update_updated_at_column();
create trigger update_gym_entries_updated_at before update on gym_entries for each row execute procedure update_updated_at_column();
create trigger update_gym_users_updated_at before update on gym_users for each row execute procedure update_updated_at_column();
create trigger update_user_preferences_updated_at before update on user_preferences for each row execute procedure update_updated_at_column();

-- Function to generate clean invite codes
create or replace function generate_invite_code()
returns text as $$
begin
    return upper(substring(encode(gen_random_bytes(6), 'base64') from 1 for 8));
end;
$$ language 'plpgsql';

-- Set default invite code generation for groups
alter table gym_groups alter column invite_code set default generate_invite_code();

-- Success message
do $$
begin
    raise notice '🎉 Database schema created successfully!';
    raise notice '📊 Tables created: gym_groups, group_members, gym_entries, group_invitations, gym_users, user_preferences';
    raise notice '🔒 Row Level Security enabled on all tables';
    raise notice '⚡ Performance indexes created';
    raise notice '🚀 Ready for the invitation system!';
end $$;