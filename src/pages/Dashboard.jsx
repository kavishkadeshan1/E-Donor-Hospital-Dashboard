import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState({
    totalDonors: 0,
    activeDonors: 0,
    pendingRequests: 0,
    bloodUnitsAvailable: 0
  })

  const [recentDonations, setRecentDonations] = useState([])
  const [urgentRequests, setUrgentRequests] = useState([])

  useEffect(() => {
    // Simulate API call - Replace with actual API
    setStats({
      totalDonors: 1247,
      activeDonors: 856,
      pendingRequests: 23,
      bloodUnitsAvailable: 342
    })

    setRecentDonations([
      { id: 1, donorName: 'John Smith', bloodType: 'O+', date: '2025-11-23', units: 1 },
      { id: 2, donorName: 'Sarah Johnson', bloodType: 'A+', date: '2025-11-23', units: 1 },
      { id: 3, donorName: 'Michael Brown', bloodType: 'B+', date: '2025-11-22', units: 1 },
      { id: 4, donorName: 'Emily Davis', bloodType: 'AB+', date: '2025-11-22', units: 1 },
      { id: 5, donorName: 'James Wilson', bloodType: 'O-', date: '2025-11-21', units: 1 }
    ])

    setUrgentRequests([
      { id: 1, patientName: 'Robert Miller', bloodType: 'O-', status: 'urgent', hospital: 'City General' },
      { id: 2, patientName: 'Linda Martinez', bloodType: 'AB-', status: 'critical', hospital: 'St. Mary\'s' },
      { id: 3, patientName: 'David Anderson', bloodType: 'B-', status: 'urgent', hospital: 'Memorial Hospital' }
    ])
  }, [])

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to E-Donor Hospital Admin Portal</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalDonors}</div>
            <div className="stat-label">Total Donors</div>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeDonors}</div>
            <div className="stat-label">Active Donors</div>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pendingRequests}</div>
            <div className="stat-label">Pending Requests</div>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">🩸</div>
          <div className="stat-content">
            <div className="stat-value">{stats.bloodUnitsAvailable}</div>
            <div className="stat-label">Blood Units Available</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Donations</h2>
            <Link to="/donors" className="view-all-link">View All</Link>
          </div>
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Donor Name</th>
                  <th>Blood Type</th>
                  <th>Date</th>
                  <th>Units</th>
                </tr>
              </thead>
              <tbody>
                {recentDonations.map(donation => (
                  <tr key={donation.id}>
                    <td>{donation.donorName}</td>
                    <td>
                      <span className="blood-type">{donation.bloodType}</span>
                    </td>
                    <td>{donation.date}</td>
                    <td>{donation.units}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Urgent Blood Requests</h2>
            <Link to="/blood-requests" className="view-all-link">View All</Link>
          </div>
          <div className="card">
            <div className="urgent-requests-list">
              {urgentRequests.map(request => (
                <div key={request.id} className="urgent-request-item">
                  <div className="request-info">
                    <div className="request-patient">{request.patientName}</div>
                    <div className="request-hospital">{request.hospital}</div>
                  </div>
                  <div className="request-details">
                    <span className="blood-type">{request.bloodType}</span>
                    <span className={`badge badge-${request.status === 'critical' ? 'danger' : 'warning'}`}>
                      {request.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
