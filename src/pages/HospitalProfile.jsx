import { useState, useEffect } from 'react'
import { hospitalService } from '../services/firebaseService'
import { Icons } from '../components/Icons'
import './HospitalProfile.css'

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

      // Update localStorage
      const currentAdminData = JSON.parse(localStorage.getItem('hospitalAdminData') || '{}')
      localStorage.setItem('hospitalAdminData', JSON.stringify({
        ...currentAdminData,
        ...dataToSave
      }))

      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="hospital-profile">
      {/* Header Card */}
      <div className="profile-header-card">
        <div className="header-content">
          <div className="hospital-avatar">
            {Icons.hospital}
          </div>
          <div className="hospital-info">
            <h1>{profileData.name || 'Hospital Name'}</h1>
            <p>{Icons.check} Verified Healthcare Provider</p>
          </div>
        </div>
        <div className="header-actions">
          {!isEditing ? (
            <button className="btn-primary" onClick={() => setIsEditing(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Edit Profile
            </button>
          ) : (
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setIsEditing(false)} disabled={saving}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-main-content">
          {/* Organization Details */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                {Icons.hospital}
              </div>
              <h3>Organization Details</h3>
            </div>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Hospital Name</label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>About</label>
                <textarea
                  name="about"
                  value={profileData.about}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Describe your hospital services and facilities..."
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                {Icons.users}
              </div>
              <h3>Contact Information</h3>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleChange}
                  disabled={true} // Email usually shouldn't be changed
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                {Icons.package}
              </div>
              <h3>Location Details</h3>
            </div>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Street Address</label>
                <input
                  type="text"
                  name="street"
                  value={profileData.street}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={profileData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={profileData.state}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-group">
                <label>Zip Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={profileData.zipCode}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Status */}
        <div className="form-sidebar">
          <div className="status-card">
            <div className="verification-badge verified">
              {Icons.check} Verified Account
            </div>
            <p className="status-info">
              Your hospital profile is verified and active. You can manage blood requests and donor interactions.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}

export default HospitalProfile
