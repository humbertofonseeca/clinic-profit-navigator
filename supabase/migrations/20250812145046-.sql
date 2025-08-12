-- Fix security definer functions by setting search_path
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS app_role AS $$
    SELECT role FROM public.user_roles WHERE user_roles.user_id = $1 LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION public.get_user_clinic_id(user_id UUID)
RETURNS UUID AS $$
    SELECT clinic_id FROM public.user_roles WHERE user_roles.user_id = $1 LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION public.user_has_role(user_id UUID, required_role app_role)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = $1 AND role = $2
    );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = '';

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';