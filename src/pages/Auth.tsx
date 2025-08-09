import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, User, Mail, Shield } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLoginType, setSelectedLoginType] = useState<'user' | 'admin'>('user');
  const [buttonPressed, setButtonPressed] = useState<'user' | 'admin' | null>(null);
  
  const { signIn, signUp, user, isAdmin, userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLoginTypeSelect = (type: 'user' | 'admin') => {
    setSelectedLoginType(type);
    setButtonPressed(type);
    
    // Brief glow effect
    setTimeout(() => setButtonPressed(null), 150);
    
    // Pre-fill admin email if admin login is selected
    if (type === 'admin') {
      setEmail('abircse22@gmail.com');
    } else {
      setEmail('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: "Login Failed",
              description: "Invalid email or password. Please check your credentials.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Login Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Welcome back!",
            description: `You have successfully logged in${selectedLoginType === 'admin' ? ' as admin' : ''}.`,
          });
        }
      } else {
        const { error } = await signUp(email, password, username, fullName);
        if (error) {
          if (error.message.includes('User already registered')) {
            toast({
              title: "Account Exists",
              description: "An account with this email already exists. Please try logging in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Signup Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Account Created!",
            description: "Please check your email to verify your account.",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Subscription Manager</CardTitle>
          <CardDescription>
            {isLogin ? 'Welcome back! Sign in to your account.' : 'Create your account to get started.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isLogin ? 'login' : 'signup'} onValueChange={(value) => setIsLogin(value === 'login')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card 
                    className={`border-2 transition-all duration-300 cursor-pointer transform ${
                      selectedLoginType === 'user' 
                        ? 'border-user bg-user/10 shadow-lg shadow-user/20' 
                        : 'border-user/30 hover:border-user/60 hover:shadow-md hover:shadow-user/10'
                    } ${
                      buttonPressed === 'user' 
                        ? 'animate-user-glow-pulse scale-105' 
                        : 'hover:scale-105'
                    }`}
                    onClick={() => handleLoginTypeSelect('user')}
                  >
                    <CardContent className="p-4 text-center">
                      <User className={`h-8 w-8 mx-auto mb-2 transition-colors ${
                        selectedLoginType === 'user' ? 'text-user' : 'text-muted-foreground'
                      }`} />
                      <h3 className={`font-semibold transition-colors ${
                        selectedLoginType === 'user' ? 'text-user' : 'text-foreground'
                      }`}>User Login</h3>
                      <p className="text-xs text-muted-foreground">Standard access</p>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`border-2 transition-all duration-300 cursor-pointer transform ${
                      selectedLoginType === 'admin' 
                        ? 'border-admin bg-admin/10 shadow-lg shadow-admin/20' 
                        : 'border-admin/30 hover:border-admin/60 hover:shadow-md hover:shadow-admin/10'
                    } ${
                      buttonPressed === 'admin' 
                        ? 'animate-glow-pulse scale-105' 
                        : 'hover:scale-105'
                    }`}
                    onClick={() => handleLoginTypeSelect('admin')}
                  >
                    <CardContent className="p-4 text-center">
                      <Shield className={`h-8 w-8 mx-auto mb-2 transition-colors ${
                        selectedLoginType === 'admin' ? 'text-admin' : 'text-muted-foreground'
                      }`} />
                      <h3 className={`font-semibold transition-colors ${
                        selectedLoginType === 'admin' ? 'text-admin' : 'text-foreground'
                      }`}>Admin Login</h3>
                      <p className="text-xs text-muted-foreground">Full access</p>
                    </CardContent>
                  </Card>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                
                  <Button 
                    type="submit" 
                    className={`w-full transition-all duration-300 ${
                      selectedLoginType === 'admin' 
                        ? 'bg-admin hover:bg-admin/90 text-admin-foreground hover:shadow-lg hover:shadow-admin/30 active:scale-95' 
                        : 'bg-user hover:bg-user/90 text-user-foreground hover:shadow-lg hover:shadow-user/30 active:scale-95'
                    }`}
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : `Sign In${selectedLoginType === 'admin' ? ' as Admin' : ''}`}
                  </Button>
                </form>
              </div>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-user hover:bg-user/90 text-user-foreground hover:shadow-lg hover:shadow-user/30 active:scale-95 transition-all duration-300" 
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
