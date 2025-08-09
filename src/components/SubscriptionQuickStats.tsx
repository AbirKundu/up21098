import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscriptionHistory } from '@/hooks/useSubscriptionHistory';
import { Calendar, CreditCard, Package, Clock } from 'lucide-react';

export const SubscriptionQuickStats = () => {
  const { activeSubscriptions, loading } = useSubscriptionHistory();

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Your Subscription Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeSubscriptions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Your Subscription Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No active subscriptions found. Browse our packages to get started!</p>
        </CardContent>
      </Card>
    );
  }

  const totalCredits = activeSubscriptions.reduce((sum, sub) => sum + sub.credits_remaining, 0);
  const nextExpiry = activeSubscriptions.reduce((earliest, sub) => {
    const subExpiry = new Date(sub.expiry_date);
    return earliest === null || subExpiry < earliest ? subExpiry : earliest;
  }, null as Date | null);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Your Subscription Review
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Active Plans</p>
              <p className="text-2xl font-bold">{activeSubscriptions.length}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium">Total Credits</p>
              <p className="text-2xl font-bold">{totalCredits.toFixed(0)} BDT</p>
            </div>
          </div>
          
          {nextExpiry && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Next Expiry</p>
                <p className="text-sm font-semibold">{nextExpiry.toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Active Subscriptions
          </h4>
          
          {activeSubscriptions.map((subscription) => (
            <div key={subscription.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <h5 className="font-medium">{subscription.package_name}</h5>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{subscription.plan_duration}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {subscription.price} {subscription.currency}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-medium">
                  Credits: {subscription.credits_remaining.toFixed(0)} BDT
                </p>
                <p className="text-xs text-muted-foreground">
                  Expires: {new Date(subscription.expiry_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};