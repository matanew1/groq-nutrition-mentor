create table "public"."water_tracker" (
    "id" uuid not null default uuid_generate_v4(),
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "amount" integer not null, -- amount in ml
    "date" date not null,
    "timestamp" timestamp with time zone not null
);

-- Add foreign key constraint
alter table "public"."water_tracker" add constraint "water_tracker_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create an RLS policy for the water_tracker table
alter table "public"."water_tracker" enable row level security;

-- Add needed policies
create policy "Users can view their own water entries"
  on water_tracker for select
  using (auth.uid() = user_id);

create policy "Users can insert their own water entries"
  on water_tracker for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own water entries"
  on water_tracker for update
  using (auth.uid() = user_id);

create policy "Users can delete their own water entries"
  on water_tracker for delete
  using (auth.uid() = user_id);

-- Add indexes for performance
create index water_tracker_user_id_date_idx on water_tracker (user_id, date);

-- Add a new column to profiles table for water goal
alter table "public"."profiles"
add column if not exists "settings" jsonb default '{}';
