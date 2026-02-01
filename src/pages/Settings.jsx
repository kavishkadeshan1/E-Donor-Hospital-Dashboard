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
  const [activeTab, setActiveTab] = useState('general')
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

  const tabs = [
    { id: 'general', label: 'General', icon: Icons.settings, description: 'Display & Preferences' },
    { id: 'notifications', label: 'Notifications', icon: Icons.bell, description: 'Alerts & Emails' },
    { id: 'security', label: 'Security', icon: Icons.user, description: 'Password & Auth' },
    { id: 'system', label: 'System', icon: Icons.activity, description: 'Maintenance & Logs' }
  ]

  return (
    <div className="settings-page">
      <div className="settings-header-section">
        <div className="header-content">
          <h1>Settings</h1>
          <p>Manage your dashboard preferences and account security</p>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-sidebar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className="tab-icon-wrapper">{tab.icon}</div>
              <div className="tab-info">
                <span className="tab-label">{tab.label}</span>
                <span className="tab-desc">{tab.description}</span>
              </div>
              {activeTab === tab.id && <div className="active-indicator" />}
            </button>
          ))}
        </div>

        <div className="settings-content-area">
          {activeTab === 'general' && (
            <div className="settings-section fade-in">
              <div className="section-header">
                <h2>General Settings</h2>
                <p>Customize your dashboard experience</p>
              </div>

              <div className="settings-card">
                <div className="setting-row">
                  <div className="setting-details">
                    <div className="setting-icon-box purple">
                      {Icons.zap}
                    </div>
                    <div className="setting-text">
                      <h3>Dark Mode</h3>
                      <p>Switch between light and dark themes</p>
                    </div>
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
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section fade-in">
              <div className="section-header">
                <h2>Notification Preferences</h2>
                <p>Control how you receive updates</p>
              </div>

              <div className="settings-card">
                <div className="setting-row">
                  <div className="setting-details">
                    <div className="setting-icon-box blue">
                      {Icons.inbox}
                    </div>
                    <div className="setting-text">
                      <h3>Email Notifications</h3>
                      <p>Receive updates via email</p>
                    </div>
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

                <div className="divider" />

                <div className="setting-row">
                  <div className="setting-details">
                    <div className="setting-icon-box green">
                      {Icons.smartphone}
                    </div>
                    <div className="setting-text">
                      <h3>SMS Notifications</h3>
                      <p>Receive updates via SMS</p>
                    </div>
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

                <div className="divider" />

                <div className="setting-row">
                  <div className="setting-details">
                    <div className="setting-icon-box red">
                      {Icons.alertTriangle}
                    </div>
                    <div className="setting-text">
                      <h3>Urgent Alerts</h3>
                      <p>Get notified immediately for urgent requests</p>
                    </div>
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

                <div className="divider" />

                <div className="setting-row">
                  <div className="setting-details">
                    <div className="setting-icon-box orange">
                      {Icons.barChart}
                    </div>
                    <div className="setting-text">
                      <h3>Weekly Reports</h3>
                      <p>Receive weekly summary reports</p>
                    </div>
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

                <div className="divider" />

                <div className="setting-row">
                  <div className="setting-details">
                    <div className="setting-icon-box teal">
                      {Icons.clock}
                    </div>
                    <div className="setting-text">
                      <h3>Donor Reminders</h3>
                      <p>Automatically send reminders to donors</p>
                    </div>
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
          )}

          {activeTab === 'security' && (
            <div className="settings-section fade-in">
              <div className="section-header">
                <h2>Security Settings</h2>
                <p>Manage your password and account security</p>
              </div>

              <div className="settings-card">
                <h3>Change Password</h3>
                <form onSubmit={handlePasswordSubmit} className="password-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <div className="input-wrapper">
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>New Password</label>
                      <div className="input-wrapper">
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter new password"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <div className="input-wrapper">
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Confirm new password"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {passwordError && (
                    <div className="alert error">
                      {Icons.alertCircle}
                      <span>{passwordError}</span>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="alert success">
                      {Icons.checkCircle}
                      <span>{passwordSuccess}</span>
                    </div>
                  )}

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="settings-section fade-in">
              <div className="section-header">
                <h2>System Settings</h2>
                <p>Manage system-wide configurations</p>
              </div>

              <div className="settings-card">
                <div className="setting-row">
                  <div className="setting-details">
                    <div className="setting-icon-box blue">
                      {Icons.checkCircle}
                    </div>
                    <div className="setting-text">
                      <h3>Auto-Approve Requestss</h3>
                      <p>Automatically approve blood requests from verified hospitals</p>
                    </div>
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

                <div className="divider" />

                <div className="setting-row">
                  <div className="setting-details">
                    <div className="setting-icon-box red">
                      {Icons.activity}
                    </div>
                    <div className="setting-text">
                      <h3>Maintenance Mode</h3>
                      <p>Temporarily disable the dashboard for maintenance</p>
                    </div>
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
