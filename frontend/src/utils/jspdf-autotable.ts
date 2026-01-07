import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Student, ClearanceRequest, ClearanceApproval } from '@/types';

export const generateNOCPDF = (student: Student, request: ClearanceRequest, approvals: ClearanceApproval[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header Section
  doc.setFontSize(16);
  doc.text('ELECTRONICS ENGINEERING DEPARTMENT', pageWidth / 2, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.text('Summer 2022 Exam (SYEJ) - NOC CLEARANCE FORM', pageWidth / 2, 22, { align: 'center' });
  doc.line(10, 25, pageWidth - 10, 25);

  // Student Info Box
  doc.setFontSize(10);
  doc.rect(10, 30, pageWidth - 20, 25);
  doc.text(`Student Name: ${student.name}`, 15, 38);
  doc.text(`College ID: ${student.collegeId}`, 15, 48);
  doc.text(`Enrollment: ${student.enrollmentNumber || 'N/A'}`, 110, 38);
  doc.text(`Semester: Fourth`, 110, 48);

  // Table Mapping: Replicating the image structure
  const tableRows = approvals.map((app, index) => [
    index + 1,
    app.department, // Subject Name
    (app as any).assignedTo || 'Faculty', 
    'Completed', // Manual Status
    'Completed', // Micro-project Status
    'DIGITALLY SIGNED' // Faculty Sign
  ]);

  autoTable(doc, {
    startY: 65,
    head: [['Sr.', 'Subject', 'Faculty Name', 'Manual', 'Micro-project', 'Faculty Sign']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 8, cellPadding: 3 },
  });

  // Footer / Signatures
  const finalY = (doc as any).lastAutoTable.finalY + 30;
  doc.setFontSize(10);
  doc.text('Class Teacher Signature', 15, finalY);
  doc.text('H.O.D. Signature', pageWidth - 50, finalY);
  doc.text(`Final Approval Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, finalY + 15, { align: 'center' });

  doc.save(`NOC_${student.collegeId}.pdf`);
};