import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import './DonorDetails.css'

function DonorDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [donor, setDonor] = useState(null)
  const [donationHistory, setDonationHistory] = useState([])
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    // Simulate API call - Replace with actual API
    const mockDonor = {
      id: parseInt(id),
      name: 'John Smith',
      email: 'john@example.com',
      phone: '555-0101',
      bloodType: 'O+',
      dateOfBirth: '1990-05-15',
      gender: 'Male',
      address: '123 Main St, City, State 12345',
      emergencyContact: 'Jane Smith - 555-0102',
      status: 'active',
      lastDonation: '2025-11-15',
      totalDonations: 5,
      registeredDate: '2023-01-10'
    }

    const mockHistory = [
      { id: 1, date: '2025-11-15', units: 1, location: 'City General Hospital', notes: 'Regular donation' },
      { id: 2, date: '2025-08-10', units: 1, location: 'City General Hospital', notes: 'Regular donation' },
      { id: 3, date: '2025-05-20', units: 1, location: 'Blood Drive Event', notes: 'Community blood drive' },
      { id: 4, date: '2025-02-15', units: 1, location: 'City General Hospital', notes: 'Regular donation' },
      { id: 5, date: '2024-11-05', units: 1, location: 'City General Hospital', notes: 'First time donor' }
    ]

    setDonor(mockDonor)
    setDonationHistory(mockHistory)
  }, [id])

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this donor?')) {
      // Simulate delete API call
      alert('Donor deleted successfully')
      navigate('/donors')
    }
  }

  const handleStatusToggle = () => {
    setDonor({
      ...donor,
      status: donor.status === 'active' ? 'inactive' : 'active'
    })
  }

  if (!donor) {
    return <div>Loading...</div>
  }

  return (
    <div className="donor-details">
      <div className="page-header">
        <div>
          <Link to="/donors" className="back-link">← Back to Donors</Link>
          <h1>Donor Details</h1>
        </div>
        <div className="header-actions">
          <button onClick={handleStatusToggle} className="btn btn-secondary">
            {donor.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
          <button onClick={() => setIsEditing(!isEditing)} className="btn btn-primary">
            {isEditing ? 'Cancel Edit' : 'Edit'}
          </button>
          <button onClick={handleDelete} className="btn btn-danger">
            Delete
          </button>
        </div>
      </div>

      <div className="details-grid">
        <div className="card donor-info-card">
          <div className="donor-header">
            <div className="donor-avatar">
              {donor.name[0].toUpperCase()}
            </div>
            <div>
              <h2>{donor.name}</h2>
              <span className={`badge badge-${donor.status === 'active' ? 'success' : 'warning'}`}>
                {donor.status}
              </span>
            </div>
          </div>

          <div className="info-section">
            <h3>Personal Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Email</label>
                <p>{donor.email}</p>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <p>{donor.phone}</p>
              </div>
              <div className="info-item">
                <label>Blood Type</label>
                <p><span className="blood-type">{donor.bloodType}</span></p>
              </div>
              <div className="info-item">
                <label>Date of Birth</label>
                <p>{donor.dateOfBirth}</p>
              </div>
              <div className="info-item">
                <label>Gender</label>
                <p>{donor.gender}</p>
              </div>
              <div className="info-item">
                <label>Address</label>
                <p>{donor.address}</p>
              </div>
              <div className="info-item">
                <label>Emergency Contact</label>
                <p>{donor.emergencyContact}</p>
              </div>
              <div className="info-item">
                <label>Registered Date</label>
                <p>{donor.registeredDate}</p>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>Donation Statistics</h3>
            <div className="stats-row">
              <div className="stat-box">
                <div className="stat-value">{donor.totalDonations}</div>
                <div className="stat-label">Total Donations</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">{donor.lastDonation}</div>
                <div className="stat-label">Last Donation</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card donation-history-card">
          <h3>Donation History</h3>
          <div className="history-list">
            {donationHistory.map(donation => (
              <div key={donation.id} className="history-item">
                <div className="history-date">
                  <div className="date-badge">{donation.date}</div>
                </div>
                <div className="history-details">
                  <div className="history-location">{donation.location}</div>
                  <div className="history-info">
                    <span>Units: {donation.units}</span>
                    <span className="separator">•</span>
                    <span>{donation.notes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DonorDetails
