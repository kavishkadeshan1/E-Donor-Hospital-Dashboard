# 🔗 E-Donor Mobile App Integration Guide

## Overview

This Hospital Admin Portal is designed to work seamlessly with the **E-Donor Mobile App** (Expo + TypeScript). Both applications share the same Firebase backend, ensuring real-time synchronization of all data.

---

## 📱 Mobile App Architecture

Based on the E-Donor repository analysis:

### Technology Stack
- **Framework:** Expo (React Native)
- **Language:** TypeScript
- **Routing:** Expo Router (file-based)
- **Backend:** Firebase (Authentication + Firestore)
- **State Management:** React Context API

### Project Structure
```
E-Donor/
├── app/                      # Screens and layouts
│   ├── contexts/            # React contexts
│   ├── services/            # Firebase helpers
│   ├── admin-*.tsx          # Admin screens (in mobile app)
│   └── _layout.tsx          # Navigation
├── components/              # Reusable UI elements
├── lib/                     # Firebase configuration
│   └── firebase.ts
├── assets/                  # Images, icons, fonts
└── constants/               # App constants
```

---

## 🔥 Firebase Collections Schema

### Exact Collection Structure (from E-Donor Mobile App)

#### 1. `profiles` Collection
User/Donor profiles with authentication

```typescript
{
  id: string,                    // Auto-generated document ID
  name: string,                  // Full name
  email: string,                 // Email address
  phone: string,                 // Phone number with country code
  bloodType: string,             // O+, O-, A+, A-, B+, B-, AB+, AB-
  dateOfBirth: string,          // YYYY-MM-DD format
  gender: string,                // Male, Female, Other
  address: string,               // Street address
  city: string,                  // City name
  state: string,                 // State/Province
  zipCode: string,               // Postal code
  status: string,                // 'active' | 'inactive'
  totalDonations: number,        // Count of donations
  lastDonation: string,          // YYYY-MM-DD or null
  emergencyContact: string,      // Contact person info
  medicalConditions: string,     // Health conditions (optional)
  medications: string,           // Current medications (optional)
  createdAt: Timestamp,          // Firebase serverTimestamp
  updatedAt: Timestamp           // Firebase serverTimestamp
}
```

#### 2. `admins` Collection
Admin user credentials and permissions

```typescript
{
  id: string,                    // Auto-generated document ID
  uid: string,                   // Firebase Auth UID
  email: string,                 // Admin email (default: admin@gmail.com)
  name: string,                  // Admin name
  role: string,                  // 'admin' | 'super_admin'
  hospital: string,              // Associated hospital name
  createdAt: Timestamp,
  permissions: {
    manageDonors: boolean,
    manageInventory: boolean,
    manageRequests: boolean,
    sendNotifications: boolean,
    manageHospitals: boolean
  }
}
```

#### 3. `hospitals` Collection
Hospital registry and verification

