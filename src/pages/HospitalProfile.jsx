import { useState, useEffect } from 'react'
import './HospitalProfile.css'

function HospitalProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    licenseNumber: '',
    establishedYear: '',
    website: '',
    description: ''
  })

  useEffect(() => {
    // Load from localStorage or API
    const savedData = localStorage.getItem('hospitalAdminData')
    if (savedData) {
      const parsed = JSON.parse(savedData)
      setProfileData({
        name: parsed.name || 'City General Hospital',
        email: parsed.email || 'admin@hospital.com',
        phone: '555-0100',
        address: '123 Medical Center Drive',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        licenseNumber: 'LIC-2023-001',
        establishedYear: '1985',
        website: 'www.citygeneralhospital.com',
        description: 'Leading healthcare provider with state-of-the-art facilities and expert medical professionals.'
      })
    }
  }, [])

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulate API call
    const currentData = JSON.parse(localStorage.getItem('hospitalAdminData') || '{}')
    localStorage.setItem('hospitalAdminData', JSON.stringify({
      ...currentData,
      name: profileData.name,
      email: profileData.email
    }))
    alert('Profile updated successfully!')
    setIsEditing(false)
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

            <div className="form-group">
              <label htmlFor="website" className="form-label">Website</label>
              <input
                type="text"
                id="website"
                name="website"
                className="form-input"
                value={profileData.website}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="licenseNumber" className="form-label">License Number</label>
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                className="form-input"
                value={profileData.licenseNumber}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="establishedYear" className="form-label">Established Year</label>
              <input
                type="text"
                id="establishedYear"
                name="establishedYear"
                className="form-input"
                value={profileData.establishedYear}
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
              <label htmlFor="address" className="form-label">Street Address</label>
              <input
                type="text"
                id="address"
                name="address"
                className="form-input"
                value={profileData.address}
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
            <label htmlFor="description" className="form-label">About Hospital</label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              value={profileData.description}
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
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

export default HospitalProfile
