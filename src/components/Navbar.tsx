import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, CreditCard, User, LogOut, Settings, Shield } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Badge } from '@/components/ui/badge';

export const Navbar = () => {
  const { user, signOut, isAdmin, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">SubManager</span>
            </div>
          </div>

          {/* Navigation Links */}
          {user && (
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </div>
          )}

          {/* User Section */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">{user.email}</p>
                    <div className="flex items-center gap-1">
                      {isAdmin ? (
                        <Badge variant="destructive" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <User className="h-3 w-3 mr-1" />
                          User
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {user && (
          <div className="md:hidden mt-4 flex space-x-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? "default" : "outline"}
                size="sm"
                onClick={() => navigate(item.path)}
                className="flex items-center gap-2 flex-1"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};