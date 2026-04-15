import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiService } from '@/services/api';
import { clearanceWorkflow } from '@/services/storage';
import type { ClearanceRequest, ClearanceApproval } from '@/types';
import { CheckCircle2, XCircle, Clock, Download, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  generateNoDuesCertificate, 
  generateHallTicketCertificate, 
  canGenerateCertificate 
} from '@/utils/pdfGenerator'; 

export default function TrackStatus() {
  const [searchParams] = useSearchParams();
  const { student } = useAuth();
  const [requests, setRequests] = useState<ClearanceRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ClearanceRequest | null>(null);
  const [approvals, setApprovals] = useState<ClearanceApproval[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (student) {
      loadRequests();
    }
  }, [student]);

  useEffect(() => {
    const requestId = searchParams.get('request');
    if (requestId && requests.length > 0) {
      const found = requests.find(r => r.id === requestId);
      if (found) {
        handleRequestSelect(found);
      }
    }
  }, [searchParams, requests]);

  const loadRequests = async () => {
    if (!student) return;
    try {
      const studentRequests = await apiService.getStudentRequests(student.id);
      setRequests(studentRequests);
      
      if (studentRequests.length > 0 && !selectedRequest && !searchParams.get('request')) {
        handleRequestSelect(studentRequests[studentRequests.length - 1]); 
      }
    } catch (error) {
      console.error("Failed to load requests", error);
    }
  };

  const loadApprovals = async (requestId: string) => {
    try {
      const requestApprovals = await apiService.getApprovals(requestId);
      setApprovals(requestApprovals);
    } catch (error) {
      console.error("Failed to load approvals", error);
    }
  };

  const handleRequestSelect = (request: ClearanceRequest) => {
    setSelectedRequest(request);
    loadApprovals(request.id);
  };

  const handleDownloadCertificate = async () => {
    if (!selectedRequest || !student) return;

    if (!canGenerateCertificate(selectedRequest, approvals)) {
      toast({
        title: 'Certificate Not Available',
        description: 'Please ensure all departments have approved your request.',
        variant: 'destructive',
      });
      return;
    }

    try {
      toast({ title: "Generating PDF...", description: "Please wait while we generate your certificate." });
      
      if (selectedRequest.type === 'no_dues') {
        await generateNoDuesCertificate({
          student,
          request: selectedRequest,
          approvals,
        });
      } else {
        await generateHallTicketCertificate({
          student,
          request: selectedRequest,
          approvals,
        });
      }

      toast({
        title: 'Success',
        description: 'Certificate downloaded successfully.',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate the PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!student) return <div className="p-8 text-center">Loading...</div>;

  const isCertificateReady = selectedRequest?.status === 'approved' && canGenerateCertificate(selectedRequest, approvals);

  const getStatusIcon = (status: string) => {
    if (status === 'approved') return <CheckCircle2 className="h-6 w-6 text-green-500 bg-green-50 rounded-full" />;
    if (status === 'rejected') return <XCircle className="h-6 w-6 text-red-500 bg-red-50 rounded-full" />;
    return <Clock className="h-6 w-6 text-yellow-500 bg-yellow-50 rounded-full" />;
  };

  // Group Approvals based on the new logic
  const independentOrder = clearanceWorkflow.getNoDuesIndependentDepartments();
  const sequentialOrder = clearanceWorkflow.getNoDuesSequentialDepartments();
  
  const subjectApprovals = approvals.filter(a => !independentOrder.includes(a.department as any) && !sequentialOrder.includes(a.department as any));
  
  const independentApprovals = independentOrder.map(dept => 
    approvals.find(a => a.department === dept)
  ).filter(Boolean) as ClearanceApproval[];

  const sequentialApprovals = sequentialOrder.map(dept => 
    approvals.find(a => a.department === dept)
  ).filter(Boolean) as ClearanceApproval[];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Track Clearance Status</h1>
            <p className="text-muted-foreground mt-2">Monitor your request progress</p>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card border rounded-xl shadow-sm">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold">No Clearances Found</h2>
            <p className="text-muted-foreground mb-6">You haven't submitted any clearance requests yet.</p>
            <Button onClick={() => window.location.href = '/submit-request'}>Submit Request Now</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Sidebar: Request History List */}
            <div className="space-y-4">
              <Card className="shadow-sm">
                <CardHeader className="bg-primary/5 pb-4 border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" /> Request History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                  {requests.map((req) => (
                    <button
                      key={req.id}
                      onClick={() => handleRequestSelect(req)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                        selectedRequest?.id === req.id 
                          ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary' 
                          : 'hover:border-primary/50 hover:bg-accent/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm">
                          {req.type === 'hall_ticket' ? 'Hall Ticket' : 'No-Dues Form'}
                        </span>
                        <Badge variant={req.status === 'approved' ? 'default' : req.status === 'rejected' ? 'destructive' : 'secondary'}
                               className={req.status === 'approved' ? 'bg-green-500' : ''}>
                          {req.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>{new Date(req.submittedAt).toLocaleDateString()}</span>
                        <span className="font-mono text-[10px]">{req.id.split('_')[1]}</span>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content: Selected Request Tracking Timeline */}
            <div className="lg:col-span-2 space-y-6">
              {selectedRequest && (
                <Card className="shadow-lg border-t-4 border-t-primary overflow-hidden">
                  <CardHeader className="bg-background pb-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        {selectedRequest.type === 'no_dues' ? 'No Dues Tracking' : 'Hall Ticket Tracking'}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Request ID: <span className="font-mono">{selectedRequest.id}</span>
                      </CardDescription>
                    </div>
                    
                    {isCertificateReady ? (
                      <Button onClick={handleDownloadCertificate} className="bg-green-600 hover:bg-green-700 shadow-md">
                        <Download className="mr-2 h-4 w-4" /> Download Certificate
                      </Button>
                    ) : (
                      <Badge variant="outline" className="px-4 py-2 text-sm bg-muted/50 whitespace-nowrap">
                        <Clock className="mr-2 h-4 w-4 text-warning" /> Pending Final Approval
                      </Badge>
                    )}
                  </CardHeader>
                  
                  <CardContent className="p-6 sm:p-10 bg-muted/10">
                    <div className="space-y-12 relative">
                      
                      <div className="absolute left-[18px] sm:left-9 top-4 bottom-4 w-0.5 bg-border -z-10"></div>

                      {/* SECTION 1: Subject Clearances */}
                      {subjectApprovals.length > 0 && (
                        <div className="space-y-6">
                          <h3 className="text-sm font-bold uppercase tracking-wider bg-background border px-3 py-1 rounded-full text-muted-foreground w-max ml-12 sm:ml-16 shadow-sm">
                            1. Subject Approvals
                          </h3>
                          {subjectApprovals.map((approval) => (
                            <div key={approval.id} className="flex gap-4 sm:gap-6 items-start relative">
                              <div className="bg-background p-1 rounded-full">{getStatusIcon(approval.status)}</div>
                              <div className="flex-1 border rounded-xl p-4 bg-background shadow-sm transition-all hover:shadow-md">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                  <div>
                                    <h4 className="font-bold text-base">{clearanceWorkflow.getDepartmentLabel(approval.department)}</h4>
                                    <p className="text-sm text-muted-foreground">Assigned: {approval.assignedTo || 'Faculty'}</p>
                                  </div>
                                  <Badge variant={approval.status === 'approved' ? 'default' : 'outline'} className={approval.status === 'approved' ? 'bg-green-500' : ''}>
                                    {approval.status}
                                  </Badge>
                                </div>
                                {approval.remarks && (
                                  <p className="mt-3 text-sm bg-muted/50 border-l-2 border-primary/50 pl-3 py-2 rounded-r text-muted-foreground italic">
                                    "{approval.remarks}"
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* SECTION 2: Independent Clearances */}
                      {independentApprovals.length > 0 && (
                        <div className="space-y-6">
                          <h3 className="text-sm font-bold uppercase tracking-wider bg-blue-100 border border-blue-200 text-blue-700 px-3 py-1 rounded-full w-max ml-12 sm:ml-16 shadow-sm">
                            2. Independent Clearances
                          </h3>
                          {independentApprovals.map((approval) => (
                            <div key={approval.id} className="flex gap-4 sm:gap-6 items-start relative">
                              <div className="bg-background p-1 rounded-full">{getStatusIcon(approval.status)}</div>
                              <div className="flex-1 border border-blue-100 rounded-xl p-4 bg-white shadow-sm transition-all">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                  <div>
                                    <h4 className="font-bold text-base">{clearanceWorkflow.getDepartmentLabel(approval.department)}</h4>
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Independent Step</p>
                                  </div>
                                  <Badge variant={approval.status === 'approved' ? 'default' : 'outline'} className={approval.status === 'approved' ? 'bg-green-500' : ''}>
                                    {approval.status}
                                  </Badge>
                                </div>
                                {approval.remarks && (
                                  <p className="mt-3 text-sm bg-blue-50/50 border pl-3 py-2 rounded text-muted-foreground italic">
                                    "{approval.remarks}"
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* SECTION 3: Sequential Institutional Clearances */}
                      {sequentialApprovals.length > 0 && (
                        <div className="space-y-6">
                          <h3 className="text-sm font-bold uppercase tracking-wider bg-background border px-3 py-1 rounded-full text-muted-foreground w-max ml-12 sm:ml-16 shadow-sm">
                            3. Final Office (Sequential)
                          </h3>
                          {sequentialApprovals.map((approval, index) => {
                            const isLocked = approval.status === 'pending' && index > 0 && sequentialApprovals[index - 1].status !== 'approved';
                            
                            return (
                              <div key={approval.id} className={`flex gap-4 sm:gap-6 items-start relative ${isLocked ? 'opacity-60' : ''}`}>
                                <div className="bg-background p-1 rounded-full z-10">
                                  {getStatusIcon(approval.status)}
                                </div>
                                <div className={`flex-1 border rounded-xl p-4 shadow-sm transition-all ${approval.status === 'approved' ? 'bg-background border-green-200' : isLocked ? 'bg-muted/10 border-dashed' : 'bg-white border-yellow-200'}`}>
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-muted-foreground bg-accent px-2 py-0.5 rounded-md uppercase">Step {index + 1}</span>
                                        <h4 className={`font-bold text-base ${approval.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'}`}>
                                          {clearanceWorkflow.getDepartmentLabel(approval.department)}
                                        </h4>
                                      </div>
                                    </div>
                                    <Badge variant={approval.status === 'approved' ? 'default' : 'secondary'} className={approval.status === 'approved' ? 'bg-green-500' : ''}>
                                      {isLocked ? 'LOCKED' : approval.status}
                                    </Badge>
                                  </div>
                                  {isLocked && <p className="text-xs text-warning mt-2 italic">Requires approval from {clearanceWorkflow.getDepartmentLabel(sequentialApprovals[index-1].department)} first.</p>}
                                  {approval.remarks && (
                                    <div className="mt-3 text-sm bg-background border p-3 rounded-lg">
                                      <span className="font-semibold text-xs text-muted-foreground uppercase">Remarks:</span>
                                      <p className="mt-1 text-foreground">"{approval.remarks}"</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                      
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}