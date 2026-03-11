import type {
  User,
  Student,
  ClearanceRequest,
  ClearanceApproval,
  UserRole,
  ClearanceType,
  ApprovalStatus,
  UserSession,
  UserActivity,
} from '@/types';

const STORAGE_KEYS = {
  USERS: 'educlear_users',
  STUDENTS: 'educlear_students',
  REQUESTS: 'educlear_requests',
  APPROVALS: 'educlear_approvals',
  CURRENT_USER: 'educlear_current_user',
  USER_SESSIONS: 'educlear_user_sessions',
  USER_ACTIVITIES: 'educlear_user_activities',
};

export const storageService = {
  getUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  setUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  addUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    this.setUsers(users);
  },

  updateUser(userId: string, updates: Partial<User>): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      this.setUsers(users);
    }
  },

  deleteUser(userId: string): void {
    const users = this.getUsers();
    const filteredUsers = users.filter((u) => u.id !== userId);
    this.setUsers(filteredUsers);
  },

  getUserByUsername(username: string): User | null {
    const users = this.getUsers();
    return users.find((u) => u.username === username) || null;
  },

  getUserById(id: string): User | null {
    const users = this.getUsers();
    return users.find((u) => u.id === id) || null;
  },

  getStudents(): Student[] {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return data ? JSON.parse(data) : [];
  },

  setStudents(students: Student[]): void {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  },

  addStudent(student: Student): void {
    const students = this.getStudents();
    students.push(student);
    this.setStudents(students);
  },

  getStudentByUserId(userId: string): Student | null {
    const students = this.getStudents();
    return students.find((s) => s.userId === userId) || null;
  },

  getStudentById(id: string): Student | null {
    const students = this.getStudents();
    return students.find((s) => s.id === id) || null;
  },

  getRequests(): ClearanceRequest[] {
    const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return data ? JSON.parse(data) : [];
  },

  setRequests(requests: ClearanceRequest[]): void {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  },

  addRequest(request: ClearanceRequest): void {
    const requests = this.getRequests();
    requests.push(request);
    this.setRequests(requests);
  },

  updateRequest(requestId: string, updates: Partial<ClearanceRequest>): void {
    const requests = this.getRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index !== -1) {
      requests[index] = { ...requests[index], ...updates };
      this.setRequests(requests);
    }
  },

  getRequestById(id: string): ClearanceRequest | null {
    const requests = this.getRequests();
    return requests.find((r) => r.id === id) || null;
  },

  getRequestsByStudentId(studentId: string): ClearanceRequest[] {
    const requests = this.getRequests();
    return requests.filter((r) => r.studentId === studentId);
  },

  getApprovals(): ClearanceApproval[] {
    const data = localStorage.getItem(STORAGE_KEYS.APPROVALS);
    return data ? JSON.parse(data) : [];
  },

  setApprovals(approvals: ClearanceApproval[]): void {
    localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(approvals));
  },

  addApproval(approval: ClearanceApproval): void {
    const approvals = this.getApprovals();
    approvals.push(approval);
    this.setApprovals(approvals);
  },

  updateApproval(approvalId: string, updates: Partial<ClearanceApproval>): void {
    const approvals = this.getApprovals();
    const index = approvals.findIndex((a) => a.id === approvalId);
    if (index !== -1) {
      approvals[index] = { ...approvals[index], ...updates };
      this.setApprovals(approvals);
    }
  },

  getApprovalsByRequestId(requestId: string): ClearanceApproval[] {
    const approvals = this.getApprovals();
    return approvals.filter((a) => a.requestId === requestId);
  },

  getApprovalByRequestAndDepartment(
    requestId: string,
    department: UserRole | string
  ): ClearanceApproval | null {
    const approvals = this.getApprovals();
    return approvals.find((a) => a.requestId === requestId && a.department === department) || null;
  },

  getCurrentUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  initializeSampleData(): void {
    // Relying on MongoDB
  },

  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  },

  getUserSessions(): UserSession[] {
    const data = localStorage.getItem(STORAGE_KEYS.USER_SESSIONS);
    return data ? JSON.parse(data) : [];
  },

  setUserSessions(sessions: UserSession[]): void {
    localStorage.setItem(STORAGE_KEYS.USER_SESSIONS, JSON.stringify(sessions));
  },

  addUserSession(session: UserSession): void {
    const sessions = this.getUserSessions();
    sessions.push(session);
    this.setUserSessions(sessions);
  },

  updateUserSession(sessionId: string, updates: Partial<UserSession>): void {
    const sessions = this.getUserSessions();
    const index = sessions.findIndex((s) => s.id === sessionId);
    if (index !== -1) {
      sessions[index] = { ...sessions[index], ...updates };
      this.setUserSessions(sessions);
    }
  },

  getUserActivities(): UserActivity[] {
    const data = localStorage.getItem(STORAGE_KEYS.USER_ACTIVITIES);
    return data ? JSON.parse(data) : [];
  },

  setUserActivities(activities: UserActivity[]): void {
    localStorage.setItem(STORAGE_KEYS.USER_ACTIVITIES, JSON.stringify(activities));
  },

  getUserActivity(userId: string): UserActivity | null {
    const activities = this.getUserActivities();
    return activities.find((a) => a.userId === userId) || null;
  },

  updateUserActivity(userId: string, updates: Partial<UserActivity>): void {
    const activities = this.getUserActivities();
    const index = activities.findIndex((a) => a.userId === userId);
    
    if (index !== -1) {
      activities[index] = { ...activities[index], ...updates };
    } else {
      activities.push({
        userId,
        totalLogins: 0,
        sessions: [],
        accountStatus: 'active',
        ...updates,
      } as UserActivity);
    }
    
    this.setUserActivities(activities);
  },

  recordLogin(userId: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const loginTime = new Date().toISOString();

    const session: UserSession = {
      id: sessionId,
      userId,
      loginTime,
    };

    this.addUserSession(session);

    const activity = this.getUserActivity(userId);
    const sessions = this.getUserSessions().filter((s) => s.userId === userId);
    
    this.updateUserActivity(userId, {
      totalLogins: (activity?.totalLogins || 0) + 1,
      lastLogin: loginTime,
      sessions,
      accountStatus: 'active',
    });

    return sessionId;
  },

  recordLogout(userId: string): void {
    const sessions = this.getUserSessions();
    const userSessions = sessions.filter((s) => s.userId === userId && !s.logoutTime);
    
    if (userSessions.length > 0) {
      const lastSession = userSessions[userSessions.length - 1];
      const logoutTime = new Date().toISOString();
      const loginDate = new Date(lastSession.loginTime);
      const logoutDate = new Date(logoutTime);
      const duration = Math.floor((logoutDate.getTime() - loginDate.getTime()) / 1000 / 60);

      this.updateUserSession(lastSession.id, {
        logoutTime,
        duration,
      });

      const updatedSessions = this.getUserSessions().filter((s) => s.userId === userId);
      
      this.updateUserActivity(userId, {
        lastLogout: logoutTime,
        sessions: updatedSessions,
      });
    }
  },
};

