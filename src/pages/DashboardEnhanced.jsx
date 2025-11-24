import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { dashboardService, inventoryService, requestService } from '../services/firebaseService'
import './DashboardEnhanced.css'

function DashboardEnhanced() {
  const [stats, setStats] = useState({
    totalDonors: 0,
    activeDonors: 0,
    pendingRequests: 0,
    bloodUnitsAvailable: 0
  })

  const [loading, setLoading] = useState(true)
  const [recentDonations, setRecentDonations] = useState([])
  const [urgentRequests, setUrgentRequests] = useState([])
  const [bloodTypeDistribution, setBloodTypeDistribution] = useState([])
  const [weeklyTrends, setWeeklyTrends] = useState([])
  const [inventory, setInventory] = useState([])

  useEffect(() => {
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
      setStats(statsData)

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return '#10B981'
      case 'low': return '#F59E0B'
      case 'critical': return '#EF4444'
      default: return '#6B7280'
    }
  }

  if (loading) {
    return (
      <div className="dashboard-enhanced">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-enhanced">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Real-time analytics and blood donation insights</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalDonors}</div>
            <div className="stat-label">Total Donors</div>
            <div className="stat-change positive">+12% from last month</div>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeDonors}</div>
            <div className="stat-label">Active Donors</div>
            <div className="stat-change positive">+8% from last month</div>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pendingRequests}</div>
            <div className="stat-label">Pending Requests</div>
            <div className="stat-change negative">-3 from yesterday</div>
          </div>
        </div>

        <div className="stat-card stat-danger">
          <div className="stat-icon">🩸</div>
          <div className="stat-content">
            <div className="stat-value">{stats.bloodUnitsAvailable}</div>
            <div className="stat-label">Blood Units Available</div>
            <div className="stat-change positive">+15 units today</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Weekly Trends */}
        <div className="card chart-card">
          <h3>Weekly Donation Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="donations" 
                stroke="#DC143C" 
                strokeWidth={2}
                name="Donations"
              />
              <Line 
                type="monotone" 
                dataKey="requests" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Requests"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Blood Type Distribution */}
        <div className="card chart-card">
          <h3>Blood Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={bloodTypeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {bloodTypeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Inventory Status Bar Chart */}
      <div className="card chart-card-full">
        <h3>Blood Inventory Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={inventory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="bloodType" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="units" fill="#DC143C" name="Available Units" />
            <Bar dataKey="minRequired" fill="#10B981" name="Minimum Required" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      <div className="activity-grid">
        {/* Recent Donations */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Donations</h3>
            <Link to="/donors" className="view-all-link">View All →</Link>
          </div>
          <div className="activity-list">
            {recentDonations.length > 0 ? (
              recentDonations.map(donation => (
                <div key={donation.id} className="activity-item">
                  <div className="activity-icon" style={{ backgroundColor: getBloodTypeColor(donation.bloodType) }}>
                    {donation.bloodType}
                  </div>
                  <div className="activity-details">
                    <div className="activity-title">{donation.donorName}</div>
                    <div className="activity-meta">
                      {donation.units} unit · {donation.date}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No recent donations</p>
              </div>
            )}
          </div>
        </div>

        {/* Urgent Requests */}
        <div className="card">
          <div className="card-header">
            <h3>Urgent Blood Requests</h3>
            <Link to="/blood-requests" className="view-all-link">View All →</Link>
          </div>
          <div className="activity-list">
            {urgentRequests.length > 0 ? (
              urgentRequests.map(request => (
                <div key={request.id} className="activity-item">
                  <div className={`activity-icon ${request.urgency === 'critical' ? 'critical' : 'urgent'}`}>
                    {request.bloodType}
                  </div>
                  <div className="activity-details">
                    <div className="activity-title">{request.patientName}</div>
                    <div className="activity-meta">
                      {request.units} units needed · {request.hospital}
                    </div>
                  </div>
                  <span className={`badge badge-${request.urgency === 'critical' ? 'danger' : 'warning'}`}>
                    {request.urgency}
                  </span>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No urgent requests</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <Link to="/donors/add" className="action-btn btn-primary">
            <span className="action-icon">👤</span>
            Add New Donor
          </Link>
          <Link to="/blood-requests" className="action-btn btn-warning">
            <span className="action-icon">📋</span>
            Manage Requests
          </Link>
          <Link to="/inventory" className="action-btn btn-danger">
            <span className="action-icon">🩸</span>
            Update Inventory
          </Link>
          <Link to="/notifications" className="action-btn btn-info">
            <span className="action-icon">🔔</span>
            Send Notification
          </Link>
        </div>
      </div>
    </div>
  )
}

export default DashboardEnhanced
