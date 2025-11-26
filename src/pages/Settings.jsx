import { useState, useEffect } from 'react'
import { auth, isConfigured } from '../lib/firebase'
import { 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  updatePassword 
} from 'firebase/auth'
import { Icons } from '../components/Icons'
import './Settings.css'

function Settings() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    urgentAlerts: true,
    weeklyReports: true,
    donorReminders: true,
    autoApproveRequests: false,
    maintenanceMode: false
  })

  // Apply dark mode on mount and when changed
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode)
  }

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

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
    // Clear messages when user starts typing
    setPasswordError('')
    setPasswordSuccess('')
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match!')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long')
      return
    }

    if (!isConfigured) {
      setPasswordError('Firebase is not configured. Please set up Firebase credentials.')
      return
    }

    const user = auth.currentUser
    if (!user) {
      setPasswordError('No user is currently logged in. Please log in again.')
      return
    }

    setPasswordLoading(true)

    try {
      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordData.currentPassword
      )
      
      await reauthenticateWithCredential(user, credential)
      
      // Update to new password
      await updatePassword(user, passwordData.newPassword)
      
      setPasswordSuccess('Password changed successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Password change error:', error)
      
      switch (error.code) {
        case 'auth/wrong-password':
          setPasswordError('Current password is incorrect')
          break
        case 'auth/invalid-credential':
          setPasswordError('Current password is incorrect')
          break
        case 'auth/too-many-requests':
          setPasswordError('Too many failed attempts. Please try again later.')
          break
        case 'auth/requires-recent-login':
          setPasswordError('Please log out and log in again before changing your password')
          break
        case 'auth/weak-password':
          setPasswordError('New password is too weak. Please choose a stronger password.')
          break
        default:
          setPasswordError(error.message || 'Failed to change password. Please try again.')
      }
    } finally {
      setPasswordLoading(false)
    }
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
        <h3>🎨 Appearance</h3>
        <div className="settings-list">
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">Dark Mode</div>
              <div className="setting-description">Switch between light and dark theme for comfortable viewing</div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={handleDarkModeToggle}
              />
              <span className="slider"></span>
            </label>
          </div>
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
          {passwordError && (
            <div className="alert alert-error">
              <span className="alert-icon">{Icons.alertTriangle}</span>
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="alert alert-success">
              <span className="alert-icon">{Icons.check}</span>
              {passwordSuccess}
            </div>
          )}
          
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
              disabled={passwordLoading}
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
              disabled={passwordLoading}
              minLength={6}
            />
            <span className="form-hint">Password must be at least 6 characters</span>
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
              disabled={passwordLoading}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Settings
