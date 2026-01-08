import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Loader2, ShieldCheck, Mail, Smartphone, ArrowLeft } from 'lucide-react';

type ViewState = 'login' | 'forgot-password' | 'verify-otp' | 'reset-password';

export default function Login() {
  const [view, setView] = useState<ViewState>('login');
  // We use 'username' state to store Enrollment Number to keep compatible with AuthContext
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

    // SIMULATION: Check if user exists based on recovery contact
    setTimeout(() => {
      // In a real app, you would verify if this Email/Mobile matches the Enrollment Number
      let isValidUser = true;

      if (!isValidUser) {
        toast({
          title: "User Not Found",
          description: "The provided details do not match our records.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      const mockOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(mockOtp);
      console.log("SERVER OTP:", mockOtp);

      toast({
        title: "OTP Sent!",
        description: `We have sent a code to your ${recoveryMethod}. (Test OTP: ${mockOtp})`
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
        toast({ title: "Invalid OTP", description: "The code you entered is incorrect.", variant: "destructive" });
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
    // SIMULATION: Call API to update password
    setTimeout(() => {
      toast({ title: "Password Reset", description: "Your password has been changed successfully. Please login." });
      setIsLoading(false);
      setView('login');
      // Reset sensitive fields
      setNewPassword('');
      setConfirmNewPassword('');
      setOtpInput('');
      setGeneratedOtp(null);
    }, 1500);
  };

  // --- LOGIN HANDLER ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast({
        title: 'Error',
        // UPDATED ERROR MESSAGE
        description: 'Please enter both enrollment number and password',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const user = await login(username, password);

      if (user.role !== 'student') {
        toast({
          title: 'Access Denied',
          description: 'This is the student login portal. Please use Staff Login.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Login Successful',
        description: `Welcome back, ${user.name}!`,
      });

      navigate('/dashboard');
    } catch (error) {
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
      case 'verify-otp': return `Enter the code sent to your ${recoveryMethod}`;
      case 'reset-password': return 'Create a strong new password';
      // UPDATED DESCRIPTION
      default: return 'Enter your enrollment number to continue';
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
              <div className="bg-primary text-primary-foreground p-3 rounded-xl">
                <GraduationCap className="h-8 w-8" />
              </div>
              <span className="text-3xl font-bold text-foreground">EduClera</span>
            </div>
          </div>

          <Card>
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
                    Staff Login
                  </Button>
                )}
                {view !== 'login' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setView('login')}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>

              {/* --- VIEW 1: FORGOT PASSWORD START --- */}
              {view === 'forgot-password' && (
                <form onSubmit={handleSendOTP} className="space-y-6">
                  <RadioGroup defaultValue="email" onValueChange={(v) => setRecoveryMethod(v as 'email' | 'mobile')} className="grid grid-cols-2 gap-4">
                    <div>
                      <RadioGroupItem value="email" id="email-opt" className="peer sr-only" />
                      <Label
                        htmlFor="email-opt"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Mail className="mb-2 h-6 w-6" />
                        Gmail
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="mobile" id="mobile-opt" className="peer sr-only" />
                      <Label
                        htmlFor="mobile-opt"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Smartphone className="mb-2 h-6 w-6" />
                        Mobile
                      </Label>
                    </div>
                  </RadioGroup>

                  <div className="space-y-2">
                    <Label htmlFor="contact">
                      {recoveryMethod === 'email' ? 'Registered Email' : 'Registered Mobile'}
                    </Label>
                    <Input
                      id="contact"
                      type={recoveryMethod === 'email' ? 'email' : 'tel'}
                      placeholder={recoveryMethod === 'email' ? 'student@example.com' : '9876543210'}
                      value={contactValue}
                      onChange={(e) => setContactValue(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Send OTP"}
                  </Button>
                </form>
              )}

              {/* --- VIEW 2: VERIFY OTP --- */}
              {view === 'verify-otp' && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">One-Time Password (OTP)</Label>
                    <Input
                      id="otp"
                      placeholder="Enter 4-digit code"
                      className="text-center text-lg tracking-widest"
                      maxLength={4}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Verifying..." : "Verify & Proceed"}
                  </Button>
                </form>
              )}

              {/* --- VIEW 3: RESET PASSWORD --- */}
              {view === 'reset-password' && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPass">New Password</Label>
                    <Input id="newPass" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confPass">Confirm Password</Label>
                    <Input id="confPass" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Reset Password"}
                  </Button>
                </form>
              )}

              {/* --- VIEW 4: NORMAL LOGIN --- */}
              {view === 'login' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label> {/* Changed from Enrollment Number */}
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={username} // You can rename this state variable to 'email' if you want
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-xs text-primary"
                        type="button"
                        onClick={() => setView('forgot-password')}
                      >
                        Forgot Password?
                      </Button>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary hover:underline font-medium">
                      Register here
                    </Link>
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