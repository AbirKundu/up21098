import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Subscription } from '@/hooks/useSubscriptions';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminSubscriptionManagerProps {
  subscriptions: Subscription[];
  onCreatePackage: (packageData: any) => void;
  onUpdatePackage: (id: string, packageData: any) => void;
  onDeletePackage: (id: string) => void;
}

interface SubscriptionPackage {
  id?: string;
  name: string;
  description: string;
  cost: number;
  billing_cycle: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  category: 'entertainment' | 'productivity' | 'business' | 'education' | 'health' | 'finance' | 'other';
  provider: string;
  usage_limit: number;
  features: string[];
}

export const AdminSubscriptionManager = ({ 
  subscriptions, 
  onCreatePackage, 
  onUpdatePackage, 
  onDeletePackage 
}: AdminSubscriptionManagerProps) => {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Subscription | null>(null);
  const [packageForm, setPackageForm] = useState<SubscriptionPackage>({
    name: '',
    description: '',
    cost: 0,
    billing_cycle: 'monthly',
    category: 'other',
    provider: '',
    usage_limit: 0,
    features: []
  });

  const resetForm = () => {
    setPackageForm({
      name: '',
      description: '',
      cost: 0,
      billing_cycle: 'monthly',
      category: 'other',
      provider: '',
      usage_limit: 0,
      features: []
    });
  };

  const handleCreatePackage = async () => {
    try {
      await onCreatePackage({
        ...packageForm,
        currency: 'BDT',
        auto_renewal: true,
        is_active: true,
        current_usage: 0
      });
      
      toast({
        title: "Success",
        description: "Subscription package created successfully",
      });
      
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create subscription package",
        variant: "destructive",
      });
    }
  };

  const handleEditPackage = (subscription: Subscription) => {
    setEditingPackage(subscription);
    setPackageForm({
      name: subscription.name,
      description: subscription.description || '',
      cost: subscription.cost,
      billing_cycle: subscription.billing_cycle,
      category: subscription.category,
      provider: subscription.provider || '',
      usage_limit: subscription.usage_limit || 0,
      features: []
    });
  };

  const handleUpdatePackage = async () => {
    if (!editingPackage) return;
    
    try {
      await onUpdatePackage(editingPackage.id, packageForm);
      
      toast({
        title: "Success",
        description: "Subscription package updated successfully",
      });
      
      setEditingPackage(null);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subscription package",
        variant: "destructive",
      });
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (confirm('Are you sure you want to delete this subscription package?')) {
      try {
        await onDeletePackage(id);
        toast({
          title: "Success",
          description: "Subscription package deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete subscription package",
          variant: "destructive",
        });
      }
    }
  };

  const PackageForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Package Name</Label>
          <Input
            id="name"
            value={packageForm.name}
            onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
            placeholder="e.g., Netflix Premium"
          />
        </div>
        <div>
          <Label htmlFor="provider">Provider</Label>
          <Input
            id="provider"
            value={packageForm.provider}
            onChange={(e) => setPackageForm({ ...packageForm, provider: e.target.value })}
            placeholder="e.g., Netflix"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={packageForm.description}
          onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
          placeholder="Package description"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="cost">Cost (BDT)</Label>
          <Input
            id="cost"
            type="number"
            value={packageForm.cost}
            onChange={(e) => setPackageForm({ ...packageForm, cost: parseFloat(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="billing_cycle">Billing Cycle</Label>
          <Select 
            value={packageForm.billing_cycle} 
            onValueChange={(value: any) => setPackageForm({ ...packageForm, billing_cycle: value })}
          >
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
        <div>
          <Label htmlFor="usage_limit">Usage Limit</Label>
          <Input
            id="usage_limit"
            type="number"
            value={packageForm.usage_limit}
            onChange={(e) => setPackageForm({ ...packageForm, usage_limit: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select 
          value={packageForm.category} 
          onValueChange={(value: any) => setPackageForm({ ...packageForm, category: value })}
        >
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
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Admin: Subscription Packages</h2>
          <p className="text-muted-foreground">Manage subscription packages for users</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Subscription Package</DialogTitle>
            </DialogHeader>
            <PackageForm />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePackage}>
                Create Package
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subscriptions.map((subscription) => (
          <Card key={subscription.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{subscription.name}</CardTitle>
                  <Badge variant="outline" className="mt-1">
                    {subscription.category}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditPackage(subscription)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePackage(subscription.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{subscription.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">৳{subscription.cost.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground">{subscription.billing_cycle}</span>
                </div>
                {subscription.usage_limit && (
                  <p className="text-xs text-muted-foreground">
                    Usage Limit: {subscription.usage_limit}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Package Dialog */}
      <Dialog open={!!editingPackage} onOpenChange={() => setEditingPackage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Subscription Package</DialogTitle>
          </DialogHeader>
          <PackageForm />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingPackage(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePackage}>
              Update Package
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};