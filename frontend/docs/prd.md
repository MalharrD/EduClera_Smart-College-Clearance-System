# EduClear - Smart Clearance & No-Dues System (Android App) Requirements Document

## 1. Application Overview

### 1.1 Application Name
EduClear - Smart Clearance & No-Dues System

### 1.2 Application Type
Android Mobile Application

### 1.3 Application Description
A comprehensive Android-based clearance and no-dues management system for colleges, enabling students to submit detailed clearance requests and track multi-department approval status in real-time. The system features a secure two-layer authentication for staff access, supports10 distinct user roles with customized dashboards, and implements department-based data visibility with admin-controlled staff activation.

---

## 2. User Roles & Authentication Architecture

### 2.1 User Roles (10 Total)
- Student
- Teacher
- HOD (Head of Department)
- Library\n- Accounts
- Scholarship
- Student Section
- Hostel/Bus
- TPO (Training & Placement Officer)
- Exam Cell
- Admin
\n### 2.2 Login Architecture (Two-Level Access System)

#### A. Default Login Page (Student Login Only)
- **App Launch Behavior**: When the app opens, the default screen is the Student Login Page
- **Student Login Fields**:
  - Student Email / Enrollment Number
  - Password\n  - Login Button
- **Staff Login Access Button**: A prominent'Staff Login' button is displayed at the top of the page
\n#### B. Staff Access Password Protection Layer (Security Layer 1)
- **Trigger**: Clicking the 'Staff Login' button opens a password verification popup/screen
- **Popup/Screen Content**:
  - Title: 'Staff Access Verification' or 'Enter Staff Access Password'
  - Input Field: 'Staff Access Password'
  - Submit Button: 'Verify' or 'Continue'
- **Validation Logic**:
  - **Correct Password**: Navigate to Staff Role Selection Page
  - **Incorrect Password**: Display error message ('Incorrect staff access password. Access denied.') and block access
- **Security Purpose**: This layer prevents unauthorized users from accessing any staff login options

#### C. Staff Role Selection Page (Security Layer 2)
- **Display Format**: Full-page interface showing10 role-specific login buttons arranged in a grid or list layout
- **10 Role Login Buttons**:
  1. Teacher Login
  2. HOD Login
  3. Library Login\n  4. Accounts Login\n  5. Scholarship Login\n  6. Student Section Login\n  7. Hostel/Bus Login
  8. TPO Login
  9. Exam Cell Login
  10. Admin Login
- **Button Action**: Each button redirects to a unique role-specific login screen
- **Role-Specific Login Screens**: Each of the 10 roles has its own dedicated login page with:\n  - Role Title (e.g., 'Teacher Login', 'HOD Login')
  - Email/Username Field
  - Password Field
  - Login Button
  - Back Button (to return to Staff Role Selection Page)
\n### 2.3 Staff Registration & Admin Approval Workflow
\n#### A. Staff Registration Process
- **Registration Form Fields**:
  - Full Name (required)
  - Email (required, unique)
  - Password (required, encrypted)
  - Confirm Password (required)
  - Role Selection (dropdown: Teacher/HOD/Library/Accounts/Scholarship/Student Section/Hostel/Bus/TPO/Exam Cell)\n  - Department Selection (dropdown, required for department-specific roles)
  - Mobile Number (required)
  - Submit Button
- **Post-Submission Behavior**:
  - Account status automatically set to 'Pending Approval'
  - Staff member cannot login until admin approves\n  - Display message: 'Your registration request has been submitted. You will be notified once the admin approves your account.'
  - Registration request sent to Admin Panel

#### B. Admin Approval Workflow
- **Admin Panel - Pending Staff Requests Section**:
  - List of all pending staff registration requests
  - Display for each request:
    - Staff Name
    - Email
    - Role
    - Department
    - Mobile Number
    - Registration Date
    - Action Buttons:'Approve' / 'Reject'\n- **Admin Actions**:
  - **Approve**: \n    - Account status changes to 'Active'
    - Staff member receives email/notification: 'Your account has been approved. You can now login.'
    - Staff can now access their role-specific dashboard
  - **Reject**: 
    - Account status changes to 'Rejected'
    - Admin must provide rejection reason (mandatory text field)
    - Staff member receives notification: 'Your registration was not approved. Reason: [Admin's reason]. Please contact admin for assistance.'

#### C. Login Validation for Staff
- **Account Status Check During Login**:
  - **Status = 'Pending Approval'**: Display message 'Your account is pending admin approval. Please wait for activation.'
  - **Status = 'Rejected'**: Display message 'Your registration was not approved by the admin. Please contact the administration.'
  - **Status = 'Active'**: Allow login and redirect to role-specific dashboard
- **Firebase Authentication Integration**: Staff accounts linked to Firebase Authentication with custom claims for role and department

---

## 3. Student Module (Full Detail)

### 3.1 Student Profile (Complete Information)
- **Profile Fields**:
  - Profile Photo (upload/camera capture)
  - Full Name
  - Enrollment Number
  - PRN Number
  - Department (dropdown)
  - Year / Semester (dropdown)
  - Email Address
  - Mobile Number\n  - Address (text area)
  - Aadhaar Number\n- **Profile Actions**:
  - Edit Profile Button
  - Save Changes Button
  - Upload/Change Profile Photo
\n### 3.2 Student Clearance Request Form
- **Form Fields**:
  - Full Name (auto-filled from profile)
  - Enrollment Number (auto-filled)\n  - PRN Number (auto-filled)
  - Department (auto-filled)\n  - Year / Semester (auto-filled)
  -Aadhaar Number (auto-filled)
  - Mobile Number (auto-filled)
  - Address (auto-filled)
  - **Select Clearance Type** (radio buttons):
    - Hall Ticket Clearance
    - No-Dues Certificate
    - Leaving Certificate
  - **Upload Documents** (file upload):
    - Student ID Card (optional)
    - Last Fee Receipt (optional)
    - Other Documents (optional, multiple files allowed)
  - Submit Button
- **Post-Submission Behavior**:
  - Generate unique Request ID
  - Set overall status to 'Pending'
  - Display confirmation message: 'Your clearance request has been submitted successfully. Request ID: [ID]'
  - Student data becomes visible only to:\n    - Their own department HOD
    - Their own department staff
    - Admin (unrestricted access)

### 3.3 Student Dashboard (Real-Time Tracking)
- **Dashboard Sections**:
  1. **My Profile**: View and edit personal information
  2. **Submit Clearance Request**: Button to access clearance form
  3. **My Clearance Status**: Real-time approval tracking with visual indicators
  4. **Department-wise Progress**:
     - Display all departments involved in clearance workflow
     - **Color-Coded Status Chips**:
       - Green Chip: Approved ✓
       - Red Chip: Rejected ✗
       - Yellow Chip: Pending ⏳
     - Show approver name and timestamp for each department
     - Display department remarks (if any)
  5. **Progress Bar**: Visual representation of overall clearance completion percentage
  6. **Clearance Timeline**: Chronological view of approval history with timestamps
  7. **Logs History**: Detailed activity log showing all status changes, approvals, rejections, and remarks
  8. **Download PDF Certificate**: Button to generate and download auto-generated No-Dues Clearance Certificate (enabled only when all approvals are complete)
  9. **Notifications**: Real-time alerts for status changes, approvals, rejections\n  10. **Logout**: Secure session termination\n
---

## 4. HOD Module (Full Access Within Department)

### 4.1 HOD Login\n- Accessed via Staff Role Selection Page after staff access password verification
- Unique login credentials (Email/Username + Password)\n- Account must be approved by Admin to access dashboard
\n### 4.2 HOD Dashboard (Department-Specific Full Access)
- **Data Visibility Rule**: HOD can view and manage ONLY students and staff from their own department
- **Dashboard Features**:
  1. **View All Department Students**: Complete list of students enrolled in HOD's department with filters (year, semester, status)
  2. **View All Department Staff**: List of all staff members assigned to HOD's department (Teachers, Library, Accounts, etc.)
  3. **View All Clearance Requests**: Access to all clearance requests submitted by students in HOD's department
  4. **Approve/Reject Clearance Requests**:
     - Approve Button\n     - Reject Button
     - Remarks Field (mandatory for rejection, optional for approval)
  5. **Override Staff Decisions**: Authority to modify or override approval/rejection decisions made by department staff
  6. **View Student Data from Clearance Form**: Access to all information submitted by students in clearance forms (personal details, documents, clearance type)
  7. **Department Reports**: Generate analytics and reports for clearance activities within the department
  8. **Department Clearance History**: Full audit trail of all clearance requests and decisions in the department
  9. **Track Department Workflow**: Real-time monitoring of clearance progress for all students in the department
  10. **Real-Time Updates**: Instant notifications for new clearance requests, status changes, and staff actions
  11. **View Logs**: System activity tracking for department-specific actions
  12. **Search & Filter**: Search students by name, enrollment number, year, clearance status\n
---

## 5. Department Staff Modules (All Departments)

### 5.1 Department Staff Roles
- Library Staff
- Accounts Staff\n- Scholarship Staff
- Student Section Staff
- Hostel/Bus Staff
- TPO Staff
- Exam Cell Staff
- Teachers
\n### 5.2 Department Staff Login
- Each department staff role accessed via Staff Role Selection Page after staff access password verification
- Unique login credentials (Email/Username + Password)
- Account must be approved by Admin to access dashboard
\n### 5.3 Common Features (All Department Staff)
- **Data Visibility Rule**: Department staff can view ONLY students from their own assigned department
- **Student Assignment**: Staff can only see students assigned to them based on department/student mapping
- **Dashboard Features**:
  1. **Login**: Role-specific authentication via Staff Role Selection Page
  2. **View Department Students**: List of students from own department only
  3. **Pending Requests List**: View clearance requests awaiting approval from their department
  4. **Approve/Reject Actions**:
     - Approve Button\n     - Reject Button
     - Add Remarks Field (mandatory for rejection, optional for approval)
  5. **View History**: Past approval records and decision logs for own department
  6. **Search Students**: Filter by name, enrollment number within own department
  7. **Update Clearance**: Modify approval status (if permitted by workflow rules)
  8. **Real-Time Firestore Updates**: Instant synchronization of approval actions across all dashboards
  9. **View Student Details**: Access to student information from clearance form (limited to own department)
  10. **Notifications**: Real-time alerts for new clearance requests and status changes

### 5.4 Teacher-Specific Features
- **Access Condition**: Teachers can access clearance requests ONLY after all office departments (Library, Accounts, Scholarship, Student Section, Hostel/Bus, TPO, Exam Cell) have approved (applicable for Hall Ticket Clearance workflow)
- **Department Restriction**: Teachers can only view and approve students from their own department
- **Approval Authority**: Teachers approve after office staff and before HOD in the Hall Ticket workflow
- **Department Section**: Teachers have a dedicated department section in their dashboard displaying:\n  - Department Name (assigned department)
  - Department Code
  - Department HOD Name
  - Total Students in Department
  - Pending Clearance Requests Count
  - Department-specific announcements or notices
- **Database Integration**: Teacher's department information is fetched from the departments collection and linked via department_id foreign key in the staff collection

---
\n## 6. Admin Panel (FULL SYSTEM ACCESS - Highest Authority)

