import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { ArrowLeft, Loader2, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';

export default function StaffLogin() {
  const { role } = useParams<{ role: string }>();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Store the fetched departments dynamically from the DB
  const [availableDepartments, setAvailableDepartments] = useState<{id: string, name: string}[]>([]);
  
  const [formData, setFormData] = useState({
    username: '', 
    password: '', 
    name: '', 
    email: '', 
    role: role || 'teacher', 
    department: '', 
    year: '1', 
    subject: ''
  });
  
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Update formData role if the URL parameter changes
  useEffect(() => {
    if (role) {
      setFormData(prev => ({ ...prev, role }));
    }
  }, [role]);

  // Fetch departments from MongoDB on mount
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const depts = await apiService.getDepartments();
        setAvailableDepartments(depts);
      } catch (error) {
        console.error("Failed to load departments", error);
      }
    };
    fetchDepts();
  }, []);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let loggedInUser;

      if (isRegistering) {
        // Only enforce department selection for HODs
        if (formData.role === 'hod' && !formData.department) {
          throw new Error("Please select a department for the HOD.");
        }
        await register(formData);
        toast({ title: "Account Created", description: "You have been registered successfully." });
        loggedInUser = { role: formData.role };
      } else {
        loggedInUser = await login(formData.username, formData.password);
        toast({ title: "Welcome Back", description: "Logged in successfully." });
      }

      const userRole = loggedInUser?.role;

      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'hod') {
        navigate('/hod/dashboard');
      } else if (
        ['teacher', 'library', 'accounts', 'scholarship', 'student_section', 'hostel_bus', 'tpo', 'exam_cell'].includes(userRole || '')
      ) {
        navigate('/department/dashboard');
      } else {
        navigate('/dashboard');
      }

    } catch (error: any) {
      toast({ title: "Action Failed", description: error?.message || "An error occurred", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get dynamic titles based on role
  const getRoleDisplay = () => {
    const roleMap: Record<string, string> = {
      teacher: 'Teacher',
      hod: 'HOD',
      library: 'Librarian',
      accounts: 'Accounts Officer',
      scholarship: 'Scholarship In-charge',
      student_section: 'Student Section',
      hostel_bus: 'Hostel/Bus Coordinator',
      tpo: 'TPO Officer',
      exam_cell: 'Exam Cell Controller',
      admin: 'Administrator'
    };
    return roleMap[role || 'teacher'] || 'Staff';
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

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            onClick={() => navigate('/staff-roles')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Roles
          </Button>

          <Card>
            <CardHeader className="text-center">
              <CardTitle>{isRegistering ? `${getRoleDisplay()} Registration` : `${getRoleDisplay()} Login`}</CardTitle>
              <CardDescription>
                {isRegistering ? `Join the ${getRoleDisplay()} department` : `Access your ${getRoleDisplay()} dashboard`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAction} className="space-y-4">
                {isRegistering ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input placeholder="Enter your full name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input placeholder="your.email@example.com" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                      <Label>Username</Label>
                      <Input placeholder="Choose a username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required disabled={isLoading} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="Enter password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required disabled={isLoading} className="pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    {role === 'hod' && (
                      <div className="space-y-2">
                        <Label>Department</Label>
                        <Select value={formData.department} onValueChange={v => setFormData({...formData, department: v})} disabled={isLoading}>
                          <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                          <SelectContent>
                            {availableDepartments.map(d => (
                              <SelectItem key={d.id || d.name} value={d.name}>{d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Username or Email</Label>
                      <Input placeholder="Enter username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="Enter password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required disabled={isLoading} className="pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                  ) : isRegistering ? (
                    <><UserPlus className="mr-2 h-4 w-4" /> Register {getRoleDisplay()}</>
                  ) : (
                    <><LogIn className="mr-2 h-4 w-4" /> Login</>
                  )}
                </Button>

                <Button type="button" variant="link" className="w-full" onClick={() => setIsRegistering(!isRegistering)} disabled={isLoading}>
                  {isRegistering ? "Already have an account? Login" : `New ${getRoleDisplay()}? Register Here`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}