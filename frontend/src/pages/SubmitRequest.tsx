import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { clearanceWorkflow } from '@/services/storage';
import { apiService } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { useSupabaseUpload } from '@/hooks/use-supabase-upload';
import type { ClearanceType, ClearanceRequest, ClearanceApproval, User } from '@/types';
import { 
  FileText, 
  Loader2, 
  CheckCircle2, 
  ClipboardCheck, 
  User as UserIcon, 
  Hash,
  UploadCloud,
  X
} from 'lucide-react';

export default function SubmitRequest() {
  const [clearanceType, setClearanceType] = useState<ClearanceType>('hall_ticket');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // --- Dynamic Teachers State ---
  const [departmentTeachers, setDepartmentTeachers] = useState<User[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);

  const { student } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const uploadPath = student ? `requests/${student.id}` : 'requests/guest';

  const { 
    files, setFiles, onUpload, getRootProps, getInputProps, isDragActive, loading: isUploading
  } = useSupabaseUpload({
    supabase, bucketName: 'documents', path: uploadPath, maxFiles: 1, allowedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg'],
  });

  // Get local profile overrides if the student changed them in the dashboard
  const savedProfileStr = student ? localStorage.getItem(`student_profile_${student.id}`) : null;
  const localProfile = savedProfileStr ? JSON.parse(savedProfileStr) : null;
  
  const displayYear = localProfile?.year || student?.year;
  const displayName = localProfile?.name || student?.name;

  // --- Fetch Dynamic Teachers based on Student's Dept & Updated Year ---
  useEffect(() => {
    if (student) {
      setIsLoadingTeachers(true);
      apiService.getAllUsers()
        .then((users: User[]) => {
          const matchingTeachers = users.filter((u) => 
            u.role === 'teacher' &&
            u.department?.trim().toLowerCase() === student.department.trim().toLowerCase() &&
            String(u.year) === String(displayYear)
          );
          setDepartmentTeachers(matchingTeachers);
        })
        .catch(err => console.error("Failed to fetch teachers", err))
        .finally(() => setIsLoadingTeachers(false));
    }
  }, [student, displayYear]);

  if (!student) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading student profile...</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (clearanceType === 'no_dues' && departmentTeachers.length === 0) {
      toast({
        title: 'Submission Blocked',
        description: `No faculty members found for ${student.department} (Year ${displayYear}). Please contact your HOD.`,
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedUrl = '';
      if (files.length > 0) {
        await onUpload();
        const filePath = `${uploadPath}/${files[0].name}`;
        const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
        uploadedUrl = data.publicUrl;
      }

      const requestId = `req_${Date.now()}`;
      const newRequest: ClearanceRequest = {
        id: requestId,
        studentId: student.id,
        type: clearanceType,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        pdfUrl: uploadedUrl,
      };

      let approvals: ClearanceApproval[] = [];

      // NO DUES: Assign to Subject Teachers AND HOD, Accounts, Scholarship, Exam Cell
      if (clearanceType === 'no_dues') {
        const teacherApprovals = departmentTeachers.map((teacher, index) => ({
          id: `approval_${requestId}_teacher_${index}`,
          requestId,
          department: (teacher.subject || 'General Subject') as any, // Store Subject as Department Name
          status: 'pending',
          createdAt: new Date().toISOString(),
          assignedTo: teacher.name,
        }));

        const institutionalDepts = ['hod', 'accounts', 'scholarship', 'exam_cell'];
        const institutionalApprovals = institutionalDepts.map((dept, index) => ({
          id: `approval_${requestId}_dept_${index}`,
          requestId,
          department: dept as any,
          status: 'pending',
          createdAt: new Date().toISOString(),
          assignedTo: '', // Unassigned, so any staff in this role can approve
        }));

        approvals = [...teacherApprovals, ...institutionalApprovals];
      } 
      // HALL TICKET logic remains the same
      else {
        const departments = clearanceWorkflow.getAllDepartmentsForType(clearanceType);
        approvals = departments.map((dept) => ({
          id: `approval_${Date.now()}_${dept}`,
          requestId,
          department: dept,
          status: 'pending',
          createdAt: new Date().toISOString(),
        }));
      }

      await apiService.createRequest({ request: newRequest, approvals });

      toast({ 
        title: 'Request Submitted Successfully',
        description: 'You can now track the progress of your clearance.' 
      });
      
      setTimeout(() => navigate('/track-status'), 1000);
    } catch (error) {
      toast({ 
        title: 'Submission Failed', 
        description: 'Please check your connection and try again.',
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hallTicketDepts = clearanceWorkflow.getHallTicketDepartments();

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-foreground">Submit Clearance Request</h1>
          <p className="text-muted-foreground mt-2">Verify your details and choose the required clearance form.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Request Details</CardTitle>
                <CardDescription>Select the form you wish to submit</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  
                  {/* Student Info */}
                  <div className="bg-muted/50 p-4 rounded-lg border border-border space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <UserIcon className="h-4 w-4" /> Student Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Full Name</Label>
                        <p className="font-medium text-sm">{displayName}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">College ID / Roll No.</Label>
                        <p className="font-medium text-sm flex items-center gap-1">
                          <Hash className="h-3 w-3" /> {student.collegeId}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Department & Year</Label>
                        <p className="font-medium text-sm">{student.department} (Year {displayYear})</p>
                      </div>
                    </div>
                  </div>

                  {/* Type Selection */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Select Clearance Type</Label>
                    <RadioGroup value={clearanceType} onValueChange={(v) => setClearanceType(v as ClearanceType)} className="grid gap-4">
                      
                      <div className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${clearanceType === 'no_dues' ? 'bg-primary/5 border-primary ring-1 ring-primary' : 'hover:bg-accent/50'}`}>
                        <RadioGroupItem value="no_dues" id="no_dues" className="mt-1" />
                        <Label htmlFor="no_dues" className="cursor-pointer w-full">
                          <div className="font-semibold text-primary">No Dues Certificate (Full Clearance)</div>
                          <p className="text-xs text-muted-foreground mt-1">Requires approval from Subject Teachers, HOD, Accounts, Scholarship, and Exam Cell.</p>
                        </Label>
                      </div>

                      <div className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${clearanceType === 'hall_ticket' ? 'bg-primary/5 border-primary ring-1 ring-primary' : 'hover:bg-accent/50'}`}>
                        <RadioGroupItem value="hall_ticket" id="hall_ticket" className="mt-1" />
                        <Label htmlFor="hall_ticket" className="cursor-pointer w-full">
                          <div className="font-semibold">Hall Ticket Clearance</div>
                          <p className="text-xs text-muted-foreground mt-1">Standard exam hall ticket approval process from departments.</p>
                        </Label>
                      </div>

                    </RadioGroup>
                  </div>

                  {/* File Upload UI */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Attach Supporting Documents (Optional)</Label>
                    <div 
                      {...getRootProps()} 
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <div className="flex flex-col items-center gap-2">
                        <UploadCloud className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PDF or Images (max 5MB)</p>
                      </div>
                    </div>

                    {files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {files.map((file) => (
                          <div key={file.name} className="flex items-center justify-between p-2 bg-muted rounded border text-sm">
                            <span className="truncate max-w-[200px] flex items-center gap-2">
                               <FileText className="h-4 w-4" /> {file.name}
                            </span>
                            <Button 
                              type="button" variant="ghost" size="sm" 
                              onClick={(e) => { e.stopPropagation(); setFiles([]); }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full h-12 text-lg shadow-sm" disabled={isSubmitting || isUploading}>
                    {isSubmitting || isUploading ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {isUploading ? 'Uploading...' : 'Submitting...'}</>
                    ) : (
                      <><FileText className="mr-2 h-5 w-5" /> Submit Request</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Sidebar */}
          <div className="space-y-6">
            {clearanceType === 'no_dues' && (
              <Card className="border-primary/50 bg-primary/5 shadow-sm">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><ClipboardCheck className="h-4 w-4" /> Clearance Steps</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {isLoadingTeachers ? (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading steps...
                    </div>
                  ) : departmentTeachers.length > 0 ? (
                    <>
                      {/* Subject Teachers */}
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">1. Subject Clearances (Year {displayYear})</p>
                        {departmentTeachers.map((teacher, index) => (
                          <div key={teacher.id || index} className="flex items-start gap-2 text-xs">
                            <CheckCircle2 className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-foreground">{teacher.subject || 'General Subject'}</p>
                              <p className="text-muted-foreground text-[10px]">{teacher.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Institutional Clearances */}
                      <div className="pt-3 border-t space-y-3 mt-3">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">2. Institutional Clearances</p>
                        {['HOD', 'Accounts', 'Scholarship', 'Exam Cell'].map((dept, index) => (
                          <div key={`inst-${index}`} className="flex items-start gap-2 text-xs">
                            <CheckCircle2 className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-foreground">{dept}</p>
                              <p className="text-muted-foreground text-[10px]">Department Approval</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-destructive">No faculty found for your department and year. Clearance cannot be requested.</p>
                  )}
                </CardContent>
              </Card>
            )}

            {clearanceType === 'hall_ticket' && (
              <Card className="shadow-sm">
                <CardHeader><CardTitle className="text-base">Hall Ticket Steps</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {hallTicketDepts.map((dept, index) => (
                    <div key={dept} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">{index + 1}</div>
                        {index < hallTicketDepts.length - 1 && <div className="w-0.5 h-4 bg-border" />}
                      </div>
                      <p className="text-sm pt-0.5">{clearanceWorkflow.getDepartmentLabel(dept)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}