require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',  
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  'https://educlera-frontend.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !process.env.NODE_ENV) {
      // Allow if origin is in the list OR if we are in development mode
      return callback(null, true);
    } else {
      // Block otherwise
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
  },
  credentials: true, // Important for cookies/sessions if you use them
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials', 'X-Access-Token', 'X-Refresh-Token']
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

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB Reconnected');
});

connectDB();

// --- SMART CONFIGURATION (The Fix for Data Mismatch) ---
const toJSONConfig = {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    // Only replace id with _id if the document DOES NOT have its own custom 'id' field
    if (!ret.id) {
      ret.id = ret._id.toString();
    }
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
  createdAt: { type: Date, default: Date.now }
});
UserSchema.set('toJSON', toJSONConfig);

const StudentSchema = new mongoose.Schema({
  id: String, // Custom ID (s1...)
  userId: { type: String, required: true },
  name: String,
  collegeId: String,
  enrollmentNumber: String,
  department: String,
  year: Number,
  email: String,
  phone: String
});
StudentSchema.set('toJSON', toJSONConfig);

const RequestSchema = new mongoose.Schema({
  id: String, // Custom ID (req_...)
  studentId: String,
  type: String, 
  status: String,
  submittedAt: String,
  completedAt: String,
  pdfUrl: String
});
RequestSchema.set('toJSON', toJSONConfig);

const ApprovalSchema = new mongoose.Schema({
  id: String, // Custom ID (approval_...)
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

const User = mongoose.model('User', UserSchema);
const Student = mongoose.model('Student', StudentSchema);
const Request = mongoose.model('Request', RequestSchema);
const Approval = mongoose.model('Approval', ApprovalSchema);

// --- ROUTES ---

// 1. Auth & Profiles
app.post('/api/users', async (req, res) => {
  try {
    const { supabaseId, ...userData } = req.body;
    const user = await User.findOneAndUpdate(
      { supabaseId },
      { ...userData, supabaseId },
      { upsert: true, new: true }
    );
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/users/:supabaseId', async (req, res) => {
  try {
    const user = await User.findOne({ supabaseId: req.params.supabaseId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    let studentData = null;
    if (user.role === 'student') {
      studentData = await Student.findOne({ userId: user.supabaseId });
    }
    res.json({ user, student: studentData });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Admin User Management (New)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    // Find by either custom id or MongoDB _id
    const query = mongoose.isValidObjectId(req.params.id) 
      ? { _id: req.params.id } 
      : { id: req.params.id };

    const user = await User.findOneAndUpdate(query, req.body, { new: true });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const query = mongoose.isValidObjectId(req.params.id) 
      ? { _id: req.params.id } 
      : { id: req.params.id };

    const user = await User.findOneAndDelete(query);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Clean up student profile if exists
    if (user.role === 'student') {
      await Student.findOneAndDelete({ userId: user.supabaseId });
    }
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. Students
app.post('/api/students', async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.json(student);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. Requests
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
    console.error("Transaction Error:", err);
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

// 5. Approvals & Workflow
app.get('/api/approvals', async (req, res) => {
  try {
    const { role, name, requestId } = req.query;
    let query = {};
    
    if (requestId) {
      query.requestId = requestId;
    } else if (role || name) {
      query = {
        $or: [
          { department: role },
          { assignedTo: name } 
        ]
      };
    }
    
    const approvals = await Approval.find(query);
    res.json(approvals);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/approvals/:requestId', async (req, res) => {
  try {
    const approvals = await Approval.find({ requestId: req.params.requestId });
    res.json(approvals);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/approvals/:id', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { status, remarks, approvedBy } = req.body;
    
    // Updates Approval
    const approval = await Approval.findOneAndUpdate(
      { id: req.params.id }, 
      { 
        status, 
        remarks, 
        approvedBy, 
        approvedAt: new Date().toISOString() 
      },
      { new: true, session }
    );

    if (!approval) throw new Error("Approval not found");

    // Check parent Request status
    const allApprovals = await Approval.find({ requestId: approval.requestId }).session(session);
    
    const anyRejected = allApprovals.some(a => a.status === 'rejected');
    const allApproved = allApprovals.every(a => a.status === 'approved');

    let newRequestStatus = 'pending';
    if (anyRejected) newRequestStatus = 'rejected';
    else if (allApproved) newRequestStatus = 'approved';

    if (newRequestStatus !== 'pending') {
      await Request.findOneAndUpdate(
        { id: approval.requestId },
        { 
          status: newRequestStatus,
          completedAt: newRequestStatus === 'approved' ? new Date().toISOString() : undefined 
        },
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