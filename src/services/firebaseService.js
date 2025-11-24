import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore'
import { db, isConfigured } from '../lib/firebase'

// Collection Names (exactly matching E-Donor mobile app)
const COLLECTIONS = {
  PROFILES: 'profiles',           // User/Donor profiles
  ADMINS: 'admins',              // Admin users
  HOSPITALS: 'hospitals',        // Hospital registry
  BLOOD_INVENTORY: 'blood_inventory',  // Blood stock levels
  DONATION_REQUESTS: 'donation_requests',  // Blood requests
  NOTIFICATIONS: 'notifications',  // Push notifications
  DONATIONS: 'donations'         // Donation history
}

// Mock data for when Firebase is not configured
const mockData = {
  donors: [
    { id: '1', name: 'John Smith', email: 'john@example.com', phone: '+1234567890', bloodType: 'O+', status: 'active', totalDonations: 5, lastDonation: '2025-11-15' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1234567891', bloodType: 'A+', status: 'active', totalDonations: 3, lastDonation: '2025-11-20' },
    { id: '3', name: 'Michael Brown', email: 'michael@example.com', phone: '+1234567892', bloodType: 'B+', status: 'active', totalDonations: 8, lastDonation: '2025-10-10' },
    { id: '4', name: 'Emily Davis', email: 'emily@example.com', phone: '+1234567893', bloodType: 'AB+', status: 'inactive', totalDonations: 2, lastDonation: '2025-08-05' }
  ],
  inventory: [
    { id: '1', bloodType: 'O+', units: 45, minRequired: 30, lastUpdated: new Date() },
    { id: '2', bloodType: 'O-', units: 12, minRequired: 20, lastUpdated: new Date() },
    { id: '3', bloodType: 'A+', units: 38, minRequired: 25, lastUpdated: new Date() },
    { id: '4', bloodType: 'A-', units: 8, minRequired: 15, lastUpdated: new Date() },
    { id: '5', bloodType: 'B+', units: 28, minRequired: 20, lastUpdated: new Date() },
    { id: '6', bloodType: 'B-', units: 6, minRequired: 12, lastUpdated: new Date() },
    { id: '7', bloodType: 'AB+', units: 15, minRequired: 10, lastUpdated: new Date() },
    { id: '8', bloodType: 'AB-', units: 4, minRequired: 8, lastUpdated: new Date() }
  ],
  requests: [
    { id: '1', patientName: 'Robert Miller', bloodType: 'O-', units: 2, urgency: 'critical', hospital: 'City General', date: '2025-11-24', status: 'pending', notes: 'Emergency surgery' },
    { id: '2', patientName: 'Linda Martinez', bloodType: 'AB-', units: 1, urgency: 'urgent', hospital: 'St. Mary\'s Hospital', date: '2025-11-24', status: 'pending', notes: 'Accident victim' },
    { id: '3', patientName: 'David Anderson', bloodType: 'B-', units: 3, urgency: 'urgent', hospital: 'Memorial Hospital', date: '2025-11-23', status: 'pending', notes: 'Post-surgery care' }
  ],
  donations: [
    { id: '1', donorName: 'John Smith', bloodType: 'O+', date: '2025-11-23', units: 1 },
    { id: '2', donorName: 'Sarah Johnson', bloodType: 'A+', date: '2025-11-23', units: 1 },
    { id: '3', donorName: 'Michael Brown', bloodType: 'B+', date: '2025-11-22', units: 1 }
  ]
}

// --- Admin Services ---
export const adminService = {
  // Verify admin credentials
  verifyAdmin: async (email) => {
    if (!isConfigured) return { id: 'mock-admin', email, role: 'admin' }
    
    const q = query(collection(db, COLLECTIONS.ADMINS), where('email', '==', email))
    const snapshot = await getDocs(q)
    return !snapshot.empty ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } : null
  },

  // Get admin by ID
  getById: async (id) => {
    if (!isConfigured) return { id: 'mock-admin', email: 'admin@hospital.com', role: 'admin' }
    
    const docRef = doc(db, COLLECTIONS.ADMINS, id)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
  }
}

