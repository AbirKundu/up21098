import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import { useSubscriptionHistory } from '@/hooks/useSubscriptionHistory';
import { Navbar } from '@/components/Navbar';
import { SubscriptionQuickStats } from '@/components/SubscriptionQuickStats';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, CreditCard, Package, Calendar, Trash2, CheckCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const UserSubscriptions = () => {
  const { user } = useAuth();
  const { packages, loading: packagesLoading } = useSubscriptionPackages();
  const { 
    activeSubscriptions, 
    subscriptions, 
    planDurations, 
    calculateProratedPrice, 
    purchaseSubscription, 
    cancelSubscription,
    loading: historyLoading 
  } = useSubscriptionHistory();
  
  const [purchasing, setPurchasing] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<{[key: string]: string}>({});

  const loading = packagesLoading || historyLoading;

  const handlePurchase = async (packageId: string, packageName: string, basePrice: number, duration: string) => {
    setPurchasing(true);
    await purchaseSubscription(packageId, packageName, basePrice, duration);
    setPurchasing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading subscriptions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Subscription Store</h1>
          <p className="text-muted-foreground">Browse and purchase subscription packages</p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <SubscriptionQuickStats />
        </div>

        {/* Available Packages */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Package className="h-6 w-6" />
            Available Packages
          </h2>
          
          {packages.length === 0 ? (
            <Alert>
              <AlertDescription>
                No subscription packages are currently available. Please check back later.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => {
                const hasActiveSubscription = activeSubscriptions.some(sub => sub.package_id === pkg.id);
                const currentDuration = selectedDuration[pkg.id] || 'monthly';
                const proratedPrice = calculateProratedPrice(Number(pkg.price), currentDuration);
                
                return (
                  <Card key={pkg.id} className={`h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                    hasActiveSubscription 
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
                      : 'border-border hover:border-primary/40 hover:shadow-primary/10'
                  }`}>
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            {pkg.name}
                            {hasActiveSubscription && (
                              <Badge className="bg-primary text-primary-foreground">Active</Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">{pkg.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-4">
                        {/* Plan Duration Selection */}
                        <div className="space-y-2">
                          <p className="text-sm font-semibold">Select Duration:</p>
                          <div className="grid grid-cols-3 gap-2">
                            {planDurations.map((duration) => (
                              <Button
                                key={duration.key}
                                variant={selectedDuration[pkg.id] === duration.key ? "default" : "outline"}
                                size="sm"
                                className="text-xs"
                                onClick={() => setSelectedDuration(prev => ({
                                  ...prev,
                                  [pkg.id]: duration.key
                                }))}
                              >
                                {duration.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Price Display */}
                        <div className="text-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                          <div className="text-3xl font-bold text-primary">
                            ৳{proratedPrice.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {currentDuration === 'weekly' ? 'for 7 days' : 
                             currentDuration === '15-day' ? 'for 15 days' : 
                             'per month'}
                          </div>
                          {currentDuration !== 'monthly' && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Base price: ৳{pkg.price}/month
                            </div>
                          )}
                        </div>
                        
                        {pkg.features && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-foreground">Features included:</p>
                            <ul className="text-sm space-y-1">
                              {Array.isArray(pkg.features) ? pkg.features.map((feature: string, index: number) => (
                                <li key={index} className="flex items-center gap-2 text-muted-foreground">
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                  {feature}
                                </li>
                              )) : (
                                <li className="flex items-center gap-2 text-muted-foreground">
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                  {pkg.features}
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={() => handlePurchase(pkg.id, pkg.name, Number(pkg.price), currentDuration)}
                        disabled={purchasing}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        {purchasing ? 'Processing...' : `Purchase ${currentDuration === 'weekly' ? '7-Day' : currentDuration === '15-day' ? '15-Day' : 'Monthly'} Plan`}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Subscriptions */}
        {activeSubscriptions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              Active Subscriptions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSubscriptions.map((subscription) => (
                <Card key={subscription.id} className="border-green-200 bg-green-50 dark:bg-green-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-green-700 dark:text-green-400">
                      <span>{subscription.package_name}</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {subscription.plan_duration}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Credits Remaining:</span>
                        <span className="font-semibold">৳{subscription.credits_remaining.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Expires:</span>
                        <span className="font-semibold">{formatDate(subscription.expiry_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Price Paid:</span>
                        <span className="font-semibold">৳{subscription.price}</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-4"
                      onClick={() => cancelSubscription(subscription.id)}
                    >
                      Cancel Subscription
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Subscription History */}
        {subscriptions.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Subscription History
            </h2>
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <Card key={subscription.id}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Package</p>
                        <p className="font-semibold">{subscription.package_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <Badge variant="outline">{subscription.plan_duration}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                          {subscription.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Started</p>
                        <p className="font-semibold">{formatDate(subscription.start_date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Price Paid</p>
                        <p className="font-semibold">৳{subscription.price}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSubscriptions;