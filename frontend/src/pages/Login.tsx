import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Loader2, ShieldCheck, Mail, Smartphone, ArrowLeft, UserCircle, Eye, EyeOff } from 'lucide-react';
import { apiService } from '@/services/api'; 

type ViewState = 'login' | 'forgot-password' | 'verify-otp' | 'reset-password';

export default function Login() {
  const [view, setView] = useState<ViewState>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- Password Visibility States ---
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // --- Forgot Password State ---
  const [recoveryMethod, setRecoveryMethod] = useState<'email' | 'mobile'>('email');
  const [contactValue, setContactValue] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // --- FORGOT PASSWORD HANDLERS ---
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const mockOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(mockOtp);
      toast({
        title: "OTP Sent!",
        description: `Code sent to your ${recoveryMethod}. (Test OTP: ${mockOtp})`
      });
      setIsLoading(false);
      setView('verify-otp');
    }, 1500);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      if (otpInput === generatedOtp) {
        toast({ title: "Success", description: "OTP Verified successfully." });
        setView('reset-password');
      } else {
        toast({ title: "Invalid OTP", description: "Incorrect code.", variant: "destructive" });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      toast({ title: "Password Reset", description: "Password changed. Please login." });
      setIsLoading(false);
      setView('login');
      setNewPassword('');
      setConfirmNewPassword('');
      setOtpInput('');
      setGeneratedOtp(null);
    }, 1500);
  };

  // --- LOGIN HANDLER ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier || !password) {
      toast({
        title: 'Error',
        description: 'Please enter both Enrollment ID and password',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      let loginEmail = identifier.trim();

      if (!loginEmail.includes('@')) {
        const result = await apiService.resolveEnrollment(loginEmail);
        
        if (!result || !result.email) {
          throw new Error('Enrollment ID not found. Please check or register first.');
        }
        loginEmail = result.email;
      }

      const user = await login(loginEmail, password);

      if (user?.role !== 'student') {
        toast({
          title: 'Access Denied',
          description: 'This is the student portal. Please use Staff Login.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Login Successful',
        description: `Welcome back, ${user?.name}!`,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER HELPERS ---
  const getCardTitle = () => {
    switch (view) {
      case 'forgot-password': return 'Forgot Password';
      case 'verify-otp': return 'Verify OTP';
      case 'reset-password': return 'Reset Password';
      default: return 'Student Login';
    }
  };

  const getCardDesc = () => {
    switch (view) {
      case 'forgot-password': return 'Recover your account access';
      case 'verify-otp': return `Enter code sent to ${recoveryMethod}`;
      case 'reset-password': return 'Create a strong new password';
      default: return 'Enter Enrollment ID to continue';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <div className="p-4">
        <img
          src="https://miaoda-conversation-file.s3cdn.medo.dev/user-845wqo7mn94w/conv-845wum9wqhog/20251210/file-852rchre4v0g.png"
          alt="DKTE Logo"
          className="h-12 w-auto object-contain"
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-3 rounded-xl shadow-lg">
                <GraduationCap className="h-8 w-8" />
              </div>
              <span className="text-3xl font-bold text-foreground">EduClera</span>
            </div>
          </div>

          <Card className="border-t-4 border-t-primary shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{getCardTitle()}</CardTitle>
                  <CardDescription>{getCardDesc()}</CardDescription>
                </div>
                {view === 'login' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/staff-access')}
                    className="text-primary hover:text-primary"
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Staff
                  </Button>
                )}
                {view !== 'login' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setView('login')}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>

              {/* --- FORGOT PASSWORD VIEWS --- */}
              {view === 'forgot-password' && (
                <form onSubmit={handleSendOTP} className="space-y-6">
                  <RadioGroup defaultValue="email" onValueChange={(v) => setRecoveryMethod(v as 'email' | 'mobile')} className="grid grid-cols-2 gap-4">
                    <div>
                      <RadioGroupItem value="email" id="email-opt" className="peer sr-only" />
                      <Label htmlFor="email-opt" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                        <Mail className="mb-2 h-6 w-6" /> Gmail
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="mobile" id="mobile-opt" className="peer sr-only" />
                      <Label htmlFor="mobile-opt" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                        <Smartphone className="mb-2 h-6 w-6" /> Mobile
                      </Label>
                    </div>
                  </RadioGroup>
                  <div className="space-y-2">
                    <Label htmlFor="contact">{recoveryMethod === 'email' ? 'Registered Email' : 'Registered Mobile'}</Label>
                    <Input id="contact" value={contactValue} onChange={(e) => setContactValue(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Send OTP"}</Button>
                </form>
              )}

              {view === 'verify-otp' && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">One-Time Password</Label>
                    <Input id="otp" className="text-center text-lg tracking-widest" maxLength={4} value={otpInput} onChange={(e) => setOtpInput(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Verifying..." : "Verify & Proceed"}</Button>
                </form>
              )}

              {view === 'reset-password' && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPass">New Password</Label>
                    <div className="relative">
                      <Input id="newPass" type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pr-10" required />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confPass">Confirm Password</Label>
                    <div className="relative">
                      <Input id="confPass" type={showConfirmNewPassword ? "text" : "password"} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="pr-10" required />
                      <button type="button" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Updating..." : "Reset Password"}</Button>
                </form>
              )}

              {/* --- LOGIN VIEW --- */}
              {view === 'login' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="identifier">Enrollment ID</Label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="identifier"
                        type="text"
                        placeholder="e.g. EN202100589"
                        className="pl-9"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Button variant="link" className="p-0 h-auto text-xs text-primary" type="button" onClick={() => setView('forgot-password')}>Forgot Password?</Button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="pr-10"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" disabled={isLoading}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authenticating...</> : 'Sign In'}
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    Don't have an account? <Link to="/register" className="text-primary hover:underline font-medium">Register here</Link>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}