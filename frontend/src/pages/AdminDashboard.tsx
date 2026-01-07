import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiService } from '@/services/api'; // <--- CHANGED: Import API Service
import { 
  Users, FileText, CheckCircle, Clock, 
  TrendingUp, Mail, ShieldCheck, Camera, Save, Pencil,
  Plus, Building2, Trash2, ShieldAlert
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminDashboard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // --- Dashboard Statistics State ---
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
  });

  // --- Synchronized Department Management State ---
  const [departments, setDepartments] = useState<string[]>([]);
  const [newDept, setNewDept] = useState('');
  
  // --- Security & Deletion States ---
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState<string | null>(null);
  const [passkey, setPasskey] = useState('');

  // --- Editable Profile State ---
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Administrator",
    email: "admin@system.com",
    role: "Super Admin",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    loadStats(); // <--- Now calls the Async Backend function
    
    // 1. Load profile from LocalStorage (Client-side preference)
    const savedProfile = localStorage.getItem('admin_profile');
    if (savedProfile) setProfile(JSON.parse(savedProfile));

    // 2. Load departments from the SHARED KEY: manage_departments
    const savedDepts = localStorage.getItem('manage_departments');
    if (savedDepts) {
      setDepartments(JSON.parse(savedDepts));
    } else {
      // Set initial defaults if key doesn't exist yet
      const defaults = ["Computer Science", "Information Technology", "Mechanical"];
      setDepartments(defaults);
      localStorage.setItem('manage_departments', JSON.stringify(defaults));
    }
  };

  // --- NEW: Fetch Stats from Backend ---
  const loadStats = async () => {
    try {
      // Fetch Students and Requests in parallel
      const [students, requests] = await Promise.all([
        apiService.getAllStudents(),
        apiService.getAllRequests()
      ]);

      setStats({
        // For now, Total Users = Total Students (unless you add a getAllUsers API)
        totalUsers: students.length, 
        totalStudents: students.length,
        totalRequests: requests.length,
        pendingRequests: requests.filter((r: any) => r.status === 'pending').length,
        approvedRequests: requests.filter((r: any) => r.status === 'approved').length,
        rejectedRequests: requests.filter((r: any) => r.status === 'rejected').length,
      });
    } catch (error) {
      console.error("Failed to load admin stats", error);
      // Optional: Add toast error here
    }
  };

  // --- SHARED DEPARTMENT HANDLERS ---
  const addDepartment = () => {
    if (newDept && !departments.includes(newDept)) {
      const updated = [...departments, newDept];
      setDepartments(updated);
      // Synchronize with LocalStorage for Register page
      localStorage.setItem('manage_departments', JSON.stringify(updated));
      setNewDept('');
    }
  };

  const handleOpenDelete = (name: string) => {
    setDeptToDelete(name);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    // Master Security Passkey Validation
    if (passkey === "DKTEYCP") {
      const updated = departments.filter(d => d !== deptToDelete);
      setDepartments(updated);
      // Synchronize with LocalStorage for Register page
      localStorage.setItem('manage_departments', JSON.stringify(updated));
      closeDeleteModal();
    } else {
      alert("Invalid Security Passkey! Access Denied.");
      setPasskey('');
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteDialogOpen(false);
    setDeptToDelete(null);
    setPasskey('');
  };

  // --- PROFILE HANDLERS ---
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
    localStorage.setItem('admin_profile', JSON.stringify(profile));
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Institutional Oversight & Infrastructure</p>
          </div>
          <div className="text-xs font-mono text-muted-foreground bg-white px-3 py-1 rounded-full shadow-sm border">
            VER: 2.1.0 | ONLINE | {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* --- Stats Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase">Students</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-[10px] text-muted-foreground">Registered in database</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-yellow-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              <p className="text-[10px] text-muted-foreground">Requests awaiting action</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalRequests > 0 ? Math.round((stats.approvedRequests / stats.totalRequests) * 100) : 0}%
              </div>
              <p className="text-[10px] text-muted-foreground">Approval efficiency</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Section 1: Editable Profile Sidebar */}
          <Card className="shadow-md border-primary/10 h-fit">
            <CardHeader className="flex flex-row items-center justify-between bg-primary/5">
              <CardTitle className="text-lg">My Profile</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}>
                {isEditing ? <Save className="h-4 w-4 text-green-600" /> : <Pencil className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-6">
              <div className="relative mb-6">
                <img src={profile.photoUrl} alt="Profile" className="h-32 w-32 rounded-full border-4 border-white shadow-xl object-cover bg-muted" />
                {isEditing && (
                  <button onClick={handleUploadClick} className="absolute bottom-1 right-1 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-105 transition-transform"><Camera className="h-4 w-4" /></button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
              </div>
              {isEditing ? (
                <div className="w-full space-y-3 px-2">
                  <Input value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} placeholder="Name" />
                  <Input value={profile.role} onChange={(e) => setProfile({...profile, role: e.target.value})} placeholder="Role" />
                  <Input value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} placeholder="Email" />
                </div>
              ) : (
                <div className="text-center w-full">
                  <h3 className="text-xl font-bold text-foreground">{profile.name}</h3>
                  <p className="text-sm text-primary font-semibold uppercase tracking-wide">{profile.role}</p>
                  <div className="mt-6 pt-6 border-t text-left space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground"><Mail className="mr-3 h-4 w-4 text-primary/40" /> {profile.email}</div>
                    <div className="flex items-center text-sm text-muted-foreground"><ShieldCheck className="mr-3 h-4 w-4 text-primary/40" /> Master Administrator</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Synchronized Department Management */}
          <Card className="xl:col-span-1 shadow-md border-primary/10 h-fit">
            <CardHeader className="bg-primary/5">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <CardTitle>Departments Management</CardTitle>
              </div>
              <CardDescription>Live sync with registration form</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex gap-2">
                <Input 
                  placeholder="e.g. Mechanical Eng." 
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="flex-1 shadow-sm"
                />
                <Button size="icon" onClick={addDepartment} className="shadow-sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {departments.map((dept) => (
                  <div key={dept} className="flex items-center justify-between p-3 bg-white border rounded-xl group hover:border-primary/30 transition-all shadow-sm">
                    <span className="text-sm font-semibold text-foreground">{dept}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={() => handleOpenDelete(dept)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Status & System Health */}
          <div className="xl:col-span-1 space-y-6">
            <Card className="shadow-md">
              <CardHeader><CardTitle className="text-lg">Quick Access</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 gap-3">
                <Link to="/admin/users">
                  <Button className="w-full justify-start h-11" variant="outline"><Users className="mr-3 h-4 w-4 text-primary" /> Manage All Users</Button>
                </Link>
                <Link to="/admin/reports">
                  <Button className="w-full justify-start h-11" variant="outline"><FileText className="mr-3 h-4 w-4 text-primary" /> Download Audit Logs</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-md bg-slate-900 text-white border-none">
              <CardHeader><CardTitle className="text-white text-sm">System Health</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase">DB Link</span>
                  <span className="text-green-400 font-bold flex items-center gap-1"><CheckCircle className="h-3 w-3"/> ACTIVE</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase">Sync Status</span>
                  <span className="text-blue-400 font-bold">REAL-TIME</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-slate-800 pt-4">
                  <span className="text-slate-400">Approved</span>
                  <span className="font-mono text-lg">{stats.approvedRequests}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Rejected</span>
                  <span className="font-mono text-lg text-red-400">{stats.rejectedRequests}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* --- Passkey Verification Modal --- */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
               <ShieldAlert className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center text-red-600">Secure Delete Required</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              You are removing <strong>{deptToDelete}</strong>. Student registration for this department will be disabled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="my-4 space-y-2">
            <Label htmlFor="passkey" className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Master Admin Passkey</Label>
            <Input 
              id="passkey"
              type="password" 
              placeholder="Enter DKTE Passkey"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              className="border-red-200 focus-visible:ring-red-500 h-11"
            />
          </div>

          <AlertDialogFooter className="sm:justify-center gap-2">
            <AlertDialogCancel onClick={closeDeleteModal} className="flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700 flex-1 h-10"
            >
              Verify & Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}