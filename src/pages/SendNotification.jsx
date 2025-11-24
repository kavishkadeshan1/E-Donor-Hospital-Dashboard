import { useState } from 'react'
import { notificationService } from '../services/firebaseService'
import './SendNotification.css'

function SendNotification() {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'general',
    targetAudience: 'all',
    priority: 'normal'
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

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
  }

  const applyTemplate = (template) => {
    setFormData({
      ...formData,
      title: template.title,
      body: template.body,
      type: template.type
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.body) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      if (formData.targetAudience === 'all') {
        await notificationService.broadcast(
          formData.title,
          formData.body,
          formData.type
        )
      } else {
        await notificationService.send({
          title: formData.title,
          body: formData.body,
          type: formData.type,
          targetAudience: formData.targetAudience,
          priority: formData.priority
        })
      }

      setSuccess(true)
      setFormData({
        title: '',
        body: '',
        type: 'general',
        targetAudience: 'all',
        priority: 'normal'
      })

      setTimeout(() => setSuccess(false), 5000)
    } catch (error) {
      console.error('Error sending notification:', error)
      alert('Failed to send notification. Please try again.')
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
                <p>Your message has been delivered to mobile app users.</p>
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
              placeholder="Enter notification message"
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
