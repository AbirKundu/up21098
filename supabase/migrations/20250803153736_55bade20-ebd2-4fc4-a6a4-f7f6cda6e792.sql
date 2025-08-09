-- Create enum for billing cycles
CREATE TYPE public.billing_cycle AS ENUM ('monthly', 'quarterly', 'yearly', 'weekly', 'daily');

-- Create enum for subscription categories
CREATE TYPE public.subscription_category AS ENUM ('entertainment', 'productivity', 'business', 'education', 'health', 'finance', 'other');

-- Create subscriptions table for tracking external subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cost DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  billing_cycle billing_cycle NOT NULL,
  category subscription_category DEFAULT 'other',
  provider TEXT,
  next_billing_date DATE,
  auto_renewal BOOLEAN DEFAULT true,
  usage_limit INTEGER, -- For services with usage limits
  current_usage INTEGER DEFAULT 0,
  website_url TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscription_payments table for tracking payment history
CREATE TABLE public.subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscribers table for Stripe subscription management
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can manage their own subscriptions"
ON public.subscriptions
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for subscription_payments
CREATE POLICY "Users can view their own payments"
ON public.subscription_payments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
ON public.subscription_payments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for subscribers (Stripe)
CREATE POLICY "Users can view their own subscription info"
ON public.subscribers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Edge functions can manage subscription info"
ON public.subscribers
FOR ALL
TO authenticated
USING (true);

-- Create function to calculate next billing date
CREATE OR REPLACE FUNCTION public.calculate_next_billing_date(
  last_date DATE,
  cycle billing_cycle
)
RETURNS DATE
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $$
BEGIN
  CASE cycle
    WHEN 'daily' THEN
      RETURN last_date + INTERVAL '1 day';
    WHEN 'weekly' THEN
      RETURN last_date + INTERVAL '1 week';
    WHEN 'monthly' THEN
      RETURN last_date + INTERVAL '1 month';
    WHEN 'quarterly' THEN
      RETURN last_date + INTERVAL '3 months';
    WHEN 'yearly' THEN
      RETURN last_date + INTERVAL '1 year';
    ELSE
      RETURN last_date + INTERVAL '1 month';
  END CASE;
END;
$$;

-- Create function to update next billing date automatically
CREATE OR REPLACE FUNCTION public.update_next_billing_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Update next billing date when a payment is recorded
  IF TG_OP = 'INSERT' THEN
    UPDATE public.subscriptions 
    SET next_billing_date = public.calculate_next_billing_date(
      NEW.payment_date,
      billing_cycle
    ),
    updated_at = now()
    WHERE id = NEW.subscription_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-update billing dates
CREATE TRIGGER update_billing_date_on_payment
  AFTER INSERT ON public.subscription_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_next_billing_date();

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_next_billing ON public.subscriptions(next_billing_date) WHERE is_active = true;
CREATE INDEX idx_subscription_payments_user_id ON public.subscription_payments(user_id);
CREATE INDEX idx_subscription_payments_date ON public.subscription_payments(payment_date);
CREATE INDEX idx_subscribers_email ON public.subscribers(email);
CREATE INDEX idx_subscribers_stripe_customer ON public.subscribers(stripe_customer_id);