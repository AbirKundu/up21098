import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface SubscriptionPackage {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billing_cycle: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  features?: any;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  package_id: string;
  status: string;
  started_at: string;
  expires_at?: string;
  credits_remaining: number;
  total_paid: number;
  created_at: string;
  updated_at: string;
  subscription_packages?: SubscriptionPackage;
}

export interface CartItem {
  id: string;
  user_id: string;
  package_id: string;
  quantity: number;
  created_at: string;
  subscription_packages?: SubscriptionPackage;
}

export const useSubscriptionPackages = () => {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_packages')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription packages",
        variant: "destructive",
      });
    }
  };

  const fetchUserSubscriptions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_packages (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      toast({
        title: "Error",
        description: "Failed to load your subscriptions",
        variant: "destructive",
      });
    }
  };

  const fetchCartItems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('shopping_cart')
        .select(`
          *,
          subscription_packages (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  const addToCart = async (packageId: string) => {
    if (!user) return null;

    try {
      // Check if item already in cart
      const existing = cartItems.find(item => item.package_id === packageId);
      if (existing) {
        toast({
          title: "Already in cart",
          description: "This package is already in your cart",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from('shopping_cart')
        .insert([{
          user_id: user.id,
          package_id: packageId,
          quantity: 1
        }])
        .select(`
          *,
          subscription_packages (*)
        `)
        .single();

      if (error) throw error;

      setCartItems(prev => [...prev, data]);
      toast({
        title: "Added to cart",
        description: "Package added to your cart successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add package to cart",
        variant: "destructive",
      });
      return null;
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const { error } = await supabase
        .from('shopping_cart')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setCartItems(prev => prev.filter(item => item.id !== cartItemId));
      toast({
        title: "Removed from cart",
        description: "Package removed from your cart",
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "Failed to remove package from cart",
        variant: "destructive",
      });
    }
  };

  const purchaseFromCart = async () => {
    if (!user || cartItems.length === 0) return false;

    try {
      // Calculate total price
      const totalPrice = cartItems.reduce((sum, item) => 
        sum + (item.subscription_packages?.price || 0), 0
      );

      // Get current active subscription for credit calculation
      const activeSubscription = userSubscriptions.find(sub => sub.status === 'active');
      const creditsToApply = activeSubscription?.credits_remaining || 0;
      const finalPrice = Math.max(0, totalPrice - creditsToApply);

      // Cancel existing active subscription if any
      if (activeSubscription) {
        await supabase
          .from('user_subscriptions')
          .update({ status: 'cancelled' })
          .eq('id', activeSubscription.id);
      }

      // Create new subscription for the first cart item (assuming single subscription model)
      const firstItem = cartItems[0];
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1); // Default to monthly

      const { data: newSubscription, error: subError } = await supabase
        .from('user_subscriptions')
        .insert([{
          user_id: user.id,
          package_id: firstItem.package_id,
          status: 'active',
          expires_at: expiresAt.toISOString(),
          credits_remaining: 0,
          total_paid: finalPrice
        }])
        .select()
        .single();

      if (subError) throw subError;

      // Clear cart
      await supabase
        .from('shopping_cart')
        .delete()
        .eq('user_id', user.id);

      setCartItems([]);
      await fetchUserSubscriptions();

      toast({
        title: "Purchase successful",
        description: `Your subscription has been activated. ${creditsToApply > 0 ? `Applied ৳${creditsToApply} in credits.` : ''}`,
      });

      return true;
    } catch (error) {
      console.error('Error purchasing subscription:', error);
      toast({
        title: "Error",
        description: "Failed to complete purchase",
        variant: "destructive",
      });
      return false;
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    try {
      // Calculate remaining credits based on unused time
      const subscription = userSubscriptions.find(sub => sub.id === subscriptionId);
      if (!subscription) return false;

      const now = new Date();
      const expiresAt = new Date(subscription.expires_at || now);
      const totalDays = Math.floor((expiresAt.getTime() - new Date(subscription.started_at).getTime()) / (1000 * 60 * 60 * 24));
      const remainingDays = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      const dailyValue = subscription.total_paid / totalDays;
      const creditsRemaining = Math.max(0, remainingDays * dailyValue);

      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'cancelled',
          credits_remaining: creditsRemaining
        })
        .eq('id', subscriptionId);

      if (error) throw error;

      await fetchUserSubscriptions();
      toast({
        title: "Subscription cancelled",
        description: `Your subscription has been cancelled. ৳${creditsRemaining.toFixed(2)} in credits will be applied to your next purchase.`,
      });

      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchPackages();
      if (user) {
        await Promise.all([fetchUserSubscriptions(), fetchCartItems()]);
      }
      setLoading(false);
    };

    loadData();
  }, [user]);

  return {
    packages,
    userSubscriptions,
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    purchaseFromCart,
    cancelSubscription,
    refetch: () => {
      fetchPackages();
      if (user) {
        fetchUserSubscriptions();
        fetchCartItems();
      }
    }
  };
};