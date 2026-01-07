import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import Header from './components/common/Header';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import StaffAccess from './pages/StaffAccess';
import StaffRoles from './pages/StaffRoles';
import StaffLogin from './pages/StaffLogin';
import StudentDashboard from './pages/StudentDashboard';
import SubmitRequest from './pages/SubmitRequest';
import TrackStatus from './pages/TrackStatus';
import DepartmentDashboard from './pages/DepartmentDashboard';
import DepartmentRequests from './pages/DepartmentRequests';
import HODDashboard from './pages/HODDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminReports from './pages/AdminReports';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster />
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/staff-access" element={<StaffAccess />} />
              <Route path="/staff-roles" element={<StaffRoles />} />
              <Route path="/staff-login/:role" element={<StaffLogin />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/submit-request"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <SubmitRequest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/track-status"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <TrackStatus />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/department/dashboard"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      'teacher',
                      'hod',
                      'library',
                      'accounts',
                      'scholarship',
                      'student_section',
                      'hostel_bus',
                      'tpo',
                      'exam_cell',
                    ]}
                  >
                    <DepartmentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/department/requests"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      'teacher',
                      'hod',
                      'library',
                      'accounts',
                      'scholarship',
                      'student_section',
                      'hostel_bus',
                      'tpo',
                      'exam_cell',
                    ]}
                  >
                    <DepartmentRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hod/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['hod']}>
                    <HODDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminReports />
                  </ProtectedRoute>
                }
              />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
