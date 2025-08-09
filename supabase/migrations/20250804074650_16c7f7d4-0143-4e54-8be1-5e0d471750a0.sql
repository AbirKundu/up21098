-- Create user_subscription_history table to track all user purchases
CREATE TABLE public.user_subscription_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  package_id UUID NOT NULL,
  package_name TEXT NOT NULL,
  plan_duration TEXT NOT NULL, -- 'weekly', '15-day', 'monthly', etc.
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BDT',
  credits_purchased NUMERIC DEFAULT 0,
  credits_remaining NUMERIC DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'expired', 'cancelled'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_subscription_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own subscription history" 
ON public.user_subscription_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription history" 
ON public.user_subscription_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription history" 
ON public.user_subscription_history 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscription history" 
ON public.user_subscription_history 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_user_subscription_history_updated_at
BEFORE UPDATE ON public.user_subscription_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate expiry date based on plan duration
CREATE OR REPLACE FUNCTION public.calculate_plan_expiry(start_date TIMESTAMP WITH TIME ZONE, plan_duration TEXT)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $function$
BEGIN
  CASE plan_duration
    WHEN 'weekly' THEN
      RETURN start_date + INTERVAL '7 days';
    WHEN '15-day' THEN
      RETURN start_date + INTERVAL '15 days';
    WHEN 'monthly' THEN
      RETURN start_date + INTERVAL '1 month';
    WHEN 'quarterly' THEN
      RETURN start_date + INTERVAL '3 months';
    WHEN 'yearly' THEN
      RETURN start_date + INTERVAL '1 year';
    ELSE
      RETURN start_date + INTERVAL '1 month';
  END CASE;
END;
$function$;