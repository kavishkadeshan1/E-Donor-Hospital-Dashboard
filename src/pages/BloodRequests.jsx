import { useState, useEffect } from 'react'
import { requestService } from '../services/firebaseService'
import './BloodRequests.css'

function BloodRequests() {
  const [requests, setRequests] = useState([])
  const [filteredRequests, setFilteredRequests] = useState([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterBloodType, setFilterBloodType] = useState('all')

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

    setFilteredRequests(filtered)
  }, [filterStatus, filterBloodType, requests])

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

      setShowCreateModal(false)
      setNewRequest(buildInitialRequest())
      alert('Blood request sent successfully!')
    } catch (error) {
      console.error('Error creating request:', error)
      const message = (error?.code === 'permission-denied' || (error?.message || '').toLowerCase().includes('insufficient permissions'))
        ? 'Permission denied when saving to Firestore. Update your Firestore security rules to allow hospital admins to write to donation_requests, blood_requests_feed, and blood_request_details.'
        : 'Failed to create request. Please try again.'
      alert(message)
    } finally {
      setCreating(false)
    }
  }

  const openRequestDetails = (request) => {
    setSelectedRequest(request)
    setShowModal(true)
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
    <div className="blood-requests">
      <div className="page-header">
        <div>
          <h1>Blood Requests</h1>
          <p>Manage blood donation requests from patients</p>
        </div>
        <button onClick={handleOpenCreateModal} className="btn btn-primary">
          + New Request
        </button>
      </div>

      <div className="card filters-card">
        <div className="filters">
          <select
            className="form-select"
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
        </div>
      </div>

      <div className="card">
        <div className="table-header">
          <h3>Total Requests: {filteredRequests.length}</h3>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Hospital</th>
              <th>Blood Type</th>
              <th>Units</th>
              <th>Urgency</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map(request => (
              <tr key={request.id}>
                <td>
                  <div className="patient-name">{request.patientName}</div>
                </td>
                <td>{request.hospital}</td>
                <td>
                  <span className="blood-type">{request.bloodType}</span>
                </td>
                <td>{request.units}</td>
                <td>
                  <span className={`badge ${getUrgencyBadgeClass(request.urgency)}`}>
                    {request.urgency}
                  </span>
                </td>
                <td>{request.date}</td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                    {request.status}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => openRequestDetails(request)}
                    className="btn-action"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRequests.length === 0 && (
          <div className="no-results">
            <p>No blood requests found matching your criteria</p>
          </div>
        )}
      </div>

      {showModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Details</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body request-modal-body">
              <div className="request-hero">
                <div>
                  <p className="hero-label">Blood Type</p>
                  <div className="hero-blood-type">{selectedRequest.bloodType}</div>
                  <p className="hero-units">{selectedRequest.units} units needed</p>
                </div>
                <div className="hero-meta">
                  <span className={`priority-pill ${getPriorityClass(selectedRequest.priorityLevel || (selectedRequest.urgency === 'critical' ? 'critical' : selectedRequest.urgency === 'urgent' ? 'high' : 'normal'))}`}>
                    {getPriorityLabel(selectedRequest.priorityLevel || (selectedRequest.urgency === 'critical' ? 'critical' : selectedRequest.urgency === 'urgent' ? 'high' : 'normal'))}
                  </span>
                  <span className={`badge ${getUrgencyBadgeClass(selectedRequest.urgency)}`}>
                    {selectedRequest.urgency}
                  </span>
                  <span className={`badge ${getStatusBadgeClass(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
              </div>

              <div className="details-section">
                <div className="section-title">Patient Information</div>
                <div className="details-grid">
                  <div className="detail-card">
                    <label>Patient Name</label>
                    <p>{selectedRequest.patientName}</p>
                  </div>
                  <div className="detail-card">
                    <label>Age</label>
                    <p>{selectedRequest.patientAge ? `${selectedRequest.patientAge} years` : 'Not provided'}</p>
                  </div>
                  <div className="detail-card">
                    <label>Medical Condition</label>
                    <p>{selectedRequest.medicalCondition || 'Not provided'}</p>
                  </div>
                  <div className="detail-card">
                    <label>Patient Status</label>
                    <p>{selectedRequest.patientStatus || 'Not provided'}</p>
                  </div>
                  <div className="detail-card">
                    <label>Requested On</label>
                    <p>{selectedRequest.date}</p>
                  </div>
                  <div className="detail-card">
                    <label>Source</label>
                    <p>{selectedRequest.source === 'hospital_dashboard' ? 'Hospital Dashboard' : (selectedRequest.source || 'Unknown')}</p>
                  </div>
                </div>
                <div className="detail-card full-width">
                  <label>Medical Notes</label>
                  <p>{selectedRequest.notes || 'No medical notes provided.'}</p>
                </div>
              </div>

              <div className="details-section">
                <div className="section-title">Hospital Information</div>
                <div className="details-grid">
                  <div className="detail-card">
                    <label>Hospital</label>
                    <p>{selectedRequest.hospital}</p>
                  </div>
                  <div className="detail-card">
                    <label>Department</label>
                    <p>{selectedRequest.hospitalDepartment || 'Not provided'}</p>
                  </div>
                  <div className="detail-card">
                    <label>Location</label>
                    <p>{selectedRequest.hospitalLocationText || formatLocation(selectedRequest.hospitalLocation)}</p>
                  </div>
                  <div className="detail-card">
                    <label>Distance</label>
                    <p>{selectedRequest.hospitalDistance || 'Not provided'}</p>
                  </div>
                  <div className="detail-card">
                    <label>Contact Person</label>
                    <p>{selectedRequest.contactPerson || 'Not provided'}</p>
                  </div>
                  <div className="detail-card">
                    <label>Contact Phone</label>
                    <p>{selectedRequest.contactPhone || selectedRequest.hospitalPhone || 'Not provided'}</p>
                  </div>
                  <div className="detail-card">
                    <label>Contact Email</label>
                    <p>{selectedRequest.hospitalEmail || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {selectedRequest.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleStatusChange(selectedRequest.id, 'approved')}
                    className="btn btn-success"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedRequest.id, 'rejected')}
                    className="btn btn-danger"
                  >
                    Reject
                  </button>
                </>
              )}
              {selectedRequest.status === 'approved' && (
                <button
                  onClick={() => handleStatusChange(selectedRequest.id, 'fulfilled')}
                  className="btn btn-success"
                >
                  Mark as Fulfilled
                </button>
              )}
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Blood Request</h2>
              <button onClick={() => setShowCreateModal(false)} className="close-btn">×</button>
            </div>
            <form onSubmit={handleCreateRequest}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Patient Name</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={newRequest.patientName}
                    onChange={(e) => setNewRequest({...newRequest, patientName: e.target.value})}
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Patient Age</label>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      required
                      value={newRequest.patientAge}
                      onChange={(e) => setNewRequest({...newRequest, patientAge: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Medical Condition</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={newRequest.medicalCondition}
                      onChange={(e) => setNewRequest({...newRequest, medicalCondition: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Blood Type</label>
                    <select
                      className="form-select"
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
                    <label className="form-label">Units Needed</label>
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      required
                      value={newRequest.units}
                      onChange={(e) => setNewRequest({...newRequest, units: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Urgency</label>
                    <select
                      className="form-select"
                      value={newRequest.urgency}
                      onChange={(e) => setNewRequest({...newRequest, urgency: e.target.value})}
                    >
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority Tag</label>
                    <select
                      className="form-select"
                      value={newRequest.priorityLevel}
                      onChange={(e) => setNewRequest({...newRequest, priorityLevel: e.target.value})}
                    >
                      <option value="normal">Normal Priority</option>
                      <option value="high">High Priority</option>
                      <option value="critical">Critical Priority</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Patient Status Label</label>
                  <select
                    className="form-select"
                    value={newRequest.patientStatus}
                    onChange={(e) => setNewRequest({...newRequest, patientStatus: e.target.value})}
                  >
                    <option value="Urgent - Active">Urgent - Active</option>
                    <option value="Awaiting Donor Match">Awaiting Donor Match</option>
                    <option value="Stabilized - Pending Transfusion">Stabilized - Pending Transfusion</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Medical Notes</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={newRequest.notes}
                    onChange={(e) => setNewRequest({...newRequest, notes: e.target.value})}
                  />
                </div>

                <hr className="form-divider" />
                <h4 className="form-section-title">Hospital Information</h4>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newRequest.hospitalDepartment}
                      onChange={(e) => setNewRequest({...newRequest, hospitalDepartment: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newRequest.hospitalLocationText}
                      onChange={(e) => setNewRequest({...newRequest, hospitalLocationText: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Distance from Donor</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 2.1 km"
                      value={newRequest.hospitalDistance}
                      onChange={(e) => setNewRequest({...newRequest, hospitalDistance: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Person</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={newRequest.contactPerson}
                      onChange={(e) => setNewRequest({...newRequest, contactPerson: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    required
                    value={newRequest.contactPhone}
                    onChange={(e) => setNewRequest({...newRequest, contactPhone: e.target.value})}
                  />
                </div>
                <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>
                  This request will be saved to the hospital dashboard and pushed to the donor app feed with your hospital contact and address details.
                </p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)} 
                  className="btn btn-secondary"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BloodRequests
