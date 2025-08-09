import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdminUserSubscriptions } from '@/hooks/useAdminUserSubscriptions';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Package, 
  RefreshCw,
  Eye,
  CreditCard 
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState } from 'react';

export const AdminUserSubscriptionReview = () => {
  const { subscriptions, revenueStats, loading, refetch } = useAdminUserSubscriptions();
  const [expandedView, setExpandedView] = useState(false);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Subscription Review
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

  const formatCurrency = (amount: number) => `৳${amount.toLocaleString('en-BD')}`;

  const getStatusColor = (status: string, expiryDate: string) => {
    if (status === 'active' && new Date(expiryDate) > new Date()) {
      return 'default';
    } else if (status === 'expired' || new Date(expiryDate) <= new Date()) {
      return 'destructive';
    } else if (status === 'cancelled') {
      return 'secondary';
    }
    return 'outline';
  };

  const recentSubscriptions = subscriptions.slice(0, expandedView ? subscriptions.length : 5);

  return (
    <div className="space-y-6">
      {/* Revenue Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(revenueStats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(revenueStats.monthlyRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
                <p className="text-2xl font-bold">{revenueStats.activeSubscriptions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{revenueStats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Subscriptions Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Subscription Review
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpandedView(!expandedView)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {expandedView ? 'Show Less' : 'View All'}
              </Button>
              <Button variant="outline" size="sm" onClick={refetch}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No subscription data found</h3>
              <p className="text-muted-foreground">Users haven't purchased any subscriptions yet.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Purchase Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {subscription.user_profile?.full_name || subscription.user_profile?.username || 'Unknown User'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {subscription.user_profile?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{subscription.package_name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{subscription.plan_duration}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4 text-green-600" />
                          {formatCurrency(subscription.price)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{subscription.credits_remaining.toFixed(0)} / {subscription.credits_purchased.toFixed(0)}</p>
                          <p className="text-muted-foreground">remaining / total</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-orange-600" />
                          {new Date(subscription.expiry_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(subscription.status, subscription.expiry_date)}>
                          {subscription.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(subscription.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};