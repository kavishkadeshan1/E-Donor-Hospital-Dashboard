# E-Donor Hospital Admin Portal

A comprehensive React.js web application for hospital administrators to manage blood donations, donors, and blood requests through the E-Donor system.

## Features

### 🔐 Authentication
- Secure login system for hospital administrators
- Session management with localStorage
- Demo credentials for testing

### 📊 Dashboard
- Real-time statistics overview
- Total donors, active donors, pending requests
- Blood units inventory display
- Recent donations tracking
- Urgent blood requests monitoring

### 👥 Donor Management
- View all registered donors
- Search and filter donors by name, email, phone, blood type, and status
- Add new donors with comprehensive information
- View detailed donor profiles
- Track donation history
- Activate/deactivate donors
- Edit donor information

### 🩸 Blood Request Management
- View all blood requests
- Filter by status (pending, approved, fulfilled, rejected)
- Filter by blood type
- Priority levels (critical, urgent, normal)
- Approve or reject requests
- Mark requests as fulfilled
- Detailed request information

### 📦 Inventory Management
- Real-time blood inventory tracking
- Visual status indicators (good, low, critical)
- Blood type availability
- Minimum stock requirements
- Progress bars for stock levels

### 🏥 Hospital Profile
- Manage hospital information
- Edit contact details
- Update address information
- License and establishment information

### ⚙️ Settings
- Notification preferences (email, SMS)
- Alert settings for urgent requests
- System configurations
- Password management
- Auto-approve settings

## Technology Stack

- **React 18.2** - UI framework
- **React Router 6** - Navigation and routing
- **Vite 5** - Build tool and development server
- **CSS3** - Styling with custom properties
- **Axios** - HTTP client (ready for API integration)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd "C:\Users\vigit\Desktop\hosptial db"
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

### Firebase Configuration (for live data)
1. Create a Firebase project and enable Firestore (and Cloud Messaging if you want push notifications).
2. Copy the config values from **Project Settings → General → Your Apps**.
3. Create a `.env` file in the project root (or update existing) using `.env.example` as a template:
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```
4. Restart `npm run dev` so Vite picks up the new environment variables.

### Demo Credentials

- **Email:** admin@hospital.com
- **Password:** admin123

## Project Structure

```
hosptial db/
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # Main layout with sidebar and header
│   │   └── Layout.css
│   ├── pages/
│   │   ├── Login.jsx           # Login page
│   │   ├── Dashboard.jsx       # Dashboard with statistics
│   │   ├── DonorList.jsx       # Donor listing with filters
│   │   ├── DonorDetails.jsx    # Individual donor details
│   │   ├── AddDonor.jsx        # Add new donor form
│   │   ├── BloodRequests.jsx   # Blood request management
│   │   ├── Inventory.jsx       # Blood inventory tracking
│   │   ├── HospitalProfile.jsx # Hospital profile management
│   │   └── Settings.jsx        # Application settings
│   ├── App.jsx                 # Main app component with routing
│   ├── main.jsx               # Application entry point
│   ├── index.css              # Global styles
│   └── App.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features Implementation

### Responsive Design
- Mobile-first approach
- Adaptive layouts for tablets and desktops
- Collapsible sidebar for mobile devices
- Responsive tables and forms

### User Experience
- Intuitive navigation
- Clear visual hierarchy
- Loading states for async operations
- Form validation
- Error handling
- Success/failure feedback

### Data Management
- Local storage for demo data persistence
- Ready for API integration
- Simulated async operations
- Search and filter functionality
- Sort capabilities

## Future Enhancements

- [ ] Backend API integration
- [ ] Real-time notifications with WebSocket
- [ ] Advanced reporting and analytics
- [ ] Export data to PDF/Excel
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Two-factor authentication
- [ ] Email/SMS integration
- [ ] Appointment scheduling
- [ ] Donor rewards system

## API Integration Guide

The application is structured to easily integrate with a backend API. Replace the mock data in each component with actual API calls using axios:

```javascript
import axios from 'axios'

// Example API call
const fetchDonors = async () => {
  try {
    const response = await axios.get('/api/donors')
    setDonors(response.data)
  } catch (error) {
    console.error('Error fetching donors:', error)
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is for educational and demonstration purposes.

## Support

For issues and questions, please create an issue in the repository.

## Acknowledgments

Built for E-Donor blood donation management system to help hospitals efficiently manage blood donors and requests.
