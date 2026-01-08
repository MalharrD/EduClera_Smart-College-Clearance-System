import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Loader2 } from 'lucide-react';
import type { UserRole } from '@/types';

export default function Register() {
  // --- Dynamic Departments State ---
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    role: 'student' as UserRole, // Default and fixed to 'student'
    collegeId: '',
    enrollmentNumber: '',
    department: '',
    year: '1',
    phone: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // --- Sync with AdminDashboard Data ---
  useEffect(() => {
    // Read from the shared key used in AdminDashboard
    const savedDepts = localStorage.getItem('manage_departments');
    if (savedDepts) {
      setAvailableDepartments(JSON.parse(savedDepts));
    } else {
      // Fallback defaults if the Admin hasn't configured anything yet
      const defaults = ["Computer Science", "Information Technology", "Mechanical"];
      setAvailableDepartments(defaults);
      localStorage.setItem('manage_departments', JSON.stringify(defaults));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password || !formData.name || !formData.email) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    // Always validate student info since this is now a student-only form
    if (!formData.collegeId || !formData.enrollmentNumber || !formData.department) {
      toast({
        title: 'Error',
        description: 'Please fill in all student information including Department',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        username: formData.username,
        password: formData.password,
        name: formData.name,
        email: formData.email,
        role: 'student' as UserRole, // Enforce student role
      };

      const studentData = {
        name: formData.name,
        collegeId: formData.collegeId,
        enrollmentNumber: formData.enrollmentNumber,
        department: formData.department,
        year: Number.parseInt(formData.year),
        email: formData.email,
        phone: formData.phone,
      };

      await register(userData, studentData);
      
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created successfully!',
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
      
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
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
            <CardTitle>Student Registration</CardTitle>
            <CardDescription>Create your student account to access clearance services</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">
                    Username <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isLoading}
                  />
                </div>

                {/* ROLE SELECTOR REMOVED - AUTOMATICALLY 'STUDENT' */}

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Choose a password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Confirm Password <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* STUDENT FIELDS - ALWAYS VISIBLE NOW */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-medium mb-4">Academic Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="collegeId">
                      College ID <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="collegeId"
                      type="text"
                      placeholder="e.g., CS2021001"
                      value={formData.collegeId}
                      onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="enrollmentNumber">
                      Enrollment Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="enrollmentNumber"
                      type="text"
                      placeholder="e.g., EN2021001"
                      value={formData.enrollmentNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, enrollmentNumber: e.target.value })
                      }
                      disabled={isLoading}
                    />
                  </div>

                  {/* --- SYNCHRONIZED DEPARTMENT DROP DOWN --- */}
                  <div className="space-y-2">
                    <Label htmlFor="department">
                      Department <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => setFormData({ ...formData, department: value })}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDepartments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select
                      value={formData.year}
                      onValueChange={(value) => setFormData({ ...formData, year: value })}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}