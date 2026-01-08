import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { clearanceWorkflow } from '@/services/storage';
import type { UserRole } from '@/types';

type ViewState = 'login' | 'register' | 'forgot-password' | 'verify-otp' | 'reset-password';

export default function StaffLogin() {
  const { role } = useParams<{ role: string }>();
  const [view, setView] = useState<ViewState>('login');
  const [isLoading, setIsLoading] = useState(false);
  
  // --- Departments State ---
  const [departmentList, setDepartmentList] = useState<string[]>([]);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // --- Registration State ---
  const [formData, setFormData] = useState({
    fullName: '',
    department: '', // <--- This will store the selected department
    birthDate: '',
    joiningDate: '',
    regUsername: '',
    email: '',
    regPassword: '',
    confirmPassword: ''
  });

  const roleTitle = clearanceWorkflow.getDepartmentLabel(role as UserRole);
  const isAcademicRole = role === 'teacher' || role === 'hod';
  
  // Logic: Allow registration for everyone EXCEPT Admin
  const isRegistrationAllowed = role !== 'admin';

  // --- CRITICAL: Load Departments from Admin's LocalStorage ---
  useEffect(() => {
    // 1. Try to get the list Admin created
    const savedDepts = localStorage.getItem('manage_departments');
    
    if (savedDepts) {
      console.log("Loaded Admin Departments:", savedDepts); // Debugging
      setDepartmentList(JSON.parse(savedDepts));
    } else {
      // 2. Fallback if Admin hasn't created any yet
      setDepartmentList(["Computer Science", "Information Technology", "Mechanical"]);
    }
  }, []);

  // --- HANDLERS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, department: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (view === 'register') {
        if (formData.regPassword !== formData.confirmPassword) throw new Error("Passwords do not match");
        
        // Validation: Teacher/HOD MUST select a department
        if (isAcademicRole && !formData.department) throw new Error("Please select your Academic Department");

        const newUser = {
          email: formData.email,
          password: formData.regPassword,
          name: formData.fullName,
          username: formData.regUsername,
          role: role as UserRole,
          department: formData.department, // <--- Saves the department to MongoDB
          birthDate: formData.birthDate,
          joiningDate: formData.joiningDate
        };

        await register(newUser);
        
        toast({ title: 'Account Created', description: `Registered as ${roleTitle} for ${formData.department}` });
        
        if (newUser.role === 'admin') navigate('/admin/dashboard');
        else if (newUser.role === 'hod') navigate('/hod/dashboard');
        else navigate('/department/dashboard');

      } else {
        // Login Logic
        if (!username || !password) throw new Error('Please enter credentials');
        const user = await login(username, password);
        toast({ title: 'Login Successful', description: `Welcome back, ${user.name}!` });
        
        if (user.role === 'admin') navigate('/admin/dashboard');
        else if (user.role === 'student') navigate('/dashboard');
        else if (user.role === 'hod') navigate('/hod/dashboard');
        else navigate('/department/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCardTitle = () => {
    if (view === 'register') return `Register: ${roleTitle}`;
    return `${roleTitle} Login`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <div className="p-4">
        <img src="https://miaoda-conversation-file.s3cdn.medo.dev/user-845wqo7mn94w/conv-845wum9wqhog/20251210/file-852rchre4v0g.png" alt="DKTE Logo" className="h-12 w-auto object-contain"/>
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Button variant="ghost" onClick={() => { if (view === 'login') navigate('/staff-roles'); else setView('login'); }} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> {view === 'login' ? 'Back to Role Selection' : 'Back to Login'}
          </Button>

          <Card className="border-t-4 border-t-primary shadow-lg">
            <CardHeader>
              <CardTitle>{getCardTitle()}</CardTitle>
              <CardDescription>{view === 'register' ? 'Join the digital workflow system' : 'Sign in to access your dashboard'}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {view === 'register' ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" value={formData.fullName} onChange={handleInputChange} required />
                    </div>
                    
                    {/* --- DYNAMIC DEPARTMENT SELECTOR --- */}
                    {isAcademicRole && (
                      <div className="space-y-2">
                        <Label htmlFor="department" className="text-primary font-semibold">Academic Department</Label>
                        <select
                          id="department"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={formData.department}
                          onChange={handleDepartmentChange}
                          required
                        >
                          <option value="" disabled>Select Department</option>
                          {/* Maps through the list loaded from Admin */}
                          {departmentList.map((dept, idx) => (
                            <option key={idx} value={dept}>{dept}</option>
                          ))}
                        </select>
                        <p className="text-[10px] text-muted-foreground">List managed by Administrator</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={formData.email} onChange={handleInputChange} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="regUsername">Username</Label>
                      <Input id="regUsername" value={formData.regUsername} onChange={handleInputChange} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="regPassword">Password</Label>
                        <Input id="regPassword" type="password" value={formData.regPassword} onChange={handleInputChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm</Label>
                        <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Email Address</Label>
                      <Input id="username" type="email" placeholder="name@example.com" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : (view === 'register' ? 'Create Account' : 'Sign In')}
                </Button>
              </form>

              {/* --- FOOTER: HIDES "Create Account" FOR ADMIN --- */}
              <div className="mt-4 text-center text-sm">
                {view === 'register' ? (
                  <>
                    <span className="text-muted-foreground">Already have an account? </span>
                    <Button variant="link" className="p-0 h-auto font-semibold" onClick={() => setView('login')}>Sign In</Button>
                  </>
                ) : (
                  isRegistrationAllowed && (
                    <>
                      <span className="text-muted-foreground">Don't have an account? </span>
                      <Button variant="link" className="p-0 h-auto font-semibold" onClick={() => setView('register')}>Create Account</Button>
                    </>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}