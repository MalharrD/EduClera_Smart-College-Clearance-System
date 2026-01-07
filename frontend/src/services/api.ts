import axios from 'axios';
import type { User, Student, ClearanceRequest, ClearanceApproval } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; 

export const apiService = {
  // --- USER & PROFILE ---
  async syncUser(user: Partial<User> & { supabaseId: string }) {
    const response = await axios.post(`${API_URL}/users`, user);
    return response.data;
  },

  async getUserProfile(supabaseId: string) {
    const response = await axios.get(`${API_URL}/users/${supabaseId}`);
    return response.data; 
  },

  // --- ADMIN USER MANAGEMENT ---
  async getAllUsers() {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  },

  async updateUser(id: string, updates: Partial<User>) {
    const response = await axios.put(`${API_URL}/users/${id}`, updates);
    return response.data;
  },

  async deleteUser(id: string) {
    const response = await axios.delete(`${API_URL}/users/${id}`);
    return response.data;
  },

  // --- STUDENT & DATA ---
  async createStudentProfile(student: Partial<Student>) {
    const response = await axios.post(`${API_URL}/students`, student);
    return response.data;
  },

  async getAllStudents() {
    const response = await axios.get(`${API_URL}/students`);
    return response.data;
  },

  // --- REQUESTS ---
  async createRequest(payload: { request: ClearanceRequest; approvals: ClearanceApproval[] }) {
    const response = await axios.post(`${API_URL}/requests`, payload);
    return response.data;
  },

  async getAllRequests() {
    const response = await axios.get(`${API_URL}/requests`);
    return response.data;
  },

  async getStudentRequests(studentId: string) {
    const response = await axios.get(`${API_URL}/requests/student/${studentId}`);
    return response.data;
  },

  // --- APPROVALS ---
  async getApprovals(requestId: string) {
    const response = await axios.get(`${API_URL}/approvals`, { params: { requestId } });
    return response.data;
  },

  async getStaffApprovals(role: string, name: string) {
    const response = await axios.get(`${API_URL}/approvals`, { 
      params: { role, name } 
    });
    return response.data;
  },

  async updateApproval(id: string, data: { status: string; remarks?: string; approvedBy: string }) {
    const response = await axios.put(`${API_URL}/approvals/${id}`, data);
    return response.data;
  }
};