-- Fix 1: Set immutable search_path on the function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix 2: Replace overly permissive package policies with proper role checks

-- Drop old policies
DROP POLICY IF EXISTS insert_packages ON public.packages;
DROP POLICY IF EXISTS update_packages ON public.packages;
DROP POLICY IF EXISTS delete_packages ON public.packages;
DROP POLICY IF EXISTS select_packages ON public.packages;

-- Only satpam users (verified via profiles table) can manage packages
CREATE POLICY "select_packages" ON public.packages FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'satpam')
  );

CREATE POLICY "insert_packages" ON public.packages FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'satpam')
  );

CREATE POLICY "update_packages" ON public.packages FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'satpam')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'satpam')
  );

CREATE POLICY "delete_packages" ON public.packages FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'satpam')
  );
