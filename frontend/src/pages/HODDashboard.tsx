import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiService } from '@/services/api';
import { clearanceWorkflow } from '@/services/storage';
import type { ClearanceRequest, Student, ClearanceApproval, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
  Users, FileText, CheckCircle, XCircle, Clock, Search,
  Shield, Camera, Pencil, Save, Mail, ShieldCheck, GraduationCap, Trash2
} from 'lucide-react';

export default function HODDashboard() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [requests, setRequests] = useState<ClearanceRequest[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [allApprovals, setAllApprovals] = useState<ClearanceApproval[]>([]);
  
  const [teachers, setTeachers] = useState<User[]>([]);
  const [teacherYearFilter, setTeacherYearFilter] = useState('all');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || "HOD Administrator",
    email: user?.email || "hod@college.edu",
    role: "Head of Department",
    department: user?.department || "General",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (user?.username || 'HOD')
  });

  useEffect(() => {
    if (user) {
        setProfile(prev => ({ ...prev, name: user.name, email: user.email, department: user.department || "General" }));
    }
  }, [user]);

  useEffect(() => {
    if (user?.department) loadData(user.department);
    if (user?.id) {
        const savedProfile = localStorage.getItem(`hod_profile_${user.id}`);
        if (savedProfile) {
            const parsed = JSON.parse(savedProfile);
            if (parsed.photoUrl) setProfile(prev => ({ ...prev, photoUrl: parsed.photoUrl }));
        }
    }
  }, [user?.department, user?.id]);

  const loadData = async (myDepartment: string) => {
    try {
      const [reqs, studs] = await Promise.all([
        apiService.getAllRequests(),
        apiService.getAllStudents(),
      ]) as [ClearanceRequest[], Student[]];

      const myStudents = studs.filter(s => s?.department?.trim().toLowerCase() === myDepartment.trim().toLowerCase());
      setStudents(myStudents);

      const myStudentIds = new Set(myStudents.map(s => s.id));
      const myRequests = reqs.filter(r => myStudentIds.has(r.studentId));
      setRequests(myRequests);

      if (myRequests.length > 0) {
        const approvalPromises = myRequests.map((req) => apiService.getApprovals(req.id));
        const approvalsList = await Promise.all(approvalPromises);
        setAllApprovals(approvalsList.flat() as ClearanceApproval[]);
      } else {
        setAllApprovals([]);
      }

      try {
        const allUsers = await apiService.getAllUsers();
        const myTeachers = allUsers.filter((u: User) => {
          return u?.role === 'teacher' && 
                 u?.department?.trim().toLowerCase() === myDepartment.trim().toLowerCase();
        });
        setTeachers(myTeachers);
      } catch (userErr) {
        console.error("Failed to fetch teachers", userErr);
      }

    } catch (error) {
      toast({ title: "Data Load Error", description: "Could not fetch dashboard data.", variant: "destructive" });
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
    if (user) localStorage.setItem(`hod_profile_${user.id}`, JSON.stringify({ photoUrl: profile.photoUrl }));
    setIsEditing(false);
    toast({ title: "Success", description: "Profile photo updated" });
  };

  // --- NEW: DELETE TEACHER ---
  const handleDeleteTeacher = async (teacherId: string) => {
    if (!window.confirm("Are you sure you want to remove this teacher from the system?")) return;
    try {
      await apiService.deleteUser(teacherId);
      setTeachers(prev => prev.filter(t => t.id !== teacherId && t.supabaseId !== teacherId));
      toast({ title: 'Success', description: 'Teacher removed successfully.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to remove teacher.', variant: 'destructive' });
    }
  };

  const filteredRequests = requests.filter((request) => {
    const student = students.find((s) => s.id === request.studentId);
    if (!student) return false;
    const matchesSearch = !searchQuery || student.name.toLowerCase().includes(searchQuery.toLowerCase()) || student.collegeId.toLowerCase().includes(searchQuery.toLowerCase()) || student.enrollmentNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredTeachers = teachers.filter(t => {
    if (teacherYearFilter === 'all') return true;
    return String(t.year) === String(teacherYearFilter);
  });

  const stats = {
    totalRequests: requests.length,
    totalStudents: students.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">HOD Dashboard</h1>
            </div>
            <p className="text-muted-foreground">Department: <span className="font-semibold text-foreground">{profile.department}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
          <Card className="xl:col-span-1 shadow-md border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Profile</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}>
                {isEditing ? <Save className="h-4 w-4 text-green-600" /> : <Pencil className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-4">
              <div className="relative mb-4">
                <img src={profile.photoUrl} alt="HOD Profile" className="h-24 w-24 rounded-full border-4 border-white shadow-sm object-cover bg-gray-100" />
                {isEditing && (
                  <>
                    <button type="button" onClick={handleUploadClick} className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full hover:bg-primary/90 shadow-md transition-all">
                      <Camera className="h-3 w-3" />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                  </>
                )}
              </div>
              <div className="text-center">
                <h3 className="font-bold text-foreground leading-tight">{profile.name}</h3>
                <p className="text-xs text-blue-600 font-semibold mb-3">HOD - {profile.department}</p>
                <div className="space-y-1.5 text-left border-t pt-3">
                  <div className="flex items-center text-[11px] text-muted-foreground"><Mail className="mr-2 h-3 w-3" /> {profile.email}</div>
                  <div className="flex items-center text-[11px] text-muted-foreground"><ShieldCheck className="mr-2 h-3 w-3" /> Dept. Administrator</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium">Students</CardTitle><Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent><div className="text-xl font-bold">{stats.totalStudents}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium">Pending</CardTitle><Clock className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent><div className="text-xl font-bold">{stats.pending}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium">Approved</CardTitle><CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent><div className="text-xl font-bold">{stats.approved}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium">Rejected</CardTitle><XCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent><div className="text-xl font-bold">{stats.rejected}</div></CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:w-auto">
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Clearance Requests</CardTitle>
                <CardDescription>Managing requests for {profile.department} Department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {filteredRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No requests found for your department</p>
                    </div>
                  ) : (
                    filteredRequests.map((request) => {
                      const student = students.find((s) => s.id === request.studentId);
                      if (!student) return null;
                      const requestApprovals = allApprovals.filter(a => a.requestId === request.id);

                      return (
                        <Card key={request.id}>
                          <CardContent className="pt-6">
                            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h3 className="text-lg font-semibold">{student.name}</h3>
                                  {getStatusBadge(request.status)}
                                  <Badge variant="outline">{request.type === 'hall_ticket' ? 'Hall Ticket' : 'No-Dues'}</Badge>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div><p className="text-muted-foreground">ID</p><p className="font-medium">{student.collegeId}</p></div>
                                  <div><p className="text-muted-foreground">Enrollment</p><p className="font-medium">{student.enrollmentNumber}</p></div>
                                  <div><p className="text-muted-foreground">Dept</p><p className="font-medium">{student.department}</p></div>
                                  <div><p className="text-muted-foreground">Year</p><p className="font-medium">{student.year}</p></div>
                                </div>
                                <div className="mt-3">
                                  <p className="text-sm font-medium mb-2">Workflow Status:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {requestApprovals.map((approval) => (
                                      <Badge key={approval.id} variant="outline" className={
                                          approval.status === 'approved' ? 'border-success text-success' : 
                                          approval.status === 'rejected' ? 'border-destructive text-destructive' : 'border-warning text-warning'
                                      }>
                                        {clearanceWorkflow.getDepartmentLabel(approval.department)}: {approval.status}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{profile.department} Students</CardTitle>
                <CardDescription>All registered students in your department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No students found.</p>
                    </div>
                  ) : (
                    students.map((student) => (
                      <div key={student.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{student.name}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                            <div><span className="font-medium">ID:</span> {student.collegeId}</div>
                            <div><span className="font-medium">Enrollment:</span> {student.enrollmentNumber}</div>
                            <div><span className="font-medium">Dept:</span> {student.department}</div>
                            <div><span className="font-medium">Year:</span> {student.year}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{profile.department} Teachers</CardTitle>
                <CardDescription>Manage academic staff in your department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 flex gap-4">
                  <Select value={teacherYearFilter} onValueChange={setTeacherYearFilter}>
                    <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Filter by Year" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {filteredTeachers.length === 0 ? (
                     <div className="text-center py-12">
                     <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                     <p className="text-muted-foreground">No teachers found for this criteria.</p>
                   </div>
                  ) : (
                    filteredTeachers.map((teacher) => (
                      <div key={teacher.id || teacher.email} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                               <h3 className="font-semibold text-lg">{teacher.name}</h3>
                               <Badge variant="secondary">{teacher.year ? `Year ${teacher.year}` : 'N/A'}</Badge>
                            </div>
                            
                            {/* DELETE BUTTON ADDED HERE */}
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="h-8 shadow-sm"
                              onClick={() => handleDeleteTeacher(teacher.id || teacher.supabaseId)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Remove
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground mt-2">
                            <div><span className="font-medium text-foreground">Email:</span> {teacher.email}</div>
                            <div><span className="font-medium text-foreground">Subject:</span> {teacher.subject || 'Not Assigned'}</div>
                            <div><span className="font-medium text-foreground">Username:</span> {teacher.username}</div>
                            <div><span className="font-medium text-foreground">Joined:</span> {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}