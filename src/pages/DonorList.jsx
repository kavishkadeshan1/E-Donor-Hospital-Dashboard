import { useState, useEffect } from 'react'
import { donorService, notificationService } from '../services/firebaseService'
import { Icons } from '../components/Icons'
import './DonorList.css'

function DonorList() {
  const [donors, setDonors] = useState([])
  const [filteredDonors, setFilteredDonors] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBloodType, setFilterBloodType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  
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

  // Stats Calculation
  const stats = {
    total: donors.length,
    active: donors.filter(d => d.status === 'active').length,
    oPositive: donors.filter(d => d.bloodType === 'O+').length,
    newThisMonth: donors.filter(d => {
      if (!d.createdAt) return false;
      const date = new Date(d.createdAt.seconds * 1000);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length
  }

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
    <div className="donor-list-page">
      <div className="page-header-section">
        <div className="header-content">
          <h1>Donor Management</h1>
          <p>Manage and track all registered blood donors</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">{Icons.users}</div>
          <div className="stat-info">
            <span className="stat-label">Total Donors</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">{Icons.activity}</div>
          <div className="stat-info">
            <span className="stat-label">Active Donors</span>
            <span className="stat-value">{stats.active}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">{Icons.droplet}</div>
          <div className="stat-info">
            <span className="stat-label">O+ Donors</span>
            <span className="stat-value">{stats.oPositive}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">{Icons.trendingUp}</div>
          <div className="stat-info">
            <span className="stat-label">New This Month</span>
            <span className="stat-value">{stats.newThisMonth}</span>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="controls-bar">
        <div className="search-wrapper">
          {Icons.search}
          <input 
            type="text" 
            placeholder="Search donors by name, email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filters-wrapper">
          <select
            className="custom-select"
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
            className="custom-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              {Icons.dashboard}
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              {Icons.menu}
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading donors...</p>
        </div>
      ) : filteredDonors.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{Icons.users}</div>
          <h3>No donors found</h3>
          <p>Try adjusting your filters</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="requests-grid">
              {filteredDonors.map(donor => (
                <div key={donor.id} className="request-card">
                  <div className="card-header">
                    <div className="patient-info">
                      <h3>{donor.name}</h3>
                      <span className="patient-age">{donor.email}</span>
                    </div>
                    <div className={`blood-type-badge ${donor.bloodType.replace('+', 'p').replace('-', 'n')}`}>
                      {donor.bloodType}
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <div className="info-row">
                      <span className="label">Phone:</span>
                      <span className="value">{donor.phone}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Last Donation:</span>
                      <span className="value">{donor.lastDonation || 'Never'}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Total Donations:</span>
                      <span className="value">{donor.totalDonations || 0}</span>
                    </div>
                  </div>

                  <div className="card-footer">
                    <span className={`status-pill ${donor.status === 'active' ? 'fulfilled' : 'rejected'}`}>
                      {donor.status}
                    </span>
                    <button 
                      onClick={() => handleMessageClick(donor)}
                      className="btn-icon-text"
                    >
                      {Icons.send} Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="requests-list-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Blood Type</th>
                    <th>Status</th>
                    <th>Last Donation</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonors.map(donor => (
                    <tr key={donor.id}>
                      <td>
                        <div className="cell-primary">{donor.name}</div>
                        <div className="cell-secondary">
                          {donor.role === 'hospital' ? 'Hospital Added' : 'Registered User'}
                        </div>
                      </td>
                      <td>
                        <div className="cell-primary">{donor.phone}</div>
                        <div className="cell-secondary">{donor.email}</div>
                      </td>
                      <td>
                        <span className={`blood-badge-sm ${donor.bloodType.replace('+', 'p').replace('-', 'n')}`}>
                          {donor.bloodType}
                        </span>
                      </td>
                      <td>
                        <span className={`status-dot ${donor.status === 'active' ? 'fulfilled' : 'rejected'}`}></span>
                        {donor.status}
                      </td>
                      <td>{donor.lastDonation || 'N/A'}</td>
                      <td>{donor.totalDonations || 0}</td>
                      <td>
                        <button 
                          className="btn-icon"
                          onClick={() => handleMessageClick(donor)}
                          title="Send Message"
                        >
                          {Icons.send}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Message Modal */}
      {isMessageModalOpen && (
        <div className="modal-overlay" onClick={() => setIsMessageModalOpen(false)}>
          <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <h2>Message to {selectedDonor?.name}</h2>
              <button onClick={() => setIsMessageModalOpen(false)} className="close-btn-modern">
                {Icons.x}
              </button>
            </div>
            
            <form onSubmit={handleSendMessage} className="create-form">
              <div className="modal-body-scroll">
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    required
                    value={messageData.title}
                    onChange={(e) => setMessageData({...messageData, title: e.target.value})}
                    placeholder="Enter message subject"
                    disabled={sending}
                  />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    rows="6"
                    required
                    value={messageData.body}
                    onChange={(e) => setMessageData({...messageData, body: e.target.value})}
                    placeholder="Type your message here..."
                    disabled={sending}
                  />
                </div>
              </div>

              <div className="modal-footer-modern">
                <button
                  type="button"
                  className="btn-secondary-fill"
                  onClick={() => setIsMessageModalOpen(false)}
                  disabled={sending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-fill"
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
