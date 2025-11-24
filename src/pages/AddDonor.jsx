import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './AddDonor.css'

function AddDonor() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bloodType: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalConditions: '',
    medications: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    if (!formData.bloodType) newErrors.bloodType = 'Blood type is required'
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
    if (!formData.gender) newErrors.gender = 'Gender is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    // Simulate API call - Replace with actual API
    setTimeout(() => {
      alert('Donor added successfully!')
      navigate('/donors')
    }, 1000)
  }

  return (
    <div className="add-donor">
      <div className="page-header">
        <div>
          <Link to="/donors" className="back-link">← Back to Donors</Link>
          <h1>Add New Donor</h1>
          <p>Register a new blood donor in the system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="donor-form">
        <div className="card">
          <h3>Personal Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">Phone *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && <span className="error">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="bloodType" className="form-label">Blood Type *</label>
              <select
                id="bloodType"
                name="bloodType"
                className="form-select"
                value={formData.bloodType}
                onChange={handleChange}
              >
                <option value="">Select Blood Type</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
              {errors.bloodType && <span className="error">{errors.bloodType}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="dateOfBirth" className="form-label">Date of Birth *</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                className="form-input"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
              {errors.dateOfBirth && <span className="error">{errors.dateOfBirth}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="gender" className="form-label">Gender *</label>
              <select
                id="gender"
                name="gender"
                className="form-select"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <span className="error">{errors.gender}</span>}
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Address Information</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="address" className="form-label">Street Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                className="form-input"
                value={formData.address}
                onChange={handleChange}
              />
              {errors.address && <span className="error">{errors.address}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="city" className="form-label">City</label>
              <input
                type="text"
                id="city"
                name="city"
                className="form-input"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="state" className="form-label">State</label>
              <input
                type="text"
                id="state"
                name="state"
                className="form-input"
                value={formData.state}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="zipCode" className="form-label">Zip Code</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                className="form-input"
                value={formData.zipCode}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Emergency Contact</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="emergencyContactName" className="form-label">Contact Name</label>
              <input
                type="text"
                id="emergencyContactName"
                name="emergencyContactName"
                className="form-input"
                value={formData.emergencyContactName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="emergencyContactPhone" className="form-label">Contact Phone</label>
              <input
                type="tel"
                id="emergencyContactPhone"
                name="emergencyContactPhone"
                className="form-input"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Medical Information</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="medicalConditions" className="form-label">Medical Conditions</label>
              <textarea
                id="medicalConditions"
                name="medicalConditions"
                className="form-textarea"
                value={formData.medicalConditions}
                onChange={handleChange}
                placeholder="List any medical conditions..."
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="medications" className="form-label">Current Medications</label>
              <textarea
                id="medications"
                name="medications"
                className="form-textarea"
                value={formData.medications}
                onChange={handleChange}
                placeholder="List current medications..."
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/donors')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding Donor...' : 'Add Donor'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddDonor
