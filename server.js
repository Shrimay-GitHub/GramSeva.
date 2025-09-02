const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo'
});

// In-memory storage for demo (fallback if MongoDB not available)
let issues = [];
let useInMemory = false;

// MongoDB connection with fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/seva-db';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  connectTimeoutMS: 10000, // Give up initial connection after 10s
})
.then(() => {
  console.log('Connected to MongoDB');
  useInMemory = false;
})
.catch(err => {
  console.log('MongoDB not available, using in-memory storage for demo');
  console.log('Error:', err.message);
  useInMemory = true;
});

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', (err) => {
  console.log('MongoDB connection error, switching to in-memory storage');
  useInMemory = true;
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected, using in-memory storage');
  useInMemory = true;
});

// Issue Schema
const issueSchema = new mongoose.Schema({
  issueId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  village: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  photoUrl: String,
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Resolved'], 
    default: 'Pending' 
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

let Issue;
try {
  Issue = mongoose.model('Issue', issueSchema);
} catch (e) {
  // Model already exists or mongoose not connected
  Issue = null;
}

// Set useInMemory to true initially until MongoDB connection is confirmed
useInMemory = true;

// Generate unique issue ID
function generateIssueId() {
  return 'SEVA' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100).toString().padStart(2, '0');
}

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Routes

// Get all issues (for admin dashboard)
app.get('/api/issues', async (req, res) => {
  try {
    const { status, category, village } = req.query;
    
    if (useInMemory) {
      let filteredIssues = issues;
      
      if (status) filteredIssues = filteredIssues.filter(issue => issue.status === status);
      if (category) filteredIssues = filteredIssues.filter(issue => issue.category === category);
      if (village) filteredIssues = filteredIssues.filter(issue => issue.village.toLowerCase().includes(village.toLowerCase()));
      
      res.json(filteredIssues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } else {
      let filter = {};
      if (status) filter.status = status;
      if (category) filter.category = category;
      if (village) filter.village = village;
      
      const issuesData = await Issue.find(filter).sort({ createdAt: -1 });
      res.json(issuesData);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single issue by ID
app.get('/api/issues/:issueId', async (req, res) => {
  try {
    if (useInMemory) {
      const issue = issues.find(issue => issue.issueId === req.params.issueId);
      if (!issue) {
        return res.status(404).json({ error: 'Issue not found' });
      }
      res.json(issue);
    } else {
      const issue = await Issue.findOne({ issueId: req.params.issueId });
      if (!issue) {
        return res.status(404).json({ error: 'Issue not found' });
      }
      res.json(issue);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new issue (with file upload)
app.post('/api/issues', upload.single('photo'), async (req, res) => {
  try {
    const { name, village, category, description, location } = req.body;
    
    let photoUrl = null;
    if (req.file) {
      // Upload to cloudinary (simplified for demo - in production use proper cloudinary upload)
      photoUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }
    
    const issueId = generateIssueId();
    
    const issueData = {
      issueId,
      name,
      village,
      category,
      description,
      location: location ? JSON.parse(location) : null,
      photoUrl,
      status: 'Pending',
      priority: 'Medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (useInMemory) {
      issues.push(issueData);
    } else {
      const newIssue = new Issue(issueData);
      await newIssue.save();
    }
    
    // Emit real-time update to admin dashboard
    io.emit('newIssue', issueData);
    
    res.status(201).json({ 
      success: true, 
      issueId: issueId,
      message: 'Issue reported successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new issue (JSON only - for testing)
app.post('/api/issues/json', async (req, res) => {
  try {
    const { name, village, category, description, location } = req.body;
    
    const issueId = generateIssueId();
    
    const issueData = {
      issueId,
      name,
      village,
      category,
      description,
      location: location || null,
      photoUrl: null,
      status: 'Pending',
      priority: 'Medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (useInMemory) {
      issues.push(issueData);
    } else {
      const newIssue = new Issue(issueData);
      await newIssue.save();
    }
    
    // Emit real-time update to admin dashboard
    io.emit('newIssue', issueData);
    
    res.status(201).json({ 
      success: true, 
      issueId: issueId,
      message: 'Issue reported successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update issue status
app.put('/api/issues/:issueId/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (useInMemory) {
      const issueIndex = issues.findIndex(issue => issue.issueId === req.params.issueId);
      if (issueIndex === -1) {
        return res.status(404).json({ error: 'Issue not found' });
      }
      
      issues[issueIndex].status = status;
      issues[issueIndex].updatedAt = new Date().toISOString();
      
      // Emit real-time update
      io.emit('statusUpdate', { issueId: issues[issueIndex].issueId, status });
      
      res.json(issues[issueIndex]);
    } else {
      const issue = await Issue.findOneAndUpdate(
        { issueId: req.params.issueId },
        { status, updatedAt: new Date() },
        { new: true }
      );
      
      if (!issue) {
        return res.status(404).json({ error: 'Issue not found' });
      }
      
      // Emit real-time update
      io.emit('statusUpdate', { issueId: issue.issueId, status });
      
      res.json(issue);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get statistics for dashboard
app.get('/api/stats', async (req, res) => {
  try {
    if (useInMemory) {
      const totalIssues = issues.length;
      const pendingIssues = issues.filter(issue => issue.status === 'Pending').length;
      const inProgressIssues = issues.filter(issue => issue.status === 'In Progress').length;
      const resolvedIssues = issues.filter(issue => issue.status === 'Resolved').length;
      
      const categoryStats = {};
      issues.forEach(issue => {
        categoryStats[issue.category] = (categoryStats[issue.category] || 0) + 1;
      });
      
      const categories = Object.entries(categoryStats).map(([category, count]) => ({
        _id: category,
        count
      }));
      
      res.json({
        total: totalIssues,
        pending: pendingIssues,
        inProgress: inProgressIssues,
        resolved: resolvedIssues,
        categories
      });
    } else {
      const totalIssues = await Issue.countDocuments();
      const pendingIssues = await Issue.countDocuments({ status: 'Pending' });
      const inProgressIssues = await Issue.countDocuments({ status: 'In Progress' });
      const resolvedIssues = await Issue.countDocuments({ status: 'Resolved' });
      
      const categoryStats = await Issue.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);
      
      res.json({
        total: totalIssues,
        pending: pendingIssues,
        inProgress: inProgressIssues,
        resolved: resolvedIssues,
        categories: categoryStats
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Admin connected to real-time updates');
  
  socket.on('disconnect', () => {
    console.log('Admin disconnected');
  });
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/track', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'track.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Seva server running on port ${PORT}`);
  console.log(`Villager interface: http://localhost:${PORT}`);
  console.log(`Admin dashboard: http://localhost:${PORT}/admin`);
  console.log(`Issue tracking: http://localhost:${PORT}/track`);
});
