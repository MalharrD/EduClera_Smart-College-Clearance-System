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
import type { ClearanceRequest, Student, ClearanceApproval } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
  Users, FileText, CheckCircle, XCircle, Clock, Search,
  Shield, Camera, Pencil, Save, Mail, ShieldCheck,
} from 'lucide-react';

export default function HODDashboard() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [requests, setRequests] = useState<ClearanceRequest[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [allApprovals, setAllApprovals] = useState<ClearanceApproval[]>([]);
  
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
        setProfile(prev => ({
            ...prev,
            name: user.name,
            email: user.email,
            department: user.department || "General"
        }));
    }
  }, [user]);

  useEffect(() => {
    if (user?.department) {
        loadData(user.department);
    }
    
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
        apiService.getAllStudents()
      ]) as [ClearanceRequest[], Student[]];

      // --- 1. FILTER STUDENTS BY DEPARTMENT ---
      // Only keep students who belong to this HOD's department
      const myStudents = studs.filter(s => s.department === myDepartment);
      setStudents(myStudents);

      // --- 2. FILTER REQUESTS ---
      // Only keep requests from those students
      const myStudentIds = new Set(myStudents.map(s => s.id));
      const myRequests = reqs.filter(r => myStudentIds.has(r.studentId));
      setRequests(myRequests);

      // --- 3. FETCH APPROVALS ---
      if (myRequests.length > 0) {
        const approvalPromises = myRequests.map((req) => apiService.getApprovals(req.id));
        const approvalsList = await Promise.all(approvalPromises);
        setAllApprovals(approvalsList.flat() as ClearanceApproval[]);
      } else {
        setAllApprovals([]);
      }
    } catch (error) {
      console.error("Failed to load HOD data", error);
      toast({
        title: "Data Load Error",
        description: "Could not fetch dashboard data.",
        variant: "destructive"
      });
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

  const filteredRequests = requests.filter((request) => {
    const student = students.find((s) => s.id === request.studentId);
    if (!student) return false;

    const matchesSearch =
      !searchQuery ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.collegeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.enrollmentNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;

    return matchesSearch && matchesStatus;
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
          {/* Profile Card */}
          <Card className="xl:col-span-1 shadow-md border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Profile</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
              >
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

          {/* Stats Cards */}
          <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium">Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent><div className="text-xl font-bold">{stats.totalStudents}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent><div className="text-xl font-bold">{stats.pending}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent><div className="text-xl font-bold">{stats.approved}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent><div className="text-xl font-bold">{stats.rejected}</div></CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="requests">Department Requests</TabsTrigger>
            <TabsTrigger value="students">Department Students</TabsTrigger>
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
                  {students.map((student) => (
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}