// --- Donor Services ---
export const donorService = {
  // Get all donors
  getAll: async () => {
    if (!isConfigured) return mockData.donors
    
    const q = query(collection(db, COLLECTIONS.PROFILES), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  // Real-time listener for donors
  subscribe: (callback) => {
    if (!isConfigured) {
      callback(mockData.donors)
      return () => {} // Return empty unsubscribe function
    }
    
    const q = query(collection(db, COLLECTIONS.PROFILES), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snapshot) => {
      const donors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      callback(donors)
    })
  },

  // Get single donor
  getById: async (id) => {
    if (!isConfigured) return mockData.donors.find(d => d.id === id) || null
    
    const docRef = doc(db, COLLECTIONS.PROFILES, id)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
  },

  // Create donor
  create: async (donorData) => {
    if (!isConfigured) {
      console.warn('Mock mode: Donor not actually created. Add Firebase credentials.')
      return { id: 'mock-' + Date.now() }
    }
    
    return await addDoc(collection(db, COLLECTIONS.PROFILES), {
      ...donorData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  },

  // Update donor
  update: async (id, data) => {
    if (!isConfigured) {
      console.warn('Mock mode: Donor not actually updated. Add Firebase credentials.')
      return
    }
    
    const docRef = doc(db, COLLECTIONS.PROFILES, id)
    return await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
  },

  // Delete donor
  delete: async (id) => {
    if (!isConfigured) {
      console.warn('Mock mode: Donor not actually deleted. Add Firebase credentials.')
      return
    }
    
    return await deleteDoc(doc(db, COLLECTIONS.PROFILES, id))
  }
}

// --- Inventory Services ---
export const inventoryService = {
  // Get all inventory
  getAll: async () => {
    if (!isConfigured) return mockData.inventory
    
    const snapshot = await getDocs(collection(db, COLLECTIONS.BLOOD_INVENTORY))
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  // Real-time listener for inventory
  subscribe: (callback) => {
    if (!isConfigured) {
      callback(mockData.inventory)
      return () => {}
    }
    
    return onSnapshot(collection(db, COLLECTIONS.BLOOD_INVENTORY), (snapshot) => {
      const inventory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      callback(inventory)
    })
  },

  // Update inventory units
  update: async (id, data) => {
    if (!isConfigured) {
      console.warn('Mock mode: Inventory not actually updated. Add Firebase credentials.')
      const item = mockData.inventory.find(i => i.id === id)
      if (item) Object.assign(item, data)
      return
    }
    
    const docRef = doc(db, COLLECTIONS.BLOOD_INVENTORY, id)
    return await updateDoc(docRef, {
      ...data,
      lastUpdated: serverTimestamp()
    })
  },

  // Get by blood type
  getByBloodType: async (bloodType) => {
    if (!isConfigured) return mockData.inventory.find(i => i.bloodType === bloodType) || null
    
    const q = query(collection(db, COLLECTIONS.BLOOD_INVENTORY), where('bloodType', '==', bloodType))
    const snapshot = await getDocs(q)
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
  }
}

// --- Blood Request Services ---
export const requestService = {
  // Get all requests
  getAll: async () => {
    if (!isConfigured) return mockData.requests
    
    const q = query(collection(db, COLLECTIONS.DONATION_REQUESTS), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  // Real-time listener for requests
  subscribe: (callback) => {
    if (!isConfigured) {
      callback(mockData.requests)
      return () => {}
    }
    
    const q = query(collection(db, COLLECTIONS.DONATION_REQUESTS), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      callback(requests)
    })
  },

  // Create request
  create: async (requestData) => {
    if (!isConfigured) {
      console.warn('Mock mode: Request not actually created. Add Firebase credentials.')
      return { id: 'mock-' + Date.now() }
    }
    
    return await addDoc(collection(db, COLLECTIONS.DONATION_REQUESTS), {
      ...requestData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  },

  // Update request status
  updateStatus: async (id, status) => {
    if (!isConfigured) {
      console.warn('Mock mode: Request not actually updated. Add Firebase credentials.')
      const request = mockData.requests.find(r => r.id === id)
      if (request) request.status = status
      return
    }
    
    const docRef = doc(db, COLLECTIONS.DONATION_REQUESTS, id)
    const updates = {
      status,
      updatedAt: serverTimestamp()
    }
    
    if (status === 'approved') updates.approvedAt = serverTimestamp()
    if (status === 'fulfilled') updates.fulfilledAt = serverTimestamp()
    
    return await updateDoc(docRef, updates)
  },

  // Get urgent requests
  getUrgent: async () => {
    if (!isConfigured) return mockData.requests.filter(r => r.urgency === 'critical' || r.urgency === 'urgent')
    
    const q = query(
      collection(db, COLLECTIONS.DONATION_REQUESTS), 
      where('urgency', 'in', ['critical', 'urgent']),
      where('status', '==', 'pending')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }
}

// --- Notification Services ---
export const notificationService = {
  // Send notification (creates doc that Cloud Function picks up)
  send: async (notificationData) => {
    if (!isConfigured) {
      console.warn('Mock mode: Notification not actually sent. Add Firebase credentials.')
      return { id: 'mock-' + Date.now(), success: true }
    }
    
    return await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
      ...notificationData,
      sentAt: serverTimestamp(),
      read: false
    })
  },

  // Broadcast to all users
  broadcast: async (title, body, type = 'general') => {
    if (!isConfigured) {
      console.warn('Mock mode: Broadcast not actually sent. Add Firebase credentials.')
      return { success: true, count: mockData.donors.length }
    }
    
    return await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
      title,
      body,
      type,
      targetAudience: 'all',
      broadcast: true,
      sentAt: serverTimestamp(),
      read: false
    })
  },

  // Get recent notifications
  getRecent: async (limitCount = 10) => {
    if (!isConfigured) return []
    
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS), 
      orderBy('sentAt', 'desc'), 
      limit(limitCount)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }
}

// --- Dashboard Services ---
export const dashboardService = {
  // Get dashboard stats
  getStats: async () => {
    if (!isConfigured) {
      return {
        totalDonors: mockData.donors.length,
        activeDonors: mockData.donors.filter(d => d.status === 'active').length,
        pendingRequests: mockData.requests.filter(r => r.status === 'pending').length,
        bloodUnitsAvailable: mockData.inventory.reduce((sum, item) => sum + item.units, 0)
      }
    }
    
    // In a real app with lots of data, use aggregation queries or cloud functions
    // For now, we'll fetch and count client-side or use simple counters
    
    const donorsSnap = await getDocs(collection(db, COLLECTIONS.PROFILES))
    const requestsSnap = await getDocs(query(collection(db, COLLECTIONS.DONATION_REQUESTS), where('status', '==', 'pending')))
    const inventorySnap = await getDocs(collection(db, COLLECTIONS.BLOOD_INVENTORY))
    
    const totalDonors = donorsSnap.size
    const activeDonors = donorsSnap.docs.filter(d => d.data().status === 'active').length
    const pendingRequests = requestsSnap.size
    const bloodUnitsAvailable = inventorySnap.docs.reduce((sum, doc) => sum + (doc.data().units || 0), 0)
    
    return {
      totalDonors,
      activeDonors,
      pendingRequests,
      bloodUnitsAvailable
    }
  },

  // Get recent donations
  getRecentDonations: async (limitCount = 5) => {
    if (!isConfigured) return mockData.donations.slice(0, limitCount)
    
    const q = query(
      collection(db, COLLECTIONS.DONATIONS), 
      orderBy('date', 'desc'), 
      limit(limitCount)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },
  
  // Get weekly trends (mock data for now as it requires complex aggregation)
  getWeeklyTrends: async () => {
    if (!isConfigured) {
      return [
        { day: 'Mon', donations: 12 },
        { day: 'Tue', donations: 15 },
        { day: 'Wed', donations: 8 },
        { day: 'Thu', donations: 18 },
        { day: 'Fri', donations: 14 },
        { day: 'Sat', donations: 10 },
        { day: 'Sun', donations: 6 }
      ]
    }
    
    // This would typically come from a Cloud Function or aggregated collection
    return [
      { name: 'Mon', donations: 12, requests: 8 },
      { name: 'Tue', donations: 19, requests: 12 },
      { name: 'Wed', donations: 15, requests: 10 },
      { name: 'Thu', donations: 22, requests: 15 },
      { name: 'Fri', donations: 28, requests: 18 },
      { name: 'Sat', donations: 35, requests: 25 },
      { name: 'Sun', donations: 20, requests: 14 }
    ]
  }
}
