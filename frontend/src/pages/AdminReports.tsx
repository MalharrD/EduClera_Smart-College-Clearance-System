import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiService } from '@/services/api'; 
import { clearanceWorkflow } from '@/services/storage'; 
import { generateRequestsSummaryPDF } from '@/utils/pdfGenerator';
import type { ClearanceRequest, Student, ClearanceApproval } from '@/types';
import { FileText, TrendingUp, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminReports() {
  const [requests, setRequests] = useState<ClearanceRequest[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [allApprovals, setAllApprovals] = useState<ClearanceApproval[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 1. Fetch Requests and Students
      const [fetchedRequests, fetchedStudents] = await Promise.all([
        apiService.getAllRequests() as Promise<ClearanceRequest[]>,
        apiService.getAllStudents() as Promise<Student[]>
      ]);

      setRequests(fetchedRequests);
      setStudents(fetchedStudents);

      // 2. Fetch Approvals for all requests
      if (fetchedRequests.length > 0) {
        const approvalPromises = fetchedRequests.map((req) => apiService.getApprovals(req.id));
        const approvalsResults = await Promise.all(approvalPromises);
        
        // Flatten the array of arrays
        const flatApprovals = approvalsResults.flat() as ClearanceApproval[];
        setAllApprovals(flatApprovals);
      }
    } catch (error) {
      console.error("Failed to load report data", error);
    }
  };

  const handleDownloadReport = async () => {
    if (requests.length === 0) {
      toast({ title: "No Data", description: "No requests to generate report.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      await generateRequestsSummaryPDF(requests, students);
      toast({ title: "Success", description: "Report downloaded successfully." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to generate PDF.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const hallTicketRequests = requests.filter((r) => r.type === 'hall_ticket');
  const noDuesRequests = requests.filter((r) => r.type === 'no_dues');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">System Reports</h1>
            <p className="text-muted-foreground mt-2">Overview of all clearance requests</p>
          </div>
          <Button onClick={handleDownloadReport} disabled={isGenerating}>
            {isGenerating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
            ) : (
              <><Download className="mr-2 h-4 w-4" /> Download Summary PDF</>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requests.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Hall Ticket</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hallTicketRequests.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">No-Dues</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{noDuesRequests.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {requests.length > 0
                  ? Math.round(
                      (requests.filter((r) => r.status === 'approved').length / requests.length) *
                        100
                    )
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Clearance Requests</CardTitle>
            <CardDescription>Complete list of all requests in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No requests found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => {
                  // Find linked student and approvals from state
                  const student = students.find(s => s.id === request.studentId);
                  const approvals = allApprovals.filter(a => a.requestId === request.id);

                  return (
                    <div
                      key={request.id}
                      className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{student?.name || 'Unknown Student'}</h3>
                            {getStatusBadge(request.status)}
                            <Badge variant="outline">
                              {request.type === 'hall_ticket' ? 'Hall Ticket' : 'No-Dues'}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">College ID:</span> {student?.collegeId || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Department:</span> {student?.department || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Submitted:</span>{' '}
                              {new Date(request.submittedAt).toLocaleDateString()}
                            </div>
                            {request.completedAt && (
                              <div>
                                <span className="font-medium">Completed:</span>{' '}
                                {new Date(request.completedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          <div className="mt-3">
                            <p className="text-sm font-medium mb-2">Department Status:</p>
                            <div className="flex flex-wrap gap-2">
                              {approvals.map((approval) => (
                                <Badge
                                  key={approval.id}
                                  variant="outline"
                                  className={
                                    approval.status === 'approved'
                                      ? 'border-success text-success'
                                      : approval.status === 'rejected'
                                        ? 'border-destructive text-destructive'
                                        : 'border-warning text-warning'
                                  }
                                >
                                  {clearanceWorkflow.getDepartmentLabel(approval.department)}:{' '}
                                  {approval.status}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
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
  );
}