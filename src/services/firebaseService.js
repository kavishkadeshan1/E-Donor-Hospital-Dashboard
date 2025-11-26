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
  USER_NOTIFICATIONS: 'userNotifications', // Individual user notifications
  DONATIONS: 'donations',         // Donation history
  BLOOD_REQUESTS_FEED: 'blood_requests_feed', // New: feed for app users
  BLOOD_REQUEST_DETAILS: 'blood_request_details', // Detailed payload for app users
  USERS: 'users' // Firebase auth-linked user records (hospitals & donors)
}

// Mock data for when Firebase is not configured
const mockData = {
  hospitals: [
    {
      id: 'mock-hospital-1',
      name: 'City General Hospital',
      email: 'admin@hospital.com',
      phone: '555-0100',
      city: 'New York',
      state: 'NY',
      street: '123 Medical Center Drive',
      zipCode: '10001',
      verified: true,
      about: 'Mock hospital profile'
    }
  ],
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
    { 
      id: '1', 
      patientName: 'Robert Miller', 
      bloodType: 'O-', 
      units: 2, 
      urgency: 'critical', 
      hospital: 'City General', 
      date: '2025-11-24', 
      status: 'pending', 
      notes: 'Emergency surgery following accident.', 
      patientAge: 34,
      medicalCondition: 'Emergency Surgery',
      patientStatus: 'Urgent - Active',
      priorityLevel: 'critical',
      hospitalDepartment: 'Emergency Department',
      hospitalLocationText: '123 Medical Center Drive, New York, NY 10001',
      hospitalDistance: '2.1 km',
      contactPerson: 'Dr. Emily Carter',
      contactPhone: '+1 555-0100'
    },
    { 
      id: '2', 
      patientName: 'Linda Martinez', 
      bloodType: 'AB-', 
      units: 1, 
      urgency: 'urgent', 
      hospital: 'St. Mary\'s Hospital', 
      date: '2025-11-24', 
      status: 'pending', 
      notes: 'Requires AB- unit for scheduled surgery.', 
      patientAge: 41,
      medicalCondition: 'Scheduled Surgery',
      patientStatus: 'Awaiting Donor Match',
      priorityLevel: 'high',
      hospitalDepartment: 'Surgery Ward',
      hospitalLocationText: '27 Grand Ave, Boston, MA 02108',
      hospitalDistance: '5.4 km',
      contactPerson: 'Nurse Adam Wells',
      contactPhone: '+1 555-0115'
    },
    { 
      id: '3', 
      patientName: 'David Anderson', 
      bloodType: 'B-', 
      units: 3, 
      urgency: 'urgent', 
      hospital: 'Memorial Hospital', 
      date: '2025-11-23', 
      status: 'pending', 
      notes: 'Multiple units required post-surgery.', 
      patientAge: 52,
      medicalCondition: 'Post-Surgery Care',
      patientStatus: 'Stabilized - Pending Transfusion',
      priorityLevel: 'high',
      hospitalDepartment: 'ICU',
      hospitalLocationText: '89 River Rd, Chicago, IL 60601',
      hospitalDistance: '1.2 km',
      contactPerson: 'Dr. Helen Brooks',
      contactPhone: '+1 555-0181'
    }
  ],
  donations: [
    { id: '1', donorName: 'John Smith', bloodType: 'O+', date: '2025-11-23', units: 1 },
    { id: '2', donorName: 'Sarah Johnson', bloodType: 'A+', date: '2025-11-23', units: 1 },
    { id: '3', donorName: 'Michael Brown', bloodType: 'B+', date: '2025-11-22', units: 1 }
  ]
}

