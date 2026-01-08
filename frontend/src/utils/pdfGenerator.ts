import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Student, ClearanceRequest, ClearanceApproval } from '@/types';
import { clearanceWorkflow } from '@/services/storage';

// Use a reliable placeholder or your uploaded URL
const DKTE_LOGO_URL = 'https://miaoda-conversation-file.s3cdn.medo.dev/user-845wqo7mn94w/conv-845wum9wqhog/20251210/file-852rchre4v0g.png';

interface CertificateData {
  student: Student;
  request: ClearanceRequest;
  approvals: ClearanceApproval[];
}

// Helper to check if certificate can be generated
export const canGenerateCertificate = (
  request: ClearanceRequest,
  approvals: ClearanceApproval[]
): boolean => {
  // 1. Request must be approved
  if (request.status !== 'approved') return false;

  // 2. All required departments must have approved
  if (request.type === 'no_dues') {
    const requiredDepts = clearanceWorkflow.getAllDepartmentsForType('no_dues');
    return requiredDepts.every(dept => 
      approvals.some(a => a.department === dept && a.status === 'approved')
    );
  }
  
  return true; 
};

// Helper to load image securely
const loadImageAsBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error('Network response was not ok');
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(''); // Resolve empty on error
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Could not load certificate logo, generating without it.', error);
    return ''; 
  }
};

const formatDateTime = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getDepartmentDisplayName = (role: string): string => {
  return clearanceWorkflow.getDepartmentLabel(role as any) || role.toUpperCase();
};

// --- NO DUES CERTIFICATE ---
export const generateNoDuesCertificate = async (data: CertificateData): Promise<void> => {
  const { student, request, approvals } = data;
  await generateCommonCertificate(data, 'NO-DUES CLEARANCE CERTIFICATE', 'This is to certify that the above-mentioned student has successfully cleared all dues from the respective departments.');
};

// --- HALL TICKET CERTIFICATE ---
export const generateHallTicketCertificate = async (data: CertificateData): Promise<void> => {
  await generateCommonCertificate(data, 'HALL TICKET CLEARANCE', 'This is to certify that the above-mentioned student has cleared all necessary requirements and is eligible for Hall Ticket issuance.');
};

