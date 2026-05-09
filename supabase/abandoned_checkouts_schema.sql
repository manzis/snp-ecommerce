-- Create table for Abandoned Checkouts
CREATE TABLE IF NOT EXISTS public.abandoned_checkouts (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  customer_details jsonb not null default '{}'::jsonb, 
  items jsonb not null default '[]'::jsonb,          
  total_amount numeric(10, 2) not null,
  session_id text null,
  abandoned_at timestamp with time zone null default now(),
  created_at timestamp with time zone null default now(),
  recovered boolean default false,
  constraint abandoned_checkouts_pkey primary key (id),
  constraint abandoned_checkouts_user_id_fkey foreign key (user_id) references auth.users (id) on delete set null
) TABLESPACE pg_default;

-- Enable RLS
ALTER TABLE public.abandoned_checkouts ENABLE ROW LEVEL SECURITY;

-- Policy: Only Admins can view/manage
CREATE POLICY "Admin full access abandoned_checkouts" ON public.abandoned_checkouts
FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Policy: Public/Service can insert (for recording)
CREATE POLICY "Public insert abandoned_checkouts" ON public.abandoned_checkouts
FOR INSERT WITH CHECK (true);
