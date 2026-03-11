require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- CONFIGURATION ---
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://educlera.onrender.com', 
  'https://educlera-smart-college-clearance-system.onrender.com',
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || !process.env.NODE_ENV) {
      return callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// --- MONGODB CONNECTION ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB Disconnected');
});

connectDB();

const toJSONConfig = {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    if (!ret.id) ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
};

// --- SCHEMAS ---
const UserSchema = new mongoose.Schema({
  supabaseId: { type: String, required: true, unique: true },
  username: String,
  name: String,
  email: String,
  role: String,
  department: String,
  birthDate: String,
  joiningDate: String,
  year: String,
  subject: String,
  createdAt: { type: Date, default: Date.now }
});
UserSchema.set('toJSON', toJSONConfig);

const StudentSchema = new mongoose.Schema({
  id: String,
  userId: { type: String, required: true },
  name: String,
  collegeId: String,
  enrollmentNumber: { type: String, unique: true },
  department: String,
  year: Number,
  email: String,
  phone: String
});
StudentSchema.set('toJSON', toJSONConfig);

const RequestSchema = new mongoose.Schema({
  id: String,
  studentId: String,
  type: String, 
  status: String,
  submittedAt: String,
  completedAt: String,
  pdfUrl: String
});
RequestSchema.set('toJSON', toJSONConfig);

const ApprovalSchema = new mongoose.Schema({
  id: String,
  requestId: String,
  department: String,
  status: String,
  assignedTo: String,
  remarks: String,
  approvedBy: String,
  approvedAt: String,
  createdAt: String
});
ApprovalSchema.set('toJSON', toJSONConfig);

// ---> NEW DEPARTMENT SCHEMA <---
const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});
DepartmentSchema.set('toJSON', toJSONConfig);

const User = mongoose.model('User', UserSchema);
const Student = mongoose.model('Student', StudentSchema);
const Request = mongoose.model('Request', RequestSchema);
const Approval = mongoose.model('Approval', ApprovalSchema);
const Department = mongoose.model('Department', DepartmentSchema); // NEW

// --- ROUTES ---

// ==========================================
// 1. AUTH ROUTES
// ==========================================
app.post('/api/auth/resolve-enrollment', async (req, res) => {
  try {
    const { enrollmentNumber } = req.body;
    if (!enrollmentNumber) return res.status(400).json({ error: 'Enrollment ID required' });

    const student = await Student.findOne({ enrollmentNumber });
    if (!student) return res.status(404).json({ error: 'Enrollment ID not registered' });

    const user = await User.findOne({ supabaseId: student.userId });
    if (!user) return res.status(404).json({ error: 'User account not found' });

    res.json({ email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/sync-user', async (req, res) => {
  try {
    const { supabaseId, ...userData } = req.body;
    const user = await User.findOneAndUpdate(
      { supabaseId },
      { ...userData, supabaseId, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/auth/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ supabaseId: userId });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    let studentData = null;
    if (user.role === 'student') {
      studentData = await Student.findOne({ userId: user.supabaseId });
    }
    res.json({ user, student: studentData });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/student-profile', async (req, res) => {
  try {
    const existing = await Student.findOne({ enrollmentNumber: req.body.enrollmentNumber });
    if (existing) {
       return res.status(400).json({ error: 'Enrollment Number already exists' });
    }
    const student = await Student.create(req.body);
    res.json(student);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// 2. RESOURCE ROUTES
// ==========================================

// --- NEW DEPARTMENT ROUTES ---
app.get('/api/departments', async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/departments', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const existing = await Department.findOne({ name });
    if (existing) return res.status(400).json({ error: 'Department already exists' });
    const dept = await Department.create({ name });
    res.json(dept);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/departments/:name', async (req, res) => {
  try {
    const dept = await Department.findOneAndDelete({ name: req.params.name });
    if (!dept) return res.status(404).json({ error: 'Department not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
// -----------------------------

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/users/:supabaseId', async (req, res) => {
  try {
    const user = await User.findOne({ supabaseId: req.params.supabaseId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    let studentData = null;
    if (user.role === 'student') studentData = await Student.findOne({ userId: user.supabaseId });
    res.json({ user, student: studentData });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const query = mongoose.isValidObjectId(req.params.id) ? { _id: req.params.id } : { id: req.params.id };
    const user = await User.findOneAndUpdate(query, req.body, { new: true });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const query = mongoose.isValidObjectId(req.params.id) ? { _id: req.params.id } : { id: req.params.id };
    const user = await User.findOneAndDelete(query);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'student') await Student.findOneAndDelete({ userId: user.supabaseId });
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/requests', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { request, approvals } = req.body;
    await Request.create([request], { session, ordered: true });
    if (approvals?.length > 0) {
      await Approval.create(approvals, { session, ordered: true });
    }
    await session.commitTransaction();
    res.json({ success: true, request });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

app.get('/api/requests', async (req, res) => { 
  try {
    const requests = await Request.find();
    res.json(requests);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/requests/student/:studentId', async (req, res) => {
  try {
    const requests = await Request.find({ studentId: req.params.studentId });
    res.json(requests);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/approvals', async (req, res) => {
  try {
    const { role, name, requestId } = req.query;
    let query = {};
    if (requestId) {
      query.requestId = requestId;
    } else if (role || name) {
      query = { $or: [{ department: role }, { assignedTo: name }] };
    }
    const approvals = await Approval.find(query);
    res.json(approvals);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/approvals/:id', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { status, remarks, approvedBy } = req.body;
    const approval = await Approval.findOneAndUpdate(
      { id: req.params.id }, 
      { status, remarks, approvedBy, approvedAt: new Date().toISOString() },
      { new: true, session }
    );

    if (!approval) throw new Error("Approval not found");

    const allApprovals = await Approval.find({ requestId: approval.requestId }).session(session);
    const anyRejected = allApprovals.some(a => a.status === 'rejected');
    const allApproved = allApprovals.every(a => a.status === 'approved');

    let newRequestStatus = 'pending';
    if (anyRejected) newRequestStatus = 'rejected';
    else if (allApproved) newRequestStatus = 'approved';

    if (newRequestStatus !== 'pending') {
      await Request.findOneAndUpdate(
        { id: approval.requestId },
        { status: newRequestStatus, completedAt: newRequestStatus === 'approved' ? new Date().toISOString() : undefined },
        { session }
      );
    }

    await session.commitTransaction();
    res.json(approval);
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));