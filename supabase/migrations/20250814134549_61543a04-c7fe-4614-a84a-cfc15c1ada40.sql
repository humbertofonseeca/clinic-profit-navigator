-- Restrict procedures table access to clinic members only
DROP POLICY IF EXISTS "Authenticated users can view procedures" ON public.procedures;

CREATE POLICY "Clinic members can view procedures"
ON public.procedures
FOR SELECT
USING (
  get_user_role(auth.uid()) = 'admin'::app_role 
  OR get_user_clinic_id(auth.uid()) IS NOT NULL
);