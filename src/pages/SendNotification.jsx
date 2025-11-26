import { useState, useEffect } from 'react'
import { notificationService } from '../services/firebaseService'
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
      icon: '🚨'
    },
    { 
      title: 'Blood Drive Event', 
      body: 'Join our blood drive event this weekend at City Hall from 9 AM to 5 PM.', 
      type: 'event',
      icon: '📅'
    },
    { 
      title: 'Donation Reminder', 
      body: 'It\'s been 3 months since your last donation. You\'re eligible to donate again!', 
      type: 'reminder',
      icon: '⏰'
    },
    { 
      title: 'Thank You for Donating', 
      body: 'Thank you for your recent donation. You\'ve helped save lives in our community!', 
      type: 'general',
      icon: '❤️'
    }
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
      <div className="page-header">
        <div>
          <h1>Send Notification</h1>
          <p>Send push notifications to E-Donor mobile app users</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">📱</div>
          <div className="stat-content">
            <div className="stat-value">1,245</div>
            <div className="stat-label">Active Users</div>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">📤</div>
          <div className="stat-content">
            <div className="stat-value">28</div>
            <div className="stat-label">Sent Today</div>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-value">4</div>
            <div className="stat-label">Quick Templates</div>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">87%</div>
            <div className="stat-label">Open Rate</div>
          </div>
        </div>
      </div>

      {/* Quick Templates */}
      <div className="card">
        <h3>⚡ Quick Templates</h3>
        <div className="templates-grid">
          {notificationTemplates.map((template, index) => (
            <button
              key={index}
              className="template-card"
              onClick={() => applyTemplate(template)}
              type="button"
            >
              <span className="template-icon-large">{template.icon}</span>
              <div className="template-title">{template.title}</div>
              <div className="template-type">{template.type}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Notification Form */}
      <div className="card">
        <h3>📝 Create Notification</h3>
        
        <form onSubmit={handleSubmit} className="notification-form">
          {success && (
            <div className="success-message">
              <span className="success-icon">✅</span>
              <div>
                <strong>Notification Sent Successfully!</strong>
                <p>
                  {sentCount > 0 
                    ? `Your message has been delivered to ${sentCount} mobile app user${sentCount !== 1 ? 's' : ''}.`
                    : 'Notification created! Check Firebase userNotifications collection.'
                  }
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <div>
                <strong>Error</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Notification Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-input"
                placeholder="Enter notification title"
                value={formData.title}
                onChange={handleChange}
                maxLength={50}
                required
              />
              <div className="char-count">{formData.title.length} / 50 characters</div>
            </div>

            <div className="form-group">
              <label htmlFor="type">Notification Type</label>
              <select
                id="type"
                name="type"
                className="form-select"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="general">📢 General</option>
                <option value="urgent">🚨 Urgent</option>
                <option value="reminder">⏰ Reminder</option>
                <option value="event">📅 Event</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="body">Message *</label>
            <textarea
              id="body"
              name="body"
              className="form-textarea"
              rows="5"
              placeholder="Enter notification message (e.g., Critical shortage of O+. Please donate if you can.)"
              value={formData.body}
              onChange={handleChange}
              maxLength={200}
              required
            />
            <div className="char-count">{formData.body.length} / 200 characters</div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="targetAudience">Target Audience</label>
              <select
                id="targetAudience"
                name="targetAudience"
                className="form-select"
                value={formData.targetAudience}
                onChange={handleChange}
              >
                <option value="all">👥 All Users</option>
                <option value="specific">👤 Specific User</option>
                <option value="donors">🩸 Active Donors Only</option>
                <option value="recipients">🏥 Recipients Only</option>
                <optgroup label="By Blood Type">
                  <option value="O+">O+ Blood Type</option>
                  <option value="O-">O- Blood Type</option>
                  <option value="A+">A+ Blood Type</option>
                  <option value="A-">A- Blood Type</option>
                  <option value="B+">B+ Blood Type</option>
                  <option value="B-">B- Blood Type</option>
                  <option value="AB+">AB+ Blood Type</option>
                  <option value="AB-">AB- Blood Type</option>
                </optgroup>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority Level</label>
              <select
                id="priority"
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="normal">🔵 Normal</option>
                <option value="high">🟠 High</option>
                <option value="critical">🔴 Critical</option>
              </select>
            </div>
          </div>

          {formData.targetAudience === 'specific' && (
            <div className="form-group">
              <label htmlFor="selectedUserId">Select User or Enter User ID *</label>
              {users.length > 0 ? (
                <select
                  id="selectedUserId"
                  name="selectedUserId"
                  className="form-select"
                  value={formData.selectedUserId}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select a user --</option>
                  {loadingUsers ? (
                    <option disabled>Loading users...</option>
                  ) : (
                    users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.email || user.id} {user.bloodType ? `(${user.bloodType})` : ''}
                      </option>
                    ))
                  )}
                </select>
              ) : (
                <input
                  type="text"
                  id="selectedUserId"
                  name="selectedUserId"
                  className="form-input"
                  placeholder="Enter user ID (e.g., Ht4CpYq4m3erygskPseZGkDw5Ws1)"
                  value={formData.selectedUserId}
                  onChange={handleChange}
                  required
                />
              )}
              <div className="form-hint">
                {users.length === 0 && 'No users found in database. Enter the user ID manually from Firebase.'}
                {users.length > 0 && `User ID: ${formData.selectedUserId || 'Select a user above'}`}
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-large"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Sending Notification...
              </>
            ) : (
              <>
                📤 Send Notification
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SendNotification
