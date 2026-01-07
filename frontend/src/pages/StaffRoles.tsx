import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  BookOpen,
  DollarSign,
  Award,
  FileText,
  Home,
  Briefcase,
  ClipboardCheck,
  Shield,
  GraduationCap,
  ArrowLeft,
} from 'lucide-react';

const staffRoles = [
  {
    role: 'teacher',
    title: 'Teacher Login',
    description: 'Approve student clearance requests',
    icon: GraduationCap,
    color: 'bg-blue-500',
  },
  {
    role: 'hod',
    title: 'HOD Login',
    description: 'Head of Department - Full access',
    icon: Users,
    color: 'bg-purple-500',
  },
  {
    role: 'library',
    title: 'Library Login',
    description: 'Manage library clearances',
    icon: BookOpen,
    color: 'bg-green-500',
  },
  {
    role: 'accounts',
    title: 'Accounts Login',
    description: 'Financial clearance management',
    icon: DollarSign,
    color: 'bg-yellow-500',
  },
  {
    role: 'scholarship',
    title: 'Scholarship Login',
    description: 'Scholarship verification',
    icon: Award,
    color: 'bg-orange-500',
  },
  {
    role: 'student_section',
    title: 'Student Section Login',
    description: 'Student records management',
    icon: FileText,
    color: 'bg-cyan-500',
  },
  {
    role: 'hostel_bus',
    title: 'Hostel/Bus Login',
    description: 'Hostel and transport clearance',
    icon: Home,
    color: 'bg-pink-500',
  },
  {
    role: 'tpo',
    title: 'TPO Login',
    description: 'Training & Placement Office',
    icon: Briefcase,
    color: 'bg-indigo-500',
  },
  {
    role: 'exam_cell',
    title: 'Exam Cell Login',
    description: 'Examination clearance',
    icon: ClipboardCheck,
    color: 'bg-red-500',
  },
  {
    role: 'admin',
    title: 'Admin Login',
    description: 'System administrator access',
    icon: Shield,
    color: 'bg-slate-700',
  },
];

export default function StaffRoles() {
  const navigate = useNavigate();

  const handleRoleSelect = (role: string) => {
    navigate(`/staff-login/${role}`);
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
      
      <div className="flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Student Login
          </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Staff Portal</h1>
          <p className="text-muted-foreground">Select your role to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {staffRoles.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.role}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleRoleSelect(item.role)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`${item.color} p-3 rounded-lg text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription className="text-sm">{item.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Continue to Login
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
}
