import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { FileDown, Loader2 } from 'lucide-react';
import type { ReportType, ReportFilters } from '@/utils/advancedUserReportGenerator';

interface UserReportDialogProps {
  onGenerateReport: (reportType: ReportType, filters: ReportFilters) => Promise<void>;
  departments: string[];
}

export default function UserReportDialog({ onGenerateReport, departments }: UserReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('all_users');
  const [department, setDepartment] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const filters: ReportFilters = {};
      
      if (department && department !== 'all') filters.department = department;
      if (role && role !== 'all') filters.role = role;
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;

      await onGenerateReport(reportType, filters);
      setOpen(false);
      resetFilters();
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetFilters = () => {
    setReportType('all_users');
    setDepartment('');
    setRole('');
    setDateFrom('');
    setDateTo('');
  };

  const showDepartmentFilter = [
    'students_department',
    'staff_department',
    'department_consolidated',
  ].includes(reportType);

  const showRoleFilter = reportType === 'role_wise';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <FileDown className="mr-2 h-4 w-4" />
          Generate User Reports
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate User Report</DialogTitle>
          <DialogDescription>
            Select report type and apply filters to generate a comprehensive PDF report
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type</Label>
            <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
              <SelectTrigger id="reportType">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_users">📄 All Users Report</SelectItem>
                <SelectItem value="students_department">🎓 Students - Department Wise</SelectItem>
                <SelectItem value="staff_department">👨‍🏫 Staff - Department Wise</SelectItem>
                <SelectItem value="department_consolidated">
                  🏢 Department-Wise Consolidated
                </SelectItem>
                <SelectItem value="role_wise">🧾 Role-Wise Users</SelectItem>
                <SelectItem value="login_activity">⏱ Login & Activity Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showDepartmentFilter && (
            <div className="space-y-2">
              <Label htmlFor="department">Department Filter</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showRoleFilter && (
            <div className="space-y-2">
              <Label htmlFor="role">Role Filter</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="hod">HOD</SelectItem>
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
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Date From (Optional)</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">Date To (Optional)</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isGenerating}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  Generate PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
