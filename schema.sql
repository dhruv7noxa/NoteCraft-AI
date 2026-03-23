-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Untitled Board',
    board_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Setup basic RLS (Row Level Security) if needed. 
-- For a local/free-tier without auth, we can just allow all reading and writing:
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
ON public.sessions FOR SELECT
USING (true);

CREATE POLICY "Enable insert access for all users"
ON public.sessions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
ON public.sessions FOR UPDATE
USING (true);
