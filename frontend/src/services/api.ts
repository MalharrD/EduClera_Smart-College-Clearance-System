import axios from 'axios';
import type { User, Student, ClearanceRequest, ClearanceApproval } from '@/types';

const API_URL = 'http://localhost:5000/api';

// Create an axios instance for cleaner calls
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // --- AUTH HELPERS ---
  /**
   * Resolves an Enrollment ID to an Email address.
   * Required for Supabase login using Enrollment ID.
   */
  resolveEnrollment: async (enrollmentNumber: string): Promise<{ email: string } | null> => {
    try {
      const response = await api.post('/auth/resolve-enrollment', { enrollmentNumber });
      return response.data;
    } catch (error) {
      console.error('Error resolving enrollment:', error);
      // We return null here so the UI can handle the "ID not found" error gracefully
      return null;
    }
  },

  // --- USER & PROFILE ---
  async syncUser(user: Partial<User> & { supabaseId: string }) {
    const response = await api.post('/auth/sync-user', user); // Changed endpoint to match AuthController
    return response.data;
  },

  async getUserProfile(supabaseId: string) {
    const response = await api.get(`/auth/profile/${supabaseId}`); // Changed to use the new Auth/Profile route
    return response.data;
  },

  // --- ADMIN USER MANAGEMENT ---
  async getAllUsers() {
    const response = await api.get('/users');
    return response.data;
  },

  async updateUser(id: string, updates: Partial<User>) {
    const response = await api.put(`/users/${id}`, updates);
    return response.data;
  },

  async deleteUser(id: string) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // --- STUDENT & DATA ---
  async createStudentProfile(student: Partial<Student>) {
    const response = await api.post('/auth/student-profile', student); // Changed to match AuthController
    return response.data;
  },

  async getAllStudents() {
    const response = await api.get('/students');
    return response.data;
  },

  // --- REQUESTS ---
  async createRequest(payload: { request: ClearanceRequest; approvals: ClearanceApproval[] }) {
    const response = await api.post('/requests', payload);
    return response.data;
  },

  async getAllRequests() {
    const response = await api.get('/requests');
    return response.data;
  },

  async getStudentRequests(studentId: string) {
    const response = await api.get(`/requests/student/${studentId}`);
    return response.data;
  },

  // --- APPROVALS ---
  async getApprovals(requestId: string) {
    const response = await api.get('/approvals', { params: { requestId } });
    return response.data;
  },

  async getStaffApprovals(role: string, name: string) {
    const response = await api.get('/approvals', { 
      params: { role, name } 
    });
    return response.data;
  },

  async updateApproval(id: string, data: { status: string; remarks?: string; approvedBy: string }) {
    const response = await api.put(`/approvals/${id}`, data);
    return response.data;
  }
};