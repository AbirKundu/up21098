import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  cost: number;
  currency: string;
  billing_cycle: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  category: 'entertainment' | 'productivity' | 'business' | 'education' | 'health' | 'finance' | 'other';
  provider?: string;
  next_billing_date?: string;
  auto_renewal: boolean;
  usage_limit?: number;
  current_usage: number;
  website_url?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSubscriptions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: "Error",
        description: "Failed to load subscriptions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSubscription = async (subscriptionData: Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([{
        ...subscriptionData,
        user_id: user.id,
        currency: 'BDT', // Set default currency to BDT
      }])
        .select()
        .single();

      if (error) throw error;

      setSubscriptions(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Subscription added successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error adding subscription:', error);
      toast({
        title: "Error",
        description: "Failed to add subscription",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;

      setSubscriptions(prev => 
        prev.map(sub => sub.id === id ? data : sub)
      );
      
      toast({
        title: "Success",
        description: "Subscription updated successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteSubscription = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
      toast({
        title: "Success",
        description: "Subscription deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast({
        title: "Error",
        description: "Failed to delete subscription",
        variant: "destructive",
      });
    }
  };

  const updateUsage = async (id: string, usage: number) => {
    return updateSubscription(id, { current_usage: usage });
  };

  const getMonthlyTotal = () => {
    return subscriptions
      .filter(sub => sub.is_active)
      .reduce((total, sub) => {
        let monthlyAmount = sub.cost;
        
        switch (sub.billing_cycle) {
          case 'daily':
            monthlyAmount = sub.cost * 30;
            break;
          case 'weekly':
            monthlyAmount = sub.cost * 4.33;
            break;
          case 'quarterly':
            monthlyAmount = sub.cost / 3;
            break;
          case 'yearly':
            monthlyAmount = sub.cost / 12;
            break;
          default:
            monthlyAmount = sub.cost;
        }
        
        return total + monthlyAmount;
      }, 0);
  };

  const getUpcomingPayments = () => {
    return subscriptions
      .filter(sub => sub.is_active && sub.next_billing_date)
      .sort((a, b) => new Date(a.next_billing_date!).getTime() - new Date(b.next_billing_date!).getTime())
      .slice(0, 5);
  };

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  return {
    subscriptions,
    loading,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    updateUsage,
    refetch: fetchSubscriptions,
    getMonthlyTotal,
    getUpcomingPayments,
  };
};