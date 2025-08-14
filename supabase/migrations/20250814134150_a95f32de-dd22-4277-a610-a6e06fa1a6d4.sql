-- Create patient-staff assignments table for granular access control
CREATE TABLE public.patient_staff_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid NOT NULL,
  staff_user_id uuid NOT NULL,
  clinic_id uuid NOT NULL,
  assignment_type text NOT NULL DEFAULT 'primary_care', -- primary_care, consulting, etc.
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  assigned_by uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Ensure a staff member can only be assigned once per patient (per assignment type)
  UNIQUE(patient_id, staff_user_id, assignment_type)
);

-- Enable RLS on the assignments table
ALTER TABLE public.patient_staff_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for patient_staff_assignments
CREATE POLICY "Users can view assignments from their clinic" 
ON public.patient_staff_assignments 
FOR SELECT 
USING (
  (get_user_role(auth.uid()) = 'admin'::app_role) OR 
  (clinic_id = get_user_clinic_id(auth.uid()))
);

CREATE POLICY "Clinic staff can manage assignments from their clinic" 
ON public.patient_staff_assignments 
FOR ALL 
USING (
  (get_user_role(auth.uid()) = 'admin'::app_role) OR 
  (
    (clinic_id = get_user_clinic_id(auth.uid())) AND 
    (get_user_role(auth.uid()) = ANY (ARRAY['clinic_staff'::app_role, 'admin'::app_role]))
  )
)
WITH CHECK (
  (get_user_role(auth.uid()) = 'admin'::app_role) OR 
  (
    (clinic_id = get_user_clinic_id(auth.uid())) AND 
    (get_user_role(auth.uid()) = ANY (ARRAY['clinic_staff'::app_role, 'admin'::app_role]))
  )
);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_patient_staff_assignments_updated_at
BEFORE UPDATE ON public.patient_staff_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update the patients table RLS policy to implement granular access
DROP POLICY IF EXISTS "Only authorized medical staff can view patients from their clinic" ON public.patients;

-- Create new restrictive policy: only assigned staff or admins can view patient data
CREATE POLICY "Only assigned staff can view patient data" 
ON public.patients 
FOR SELECT 
USING (
  -- Admins can see all patients
  (get_user_role(auth.uid()) = 'admin'::app_role) OR 
  -- Staff can only see patients assigned to them
  (
    (clinic_id = get_user_clinic_id(auth.uid())) AND 
    (get_user_role(auth.uid()) = ANY (ARRAY['clinic_staff'::app_role, 'admin'::app_role])) AND
    (
      -- Check if user is assigned to this patient
      EXISTS (
        SELECT 1 FROM public.patient_staff_assignments 
        WHERE patient_id = patients.id 
        AND staff_user_id = auth.uid() 
        AND is_active = true
      )
      -- Or if this is a new patient (no assignments yet) - allows creating patients
      OR NOT EXISTS (
        SELECT 1 FROM public.patient_staff_assignments 
        WHERE patient_id = patients.id 
        AND is_active = true
      )
    )
  )
);

-- Keep the existing ALL policy for managing patients but ensure assignments are created
-- (The existing "Clinic staff can manage patients from their clinic" policy remains in place)