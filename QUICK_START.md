# Quick Start Guide - E-Donor Hospital Admin Portal

## 🚀 Getting Started

Your E-Donor Hospital Admin Portal is now running at: **http://localhost:3000**

## 🔑 Demo Login Credentials

Use these credentials to access the admin portal:

- **Email:** admin@hospital.com
- **Password:** admin123

## 📱 Main Features

### 1. Dashboard (`/dashboard`)
- View real-time statistics
- Monitor total donors: 1,247
- Active donors: 856
- Pending requests: 23
- Blood units available: 342
- Recent donations list
- Urgent blood requests

### 2. Donors Management (`/donors`)
- **View All Donors:** Browse complete donor database
- **Search & Filter:** Find donors by name, email, phone, blood type, status
- **Add New Donor:** Click "+ Add New Donor" button
- **View Details:** Click "View" on any donor to see:
  - Personal information
  - Contact details
  - Donation history
  - Medical information
- **Edit/Delete:** Manage donor records
- **Activate/Deactivate:** Toggle donor status

### 3. Blood Requests (`/blood-requests`)
- **View All Requests:** Monitor all blood requests
- **Filter by Status:** Pending, Approved, Fulfilled, Rejected
- **Filter by Blood Type:** O+, O-, A+, A-, B+, B-, AB+, AB-
- **Priority Levels:** Critical, Urgent, Normal
- **Actions:**
  - Click "View" to see request details
  - Approve pending requests
  - Reject unsuitable requests
  - Mark approved requests as fulfilled

### 4. Blood Inventory (`/inventory`)
- Real-time blood stock levels
- 8 blood types tracked
- Visual status indicators:
  - 🟢 **Good:** Adequate stock
  - 🟡 **Low:** Below optimal level
  - 🔴 **Critical:** Urgent replenishment needed
- Progress bars showing stock vs minimum requirement

### 5. Hospital Profile (`/profile`)
- View hospital information
- Click "Edit Profile" to update:
  - Hospital name
  - Contact details
  - Address
  - License number
  - Establishment year
  - Website
  - Description

### 6. Settings (`/settings`)
- **Notification Settings:**
  - Email notifications
  - SMS notifications
  - Urgent alerts
  - Weekly reports
  - Donor reminders
- **System Settings:**
  - Auto-approve requests
  - Maintenance mode
- **Security:**
  - Change password

## 🎨 User Interface Features

### Navigation
- **Sidebar Menu:** Easy access to all sections
- **Toggle Button:** Collapse/expand sidebar
- **Active Indicator:** Highlights current page
- **Responsive Design:** Works on desktop, tablet, and mobile

### Data Tables
- **Search:** Real-time search functionality
- **Filters:** Multiple filter options
- **Sorting:** Click column headers to sort
- **Pagination:** Navigate through large datasets

### Forms
- **Validation:** Real-time input validation
- **Error Messages:** Clear error feedback
- **Required Fields:** Marked with asterisk (*)
- **Auto-save:** Some forms auto-save to localStorage

## 📊 Sample Data Overview

### Donors
- 8 sample donors with complete profiles
- Various blood types represented
- Active and inactive status examples
- Donation history for each donor

### Blood Requests
- 7 sample requests at different stages
- Mix of urgency levels
- Multiple hospitals represented
- Different blood types needed

### Inventory
- All 8 blood types tracked
- Realistic stock levels
- Different status levels demonstrated
- Minimum requirements set

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔄 Data Persistence

Currently using **localStorage** for demo purposes:
- Login session stored
- Hospital admin data saved
- Profile updates persisted

**Note:** This is demo data. For production, integrate with backend API using the provided service layer in `src/services/api.js`.

## 📱 Responsive Breakpoints

- **Desktop:** > 1024px (Full layout)
- **Tablet:** 768px - 1024px (Adapted layout)
- **Mobile:** < 768px (Compact layout)

## 🎯 Key Workflows

### Adding a New Donor
1. Navigate to Donors page
2. Click "+ Add New Donor"
3. Fill in required fields (marked with *)
4. Click "Add Donor"
5. View new donor in list

### Processing Blood Request
1. Go to Blood Requests page
2. Filter by "Pending" status
3. Click "View" on a request
4. Review details
5. Click "Approve" or "Reject"
6. For approved requests, later mark as "Fulfilled"

### Checking Inventory
1. Navigate to Inventory page
2. Review blood type availability
3. Identify critical or low stock levels
4. Take action based on stock status

### Updating Hospital Profile
1. Go to Hospital Profile page
2. Click "Edit Profile"
3. Update necessary information
4. Click "Save Changes"

## 🔐 Security Features

- Token-based authentication
- Protected routes (require login)
- Session management
- Logout functionality
- Password change capability

## 🎨 Color Scheme

- **Primary (Red):** #dc2626 - Blood donation theme
- **Success (Green):** #16a34a - Positive actions
- **Warning (Yellow):** #f59e0b - Caution states
- **Danger (Red):** #dc2626 - Critical alerts
- **Dark Background:** #1f2937 - Sidebar
- **Light Background:** #f9fafb - Main content

## 🚀 Next Steps

1. **Test All Features:** Explore each section thoroughly
2. **Customize Data:** Modify mock data to match your needs
3. **API Integration:** Connect to your backend using provided API services
4. **Styling:** Adjust colors and styling in CSS files
5. **Add Features:** Build on the existing foundation

## 📞 Support

For questions or issues:
1. Check the README.md for detailed documentation
2. Review component code in `src/pages/` directory
3. Examine API service layer in `src/services/api.js`

## 🎉 Enjoy Your E-Donor Admin Portal!

The application is fully functional with demo data. You can now manage donors, process blood requests, monitor inventory, and configure settings for your hospital's blood donation program.