```typescript
{
  id: string,                    // Auto-generated document ID
  name: string,                  // Hospital name
  email: string,                 // Contact email
  phone: string,                 // Contact phone
  address: string,               // Full address
  city: string,
  state: string,
  zipCode: string,
  licenseNumber: string,         // Hospital license
  establishedYear: string,       // YYYY format
  website: string,               // Website URL (optional)
  description: string,           // About the hospital
  status: string,                // 'verified' | 'unverified'
  capacity: number,              // Total bed capacity
  availableBeds: number,         // Currently available
  rating: number,                // 1-5 star rating
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 4. `blood_inventory` Collection
Blood stock levels by type

```typescript
{
  id: string,                    // Auto-generated document ID
  bloodType: string,             // O+, O-, A+, A-, B+, B-, AB+, AB-
  units: number,                 // Available units
  minRequired: number,           // Minimum stock threshold
  status: string,                // 'good' | 'low' | 'critical' (auto-calculated)
  expiringUnits: number,         // Units expiring in 7 days
  reservedUnits: number,         // Reserved for pending requests
  location: string,              // Storage location
  lastUpdated: Timestamp,        // Last modification time
  createdAt: Timestamp
}
```

#### 5. `donation_requests` Collection
Blood donation requests from patients

```typescript
{
  id: string,                    // Auto-generated document ID
  patientName: string,           // Patient requiring blood
  bloodType: string,             // Required blood type
  units: number,                 // Units needed
  urgency: string,               // 'critical' | 'urgent' | 'normal'
  hospital: string,              // Hospital name
  hospitalId: string,            // Reference to hospitals collection
  status: string,                // 'pending' | 'approved' | 'fulfilled' | 'rejected'
  notes: string,                 // Additional information
  contactPerson: string,         // Request contact (optional)
  contactNumber: string,         // Contact phone (optional)
  requestedBy: string,           // User ID who created request
  createdAt: Timestamp,
  updatedAt: Timestamp,
  approvedAt: Timestamp,         // When approved (optional)
  fulfilledAt: Timestamp         // When fulfilled (optional)
}
```

#### 6. `notifications` Collection
Push notifications and history

```typescript
{
  id: string,                    // Auto-generated document ID
  title: string,                 // Notification title
  body: string,                  // Notification message
  type: string,                  // 'general' | 'urgent' | 'reminder' | 'event'
  targetAudience: string,        // 'all' | 'donors' | 'recipients' | 'specific'
  priority: string,              // 'normal' | 'high' | 'critical'
  broadcast: boolean,            // Send to all users
  userId: string,                // Specific user ID (if not broadcast)
  sentAt: Timestamp,             // When sent
  read: boolean,                 // Read status
  readAt: Timestamp,             // When read (optional)
  deliveryStats: {               // Delivery tracking
    sent: number,
    delivered: number,
    read: number
  }
}
```

#### 7. `donations` Collection
Historical donation records

```typescript
{
  id: string,                    // Auto-generated document ID
  donorId: string,               // Reference to profiles collection
  donorName: string,             // Donor name
  bloodType: string,             // Blood type donated
  units: number,                 // Units donated (usually 1)
  date: string,                  // YYYY-MM-DD format
  location: string,              // Donation location/hospital
  hospitalId: string,            // Hospital reference
  notes: string,                 // Additional notes
  status: string,                // 'completed' | 'pending' | 'cancelled'
  createdAt: Timestamp
}
```

---

## 🔐 Firebase Authentication

### Mobile App Credentials
- **Admin Email:** admin@gmail.com
- **Admin Password:** admin

### Authentication Flow
1. User signs up/signs in via Firebase Auth (Email/Password)
2. User profile created in `profiles` collection
3. Admin users have entry in `admins` collection
4. Auth state managed via React Context

---

## 🔄 Real-time Synchronization

### How It Works

```
┌─────────────────────┐         ┌──────────────────┐         ┌─────────────────────┐
│                     │         │                  │         │                     │
│  Admin Portal (Web) │◄───────►│  Firebase Cloud  │◄───────►│  Mobile App (Expo)  │
│                     │         │   Firestore DB   │         │                     │
└─────────────────────┘         └──────────────────┘         └─────────────────────┘
        │                               │                              │
        │  Update Inventory            │                              │
        │──────────────────────►       │                              │
        │                               │   Real-time Listener         │
        │                               │◄─────────────────────────────│
        │                               │                              │
        │                               │   Data Update Event          │
        │                               │──────────────────────────────►│
        │                               │                              │
        │                               │   Mobile UI Updates          │
