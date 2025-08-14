-- Fix security vulnerability: Restrict patient data access to authorized medical staff only
-- The current SELECT policy allows any authenticated user to view patient data from their clinic
-- This should be restricted to only clinic_staff and admin roles

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view patients from their clinic" ON public.patients;

-- Create a more restrictive policy that only allows clinic_staff and admin to view patient data
CREATE POLICY "Only authorized medical staff can view patients from their clinic" 
ON public.patients 
FOR SELECT 
USING (
  (get_user_role(auth.uid()) = 'admin'::app_role) OR 
  (
    (clinic_id = get_user_clinic_id(auth.uid())) AND 
    (get_user_role(auth.uid()) = ANY (ARRAY['clinic_staff'::app_role, 'admin'::app_role]))
  )
);

-- Also ensure the ALL policy is properly restrictive (it already is, but adding for completeness)
-- This policy already correctly restricts to clinic_staff and admin only
-- No changes needed to: "Clinic staff can manage patients from their clinic"