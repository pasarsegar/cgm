-- Fix RLS for menus to allow public modification for now (Development)
-- This resolves "new row violates row-level security policy"

-- Drop the old restricted policy
DROP POLICY IF EXISTS "Allow admin modify menus" ON public.menus;

-- Create a new policy that allows everyone to modify (for development ease)
-- In production, you should switch this back to auth.role() = 'authenticated'
CREATE POLICY "Allow public modify menus" ON public.menus FOR ALL USING (true) WITH CHECK (true);
