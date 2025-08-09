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

export const useAdminPackages = () => {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_packages')
        .select('*')
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
    } finally {
      setLoading(false);
    }
  };

  const createPackage = async (packageData: Omit<SubscriptionPackage, 'id' | 'created_by' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('subscription_packages')
        .insert([{
          ...packageData,
          created_by: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      setPackages(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Subscription package created successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error creating package:', error);
      toast({
        title: "Error",
        description: "Failed to create subscription package",
        variant: "destructive",
      });
      return null;
    }
  };

  const updatePackage = async (id: string, updates: Partial<SubscriptionPackage>) => {
    try {
      const { data, error } = await supabase
        .from('subscription_packages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPackages(prev => 
        prev.map(pkg => pkg.id === id ? data : pkg)
      );
      
      toast({
        title: "Success",
        description: "Subscription package updated successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating package:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription package",
        variant: "destructive",
      });
      return null;
    }
  };

  const deletePackage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subscription_packages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPackages(prev => prev.filter(pkg => pkg.id !== id));
      toast({
        title: "Success",
        description: "Subscription package deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        title: "Error",
        description: "Failed to delete subscription package",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchPackages();
    }
  }, [user]);

  return {
    packages,
    loading,
    createPackage,
    updatePackage,
    deletePackage,
    refetch: fetchPackages,
  };
};