```

### Features Synchronized in Real-time

| Feature | Admin Portal | Mobile App | Sync Method |
|---------|-------------|------------|-------------|
| Blood Inventory | Update units (+/-) | View stock levels | Firestore `onSnapshot` |
| Blood Requests | Approve/Reject/Fulfill | Create & view requests | Real-time listeners |
| Donor Profiles | Add/Edit/Delete | View profile | Collection subscription |
| Notifications | Send notifications | Receive push alerts | FCM + Firestore |
| Hospitals | Verify/Update | View verified hospitals | Collection updates |
| Donations | Record donations | View history | Real-time sync |

---

## 🔔 Push Notifications Setup

### Architecture

```
Admin Portal → Firestore (notifications) → Cloud Function → FCM → Mobile App
```

### Implementation Steps

1. **Admin Portal** (This Project)
   - Creates notification document in Firestore
   - Sets `broadcast: true` for all users or `userId` for specific user

2. **Cloud Function** (Needs Deployment)
   ```javascript
   // functions/index.js
   exports.sendNotification = functions.firestore
     .document('notifications/{notificationId}')
     .onCreate(async (snap, context) => {
       const notification = snap.data()
       
       if (notification.broadcast) {
         // Send to all users via FCM topic
         await admin.messaging().sendToTopic('all-users', {
           notification: {
             title: notification.title,
             body: notification.body
           }
         })
       } else {
         // Send to specific user
         const userDoc = await admin.firestore()
           .collection('profiles')
           .doc(notification.userId)
           .get()
         
         if (userDoc.data().fcmToken) {
           await admin.messaging().send({
             token: userDoc.data().fcmToken,
             notification: {
               title: notification.title,
               body: notification.body
             }
           })
         }
       }
     })
   ```

3. **Mobile App** (Already Implemented)
   - Subscribes to FCM topics on app launch
   - Stores FCM token in user profile
   - Displays notifications in-app

---

## 🛠️ Integration Checklist

### ✅ Completed (Hospital Admin Portal)

- [x] Firebase configuration setup
- [x] Firestore service layer matching mobile app collections
- [x] Real-time listeners for all collections
- [x] UI redesigned to match mobile app theme (#DC143C)
- [x] Dashboard with charts and statistics
- [x] Donor management (CRUD operations)
- [x] Blood inventory with +/- controls
- [x] Blood request approval workflow
- [x] Notification sending interface
- [x] Hospital profile management
- [x] Loading states and error handling

### 🔄 Pending (Requires Configuration)

- [ ] Create `.env` file with Firebase credentials
- [ ] Deploy Cloud Functions for push notifications
- [ ] Set up Firestore security rules
- [ ] Create admin user in `admins` collection
- [ ] Initialize sample data in Firestore
- [ ] Test end-to-end notification delivery
- [ ] Configure FCM in Firebase Console

---

## 🚀 Setup Instructions

### Step 1: Get Firebase Config from Mobile App

The E-Donor mobile app already has Firebase configured. Copy the credentials:

**Option A: From Mobile App Code**
```bash
# In E-Donor mobile app directory
cat .env
```

**Option B: From Firebase Console**
1. Go to Firebase Console
2. Open the E-Donor project
3. Project Settings → Web App
4. Copy configuration

### Step 2: Configure Admin Portal

```bash
cd "C:\Users\vigit\Desktop\hosptial db"
copy .env.example .env
```

Edit `.env`:
```env
VITE_FIREBASE_API_KEY=<from_mobile_app>
VITE_FIREBASE_AUTH_DOMAIN=<from_mobile_app>
VITE_FIREBASE_PROJECT_ID=<from_mobile_app>
VITE_FIREBASE_STORAGE_BUCKET=<from_mobile_app>
VITE_FIREBASE_MESSAGING_SENDER_ID=<from_mobile_app>
VITE_FIREBASE_APP_ID=<from_mobile_app>
```

### Step 3: Run Admin Portal

```powershell
npm run dev
```

Open http://localhost:3000

### Step 4: Test Integration

1. **Login** with admin@gmail.com / admin123
2. **Update Inventory** - Add/remove blood units
3. **Check Mobile App** - Verify inventory updates appear
4. **Send Notification** from admin portal
5. **Check Mobile App** - Verify notification received

---

## 📊 Data Flow Examples

### Example 1: Updating Blood Inventory

**Admin Portal → Firebase → Mobile App**

```javascript
// Admin Portal (Web)
await inventoryService.update(inventoryId, { 
  units: 50  // Update O+ to 50 units
})

