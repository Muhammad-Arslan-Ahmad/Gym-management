-- Create employees table for gym staff management
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  position TEXT NOT NULL,
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  salary DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS for security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for employees table
CREATE POLICY "employees_select_authenticated" 
  ON public.employees FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "employees_insert_authenticated" 
  ON public.employees FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

CREATE POLICY "employees_update_authenticated" 
  ON public.employees FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "employees_delete_authenticated" 
  ON public.employees FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_created_by ON public.employees(created_by);
