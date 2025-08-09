import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { CreditCard, Settings, TrendingUp } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { SubscriptionQuickStats } from '@/components/SubscriptionQuickStats';
import { AdminUserSubscriptionReview } from '@/components/AdminUserSubscriptionReview';

const Index = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to SubManager</h1>
          <p className="text-xl text-muted-foreground">
            Manage all your subscriptions in one place
          </p>
        </div>

        {/* Show user subscription stats for regular users */}
        {!isAdmin && (
          <div className="mb-8">
            <SubscriptionQuickStats />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                {isAdmin ? 'Admin Subscription' : 'Subscriptions'}
              </CardTitle>
              <CardDescription>
                {isAdmin ? 'Manage subscription packages' : 'Manage your active subscriptions'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {isAdmin ? 'Create and manage subscription packages for users to purchase.' : 'View and manage all your subscriptions in one place.'}
              </p>
              <Button className="w-full" onClick={() => navigate(isAdmin ? '/subscriptions' : '/user-subscriptions')}>
                {isAdmin ? 'Manage Packages' : 'View Subscriptions'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Update your profile and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your account settings and notification preferences.
              </p>
              <Button variant="outline" className="w-full" onClick={() => navigate('/profile')}>Edit Profile</Button>
            </CardContent>
          </Card>
        </div>

        {/* Show admin user subscription review for admins */}
        {isAdmin && (
          <div className="mb-8">
            <AdminUserSubscriptionReview />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