### 6.1 Admin Login
- Accessed via Staff Role Selection Page after staff access password verification
- Unique admin credentials (Email/Username + Password)\n- No approval required (admin account is pre-configured)

### 6.2 Admin Panel Features (Unrestricted Access)
\n#### A. Manage Students (Full CRUD Operations)
- **Add Student**:
  - Form with all student profile fields
  - Assign to department\n  - Set enrollment number, PRN, year, semester
  - Upload profile photo\n- **Edit Student**:
  - Modify any student detail (name, enrollment number, department, contact info, etc.)
  - Transfer students between departments
  - Update year/semester
- **Delete Student**:
  - Permanently remove student account
  - Confirmation dialog before deletion
- **View Student List Department-Wise**:
  - Dropdown filter to select department
  - Display all students in selected department
  - Option to view 'All Departments'\n- **View Student Clearance Status**:
  - Access to all clearance requests submitted by any student\n  - View department-wise approval status
  - View remarks and approval history
- **Search & Filter**: Search students by name, enrollment number, department, year, status
\n#### B. Manage Staff (Full CRUD Operations)
- **Staff Registration Requests**:
  - View list of all pending staff registration requests
  - Display staff details: Name, Email, Role, Department, Mobile Number, Registration Date
  - **Accept Staff Account**:
    - Approve button
    - Account status changes to 'Active'
    - Staff receives approval notification
    - Staff panel activates and staff can login
  - **Reject Staff Account**:
    - Reject button
    - Mandatory rejection reason field
    - Staff receives rejection notification with reason
- **Edit Staff Details**:
  - Modify staff name, email, role, department assignment, mobile number
  - Reassign staff to different departments
  - Change staff roles (e.g., Teacher to HOD)
- **Delete Staff**:
  - Permanently remove staff account
  - Confirmation dialog before deletion
- **Assign Staff to Departments**:
  - Assign or reassign staff members to specific departments
  - Manage department-staff mapping
- **View Staff List Department-Wise**:
  - Dropdown filter to select department\n  - Display all staff in selected department with their roles
  - Option to view 'All Departments'
- **Activate/Deactivate Staff Accounts**: Toggle staff account status (Active/Inactive)
\n#### C. Manage Departments\n- **Create Departments**:
  - Add new department with name, code, description
  - Set department status (Active/Inactive)
- **Add/Remove HOD**:
  - Assign HOD to a department
  - Remove or replace HOD\n- **Add/Remove Staff**:
  - Assign staff members to departments
  - Remove staff from departments
- **View Department-Wise Student List**:
  - Select department from dropdown
  - Display all students enrolled in that department
  - Export student list as CSV/PDF
- **View Department-Wise Staff List**:
  - Select department from dropdown
  - Display all staff assigned to that department with roles
  - Export staff list as CSV/PDF
- **Edit Department Details**: Modify department name, code, description\n- **Delete Department**: Remove department (with validation to ensure no active students/staff)

#### D. View Entire System (Unrestricted Access)
- **All Departments**: View and manage all departments in the system
- **All Students**: Access to complete student database across all departments
- **All Staff**: Access to complete staff database across all departments and roles
- **Full Clearance Logs**: View all clearance requests, approvals, rejections, and remarks system-wide
- **Approval Chains**: Visualize complete approval workflows for any clearance request
- **Analytics**: System-wide analytics including:
  - Total clearance requests (by type, status, department)
  - Approval/rejection rates
  - Average clearance time
  - Department-wise performance metrics
- **Reports**: Generate comprehensive reports:\n  - Department-wise clearance summary
  - Staff performance reports
  - Student clearance status reports
  - Time-based analytics (daily, weekly, monthly)
- **System Configuration**: Modify workflow rules, clearance types, department settings
- **Audit Trail Logging**: View complete system activity logs with timestamps and user actions
- **Backup & Data Management**: Export/import system data, database backups

#### E. User Reports Module (Admin-Only Advanced PDF Download System)
\n**Access Control:**
- Feature visible and accessible ONLY to Admin users
- Students, HODs, Teachers, and other staff roles cannot see or access this module
- Section appears in Admin Panel under 'User Reports' or 'All Users' section

**Admin Panel UI Structure:**
- **Section Title**: 'User Reports'
- **Location**: Dedicated section in Admin Dashboard or accessible via 'All Users' menu
- **UI Components**:
  - Dropdown menu or modal dialog with report type selection
  - Filter options (Department, Role, Date Range)
  - 'Generate & Download PDF' button
  - Progress indicator during PDF generation
  - Download history log (optional)
\n**Report Type Options (7 Types):**
\n1. **📄 Download All Users PDF**
   - Combined report of all users (students, staff, HODs, admin)
   - No filters required
   - Button Label: 'Download All Users Report (PDF)'

2. **🎓 Download Students – Department Wise**
   - Filter: Department selection (dropdown)
   - Shows only students from selected department
   - Button Label: 'Download Student Report (Department-Wise)'

3. **👨‍🏫 Download Staff – Department Wise**
   - Filter: Department selection (dropdown)
   - Shows only staff from selected department
   - Button Label: 'Download Staff Report (Department-Wise)'\n
4. **🏢 Download Department-Wise Users**
   - Filter: Department selection (dropdown)
   - Consolidated report showing students, staff, and HOD for selected department
   - Button Label: 'Download Department Consolidated Report'

5. **🧾 Download Role-Wise Users**
   - Filter: Role selection (dropdown: Student / Staff / HOD / Teacher / Library / Accounts / Scholarship / Student Section / Hostel/Bus / TPO / Exam Cell / Admin)
   - Shows all users with selected role across all departments
   - Button Label: 'Download Role-Wise User Report'

6. **⏱ Download Login & Activity Report**
   - Filter: Date Range (optional: From Date - To Date)
   - Shows login/logout history, session duration, total login count for all users
   - Button Label: 'Download Login & Activity Report'\n
7. **🔄 Download Combined Department-Wise Report**
   - No filter (generates report for all departments)
   - Groups users by department with separate sections for each department
   - Button Label: 'Download All Departments Consolidated Report'

**Filter Options:**
- **Department Dropdown**: Computer Engineering / IT / Mechanical / Civil / Electrical / Electronics / etc.
- **Role Dropdown**: Student / Staff / HOD / Teacher / Library / Accounts / Scholarship / Student Section / Hostel/Bus / TPO / Exam Cell / Admin
- **Date Range Picker**: From Date (DD/MM/YYYY) - To Date (DD/MM/YYYY) (optional, for Login & Activity Report)

**Common PDF Structure (All Report Types):**

**1️⃣ Header Section**
- **College Logo**: DKTE-LOGO-1024x274.png placed at top-center with appropriate scaling
- **College Name**: 'DKTE SOCIETY'S YASHWANTRAO CHAVAN POLYTECHNIC / COLLEGE' (Bold, Capital Letters, Center-Aligned)
- **Report Title**: Dynamic based on report type (e.g., 'Student User Report - Department of Computer Engineering', 'All Users Report', 'Login & Activity Report')
- **Horizontal Separator Line**: Thin blue line below header

**2️⃣ Report Metadata**
- **Report Type**: [Dynamic - e.g., 'All Users Report', 'Student Report - Department Wise', 'Login & Activity Report']
- **Generated By**: Admin\n- **Generated On**: [Date & Time in format: DD/MM/YYYY - HH:MM AM/PM]
- **Filters Applied**: [Dynamic - e.g., 'Department: Computer Engineering', 'Role: Student', 'Date Range: 01/01/2025 - 31/01/2025']
- **Total Records**: [Dynamic count fetched from database]
- **Layout**: Aligned neatly in 2-column format or left-aligned list

**3️⃣ Data Table (Structure varies by report type - see below)**

**4️⃣ Summary Section (Optional, varies by report type)**
- Total count statistics
- Active/Inactive user counts
- Department-wise breakdown
- Role-wise breakdown\n\n**5️⃣ Declaration Section**
- **Declaration Text**: 'This report is system-generated from the college management database and reflects real-time user information as of the report generation date.'
- **Formatting**: Justified alignment, standard paragraph spacing, italicized text
\n**6️⃣ Signature Section**
- **Layout**: 3-column layout at bottom of page
- **Columns**:
  - **Column 1**: \n    - Label: 'Prepared By'
    - Text: 'Admin (System Generated)'
  - **Column 2**: 
    - Label: 'Verified By'
    - Text: 'System Administrator'
  - **Column 3**: 
    - Label: 'Authorized Signatory'
    - Text: '(Principal / Registrar)'
- **Spacing**: Adequate space above each label for physical signature (if needed)

**7️⃣ Footer Section**
- **Auto-Generated Message**: 'This is a system-generated document and does not require a physical signature.'
- **Page Numbers**: Displayed at bottom-right corner in format'Page X of Y'
- **College Website**: [Optional - College website URL]
- **ERP Name**: EduClear - Smart Clearance & No-Dues System
- **Footer Styling**: Small font (10pt), light gray color\n
---

**Detailed PDF Structures by Report Type:**

**🔹 A) ALL USERS REPORT (COMBINED)**
\n**Title**: 'All Users Report'\n
**Table Columns**:
| Sr. No | Name | Username | Role | Department | Email | Joined Date | Status |
\n**Table Content**:
- Sr. No: Sequential numbering (1, 2, 3...)
- Name: User's full name from profile
- Username: User's login username
- Role: User role with styled badges (Admin / Student / HOD / Teacher / Library / Accounts / Scholarship / Student Section / Hostel/Bus / TPO / Exam Cell)\n- Department: Department name (display '—' for Admin)
- Email: User's email address
- Joined Date: Account creation date in format DD/MM/YYYY
- Status: Active / Inactive\n
**Sorting**: Users sorted by role hierarchy (Admin → HOD → Teacher → Department Staff → Students)\n
**Summary Section**:
- Total Users: [Count]
- Total Students: [Count]
- Total Staff: [Count]
- Total HODs: [Count]
- Total Admins: [Count]
- Active Users: [Count]
- Inactive Users: [Count]
\n**File Naming**: `All_Users_Report_[Date]_[Time].pdf`
**Example**: `All_Users_Report_13-12-2025_10-30-AM.pdf`

---

**🔹 B) STUDENT REPORT – DEPARTMENT WISE**
\n**Title**: 'Student User Report - Department of [Department Name]'
**Example**: 'Student User Report - Department of Computer Engineering'

**Table Columns**:
| Sr. No | Student Name | PRN | Username | Email | Year | Joined Date | Status |

**Table Content**:
- Sr. No: Sequential numbering\n- Student Name: Full name from student profile
- PRN: PRN Number\n- Username: Login username
- Email: Student email address
- Year: Academic year (e.g., First Year, Second Year, Third Year)
- Joined Date: Account creation date (DD/MM/YYYY)
- Status: Active / Inactive\n
**Summary Section**:
- Total Students in Department: [Count]
- Active Students: [Count]
- Inactive Students: [Count]
- Year-wise Breakdown:
  - First Year: [Count]
  - Second Year: [Count]
  - Third Year: [Count]
\n**File Naming**: `Student_Report_[Department]_[Date]_[Time].pdf`\n**Example**: `Student_Report_Computer_13-12-2025_10-30-AM.pdf`

---

