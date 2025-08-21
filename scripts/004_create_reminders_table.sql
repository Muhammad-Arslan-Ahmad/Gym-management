-- Create reminders table for tracking payment reminder history
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_record_id UUID NOT NULL REFERENCES public.fee_records(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('email', 'sms', 'system')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS for security
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for reminders table
CREATE POLICY "reminders_select_authenticated" 
  ON public.reminders FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "reminders_insert_authenticated" 
  ON public.reminders FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

CREATE POLICY "reminders_update_authenticated" 
  ON public.reminders FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "reminders_delete_authenticated" 
  ON public.reminders FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reminders_fee_record_id ON public.reminders(fee_record_id);
CREATE INDEX IF NOT EXISTS idx_reminders_employee_id ON public.reminders(employee_id);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON public.reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_created_at ON public.reminders(created_at);
