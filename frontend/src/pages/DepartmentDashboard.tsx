import { useEffect, useState, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiService } from '@/services/api';
import { clearanceWorkflow } from '@/services/storage'; 
import type { ClearanceApproval, Student } from '@/types';
import { 
  FileText, Clock, CheckCircle, XCircle, TrendingUp, 
  Camera, Pencil, Save, Mail, ShieldCheck, ClipboardCheck 
} from 'lucide-react';

export default function DepartmentDashboard() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [approvals, setApprovals] = useState<ClearanceApproval[]>([]);
  const [studentNames, setStudentNames] = useState<Record<string, string>>({}); 
  
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (user?.email || 'default')
  });

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
          ...prev,
          name: user.name,
          email: user.email,
          department: user.department || ''
      }));
      loadApprovals();
    }
  }, [user]);

  const loadApprovals = async () => {
    if (!user) return;
    try {
      // 1. Fetch raw approvals for this Role (e.g. 'teacher')
      const data = await apiService.getStaffApprovals(user.role, user.name);
      
      const allStudents = await apiService.getAllStudents();
      const allRequests = await apiService.getAllRequests();
      const nameMap: Record<string, string> = {};

      // 2. FILTERING LOGIC
      // If user is academic staff (Teacher/HOD), only show approvals for their department students.
      // If user is generic staff (Library, Accounts), show all.
      const isAcademicRole = user.role === 'teacher' || user.role === 'hod';
      const myDepartment = user.department;

      const filteredApprovals = data.filter((approval: ClearanceApproval) => {
         const req = allRequests.find((r: any) => r.id === approval.requestId);
         if (!req) return false;

         const stud = allStudents.find((s: Student) => s.id === req.studentId);
         if (!stud) return false;

         // Map name for display
         nameMap[approval.id] = stud.name;

         // FILTER CHECK
         if (isAcademicRole && myDepartment) {
            // Only keep if student's dept matches teacher's dept
            return stud.department === myDepartment;
         }
         return true; // Keep all for Library/Accounts
      });

      setApprovals(filteredApprovals);
      setStudentNames(nameMap);

    } catch (error) {
      console.error("Failed to load approvals", error);
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfile(prev => ({ ...prev, photoUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    if (user) localStorage.setItem(`profile_${user.id}`, JSON.stringify({ photoUrl: profile.photoUrl }));
    setIsEditing(false);
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  if (user.role === 'hod') return <Navigate to="/hod/dashboard" replace />;

  const pendingApprovals = approvals.filter((a) => a.status === 'pending').length;
  const approvedCount = approvals.filter((a) => a.status === 'approved').length;
  const completionRate = approvals.length > 0 ? Math.round((approvedCount / approvals.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Faculty & Department Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome, {profile.name} — 
              <span className="text-primary font-semibold ml-1">
                {profile.department ? `${profile.department} (${clearanceWorkflow.getDepartmentLabel(user.role)})` : clearanceWorkflow.getDepartmentLabel(user.role)}
              </span>
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Assigned Tasks</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvals.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Total pending/completed</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Needs Action</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingApprovals}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting your approval</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Successfully cleared</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-primary">Efficiency</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Approval completion rate</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-1 shadow-md border-primary/10">
             <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>My Profile</CardTitle><CardDescription>Manage your faculty details</CardDescription></div>
              <Button variant="ghost" size="icon" onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}>
                {isEditing ? <Save className="h-4 w-4 text-green-600" /> : <Pencil className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative mb-6">
                <img src={profile.photoUrl} alt="Profile" className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-cover bg-gray-200" />
                {isEditing && (
                  <>
                    <button type="button" onClick={handleUploadClick} className="absolute bottom-1 right-1 p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors shadow-md"><Camera className="h-4 w-4" /></button>
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                  </>
                )}
              </div>
              <div className="w-full space-y-4">
                {isEditing ? (
                  <div className="text-center text-sm text-muted-foreground"><p>Contact Admin to update profile details.</p></div>
                ) : (
                  <div className="text-center">
                    <h3 className="text-xl font-bold">{profile.name}</h3>
                    <p className="text-sm text-blue-600 font-semibold uppercase tracking-wider">{profile.department || "General Faculty"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{clearanceWorkflow.getDepartmentLabel(user.role)}</p>
                    <div className="mt-6 space-y-3 text-left border-t pt-4">
                      <div className="flex items-center text-sm text-gray-600"><Mail className="mr-3 h-4 w-4" /> {profile.email}</div>
                      <div className="flex items-center text-sm text-gray-600"><ShieldCheck className="mr-3 h-4 w-4 text-green-600" /> Verified Authority</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="xl:col-span-2 space-y-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Clearance Management</CardTitle><CardDescription>Actions for pending student forms</CardDescription></div>
                <ClipboardCheck className="h-8 w-8 text-primary/40" />
              </CardHeader>
              <CardContent className="flex gap-4">
                <Link to="/department/requests" className="flex-1"><Button className="w-full h-12 text-md"><TrendingUp className="mr-2 h-5 w-5" />Open Request Manager</Button></Link>
                {pendingApprovals > 0 && (
                  <div className="flex-none px-6 bg-yellow-100 border border-yellow-200 rounded-lg flex items-center justify-center animate-pulse"><p className="text-sm font-bold text-yellow-700">{pendingApprovals} PENDING</p></div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Recent Activity</CardTitle><CardDescription>History of student clearances you processed</CardDescription></CardHeader>
              <CardContent>
                {approvals.length === 0 ? (
                  <div className="text-center py-10 bg-muted/20 rounded-lg border-2 border-dashed"><p className="text-muted-foreground italic">No student activity recorded yet</p></div>
                ) : (
                  <div className="space-y-4">
                    {approvals.slice(0, 5).map((approval) => (
                      <div key={approval.id} className="flex items-center justify-between p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-primary font-bold">{studentNames[approval.id]?.charAt(0) || 'S'}</div>
                          <div><p className="font-bold text-sm text-foreground">{studentNames[approval.id] || 'Student'}</p><p className="text-xs text-muted-foreground">{approval.department}</p></div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${approval.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : approval.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{approval.status.toUpperCase()}</span>
                            <p className="text-[10px] text-muted-foreground">{new Date(approval.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}