export type UserRole = 
  | 'admin' 
  | 'student' 
  | 'teacher' 
  | 'hod' 
  | 'library' 
  | 'accounts' 
  | 'scholarship' 
  | 'student_section' 
  | 'hostel_bus' 
  | 'tpo' 
  | 'exam_cell';

export interface User {
  id: string;
  supabaseId?: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  year?: number;
  semester?: number;
  subject?: string;
  createdAt: string;
}

export interface Student {
  id?: string;
  userId: string;
  name: string;
  collegeId: string;
  enrollmentNumber: string;
  department: string;
  year: number;
  semester?: number;
  email: string;
  phone?: string;
}

export type ClearanceType = 'no_dues' | 'hall_ticket';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ClearanceApproval {
  id: string;
  requestId: string;
  department: UserRole | string;
  status: ApprovalStatus;
  assignedTo?: string; // Specific teacher ID/Name if applicable
  remarks?: string;
  approvedBy?: string; // ID/Name of the person who approved
  approvedAt?: string;
  createdAt: string;
}

export interface ClearanceRequest {
  id: string;
  studentId: string;
  type: ClearanceType;
  status: ApprovalStatus;
  submittedAt: string;
  completedAt?: string;
  pdfUrl?: string; // Make it optional
}

export interface AuthState {
  user: User | null;
  student: Student | null;
  isLoading: boolean;
}

export interface UserSession {
  id: string;
  userId: string;
  loginTime: string;
  logoutTime?: string;
  duration?: number; // in minutes
}

export interface UserActivity {
  userId: string;
  totalLogins: number;
  lastLogin?: string;
  lastLogout?: string;
  sessions: UserSession[];
  accountStatus: 'active' | 'suspended' | 'archived';
}