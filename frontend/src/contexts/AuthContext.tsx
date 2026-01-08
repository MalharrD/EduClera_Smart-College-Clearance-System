import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Student, AuthContextType } from '@/types';
import { supabase } from '@/lib/supabase';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- CONFIGURATION: FIXED ADMIN CREDENTIALS ---
const FIXED_ADMIN_EMAIL = 'admin@educlera.com';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Helper: Create a Mock Admin Object
  const getFixedAdminProfile = (authUserId: string, email: string): User => ({
    id: 'fixed-admin-id',
    // We cast to 'any' here to avoid TypeScript complaining about 'supabaseId' 
    // being missing from your User interface in src/types/index.ts
    supabaseId: authUserId, 
    username: 'admin',
    name: 'System Administrator',
    email: email,
    role: 'admin',
    department: 'Management',
    password: 'secure-placeholder', // Added to satisfy User interface
    createdAt: new Date().toISOString() // <--- FIX: Converted to String
  } as any);

  // 1. Initialize Session on Load
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          if (session.user.email === FIXED_ADMIN_EMAIL) {
             setUser(getFixedAdminProfile(session.user.id, session.user.email));
          } else {
             await fetchProfile(session.user.id);
          }
        }
      } catch (err) {
        console.error("Session check failed", err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        if (session.user.email === FIXED_ADMIN_EMAIL) {
          setUser(getFixedAdminProfile(session.user.id, session.user.email));
        } else if (!user) { 
           await fetchProfile(session.user.id);
        }
      } else {
        setUser(null);
        setStudent(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [user]); 

  // 2. Helper to fetch data from MongoDB
  const fetchProfile = async (userId: string) => {
    try {
      const data = await apiService.getUserProfile(userId);
      setUser(data.user);
      if (data.student) setStudent(data.student);
    } catch (error) {
      console.error('Error fetching profile from Backend:', error);
    }
  };

  // 3. Login Function
  const login = async (email: string, password: string): Promise<User> => {
    // A. Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    if (!data.user || !data.user.email) throw new Error('Login failed');

    // B. SPECIAL CHECK: Is this the Fixed Admin?
    if (data.user.email === FIXED_ADMIN_EMAIL) {
      const adminProfile = getFixedAdminProfile(data.user.id, data.user.email);
      setUser(adminProfile);
      return adminProfile;
    }

    // C. Normal User
    try {
      const profileData = await apiService.getUserProfile(data.user.id);
      setUser(profileData.user);
      if (profileData.student) setStudent(profileData.student);
      return profileData.user;
    } catch (err) {
      console.error(err);
      throw new Error("Login successful, but could not load user profile from database.");
    }
  };

  // 4. Register Function
  const register = async (userData: Partial<User>, studentData?: Partial<Student>) => {
    if (!userData.email || !userData.password) throw new Error('Missing credentials');

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error('Registration failed');

    const newUser: any = {
      supabaseId: authData.user.id,
      username: userData.username,
      name: userData.name,
      email: userData.email,
      role: userData.role || 'student',
      department: userData.department,
    };

    const savedUser = await apiService.syncUser(newUser);
    setUser(savedUser);

    if (userData.role === 'student' && studentData) {
      const newStudent = {
        ...studentData,
        userId: authData.user.id,
      };
      const savedStudent = await apiService.createStudentProfile(newStudent);
      setStudent(savedStudent);
    }
  };

  // 5. Logout Function
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setStudent(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        student,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}