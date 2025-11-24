import { useState } from 'react'
import './Settings.css'

function Settings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    urgentAlerts: true,
    weeklyReports: true,
    donorReminders: true,
    autoApproveRequests: false,
    maintenanceMode: false
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleSettingChange = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting]
    })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    alert('Password changed successfully!')
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  const handleSaveSettings = () => {
    alert('Settings saved successfully!')
  }

  return (
    <div className="settings">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage application settings and preferences</p>
        </div>
      </div>

      <div className="card">
        <h3>Notification Settings</h3>
        <div className="settings-list">
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">Email Notifications</div>
              <div className="setting-description">Receive email notifications for important updates</div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => handleSettingChange('emailNotifications')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">SMS Notifications</div>
              <div className="setting-description">Receive SMS alerts for urgent matters</div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={() => handleSettingChange('smsNotifications')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">Urgent Alerts</div>
              <div className="setting-description">Get notified about critical blood requests</div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.urgentAlerts}
                onChange={() => handleSettingChange('urgentAlerts')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">Weekly Reports</div>
              <div className="setting-description">Receive weekly summary reports</div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.weeklyReports}
                onChange={() => handleSettingChange('weeklyReports')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">Donor Reminders</div>
              <div className="setting-description">Send automatic reminders to donors</div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.donorReminders}
                onChange={() => handleSettingChange('donorReminders')}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>System Settings</h3>
        <div className="settings-list">
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">Auto-Approve Requests</div>
              <div className="setting-description">Automatically approve non-urgent blood requests</div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.autoApproveRequests}
                onChange={() => handleSettingChange('autoApproveRequests')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">Maintenance Mode</div>
              <div className="setting-description">Enable maintenance mode for system updates</div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={() => handleSettingChange('maintenanceMode')}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button onClick={handleSaveSettings} className="btn btn-primary">
            Save Settings
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Change Password</h3>
        <form onSubmit={handlePasswordSubmit} className="password-form">
          <div className="form-group">
            <label htmlFor="currentPassword" className="form-label">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              className="form-input"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              className="form-input"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-input"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Settings
