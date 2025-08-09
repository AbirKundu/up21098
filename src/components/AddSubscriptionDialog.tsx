import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useSubscriptions, Subscription } from '@/hooks/useSubscriptions';
import { Plus, Calendar } from 'lucide-react';

interface AddSubscriptionDialogProps {
  editingSubscription?: Subscription | null;
  onEditComplete?: () => void;
}

export const AddSubscriptionDialog = ({ editingSubscription, onEditComplete }: AddSubscriptionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addSubscription, updateSubscription } = useSubscriptions();

  const [formData, setFormData] = useState({
    name: editingSubscription?.name || '',
    description: editingSubscription?.description || '',
    cost: editingSubscription?.cost?.toString() || '',
    currency: editingSubscription?.currency || 'BDT',
    billing_cycle: editingSubscription?.billing_cycle || 'monthly',
    category: editingSubscription?.category || 'other',
    provider: editingSubscription?.provider || '',
    next_billing_date: editingSubscription?.next_billing_date || '',
    auto_renewal: editingSubscription?.auto_renewal ?? true,
    usage_limit: editingSubscription?.usage_limit?.toString() || '',
    current_usage: editingSubscription?.current_usage?.toString() || '0',
    website_url: editingSubscription?.website_url || '',
    notes: editingSubscription?.notes || '',
    is_active: editingSubscription?.is_active ?? true,
  });

  const resetForm = () => {
    if (!editingSubscription) {
      setFormData({
        name: '',
        description: '',
        cost: '',
        currency: 'BDT',
        billing_cycle: 'monthly',
        category: 'other',
        provider: '',
        next_billing_date: '',
        auto_renewal: true,
        usage_limit: '',
        current_usage: '0',
        website_url: '',
        notes: '',
        is_active: true,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const subscriptionData = {
        name: formData.name,
        description: formData.description || undefined,
        cost: parseFloat(formData.cost),
        currency: formData.currency,
        billing_cycle: formData.billing_cycle as any,
        category: formData.category as any,
        provider: formData.provider || undefined,
        next_billing_date: formData.next_billing_date || undefined,
        auto_renewal: formData.auto_renewal,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : undefined,
        current_usage: parseInt(formData.current_usage) || 0,
        website_url: formData.website_url || undefined,
        notes: formData.notes || undefined,
        is_active: formData.is_active,
      };

      if (editingSubscription) {
        await updateSubscription(editingSubscription.id, subscriptionData);
        onEditComplete?.();
      } else {
        await addSubscription(subscriptionData);
        resetForm();
      }
      
      setOpen(false);
    } catch (error) {
      console.error('Error saving subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-calculate next billing date based on today and billing cycle
  const calculateNextBillingDate = () => {
    const today = new Date();
    let nextDate = new Date(today);
    
    switch (formData.billing_cycle) {
      case 'daily':
        nextDate.setDate(today.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(today.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(today.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(today.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(today.getFullYear() + 1);
        break;
    }
    
    setFormData(prev => ({
      ...prev,
      next_billing_date: nextDate.toISOString().split('T')[0]
    }));
  };

  return (
    <Dialog open={open || !!editingSubscription} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {!editingSubscription && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Subscription
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingSubscription ? 'Edit Subscription' : 'Add New Subscription'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Netflix, Spotify, etc."
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Input
                id="provider"
                value={formData.provider}
                onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                placeholder="Company name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the service"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Cost *</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                placeholder="9.99"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BDT">BDT (৳)</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="billing_cycle">Billing Cycle *</Label>
              <Select value={formData.billing_cycle} onValueChange={(value) => setFormData(prev => ({ ...prev, billing_cycle: value as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as 'entertainment' | 'productivity' | 'business' | 'education' | 'health' | 'finance' | 'other' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="productivity">Productivity</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="next_billing_date" className="flex items-center gap-2">
                Next Billing Date
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm"
                  onClick={calculateNextBillingDate}
                >
                  <Calendar className="h-3 w-3" />
                  Auto-fill
                </Button>
              </Label>
              <Input
                id="next_billing_date"
                type="date"
                value={formData.next_billing_date}
                onChange={(e) => setFormData(prev => ({ ...prev, next_billing_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="usage_limit">Usage Limit (optional)</Label>
              <Input
                id="usage_limit"
                type="number"
                value={formData.usage_limit}
                onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: e.target.value }))}
                placeholder="e.g., 100 GB, 1000 API calls"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="current_usage">Current Usage</Label>
              <Input
                id="current_usage"
                type="number"
                value={formData.current_usage}
                onChange={(e) => setFormData(prev => ({ ...prev, current_usage: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website_url">Website URL</Label>
            <Input
              id="website_url"
              type="url"
              value={formData.website_url}
              onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes or reminders"
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto_renewal"
                checked={formData.auto_renewal}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_renewal: checked }))}
              />
              <Label htmlFor="auto_renewal">Auto-renewal enabled</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Active subscription</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => {
              setOpen(false);
              onEditComplete?.();
            }}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (editingSubscription ? 'Update' : 'Add')} Subscription
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};