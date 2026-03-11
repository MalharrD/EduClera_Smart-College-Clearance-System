import axios from 'axios';
import type { User, Student, ClearanceRequest, ClearanceApproval } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // --- NEW DEPARTMENT METHODS ---
  async getDepartments() {
    try {
      const response = await api.get('/departments');
      return response.data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      return [];
    }
  },

  async addDepartment(name: string) {
    const response = await api.post('/departments', { name });
    return response.data;
  },

  async deleteDepartment(name: string) {
    const response = await api.delete(`/departments/${encodeURIComponent(name)}`);
    return response.data;
  },
  // -----------------------------

  resolveEnrollment: async (enrollmentNumber: string): Promise<{ email: string } | null> => {
    try {
      const response = await api.post('/auth/resolve-enrollment', { enrollmentNumber });
      return response.data;
    } catch (error) {
      console.error('Error resolving enrollment:', error);
      return null;
    }
  },

  async syncUser(user: Partial<User> & { supabaseId: string }) {
    const response = await api.post('/auth/sync-user', user); 
    return response.data;
  },

  async getUserProfile(supabaseId: string) {
    const response = await api.get(`/auth/profile/${supabaseId}`); 
    return response.data;
  },

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

  async createStudentProfile(student: Partial<Student>) {
    const response = await api.post('/auth/student-profile', student); 
    return response.data;
  },

  async getAllStudents() {
    const response = await api.get('/students');
    return response.data;
  },

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

  async getApprovals(requestId: string) {
    const response = await api.get('/approvals', { params: { requestId } });
    return response.data;
  },

  async getStaffApprovals(role: string, name: string) {
    const response = await api.get('/approvals', { params: { role, name } });
    return response.data;
  },

  async updateApproval(id: string, data: { status: string; remarks?: string; approvedBy: string }) {
    const response = await api.put(`/approvals/${id}`, data);
    return response.data;
  }
};