# 🏘️ Seva - Village Issue Reporting System

**सेवा** - A comprehensive web application that allows villagers to report issues (like broken streetlights, water supply problems, road damage) and enables authorities to track and respond to them through a real-time dashboard.

## 🚀 Features

### For Villagers
- **Easy Issue Reporting**: Simple form to report village problems
- **Photo Upload**: Attach images to provide visual evidence
- **Issue Tracking**: Track report status with unique Issue ID
- **Mobile Responsive**: Works seamlessly on phones and tablets
- **Multi-language Support**: Hindi and English interface

### For Authorities (Admin Dashboard)
- **Real-time Dashboard**: Live updates when new issues are reported
- **Status Management**: Update issue status (Pending → In Progress → Resolved)
- **Advanced Filtering**: Filter by status, category, village, date
- **Statistics Overview**: Visual stats showing pending, in-progress, and resolved issues
- **Detailed View**: Complete issue details with photos and location

### Technical Features
- **Real-time Updates**: Socket.IO for live notifications
- **Image Upload**: Cloudinary integration for photo storage
- **Responsive Design**: Mobile-first approach
- **RESTful API**: Clean API endpoints for all operations
- **MongoDB Database**: Scalable data storage

## 🛠 Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO
- **File Upload**: Multer + Cloudinary
- **Styling**: Custom CSS with modern design

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd seva-village-reporting
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```
   MONGODB_URI=mongodb://localhost:27017/seva-db
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   PORT=3000
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   - Villager Interface: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/admin
   - Issue Tracking: http://localhost:3000/track

## 🎯 Usage

### For Villagers

1. **Report an Issue**
   - Visit the homepage
   - Fill out the report form with issue details
   - Upload a photo (optional)
   - Submit and receive a unique Issue ID

2. **Track Your Issue**
   - Visit the tracking page
   - Enter your Issue ID
   - View current status and updates

### For Authorities

1. **Access Admin Dashboard**
   - Visit `/admin` endpoint
   - View all reported issues in real-time
   - Filter issues by status, category, or village

2. **Manage Issues**
   - Click "View" on any issue for detailed information
   - Update status: Pending → In Progress → Resolved
   - View photos and location details

## 📊 API Endpoints

### Issues
- `GET /api/issues` - Get all issues (with optional filters)
- `GET /api/issues/:issueId` - Get specific issue
- `POST /api/issues` - Create new issue
- `PUT /api/issues/:issueId/status` - Update issue status

### Statistics
- `GET /api/stats` - Get dashboard statistics

## 🎨 Data Model

```javascript
{
  issueId: "SEVA123456",           // Unique identifier
  name: "Amit Verma",              // Reporter name
  village: "Rampur",               // Village name
  category: "Streetlight",         // Issue category
  description: "Main road light not working",
  location: {
    lat: 25.324,                   // GPS coordinates (optional)
    lng: 83.005,
    address: "Near Main Market"    // Text address
  },
  photoUrl: "https://...",         // Uploaded image URL
  status: "Pending",               // Pending | In Progress | Resolved
  priority: "Medium",              // Low | Medium | High
  createdAt: "2025-08-27T10:23:00Z",
  updatedAt: "2025-08-27T10:23:00Z"
}
```

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment

1. **Environment Setup**
   - Set up MongoDB Atlas or local MongoDB
   - Configure Cloudinary account for image uploads
   - Set environment variables

2. **Build and Deploy**
   ```bash
   npm install --production
   npm start
   ```

### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🎬 Demo Workflow

1. **Villager Reports Issue**
   - Open homepage → Fill form → Upload photo → Submit
   - Receive Issue ID: SEVA123456

2. **Real-time Admin Notification**
   - Admin dashboard shows new issue immediately
   - Statistics update automatically

3. **Authority Response**
   - Admin views issue details
   - Updates status to "In Progress"
   - Later marks as "Resolved"

4. **Villager Tracks Progress**
   - Uses Issue ID to check status
   - Sees real-time updates

## 🔧 Configuration

### Categories
Default issue categories include:
- 🔦 Streetlight
- 💧 Water Supply  
- 🛣️ Road/Infrastructure
- ⚡ Electricity
- 🗑️ Waste Management
- 🏥 Healthcare
- 📚 Education
- 🔧 Other

### Status Flow
```
Pending → In Progress → Resolved
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built for improving village governance and citizen services
- Inspired by Digital India initiatives
- Designed for accessibility and ease of use

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

**Made with ❤️ for better village governance**
