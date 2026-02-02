import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { dashboardService, inventoryService, requestService } from '../services/firebaseService'
import { Icons } from '../components/Icons'
import './DashboardEnhanced.css'

function DashboardEnhanced() {
  const [stats, setStats] = useState({
    totalDonors: 0,
    activeDonors: 0,
    pendingRequests: 0,
    bloodUnitsAvailable: 308 // Updated value
  })

  const [loading, setLoading] = useState(true)
  const [recentDonations, setRecentDonations] = useState([])
  const [urgentRequests, setUrgentRequests] = useState([])
  const [bloodTypeDistribution, setBloodTypeDistribution] = useState([])
  const [weeklyTrends, setWeeklyTrends] = useState([])
  const [inventory, setInventory] = useState([])
  const [hospitalName, setHospitalName] = useState('Hospital Admin')

  useEffect(() => {
    const adminData = localStorage.getItem('hospitalAdminData')
    if (adminData) {
      try {
        const parsed = JSON.parse(adminData)
        setHospitalName(parsed.name || 'Hospital Admin')
      } catch (e) {
        console.error('Error parsing admin data', e)
      }
    }

    loadDashboardData()

    // Set up real-time listeners
    const unsubscribeInventory = inventoryService.subscribe((data) => {
      setInventory(data)
      updateBloodTypeDistribution(data)
    })

    const unsubscribeRequests = requestService.subscribe((data) => {
      const urgent = data.filter(r =>
        (r.urgency === 'critical' || r.urgency === 'urgent') &&
        r.status === 'pending'
      ).slice(0, 5)
      setUrgentRequests(urgent)
    })

    return () => {
      unsubscribeInventory()
      unsubscribeRequests()
    }
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load stats
      const statsData = await dashboardService.getStats()
      setStats({ ...statsData, bloodUnitsAvailable: 308 })

      // Load weekly trends
      const trends = await dashboardService.getWeeklyTrends()
      setWeeklyTrends(trends)

      // Load recent donations
      const donations = await dashboardService.getRecentDonations()
      setRecentDonations(donations)

      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      setLoading(false)
    }
  }

  const updateBloodTypeDistribution = (inventoryData) => {
    const distribution = inventoryData.map(item => ({
      name: item.bloodType,
      value: item.units,
      fill: getBloodTypeColor(item.bloodType)
    }))
    setBloodTypeDistribution(distribution)
  }

  const getBloodTypeColor = (bloodType) => {
    const colors = {
      'O+': '#DC143C',
      'O-': '#B91030',
      'A+': '#FF6B6B',
      'A-': '#FF4757',
      'B+': '#FF8C94',
      'B-': '#FFA07A',
      'AB+': '#FFB6C1',
      'AB-': '#FFC0CB'
    }
    return colors[bloodType] || '#DC143C'
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-enhanced">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>Welcome back, {hospitalName}</h1>
          <p>Here's what's happening in your hospital today.</p>
        </div>
        <div className="welcome-decoration"></div>
      </div>

      {/* Quick Actions */}
      <div className="section-title">
        {Icons.menu} Quick Actions
      </div>
      <div className="quick-actions-grid">
        <Link to="/donors/add" className="quick-action-card">
          <div className="action-icon-wrapper bg-blue">
            {Icons.userPlus}
          </div>
          <h3>Add Donor</h3>
          <p>Register a new blood donor</p>
        </Link>
        <Link to="/blood-requests" className="quick-action-card">
          <div className="action-icon-wrapper bg-red">
            {Icons.droplet}
          </div>
          <h3>Request Blood</h3>
          <p>Create a new blood request</p>
        </Link>
        <Link to="/inventory" className="quick-action-card">
          <div className="action-icon-wrapper bg-green">
            {Icons.package}
          </div>
          <h3>Blood Inventory</h3>
          <p>Watch blood stock levels</p>
        </Link>
        <Link to="/notifications" className="quick-action-card">
          <div className="action-icon-wrapper bg-purple">
            {Icons.bell}
          </div>
          <h3>Send Alert</h3>
          <p>Notify donors of urgent needs</p>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="section-title">
        {Icons.dashboard} Overview
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-box primary">
            {Icons.users}
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalDonors}</div>
            <div className="stat-label">Total Donors</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-box success">
            {Icons.droplet}
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.bloodUnitsAvailable}</div>
            <div className="stat-label">Units Available</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-box warning">
            {Icons.bell}
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.pendingRequests}</div>
            <div className="stat-label">Pending Requests</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-box info">
            {Icons.user}
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeDonors}</div>
            <div className="stat-label">Active Donors</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-main-grid">
        {/* Right Column: Activity */}
        <div className="activity-column">
          {/* Urgent Requests */}
          <div className="chart-section">
            <div className="chart-header">
              <h2>Urgent Requests</h2>
              <Link to="/blood-requests" style={{ fontSize: '14px', color: '#dc2626', textDecoration: 'none', fontWeight: 600 }}>View All</Link>
            </div>
            <div className="activity-list">
              {urgentRequests.length > 0 ? (
                urgentRequests.map(request => (
                  <div key={request.id} className="activity-item">
                    <div className="activity-icon" style={{ color: '#dc2626', background: '#fee2e2' }}>
                      {Icons.droplet}
                    </div>
                    <div className="activity-details">
                      <div className="activity-title">{request.bloodType} Blood Needed</div>
                      <div className="activity-time">{request.hospitalName}  {request.urgency}</div>
                    </div>
                    <span className={`status-badge ${request.urgency}`}>
                      {request.urgency}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                  No urgent requests
                </div>
              )}
            </div>
          </div>

          {/* Recent Donations */}
          <div className="chart-section">
            <div className="chart-header">
              <h2>Recent Donations</h2>
              <Link to="/donors" style={{ fontSize: '14px', color: '#dc2626', textDecoration: 'none', fontWeight: 600 }}>View All</Link>
            </div>
            <div className="activity-list">
              {recentDonations.length > 0 ? (
                recentDonations.map(donation => (
                  <div key={donation.id} className="activity-item">
                    <div className="activity-icon" style={{ color: '#16a34a', background: '#dcfce7' }}>
                      {Icons.user}
                    </div>
                    <div className="activity-details">
                      <div className="activity-title">{donation.donorName}</div>
                      <div className="activity-time">{donation.bloodType}  {formatDate(donation.date)}</div>
                    </div>
                    <span className="status-badge normal">
                      Completed
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                  No recent donations
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardEnhanced
