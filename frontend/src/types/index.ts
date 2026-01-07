export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

export type UserRole =
  | 'student'
  | 'teacher'
  | 'hod'
  | 'library'
  | 'accounts'
  | 'scholarship'
  | 'student_section'
  | 'hostel_bus'
  | 'tpo'
  | 'exam_cell'
  | 'admin';

export type ClearanceType = 'hall_ticket' | 'no_dues';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  userId: string;
  name: string;
  collegeId: string;
  enrollmentNumber: string;
  department: string;
  year: number;
  email: string;
  phone?: string;
  createdAt: string;
}

export interface ClearanceRequest {
  id: string;
  studentId: string;
  type: ClearanceType;
  status: ApprovalStatus;
  submittedAt: string;
  completedAt?: string;
  pdfUrl?: string;
}

export interface ClearanceApproval {
  id: string;
  requestId: string;
  department: UserRole;
  status: ApprovalStatus;
  remarks?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface UserSession {
  id: string;
  userId: string;
  loginTime: string;
  logoutTime?: string;
  duration?: number;
}

export interface UserActivity {
  userId: string;
  totalLogins: number;
  lastLogin?: string;
  lastLogout?: string;
  sessions: UserSession[];
  accountStatus: 'active' | 'inactive';
}

export interface AuthContextType {
  user: User | null;
  student: Student | null;
  login: (username: string, password: string) => Promise<User>;
  register: (userData: Partial<User>, studentData?: Partial<Student>) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

