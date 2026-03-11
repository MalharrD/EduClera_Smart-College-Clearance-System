import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Student, AuthContextType } from '@/types';
import { supabase } from '@/lib/supabase';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const FIXED_ADMIN_EMAIL = 'admin@educlera.com';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getFixedAdminProfile = (authUserId: string, email: string): User => ({
    id: 'fixed-admin-id',
    supabaseId: authUserId,
    username: 'admin',
    name: 'System Administrator',
    email: email,
    role: 'admin',
    department: 'Management',
    password: 'secure-placeholder', 
    createdAt: new Date().toISOString()
  } as any);

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        if (session.user.email === FIXED_ADMIN_EMAIL) {
          setUser(getFixedAdminProfile(session.user.id, session.user.email));
        } else {
          await fetchProfile(session.user.id);
        }
      } else {
        setUser(null);
        setStudent(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const data = await apiService.getUserProfile(userId);
      setUser(data?.user ?? null);
      if (data?.student) setStudent(data.student);
    } catch (error) {
      console.error('Error fetching profile from Backend:', error);
    }
  };

  const login = async (identifier: string, password: string): Promise<User> => {
    let emailToUse = identifier;

    if (!identifier.includes('@')) {
      try {
        const response = await apiService.resolveEnrollment(identifier);
        if (!response?.email) throw new Error('No email found for this Enrollment ID');
        emailToUse = response.email;
      } catch (err) {
        throw new Error("Invalid Enrollment ID or unable to resolve email.");
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    });

    if (error) throw new Error(error.message);
    if (!data.user?.email) throw new Error('Login failed');

    if (data.user.email === FIXED_ADMIN_EMAIL) {
      const adminProfile = getFixedAdminProfile(data.user.id, data.user.email);
      setUser(adminProfile);
      return adminProfile;
    }

    try {
      const profileData = await apiService.getUserProfile(data.user.id);
      setUser(profileData?.user ?? null);
      if (profileData?.student) setStudent(profileData.student);
      
      if (!profileData?.user) throw new Error("User profile not found.");
      return profileData.user;
    } catch (err) {
      throw new Error("Login successful, but could not load user profile from database.");
    }
  };

  const register = async (userData: Partial<User>, studentData?: Partial<Student>) => {
    if (!userData.email || !userData.password) throw new Error('Missing credentials');

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error('Registration failed in Supabase');

    const { password, ...safeUserData } = userData;

    const newUser: any = {
      ...safeUserData,
      supabaseId: authData.user.id,
      role: userData.role || 'student',
    };

    console.log("🚀 PAYLOAD SENT TO BACKEND:", newUser);

    // 1. Create the User record in MongoDB
    const savedUser = await apiService.syncUser(newUser);
    setUser(savedUser);

    // 2. If it's a student, create the Student profile in MongoDB
    if (userData.role === 'student' && studentData) {
      try {
        const newStudent = {
          ...studentData,
          userId: authData.user.id,
        };
        const savedStudent = await apiService.createStudentProfile(newStudent);
        setStudent(savedStudent);
      } catch (studentError: any) {
        console.error("❌ Failed to create student profile:", studentError);
        // We delete the user from Supabase if the student profile fails (e.g. duplicate enrollment ID)
        await supabase.auth.signOut();
        throw new Error("Failed to register student: Enrollment ID may already exist.");
      }
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setStudent(null);
  };

  return (
    <AuthContext.Provider value={{ user, student, login, register, logout, isAuthenticated: !!user }}>
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