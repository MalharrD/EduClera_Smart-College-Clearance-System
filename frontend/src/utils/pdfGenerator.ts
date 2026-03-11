import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Student, ClearanceRequest, ClearanceApproval, User } from '@/types';
import { clearanceWorkflow } from '@/services/storage';
import { apiService } from '@/services/api';

const DKTE_LOGO_URL = 'https://miaoda-conversation-file.s3cdn.medo.dev/user-845wqo7mn94w/conv-845wum9wqhog/20251210/file-852rchre4v0g.png';

interface CertificateData {
  student: Student;
  request: ClearanceRequest;
  approvals: ClearanceApproval[];
}

export const canGenerateCertificate = (
  request: ClearanceRequest,
  approvals: ClearanceApproval[]
): boolean => {
  if (request.status !== 'approved') return false;
  return approvals.every(a => a.status === 'approved'); 
};

const loadImageAsBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error('Network response was not ok');
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
    });
  } catch (error) {
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
  if (role === 'accounts') return 'Account Section';
  if (role === 'scholarship') return 'Scholarship Section';
  if (role === 'exam_cell') return 'Exam Section';
  if (role === 'hod') return 'Department / H.O.D';
  const label = clearanceWorkflow.getDepartmentLabel(role as any);
  return label ? label : role;
};

