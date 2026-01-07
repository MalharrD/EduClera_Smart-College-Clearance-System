import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiService } from '@/services/api'; // <--- CHANGED
import { clearanceWorkflow } from '@/services/storage'; // Keep for labels
import type { User, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Search, Edit, Trash2, ShieldAlert, FileDown, Lock } from 'lucide-react';
import { generateUserReportPDF } from '@/utils/userReportPdfGenerator';
import UserReportDialog from '@/components/admin/UserReportDialog';
import { generateAdvancedUserReport, type ReportType, type ReportFilters } from '@/utils/advancedUserReportGenerator';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  
  // State for Managed Departments
  const [managedDepartments, setManagedDepartments] = useState<string[]>([]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [newDepartment, setNewDepartment] = useState<string>('');
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    loadUsers();
    loadManagedDepartments();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, selectedDepartment, users]);

  const loadUsers = async () => {
    try {
      // CHANGED: Fetch from Backend
      const allUsers = await apiService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Failed to load users", error);
      toast({ title: "Error", description: "Failed to load users from database.", variant: "destructive" });
    }
  };

  const loadManagedDepartments = () => {
    const savedDepts = localStorage.getItem('manage_departments');
    if (savedDepts) {
      setManagedDepartments(JSON.parse(savedDepts));
    } else {
      setManagedDepartments(["Computer Science", "Information Technology", "Mechanical"]);
    }
  };

  const getActiveDepartments = (): string[] => {
    const depts = new Set<string>();
    users.forEach((user) => {
      if (user.department) {
        depts.add(user.department);
      }
    });
    managedDepartments.forEach(d => depts.add(d));
    return Array.from(depts).sort();
  };

  const filterUsers = () => {
    let filtered = users;

    if (selectedDepartment !== 'all') {
      if (selectedDepartment === 'none') {
        filtered = filtered.filter((user) => !user.department);
      } else {
        filtered = filtered.filter((user) => user.department === selectedDepartment);
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(query) ||
          user.username?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.role?.toLowerCase().includes(query) ||
          (user.department && user.department.toLowerCase().includes(query))
      );
    }

    setFilteredUsers(filtered);
  };

  const handleEditClick = (user: User) => {
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can edit user roles',
        variant: 'destructive',
      });
      return;
    }
    setSelectedUser(user);
    setNewRole(user.role);
    setNewDepartment(user.department || '');
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can delete users',
        variant: 'destructive',
      });
      return;
    }
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !isAdmin) return;

    const finalRole = selectedUser.role === 'student' ? 'student' : newRole;
    const updates: Partial<User> = { role: finalRole };
    
    if (newDepartment.trim()) {
      updates.department = newDepartment.trim();
    } else {
      updates.department = undefined;
    }

    try {
      // CHANGED: Call Backend API
      await apiService.updateUser(selectedUser.id, updates);

      toast({
        title: 'User Updated',
        description: `User information has been updated successfully`,
      });

      setIsEditDialogOpen(false);
      loadUsers(); // Refresh list
    } catch (error) {
      toast({ title: "Update Failed", description: "Could not update user.", variant: "destructive" });
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete || !isAdmin) return;

    if (userToDelete.id === currentUser?.id) {
      toast({
        title: 'Cannot Delete',
        description: 'You cannot delete your own account',
        variant: 'destructive',
      });
      setIsDeleteDialogOpen(false);
      return;
    }

    try {
      // CHANGED: Call Backend API
      await apiService.deleteUser(userToDelete.id);

      toast({
        title: 'User Deleted',
        description: `${userToDelete.name} has been removed from the system`,
      });

      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      loadUsers(); // Refresh list
    } catch (error) {
      toast({ title: "Delete Failed", description: "Could not delete user.", variant: "destructive" });
    }
  };

  const handleDownloadUserReport = async () => {
    if (users.length === 0) {
      toast({ title: "No Data", description: "No users available to generate report.", variant: "destructive" });
      return;
    }
    try {
      await generateUserReportPDF(users, 'All Users Report');
      toast({ title: "Report Generated", description: "User report downloaded successfully." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to generate report.", variant: "destructive" });
    }
  };

  const handleGenerateAdvancedReport = async (reportType: ReportType, filters: ReportFilters) => {
    try {
      await generateAdvancedUserReport(users, reportType, filters);
      toast({ title: "Success", description: "Advanced report generated successfully." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to generate advanced report.", variant: "destructive" });
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-primary text-primary-foreground';
      case 'student': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-accent text-accent-foreground';
    }
  };

  const getUsersByDepartment = (department: string) => filteredUsers.filter((user) => user.department === department);
  const getUsersWithoutDepartment = () => filteredUsers.filter((user) => !user.department);

  const renderUserCard = (user: User) => (
    <div key={user.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-semibold">{user.name}</h3>
          <Badge className={getRoleBadgeColor(user.role)}>
            {clearanceWorkflow.getDepartmentLabel(user.role)}
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
          <div><span className="font-medium">Username:</span> {user.username}</div>
          <div><span className="font-medium">Email:</span> {user.email}</div>
          {user.department && <div><span className="font-medium">Department:</span> {user.department}</div>}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Joined on {new Date(user.createdAt).toLocaleDateString()}
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => handleEditClick(user)} disabled={!isAdmin}>
          <Edit className="mr-2 h-4 w-4" /> Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(user)} disabled={!isAdmin || user.id === currentUser?.id}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </div>
    </div>
  );

  const activeDepartments = getActiveDepartments();

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-2">Manage user accounts and roles</p>
          {!isAdmin && (
            <div className="mt-4 flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
              <ShieldAlert className="h-5 w-5" />
              <span className="text-sm font-medium">You have read-only access.</span>
            </div>
          )}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search & Filter Users</CardTitle>
            <CardDescription>Find users by name, username, email, role, or department</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="space-y-2">
              <Label>Filter by Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="none">No Department</SelectItem>
                  {activeDepartments.map((dept) => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card className="mb-6">
             <CardHeader>
              <CardTitle>User Reports</CardTitle>
              <CardDescription>Generate comprehensive PDF reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <UserReportDialog
                  onGenerateReport={handleGenerateAdvancedReport}
                  departments={managedDepartments} 
                />
                <Button onClick={handleDownloadUserReport} variant="outline">
                  <FileDown className="mr-2 h-4 w-4" /> Quick Download - All Users
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedDepartment === 'all' ? (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="by-department">By Department</TabsTrigger>
              <TabsTrigger value="no-department">No Department</TabsTrigger>
              <TabsTrigger value="admins">Administrators</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <Card>
                <CardHeader><CardTitle>All Users ({filteredUsers.length})</CardTitle></CardHeader>
                <CardContent>
                  {filteredUsers.length === 0 ? <div className="text-center py-12"><p className="text-muted-foreground">No users found</p></div> : <div className="space-y-4">{filteredUsers.map(renderUserCard)}</div>}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="by-department">
              <div className="space-y-6">
                {activeDepartments.length === 0 ? <Card><CardContent className="text-center py-12"><p className="text-muted-foreground">No departments found</p></CardContent></Card> : activeDepartments.map((dept) => {
                  const deptUsers = getUsersByDepartment(dept);
                  if (deptUsers.length === 0) return null;
                  return <Card key={dept}><CardHeader><CardTitle>{dept}</CardTitle><CardDescription>{deptUsers.length} users</CardDescription></CardHeader><CardContent><div className="space-y-4">{deptUsers.map(renderUserCard)}</div></CardContent></Card>
                })}
              </div>
            </TabsContent>
            <TabsContent value="no-department">
                <Card><CardHeader><CardTitle>Users Without Department</CardTitle></CardHeader><CardContent>{getUsersWithoutDepartment().length === 0 ? <div className="text-center py-12"><p className="text-muted-foreground">All users assigned</p></div> : <div className="space-y-4">{getUsersWithoutDepartment().map(renderUserCard)}</div>}</CardContent></Card>
            </TabsContent>
            <TabsContent value="admins">
              <Card><CardHeader><CardTitle>Administrators</CardTitle></CardHeader><CardContent><div className="space-y-4">{filteredUsers.filter((u) => u.role === 'admin').map(renderUserCard)}</div></CardContent></Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardHeader><CardTitle>{selectedDepartment === 'none' ? 'Users Without Department' : `${selectedDepartment} Department`}</CardTitle></CardHeader>
            <CardContent><div className="space-y-4">{filteredUsers.map(renderUserCard)}</div></CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Information</DialogTitle>
            <DialogDescription>Update role and department for {selectedUser?.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Information</Label>
              {selectedUser && (
                <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                  <p><span className="font-medium">Name:</span> {selectedUser.name}</p>
                  <p><span className="font-medium">Email:</span> {selectedUser.email}</p>
                  {selectedUser.department && <p><span className="font-medium">Current Department:</span> {selectedUser.department}</p>}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="role">Role</Label>
                {selectedUser?.role === 'student' && (
                  <span className="text-[10px] uppercase font-bold text-amber-600 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Fixed
                  </span>
                )}
              </div>
              
              <Select 
                value={newRole} 
                onValueChange={(value) => setNewRole(value as UserRole)}
                disabled={selectedUser?.role === 'student'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="hod">Head of Department</SelectItem>
                  <SelectItem value="library">Library</SelectItem>
                  <SelectItem value="accounts">Accounts</SelectItem>
                  <SelectItem value="scholarship">Scholarship</SelectItem>
                  <SelectItem value="student_section">Student Section</SelectItem>
                  <SelectItem value="hostel_bus">Hostel/Bus</SelectItem>
                  <SelectItem value="tpo">Training & Placement</SelectItem>
                  <SelectItem value="exam_cell">Exam Cell</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
              
              {selectedUser?.role === 'student' && (
                <p className="text-[10px] text-muted-foreground">
                   The 'Student' role is permanent and cannot be changed to Staff.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Academic Department</Label>
              <Select 
                value={newDepartment} 
                onValueChange={setNewDepartment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Department (Optional)" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value=" ">No Department / General Staff</SelectItem>
                   {managedDepartments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                   ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Assigned department (Managed in Admin Dashboard)
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateRole}>Update User</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{userToDelete?.name}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground">
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}