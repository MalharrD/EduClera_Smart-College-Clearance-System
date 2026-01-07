import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { storageService } from '@/services/storage';
import type { ClearanceRequest } from '@/types';
import { 
  FileText, Plus, Clock, CheckCircle, XCircle, 
  TrendingUp, Camera, Pencil, Save, Mail, User, Phone, MapPin 
} from 'lucide-react';

export default function StudentDashboard() {
  const { student } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [requests, setRequests] = useState<ClearanceRequest[]>([]);
  
  // Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: student?.name || '',
    email: student?.email || '',
    phone: student?.phone || '',
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (student?.email || 'student')
  });

  useEffect(() => {
    if (student) {
      const studentRequests = storageService.getRequestsByStudentId(student.id);
      setRequests(studentRequests);
      
      // Load custom profile data if saved in localStorage
      const savedProfile = localStorage.getItem(`student_profile_${student.id}`);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    }
  }, [student]);

  // Gallery Access & Image Processing
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert("Please select an image file.");
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
    if (student) {
      localStorage.setItem(`student_profile_${student.id}`, JSON.stringify(profile));
    }
    setIsEditing(false);
  };

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending').length;
  const approvedRequests = requests.filter((r) => r.status === 'approved').length;
  const rejectedRequests = requests.filter((r) => r.status === 'rejected').length;

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
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
            <p className="text-muted-foreground mt-2 font-medium">Welcome back, {profile.name}!</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Total Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requests.length}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Pending</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingRequests}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedRequests}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{rejectedRequests}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* --- PROFILE SECTION --- */}
          <Card className="xl:col-span-1 shadow-md border-primary/10 overflow-hidden">
            <CardHeader className="bg-primary/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">My Profile</CardTitle>
                <CardDescription>Academic Identity</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
              >
                {isEditing ? <Save className="h-4 w-4 text-green-600" /> : <Pencil className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-8">
              <div className="relative mb-6 group">
                <div className="h-32 w-32 rounded-full ring-4 ring-white shadow-xl overflow-hidden bg-muted">
                  <img 
                    src={profile.photoUrl} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                </div>
                {isEditing && (
                  <>
                    <button 
                      onClick={handleUploadClick}
                      className="absolute bottom-1 right-1 p-2 bg-primary text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                    >
                      <Camera className="h-4 w-4" />
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
                <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-green-500 border-2 border-white shadow-sm" title="Online"></div>
              </div>

              <div className="w-full space-y-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Full Name</p>
                      <Input value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Email</p>
                      <Input value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Phone</p>
                      <Input value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-foreground">{profile.name}</h3>
                    <p className="text-sm font-semibold text-primary/80 uppercase tracking-tight">{student.department} • Year {student.year}</p>
                    
                    <div className="mt-6 space-y-3 text-left border-t pt-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="mr-3 h-4 w-4 text-primary/60" />
                        <span className="font-medium text-foreground">{student.collegeId}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="mr-3 h-4 w-4 text-primary/60" />
                        <span>{profile.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="mr-3 h-4 w-4 text-primary/60" />
                        <span>{profile.phone || 'No phone added'}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-3 h-4 w-4 text-primary/60" />
                        <span>DKTE Institute</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Recent Requests */}
          <div className="xl:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your clearance workflow</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/submit-request">
                  <Button className="w-full h-12 shadow-sm font-bold">
                    <Plus className="mr-2 h-5 w-5" />
                    Submit New Request
                  </Button>
                </Link>
                <Link to="/track-status">
                  <Button variant="outline" className="w-full h-12 shadow-sm font-bold">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Track Full Status
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>History of your clearance submissions</CardDescription>
                </div>
                <FileText className="h-5 w-5 text-muted-foreground/50" />
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No recent activity found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.slice(0, 3).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-accent/30 transition-all shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${request.status === 'approved' ? 'bg-green-100' : 'bg-blue-100'}`}>
                            <FileText className={`h-5 w-5 ${request.status === 'approved' ? 'text-green-600' : 'text-blue-600'}`} />
                          </div>
                          <div>
                            <p className="font-bold text-sm">
                              {request.type === 'hall_ticket' ? 'Hall Ticket' : 'No-Dues'} Clearance
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(request.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(request.status)}
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