import { useState, useEffect } from 'react'
import './HospitalProfile.css'
import { hospitalService } from '../services/firebaseService'

function HospitalProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hospitalId, setHospitalId] = useState(null)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    about: ''
  })

  useEffect(() => {
    loadHospitalProfile()
  }, [])

  const loadHospitalProfile = async () => {
    try {
      setLoading(true)
      // Get hospital data from localStorage (set during login)
      const savedData = localStorage.getItem('hospitalAdminData')
      
      if (savedData) {
        const parsed = JSON.parse(savedData)
        const email = parsed.email || 'admin@hospital.com'
        
        // Fetch from Firebase using email
        const hospital = await hospitalService.getByEmail(email)
        
        if (hospital) {
          setHospitalId(hospital.id)
          setProfileData({
            name: hospital.name || '',
            email: hospital.email || '',
            phone: hospital.phone || '',
            street: hospital.street || '',
            city: hospital.city || '',
            state: hospital.state || '',
            zipCode: hospital.zipCode || '',
            about: hospital.about || ''
          })
        } else {
          // Fallback to localStorage data if not found in Firebase
          setProfileData({
            name: parsed.name || 'City General Hospital',
            email: parsed.email || 'admin@hospital.com',
            phone: parsed.phone || '555-0100',
            street: parsed.street || '123 Medical Center Drive',
            city: parsed.city || 'New York',
            state: parsed.state || 'NY',
            zipCode: parsed.zipCode || '10001',
            about: parsed.about || 'Leading healthcare provider with state-of-the-art facilities and expert medical professionals.'
          })
        }
      }
    } catch (error) {
      console.error('Error loading hospital profile:', error)
      alert('Error loading profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      
      const dataToSave = {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        street: profileData.street,
        city: profileData.city,
        state: profileData.state,
        zipCode: profileData.zipCode,
        about: profileData.about
      }

      // Use upsert to create or update hospital profile
      const result = await hospitalService.upsert(profileData.email, dataToSave)
      
      // Update hospitalId if it was created new
      if (result.id && !hospitalId) {
        setHospitalId(result.id)
      }

      // Also update localStorage for consistency
      const currentData = JSON.parse(localStorage.getItem('hospitalAdminData') || '{}')
      localStorage.setItem('hospitalAdminData', JSON.stringify({
        ...currentData,
        ...profileData
      }))

      alert('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile: ' + (error.message || 'Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="hospital-profile">
        <div className="page-header">
          <h1>Hospital Profile</h1>
        </div>
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="hospital-profile">
      <div className="page-header">
        <div>
          <h1>Hospital Profile</h1>
          <p>Manage your hospital information and details</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn btn-primary">
            Edit Profile
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="card">
          <h3>Basic Information</h3>
          <div className="form-grid">
          <div className="form-group full-width">
            <label htmlFor="name" className="form-label">Hospital Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
                value={profileData.name}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={profileData.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-input"
                value={profileData.phone}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Address Information</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="street" className="form-label">Street Address</label>
              <input
                type="text"
                id="street"
                name="street"
                className="form-input"
                value={profileData.street}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="city" className="form-label">City</label>
              <input
                type="text"
                id="city"
                name="city"
                className="form-input"
                value={profileData.city}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="state" className="form-label">State</label>
              <input
                type="text"
                id="state"
                name="state"
                className="form-input"
                value={profileData.state}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="zipCode" className="form-label">Zip Code</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                className="form-input"
                value={profileData.zipCode}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Description</h3>
          <div className="form-group">
            <label htmlFor="about" className="form-label">About Hospital</label>
            <textarea
              id="about"
              name="about"
              className="form-textarea"
              value={profileData.about}
              onChange={handleChange}
              disabled={!isEditing}
              rows="4"
            />
          </div>
        </div>

        {isEditing && (
          <div className="form-actions">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn btn-secondary"
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

export default HospitalProfile
