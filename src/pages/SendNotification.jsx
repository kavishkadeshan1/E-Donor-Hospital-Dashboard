import { useState, useEffect } from 'react'
import { notificationService } from '../services/firebaseService'
import { Icons } from '../components/Icons'
import { sanitizeInput } from '../lib/sanitize'
import './SendNotification.css'

function SendNotification() {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'general',
    targetAudience: 'all',
    priority: 'normal',
    selectedUserId: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [sentCount, setSentCount] = useState(0)
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Load users for specific user targeting
  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true)
      try {
        const allUsers = await notificationService.getAllUsers()
        console.log('Loaded users for notification targeting:', allUsers)
        setUsers(allUsers)
      } catch (err) {
        console.error('Error loading users:', err)
      } finally {
        setLoadingUsers(false)
      }
    }
    loadUsers()
  }, [])

  const notificationTemplates = [
    { 
      title: 'Urgent Blood Needed', 
      body: 'We urgently need O- blood donations. Please donate if you can help save lives.', 
      type: 'urgent',
      icon: Icons.droplet
    },
    { 
      title: 'Blood Drive Event', 
      body: 'Join our blood drive event this weekend at City Hall from 9 AM to 5 PM.', 
      type: 'event',
      icon: Icons.calendar || Icons.bell
    },
    { 
      title: 'Donation Reminder', 
      body: "It's been 3 months since your last donation. You're eligible to donate again!", 
      type: 'reminder',
      icon: Icons.clock || Icons.bell
    },
    { 
      title: 'Thank You for Donating', 
      body: "Thank you for your recent donation. You've helped save lives in our community!", 
      type: 'general',
      icon: Icons.heart || Icons.user
    }
  ]

  const handleChange = (e) => {
    const value = e.target.type === 'select-one' ? e.target.value : sanitizeInput(e.target.value)
    setFormData({
      ...formData,
      [e.target.name]: value
    })
    setSuccess(false)
    setError('')
  }

  const applyTemplate = (template) => {
    setFormData({
      ...formData,
      title: template.title,
      body: template.body,
      type: template.type
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.title || !formData.body) {
      setError('Please fill in all required fields')
      return
    }

    // Validate specific user selection
    if (formData.targetAudience === 'specific' && !formData.selectedUserId) {
      setError('Please select a user to send the notification to')
      return
    }

    setLoading(true)
    setSentCount(0)

    try {
      const metadata = {
        priority: formData.priority,
        sentFrom: 'hospital-admin-portal'
      }

      let result

      // Check if targeting by blood type
      const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
      
      if (formData.targetAudience === 'specific') {
        // Send to specific user
        result = await notificationService.sendToUser(
          formData.selectedUserId,
          formData.title,
          formData.body,
          formData.type,
          metadata
        )
        setSentCount(1)
      } else if (bloodTypes.includes(formData.targetAudience)) {
        // Send to users with specific blood type
        result = await notificationService.broadcastByBloodType(
          [formData.targetAudience],
          formData.title,
          formData.body,
          formData.type,
          metadata
        )
        setSentCount(result.count || 0)
      } else if (formData.targetAudience === 'all') {
        // Broadcast to all users
        result = await notificationService.broadcast(
          formData.title,
          formData.body,
          formData.type,
          metadata
        )
        setSentCount(result.count || 0)
      } else {
        // Other targeting (donors, recipients)
        result = await notificationService.broadcast(
          formData.title,
          formData.body,
          formData.type,
          { ...metadata, targetAudience: formData.targetAudience }
        )
        setSentCount(result.count || 0)
      }

      setSuccess(true)
      setFormData({
        title: '',
        body: '',
        type: 'general',
        targetAudience: 'all',
        priority: 'normal',
        selectedUserId: ''
      })

      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      console.error('Error sending notification:', err)
      setError(`Failed to send notification: ${err.message || 'Unknown error. Check console for details.'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="send-notification">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Send Notification</h1>
          <p>Send push notifications to E-Donor mobile app users</p>
        </div>
        <div className="header-actions">
          {/* Optional: Add header actions here */}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-box primary">
            {Icons.users}
          </div>
          <div className="stat-content">
            <div className="stat-value">{loadingUsers ? '...' : users.length}</div>
            <div className="stat-label">Active Users</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box success">
            {Icons.bell}
          </div>
          <div className="stat-content">
            <div className="stat-value">28</div>
            <div className="stat-label">Sent Today</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box warning">
            {Icons.droplet}
          </div>
          <div className="stat-content">
            <div className="stat-value">5</div>
            <div className="stat-label">Urgent Alerts</div>
          </div>
        </div>
      </div>

      <div className="notification-content">
        {/* Main Form */}
        <div className="form-card">
          <div className="card-header">
            {Icons.bell}
            <h2>Compose Message</h2>
          </div>

          {success && (
            <div className="message-box success">
              {Icons.check}
              <div>
                <strong>Success!</strong> Notification sent to {sentCount} users.
              </div>
            </div>
          )}

          {error && (
            <div className="message-box error">
              {Icons.alert}
              <div>
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="notification-form">
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Notification Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Urgent Blood Needed: O+"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Message Body</label>
                <textarea
                  name="body"
                  className="form-control"
                  value={formData.body}
                  onChange={handleChange}
                  placeholder="Type your message here..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Target Audience</label>
                <select
                  name="targetAudience"
                  className="form-control"
                  value={formData.targetAudience}
                  onChange={handleChange}
                >
                  <option value="all">All Users</option>
                  <option value="donors">All Donors</option>
                  <option value="specific">Specific User</option>
                  <optgroup label="By Blood Type">
                    <option value="O+">O+ Donors</option>
                    <option value="O-">O- Donors</option>
                    <option value="A+">A+ Donors</option>
                    <option value="A-">A- Donors</option>
                    <option value="B+">B+ Donors</option>
                    <option value="B-">B- Donors</option>
                    <option value="AB+">AB+ Donors</option>
                    <option value="AB-">AB- Donors</option>
                  </optgroup>
                </select>
              </div>

              {formData.targetAudience === 'specific' && (
                <div className="form-group">
                  <label>Select User</label>
                  <select
                    name="selectedUserId"
                    className="form-control"
                    value={formData.selectedUserId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a user...</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.email || 'Unknown User'} ({user.bloodType || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Notification Type</label>
                <select
                  name="type"
                  className="form-control"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="general">General Info</option>
                  <option value="urgent">Urgent Alert</option>
                  <option value="event">Event</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  name="priority"
                  className="form-control"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>Sending...</>
              ) : (
                <>
                  {Icons.send} Send Notification
                </>
              )}
            </button>
          </form>
        </div>

        {/* Templates Sidebar */}
        <div className="templates-section">
          <div className="templates-card">
            <div className="card-header">
              {Icons.menu}
              <h2>Quick Templates</h2>
            </div>
            <div className="templates-list">
              {notificationTemplates.map((template, index) => (
                <div
                  key={index}
                  className="template-item"
                  onClick={() => applyTemplate(template)}
                >
                  <div className="template-header">
                    <span className="template-icon">{template.icon}</span>
                    <span className="template-title">{template.title}</span>
                  </div>
                  <p className="template-body">{template.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SendNotification
