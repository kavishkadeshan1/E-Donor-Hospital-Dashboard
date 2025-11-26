import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { donorService, notificationService } from '../services/firebaseService'
import './DonorList.css'

function DonorList() {
  const [donors, setDonors] = useState([])
  const [filteredDonors, setFilteredDonors] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBloodType, setFilterBloodType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Message Modal State
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [selectedDonor, setSelectedDonor] = useState(null)
  const [messageData, setMessageData] = useState({ title: '', body: '' })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    setError('')
    const unsubscribe = donorService.subscribe(
      (data) => {
        setDonors(data || [])
        setFilteredDonors(data || [])
        setLoading(false)
      },
      (err) => {
        console.error('Failed to subscribe to donors:', err)
        setError('Unable to load donors from Firestore. Check permissions/rules.')
        setLoading(false)
      }
    )

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [])

  useEffect(() => {
    let filtered = donors

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(donor => {
        const name = (donor.name || '').toLowerCase()
        const email = (donor.email || '').toLowerCase()
        const phone = donor.phone || ''
        const hospitalName = (donor.hospitalName || '').toLowerCase()
        return (
          name.includes(search) ||
          email.includes(search) ||
          phone.includes(searchTerm) ||
          hospitalName.includes(search)
        )
      })
    }

    if (filterBloodType !== 'all') {
      filtered = filtered.filter(donor => donor.bloodType === filterBloodType)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(donor => donor.status === filterStatus)
    }

    setFilteredDonors(filtered)
  }, [searchTerm, filterBloodType, filterStatus, donors])

  const handleMessageClick = (donor) => {
    setSelectedDonor(donor)
    setIsMessageModalOpen(true)
    setMessageData({ title: '', body: '' })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!messageData.title || !messageData.body) {
      alert('Please fill in all fields')
      return
    }
    
    setSending(true)
    try {
      await notificationService.sendToUser(
        selectedDonor.id,
        messageData.title,
        messageData.body
      )
      alert(`Message sent to ${selectedDonor.name} successfully!`)
      setIsMessageModalOpen(false)
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="donor-list">
      <div className="page-header">
        <div>
          <h1>Donor Management</h1>
          <p>Manage and track all registered blood donors</p>
        </div>
        <Link to="/donors/add" className="btn btn-primary">
          + Add New Donor
        </Link>
      </div>

      <div className="card filters-card">
        <div className="filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search donors by name, email, or phone..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <select
              className="form-select"
              value={filterBloodType}
              onChange={(e) => setFilterBloodType(e.target.value)}
            >
              <option value="all">All Blood Types</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>

            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-header">
          <div>
            <h3>Total Donors: {filteredDonors.length}</h3>
            {loading && <p style={{ fontSize: '13px', color: '#6b7280' }}>Loading donors from Firestore...</p>}
            {error && <p className="error" style={{ color: '#dc2626', fontSize: '13px' }}>{error}</p>}
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Blood Type</th>
              <th>Status</th>
              <th>Last Donation</th>
              <th>Total Donations</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDonors.map(donor => (
              <tr key={donor.id}>
                <td>
                  <div className="donor-name">{donor.name}</div>
                  <div className="donor-meta">
                    {donor.role && (
                      <span className="role-pill">
                        {donor.role === 'hospital' ? 'Hospital' : donor.role}
                      </span>
                    )}
                    {donor.source === 'user' && (
                      <span className="role-pill role-pill-muted">Website</span>
                    )}
                  </div>
                  {donor.hospitalName && (
                    <div className="hospital-name">{donor.hospitalName}</div>
                  )}
                </td>
                <td>
                  <div className="contact-info">
                    <div>{donor.email}</div>
                    <div className="phone">{donor.phone}</div>
                  </div>
                </td>
                <td>
                  <span className="blood-type">{donor.bloodType}</span>
                </td>
                <td>
                  <span className={`badge badge-${donor.status === 'active' ? 'success' : 'warning'}`}>
                    {donor.status}
                  </span>
                </td>
                <td>{donor.lastDonation || 'N/A'}</td>
                <td>{typeof donor.totalDonations === 'number' ? donor.totalDonations : '—'}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleMessageClick(donor)} 
                      className="btn-action btn-message"
                      style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                      Message
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredDonors.length === 0 && (
          <div className="no-results">
            <p>No donors found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Message Modal */}
      {isMessageModalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white', padding: '24px', borderRadius: '8px',
            width: '100%', maxWidth: '500px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginTop: 0 }}>Message to {selectedDonor?.name}</h2>
            <form onSubmit={handleSendMessage}>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  className="form-input"
                  value={messageData.title}
                  onChange={(e) => setMessageData({...messageData, title: e.target.value})}
                  placeholder="Enter message subject"
                  disabled={sending}
                />
              </div>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">Message</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  value={messageData.body}
                  onChange={(e) => setMessageData({...messageData, body: e.target.value})}
                  placeholder="Type your message here..."
                  disabled={sending}
                />
              </div>
              <div className="form-actions" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsMessageModalOpen(false)}
                  disabled={sending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={sending}
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DonorList
