import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import AdminPackageManager from '@/components/AdminPackageManager';

const Subscriptions = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect regular users to the new user subscriptions page
    if (user && !isAdmin) {
      navigate('/user-subscriptions');
    }
  }, [user, isAdmin, navigate]);

  // Show admin interface for admins only
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Redirecting to user subscriptions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <AdminPackageManager />
      </main>
    </div>
  );
};

export default Subscriptions;