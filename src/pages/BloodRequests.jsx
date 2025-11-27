import { useState, useEffect } from 'react'
import { requestService } from '../services/firebaseService'
import { Icons } from '../components/Icons'
import { sanitizeInput } from '../lib/sanitize'
import './BloodRequests.css'

function BloodRequests() {
  const [requests, setRequests] = useState([])
  const [filteredRequests, setFilteredRequests] = useState([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterBloodType, setFilterBloodType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  const baseRequestState = {
    patientName: '',
    patientAge: '',
    medicalCondition: '',
    patientStatus: 'Urgent - Active',
    bloodType: 'O+',
    units: 1,
    urgency: 'normal',
    priorityLevel: 'normal',
    notes: '',
    hospitalDepartment: 'Emergency Department',
    hospitalLocationText: '',
    hospitalDistance: '',
    contactPerson: '',
    contactPhone: ''
  }

  const buildInitialRequest = () => {
    const hospitalData = JSON.parse(localStorage.getItem('hospitalAdminData') || '{}')
    const locationParts = [
      hospitalData.street,
      hospitalData.city,
      hospitalData.state,
      hospitalData.zipCode
    ].filter(Boolean)

    return {
      ...baseRequestState,
      hospitalDepartment: hospitalData.department || baseRequestState.hospitalDepartment,
      hospitalLocationText: locationParts.join(', '),
      contactPerson: hospitalData.contactPerson || hospitalData.name || '',
      contactPhone: hospitalData.phone || ''
    }
  }
  
  // View Details Modal
  const [showModal, setShowModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)

  // Create Request Modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newRequest, setNewRequest] = useState(() => buildInitialRequest())
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Delete Confirmation Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [requestToDelete, setRequestToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = requestService.subscribe((data) => {
      setRequests(data)
      setFilteredRequests(data)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    let filtered = requests

    if (filterStatus !== 'all') {
      filtered = filtered.filter(req => req.status === filterStatus)
    }

    if (filterBloodType !== 'all') {
      filtered = filtered.filter(req => req.bloodType === filterBloodType)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(req => 
        req.patientName?.toLowerCase().includes(query) ||
        req.hospital?.toLowerCase().includes(query) ||
        req.medicalCondition?.toLowerCase().includes(query)
      )
    }

    setFilteredRequests(filtered)
  }, [filterStatus, filterBloodType, searchQuery, requests])

  // Stats Calculation
  const stats = {
    total: requests.length,
    urgent: requests.filter(r => r.urgency === 'critical' || r.urgency === 'urgent').length,
    pending: requests.filter(r => r.status === 'pending').length,
    fulfilled: requests.filter(r => r.status === 'fulfilled').length
  }

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await requestService.updateStatus(requestId, newStatus)
      setShowModal(false)
      setSelectedRequest(null)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  const handleOpenCreateModal = () => {
    setNewRequest(buildInitialRequest())
    setShowCreateModal(true)
  }

  const handleCreateRequest = async (e) => {
    e.preventDefault()
    setCreating(true)

    try {
      // Get hospital info from local storage
      const hospitalData = JSON.parse(localStorage.getItem('hospitalAdminData') || '{}')
      const hospitalName = hospitalData.name || 'Unknown Hospital'
      const hospitalLocation = {
        street: hospitalData.street || '',
        city: hospitalData.city || '',
        state: hospitalData.state || '',
        zipCode: hospitalData.zipCode || ''
      }

      const patientAge = newRequest.patientAge ? parseInt(newRequest.patientAge, 10) : null

      await requestService.create({
        ...newRequest,
        hospitalId: hospitalData.id || '',
        hospitalEmail: hospitalData.email || '',
        hospitalPhone: hospitalData.phone || '',
        hospitalLocation,
        source: 'hospital_dashboard',
        hospital: hospitalName,
        patientAge,
        units: parseInt(newRequest.units, 10),
        date: new Date().toISOString().split('T')[0] // Current date YYYY-MM-DD
      })

      setCreating(false)
      setShowCreateModal(false)
      setNewRequest(buildInitialRequest())
      
      // Small delay to allow modal to close visually before showing success modal
      setTimeout(() => {
        setShowSuccessModal(true)
      }, 100)

    } catch (error) {
      console.error('Error creating request:', error)
      setCreating(false)
      const message = (error?.code === 'permission-denied' || (error?.message || '').toLowerCase().includes('insufficient permissions'))
        ? 'Permission denied when saving to Firestore. Update your Firestore security rules to allow hospital admins to write to donation_requests, blood_requests_feed, and blood_request_details.'
        : 'Failed to create request. Please try again.'
      alert(message)
    }
  }

  const openRequestDetails = (request) => {
    setSelectedRequest(request)
    setShowModal(true)
  }

  const handleDeleteClick = (request, e) => {
    if (e) e.stopPropagation()
    setRequestToDelete(request)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!requestToDelete) return
    setDeleting(true)
    try {
      await requestService.delete(requestToDelete.id)
      setShowDeleteModal(false)
      setRequestToDelete(null)
      // Close the details modal if it's open
      if (showModal && selectedRequest?.id === requestToDelete.id) {
        setShowModal(false)
        setSelectedRequest(null)
      }
    } catch (error) {
      console.error('Error deleting request:', error)
      alert('Failed to delete request. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const formatLocation = (location = {}) => {
    const parts = [location.street, location.city, location.state, location.zipCode].filter(Boolean)
    return parts.length ? parts.join(', ') : 'Not provided'
  }

  const getPriorityLabel = (level = 'normal') => {
    switch (level) {
      case 'critical':
        return 'Critical Priority'
      case 'high':
        return 'High Priority'
      default:
        return 'Normal Priority'
    }
  }

  const getPriorityClass = (level = 'normal') => {
    switch (level) {
      case 'critical':
        return 'priority-critical'
      case 'high':
        return 'priority-high'
      default:
        return 'priority-normal'
    }
  }

  const getUrgencyBadgeClass = (urgency) => {
    switch (urgency) {
      case 'critical':
        return 'badge-danger'
      case 'urgent':
        return 'badge-warning'
      default:
        return 'badge-info'
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'fulfilled':
        return 'badge-success'
      case 'approved':
        return 'badge-info'
      case 'rejected':
        return 'badge-danger'
      default:
        return 'badge-warning'
    }
  }

  return (
    <div className="blood-requests-page">
      <div className="page-header-section">
        <div className="header-content">
          <h1>Blood Requests</h1>
          <p>Manage and track blood donation requests</p>
        </div>
        <button onClick={handleOpenCreateModal} className="btn-primary-large">
          {Icons.plus} New Request
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">{Icons.clipboardList}</div>
          <div className="stat-info">
            <span className="stat-label">Total Requests</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">{Icons.alertTriangle}</div>
          <div className="stat-info">
            <span className="stat-label">Urgent Needs</span>
            <span className="stat-value">{stats.urgent}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">{Icons.clock}</div>
          <div className="stat-info">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{stats.pending}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">{Icons.checkCircle}</div>
          <div className="stat-info">
            <span className="stat-label">Fulfilled</span>
            <span className="stat-value">{stats.fulfilled}</span>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="controls-bar">
        <div className="search-wrapper">
          {Icons.search}
          <input 
            type="text" 
            placeholder="Search patients, hospitals..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filters-wrapper">
          <select
            className="custom-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="rejected">Rejected</option>
          </select>

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
      {filteredRequests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{Icons.inbox}</div>
          <h3>No requests found</h3>
          <p>Try adjusting your filters or create a new request</p>
          <button onClick={handleOpenCreateModal} className="btn-secondary">
            Create Request
          </button>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="requests-grid">
              {filteredRequests.map(request => (
                <div key={request.id} className="request-card" onClick={() => openRequestDetails(request)}>
                  <div className="card-header">
                    <div className="patient-info">
                      <h3>{request.patientName}</h3>
                      <span className="patient-age">{request.patientAge} yrs • {request.medicalCondition}</span>
                    </div>
                    <div className={`blood-type-badge ${request.bloodType.replace('+', 'p').replace('-', 'n')}`}>
                      {request.bloodType}
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <div className="info-row">
                      <span className="label">Units:</span>
                      <span className="value">{request.units}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Hospital:</span>
                      <span className="value">{request.hospital}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Date:</span>
                      <span className="value">{request.date}</span>
                    </div>
                  </div>

                  <div className="card-footer">
                    <span className={`status-pill ${request.status}`}>
                      {request.status}
                    </span>
                    <span className={`urgency-pill ${request.urgency}`}>
                      {request.urgency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="requests-list-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Blood Type</th>
                    <th>Units</th>
                    <th>Hospital</th>
                    <th>Urgency</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(request => (
                    <tr key={request.id}>
                      <td>
                        <div className="cell-primary">{request.patientName}</div>
                        <div className="cell-secondary">{request.patientAge} yrs</div>
                      </td>
                      <td>
                        <span className={`blood-badge-sm ${request.bloodType.replace('+', 'p').replace('-', 'n')}`}>
                          {request.bloodType}
                        </span>
                      </td>
                      <td>{request.units}</td>
                      <td>{request.hospital}</td>
                      <td>
                        <span className={`badge-sm ${request.urgency}`}>
                          {request.urgency}
                        </span>
                      </td>
                      <td>
                        <span className={`status-dot ${request.status}`}></span>
                        {request.status}
                      </td>
                      <td>{request.date}</td>
                      <td>
                        <button 
                          className="btn-icon"
                          onClick={() => openRequestDetails(request)}
                        >
                          {Icons.arrowRight}
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

      {showModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <div className="header-left">
                <h2>Request Details</h2>
                <span className={`id-badge`}>#{selectedRequest.id.slice(0, 6)}</span>
              </div>
              <button onClick={() => setShowModal(false)} className="close-btn-modern">
                {Icons.x}
              </button>
            </div>
            
            <div className="modal-body-scroll">
              <div className="request-banner">
                <div className="banner-main">
                  <div className={`blood-type-large ${selectedRequest.bloodType.replace('+', 'p').replace('-', 'n')}`}>
                    {selectedRequest.bloodType}
                  </div>
                  <div className="banner-info">
                    <h3>{selectedRequest.patientName}</h3>
                    <p>{selectedRequest.units} Units Required • {selectedRequest.urgency} Urgency</p>
                  </div>
                </div>
                <div className="banner-status">
                  <span className={`status-badge-large ${selectedRequest.status}`}>
                    {selectedRequest.status}
                  </span>
                </div>
              </div>

              <div className="details-grid-modern">
                <div className="detail-section">
                  <h4>Patient Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Age</label>
                      <p>{selectedRequest.patientAge ? `${selectedRequest.patientAge} years` : 'N/A'}</p>
                    </div>
                    <div className="info-item">
                      <label>Condition</label>
                      <p>{selectedRequest.medicalCondition || 'N/A'}</p>
                    </div>
                    <div className="info-item">
                      <label>Status</label>
                      <p>{selectedRequest.patientStatus || 'N/A'}</p>
                    </div>
                    <div className="info-item full">
                      <label>Medical Notes</label>
                      <p className="notes-text">{selectedRequest.notes || 'No notes provided.'}</p>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Hospital Details</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Hospital Name</label>
                      <p>{selectedRequest.hospital}</p>
                    </div>
                    <div className="info-item">
                      <label>Department</label>
                      <p>{selectedRequest.hospitalDepartment || 'N/A'}</p>
                    </div>
                    <div className="info-item">
                      <label>Contact</label>
                      <p>{selectedRequest.contactPerson || 'N/A'}</p>
                    </div>
                    <div className="info-item">
                      <label>Phone</label>
                      <p>{selectedRequest.contactPhone || 'N/A'}</p>
                    </div>
                    <div className="info-item full">
                      <label>Location</label>
                      <p>{selectedRequest.hospitalLocationText || formatLocation(selectedRequest.hospitalLocation)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer-modern">
              <div className="footer-left">
                <button
                  onClick={() => handleDeleteClick(selectedRequest)}
                  className="btn-danger-outline"
                >
                  {Icons.x} Delete
                </button>
              </div>
              <div className="footer-right">
                {selectedRequest.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(selectedRequest.id, 'rejected')}
                      className="btn-secondary-fill"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedRequest.id, 'approved')}
                      className="btn-success-fill"
                    >
                      Approve
                    </button>
                  </>
                )}
                {selectedRequest.status === 'approved' && (
                  <button
                    onClick={() => handleStatusChange(selectedRequest.id, 'fulfilled')}
                    className="btn-primary-fill"
                  >
                    Mark as Fulfilled
                  </button>
                )}
                {selectedRequest.status !== 'pending' && selectedRequest.status !== 'approved' && (
                   <button onClick={() => setShowModal(false)} className="btn-secondary-fill">
                     Close
                   </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modern-modal large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <h2>New Blood Request</h2>
              <button onClick={() => setShowCreateModal(false)} className="close-btn-modern">
                {Icons.x}
              </button>
            </div>
            <form onSubmit={handleCreateRequest} className="create-form">
              <div className="modal-body-scroll">
                <div className="form-section">
                  <h3>Patient Details</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Patient Name</label>
                      <input
                        type="text"
                        required
                        value={newRequest.patientName}
                        onChange={(e) => setNewRequest({...newRequest, patientName: sanitizeInput(e.target.value)})}
                        placeholder="Full Name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Age</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={newRequest.patientAge}
                        onChange={(e) => setNewRequest({...newRequest, patientAge: e.target.value})}
                        placeholder="Years"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Medical Condition</label>
                    <input
                      type="text"
                      required
                      value={newRequest.medicalCondition}
                      onChange={(e) => setNewRequest({...newRequest, medicalCondition: sanitizeInput(e.target.value)})}
                      placeholder="e.g. Surgery, Accident, Anemia"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Blood Requirements</h3>
                  <div className="form-row three-col">
                    <div className="form-group">
                      <label>Blood Type</label>
                      <select
                        value={newRequest.bloodType}
                        onChange={(e) => setNewRequest({...newRequest, bloodType: e.target.value})}
                      >
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Units</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={newRequest.units}
                        onChange={(e) => setNewRequest({...newRequest, units: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Urgency</label>
                      <select
                        value={newRequest.urgency}
                        onChange={(e) => setNewRequest({...newRequest, urgency: e.target.value})}
                      >
                        <option value="normal">Normal</option>
                        <option value="urgent">Urgent</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Medical Notes</label>
                    <textarea
                      rows="3"
                      value={newRequest.notes}
                      onChange={(e) => setNewRequest({...newRequest, notes: sanitizeInput(e.target.value)})}
                      placeholder="Additional details about the request..."
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Hospital & Contact</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Department</label>
                      <input
                        type="text"
                        value={newRequest.hospitalDepartment}
                        onChange={(e) => setNewRequest({...newRequest, hospitalDepartment: sanitizeInput(e.target.value)})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Contact Person</label>
                      <input
                        type="text"
                        required
                        value={newRequest.contactPerson}
                        onChange={(e) => setNewRequest({...newRequest, contactPerson: sanitizeInput(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Contact Phone</label>
                    <input
                      type="tel"
                      required
                      value={newRequest.contactPhone}
                      onChange={(e) => setNewRequest({...newRequest, contactPhone: sanitizeInput(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer-modern">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)} 
                  className="btn-secondary-fill"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary-fill"
                  disabled={creating}
                >
                  {creating ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay" style={{ zIndex: 2100 }}>
          <div className="modern-modal" style={{ maxWidth: '400px', padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ 
                width: '72px', 
                height: '72px', 
                borderRadius: '50%', 
                background: '#dcfce7', 
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)'
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Request Sent!</h2>
              <p style={{ color: 'var(--text-light)', fontSize: '1rem', lineHeight: '1.5', marginBottom: '2rem' }}>
                Your blood request has been successfully broadcasted to all eligible donors.
              </p>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="btn-primary-fill"
                style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && requestToDelete && (
        <div className="modal-overlay" style={{ zIndex: 2100 }}>
          <div className="modern-modal" style={{ maxWidth: '420px', padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ 
                width: '72px', 
                height: '72px', 
                borderRadius: '50%', 
                background: '#fee2e2', 
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)'
              }}>
                {Icons.alertTriangle}
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Delete Request?</h2>
              <p style={{ color: 'var(--text-light)', fontSize: '1rem', lineHeight: '1.5', marginBottom: '0.5rem' }}>
                Are you sure you want to delete the blood request for <strong>{requestToDelete.patientName}</strong>?
              </p>
              <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '2rem' }}>
                This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                <button 
                  onClick={() => {
                    setShowDeleteModal(false)
                    setRequestToDelete(null)
                  }}
                  className="btn-secondary-fill"
                  style={{ flex: 1, padding: '1rem', fontSize: '1rem' }}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="btn-danger-fill"
                  style={{ flex: 1, padding: '1rem', fontSize: '1rem' }}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BloodRequests
