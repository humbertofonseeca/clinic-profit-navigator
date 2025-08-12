-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'clinic_staff', 'read_only');

-- Create user_roles table for RBAC
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    clinic_id UUID NULL, -- NULL for admin users, specific clinic for staff
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role, clinic_id)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update existing clinics table (already exists, just ensure proper structure)
-- The clinics table already has the basic structure needed

-- Update existing patients table to ensure proper structure
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Update existing appointments table to ensure proper structure  
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Update existing procedures table (it's already global, no clinic_id needed)

-- Update existing marketing_campaigns table to ensure proper structure
ALTER TABLE public.marketing_campaigns
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Update existing expenses table to ensure proper structure
ALTER TABLE public.expenses
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Security definer functions to check user role and clinic access
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS app_role AS $$
    SELECT role FROM public.user_roles WHERE user_roles.user_id = $1 LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_clinic_id(user_id UUID)
RETURNS UUID AS $$
    SELECT clinic_id FROM public.user_roles WHERE user_roles.user_id = $1 LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.user_has_role(user_id UUID, required_role app_role)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = $1 AND role = $2
    );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.get_user_role(auth.uid()) = 'admin')
WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Update RLS policies for clinics (replace existing)
DROP POLICY IF EXISTS "Allow all access to clinics" ON public.clinics;

CREATE POLICY "Admins can manage all clinics"
ON public.clinics FOR ALL
TO authenticated
USING (public.get_user_role(auth.uid()) = 'admin')
WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can view their clinic"
ON public.clinics FOR SELECT
TO authenticated
USING (
    public.get_user_role(auth.uid()) = 'admin' OR 
    id = public.get_user_clinic_id(auth.uid())
);

-- Update RLS policies for patients (replace existing)
DROP POLICY IF EXISTS "Allow all access to patients" ON public.patients;

CREATE POLICY "Users can view patients from their clinic"
ON public.patients FOR SELECT
TO authenticated
USING (
    public.get_user_role(auth.uid()) = 'admin' OR 
    clinic_id = public.get_user_clinic_id(auth.uid())
);

CREATE POLICY "Clinic staff can manage patients from their clinic"
ON public.patients FOR ALL
TO authenticated
USING (
    public.get_user_role(auth.uid()) = 'admin' OR 
    (clinic_id = public.get_user_clinic_id(auth.uid()) AND 
     public.get_user_role(auth.uid()) IN ('clinic_staff', 'admin'))
)
WITH CHECK (
    public.get_user_role(auth.uid()) = 'admin' OR 
    (clinic_id = public.get_user_clinic_id(auth.uid()) AND 
     public.get_user_role(auth.uid()) IN ('clinic_staff', 'admin'))
);

-- Update RLS policies for appointments (replace existing)
DROP POLICY IF EXISTS "Allow all access to appointments" ON public.appointments;

CREATE POLICY "Users can view appointments from their clinic"
ON public.appointments FOR SELECT
TO authenticated
USING (
    public.get_user_role(auth.uid()) = 'admin' OR 
    clinic_id = public.get_user_clinic_id(auth.uid())
);

CREATE POLICY "Clinic staff can manage appointments from their clinic"
ON public.appointments FOR ALL
TO authenticated
USING (
    public.get_user_role(auth.uid()) = 'admin' OR 
    (clinic_id = public.get_user_clinic_id(auth.uid()) AND 
     public.get_user_role(auth.uid()) IN ('clinic_staff', 'admin'))
)
WITH CHECK (
    public.get_user_role(auth.uid()) = 'admin' OR 
    (clinic_id = public.get_user_clinic_id(auth.uid()) AND 
     public.get_user_role(auth.uid()) IN ('clinic_staff', 'admin'))
);

-- Update RLS policies for procedures (replace existing - procedures are global)
DROP POLICY IF EXISTS "Allow all access to procedures" ON public.procedures;

CREATE POLICY "Authenticated users can view procedures"
ON public.procedures FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage procedures"
ON public.procedures FOR ALL
TO authenticated
USING (public.get_user_role(auth.uid()) = 'admin')
WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- Update RLS policies for marketing_campaigns (replace existing)
DROP POLICY IF EXISTS "Allow all access to marketing_campaigns" ON public.marketing_campaigns;

CREATE POLICY "Users can view campaigns from their clinic"
ON public.marketing_campaigns FOR SELECT
TO authenticated
USING (
    public.get_user_role(auth.uid()) = 'admin' OR 
    clinic_id = public.get_user_clinic_id(auth.uid())
);

CREATE POLICY "Clinic staff can manage campaigns from their clinic"
ON public.marketing_campaigns FOR ALL
TO authenticated
USING (
    public.get_user_role(auth.uid()) = 'admin' OR 
    (clinic_id = public.get_user_clinic_id(auth.uid()) AND 
     public.get_user_role(auth.uid()) IN ('clinic_staff', 'admin'))
)
WITH CHECK (
    public.get_user_role(auth.uid()) = 'admin' OR 
    (clinic_id = public.get_user_clinic_id(auth.uid()) AND 
     public.get_user_role(auth.uid()) IN ('clinic_staff', 'admin'))
);

-- Update RLS policies for expenses (replace existing)
DROP POLICY IF EXISTS "Allow all access to expenses" ON public.expenses;

CREATE POLICY "Users can view expenses from their clinic"
ON public.expenses FOR SELECT
TO authenticated
USING (
    public.get_user_role(auth.uid()) = 'admin' OR 
    clinic_id = public.get_user_clinic_id(auth.uid())
);

CREATE POLICY "Clinic staff can manage expenses from their clinic"
ON public.expenses FOR ALL
TO authenticated
USING (
    public.get_user_role(auth.uid()) = 'admin' OR 
    (clinic_id = public.get_user_clinic_id(auth.uid()) AND 
     public.get_user_role(auth.uid()) IN ('clinic_staff', 'admin'))
)
WITH CHECK (
    public.get_user_role(auth.uid()) = 'admin' OR 
    (clinic_id = public.get_user_clinic_id(auth.uid()) AND 
     public.get_user_role(auth.uid()) IN ('clinic_staff', 'admin'))
);

-- Create trigger for updating timestamps
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, name, email)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();