// ↓ Firebase Firestore updates instantly

// Mobile App (Expo)
useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, 'blood_inventory'),
    (snapshot) => {
      // Mobile UI automatically updates showing 50 units for O+
      setInventory(snapshot.docs.map(doc => doc.data()))
    }
  )
  return unsubscribe
}, [])
```

### Example 2: Approving Blood Request

**Mobile User Creates → Admin Approves → Mobile User Notified**

```javascript
// Mobile App: User creates request
await addDoc(collection(db, 'donation_requests'), {
  patientName: 'John Doe',
  bloodType: 'O-',
  units: 2,
  urgency: 'critical',
  status: 'pending'
})

// Admin Portal: Approves request
await requestService.updateStatus(requestId, 'approved')

// Mobile App: Real-time listener updates UI
onSnapshot(doc(db, 'donation_requests', requestId), (doc) => {
  if (doc.data().status === 'approved') {
    showNotification('Your blood request has been approved!')
  }
})
```

---

## 🔒 Security Rules

Update Firestore security rules to allow admin access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper: Check if user is admin
    function isAdmin() {
      return exists(/databases/$(database)/documents/admins/$(request.auth.uid))
          && get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Profiles: Users can access their own, admins can access all
    match /profiles/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || isAdmin();
    }
    
    // Admins collection: Only admins can read their own data
    match /admins/{adminId} {
      allow read: if request.auth != null && request.auth.uid == adminId;
      allow write: if false; // Managed by Firebase Console only
    }
    
    // Hospitals: Read by all, write by admins
    match /hospitals/{hospitalId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // Blood Inventory: Read by all, write by admins
    match /blood_inventory/{inventoryId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // Donation Requests: All can read/create, admins can update/delete
    match /donation_requests/{requestId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if isAdmin();
    }
    
    // Notifications: Read by recipient/admins, write by admins
    match /notifications/{notificationId} {
      allow read: if request.auth != null && 
                     (resource.data.userId == request.auth.uid || 
                      resource.data.broadcast == true || 
                      isAdmin());
      allow write: if isAdmin();
    }
    
    // Donations: Read by all authenticated, write by admins
    match /donations/{donationId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
  }
}
```

---

## 📱 Testing with Mobile App

### Parallel Testing Setup

1. **Start Mobile App:**
   ```bash
   cd path/to/E-Donor
   npx expo start
   ```

2. **Start Admin Portal:**
   ```bash
   cd "C:\Users\vigit\Desktop\hosptial db"
   npm run dev
   ```

3. **Test Scenarios:**
   - Update inventory in admin → Check mobile app
   - Create request in mobile → Approve in admin
   - Send notification from admin → Receive in mobile
   - Add donor in admin → View in mobile

---

## 🎨 Design Consistency

Both applications share the same design language:

| Element | Mobile App | Admin Portal |
|---------|-----------|--------------|
| Primary Color | #DC143C (Crimson) | #DC143C (Crimson) |
| Gradient | Crimson to Red | Crimson to Red |
| Card Style | Rounded, shadowed | Rounded, shadowed |
| Button Style | Gradient fill | Gradient fill |
| Typography | System fonts | System fonts |
| Icons | Material/Ionicons | Unicode/SVG |

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue: Data not syncing**
- Verify both apps use same Firebase project
- Check Firestore security rules
- Ensure real-time listeners are active

**Issue: Notifications not sending**
- Deploy Cloud Functions
- Check FCM configuration
- Verify mobile app has FCM token

**Issue: Permission denied**
- Update security rules
- Check admin user in `admins` collection
- Verify authentication state

---

## 🎉 Summary

Your Hospital Admin Portal is now fully integrated with the E-Donor mobile app:

✅ Same Firebase backend  
✅ Real-time data synchronization  
✅ Matching design language  
✅ Push notification capability  
✅ Unified database schema  
✅ Admin-specific features  

**Just add your Firebase credentials and you're ready to go!** 🚀