const parseFirestoreDate = (value) => {
  if (!value) return null
  if (value instanceof Timestamp) return value.toDate()
  if (typeof value.toDate === 'function') return value.toDate()
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatDonorRecord = (docSnapshotOrData, source = 'profile') => {
  const payload = typeof docSnapshotOrData.data === 'function'
    ? docSnapshotOrData.data()
    : docSnapshotOrData
  const id = docSnapshotOrData.id || payload?.id || payload?.uid || `unknown-${Date.now()}`
  const createdAtDate = parseFirestoreDate(payload?.createdAt)
  const phone = payload?.phone || payload?.contactNumber || payload?.mobile || payload?.telephone || ''
  const bloodType = payload?.bloodType || payload?.preferredBloodType || 'N/A'
  const status = (payload?.status ||
    (typeof payload?.isActive === 'boolean'
      ? (payload.isActive ? 'active' : 'inactive')
      : 'active')
  ).toLowerCase()

  let totalDonations = null
  if (typeof payload?.totalDonations === 'number') {
    totalDonations = payload.totalDonations
  } else if (typeof payload?.donationsCount === 'number') {
    totalDonations = payload.donationsCount
  }

  return {
    id,
    source,
    name: payload?.name || payload?.fullName || payload?.hospitalName || payload?.displayName || 'Unnamed User',
    email: payload?.email || payload?.contactEmail || '',
    phone: phone || 'Not provided',
    bloodType,
    status,
    lastDonation: payload?.lastDonation || payload?.recentDonationDate || 'N/A',
    totalDonations,
    role: payload?.role || (source === 'profile' ? 'donor' : 'user'),
    hospitalName: payload?.hospitalName || payload?.hospital || '',
    createdAt: createdAtDate,
    createdAtTs: createdAtDate ? createdAtDate.getTime() : 0
  }
}

// Helper to keep app feed in sync with admin dashboard requests
const updateBloodRequestFeed = async (requestId, updates) => {
  if (!isConfigured) return

  const feedQuery = query(
    collection(db, COLLECTIONS.BLOOD_REQUESTS_FEED),
    where('requestId', '==', requestId)
  )
  const snapshot = await getDocs(feedQuery)

  if (snapshot.empty) return

  const payload = { ...updates, updatedAt: serverTimestamp() }
  await Promise.all(snapshot.docs.map(docSnap => updateDoc(docSnap.ref, payload)))
}

const updateBloodRequestDetails = async (requestId, updates) => {
  if (!isConfigured) return

  const detailQuery = query(
    collection(db, COLLECTIONS.BLOOD_REQUEST_DETAILS),
    where('requestId', '==', requestId)
  )
  const snapshot = await getDocs(detailQuery)

  if (snapshot.empty) return

  const payload = { ...updates, updatedAt: serverTimestamp() }
  await Promise.all(snapshot.docs.map(docSnap => updateDoc(docSnap.ref, payload)))
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

// --- Hospital Services ---
export const hospitalService = {
  // Fetch hospital profile by email (verified only)
  getByEmail: async (email) => {
    if (!isConfigured) {
      return mockData.hospitals.find(h => h.email.toLowerCase() === email.toLowerCase()) || null
    }

    // First try to find verified hospital
    const q = query(
      collection(db, COLLECTIONS.HOSPITALS),
      where('email', '==', email)
    )
    const snapshot = await getDocs(q)
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
  },

  // Get hospital by ID
  getById: async (id) => {
    if (!isConfigured) {
      return mockData.hospitals.find(h => h.id === id) || null
    }

    const docRef = doc(db, COLLECTIONS.HOSPITALS, id)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
  },

  // Create hospital profile
  create: async (data) => {
    if (!isConfigured) {
      console.warn('Mock mode: Hospital profile not actually created. Add Firebase credentials.')
      const newHospital = { id: 'mock-hospital-' + Date.now(), ...data }
      mockData.hospitals.push(newHospital)
      return newHospital
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.HOSPITALS), {
      ...data,
      verified: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return { id: docRef.id, ...data }
  },

  // Update hospital profile
  update: async (id, data) => {
    if (!isConfigured) {
      console.warn('Mock mode: Hospital profile not actually updated. Add Firebase credentials.')
      // Update mock data for demo purposes
      const hospital = mockData.hospitals.find(h => h.id === id)
      if (hospital) {
        Object.assign(hospital, data)
      }
      return { success: true }
    }

    const docRef = doc(db, COLLECTIONS.HOSPITALS, id)
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
    return { success: true }
  },

  // Create or update hospital profile (upsert)
  upsert: async (email, data) => {
    if (!isConfigured) {
      console.warn('Mock mode: Hospital profile not actually saved. Add Firebase credentials.')
      let hospital = mockData.hospitals.find(h => h.email.toLowerCase() === email.toLowerCase())
      if (hospital) {
        Object.assign(hospital, data)
      } else {
        hospital = { id: 'mock-hospital-' + Date.now(), email, ...data }
        mockData.hospitals.push(hospital)
      }
      return { success: true, id: hospital.id }
    }

    // Check if hospital exists
    const existing = await hospitalService.getByEmail(email)
    if (existing) {
      await hospitalService.update(existing.id, data)
      return { success: true, id: existing.id }
    } else {
      const created = await hospitalService.create({ email, ...data })
      return { success: true, id: created.id }
    }
  }
}

// --- Donor Services ---
export const donorService = {
  // Get all donors
  getAll: async () => {
    if (!isConfigured) return mockData.donors
    
    const profileQuery = query(collection(db, COLLECTIONS.PROFILES), orderBy('createdAt', 'desc'))
    const userQuery = query(collection(db, COLLECTIONS.USERS), orderBy('createdAt', 'desc'))
    const [profileSnap, userSnap] = await Promise.all([
      getDocs(profileQuery),
      getDocs(userQuery)
    ])
    
    const combined = [
      ...profileSnap.docs.map(doc => formatDonorRecord(doc, 'profile')),
      ...userSnap.docs.map(doc => formatDonorRecord(doc, 'user'))
    ]
    
    return combined.sort((a, b) => (b.createdAtTs || 0) - (a.createdAtTs || 0))
  },

  // Real-time listener for donors
  subscribe: (callback, onError = () => {}) => {
    if (!isConfigured) {
      callback(mockData.donors)
      return () => {} // Return empty unsubscribe function
    }
    
    let profileRecords = []
    let userRecords = []

    const emitCombined = () => {
      const merged = [...profileRecords, ...userRecords]
        .sort((a, b) => (b.createdAtTs || 0) - (a.createdAtTs || 0))
      callback(merged)
    }

    const profileQuery = query(collection(db, COLLECTIONS.PROFILES), orderBy('createdAt', 'desc'))
    const userQuery = query(collection(db, COLLECTIONS.USERS), orderBy('createdAt', 'desc'))

    const unsubProfiles = onSnapshot(profileQuery, (snapshot) => {
      profileRecords = snapshot.docs.map(doc => formatDonorRecord(doc, 'profile'))
      emitCombined()
    }, (error) => {
      console.error('Error subscribing to profiles collection:', error)
      onError(error)
    })

    const unsubUsers = onSnapshot(userQuery, (snapshot) => {
      userRecords = snapshot.docs.map(doc => formatDonorRecord(doc, 'user'))
      emitCombined()
    }, (error) => {
      console.error('Error subscribing to users collection:', error)
      onError(error)
    })

    return () => {
      if (typeof unsubProfiles === 'function') unsubProfiles()
      if (typeof unsubUsers === 'function') unsubUsers()
    }
  },

  // Get single donor
  getById: async (id) => {
    if (!isConfigured) return mockData.donors.find(d => d.id === id) || null
    
    const profileRef = doc(db, COLLECTIONS.PROFILES, id)
    const profileSnap = await getDoc(profileRef)
    if (profileSnap.exists()) {
      return formatDonorRecord(profileSnap, 'profile')
    }

    const userRef = doc(db, COLLECTIONS.USERS, id)
    const userSnap = await getDoc(userRef)
    return userSnap.exists() ? formatDonorRecord(userSnap, 'user') : null
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

  // Create request and push to app feed
  create: async (requestData) => {
    if (!isConfigured) {
      console.warn('Mock mode: Request not actually created. Add Firebase credentials.')
      const mockId = 'mock-' + Date.now()
      mockData.requests.unshift({
        id: mockId,
        ...requestData,
        status: 'pending',
        date: new Date().toISOString().split('T')[0]
      })
      return { id: mockId }
    }

    const payload = {
      ...requestData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    // Save to main requests collection
    const docRef = await addDoc(collection(db, COLLECTIONS.DONATION_REQUESTS), payload)

    // Also push to blood_requests_feed for app users
    await addDoc(collection(db, COLLECTIONS.BLOOD_REQUESTS_FEED), {
      ...payload,
      requestId: docRef.id
    })

    // Detailed record for mobile blood request detail screen (best-effort)
    try {
      await addDoc(collection(db, COLLECTIONS.BLOOD_REQUEST_DETAILS), {
        requestId: docRef.id,
        patientName: payload.patientName,
        patientAge: payload.patientAge || null,
        medicalCondition: requestData.medicalCondition || '',
        patientStatus: requestData.patientStatus || '',
        medicalNotes: requestData.notes || '',
        bloodType: payload.bloodType,
        unitsNeeded: payload.units,
        priorityLevel: requestData.priorityLevel || payload.urgency || 'normal',
        urgency: payload.urgency,
        hospital: payload.hospital,
        hospitalDepartment: requestData.hospitalDepartment || '',
        hospitalLocationText: requestData.hospitalLocationText || '',
        hospitalDistance: requestData.hospitalDistance || '',
        hospitalLocation: payload.hospitalLocation || null,
        contactPerson: requestData.contactPerson || '',
        contactPhone: requestData.contactPhone || payload.hospitalPhone || '',
        contactEmail: payload.hospitalEmail || '',
        status: payload.status,
        date: payload.date,
        source: payload.source,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Failed to create blood_request_details entry', error)
    }
    return docRef
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
    
    await updateDoc(docRef, updates)
    await updateBloodRequestFeed(id, updates)
    try {
      await updateBloodRequestDetails(id, updates)
    } catch (error) {
      console.error('Failed to sync blood_request_details update', error)
    }

    return { success: true }
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
  },

  // Delete blood request
  delete: async (id) => {
    if (!isConfigured) {
      console.warn('Mock mode: Request not actually deleted. Add Firebase credentials.')
      const index = mockData.requests.findIndex(r => r.id === id)
      if (index !== -1) mockData.requests.splice(index, 1)
      return { success: true }
    }

    // Delete from main requests collection
    await deleteDoc(doc(db, COLLECTIONS.DONATION_REQUESTS, id))

    // Also delete from blood_requests_feed (find by requestId)
    try {
      const feedQuery = query(
        collection(db, COLLECTIONS.BLOOD_REQUESTS_FEED),
        where('requestId', '==', id)
      )
      const feedSnapshot = await getDocs(feedQuery)
      feedSnapshot.docs.forEach(async (feedDoc) => {
        await deleteDoc(doc(db, COLLECTIONS.BLOOD_REQUESTS_FEED, feedDoc.id))
      })
    } catch (error) {
      console.error('Failed to delete from blood_requests_feed', error)
    }

    // Also delete from blood_request_details (find by requestId)
    try {
      const detailsQuery = query(
        collection(db, COLLECTIONS.BLOOD_REQUEST_DETAILS),
        where('requestId', '==', id)
      )
      const detailsSnapshot = await getDocs(detailsQuery)
      detailsSnapshot.docs.forEach(async (detailDoc) => {
        await deleteDoc(doc(db, COLLECTIONS.BLOOD_REQUEST_DETAILS, detailDoc.id))
      })
    } catch (error) {
      console.error('Failed to delete from blood_request_details', error)
    }

    return { success: true }
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
    
    try {
      return await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
        ...notificationData,
        sentAt: serverTimestamp(),
        read: false
      })
    } catch (error) {
      console.error('Error sending notification:', error)
      throw error
    }
  },

  // Send to specific user with proper E-Donor app structure
  sendToUser: async (userId, title, body, type = 'general', metadata = {}) => {
    if (!isConfigured) {
      console.warn('Mock mode: User notification not actually sent. Add Firebase credentials.')
      return { id: 'mock-' + Date.now(), success: true }
    }

    try {
      const adminData = JSON.parse(localStorage.getItem('hospitalAdminData') || '{}')
      const senderEmail = adminData.email || 'admin@hospital.com'

      // Create the notification document
      const notificationRef = await addDoc(collection(db, COLLECTIONS.USER_NOTIFICATIONS), {
        message: body,
        title,
        type,
        userId,
        read: false,
        receivedAt: serverTimestamp(),
        sentBy: senderEmail,
        metadata: {
          ...metadata,
          notificationId: '' // Will be updated
        }
      })

      // Update the document to include the notificationId in metadata
      await updateDoc(notificationRef, {
        'metadata.notificationId': notificationRef.id
      })

      return { id: notificationRef.id, success: true }
    } catch (error) {
      console.error('Error sending notification to user:', error)
      throw error
    }
  },

  // Send to multiple users (for targeted notifications)
  sendToUsers: async (userIds, title, body, type = 'general', metadata = {}) => {
    if (!isConfigured) {
      console.warn('Mock mode: Notifications not actually sent. Add Firebase credentials.')
      return { success: true, count: userIds.length }
    }

    try {
      const adminData = JSON.parse(localStorage.getItem('hospitalAdminData') || '{}')
      const senderEmail = adminData.email || 'admin@hospital.com'

      let successCount = 0
      for (const userId of userIds) {
        try {
          const notificationRef = await addDoc(collection(db, COLLECTIONS.USER_NOTIFICATIONS), {
            message: body,
            title,
            type,
            userId,
            read: false,
            receivedAt: serverTimestamp(),
            sentBy: senderEmail,
            metadata: {
              ...metadata,
              notificationId: ''
            }
          })

          await updateDoc(notificationRef, {
            'metadata.notificationId': notificationRef.id
          })
          successCount++
        } catch (err) {
          console.error(`Failed to send notification to user ${userId}:`, err)
        }
      }

      return { success: true, count: successCount }
    } catch (error) {
      console.error('Error sending notifications to users:', error)
      throw error
    }
  },

  // Broadcast to all users - fetches all user IDs and sends individual notifications
  broadcast: async (title, body, type = 'general', metadata = {}) => {
    if (!isConfigured) {
      console.warn('Mock mode: Broadcast not actually sent. Add Firebase credentials.')
      return { success: true, count: mockData.donors.length }
    }

    try {
      const adminData = JSON.parse(localStorage.getItem('hospitalAdminData') || '{}')
      const senderEmail = adminData.email || 'admin@hospital.com'

      // Get all user profiles - try profiles first, then users collection
      let userIds = []
      
      // Try profiles collection first
      try {
        const profilesSnap = await getDocs(collection(db, COLLECTIONS.PROFILES))
        userIds = profilesSnap.docs.map(doc => doc.id)
        console.log(`Found ${userIds.length} users in profiles collection`)
      } catch (err) {
        console.error('Error fetching profiles:', err)
      }

      // If no profiles found, try users collection
      if (userIds.length === 0) {
        try {
          const usersSnap = await getDocs(collection(db, COLLECTIONS.USERS))
          userIds = usersSnap.docs.map(doc => doc.id)
          console.log(`Found ${userIds.length} users in users collection`)
        } catch (err) {
          console.error('Error fetching users:', err)
        }
      }

      // If still no users, get user IDs from existing userNotifications
      if (userIds.length === 0) {
        try {
          const notificationsSnap = await getDocs(collection(db, COLLECTIONS.USER_NOTIFICATIONS))
          const uniqueUserIds = new Set()
          notificationsSnap.docs.forEach(doc => {
            const data = doc.data()
            if (data.userId) {
              uniqueUserIds.add(data.userId)
            }
          })
          userIds = Array.from(uniqueUserIds)
          console.log(`Found ${userIds.length} unique users from userNotifications`)
        } catch (err) {
          console.error('Error fetching from userNotifications:', err)
        }
      }

      if (userIds.length === 0) {
        console.warn('No users found to broadcast to')
        return { success: true, count: 0 }
      }

      // Send to each user
      let successCount = 0
      for (const userId of userIds) {
        try {
          const notificationRef = await addDoc(collection(db, COLLECTIONS.USER_NOTIFICATIONS), {
            message: body,
            title,
            type,
            userId,
            read: false,
            receivedAt: serverTimestamp(),
            sentBy: senderEmail,
            metadata: {
              ...metadata,
              notificationId: ''
            }
          })

          await updateDoc(notificationRef, {
            'metadata.notificationId': notificationRef.id
          })
          successCount++
        } catch (err) {
          console.error(`Failed to send notification to user ${userId}:`, err)
        }
      }

      return { success: true, count: successCount }
    } catch (error) {
      console.error('Error broadcasting notifications:', error)
      throw error
    }
  },

  // Broadcast by blood type - sends to users with specific blood types
  broadcastByBloodType: async (bloodTypes, title, body, type = 'general', metadata = {}) => {
    if (!isConfigured) {
      console.warn('Mock mode: Broadcast not actually sent. Add Firebase credentials.')
      return { success: true, count: 0 }
    }

    try {
      const adminData = JSON.parse(localStorage.getItem('hospitalAdminData') || '{}')
      const senderEmail = adminData.email || 'admin@hospital.com'

      // Get users with matching blood types
      let profilesSnap
      try {
        profilesSnap = await getDocs(collection(db, COLLECTIONS.PROFILES))
      } catch (err) {
        console.error('Error fetching profiles:', err)
        return { success: true, count: 0, error: 'Could not fetch user profiles' }
      }

      const matchingUsers = profilesSnap.docs.filter(doc => {
        const data = doc.data()
        return bloodTypes.includes(data.bloodType)
      })

      if (matchingUsers.length === 0) {
        console.warn('No users found with matching blood types')
        return { success: true, count: 0 }
      }

      // Send to each matching user
      let successCount = 0
      for (const userDoc of matchingUsers) {
        try {
          const notificationRef = await addDoc(collection(db, COLLECTIONS.USER_NOTIFICATIONS), {
            message: body,
            title,
            type,
            userId: userDoc.id,
            read: false,
            receivedAt: serverTimestamp(),
            sentBy: senderEmail,
            metadata: {
              ...metadata,
              targetBloodType: userDoc.data().bloodType,
              notificationId: ''
            }
          })

          await updateDoc(notificationRef, {
            'metadata.notificationId': notificationRef.id
          })
          successCount++
        } catch (err) {
          console.error(`Failed to send notification to user ${userDoc.id}:`, err)
        }
      }

      return { success: true, count: successCount }
    } catch (error) {
      console.error('Error broadcasting by blood type:', error)
      throw error
    }
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
  },

  // Get all users for targeting - tries multiple collections
  getAllUsers: async () => {
    if (!isConfigured) {
      return mockData.donors.map(d => ({
        id: d.id,
        name: d.name,
        email: d.email,
        bloodType: d.bloodType
      }))
    }

    let users = []

    // Try profiles collection first
    try {
      const profilesSnap = await getDocs(collection(db, COLLECTIONS.PROFILES))
      users = profilesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      console.log(`getAllUsers: Found ${users.length} users in profiles`)
    } catch (err) {
      console.error('Error fetching profiles:', err)
    }

    // If no profiles, try users collection
    if (users.length === 0) {
      try {
        const usersSnap = await getDocs(collection(db, COLLECTIONS.USERS))
        users = usersSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        console.log(`getAllUsers: Found ${users.length} users in users collection`)
      } catch (err) {
        console.error('Error fetching users:', err)
      }
    }

    // If still empty, extract unique users from userNotifications
    if (users.length === 0) {
      try {
        const notificationsSnap = await getDocs(collection(db, COLLECTIONS.USER_NOTIFICATIONS))
        const userMap = new Map()
        notificationsSnap.docs.forEach(doc => {
          const data = doc.data()
          if (data.userId && !userMap.has(data.userId)) {
            userMap.set(data.userId, {
              id: data.userId,
              name: data.userId, // Use ID as name if no profile
              email: '',
              bloodType: ''
            })
          }
        })
        users = Array.from(userMap.values())
        console.log(`getAllUsers: Found ${users.length} unique users from notifications`)
      } catch (err) {
        console.error('Error extracting users from notifications:', err)
      }
    }

    return users
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