**🔹 C) STAFF REPORT – DEPARTMENT WISE**

**Title**: 'Staff User Report - Department of [Department Name]'
**Example**: 'Staff User Report - Department of Computer Engineering'

**Table Columns**:
| Sr. No | Staff Name | Username | Designation | Department | Email | Joined Date|

**Table Content**:
- Sr. No: Sequential numbering
- Staff Name: Full name from staff profile
- Username: Login username
- Designation: Role (Teacher / HOD / Library / Accounts / Scholarship / Student Section / Hostel/Bus / TPO / Exam Cell)
- Department: Department name\n- Email: Staff email address\n- Joined Date: Account creation date (DD/MM/YYYY)

**Summary Section**:
- Total Staff in Department: [Count]
- HOD: [Name]
- Teachers: [Count]
- Department Staff: [Count by role]
\n**File Naming**: `Staff_Report_[Department]_[Date]_[Time].pdf`
**Example**: `Staff_Report_Computer_13-12-2025_10-30-AM.pdf`

---

**🔹 D) ROLE-WISE USER REPORT**

**Title**: '[Role] User Report'\n**Examples**: \n- 'Student User Report'\n- 'Staff User Report'\n- 'HOD User Report'
- 'Teacher User Report'
\n**Table Columns**:
| Sr. No | Name | Username | Department | Email | Joined Date | Status |
\n**Table Content**:
- Sr. No: Sequential numbering\n- Name: User's full name\n- Username: Login username
- Department: Department name (display '—' for Admin)
- Email: User's email address\n- Joined Date: Account creation date (DD/MM/YYYY)
- Status: Active / Inactive

**Sorting**: Users sorted by department, then by name

**Summary Section**:
- Total [Role] Users: [Count]
- Active Users: [Count]
- Inactive Users: [Count]
- Department-wise Breakdown:
  - Computer Engineering: [Count]
  - IT: [Count]
  - Mechanical: [Count]
  - (etc.)

**File Naming**: `[Role]_Report_[Date]_[Time].pdf`\n**Example**: `Student_Report_13-12-2025_10-30-AM.pdf`

---

**🔹 E) DEPARTMENT-WISE CONSOLIDATED REPORT**

**Title**: 'Department-Wise Consolidated User Report'
\n**Structure**: Group users by department with separate sections for each department

**For Each Department**:
\n**Department Section Header**: 'Department: [Department Name]'

**1. Students Table**\n| Sr. No | Student Name | PRN | Username | Email | Year | Status |

**2. Staff Table**
| Sr. No | Staff Name | Username | Designation | Email | Joined Date |

**3. HOD Details**
- HOD Name: [Name]
- HOD Email: [Email]
- HOD Contact: [Mobile Number]
\n**4. Department Summary**
- Total Students: [Count]
- Total Staff: [Count]
- Active Students: [Count]
- Active Staff: [Count]
\n**Repeat for All Departments**:\n- Department: Computer Engineering
- Department: IT
- Department: Mechanical
- Department: Civil
- (etc.)

**Overall Summary Section**:
- Total Departments: [Count]
- Total Students (All Departments): [Count]
- Total Staff (All Departments): [Count]
- Total HODs: [Count]
\n**File Naming**: `Department_Consolidated_Report_[Date]_[Time].pdf`
**Example**: `Department_Consolidated_Report_13-12-2025_10-30-AM.pdf`

---
\n**🔹 F) LOGIN & ACTIVITY SESSION REPORT**

**Title**: 'Login & Activity Session Report'

**Subtitle** (if date range applied): 'Period: [From Date] to [To Date]'

**Table Columns**:
| Sr. No | Name | Role | Department | Last Login | Last Logout | Session Duration | Total Logins | Status |

**Table Content**:
- Sr. No: Sequential numbering
- Name: User's full name
- Role: User role (Student / Staff / HOD / Teacher / Admin / etc.)
- Department: Department name (display '—' for Admin)
- Last Login: Last login date & time (DD/MM/YYYY - HH:MM AM/PM)\n- Last Logout: Last logout date & time (DD/MM/YYYY - HH:MM AM/PM)
- Session Duration: Duration between last login and logout (X hr Y min)
- Total Logins: Total login count (fetched from audit_logs collection)
- Status: Active / Inactive

**Sorting**: Users sorted by total logins (descending) or by last login date (most recent first)

**Summary Section**:
- Total Users Tracked: [Count]
- Most Active User: [Username with highest total logins]
- Average Session Duration: [Calculated average across all users]
- Total Logins (All Users): [Sum of all login counts]
- Active Users: [Count]
- Inactive Users: [Count]
\n**Data Source**: Fetch login/logout timestamps, session duration, and total login count from Firestore `audit_logs` collection
\n**Session Duration Calculation**: Automatically calculate duration between last login and logout timestamps

**File Naming**: `Login_Activity_Report_[Date]_[Time].pdf`
**Example**: `Login_Activity_Report_13-12-2025_10-30-AM.pdf`

---

**Functional Requirements:**
\n**A. Dynamic PDF Generation**
- PDF generated dynamically from Firestore database in real-time
- Data fetched based on selected filters (department, role, date range)
- Sorting logic applied before PDF generation:\n  - Department → Role → Name (for combined reports)
  - Role hierarchy (Admin → HOD → Teacher → Department Staff → Students)
  - Total logins descending (for Login & Activity Report)

**B. Data Fetching Logic**
- Query Firestore collections:
  - `users` collection: Fetch all user accounts (students, staff, admin)
  - `students` collection: Fetch student profile data (name, enrollment number, PRN, department, year)
  - `staff` collection: Fetch staff profile data (name, role, department, designation)
  - `departments` collection: Fetch department information (name, code, HOD)\n  - `audit_logs` collection: Fetch login/logout timestamps, session data, total login count for each user
- Apply filters before data retrieval:\n  - Department filter: `WHERE department_id = [selected_department_id]`
  - Role filter: `WHERE role = [selected_role]`
  - Date range filter: `WHERE login_timestamp BETWEEN [from_date] AND [to_date]`
- Calculate session duration: `logout_timestamp - login_timestamp`\n- Count total logins per user: Query audit_logs where action = 'Login' and user_id = [user_id]
- Fetch account status from users collection (Active/Inactive)

**C. File Naming Convention**
- **Format**: `[Report_Type]_[Filter]_[Date]_[Time].pdf`
- **Examples**:
  - `All_Users_Report_13-12-2025_10-30-AM.pdf`
  - `Student_Report_Computer_13-12-2025_10-30-AM.pdf`
  - `Staff_Report_IT_13-12-2025_10-30-AM.pdf`
  - `Role_Report_HOD_13-12-2025_10-30-AM.pdf`
  - `Department_Consolidated_Report_13-12-2025_10-30-AM.pdf`
  - `Login_Activity_Report_13-12-2025_10-30-AM.pdf`

**D. PDF Specifications**
- **Page Size**: A4 (210mm x 297mm)
- **Orientation**: Portrait\n- **Print-Friendly**: Optimized margins and layout for physical printing
- **File Format**: PDF/A standard for archival quality
\n**E. Storage & Retrieval**
- **Storage Location**: Firebase Storage with path structure: `/admin_reports/user_reports/[report_type]/[report_id].pdf`
- **Database Record**: Store PDF metadata in Firestore `admin_reports` collection:\n  - report_id (format: REPORT-YYYY-XXXXXX)
  - report_type (e.g., 'All Users Report', 'Student Report - Department Wise', 'Login & Activity Report')
  - generated_by: Admin user_id
  - generation_timestamp\n  - pdf_file_url (Firebase Storage URL)
  - pdf_file_name\n  - filters_applied (department, role, date range)
  - total_records_count
  - download_count

**F. Download Functionality**
- **Admin Dashboard**: Display'User Reports' section with dropdown/modal for report type selection
- **Download Action**:
  - Admin selects report type
  - Admin applies filters (department, role, date range) if applicable
  - Admin clicks 'Generate & Download PDF' button
  - System validates admin role\n  - Progress indicator displayed during PDF generation
  - PDF generated dynamically from database
  - PDF uploaded to Firebase Storage
  - PDF metadata stored in Firestore
  - PDF downloaded to device (Downloads folder)
  - Increment download_count in Firestore
  - Display success message: '[Report Type] downloaded successfully. File saved to Downloads folder.'
- **Share Options**: Allow admin to share PDF via email or other apps

**G. Security Rules**
- **Admin-Only Access**: PDF generation button and functionality blocked for all non-admin roles
- **Role Validation**: Backend API validates admin role before processing PDF generation request
- **Sensitive Data Protection**: Passwords, authentication tokens, OTPs, and other sensitive fields excluded from PDF\n- **Firestore Security Rules**: Implement admin-only read access to audit_logs and user activity data
- **Download Logging**: Log each PDF download action in audit_logs collection with admin user_id, report type, filters applied, and timestamp

---

**Design Guidelines:**

