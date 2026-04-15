import { useEffect, useState, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiService } from '@/services/api';
import { clearanceWorkflow } from '@/services/storage'; 
import { useToast } from '@/hooks/use-toast';
import type { ClearanceApproval, Student, TeachingAssignment } from '@/types';
import { 
  FileText, Clock, CheckCircle, XCircle, TrendingUp, 
  Camera, Pencil, Save, Mail, ShieldCheck, ClipboardCheck, BookOpen, Plus, Trash2 
} from 'lucide-react';

export default function DepartmentDashboard() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const [approvals, setApprovals] = useState<ClearanceApproval[]>([]);
  const [studentNames, setStudentNames] = useState<Record<string, string>>({}); 
  const [availableDepartments, setAvailableDepartments] = useState<{id: string, name: string}[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (user?.email || 'default')
  });

  const [assignments, setAssignments] = useState<TeachingAssignment[]>([]);

  useEffect(() => {
    if (user) {
      setProfile(prev => ({ ...prev, name: user.name, email: user.email, department: user.department || '' }));
      
      if (user.role === 'teacher') {
        // Unpack the stringified JSON from the legacy 'subject' field
        try {
          if (user.subject && user.subject.startsWith('[')) {
            setAssignments(JSON.parse(user.subject));
          } else if (user.subject && user.year) {
            setAssignments([{ subject: user.subject, year: Number(user.year) }]);
          } else {
            setAssignments([{ subject: '', year: 1 }]);
          }
        } catch (e) {
          setAssignments([{ subject: user.subject || '', year: Number(user.year || 1) }]);
        }
      }
      
      loadApprovals();
    }
  }, [user]);

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

  const loadApprovals = async () => {
    if (!user) return;
    try {
      const data = await apiService.getStaffApprovals(user.role, user.name);
      const allStudents = await apiService.getAllStudents();
      const allRequests = await apiService.getAllRequests();
      const nameMap: Record<string, string> = {};

      const isAcademicRole = user.role === 'teacher' || user.role === 'hod';
      const myDepartment = user.department;

      const filteredApprovals = data.filter((approval: ClearanceApproval) => {
         const req = allRequests.find((r: any) => r.id === approval.requestId);
         if (!req) return false;
         const stud = allStudents.find((s: Student) => s.id === req.studentId);
         if (!stud) return false;
         nameMap[approval.id] = stud.name;
         if (isAcademicRole && myDepartment) return stud.department === myDepartment;
         return true; 
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

  const handleAddAssignment = () => setAssignments([...assignments, { subject: '', year: 1 }]);
  const handleRemoveAssignment = (index: number) => setAssignments(assignments.filter((_, i) => i !== index));
  const handleAssignmentChange = (index: number, field: string, value: any) => {
    const newAssignments = [...assignments];
    newAssignments[index] = { ...newAssignments[index], [field]: value };
    setAssignments(newAssignments);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      localStorage.setItem(`profile_${user.id}`, JSON.stringify({ photoUrl: profile.photoUrl }));

      if (user.role === 'teacher') {
        if (!profile.department) throw new Error("Department selection is required.");
        
        const validAssignments = assignments.filter(a => a.subject?.trim() !== '');
        if (validAssignments.length === 0) throw new Error("You must assign at least one subject and year.");

        // Compress the array into a single string to bypass backend schema drops
        const encodedSubjects = JSON.stringify(validAssignments);

        await apiService.updateUser(user.id, {
          department: profile.department,
          subject: encodedSubjects, 
          year: validAssignments[0].year 
        });
        
        user.department = profile.department;
        user.subject = encodedSubjects;
        user.year = validAssignments[0].year;
        
        toast({ title: "Profile Updated", description: "Your teaching assignments have been saved successfully." });
      }
      setIsEditing(false);
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message || "Could not save your changes. Try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Assigned Tasks</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{approvals.length}</div></CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Needs Action</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{pendingApprovals}</div></CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{approvedCount}</div></CardContent>
          </Card>
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-primary">Efficiency</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{completionRate}%</div></CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-1 shadow-md border-primary/10 h-max">
             <CardHeader className="flex flex-row items-center justify-between bg-primary/5 pb-4">
              <div>
                <CardTitle className="text-lg">My Profile</CardTitle>
                <CardDescription>Manage your faculty details</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)} disabled={isSaving}>
                {isEditing ? <Save className="h-4 w-4 text-green-600" /> : <Pencil className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-6">
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
                  user?.role === 'teacher' ? (
                    <div className="space-y-4 text-left border-t pt-4">
                      
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase">Department</Label>
                        <Select value={profile.department} onValueChange={(v) => setProfile({...profile, department: v})}>
                          <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                          <SelectContent>
                            {availableDepartments.map(d => (
                              <SelectItem key={d.id || d.name} value={d.name}>{d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold text-muted-foreground uppercase">Teaching Assignments</Label>
                          <Button type="button" variant="outline" size="sm" onClick={handleAddAssignment} className="h-7 text-xs">
                            <Plus className="h-3 w-3 mr-1" /> Add Subject
                          </Button>
                        </div>
                        
                        {assignments.map((assignment, index) => (
                          <div key={index} className="flex gap-2 items-end border p-3 rounded-lg bg-muted/20">
                            <div className="flex-1 space-y-1">
                              <Label className="text-[10px]">Subject Name</Label>
                              <Input 
                                className="h-8 text-sm"
                                value={assignment.subject} 
                                onChange={e => handleAssignmentChange(index, 'subject', e.target.value)} 
                                placeholder="e.g. Maths" 
                              />
                            </div>
                            <div className="w-[90px] space-y-1">
                              <Label className="text-[10px]">Year</Label>
                              <Select value={String(assignment.year)} onValueChange={v => handleAssignmentChange(index, 'year', Number(v))}>
                                <SelectTrigger className="h-8 text-sm"><SelectValue/></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1st Yr</SelectItem>
                                  <SelectItem value="2">2nd Yr</SelectItem>
                                  <SelectItem value="3">3rd Yr</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveAssignment(index)} disabled={assignments.length === 1} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                    </div>
                  ) : (
                    <div className="text-center text-sm text-muted-foreground border-t pt-4"><p>Contact Admin to update core profile details.</p></div>
                  )
                ) : (
                  <div className="text-center">
                    <h3 className="text-xl font-bold">{profile.name}</h3>
                    <p className="text-sm text-blue-600 font-semibold uppercase tracking-wider">{profile.department || "No Department Assigned"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{clearanceWorkflow.getDepartmentLabel(user.role)}</p>
                    
                    {user?.role === 'teacher' && (
                      <div className="mt-4 flex flex-col items-center gap-2">
                        {assignments.length > 0 ? assignments.map((a, i) => (
                          <Badge key={i} variant="outline" className="flex items-center gap-2 py-1 w-max">
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px]">Yr {a.year}</span>
                            <BookOpen className="h-3 w-3 text-muted-foreground" />
                            {a.subject}
                          </Badge>
                        )) : (
                           <Badge variant="outline" className="text-muted-foreground">No Subjects Assigned</Badge>
                        )}
                      </div>
                    )}

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
                      <div key={approval.id} className="flex items-center justify-between p-4 border rounded-xl bg-white shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-primary font-bold">{studentNames[approval.id]?.charAt(0) || 'S'}</div>
                          <div><p className="font-bold text-sm text-foreground">{studentNames[approval.id] || 'Student'}</p><p className="text-xs text-muted-foreground">{approval.department}</p></div>
                        </div>
                        <Badge variant={approval.status === 'approved' ? 'default' : approval.status === 'pending' ? 'secondary' : 'destructive'} className={approval.status === 'approved' ? 'bg-green-500' : ''}>
                          {approval.status.toUpperCase()}
                        </Badge>
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