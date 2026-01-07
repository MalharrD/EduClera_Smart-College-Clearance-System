import { useEffect, useState, useRef } from 'react';
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
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Shield,
  Camera,
  Pencil,
  Save,
  Mail,
  ShieldCheck,
} from 'lucide-react';

export default function HODDashboard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [requests, setRequests] = useState<ClearanceRequest[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [allApprovals, setAllApprovals] = useState<ClearanceApproval[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  // Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "HOD Administrator",
    email: "hod@college.edu",
    role: "Head of Department",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=HOD"
  });

  useEffect(() => {
    loadData();
    const savedProfile = localStorage.getItem('hod_profile');
    if (savedProfile) setProfile(JSON.parse(savedProfile));
  }, []);

  const loadData = async () => {
    try {
      // 1. Fetch Requests and Students with Type Casting
      const [reqs, studs] = await Promise.all([
        apiService.getAllRequests(),
        apiService.getAllStudents()
      ]) as [ClearanceRequest[], Student[]]; // <--- FIX: Explicitly type the response

      setRequests(reqs);
      setStudents(studs);

      // 2. Fetch approvals for status badges
      if (reqs.length > 0) {
        // req is now correctly inferred as ClearanceRequest
        const approvalPromises = reqs.map((req) => apiService.getApprovals(req.id));
        const approvalsList = await Promise.all(approvalPromises);
        
        // Flatten and cast to correct type
        setAllApprovals(approvalsList.flat() as ClearanceApproval[]);
      }
    } catch (error) {
      console.error("Failed to load HOD data", error);
      toast({
        title: "Data Load Error",
        description: "Could not fetch dashboard data. Please check your connection.",
        variant: "destructive"
      });
    }
  };

  // Gallery Access Functions
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: "Error", description: "Please select an image file", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    localStorage.setItem('hod_profile', JSON.stringify(profile));
    setIsEditing(false);
    toast({ title: "Success", description: "Profile updated successfully" });
  };

  const filteredRequests = requests.filter((request) => {
    const student = students.find((s) => s.id === request.studentId);
    if (!student) return false;

    const matchesSearch =
      !searchQuery ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.collegeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.enrollmentNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      filterDepartment === 'all' || student.department === filterDepartment;

    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const stats = {
    totalRequests: requests.length,
    totalStudents: students.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  const departments = Array.from(new Set(students.map((s) => s.department)));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">HOD Dashboard</h1>
            </div>
            <p className="text-muted-foreground">Full access to all students and departments</p>
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
                <img 
                  src={profile.photoUrl} 
                  alt="HOD Profile" 
                  className="h-24 w-24 rounded-full border-4 border-white shadow-sm object-cover bg-gray-100"
                />
                {isEditing && (
                  <>
                    <button 
                      type="button"
                      onClick={handleUploadClick}
                      className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full hover:bg-primary/90 shadow-md transition-all"
                    >
                      <Camera className="h-3 w-3" />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageChange} 
                      className="hidden" 
                      accept="image/*"
                    />
                  </>
                )}
              </div>

              {isEditing ? (
                <div className="w-full space-y-2">
                  <Input 
                    className="h-8 text-sm"
                    value={profile.name} 
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                  />
                  <Input 
                    className="h-8 text-sm"
                    value={profile.email} 
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                  />
                </div>
              ) : (
                <div className="text-center">
                  <h3 className="font-bold text-foreground leading-tight">{profile.name}</h3>
                  <p className="text-xs text-blue-600 font-semibold mb-3">{profile.role}</p>
                  <div className="space-y-1.5 text-left border-t pt-3">
                    <div className="flex items-center text-[11px] text-muted-foreground">
                      <Mail className="mr-2 h-3 w-3" /> {profile.email}
                    </div>
                    <div className="flex items-center text-[11px] text-muted-foreground">
                      <ShieldCheck className="mr-2 h-3 w-3" /> All Dept. Access
                    </div>
                  </div>
                </div>
              )}
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

        {/* Tabs Content */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="requests">All Requests</TabsTrigger>
            <TabsTrigger value="students">All Students</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Clearance Requests</CardTitle>
                <CardDescription>View and manage all student clearance requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, college ID, or enrollment..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
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
                      <p className="text-muted-foreground">No requests found</p>
                    </div>
                  ) : (
                    filteredRequests.map((request) => {
                      const student = students.find((s) => s.id === request.studentId);
                      if (!student) return null;
                      
                      // Filter approvals for this specific request from the fetched list
                      const requestApprovals = allApprovals.filter(a => a.requestId === request.id);

                      return (
                        <Card key={request.id}>
                          <CardContent className="pt-6">
                            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h3 className="text-lg font-semibold">{student.name}</h3>
                                  {getStatusBadge(request.status)}
                                  <Badge variant="outline">
                                    {request.type === 'hall_ticket' ? 'Hall Ticket' : 'No-Dues'}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">College ID</p>
                                    <p className="font-medium">{student.collegeId}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Enrollment</p>
                                    <p className="font-medium">{student.enrollmentNumber}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Department</p>
                                    <p className="font-medium">{student.department}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Year</p>
                                    <p className="font-medium">{student.year}</p>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <p className="text-sm font-medium mb-2">Department Status:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {requestApprovals.map((approval) => (
                                      <Badge
                                        key={approval.id}
                                        variant="outline"
                                        className={
                                          approval.status === 'approved'
                                            ? 'border-success text-success'
                                            : approval.status === 'rejected'
                                              ? 'border-destructive text-destructive'
                                              : 'border-warning text-warning'
                                        }
                                      >
                                        {clearanceWorkflow.getDepartmentLabel(approval.department)}:{' '}
                                        {approval.status}
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
                <CardTitle>All Students</CardTitle>
                <CardDescription>Complete list of registered students</CardDescription>
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

          <TabsContent value="departments" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {departments.map((dept) => {
                const deptStudents = students.filter((s) => s.department === dept);
                const deptRequests = requests.filter((r) => deptStudents.some((s) => s.id === r.studentId));
                return (
                  <Card key={dept}>
                    <CardHeader>
                      <CardTitle>{dept}</CardTitle>
                      <CardDescription>{deptStudents.length} students</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Requests:</span>
                          <span className="font-medium">{deptRequests.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground ">Approved:</span>
                          <span className="font-medium text-success">{deptRequests.filter((r) => r.status === 'approved').length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}