import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiService } from '@/services/api';
import { clearanceWorkflow } from '@/services/storage';
import type { ClearanceApproval, ClearanceRequest, Student } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, FileText, AlertCircle, ExternalLink } from 'lucide-react';

export default function DepartmentRequests() {
  const { user } = useAuth();
  
  // Data State
  const [myApprovals, setMyApprovals] = useState<ClearanceApproval[]>([]);
  const [requestsMap, setRequestsMap] = useState<Record<string, ClearanceRequest>>({});
  const [studentsMap, setStudentsMap] = useState<Record<string, Student>>({});
  const [fullApprovalsMap, setFullApprovalsMap] = useState<Record<string, ClearanceApproval[]>>({}); 

  // UI State
  const [selectedApproval, setSelectedApproval] = useState<ClearanceApproval | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      // 1. Fetch tasks assigned specifically to this staff
      const myTasks = await apiService.getStaffApprovals(user.role, user.name);
      setMyApprovals(myTasks);

      if (myTasks.length === 0) return;

      // 2. Fetch all Requests & Students to lookup details
      const [allReqs, allStuds] = await Promise.all([
        apiService.getAllRequests(),
        apiService.getAllStudents()
      ]);

      const reqMap: Record<string, ClearanceRequest> = {};
      allReqs.forEach((r: ClearanceRequest) => {
        if (r.id) reqMap[r.id] = r;
      });
      setRequestsMap(reqMap);

      const studMap: Record<string, Student> = {};
      allStuds.forEach((s: Student) => {
        if (s.id) studMap[s.id] = s;
      });
      setStudentsMap(studMap);

      // 3. Fetch full approval history
      const distinctRequestIds = [...new Set(myTasks.map((t: ClearanceApproval) => t.requestId))];
      
      if (distinctRequestIds.length > 0) {
        const historyPromises = distinctRequestIds.map((id) => apiService.getApprovals(id as string));
        const histories = await Promise.all(historyPromises);

        const appMap: Record<string, ClearanceApproval[]> = {};
        histories.forEach((list, index) => {
          appMap[distinctRequestIds[index] as string] = list;
        });
        setFullApprovalsMap(appMap);
      }

    } catch (error) {
      console.error("Failed to load requests", error);
      toast({ title: "Error", description: "Failed to load request data.", variant: "destructive" });
    }
  };

  const handleActionClick = (
    approval: ClearanceApproval,
    action: 'approve' | 'reject'
  ) => {
    const request = requestsMap[approval.requestId];
    
    if (!request) {
       if (action === 'reject') {
          setSelectedApproval(approval);
          setActionType('reject');
          setRemarks('Data mismatch / Request not found');
          setIsDialogOpen(true);
          return;
       }
       toast({ title: "Error", description: "Cannot approve: Request details not found.", variant: "destructive" });
       return;
    }

    const requestApprovals = fullApprovalsMap[approval.requestId] || [];
    const canApprove = clearanceWorkflow.canApprove(request.id, user!.role, request.type, requestApprovals);
    
    if (!canApprove.canApprove && action === 'approve') {
      toast({
        title: 'Cannot Process Request',
        description: canApprove.reason,
        variant: 'destructive',
      });
      return;
    }

    setSelectedApproval(approval);
    setActionType(action);
    setRemarks('');
    setIsDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedApproval || !user) return;

    try {
      await apiService.updateApproval(selectedApproval.id, {
        status: actionType === 'approve' ? 'approved' : 'rejected',
        remarks: remarks.trim() || undefined,
        approvedBy: user.id,
      });

      toast({
        title: `Request ${actionType === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `The clearance request has been processed successfully.`,
      });

      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

  const pendingApprovals = myApprovals.filter((a) => a.status === 'pending');
  const processedApprovals = myApprovals.filter((a) => a.status !== 'pending');

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Clearance Requests</h1>
          <p className="text-muted-foreground mt-2">
            Review and process student clearance requests
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>
                Requests awaiting your approval ({pendingApprovals.length})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.map((approval) => {
                    const request = requestsMap[approval.requestId];
                    const student = request ? studentsMap[request.studentId] : null;

                    if (!request || !student) {
                      return (
                        <Card key={approval.id} className="border-destructive/50 bg-destructive/5">
                           <CardContent className="pt-6 flex justify-between items-center">
                              <div>
                                 <h3 className="font-semibold text-destructive flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" /> Data Mismatch
                                 </h3>
                                 <p className="text-sm text-muted-foreground mt-1">
                                    Approval ID: {approval.id.substring(0, 8)}...<br/>
                                    Request ID: {approval.requestId} (Not Found)
                                 </p>
                              </div>
                              <Button variant="destructive" size="sm" onClick={() => handleActionClick(approval, 'reject')}>
                                 Clear (Reject)
                              </Button>
                           </CardContent>
                        </Card>
                      );
                    }

                    const requestApprovals = fullApprovalsMap[approval.requestId] || [];
                    const canApprove = clearanceWorkflow.canApprove(
                      request.id,
                      user.role,
                      request.type,
                      requestApprovals
                    );

                    return (
                      <Card key={approval.id}>
                        <CardContent className="pt-6">
                          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-lg font-semibold">{student.name}</h3>
                                <Badge variant="outline">
                                  {request.type === 'hall_ticket' ? 'Hall Ticket' : 'No-Dues'}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div><p className="text-muted-foreground">College ID</p><p className="font-medium">{student.collegeId}</p></div>
                                <div><p className="text-muted-foreground">Enrollment</p><p className="font-medium">{student.enrollmentNumber}</p></div>
                                <div><p className="text-muted-foreground">Department</p><p className="font-medium">{student.department}</p></div>
                                <div><p className="text-muted-foreground">Year</p><p className="font-medium">{student.year}</p></div>
                              </div>

                              <div className="mt-3 text-sm text-muted-foreground">
                                Submitted on {new Date(request.submittedAt).toLocaleString()}
                              </div>

                              {/* --- DOCUMENT VIEWER BUTTON --- */}
                              {request.pdfUrl && (
                                <div className="mt-3">
                                   <a 
                                     href={request.pdfUrl} 
                                     target="_blank" 
                                     rel="noopener noreferrer"
                                     className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md border border-blue-200 transition-colors"
                                   >
                                     <FileText className="h-4 w-4" />
                                     View Attached Document
                                     <ExternalLink className="h-3 w-3 ml-1 opacity-50" />
                                   </a>
                                </div>
                              )}

                              {!canApprove.canApprove && (
                                <div className="mt-3 flex items-center gap-2 text-sm text-warning">
                                  <AlertCircle className="h-4 w-4" />
                                  <span>{canApprove.reason}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Button variant="outline" onClick={() => handleActionClick(approval, 'reject')}>
                                <XCircle className="mr-2 h-4 w-4" /> Reject
                              </Button>
                              <Button onClick={() => handleActionClick(approval, 'approve')} disabled={!canApprove.canApprove}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Approve
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Processed Requests</CardTitle>
              <CardDescription>
                Previously approved or rejected requests ({processedApprovals.length})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {processedApprovals.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No processed requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {processedApprovals.map((approval) => {
                    const request = requestsMap[approval.requestId];
                    const student = request ? studentsMap[request.studentId] : null;

                    return (
                      <div key={approval.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border border-border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-medium">{student ? student.name : 'Unknown Student'}</p>
                            <Badge className={approval.status === 'approved' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}>
                              {approval.status === 'approved' ? 'Approved' : 'Rejected'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {student ? student.collegeId : 'N/A'} | {request ? request.type : 'N/A'}
                          </p>
                          {request?.pdfUrl && (
                             <a href={request.pdfUrl} target="_blank" className="text-xs text-blue-500 hover:underline mt-1 block">View Document</a>
                          )}
                          {approval.remarks && (
                            <p className="text-sm text-muted-foreground mt-2">Remarks: {approval.remarks}</p>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {approval.approvedAt && new Date(approval.approvedAt).toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === 'approve' ? 'Approve' : 'Reject'} Clearance Request</DialogTitle>
            <DialogDescription>Process this request.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks {actionType === 'reject' && <span className="text-destructive">*</span>}</Label>
              <Textarea
                id="remarks"
                placeholder={actionType === 'approve' ? 'Add any comments (optional)' : 'Please provide a reason for rejection'}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
              />
            </div>
            {actionType === 'reject' && !remarks.trim() && (
              <p className="text-sm text-destructive">Remarks are required for rejection</p>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleConfirmAction}
              disabled={actionType === 'reject' && !remarks.trim()}
              variant={actionType === 'approve' ? 'default' : 'destructive'}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}