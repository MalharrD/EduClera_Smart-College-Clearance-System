import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { clearanceWorkflow } from '@/services/storage'; // Keep this file for workflow constants
import { apiService } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { useSupabaseUpload } from '@/hooks/use-supabase-upload';
import type { ClearanceType, ClearanceRequest, ClearanceApproval } from '@/types';
import { 
  FileText, 
  Loader2, 
  CheckCircle2, 
  ClipboardCheck, 
  User, 
  Hash,
  UploadCloud,
  X
} from 'lucide-react';

const NOC_SUBJECTS = [
  { name: "Linear Integrated Circuits", faculty: "Mr. S. A. Shinde" },
  { name: "Consumer Electronics", faculty: "Mrs. R. S. Ghat" },
  { name: "Microcontroller And Applications", faculty: "Miss. A. A. Gajare" },
  { name: "Basic Power Electronics", faculty: "Mr. S. A. Shinde" },
  { name: "Digital Communication Systems", faculty: "Miss. R. S. Ladage" },
  { name: "Maintenance of Electronics Equipment and EDA Tools Practices", faculty: "Miss. A. A. Gajare" }
];

export default function SubmitRequest() {
  const [clearanceType, setClearanceType] = useState<ClearanceType | 'noc_submission'>('hall_ticket');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { student } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // --- SUPABASE FILE UPLOAD HOOK ---
  const { 
    files, 
    setFiles, 
    onUpload, 
    getRootProps, 
    getInputProps, 
    isDragActive,
    loading: isUploading
  } = useSupabaseUpload({
    supabase,
    bucketName: 'documents', // Ensure this bucket exists in Supabase Storage
    maxFiles: 1,
    allowedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg'],
  });

  if (!student) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading student profile...</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Upload File (if exists)
      let uploadedUrl = '';
      if (files.length > 0) {
        await onUpload();
        const { data } = supabase.storage
          .from('documents')
          .getPublicUrl(files[0].name);
        uploadedUrl = data.publicUrl;
      }

      // 2. Prepare Request Data
      const requestId = `req_${Date.now()}`;
      const newRequest: ClearanceRequest = {
        id: requestId,
        studentId: student.id,
        type: (clearanceType === 'noc_submission' ? 'no_dues' : clearanceType) as ClearanceType,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        pdfUrl: uploadedUrl,
      };

      // 3. Prepare Approval Data
      let approvals: ClearanceApproval[] = [];

      if (clearanceType === 'noc_submission') {
        approvals = NOC_SUBJECTS.map((sub, index) => ({
          id: `approval_${requestId}_${index}`,
          requestId,
          department: sub.name as any, 
          status: 'pending',
          createdAt: new Date().toISOString(),
          assignedTo: sub.faculty, 
        }));
      } else {
        const departments = clearanceWorkflow.getAllDepartmentsForType(clearanceType as ClearanceType);
        approvals = departments.map((dept) => ({
          id: `approval_${Date.now()}_${dept}`,
          requestId,
          department: dept,
          status: 'pending',
          createdAt: new Date().toISOString(),
        }));
      }

      // 4. Send to Backend
      await apiService.createRequest({ request: newRequest, approvals });

      toast({ 
        title: 'Request Submitted Successfully',
        description: 'You can now track the progress of your clearance.' 
      });
      
      setTimeout(() => navigate('/track-status'), 1000);
    } catch (error) {
      console.error(error);
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
  const noDuesIndependent = clearanceWorkflow.getNoDuesIndependentDepartments();
  const noDuesSequential = clearanceWorkflow.getNoDuesSequentialDepartments();

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
                      <User className="h-4 w-4" /> Student Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Full Name</Label>
                        <p className="font-medium text-sm">{student.name}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">College ID / Roll No.</Label>
                        <p className="font-medium text-sm flex items-center gap-1">
                          <Hash className="h-3 w-3" /> {student.collegeId}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Type Selection */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Select Clearance Type</Label>
                    <RadioGroup value={clearanceType} onValueChange={(v) => setClearanceType(v as any)} className="grid gap-4">
                      
                      <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-all">
                        <RadioGroupItem value="noc_submission" id="noc_submission" className="mt-1" />
                        <Label htmlFor="noc_submission" className="cursor-pointer">
                          <div className="font-semibold text-primary">(NOC-FORM) - For Submission</div>
                          <p className="text-xs text-muted-foreground mt-1">Subject-wise clearance for Manuals & Micro-projects.</p>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-all">
                        <RadioGroupItem value="hall_ticket" id="hall_ticket" className="mt-1" />
                        <Label htmlFor="hall_ticket" className="cursor-pointer">
                          <div className="font-semibold">Hall Ticket Clearance</div>
                          <p className="text-xs text-muted-foreground mt-1">Standard exam hall ticket approval process.</p>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-all">
                        <RadioGroupItem value="no_dues" id="no_dues" className="mt-1" />
                        <Label htmlFor="no_dues" className="cursor-pointer">
                          <div className="font-semibold">No-Dues Clearance</div>
                          <p className="text-xs text-muted-foreground mt-1">Final institutional clearance for graduation.</p>
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
                            <span className="truncate max-w-[200px]">{file.name}</span>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setFiles([]);
                              }}
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
            {clearanceType === 'noc_submission' && (
              <Card className="border-primary/50 bg-primary/5 shadow-sm">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><ClipboardCheck className="h-4 w-4" /> NOC Subject List</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {NOC_SUBJECTS.map((sub, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">{sub.name}</p>
                        <p className="text-muted-foreground text-[10px]">{sub.faculty}</p>
                      </div>
                    </div>
                  ))}
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

            {clearanceType === 'no_dues' && (
              <Card className="shadow-sm">
                <CardHeader><CardTitle className="text-base font-bold text-foreground">No-Dues Workflow</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Independent Processing</p>
                    <div className="space-y-2">
                      {noDuesIndependent.map((dept) => (
                        <div key={dept} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>{clearanceWorkflow.getDepartmentLabel(dept)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Sequential Steps</p>
                    <div className="space-y-3">
                      {noDuesSequential.map((dept, index) => (
                        <div key={dept} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-[10px] font-bold">{index + 1}</div>
                          <p className="text-xs pt-0.5 font-medium">{clearanceWorkflow.getDepartmentLabel(dept)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}