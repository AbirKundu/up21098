import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionHistory {
  id: string;
  user_id: string;
  package_id: string;
  package_name: string;
  plan_duration: string;
  price: number;
  currency: string;
  credits_purchased: number;
  credits_remaining: number;
  start_date: string;
  expiry_date: string;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PlanDuration {
  key: string;
  label: string;
  multiplier: number;
  days: number;
}

export const useSubscriptionHistory = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const planDurations: PlanDuration[] = [
    { key: 'weekly', label: '7 Days', multiplier: 0.25, days: 7 },
    { key: '15-day', label: '15 Days', multiplier: 0.5, days: 15 },
    { key: 'monthly', label: '1 Month', multiplier: 1, days: 30 },
  ];

  const fetchSubscriptions = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_subscription_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch subscription history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActiveSubscriptions = () => {
    return subscriptions.filter(sub => 
      sub.status === 'active' && 
      new Date(sub.expiry_date) > new Date()
    );
  };

  const getExpiredSubscriptions = () => {
    return subscriptions.filter(sub => 
      sub.status === 'expired' || 
      new Date(sub.expiry_date) <= new Date()
    );
  };

  const calculateProratedPrice = (basePrice: number, duration: string) => {
    const planDuration = planDurations.find(pd => pd.key === duration);
    return planDuration ? basePrice * planDuration.multiplier : basePrice;
  };

  const calculateUpgradeCredits = (currentSub: SubscriptionHistory, targetDuration: string) => {
    if (currentSub.package_id !== targetDuration) return 0;
    
    const timeRemaining = new Date(currentSub.expiry_date).getTime() - new Date().getTime();
    const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 0) return 0;
    
    // Calculate credit value based on remaining time
    const currentPlan = planDurations.find(pd => pd.key === currentSub.plan_duration);
    if (!currentPlan) return 0;
    
    const dailyValue = currentSub.price / currentPlan.days;
    return dailyValue * daysRemaining;
  };

  const purchaseSubscription = async (
    packageId: string,
    packageName: string,
    basePrice: number,
    duration: string,
    currency: string = 'BDT'
  ) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Please log in to purchase a subscription",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Check for existing active subscription of the same package
      const existingSubscription = subscriptions.find(sub => 
        sub.package_id === packageId && 
        sub.status === 'active' && 
        new Date(sub.expiry_date) > new Date()
      );

      const finalPrice = calculateProratedPrice(basePrice, duration);
      let creditsToAdd = 0;
      
      // If upgrading within the same package, calculate credits
      if (existingSubscription && duration === 'monthly' && existingSubscription.plan_duration !== 'monthly') {
        creditsToAdd = calculateUpgradeCredits(existingSubscription, duration);
        
        // Update existing subscription to expired
        await supabase
          .from('user_subscription_history')
          .update({ status: 'expired', is_active: false })
          .eq('id', existingSubscription.id);
      }

      const startDate = new Date().toISOString();
      const { data: expiryResult } = await supabase
        .rpc('calculate_plan_expiry', {
          start_date: startDate,
          plan_duration: duration
        });

      const newSubscription = {
        user_id: user.id,
        package_id: packageId,
        package_name: packageName,
        plan_duration: duration,
        price: finalPrice,
        currency,
        credits_purchased: finalPrice + creditsToAdd,
        credits_remaining: finalPrice + creditsToAdd,
        start_date: startDate,
        expiry_date: expiryResult,
        status: 'active',
        is_active: true
      };

      const { error } = await supabase
        .from('user_subscription_history')
        .insert([newSubscription]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Successfully purchased ${packageName} ${duration} plan`,
      });

      await fetchSubscriptions();
    } catch (error) {
      console.error('Error purchasing subscription:', error);
      toast({
        title: "Error",
        description: "Failed to purchase subscription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from('user_subscription_history')
        .update({ status: 'cancelled', is_active: false })
        .eq('id', subscriptionId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Subscription cancelled successfully",
      });

      await fetchSubscriptions();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchSubscriptions();
    }
  }, [user?.id]);

  return {
    subscriptions,
    loading,
    activeSubscriptions: getActiveSubscriptions(),
    expiredSubscriptions: getExpiredSubscriptions(),
    planDurations,
    calculateProratedPrice,
    purchaseSubscription,
    cancelSubscription,
    refetch: fetchSubscriptions
  };
};