export const clearanceWorkflow = {
  // --- STRICT SEQUENTIAL HALL TICKET WORKFLOW ---
  getHallTicketDepartments(): UserRole[] {
    return ['teacher', 'hod', 'exam_cell', 'accounts', 'scholarship'];
  },

  getNoDuesIndependentDepartments(): UserRole[] {
    return ['library', 'hostel_bus', 'tpo', 'exam_cell'];
  },

  getNoDuesSequentialDepartments(): UserRole[] {
    return ['student_section', 'scholarship', 'accounts'];
  },

  getAllDepartmentsForType(type: ClearanceType): UserRole[] {
    if (type === 'hall_ticket') {
      return this.getHallTicketDepartments();
    }
    return [...this.getNoDuesIndependentDepartments(), ...this.getNoDuesSequentialDepartments()];
  },

  // --- SMART APPROVAL LOGIC ---
  canApprove(
    requestId: string,
    department: UserRole | string, // Updated to accept dynamic strings (Subject Names)
    type: ClearanceType,
    existingApprovals?: ClearanceApproval[] 
  ): { canApprove: boolean; reason?: string } {
    
    const approvals = existingApprovals || storageService.getApprovalsByRequestId(requestId);

    // ============================================
    // HALL TICKET LOGIC (Strict Chronological Check)
    // ============================================
    if (type === 'hall_ticket') {
      const departments = this.getHallTicketDepartments();
      const currentIndex = departments.indexOf(department as UserRole);

      // If department is not in the list at all
      if (currentIndex === -1) {
        return { canApprove: false, reason: 'Your role is not part of the Hall Ticket workflow.' };
      }

      // Step 1: Teacher (Always allowed to approve immediately)
      if (currentIndex === 0) {
        return { canApprove: true };
      }

      // Steps 2-5: Must wait for the previous department to approve
      const previousDept = departments[currentIndex - 1];
      const previousApproval = approvals.find((a) => a.department === previousDept);

      if (!previousApproval || previousApproval.status !== 'approved') {
        const humanReadableName = this.getDepartmentLabel(previousDept);
        return { canApprove: false, reason: `Waiting for ${humanReadableName} to approve first.` };
      }

      // If previous step is approved, this step is unlocked
      return { canApprove: true };
    }

    // ============================================
    // NO DUES LOGIC
    // ============================================
    const sequentialDepts = this.getNoDuesSequentialDepartments();

    // 1. If the department is in the strictly sequential list, check chronological order
    if (sequentialDepts.includes(department as UserRole)) {
      const currentIndex = sequentialDepts.indexOf(department as UserRole);

      if (currentIndex === 0) {
        return { canApprove: true };
      }

      const previousDept = sequentialDepts[currentIndex - 1];
      const previousApproval = approvals.find((a) => a.department === previousDept);

      if (!previousApproval || previousApproval.status !== 'approved') {
        const humanReadableName = this.getDepartmentLabel(previousDept);
        return { canApprove: false, reason: `Waiting for ${humanReadableName} approval.` };
      }

      return { canApprove: true };
    }

    // 2. If it is NOT sequential, it means it's an Independent Department, HOD, Exam Cell, or a Subject Teacher
    // They are allowed to approve instantly without waiting.
    return { canApprove: true };
  },

  updateRequestStatus(requestId: string): void {
    // Server handles this automatically in node.js backend now
  },

  getDepartmentLabel(role: UserRole | string): string {
    const labels: Record<string, string> = {
      student: 'Student',
      teacher: 'Class Teacher', 
      hod: 'Head of Department',
      library: 'Library',
      accounts: 'Accounts Section',
      scholarship: 'Scholarship Section',
      student_section: 'Student Section',
      hostel_bus: 'Hostel/Bus',
      tpo: 'Training & Placement',
      exam_cell: 'Exam Section',
      admin: 'Administrator',
    };
    return labels[role] || role; // If it's a dynamic subject like "Data Structures", it returns the subject name directly
  },
};