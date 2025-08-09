import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface UserSubscriptionWithProfile {
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
  user_profile: {
    username: string;
    full_name: string;
    email: string;
  } | null;
}

interface RevenueStats {
  totalRevenue: number;
  activeSubscriptions: number;
  totalUsers: number;
  monthlyRevenue: number;
}

export const useAdminUserSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<UserSubscriptionWithProfile[]>([]);
  const [revenueStats, setRevenueStats] = useState<RevenueStats>({
    totalRevenue: 0,
    activeSubscriptions: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const fetchUserSubscriptions = async () => {
    if (!isAdmin) return;

    try {
      // Fetch subscription history
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscription_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (subscriptionError) throw subscriptionError;

      // Fetch user profiles separately to avoid foreign key issues
      const userIds = [...new Set(subscriptionData?.map(sub => sub.user_id) || [])];
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, full_name, email')
        .in('id', userIds);

      if (profileError) throw profileError;

      // Combine subscription data with user profiles
      const profileMap = new Map(profileData?.map(profile => [profile.id, profile]) || []);
      const enrichedSubscriptions = subscriptionData?.map(subscription => ({
        ...subscription,
        user_profile: profileMap.get(subscription.user_id) || null
      })) || [];

      setSubscriptions(enrichedSubscriptions as UserSubscriptionWithProfile[]);

      // Calculate revenue statistics
      if (subscriptionData) {
        const totalRevenue = subscriptionData.reduce((sum, sub) => sum + parseFloat(sub.price.toString()), 0);
        const activeSubscriptions = subscriptionData.filter(sub => 
          sub.status === 'active' && new Date(sub.expiry_date) > new Date()
        ).length;
        
        const uniqueUsers = new Set(subscriptionData.map(sub => sub.user_id)).size;
        
        // Calculate monthly revenue (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const monthlyRevenue = subscriptionData
          .filter(sub => new Date(sub.created_at) >= thirtyDaysAgo)
          .reduce((sum, sub) => sum + parseFloat(sub.price.toString()), 0);

        setRevenueStats({
          totalRevenue,
          activeSubscriptions,
          totalUsers: uniqueUsers,
          monthlyRevenue,
        });
      }
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user subscription data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUserSubscriptions();
    }
  }, [isAdmin]);

  return {
    subscriptions,
    revenueStats,
    loading,
    refetch: fetchUserSubscriptions,
  };
};