// --- COMMON CERTIFICATE GENERATOR LOGIC ---
const generateCommonCertificate = async (
  { student, request, approvals }: CertificateData,
  title: string,
  declarationText: string
): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // --- 1. LOGO & HEADER ---
  const logoBase64 = await loadImageAsBase64(DKTE_LOGO_URL);
  if (logoBase64) {
    const logoWidth = 40;
    const logoHeight = 12; 
    const logoX = (pageWidth - logoWidth) / 2;
    try {
      doc.addImage(logoBase64, 'PNG', logoX, yPosition, logoWidth, logoHeight);
      yPosition += logoHeight + 5;
    } catch (e) {
      console.warn("Error adding image to PDF", e);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 51, 102);
  doc.text("DKTE SOCIETY'S YASHWANTRAO CHAVAN POLYTECHNIC", pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text('Ichalkaranji, Kolhapur, Maharashtra - 416115', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 102, 51); 
  doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  // --- 2. STUDENT DETAILS ---
  doc.setDrawColor(0);
  doc.setFillColor(245, 247, 250);
  doc.rect(margin, yPosition, pageWidth - (margin * 2), 45, 'F');
  
  const startDetailY = yPosition + 8;
  const leftColX = margin + 5;
  const rightColX = pageWidth / 2 + 5;
  
  doc.setFontSize(11);
  doc.setTextColor(0);

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.text('Student Name:', leftColX, startDetailY);
  doc.setFont('helvetica', 'normal');
  doc.text(student.name, leftColX + 35, startDetailY);

  doc.setFont('helvetica', 'bold');
  doc.text('Enrollment No:', rightColX, startDetailY);
  doc.setFont('helvetica', 'normal');
  doc.text(student.enrollmentNumber, rightColX + 35, startDetailY);

  // Row 2
  const row2Y = startDetailY + 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Department:', leftColX, row2Y);
  doc.setFont('helvetica', 'normal');
  doc.text(student.department, leftColX + 35, row2Y);

  doc.setFont('helvetica', 'bold');
  doc.text('Year:', rightColX, row2Y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${student.year} Year`, rightColX + 35, row2Y);

  // Row 3
  const row3Y = row2Y + 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Request ID:', leftColX, row3Y);
  doc.setFont('helvetica', 'normal');
  doc.text(request.id ? request.id.slice(-6).toUpperCase() : 'N/A', leftColX + 35, row3Y);

  doc.setFont('helvetica', 'bold');
  doc.text('Issue Date:', rightColX, row3Y);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDateTime(request.completedAt || new Date().toISOString()), rightColX + 35, row3Y);

  yPosition += 55;

  // --- 3. APPROVAL TABLE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 51, 102);
  doc.text('Departmental Clearance Status', margin, yPosition);
  yPosition += 5;

  // Determine which departments to show
  let relevantDepts: string[] = [];
  if (request.type === 'no_dues') {
     relevantDepts = clearanceWorkflow.getAllDepartmentsForType('no_dues');
  } else {
     // For hall ticket, show whatever approvals exist
     relevantDepts = approvals.map(a => a.department);
  }
  
  const tableData = relevantDepts.map((dept, index) => {
    const approval = approvals.find((a) => a.department === dept);
    const status = approval?.status === 'approved' ? 'CLEARED' : (approval?.status || 'PENDING');
    return [
      index + 1,
      getDepartmentDisplayName(dept),
      approval?.remarks || '-',
      status.toUpperCase(),
      approval?.approvedAt ? formatDateTime(approval.approvedAt) : '-',
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['Sr.', 'Department', 'Remarks', 'Status', 'Date']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [0, 51, 102], 
      textColor: 255, 
      halign: 'center',
      fontStyle: 'bold' 
    },
    bodyStyles: {
      halign: 'center',
      fontSize: 10
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { halign: 'left', cellWidth: 50 },
      2: { halign: 'left' },
      3: { fontStyle: 'bold', textColor: [0, 100, 0] }
    },
    margin: { left: margin, right: margin },
  });

  // --- 4. DECLARATION & FOOTER ---
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0);
  const splitDec = doc.splitTextToSize(declarationText, pageWidth - (margin * 2));
  doc.text(splitDec, margin, finalY);

  // Signatures
  const sigY = pageHeight - 40;
  
  doc.setLineWidth(0.5);
  doc.line(margin, sigY, margin + 50, sigY); 
  doc.setFont('helvetica', 'bold');
  doc.text('Student Signature', margin, sigY + 5);
  
  doc.line(pageWidth - margin - 50, sigY, pageWidth - margin, sigY); 
  doc.text('Principal / HOD', pageWidth - margin - 50, sigY + 5);

  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Generated by EduClera System | Verifiable Digital Document`, pageWidth / 2, pageHeight - 10, { align: 'center' });

  doc.save(`${title.replace(/ /g, '_')}_${student.enrollmentNumber}.pdf`);
};

// --- NEW: SUMMARY REPORT FOR ADMIN ---
export const generateRequestsSummaryPDF = async (
  requests: ClearanceRequest[],
  students: Student[]
): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'landscape', // Landscape for table
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPosition = margin;

  // Header
  const logoBase64 = await loadImageAsBase64(DKTE_LOGO_URL);
  if (logoBase64) {
    const logoWidth = 40;
    const logoHeight = 12;
    doc.addImage(logoBase64, 'PNG', (pageWidth - logoWidth) / 2, yPosition, logoWidth, logoHeight);
    yPosition += 15;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 51, 102);
  doc.text('SYSTEM CLEARANCE REPORTS', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 7;

  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`Generated on: ${formatDateTime(new Date().toISOString())}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Stats
  const total = requests.length;
  const approved = requests.filter(r => r.status === 'approved').length;
  const pending = requests.filter(r => r.status === 'pending').length;
  
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Total Requests: ${total}   |   Approved: ${approved}   |   Pending: ${pending}`, margin, yPosition);
  yPosition += 5;

  // Table Data
  const tableData = requests.map((req, index) => {
    const student = students.find(s => s.id === req.studentId);
    return [
      index + 1,
      student?.name || 'Unknown',
      student?.enrollmentNumber || '-',
      student?.department || '-',
      req.type === 'hall_ticket' ? 'Hall Ticket' : 'No-Dues',
      formatDateTime(req.submittedAt),
      req.status.toUpperCase()
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['Sr.', 'Student Name', 'Enrollment', 'Department', 'Type', 'Submitted Date', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 51, 102],
      textColor: 255,
      halign: 'center',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 9,
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { halign: 'left', cellWidth: 50 },
      2: { cellWidth: 30 },
      3: { cellWidth: 35 },
      4: { cellWidth: 30 },
      6: { fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin }
  });

  doc.save(`System_Clearance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};