// --- CUSTOM NO DUES CERTIFICATE (PURE DATABASE-DRIVEN) ---
export const generateNoDuesCertificate = async ({ student, approvals }: CertificateData): Promise<void> => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = margin + 5;

  // 0. Fetch Users dynamically to translate IDs to Names
  let allUsers: User[] = [];
  try {
    allUsers = await apiService.getAllUsers();
  } catch (e) {
    console.warn("Could not fetch users to map names.");
  }

  // 1. Header Text (No Logo to prevent overlap)
  doc.setFont('times', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("DKTE SOCIETY'S YASHWANTRAO CHAVAN POLYTECHNIC, ICHALKARANJI", pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;
  doc.text(`Department – ${student.department || 'N/A'}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;
  
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text("(NOC FORM)- For Submission", pageWidth / 2, yPos, { align: 'center' });
  doc.setLineWidth(0.4);
  doc.line(pageWidth / 2 - 32, yPos + 1, pageWidth / 2 + 32, yPos + 1); // Underline Title
  yPos += 12;

  // 2. Student Info Details (Actual DB Data Only)
  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  const col1 = margin;
  const col2 = pageWidth / 2 + 10;

  doc.text(`Student Name:  ${student.name}`, col1, yPos);
  doc.text(`Mobile No.:  ${student.phone || 'N/A'}`, col2, yPos);
  yPos += 8;

  doc.text(`Enrollment No:   ${student.enrollmentNumber}`, col1, yPos);
  doc.text(`Year:  ${student.year} Year`, col2, yPos);
  yPos += 10;

  // 3. Office Section Table (Institutional Approvals)
  const instDepts = ['hod', 'scholarship', 'accounts', 'exam_cell'];
  const instApprovals = approvals.filter(a => instDepts.includes(a.department as string));
  
  // Sort them to match typical order
  instApprovals.sort((a, b) => instDepts.indexOf(a.department as string) - instDepts.indexOf(b.department as string));

  const officeData = instApprovals.map((app, index) => {
    let approverName = app.approvedBy || app.assignedTo || '-';
    if ((approverName.length === 24 || approverName.length === 36) && !approverName.includes(' ')) {
      const foundUser = allUsers.find(u => u.id === approverName || u.supabaseId === approverName);
      if (foundUser) approverName = foundUser.name;
    }
    
    return [
      index + 1,
      getDepartmentDisplayName(app.department),
      approverName,
      app.status === 'approved' ? `APPROVED\n(${formatDateTime(app.approvedAt || '')})` : 'PENDING'
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Sr.No.', 'Office Section', 'Name of Authority', 'Signature & Date']],
    body: officeData,
    theme: 'grid',
    headStyles: { fillColor: [245, 245, 245], textColor: 0, fontStyle: 'bold', halign: 'center', lineWidth: 0.2, lineColor: 0 },
    bodyStyles: { textColor: 0, halign: 'center', valign: 'middle', lineWidth: 0.2, lineColor: 0, fontSize: 10 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'left', fontStyle: 'bold' },
      2: { halign: 'left' },
      3: { halign: 'center', fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin }
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // 4. Subject Clearance Form Table (Real Subjects from DB)
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.text("CLEARANCE FORM (SUBJECTS)", pageWidth / 2, yPos, { align: 'center' });
  doc.line(pageWidth / 2 - 35, yPos + 1, pageWidth / 2 + 35, yPos + 1);
  yPos += 6;

  const subjectApprovals = approvals.filter(a => !instDepts.includes(a.department as string));
  const subjData = subjectApprovals.map((app, index) => {
    let approverName = app.approvedBy || app.assignedTo || '-';
    if ((approverName.length === 24 || approverName.length === 36) && !approverName.includes(' ')) {
      const foundUser = allUsers.find(u => u.id === approverName || u.supabaseId === approverName);
      if (foundUser) approverName = foundUser.name;
    }

    return [
      index + 1,
      app.department, // Subject Name
      approverName,
      app.status === 'approved' ? `APPROVED\n${formatDateTime(app.approvedAt || '')}` : 'PENDING'
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Sr.No.', 'Subject Name', 'Name of Faculty', 'Faculty Sign & Date']],
    body: subjData,
    theme: 'grid',
    headStyles: { fillColor: [245, 245, 245], textColor: 0, fontStyle: 'bold', halign: 'center', valign: 'middle', lineWidth: 0.2, lineColor: 0 },
    bodyStyles: { textColor: 0, halign: 'center', valign: 'middle', lineWidth: 0.2, lineColor: 0, fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { halign: 'left' },
      2: { halign: 'left' },
      3: { fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin }
  });

  // 5. Footer Signatures
  yPos = (doc as any).lastAutoTable.finalY + 30;
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text("Student Signature", margin + 10, yPos);
  doc.text("H.O.D. Sign.", pageWidth - margin - 35, yPos);

  doc.save(`NOC_FORM_${student.enrollmentNumber}.pdf`);
};

// --- HALL TICKET CERTIFICATE ---
export const generateHallTicketCertificate = async (data: CertificateData): Promise<void> => {
  await generateCommonCertificate(data, 'HALL TICKET CLEARANCE', 'This is to certify that the above-mentioned student has cleared all necessary requirements and is eligible for Hall Ticket issuance.');
};

// --- COMMON CERTIFICATE GENERATOR (For Hall Ticket) ---
const generateCommonCertificate = async (
  { student, request, approvals }: CertificateData,
  title: string,
  declarationText: string
): Promise<void> => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  const logoBase64 = await loadImageAsBase64(DKTE_LOGO_URL);
  if (logoBase64) {
    const logoWidth = 24;
    const logoHeight = 24; 
    doc.addImage(logoBase64, 'PNG', (pageWidth - logoWidth) / 2, yPosition, logoWidth, logoHeight);
    yPosition += logoHeight + 5;
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

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 102, 51); 
  doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  doc.setDrawColor(0);
  doc.setFillColor(245, 247, 250);
  doc.rect(margin, yPosition, pageWidth - (margin * 2), 45, 'F');
  
  const startDetailY = yPosition + 8;
  const leftColX = margin + 5;
  const rightColX = pageWidth / 2 + 5;
  
  doc.setFontSize(11);
  doc.setTextColor(0);

  doc.setFont('helvetica', 'bold');
  doc.text('Student Name:', leftColX, startDetailY);
  doc.setFont('helvetica', 'normal');
  doc.text(student.name, leftColX + 35, startDetailY);

  doc.setFont('helvetica', 'bold');
  doc.text('Enrollment No:', rightColX, startDetailY);
  doc.setFont('helvetica', 'normal');
  doc.text(student.enrollmentNumber, rightColX + 35, startDetailY);

  const row2Y = startDetailY + 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Department:', leftColX, row2Y);
  doc.setFont('helvetica', 'normal');
  doc.text(student.department, leftColX + 35, row2Y);

  doc.setFont('helvetica', 'bold');
  doc.text('Year:', rightColX, row2Y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${student.year} Year`, rightColX + 35, row2Y);

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

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 51, 102);
  doc.text('Departmental Clearance Status', margin, yPosition);
  yPosition += 5;
  
  const tableData = approvals.map((approval, index) => {
    const status = approval?.status === 'approved' ? 'CLEARED' : (approval?.status || 'PENDING');
    return [
      index + 1,
      getDepartmentDisplayName(approval.department),
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
    headStyles: { fillColor: [0, 51, 102], textColor: 255, halign: 'center', fontStyle: 'bold' },
    bodyStyles: { halign: 'center', fontSize: 10 },
    columnStyles: { 0: { cellWidth: 15 }, 1: { halign: 'left', cellWidth: 50 }, 2: { halign: 'left' }, 3: { fontStyle: 'bold', textColor: [0, 100, 0] } },
    margin: { left: margin, right: margin },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0);
  const splitDec = doc.splitTextToSize(declarationText, pageWidth - (margin * 2));
  doc.text(splitDec, margin, finalY);

  const sigY = pageHeight - 40;
  doc.setLineWidth(0.5);
  doc.line(margin, sigY, margin + 50, sigY); 
  doc.setFont('helvetica', 'bold');
  doc.text('Student Signature', margin, sigY + 5);
  doc.line(pageWidth - margin - 50, sigY, pageWidth - margin, sigY); 
  doc.text('Principal / HOD', pageWidth - margin - 50, sigY + 5);

  doc.save(`${title.replace(/ /g, '_')}_${student.enrollmentNumber}.pdf`);
};

// --- SUMMARY REPORT FOR ADMIN ---
export const generateRequestsSummaryPDF = async (
  requests: ClearanceRequest[],
  students: Student[]
): Promise<void> => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPosition = margin;

  const logoBase64 = await loadImageAsBase64(DKTE_LOGO_URL);
  if (logoBase64) {
    const logoWidth = 24;
    const logoHeight = 24;
    doc.addImage(logoBase64, 'PNG', (pageWidth - logoWidth) / 2, yPosition, logoWidth, logoHeight);
    yPosition += logoHeight + 5;
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

  const total = requests.length;
  const approved = requests.filter(r => r.status === 'approved').length;
  const pending = requests.filter(r => r.status === 'pending').length;
  
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Total Requests: ${total}   |   Approved: ${approved}   |   Pending: ${pending}`, margin, yPosition);
  yPosition += 5;

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
    headStyles: { fillColor: [0, 51, 102], textColor: 255, halign: 'center', fontSize: 9 },
    bodyStyles: { fontSize: 9, halign: 'center' },
    margin: { left: margin, right: margin }
  });

  doc.save(`System_Clearance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};