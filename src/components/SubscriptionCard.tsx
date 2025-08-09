import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Subscription } from '@/hooks/useSubscriptions';
import { 
  Edit, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Pause,
  Play
} from 'lucide-react';
import { format } from 'date-fns';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onUpdateUsage: (id: string, usage: number) => void;
}

const getCategoryColor = (category: string) => {
  const colors = {
    entertainment: 'bg-pink-100 text-pink-800 border-pink-200',
    productivity: 'bg-blue-100 text-blue-800 border-blue-200',
    business: 'bg-green-100 text-green-800 border-green-200',
    education: 'bg-purple-100 text-purple-800 border-purple-200',
    health: 'bg-red-100 text-red-800 border-red-200',
    finance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    other: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return colors[category as keyof typeof colors] || colors.other;
};

const getBillingCycleText = (cycle: string) => {
  const texts = {
    daily: 'Daily',
    weekly: 'Weekly', 
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
  };
  return texts[cycle as keyof typeof texts] || cycle;
};

export const SubscriptionCard = ({ 
  subscription, 
  onEdit, 
  onDelete, 
  onToggleActive,
  onUpdateUsage 
}: SubscriptionCardProps) => {
  const [isUpdatingUsage, setIsUpdatingUsage] = useState(false);

  const usagePercentage = subscription.usage_limit 
    ? (subscription.current_usage / subscription.usage_limit) * 100 
    : 0;

  const handleUsageUpdate = async () => {
    setIsUpdatingUsage(true);
    const newUsage = prompt(
      `Current usage: ${subscription.current_usage}\nEnter new usage:`,
      subscription.current_usage.toString()
    );
    
    if (newUsage !== null) {
      const usage = parseInt(newUsage);
      if (!isNaN(usage) && usage >= 0) {
        await onUpdateUsage(subscription.id, usage);
      }
    }
    setIsUpdatingUsage(false);
  };

  return (
    <Card className={`transition-all hover:shadow-md ${!subscription.is_active ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {subscription.name}
              {!subscription.is_active && (
                <Badge variant="secondary" className="text-xs">Paused</Badge>
              )}
            </CardTitle>
            <Badge variant="outline" className={getCategoryColor(subscription.category)}>
              {subscription.category}
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleActive(subscription.id, !subscription.is_active)}
            >
              {subscription.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(subscription)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(subscription.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {subscription.description && (
          <p className="text-sm text-muted-foreground">{subscription.description}</p>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-semibold">
                ৳{subscription.cost.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                {getBillingCycleText(subscription.billing_cycle)}
              </p>
            </div>
          </div>
          
          {subscription.next_billing_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Next Payment</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(subscription.next_billing_date), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
          )}
        </div>

        {subscription.usage_limit && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Usage</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleUsageUpdate}
                disabled={isUpdatingUsage}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Update
              </Button>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {subscription.current_usage} of {subscription.usage_limit} used ({usagePercentage.toFixed(1)}%)
            </p>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          {subscription.provider && (
            <Badge variant="outline" className="text-xs">
              {subscription.provider}
            </Badge>
          )}
          
          {subscription.website_url && (
            <Button variant="ghost" size="sm" asChild>
              <a href={subscription.website_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                Visit
              </a>
            </Button>
          )}
        </div>
        
        {subscription.notes && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">{subscription.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};