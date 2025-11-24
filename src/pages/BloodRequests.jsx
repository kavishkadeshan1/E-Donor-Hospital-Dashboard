import { useState, useEffect } from 'react'
import './BloodRequests.css'

function BloodRequests() {
  const [requests, setRequests] = useState([])
  const [filteredRequests, setFilteredRequests] = useState([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterBloodType, setFilterBloodType] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)

  useEffect(() => {
    // Simulate API call - Replace with actual API
    const mockRequests = [
      { id: 1, patientName: 'Robert Miller', bloodType: 'O-', units: 2, urgency: 'critical', hospital: 'City General', date: '2025-11-24', status: 'pending', notes: 'Emergency surgery' },
      { id: 2, patientName: 'Linda Martinez', bloodType: 'AB-', units: 1, urgency: 'urgent', hospital: 'St. Mary\'s Hospital', date: '2025-11-24', status: 'pending', notes: 'Accident victim' },
      { id: 3, patientName: 'David Anderson', bloodType: 'B-', units: 3, urgency: 'urgent', hospital: 'Memorial Hospital', date: '2025-11-23', status: 'pending', notes: 'Post-surgery care' },
      { id: 4, patientName: 'Jessica White', bloodType: 'A+', units: 2, urgency: 'normal', hospital: 'City General', date: '2025-11-23', status: 'approved', notes: 'Scheduled surgery' },
      { id: 5, patientName: 'Christopher Lee', bloodType: 'O+', units: 1, urgency: 'normal', hospital: 'Regional Hospital', date: '2025-11-22', status: 'approved', notes: 'Routine procedure' },
      { id: 6, patientName: 'Amanda Harris', bloodType: 'B+', units: 2, urgency: 'urgent', hospital: 'City General', date: '2025-11-22', status: 'fulfilled', notes: 'Blood loss' },
      { id: 7, patientName: 'Matthew Clark', bloodType: 'A-', units: 1, urgency: 'normal', hospital: 'St. Mary\'s Hospital', date: '2025-11-21', status: 'fulfilled', notes: 'Treatment completed' }
    ]
    setRequests(mockRequests)
    setFilteredRequests(mockRequests)
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

  const handleStatusChange = (requestId, newStatus) => {
    setRequests(requests.map(req =>
      req.id === requestId ? { ...req, status: newStatus } : req
    ))
    setShowModal(false)
    setSelectedRequest(null)
  }

  const openRequestDetails = (request) => {
    setSelectedRequest(request)
    setShowModal(true)
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
            <div className="modal-body">
              <div className="detail-row">
                <label>Patient Name:</label>
                <span>{selectedRequest.patientName}</span>
              </div>
              <div className="detail-row">
                <label>Hospital:</label>
                <span>{selectedRequest.hospital}</span>
              </div>
              <div className="detail-row">
                <label>Blood Type:</label>
                <span className="blood-type">{selectedRequest.bloodType}</span>
              </div>
              <div className="detail-row">
                <label>Units Required:</label>
                <span>{selectedRequest.units}</span>
              </div>
              <div className="detail-row">
                <label>Urgency:</label>
                <span className={`badge ${getUrgencyBadgeClass(selectedRequest.urgency)}`}>
                  {selectedRequest.urgency}
                </span>
              </div>
              <div className="detail-row">
                <label>Date:</label>
                <span>{selectedRequest.date}</span>
              </div>
              <div className="detail-row">
                <label>Status:</label>
                <span className={`badge ${getStatusBadgeClass(selectedRequest.status)}`}>
                  {selectedRequest.status}
                </span>
              </div>
              <div className="detail-row">
                <label>Notes:</label>
                <span>{selectedRequest.notes}</span>
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
    </div>
  )
}

export default BloodRequests