**A. Professional Academic Theme**
- Clean, formal layout suitable for institutional reports
- Background: White background (#FFFFFF)
- Accent Colors: Blue highlights for headers and borders (#2196F3), gray for secondary text (#757575)
\n**B. Typography**
- **Font Family**: Roboto / Open Sans / Times New Roman
- **Font Sizes**:
  - College Name: 16pt, Bold, Uppercase
  - Report Title: 18pt, Bold, Uppercase
  - Section Headers: 14pt, Bold\n  - Body Text: 12pt, Regular\n  - Footer Text: 10pt, Regular
- **Line Spacing**: 1.5 for body text, 1.2 for tables
\n**C. Table Styling**
- Bordered table with alternating row colors (white and light gray)
- Blue header row (#2196F3) with white text
- Clear column separation with vertical borders
- Auto-expansion to include all records

**D. Role Badges**
- Styled badges with background colors:\n  - Admin: Red (#F44336)
  - HOD: Blue (#2196F3)
  - Teacher: Green (#4CAF50)
  - Student: Orange (#FF9800)
  - Department Staff: Purple (#9C27B0)
\n**E. Layout**
- Balanced spacing with professional margins (1 inch on all sides)
- Clear visual hierarchy with section headers
- Page breaks between departments (for consolidated reports)
- Consistent alignment (left-aligned text, center-aligned headers)

---

**Implementation Code Requirements:**

**A. Android Activity**
- **AdminUserReportsActivity.java**: Manages User Reports module
  - Display'User Reports' section in Admin Panel
  - Dropdown/modal for report type selection (7 options)
  - Filter options (Department, Role, Date Range)\n  - 'Generate & Download PDF' button\n  - Validate admin role before enabling functionality
  - Trigger PDF generation on button click
  - Show progress indicator during PDF generation
  - Download PDF file from Firebase Storage
  - Save to device storage (Downloads folder)
  - Display success message with file path
  - Share PDF via email or other apps

**B. PDF Generator Classes**
\n1. **AllUsersReportPDFGenerator.java**: Generates All Users Report PDF
   - Methods:\n     - `generateAllUsersReport()`
     - `fetchAllUsersData()`
     - `sortUsersByRole(List<User> users)`
     - `createPDFDocument()`
     - `addDKTELogo()`
     - `addReportHeader(String reportTitle)`
     - `addReportMetadata(String reportType, String filters, int totalRecords)`
     - `addAllUsersTable(List<User> users)`
     - `addSummarySection(int totalUsers, int totalStudents, int totalStaff, int totalHODs, int totalAdmins, int activeUsers, int inactiveUsers)`
     - `addDeclaration()`
     - `addSignatureSection()`
     - `addFooter()`
     - `applyProfessionalStyling()`
     - `savePDFToFirebaseStorage(byte[] pdfBytes, String fileName)`
     - `storePDFMetadataInFirestore(String pdfUrl, String reportType, String filters, int totalRecords)`
     - `generateReportID()`
\n2. **StudentReportDepartmentWisePDFGenerator.java**: Generates Student Report (Department-Wise) PDF
   - Methods:
     - `generateStudentReportDepartmentWise(String departmentId)`
     - `fetchStudentsByDepartment(String departmentId)`
     - `addStudentTable(List<Student> students)`
     - `addStudentSummary(int totalStudents, int activeStudents, int inactiveStudents, Map<String, Integer> yearWiseBreakdown)`
     - (Other common methods inherited or reused)

3. **StaffReportDepartmentWisePDFGenerator.java**: Generates Staff Report (Department-Wise) PDF
   - Methods:
     - `generateStaffReportDepartmentWise(String departmentId)`
     - `fetchStaffByDepartment(String departmentId)`
     - `addStaffTable(List<Staff> staff)`
     - `addStaffSummary(int totalStaff, String hodName, int teacherCount, Map<String, Integer> roleWiseBreakdown)`
     - (Other common methods inherited or reused)

4. **RoleWiseUserReportPDFGenerator.java**: Generates Role-Wise User Report PDF
   - Methods:
     - `generateRoleWiseUserReport(String role)`
     - `fetchUsersByRole(String role)`
     - `addRoleWiseUserTable(List<User> users)`
     - `addRoleWiseSummary(int totalUsers, int activeUsers, int inactiveUsers, Map<String, Integer> departmentWiseBreakdown)`\n     - (Other common methods inherited or reused)

5. **DepartmentConsolidatedReportPDFGenerator.java**: Generates Department-Wise Consolidated Report PDF
   - Methods:
     - `generateDepartmentConsolidatedReport()`
     - `fetchAllDepartments()`
     - `fetchStudentsByDepartment(String departmentId)`
     - `fetchStaffByDepartment(String departmentId)`
     - `fetchHODByDepartment(String departmentId)`
     - `addDepartmentSection(String departmentName, List<Student> students, List<Staff> staff, Staff hod)`
     - `addDepartmentSummary(int totalStudents, int totalStaff, int activeStudents, int activeStaff)`
     - `addOverallSummary(int totalDepartments, int totalStudents, int totalStaff, int totalHODs)`
     - (Other common methods inherited or reused)\n
6. **LoginActivityReportPDFGenerator.java**: Generates Login & Activity Report PDF
   - Methods:
     - `generateLoginActivityReport(Date fromDate, Date toDate)`\n     - `fetchLoginActivityData(Date fromDate, Date toDate)`\n     - `calculateSessionDuration(Timestamp loginTime, Timestamp logoutTime)`\n     - `addLoginActivityTable(List<UserActivity> activities)`
     - `addLoginActivitySummary(int totalUsers, String mostActiveUser, double avgSessionDuration, int totalLogins, int activeUsers, int inactiveUsers)`
     - (Other common methods inherited or reused)\n
**C. Data Fetching Logic**
- **FirestoreDataFetcher.java**: Helper class for fetching data from Firestore
  - Methods:
    - `fetchAllUsers()`
    - `fetchStudentsByDepartment(String departmentId)`
    - `fetchStaffByDepartment(String departmentId)`
    - `fetchUsersByRole(String role)`
    - `fetchAllDepartments()`
    - `fetchLoginActivityData(Date fromDate, Date toDate)`
    - `fetchHODByDepartment(String departmentId)`
    - `calculateTotalLogins(String userId)`
    - `getAccountStatus(String userId)`
\n**D. Download Functionality**
- **AdminUserReportsActivity.java**: Manages download workflow
  - Validate admin role\n  - Display report type selection dropdown/modal
  - Display filter options (department, role, date range)
  - Trigger appropriate PDF generator based on selected report type
  - Show progress dialog during generation
  - Fetch PDF URL from Firestore admin_reports collection
  - Download PDF file from Firebase Storage
  - Save to device storage (Downloads folder)
  - Increment download_count in Firestore
  - Display success message: '[Report Type] downloaded successfully. File saved to Downloads folder.'
  - Provide share options (email, WhatsApp, etc.)
\n---

##7. Department-Based Data Visibility Rules (Critical Implementation)

### 7.1 Data Visibility Matrix

| User Role | Data Visibility |
|-----------|----------------|
| **Student** | Own data only |
| **Teacher** | Own department students only |
| **HOD** | Own department students and staff only |
| **Library Staff** | Own department students only |
| **Accounts Staff** | Own department students only |
| **Scholarship Staff** | Own department students only |
| **Student Section Staff** | Own department students only |\n| **Hostel/Bus Staff** | Own department students only |
| **TPO Staff** | Own department students only |\n| **Exam Cell Staff** | Own department students only |
| **Admin** | ALL departments, ALL students, ALL staff (unrestricted) |

### 7.2 Student Data Visibility Rules
**Student data must be visible to:**
- Their own HOD
- Their own department staff (all roles: Teachers, Library, Accounts, Scholarship, Student Section, Hostel/Bus, TPO, Exam Cell)
- Admin (full access)
- Teachers handling that specific student

**Student data must NOT be visible to:**
- Staff from other departments
- HODs from other departments
- Students from other departments
\n### 7.3 Backend Implementation Logic
- **Database Structure**: Each student record tagged with `department_id` (foreign key)
- **Query Filtering**:
  - **For Staff/HOD**: All database queries include `WHERE department_id = user.department_id`
  - **For Admin**: No department filter applied (unrestricted access)
- **Firestore Security Rules**: Implement department-based read/write rules
- **Middleware**: Backend API includes department filtering middleware for all staff/HOD requests
- **Admin Bypass**: Admin queries bypass all department filters

### 7.4 UI Access Restrictions
- Department dropdown in staff dashboards locked to own department (read-only)
- Search functions scoped to own department data\n- Reports and analytics limited to own department\n- Admin UI shows department selector with'All Departments' option
- Student lists filtered by department before rendering

---

## 8. Staff Registration Flow (Complete Workflow)

### 8.1 Registration Process
1. Staff member accesses Staff Registration Form (via Staff Role Selection Page or dedicated registration link)
2. Fills registration form with required details (Name, Email, Password, Role, Department, Mobile)\n3. Submits registration request\n4. **Account Status**: Set to 'Pending Approval'\n5. **Backend Action**: Registration request stored in Firestore collection'staff_registration_requests'
6. **Notification**: Admin receives notification of new staff registration request

### 8.2 Admin Approval Process
1. Admin logs into Admin Panel
2. Navigates to 'Pending Staff Requests' section
3. Reviews staff registration details (Name, Email, Role, Department, Mobile, Registration Date)
4. **Admin Decision**:
   - **Approve**:\n     - Click 'Approve' button
     - Account status changes to 'Active'
     - Staff account created in Firebase Authentication
     - Staff receives email/notification: 'Your account has been approved. You can now login.'
     - Staff can now access their role-specific panel
   - **Reject**:
     - Click 'Reject' button
     - Enter rejection reason (mandatory)
     - Account status changes to 'Rejected'
     - Staff receives notification: 'Your registration was not approved. Reason: [reason]. Contact admin.'

### 8.3 Staff Login Validation
- **Pending Approval**: Display message 'Your account is pending admin approval. Please wait for activation.'
- **Rejected**: Display message 'Your registration was not approved by the admin. Please contact the administration.'
- **Active**: Allow login and redirect to role-specific dashboard

---

## 9. Clearance Workflow Logic (Fully Implemented)

### 9.1 Hall Ticket Clearance Workflow
**Sequential Process:**
\n**Phase 1: Office Staff Approvals (All Must Approve)**
- Independent departments (can approve in any order, parallel processing):\n  - Library\n  - Hostel/Bus
  - TPO
  - Exam Cell
- Sequential departments (must approve in order):
  1. Student Section (must approve first)
  2. Scholarship (unlocks after Student Section approves)
  3. Accounts (unlocks after Scholarship approves)
\n**Phase 2: Teacher Approval**
- **Access Condition**: Teachers can access clearance request ONLY after ALL office departments (Phase 1) have approved\n- **System Lock**: Teacher approval option remains locked/disabled until all office approvals are complete
- Teachers from student's own department approve\n\n**Phase 3: HOD Final Approval**
- HOD from student's own department provides final approval
- Status changes to 'Completed' after HOD approval

**Workflow Rules:**
- System automatically locks next sequential department until previous approval\n- Independent departments can process simultaneously
- Real-time status updates across all dashboards
- Rejection at any stage requires mandatory remarks
- Workflow progress tracked with timestamps

### 9.2 No-Dues / Leaving Certificate Workflow
\n**Phase 1: Independent Approvals (Any Order, Parallel Processing)**
- Library\n- Hostel/Bus\n- TPO
- Exam Cell
\nThese departments can approve simultaneously without dependencies.\n
**Phase 2: Sequential Approvals (Order-Dependent)**
1. **Student Section** (must approve first)\n   - System blocks next step until Student Section approves
2. **Scholarship Section** (unlocks after Student Section approves)
   - System blocks next step until Scholarship approves
3. **Accounts Section** (unlocks after Scholarship approves)\n   - System blocks next step until Accounts approves

**Phase 3: HOD Final Approval**
- HOD from student's own department provides final approval after all departments complete
- Status changes to 'Completed' after HOD approval\n
**Workflow Rules:**
- **Sequential Lock Mechanism**: System enforces strict order for Student Section → Scholarship → Accounts
- Independent departments (Library, Hostel/Bus, TPO, Exam Cell) can process in parallel
- Real-time status updates across all dashboards
- Rejection at any stage requires mandatory remarks
- Workflow progress tracked with timestamps and approver details

### 9.3 General Clearance Workflow
- Follows similar logic to No-Dues workflow
- Admin can configure department sequence and dependencies
\n---

## 10. No-Dues Clearance Certificate PDF Generator (Professional Format)

### 10.1 PDF Generation Trigger
- **Activation Condition**: PDF generation is enabled ONLY when all department approvals are marked as 'Approved'
- **Download Button**: 'Download Certificate' button becomes active in student dashboard after all approvals are complete
- **Auto-Generation**: PDF is generated automatically upon completion of all approvals

### 10.2 PDF Structure & Content
\n#### 1️⃣ Header Section
- **College Logo**: DKTE College Logo (DKTE-LOGO-1024x274.png) placed at top-center
- **College Name**: Bold, capital letters, center-aligned
  - 'DKTE SOCIETY'S YASHWANTRAO CHAVAN POLYTECHNIC / COLLEGE'\n- **College Address**: Small text under college name, center-aligned
\n#### 2️⃣ Certificate Title
- **Title Text**: 'NO-DUES CLEARANCE CERTIFICATE'
- **Formatting**: Center-aligned, bold, large font (18-20pt)
- **Separator**: Thin horizontal line below the title

#### 3️⃣ Student & Request Details Section
- **Layout**: Clean2-column table or aligned text format
- **Fields**:
  - Student Name: [Full Name]
  - Enrollment / PRN Number: [Enrollment Number] / [PRN Number]
  - Course / Branch: [Department]\n  - Academic Year: [Year / Semester]
  - Request ID: [Unique Request ID]
  - Request Submitted On: [Date & Time]
  - Request Completed On: [Date & Time]
\n#### 4️⃣ Department-Wise Approval Table
- **Table Format**: Bordered table with 5columns
- **Column Headers**: Sr. No | Department Name | Remarks | Status | Approved Date & Time
- **Table Rows**:
\n| Sr. No | Department Name | Remarks | Status | Approved Date & Time |
|--------|----------------|---------|--------|---------------------|
| 1 | Library | [Remarks from approver] | Approved ✔ | [Date & Time] |
| 2 | Hostel / Bus | [Remarks from approver] | Approved ✔ | [Date & Time] |\n| 3 | Training & Placement | [Remarks from approver] | Approved ✔ | [Date & Time] |
| 4 | Exam Cell | [Remarks from approver] | Approved ✔ | [Date & Time] |
| 5 | Student Section | [Remarks from approver] | Approved ✔ | [Date & Time] |\n| 6 | Scholarship | [Remarks from approver] | Approved ✔ | [Date & Time] |
| 7 | Accounts | [Remarks from approver] | Approved ✔ | [Date & Time] |
\n- **Status Formatting**: 'Approved' text displayed in green color with checkmark icon (✔)
- **Data Source**: Fetch remarks, approval timestamps, and approver names from Firestore clearance_status collection
\n#### 5️⃣ Declaration Section
- **Declaration Text**: \n  'This is to certify that the above-mentioned student has cleared all departmental dues of DKTE College. Hence, the student is granted No-Dues Clearance for the stated academic period.'
- **Formatting**: Justified alignment, standard paragraph spacing
\n#### 6️⃣ Signature Section
- **Layout**: 3-column layout at bottom of page
- **Columns**:
  - **Column 1**: \n    - Label: 'Prepared By'
    - Text: '(System Generated)'
  - **Column 2**: 
    - Label: 'Verified By'
    - Text: '(Student Section / Accounts)'
  - **Column 3**: 
    - Label: 'Authorized Signatory'
    - Text: '(Principal / Registrar)'
- **Spacing**: Adequate space above each label for physical signature (if needed)

#### 7️⃣ Footer Section
- **Auto-Generated Message**: 'This is a system-generated certificate and does not require a physical signature.'
- **College Website URL**: [Optional - College website link]
- **Page Number**: Displayed at bottom-right corner

### 10.3 PDF Functional Logic

#### A. Generation Conditions
- PDF generation triggered ONLY when:\n  - All 7 departments (Library, Hostel/Bus, TPO, Exam Cell, Student Section, Scholarship, Accounts) have status = 'Approved'
  - Overall clearance request status = 'Completed'
-'Download Certificate' button remains disabled/hidden until all approvals are complete

#### B. File Naming Convention
- **Format**: `No_Dues_Certificate_[EnrollmentNumber]_[Date].pdf`
- **Example**: `No_Dues_Certificate_2023001_2025-12-13.pdf`
\n#### C. PDF Specifications
- **Page Size**: A4 (210mm x 297mm)
- **Orientation**: Portrait\n- **Print-Friendly**: Optimized margins and layout for physical printing
- **File Format**: PDF/A standard for archival quality

#### D. Storage & Retrieval
- **Storage Location**: Firebase Storage with path structure: `/certificates/no_dues/[student_id]/[certificate_id].pdf`
- **Database Record**: Store PDF metadata in Firestore `pdf_records` collection:\n  - certificate_id (format: CERT-YYYY-XXXXXX)
  - student_id\n  - request_id
  - pdf_file_url (Firebase Storage URL)
  - generation_timestamp
  - download_count
- **Download Access**: Students can download PDF from their dashboard; Admin can access all certificates

### 10.4 PDF Design Style
\n#### A. Visual Design\n- **Background**: Clean white background (#FFFFFF)
- **Accent Colors**: \n  - Blue accent lines for borders and separators (#2196F3)
  - Green for'Approved' status text (#4CAF50)
- **Layout**: Professional academic layout with balanced spacing and clear visual hierarchy
\n#### B. Typography
- **Font Family**: Times New Roman (primary) / Roboto / Open Sans (fallback)
- **Font Sizes**:
  - College Name: 16pt, Bold, Uppercase
  - Certificate Title: 18-20pt, Bold, Uppercase\n  - Section Headers: 14pt, Bold\n  - Body Text: 12pt, Regular\n  - Footer Text: 10pt, Regular
- **Line Spacing**: 1.5 for body text, 1.2 for tables

#### C. Branding Elements
- **College Logo**: DKTE-LOGO-1024x274.png displayed at top-center with appropriate scaling
- **Watermark**: Optional college watermark embedded in background (semi-transparent)
- **Border**: Thin border around entire certificate (1-2pt, blue color)

### 10.5 PDF Generation Code Implementation

#### A. Android PDF Library\n- Use Android PdfDocument API or iText library for PDF generation
- Implement PDFGenerator.java class with methods:
  - `generateNoDuesCertificate(String studentId, String requestId)`
  - `fetchApprovalData(String requestId)` - Retrieve approval records from Firestore
  - `createPDFDocument()` - Build PDF structure
  - `addHeader()` - Add logo, college name, address
  - `addCertificateTitle()` - Add title and separator line
  - `addStudentDetails()` - Add student information section
  - `addApprovalTable()` - Create and populate approval table
  - `addDeclaration()` - Add declaration text
  - `addSignatureSection()` - Add signature placeholders
  - `addFooter()` - Add footer with auto-generated message
  - `savePDFToStorage()` - Upload PDF to Firebase Storage
  - `storePDFMetadata()` - Save PDF record in Firestore

#### B. Data Fetching Logic
- Query Firestore collections:
  - `students` collection: Fetch student profile data (name, enrollment number, PRN, department, year)
  - `clearance_requests` collection: Fetch request details (request_id, submission date, completion date)
  - `clearance_status` collection: Fetch department-wise approval records (department name, status, remarks, approver name, timestamp)
- Validate that all departments have status = 'Approved' before generating PDF

#### C. PDF Download Functionality
- **Student Dashboard**: Display'Download Certificate' button when PDF is available
- **Download Action**: \n  - Fetch PDF URL from Firestore `pdf_records` collection
  - Download PDF file from Firebase Storage
  - Save to device storage (Downloads folder)
  - Increment download_count in Firestore
- **Share Options**: Allow students to share PDF via email, WhatsApp, or other messaging apps

### 10.6 Certificate Verification (Optional)
- **QR Code**: Generate QR code containing certificate verification URL
- **Verification URL**: Link to web portal where certificate authenticity can be verified using certificate_id
- **QR Code Placement**: Bottom-left corner of certificate\n
---

## 11. App Output Required (Complete Deliverables)

### 11.1 Java Activities (Android)
- **MainActivity.java**: App entry point, navigation controller\n- **StudentLoginActivity.java**: Student login screen\n- **StaffAccessPasswordActivity.java**: Staff access password verification
- **StaffRoleSelectionActivity.java**: Staff role selection page with10 role buttons
- **TeacherLoginActivity.java**: Teacher login screen
- **HODLoginActivity.java**: HOD login screen
- **LibraryLoginActivity.java**: Library staff login screen
- **AccountsLoginActivity.java**: Accounts staff login screen
- **ScholarshipLoginActivity.java**: Scholarship staff login screen
- **StudentSectionLoginActivity.java**: Student Section staff login screen
- **HostelBusLoginActivity.java**: Hostel/Bus staff login screen
- **TPOLoginActivity.java**: TPO staff login screen
- **ExamCellLoginActivity.java**: Exam Cell staff login screen
- **AdminLoginActivity.java**: Admin login screen
- **StaffRegistrationActivity.java**: Staff registration form
- **AccountPendingActivity.java**: Account pending approval screen\n- **StudentDashboardActivity.java**: Student dashboard with all features
- **StudentProfileActivity.java**: Student profile view and edit
- **ClearanceRequestFormActivity.java**: Student clearance request form
- **ClearanceStatusActivity.java**: Real-time clearance status tracking
- **ClearanceTimelineActivity.java**: Visual timeline of approvals
- **PDFViewerActivity.java**: PDF certificate viewer and download
- **TeacherDashboardActivity.java**: Teacher dashboard with department-filtered view and department section
- **HODDashboardActivity.java**: HOD dashboard with full department access
- **StudentSectionDashboardActivity.java**: Student Section dashboard\n- **LibraryDashboardActivity.java**: Library staff dashboard
- **AccountsDashboardActivity.java**: Accounts staff dashboard
- **ScholarshipDashboardActivity.java**: Scholarship staff dashboard
- **HostelBusDashboardActivity.java**: Hostel/Bus staff dashboard
- **TPODashboardActivity.java**: TPO staff dashboard
- **ExamCellDashboardActivity.java**: Exam Cell staff dashboard\n- **AdminDashboardActivity.java**: Admin panel with full system access
- **AdminManageStudentsActivity.java**: Admin student management (CRUD)
- **AdminManageStaffActivity.java**: Admin staff management (CRUD)
- **AdminStaffApprovalActivity.java**: Admin staff approval/rejection
- **AdminManageDepartmentsActivity.java**: Admin department management
- **AdminReportsActivity.java**: Admin reports and analytics
- **AdminUserReportsActivity.java**: Admin User Reports module with advanced PDF download options (NEW)
- **NotificationsActivity.java**: Notifications screen for all users
\n### 11.2 XML UI Layouts\n- **activity_main.xml**: Main activity layout
- **activity_student_login.xml**: Student login screen layout
- **activity_staff_access_password.xml**: Staff access password popup/screen layout
- **activity_staff_role_selection.xml**: Staff role selection page layout with 10 buttons
- **activity_teacher_login.xml**: Teacher login layout
- **activity_hod_login.xml**: HOD login layout
- **activity_library_login.xml**: Library login layout
- **activity_accounts_login.xml**: Accounts login layout
- **activity_scholarship_login.xml**: Scholarship login layout
- **activity_student_section_login.xml**: Student Section login layout
- **activity_hostel_bus_login.xml**: Hostel/Bus login layout
- **activity_tpo_login.xml**: TPO login layout
- **activity_exam_cell_login.xml**: Exam Cell login layout
- **activity_admin_login.xml**: Admin login layout
- **activity_staff_registration.xml**: Staff registration form layout
- **activity_account_pending.xml**: Account pending approval layout
- **activity_student_dashboard.xml**: Student dashboard layout
- **activity_student_profile.xml**: Student profile layout
- **activity_clearance_request_form.xml**: Clearance request form layout
- **activity_clearance_status.xml**: Clearance status tracking layout
- **activity_clearance_timeline.xml**: Clearance timeline layout\n- **activity_pdf_viewer.xml**: PDF viewer layout
- **activity_teacher_dashboard.xml**: Teacher dashboard layout with department section card
- **activity_hod_dashboard.xml**: HOD dashboard layout
- **activity_student_section_dashboard.xml**: Student Section dashboard layout
- **activity_library_dashboard.xml**: Library dashboard layout
- **activity_accounts_dashboard.xml**: Accounts dashboard layout
- **activity_scholarship_dashboard.xml**: Scholarship dashboard layout
- **activity_hostel_bus_dashboard.xml**: Hostel/Bus dashboard layout\n- **activity_tpo_dashboard.xml**: TPO dashboard layout
- **activity_exam_cell_dashboard.xml**: Exam Cell dashboard layout
- **activity_admin_dashboard.xml**: Admin dashboard layout
- **activity_admin_manage_students.xml**: Admin student management layout
- **activity_admin_manage_staff.xml**: Admin staff management layout
- **activity_admin_staff_approval.xml**: Admin staff approval layout
- **activity_admin_manage_departments.xml**: Admin department management layout
- **activity_admin_reports.xml**: Admin reports layout
- **activity_admin_user_reports.xml**: Admin User Reports module layout with dropdown/modal for report type selection and filter options (NEW)
- **activity_notifications.xml**: Notifications layout\n- **item_student.xml**: Student list item layout
- **item_staff.xml**: Staff list item layout
- **item_clearance_request.xml**: Clearance request list item layout
- **item_department_status.xml**: Department status chip layout
- **card_department_section.xml**: Teacher department section card layout
- **dialog_staff_access_password.xml**: Staff access password dialog layout
- **dialog_report_type_selection.xml**: Report type selection dialog layout (NEW)
\n### 11.3 Firebase Authentication Code
- **FirebaseAuthHelper.java**: Helper class for Firebase Authentication
  - Student registration and login
  - Staff registration and login (with role-based custom claims)
  - Admin login\n  - Password reset functionality
  - Session management
  - Logout functionality
\n### 11.4 Firestore Real-Time Database Structure
- **Collections**:
  - `users`: User accounts (students, staff, admin) with role and department fields
  - `students`: Student profiles with department_id foreign key
  - `staff`: Staff profiles with role and department_id foreign key
  - `departments`: Department information
  - `clearance_requests`: Clearance requests with student_id and department_id foreign keys
  - `clearance_status`: Department-wise approval status with request_id and department_id foreign keys
  - `staff_registration_requests`: Pending staff registration requests
  - `pdf_records`: Generated PDF certificate records
  - `admin_reports`: Admin-generated PDF reports (includes user reports with report_type, filters_applied, total_records_count)
  - `notifications`: User notifications
  - `audit_logs`: System activity logs (including login/logout timestamps, session duration)

### 11.5 Staff Approval Logic
- **StaffApprovalManager.java**: Manages staff registration approval workflow
  - Fetch pending staff requests\n  - Approve staff account (update status to 'Active', create Firebase Authentication account)
  - Reject staff account (update status to 'Rejected', store rejection reason)
  - Send approval/rejection notifications
\n### 11.6 Department-Wise Student Filtering
- **DepartmentFilterHelper.java**: Helper class for department-based data filtering
  - Filter students by department_id
  - Filter staff by department_id
  - Filter clearance requests by department_id
  - Admin bypass logic (no filtering for admin)

### 11.7 Admin Full-Access Dashboard
- **AdminDashboardManager.java**: Manages admin panel operations
  - CRUD operations for students\n  - CRUD operations for staff
  - CRUD operations for departments
  - Staff approval/rejection\n  - Department-wise student/staff display
  - System-wide reports and analytics
  - User Reports module with advanced PDF download options (NEW)

### 11.8 Student Clearance Form
- **ClearanceFormManager.java**: Manages clearance form submission
  - Validate form fields
  - Upload documents to Firebase Storage
  - Create clearance request in Firestore
  - Generate unique request ID
  - Set initial status to 'Pending'
\n### 11.9 Clearance Workflow Engine
- **ClearanceWorkflowEngine.java**: Implements clearance workflow logic
  - Hall Ticket workflow (office approvals → teacher → HOD)\n  - No-Dues workflow (independent departments + sequential departments → HOD)
  - Sequential lock mechanism (Student Section → Scholarship → Accounts)
  - Parallel processing for independent departments
  - Real-time status updates
  - Workflow validation and progression

### 11.10 No-Dues PDF Generator Code
- **NoDuesPDFGenerator.java**: Generates professional No-Dues Clearance Certificate PDF
  - **Methods**:
    - `generateNoDuesCertificate(String studentId, String requestId)`: Main generation method
    - `validateAllApprovalsComplete(String requestId)`: Check if all departments approved
    - `fetchStudentData(String studentId)`: Retrieve student profile from Firestore
    - `fetchClearanceRequestData(String requestId)`: Retrieve request details\n    - `fetchApprovalRecords(String requestId)`: Retrieve department-wise approval data
    - `createPDFDocument()`: Initialize PDF document (A4 size, portrait)\n    - `addDKTELogo()`: Add DKTE-LOGO-1024x274.png at top-center
    - `addCollegeHeader()`: Add college name and address
    - `addCertificateTitle()`: Add 'NO-DUES CLEARANCE CERTIFICATE' title with separator line
    - `addStudentDetailsSection()`: Add 2-column student information table
    - `addApprovalTable()`: Create 7-row approval table with green status indicators
    - `addDeclarationText()`: Add certification declaration paragraph
    - `addSignatureSection()`: Add 3-column signature placeholders
    - `addFooter()`: Add system-generated message and page number
    - `applyProfessionalStyling()`: Apply Times New Roman font, blue/green accents, borders
    - `savePDFToFirebaseStorage(byte[] pdfBytes)`: Upload PDF to Firebase Storage
    - `storePDFMetadataInFirestore(String pdfUrl)`: Save PDF record in Firestore
    - `generateCertificateID()`: Generate unique certificate ID (CERT-YYYY-XXXXXX format)
  - **PDF Library**: Use Android PdfDocument API or iText library
  - **File Naming**: `No_Dues_Certificate_[EnrollmentNumber]_[Date].pdf`
  - **Storage Path**: `/certificates/no_dues/[student_id]/[certificate_id].pdf`
\n### 11.11 User Reports PDF Generator Code (NEW)
\n**A. AllUsersReportPDFGenerator.java**: Generates All Users Report PDF
- **Methods**:
  - `generateAllUsersReport()`
  - `fetchAllUsersData()`
  - `sortUsersByRole(List<User> users)`
  - `createPDFDocument()`
  - `addDKTELogo()`\n  - `addReportHeader(String reportTitle)`
  - `addReportMetadata(String reportType, String filters, int totalRecords)`
  - `addAllUsersTable(List<User> users)`
  - `addSummarySection(int totalUsers, int totalStudents, int totalStaff, int totalHODs, int totalAdmins, int activeUsers, int inactiveUsers)`
  - `addDeclaration()`
  - `addSignatureSection()`
  - `addFooter()`
  - `applyProfessionalStyling()`
  - `savePDFToFirebaseStorage(byte[] pdfBytes, String fileName)`
  - `storePDFMetadataInFirestore(String pdfUrl, String reportType, String filters, int totalRecords)`
  - `generateReportID()`
- **File Naming**: `All_Users_Report_[Date]_[Time].pdf`
- **Storage Path**: `/admin_reports/user_reports/all_users/[report_id].pdf`

**B. StudentReportDepartmentWisePDFGenerator.java**: Generates Student Report (Department-Wise) PDF
- **Methods**:
  - `generateStudentReportDepartmentWise(String departmentId)`
  - `fetchStudentsByDepartment(String departmentId)`
  - `addStudentTable(List<Student> students)`\n  - `addStudentSummary(int totalStudents, int activeStudents, int inactiveStudents, Map<String, Integer> yearWiseBreakdown)`
  - (Other common methods inherited or reused)
- **File Naming**: `Student_Report_[Department]_[Date]_[Time].pdf`
- **Storage Path**: `/admin_reports/user_reports/students_department_wise/[report_id].pdf`
\n**C. StaffReportDepartmentWisePDFGenerator.java**: Generates Staff Report (Department-Wise) PDF\n- **Methods**:
  - `generateStaffReportDepartmentWise(String departmentId)`
  - `fetchStaffByDepartment(String departmentId)`
  - `addStaffTable(List<Staff> staff)`
  - `addStaffSummary(int totalStaff, String hodName, int teacherCount, Map<String, Integer> roleWiseBreakdown)`
  - (Other common methods inherited or reused)
- **File Naming**: `Staff_Report_[Department]_[Date]_[Time].pdf`
- **Storage Path**: `/admin_reports/user_reports/staff_department_wise/[report_id].pdf`

**D. RoleWiseUserReportPDFGenerator.java**: Generates Role-Wise User Report PDF
- **Methods**:
  - `generateRoleWiseUserReport(String role)`
  - `fetchUsersByRole(String role)`
  - `addRoleWiseUserTable(List<User> users)`
  - `addRoleWiseSummary(int totalUsers, int activeUsers, int inactiveUsers, Map<String, Integer> departmentWiseBreakdown)`\n  - (Other common methods inherited or reused)
- **File Naming**: `[Role]_Report_[Date]_[Time].pdf`
- **Storage Path**: `/admin_reports/user_reports/role_wise/[report_id].pdf`

**E. DepartmentConsolidatedReportPDFGenerator.java**: Generates Department-Wise Consolidated Report PDF
- **Methods**:
  - `generateDepartmentConsolidatedReport()`
  - `fetchAllDepartments()`
  - `fetchStudentsByDepartment(String departmentId)`
  - `fetchStaffByDepartment(String departmentId)`
  - `fetchHODByDepartment(String departmentId)`
  - `addDepartmentSection(String departmentName, List<Student> students, List<Staff> staff, Staff hod)`
  - `addDepartmentSummary(int totalStudents, int totalStaff, int activeStudents, int activeStaff)`
  - `addOverallSummary(int totalDepartments, int totalStudents, int totalStaff, int totalHODs)`
  - (Other common methods inherited or reused)\n- **File Naming**: `Department_Consolidated_Report_[Date]_[Time].pdf`
- **Storage Path**: `/admin_reports/user_reports/department_consolidated/[report_id].pdf`

**F. LoginActivityReportPDFGenerator.java**: Generates Login & Activity Report PDF
- **Methods**:
  - `generateLoginActivityReport(Date fromDate, Date toDate)`
  - `fetchLoginActivityData(Date fromDate, Date toDate)`\n  - `calculateSessionDuration(Timestamp loginTime, Timestamp logoutTime)`
  - `addLoginActivityTable(List<UserActivity> activities)`
  - `addLoginActivitySummary(int totalUsers, String mostActiveUser, double avgSessionDuration, int totalLogins, int activeUsers, int inactiveUsers)`
  - (Other common methods inherited or reused)\n- **File Naming**: `Login_Activity_Report_[Date]_[Time].pdf`\n- **Storage Path**: `/admin_reports/user_reports/login_activity/[report_id].pdf`

### 11.12 Navigation Flow\n- **NavigationManager.java**: Manages app navigation
  - Role-based navigation (student, staff, admin)
  - Bottom navigation for students
  - Drawer navigation for staff and admin
  - Back stack management
\n### 11.13 Department Role Workflows
- **DepartmentWorkflowManager.java**: Manages department-specific workflows
  - Independent department approvals (Library, Hostel/Bus, TPO, Exam Cell)
  - Sequential department approvals (Student Section → Scholarship → Accounts)
  - Teacher approval (after office approvals for Hall Ticket)
  - HOD final approval\n\n### 11.14 Teacher Department Section Manager
- **TeacherDepartmentManager.java**: Manages teacher department section functionality
  - Fetch department information from Firestore using teacher's department_id
  - Display department name, code, HOD name\n  - Calculate total students in department
  - Count pending clearance requests for teacher's department
  - Fetch and display department-specific announcements
  - Real-time updates for department statistics

### 11.15 Error Handling\n- **ErrorHandler.java**: Centralized error handling
  - Network errors
  - Firebase errors
  - Validation errors
  - User-friendly error messages
  - Logging and debugging

### 11.16 Security Rules for Firestore
- **firestore.rules**: Firestore security rules
  - Role-based read/write permissions
  - Department-based data visibility rules
  - Admin unrestricted access
  - Student data protection\n  - Staff data protection
  - Admin-only access to audit_logs and admin_reports collections

### 11.17 Complete Architecture
- **Architecture Diagram**: Visual representation of app architecture
  - MVVM (Model-View-ViewModel) pattern
  - Firebase Authentication integration
  - Firestore real-time database integration
  - Firebase Storage integration
  - Repository pattern for data access
  - LiveData and ViewModel for UI updates
\n---

## 12. Key Screens Summary

### 12.1 Authentication Screens
- Main Login Screen (Student Login Only) with'Staff Login' button at top
- Staff Access Password Verification Screen (popup or full screen)
- Staff Role Selection Page (10 role buttons)
- Individual Staff Login Screens (10 types: Teacher, HOD, Library, Accounts, Scholarship, Student Section, Hostel/Bus, TPO, Exam Cell, Admin)
- Staff Registration Screen\n- Account Pending Approval Screen
\n### 12.2 Student Screens
- Student Dashboard with real-time status, progress bar, logs, PDF download
- Student Profile (view and edit)
- Clearance Request Form (withdocument upload)
- Clearance Status Tracking (color-coded chips, department-wise progress)
- Clearance Timeline (chronological approval history)
- PDF Certificate Viewer (No-Dues Clearance Certificate)
- Notifications Screen

### 12.3 Staff Screens
- Teacher Dashboard (own department view, unlocks after office approvals for Hall Ticket, includes department section card)
- HOD Dashboard (full department access: students, staff, clearance requests, override decisions)
- Student Section Dashboard (own department view)\n- Department Dashboards (6 types: Library, Accounts, Scholarship, Hostel/Bus, TPO, Exam Cell - own department view)
- Pending Requests List (filtered by department)
- Student Details View (from clearance form)
- Approval Action Screen (approve/reject with remarks)
- History/Logs Screen (department-specific)\n
### 12.4 Admin Screens
- Admin Dashboard (full system overview)
- User Management Screen (Students/Staff CRUD)
- Pending Staff Requests Screen (approve/reject with reasons)
- Staff Approval/Rejection Screen\n- Department Management Screen (create, edit, delete departments)
- Department-wise Student Display Screen (filter by department)
- Department-wise Staff Display Screen (filter by department)
- Reports & Analytics Screen (system-wide analytics)
- **User Reports Screen** (NEW):\n  - Report type selection dropdown/modal (7 options)
  - Filter options (Department, Role, Date Range)
  - Generate & Download PDF button
  - Progress indicator during PDF generation
  - Download history log (optional)
- System Configuration Screen
- Audit Logs Screen (complete system activity)\n
---

## 13. Data Structure (Firestore Collections)

### 13.1 Users Collection
```\nusers/
  {user_id}/
    - user_id: string (auto-generated)
    - name: string
    - email: string (unique)
    - password: string (encrypted)
    - role: string (Student/Teacher/HOD/Library/Accounts/Scholarship/StudentSection/HostelBus/TPO/ExamCell/Admin)
    - department_id: string (foreign key, null for admin)
    - mobile_number: string
    - status: string (PendingApproval/Active/Inactive/Rejected)
    - rejection_reason: string (optional)
    - created_date: timestamp
    - approved_by: string (admin user_id, optional)
    - approval_date: timestamp (optional)
    - profile_photo_url: string (optional)
```

### 13.2 Students Collection
```
students/
  {student_id}/
    - student_id: string (auto-generated)\n    - user_id: string (foreign key to users collection)
    - full_name: string
    - enrollment_number: string (unique)
    - prn_number: string (unique)
    - department_id: string (foreign key)\n    - year: string\n    - semester: string
    - aadhaar_number: string\n    - mobile_number: string
    - address: string
    - email: string
    - profile_photo_url: string (optional)
    - created_date: timestamp
```

### 13.3 Staff Collection
```\nstaff/
  {staff_id}/
    - staff_id: string (auto-generated)\n    - user_id: string (foreign key to users collection)
    - full_name: string
    - email: string (unique)
    - role: string (Teacher/HOD/Library/Accounts/Scholarship/StudentSection/HostelBus/TPO/ExamCell)\n    - department_id: string (foreign key to departments collection)
    - mobile_number: string
    - status: string (Active/Inactive)\n    - created_date: timestamp
```

### 13.4 Departments Collection
```
departments/
  {department_id}/
    - department_id: string (auto-generated)
    - department_name: string
    - department_code: string (unique)
    - description: string
    - hod_id: string (foreign key to staff collection, optional)
    - created_date: timestamp
    - status: string (Active/Inactive)\n```

### 13.5 Clearance Requests Collection
```
clearance_requests/
  {request_id}/
    - request_id: string (auto-generated, unique)
    - student_id: string (foreign key)\n    - department_id: string (foreign key)
    - clearance_type: string (HallTicket/NoDues/LeavingCertificate)\n    - submission_date: timestamp
    - completion_date: timestamp (set when all approvals complete)
    - last_fee_receipt_url: string (optional)
    - uploaded_documents: array of strings (file URLs)
    - overall_status: string (Pending/InProgress/Approved/Rejected/Completed)
    - created_date: timestamp
    - updated_date: timestamp\n```

### 13.6 Clearance Status Collection
```
clearance_status/
  {status_id}/
    - status_id: string (auto-generated)\n    - request_id: string (foreign key)\n    - student_id: string (foreign key)
    - department_id: string (foreign key)\n    - department_name: string (Library/Accounts/Scholarship/StudentSection/HostelBus/TPO/ExamCell/Teacher/HOD)
    - status: string (Approved/Rejected/Pending)
    - remarks: string (optional)
    - approver_id: string (foreign key to users collection)
    - approver_name: string\n    - timestamp: timestamp
    - approval_order: number (for sequential tracking)
```

### 13.7 Staff Registration Requests Collection
```
staff_registration_requests/
  {request_id}/
    - request_id: string (auto-generated)
    - name: string
    - email: string
    - password: string (encrypted)
    - role: string (Teacher/HOD/Library/Accounts/Scholarship/StudentSection/HostelBus/TPO/ExamCell)\n    - department_id: string (foreign key)
    - mobile_number: string
    - request_date: timestamp
    - status: string (Pending/Approved/Rejected)
    - reviewed_by: string (admin user_id, optional)
    - review_date: timestamp (optional)
    - rejection_reason: string (optional)
```

### 13.8 PDF Records Collection
```
pdf_records/
  {certificate_id}/
    - certificate_id: string (auto-generated, format: CERT-YYYY-XXXXXX)
    - student_id: string (foreign key)
    - request_id: string (foreign key)\n    - certificate_type: string (NoDues/HallTicket/LeavingCertificate)\n    - pdf_file_url: string (Firebase Storage URL)
    - pdf_file_name: string (No_Dues_Certificate_[EnrollmentNumber]_[Date].pdf)
    - generation_timestamp: timestamp
    - download_count: number\n```

### 13.9 Admin Reports Collection
```
admin_reports/
  {report_id}/
    - report_id: string (auto-generated, format: REPORT-YYYY-XXXXXX)
    - report_type: string (All Users Report / Student Report - Department Wise / Staff Report - Department Wise / Role-Wise User Report / Department Consolidated Report / Login & Activity Report)
    - generated_by: string (admin user_id)\n    - generation_timestamp: timestamp
    - pdf_file_url: string (Firebase Storage URL)
    - pdf_file_name: string (e.g., All_Users_Report_[Date]_[Time].pdf, Student_Report_[Department]_[Date]_[Time].pdf)
    - filters_applied: map (department, role, date_range)
    - total_records_count: number
    - download_count: number
```\n
### 13.10 Notifications Collection
```
notifications/
  {notification_id}/
    - notification_id: string (auto-generated)
    - user_id: string (foreign key)
    - message: string
    - type: string (Approval/Rejection/StatusChange/AccountActivation/CertificateReady)\n    - read_status: boolean\n    - timestamp: timestamp
```

### 13.11 Audit Logs Collection\n```
audit_logs/
  {log_id}/
    - log_id: string (auto-generated)
    - user_id: string (foreign key)
    - user_role: string\n    - action: string (Login/Logout/Approve/Reject/Create/Edit/Delete/GeneratePDF/DownloadReport)
    - target_entity: string (Student/Staff/Department/ClearanceRequest/PDFCertificate/AdminReport)
    - target_id: string (entity ID)
    - details: string (action details)
    - login_timestamp: timestamp (for Login action)
    - logout_timestamp: timestamp (for Logout action)
    - session_duration: number (in minutes, calculated for Logout action)
    - timestamp: timestamp
```
\n---

## 14. Technical Requirements

### 14.1 Real-Time Features
- Automatic status refresh across all dashboards using Firestore real-time listeners
- Push notifications for status changes, approvals, rejections, account activation, and certificate generation
- Live approval updates with instant UI refresh
- Instant workflow progression with real-time status synchronization
- Real-time department section updates in teacher dashboard
- Real-time PDF generation status updates

### 14.2 Security
- Two-layer authentication for staff (staff access password + role-specific login)
- Role-based access control (RBAC) with department-level restrictions
- Encrypted password storage using Firebase Authentication
- Secure file upload handling with Firebase Storage security rules
- Session management with Firebase Authentication tokens
- Data validation on all forms (client-side and server-side)
- Department-based data isolation enforced by Firestore security rules\n- Admin bypass logic for unrestricted access
- Secure PDF storage with access control
- Admin-only access to User Reports PDF generation
- Sensitive data protection (passwords, tokens, OTPs excluded from PDFs)

### 14.3 Performance
- Fast load times for dashboards with optimized Firestore queries
- Efficient database queries with department filters and indexed fields
- Optimized image/file handling with Firebase Storage compression
- Smooth navigation transitions with Android Navigation Component
- Indexed department_id fields for quick filtering
- Pagination for large data lists (students, staff, clearance requests)
- Cached department information for teacher dashboard section
- Efficient PDF generation with background processing
- Optimized User Reports PDF generation with batch data fetching

### 14.4 Backend & Database
- RESTful API architecture (optional, if using custom backend)
- Firestore real-time database with relational structure using foreign keys
- Automated workflow logic with Cloud Functions (optional)
- Sequential lock mechanism for dependent departments
- Parallel processing support for independent departments
- Department-based query filtering middleware
- Admin bypass logic for unrestricted access
- Staff registration approval workflow
- Audit trail logging for all user actions (including login/logout timestamps, session duration)
- Teacher department section data fetching via department_id foreign key
- PDF generation triggered by Cloud Functions when all approvals complete
- User Reports PDF generation triggered by admin action
\n---

## 15. Navigation Flow

### 15.1 Student Flow
```
App Launch \n→ Main Login Screen (Student Login) 
→ Student Dashboard \n→ Submit Clearance Request (select department, upload documents) 
→ Track Status (real-time updates, color-coded chips) 
→ Download No-Dues Clearance Certificate PDF (after all approvals)\n```

### 15.2 Staff Flow (New Registration)
```
App Launch \n→ Main Login Screen \n→ Click 'Staff Login' Button 
→ Staff Access Password Verification 
→ Staff Role Selection Page (10 role buttons) 
→ Select Role \n→ Staff Registration Form 
→ Submit \n→ Account Pending Approval Screen 
→ Wait for Admin Approval 
→ Receive Approval Notification 
→ Login After Activation 
→ Role-Specific Dashboard (department-filtered view) 
→ Approve/Reject Clearance Requests\n```

### 15.3 Staff Flow (Existing Active Account)
```
App Launch \n→ Main Login Screen 
→ Click 'Staff Login' Button 
→ Staff Access Password Verification 
→ Staff Role Selection Page (10 role buttons) 
→ Select Role 
→ Role-Specific Login \n→ Role-Specific Dashboard (department-filtered view) 
→ View Pending Requests 
→ Approve/Reject with Remarks\n```

### 15.4 Teacher Flow (With Department Section)
```
App Launch 
→ Main Login Screen 
→ Click 'Staff Login' Button 
→ Staff Access Password Verification 
→ Staff Role Selection Page \n→ Teacher Login \n→ Teacher Dashboard (includes department section card at top) 
→ View Department Information (name, code, HOD, student count, pending requests) 
→ View Pending Clearance Requests (after office approvals for Hall Ticket) 
→ Approve/Reject with Remarks
```

### 15.5 Admin Flow\n```
App Launch 
→ Main Login Screen 
→ Click 'Staff Login' Button 
→ Staff Access Password Verification 
→ Staff Role Selection Page \n→ Admin Login 
→ Admin Dashboard \n→ Manage Users (Students/Staff CRUD) 
→ Approve/Reject Staff Requests 
→ Manage Departments 
→ View Department-wise Student/Staff Lists 
→ Generate Reports (unrestricted access to all departments) 
→ Access User Reports Module (NEW)
```

### 15.6 Admin User Reports Flow (NEW)
```
Admin Dashboard 
→ Navigate to 'User Reports' Section 
→ Select Report Type from Dropdown/Modal (7 options):
   - All Users Report
   - Student Report - Department Wise
   - Staff Report - Department Wise
   - Department-Wise Consolidated Report
   - Role-Wise User Report
   - Login & Activity Report
→ Apply Filters (Department / Role / Date Range) if applicable \n→ Click'Generate & Download PDF' Button 
→ System validates admin role \n→ Progress indicator displayed \n→ PDF generated dynamically from database 
→ PDF uploaded to Firebase Storage 
→ PDF metadata stored in Firestore 
→ PDF downloaded to device 
→ Success message displayed 
→ Admin can share PDF via email or other apps
```

---

## 16. Design Style\n
- **Color Scheme**: Primary blue (#2196F3) for headers, navigation, and primary action buttons; accent green (#4CAF50) for approved status chips and PDF certificate status indicators; red (#F44336) for rejected status chips; amber (#FFC107) for pending status chips; clean white (#FFFFFF) backgrounds for main content areas; light grey (#F5F5F5) for card backgrounds and dividers\n- **Layout Style**: Card-based material design with clear visual hierarchy and consistent spacing; bottom navigation bar for students with icons for Dashboard, Profile, Status, Notifications; drawer navigation for staff and admin with role-specific menu items; floating action buttons for primary actions (e.g., Submit Clearance Request, Download Certificate, Download User Reports); department section card prominently displayed at top of teacher dashboard\n- **Interactive Elements**: Rounded buttons with8dp corner radius and elevation for depth; ripple effects on touch for all clickable elements; smooth slide transitions between screens; material design chips for status indicators with icons (checkmark for approved, cross for rejected, clock for pending); swipe-to-refresh for data lists; download button with progress indicator for PDF generation\n- **Typography**: Roboto font family with 16sp body text for readability, 20sp headings for section titles, 14sp secondary text for labels and captions, bold weight for emphasis on key information; Times New Roman font for PDF certificate content; Roboto/Open Sans/Times New Roman for User Reports PDFs
- **Status Indicators**: Color-coded chips with icons and text labels (Green: Approved ✓, Red: Rejected ✗, Yellow: Pending ⏳); progress bar with percentage completion for overall clearance status; certificate ready indicator with download icon; role badges with background colors for User Reports (Admin: Red, HOD: Blue, Teacher: Green, Student: Orange, Department Staff: Purple)\n- **Responsive Design**: Optimized for Android devices from 5-inch smartphones to 10-inch tablets with adaptive layouts; support for portrait and landscape orientations; responsive grid system for department lists and approval tables; PDF viewer optimized for mobile screens\n- **Navigation**: Bottom navigation bar for students (Dashboard, Profile, Status, Notifications); drawer navigation for staff and admin with expandable menu sections; breadcrumb navigation for admin panel\n- **Department Filters**: Dropdown selectors in staff dashboards (locked to own department, read-only); multi-select dropdown in admin panel with'All Departments' option; filter chips for quick department selection\n- **Department Section Card**: Material design card with elevation, displaying department name as header, department code, HOD name, student count, and pending requests count with icons; uses primary blue for header background
- **PDF Certificate Design**: Professional academic layout with DKTE College logo (DKTE-LOGO-1024x274.png), Times New Roman typography, blue/green accent colors, bordered approval table with green status indicators, clean white background, A4 print-friendly format
- **User Reports PDF Design**: Professional academic layout with DKTE College logo (DKTE-LOGO-1024x274.png), Roboto/Open Sans/Times New Roman typography, blue/gray accent colors, bordered tables with alternating row colors, role badges with background colors, clean white background, A4 print-friendly format
\n---

## 17. Deliverables Summary

- Main login screen (Student Login only) with 'Staff Login' button at top
- Staff access password security layer (popup or full screen)
- Staff Role Selection Page with 10 role buttons (Teacher, HOD, Library, Accounts, Scholarship, Student Section, Hostel/Bus, TPO, Exam Cell, Admin)
- Staff registration form with department selection and role assignment
- Account pending approval screen with status message
- All role-specific authentication screens and login flows (10 staff roles + student + admin)
- Complete student clearance form with department selection and document upload
- Student dashboard with real-time status tracking, color-coded chips, progress bar, logs history, and No-Dues PDF certificate download
- Teacher dashboard with department-filtered view (unlocks after office approvals for Hall Ticket) and department section card displaying:\n  - Department name and code
  - HOD name\n  - Total students in department
  - Pending clearance requests count
  - Department-specific announcements
- HOD dashboard with full department access (view all students, staff, clearance requests, override decisions)
- Student Section dashboard with department-filtered view\n- 6 department-specific dashboards (Library, Accounts, Scholarship, Hostel/Bus, TPO, Exam Cell) with department-filtered views
- Admin panel with full CRUD operations:\n  - User management (students/staff add/edit/delete)
  - Staff approval system (approve/reject with reasons)
  - Department management (create/edit/delete departments, assign HOD/staff)
  - Department-wise student display (filter by department)
  - Department-wise staff display (filter by department)
  - Unrestricted cross-department access
  - System-wide reports and analytics
  - **User Reports Module** (NEW):
    - Admin-only access section in Admin Panel
    - Report type selection dropdown/modal with 7 options:\n      1. All Users Report
      2. Student Report - Department Wise\n      3. Staff Report - Department Wise
      4. Department-Wise Consolidated Report
      5. Role-Wise User Report
      6. Login & Activity Report
      7. Combined Department-Wise Report
    - Filter options (Department, Role, Date Range)
    - Generate & Download PDF button\n    - Progress indicator during PDF generation
    - Professional PDF reports with DKTE College logo
    - Dynamic data fetching from database
    - File naming convention: [Report_Type]_[Filter]_[Date]_[Time].pdf
    - A4 print-friendly format with professional academic design
    - Common PDF structure: Header, Metadata, Data Table, Summary, Declaration, Signature, Footer
    - Report-specific table structures and content
    - Login & activity session details (Last Login, Last Logout, Session Duration, Total Logins, Account Status)
    - System activity summary (Total Active Users, Total Students, Total Admins, Total HODs, Most Active User, Average Session Duration)
    - Sensitive data protection (passwords, tokens, OTPs excluded)\n    - Admin-only access validation
    - Download logging in audit_logs collection
- **Professional No-Dues Clearance Certificate PDF Generator** with:
  - DKTE College logo (DKTE-LOGO-1024x274.png) at top-center
  - College name and address header
  - Certificate title:'NO-DUES CLEARANCE CERTIFICATE'
  - Student details section (name, enrollment/PRN, course/branch, academic year, request ID, submission/completion dates)
  - Department-wise approval table (7 departments: Library, Hostel/Bus, TPO, Exam Cell, Student Section, Scholarship, Accounts) with remarks, green status indicators, and timestamps
  - Declaration text certifying clearance of all departmental dues
  - Signature section (Prepared By, Verified By, Authorized Signatory)
  - Footer with system-generated message and page number
  - Professional design: Times New Roman font, blue/green accents, A4 print-friendly format
  - Auto-generated certificate ID (CERT-YYYY-XXXXXX format)
  - File naming: No_Dues_Certificate_[EnrollmentNumber]_[Date].pdf
  - Activation only when all departments approved
- Full navigation system (bottom navigation for students, drawer navigation for staff/admin)
- Complete clearance workflow logic with department-based visibility:\n  - Hall Ticket workflow (office approvals → teacher → HOD)\n  - No-Dues workflow (independent departments + sequential departments → HOD)
  - Sequential lock mechanism (Student Section → Scholarship → Accounts)
- Backend API with department filtering middleware (if using custom backend)
- Firestore database structure with department foreign keys and security rules
- Real-time notification system (including account activation alerts, certificate ready notifications, and report generation notifications)
- Role-based access control with department-level restrictions
- Admin bypass logic for unrestricted access\n- Teacher department section manager with real-time database integration
- Audit trail logging with login/logout timestamps and session duration tracking
- User Reports PDF generators with dynamic data fetching and professional formatting (7 report types)
- Fully functional, modern, and responsive Android application with department-based data isolation, professional PDF certificate generation, and comprehensive admin reporting capabilities

---
\n## 18. Reference Images

- DKTE College Logo: DKTE-LOGO-1024x274.png (used in PDF certificate header and User Reports headers)
- User registration interface reference: image.png\n- Staff access password verification interface reference: image.png
- Staff role selection page reference: image.png
- Department dashboard interface reference: image.png
- Clearance status tracking interface reference: image.png
- Admin panel interface reference: screenshot.png
- Additional interface references: image.png