import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, User, Mail, Lock, Sparkles, Zap } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthFormProps {
  onSuccess?: () => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentTab, setCurrentTab] = useState('login');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsFormVisible(true);
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.firstName}!`,
      });
      
      // Invalidate user query to refetch user data
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
      
      // Redirect to main app
      window.location.href = '/';
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; firstName: string; lastName: string }) => {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "Your account has been created. Please log in.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    loginMutation.mutate({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    registerMutation.mutate({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
    });
  };

  return (
    <>
      {/* Parallax Background with Gemini Effects */}
      <div className="fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(148, 163, 184, 0.1), rgba(251, 191, 36, 0.1))",
              "linear-gradient(315deg, rgba(148, 163, 184, 0.1), rgba(251, 191, 36, 0.1), rgba(148, 163, 184, 0.1))",
              "linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(148, 163, 184, 0.1), rgba(251, 191, 36, 0.1))"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        
        {/* Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/40 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: window.innerHeight + 20,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{
              y: -20,
              x: Math.random() * window.innerWidth,
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
        
        {/* Gemini Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [-10, 10, -10],
            y: [-10, 10, -10],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
            x: [10, -10, 10],
            y: [10, -10, 10],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      <div className="min-h-screen relative z-10 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ 
            opacity: isFormVisible ? 1 : 0, 
            scale: isFormVisible ? 1 : 0.9,
            y: isFormVisible ? 0 : 50 
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Card className="w-full max-w-md bg-white/80 backdrop-blur-xl border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden group">
            {/* Gemini Border Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-amber-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-[1px] bg-white/10 rounded-lg" />
            
            <CardHeader className="text-center relative z-10">
              <motion.div 
                className="inline-flex items-center justify-center mb-4"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.svg 
                  width="60" 
                  height="60" 
                  viewBox="0 0 100 100"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1e40af" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#60a5fa" />
                    </linearGradient>
                    <linearGradient id="metallicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fefce8" />
                      <stop offset="50%" stopColor="#f3f4f6" />
                      <stop offset="100%" stopColor="#e5e7eb" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="45" fill="url(#metallicGradient)" stroke="#d1d5db" strokeWidth="2"/>
                  <circle cx="50" cy="50" r="35" fill="url(#logoGradient)"/>
                  <g fill="white" transform="translate(50,50)">
                    <rect x="-12" y="-15" width="4" height="30"/>
                    <rect x="-8" y="-3" width="15" height="3" transform="rotate(-30)"/>
                    <rect x="-8" y="0" width="15" height="3" transform="rotate(30)"/>
                  </g>
                </motion.svg>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </motion.div>
                  Kofuku Room Booking
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  >
                    <Zap className="w-6 h-6 text-amber-600" />
                  </motion.div>
                </CardTitle>
              </motion.div>
            </CardHeader>
            
            <CardContent className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Tabs 
                  value={currentTab} 
                  onValueChange={setCurrentTab} 
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/20 backdrop-blur-sm">
                    <TabsTrigger 
                      value="login" 
                      className="data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300"
                    >
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger 
                      value="register"
                      className="data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300"
                    >
                      Sign Up
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Login Form */}
                  <AnimatePresence mode="wait">
                    <TabsContent value="login" key="login">
                      <motion.form 
                        onSubmit={handleLogin} 
                        className="space-y-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div 
                          className="space-y-2"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <Label htmlFor="login-email">Email</Label>
                          <div className="relative group">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-600 transition-colors group-focus-within:text-blue-700" />
                            </motion.div>
                            <Input
                              id="login-email"
                              name="email"
                              type="email"
                              placeholder="Enter your email"
                              className="pl-10 bg-white/60 border-gray-300 focus:bg-white/80 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 focus:scale-105"
                              required
                            />
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          className="space-y-2"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Label htmlFor="login-password">Password</Label>
                          <div className="relative group">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-600 transition-colors group-focus-within:text-blue-700" />
                            </motion.div>
                            <Input
                              id="login-password"
                              name="password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your password"
                              className="pl-10 pr-10 bg-white/60 border-gray-300 focus:bg-white/80 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 focus:scale-105"
                              required
                            />
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <Eye className="h-4 w-4 text-blue-600" />
                                )}
                              </Button>
                            </motion.div>
                          </div>
                        </motion.div>
                        
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 hover:from-blue-700 hover:via-purple-700 hover:to-blue-900 transition-all duration-500 shadow-lg hover:shadow-xl relative overflow-hidden group"
                            disabled={loginMutation.isPending}
                          >
                            {/* Button Shimmer Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            
                            <span className="relative z-10">
                              {loginMutation.isPending ? (
                                <motion.span
                                  animate={{ opacity: [1, 0.5, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                >
                                  Signing In...
                                </motion.span>
                              ) : (
                                'Sign In'
                              )}
                            </span>
                          </Button>
                        </motion.div>
                      </motion.form>
                    </TabsContent>
                    
                    {/* Register Form */}
                    <TabsContent value="register" key="register">
                      <motion.form 
                        onSubmit={handleRegister} 
                        className="space-y-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div 
                          className="grid grid-cols-2 gap-4"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <div className="relative group">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <User className="absolute left-3 top-3 h-4 w-4 text-blue-600 transition-colors group-focus-within:text-blue-700" />
                              </motion.div>
                              <Input
                                id="firstName"
                                name="firstName"
                                placeholder="First name"
                                className="pl-10 bg-white/60 border-gray-300 focus:bg-white/80 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 focus:scale-105"
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <div className="relative group">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <User className="absolute left-3 top-3 h-4 w-4 text-blue-600 transition-colors group-focus-within:text-blue-700" />
                              </motion.div>
                              <Input
                                id="lastName"
                                name="lastName"
                                placeholder="Last name"
                                className="pl-10 bg-white/60 border-gray-300 focus:bg-white/80 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 focus:scale-105"
                                required
                              />
                            </div>
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          className="space-y-2"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Label htmlFor="register-email">Email</Label>
                          <div className="relative group">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-600 transition-colors group-focus-within:text-blue-700" />
                            </motion.div>
                            <Input
                              id="register-email"
                              name="email"
                              type="email"
                              placeholder="Enter your email"
                              className="pl-10 bg-white/60 border-gray-300 focus:bg-white/80 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 focus:scale-105"
                              required
                            />
                          </div>
                          <motion.p 
                            className="text-xs text-blue-600"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            Use <strong>shlokebinani@gmail.com</strong> for admin access
                          </motion.p>
                        </motion.div>
                        
                        <motion.div 
                          className="space-y-2"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <Label htmlFor="register-password">Password</Label>
                          <div className="relative group">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-600 transition-colors group-focus-within:text-blue-700" />
                            </motion.div>
                            <Input
                              id="register-password"
                              name="password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Create a password"
                              className="pl-10 pr-10 bg-white/60 border-gray-300 focus:bg-white/80 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 focus:scale-105"
                              minLength={6}
                              required
                            />
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <Eye className="h-4 w-4 text-blue-600" />
                                )}
                              </Button>
                            </motion.div>
                          </div>
                        </motion.div>
                        
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 hover:from-blue-700 hover:via-purple-700 hover:to-blue-900 transition-all duration-500 shadow-lg hover:shadow-xl relative overflow-hidden group"
                            disabled={registerMutation.isPending}
                          >
                            {/* Button Shimmer Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            
                            <span className="relative z-10">
                              {registerMutation.isPending ? (
                                <motion.span
                                  animate={{ opacity: [1, 0.5, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                >
                                  Creating Account...
                                </motion.span>
                              ) : (
                                'Create Account'
                              )}
                            </span>
                          </Button>
                        </motion.div>
                      </motion.form>
                    </TabsContent>
                  </AnimatePresence>
                </Tabs>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}