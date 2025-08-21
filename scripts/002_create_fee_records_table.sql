-- Create fee records table for tracking employee fee payments
CREATE TABLE IF NOT EXISTS public.fee_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  fee_type TEXT NOT NULL CHECK (fee_type IN ('monthly', 'annual', 'registration', 'penalty', 'other')),
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'waived')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS for security
ALTER TABLE public.fee_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for fee_records table
CREATE POLICY "fee_records_select_authenticated" 
  ON public.fee_records FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "fee_records_insert_authenticated" 
  ON public.fee_records FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

CREATE POLICY "fee_records_update_authenticated" 
  ON public.fee_records FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "fee_records_delete_authenticated" 
  ON public.fee_records FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fee_records_employee_id ON public.fee_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_fee_records_status ON public.fee_records(status);
CREATE INDEX IF NOT EXISTS idx_fee_records_due_date ON public.fee_records(due_date);
CREATE INDEX IF NOT EXISTS idx_fee_records_created_by ON public.fee_records(created_by);
