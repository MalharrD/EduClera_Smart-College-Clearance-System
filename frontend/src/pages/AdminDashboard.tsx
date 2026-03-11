import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiService } from '@/services/api'; 
import { useToast } from '@/hooks/use-toast';
import { 
  Users, CheckCircle, Clock, TrendingUp, Mail, 
  ShieldCheck, Camera, Save, Pencil, Plus, Building2, Trash2, ShieldAlert, Activity
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
  const { toast } = useToast();
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingRequests: 0,
    totalRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
  });

  const [departments, setDepartments] = useState<{id: string, name: string}[]>([]);
  const [newDept, setNewDept] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState<string | null>(null);
  const [passkey, setPasskey] = useState('');
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

  const loadData = async () => {
    try {
      const [students, requests, depts] = await Promise.all([
        apiService.getAllStudents(),
        apiService.getAllRequests(),
        apiService.getDepartments()
      ]);

      setDepartments(depts);
      setStats({
        totalStudents: students.length,
        totalRequests: requests.length,
        pendingRequests: requests.filter((r: any) => r.status === 'pending').length,
        approvedRequests: requests.filter((r: any) => r.status === 'approved').length,
        rejectedRequests: requests.filter((r: any) => r.status === 'rejected').length,
      });

      const savedProfile = localStorage.getItem('admin_profile');
      if (savedProfile) setProfile(JSON.parse(savedProfile));
    } catch (error) {
      toast({ title: "Sync Error", description: "Failed to load real-time data from database.", variant: "destructive" });
    }
  };

  const handleAddDepartment = async () => {
    if (!newDept.trim()) return;
    try {
      await apiService.addDepartment(newDept.trim());
      setNewDept('');
      loadData();
      toast({ title: "Success", description: `${newDept} added to global registry.` });
    } catch (error: any) {
      toast({ title: "Action Blocked", description: error.response?.data?.error || "Database error", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (passkey === "DKTEYCP") {
      try {
        await apiService.deleteDepartment(deptToDelete!);
        setIsDeleteDialogOpen(false);
        setDeptToDelete(null);
        setPasskey('');
        loadData();
        toast({ title: "Deleted", description: "Department removed from all forms." });
      } catch (error) {
        toast({ title: "Error", description: "Failed to update database.", variant: "destructive" });
      }
    } else {
      toast({ title: "Security Alert", description: "Incorrect master passkey.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Institutional Control</h1>
          <p className="text-slate-500 text-lg mt-2">Manage infrastructure, faculty, and system-wide clearances.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Students" value={stats.totalStudents} icon={<Users className="text-blue-600" />} color="bg-blue-50" />
          <StatCard title="Awaiting Action" value={stats.pendingRequests} icon={<Clock className="text-amber-600" />} color="bg-amber-50" />
          <StatCard title="Cleared Today" value={stats.approvedRequests} icon={<CheckCircle className="text-emerald-600" />} color="bg-emerald-50" />
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Status</p>
                <p className="text-lg font-bold text-slate-900 mt-1">Live & Secure</p>
              </div>
              <Activity className="h-8 w-8 text-emerald-500 animate-pulse" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="border-b bg-slate-50/50 flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Admin Profile</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-8 flex flex-col items-center">
              <div className="relative mb-6">
                <img src={profile.photoUrl} className="h-32 w-32 rounded-full border-4 border-white shadow-xl" />
                <div className="absolute bottom-1 right-1 h-6 w-6 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{profile.name}</h3>
              <p className="text-primary font-medium">{profile.role}</p>
              <div className="w-full mt-8 space-y-4 pt-6 border-t">
                 <div className="flex items-center gap-3 text-slate-600">
                    <Mail className="h-4 w-4" /> <span>{profile.email}</span>
                 </div>
                 <div className="flex items-center gap-3 text-slate-600">
                    <ShieldCheck className="h-4 w-4" /> <span>Master Access Enabled</span>
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2 shadow-lg border-slate-200">
            <CardHeader className="border-b bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl">Global Department Registry</CardTitle>
              </div>
              <CardDescription>Changes here reflect immediately in registration and staff forms.</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="flex gap-3 mb-8">
                <Input 
                  placeholder="Department Name (e.g., Computer Engineering)" 
                  value={newDept} 
                  onChange={e => setNewDept(e.target.value)} 
                  className="h-12 shadow-sm"
                />
                <Button onClick={handleAddDepartment} className="h-12 px-6">
                  <Plus className="mr-2 h-5 w-5" /> Add Registry
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {departments.map((dept) => (
                  <div key={dept.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-primary/40 hover:shadow-md transition-all group">
                    <span className="font-semibold text-slate-700">{dept.name}</span>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-destructive transition-colors" onClick={() => {setDeptToDelete(dept.name); setIsDeleteDialogOpen(true);}}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
             <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert className="h-6 w-6 text-red-600" />
             </div>
             <AlertDialogTitle className="text-center">Secure Deletion Protocol</AlertDialogTitle>
             <AlertDialogDescription className="text-center">
                This will disable registration for <strong>{deptToDelete}</strong>. Verify with your master passkey.
             </AlertDialogDescription>
          </AlertDialogHeader>
          <Input type="password" placeholder="Master Passkey" value={passkey} onChange={e => setPasskey(e.target.value)} className="my-4 h-12 text-center text-lg tracking-widest" />
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogCancel onClick={() => {setIsDeleteDialogOpen(false); setPasskey('');}}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete Permanently</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: any, color: string }) {
  return (
    <Card className="shadow-sm border-slate-200 overflow-hidden">
      <div className="p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`h-12 w-12 ${color} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}