import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiService } from '@/services/api';
import { clearanceWorkflow } from '@/services/storage';
import type { ClearanceRequest, ClearanceApproval } from '@/types';
import { CheckCircle2, XCircle, Clock, Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  generateNoDuesCertificate, 
  generateHallTicketCertificate, 
  canGenerateCertificate 
} from '@/utils/pdfGenerator'; // <--- UPDATED IMPORT

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
        handleRequestSelect(studentRequests[0]);
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

    // Check if certificate logic allows it
    if (selectedRequest.type === 'no_dues') {
      if (!canGenerateCertificate(selectedRequest, approvals)) {
        toast({
          title: 'Certificate Not Available',
          description: 'Please ensure all departments have approved your request.',
          variant: 'destructive',
        });
        return;
      }
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
        // --- CHANGED: Use PDF Generator for Hall Tickets too ---
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

  const isCertificateReady = selectedRequest?.status === 'approved' && 
    (selectedRequest.type === 'hall_ticket' || canGenerateCertificate(selectedRequest, approvals));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-destructive" />;
      default: return <Clock className="h-5 w-5 text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Track Clearance Status</h1>
          <p className="text-muted-foreground mt-2">Monitor your request progress</p>
        </div>

        {requests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p>No requests found.</p>
              <Button onClick={() => window.location.href = '/submit-request'} className="mt-4">
                Submit Request
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Your Requests</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {requests.map((req) => (
                    <button
                      key={req.id}
                      onClick={() => handleRequestSelect(req)}
                      className={`w-full text-left p-3 rounded border ${selectedRequest?.id === req.id ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{req.type === 'hall_ticket' ? 'Hall Ticket' : 'No-Dues'}</span>
                        <Badge variant={req.status === 'approved' ? 'default' : req.status === 'rejected' ? 'destructive' : 'secondary'}>
                          {req.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(req.submittedAt).toLocaleDateString()}</span>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="xl:col-span-2 space-y-6">
              {selectedRequest && (
                <>
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Request Details</CardTitle>
                        {isCertificateReady ? (
                          <Button onClick={handleDownloadCertificate} className="bg-green-600 hover:bg-green-700">
                            <Download className="mr-2 h-4 w-4" /> Download Certificate
                          </Button>
                        ) : (
                          <Button disabled variant="outline">
                            <Clock className="mr-2 h-4 w-4" /> Pending Approval
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                       <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div><span className="text-muted-foreground">ID:</span> {selectedRequest.id}</div>
                          <div><span className="text-muted-foreground">Date:</span> {new Date(selectedRequest.submittedAt).toLocaleDateString()}</div>
                       </div>
                       
                       <div className="space-y-3">
                         <h3 className="font-medium">Department Status</h3>
                         {approvals.map((app) => (
                           <div key={app.id} className="flex justify-between items-center p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                {getStatusIcon(app.status)}
                                <span>{clearanceWorkflow.getDepartmentLabel(app.department)}</span>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline">{app.status}</Badge>
                                {app.remarks && <p className="text-xs text-muted-foreground mt-1">{app.remarks}</p>}
                              </div>
                           </div>
                         ))}
                       </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}