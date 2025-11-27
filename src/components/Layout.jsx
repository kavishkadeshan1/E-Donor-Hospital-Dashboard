import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icons } from './Icons'
import './Layout.css'

function Layout({ children, onLogout }) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const profileRef = useRef(null)
  const adminData = JSON.parse(localStorage.getItem('hospitalAdminData') || '{}')

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [profileRef])

  const handleLogoutClick = () => {
    setShowProfileMenu(false)
    setShowLogoutConfirm(true)
  }

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false)
    onLogout()
  }

  const menuItems = [
    { path: '/dashboard', icon: Icons.dashboard, label: 'Dashboard' },
    { path: '/donors', icon: Icons.users, label: 'Donors' },
    { path: '/blood-requests', icon: Icons.droplet, label: 'Blood Requests' },
    { path: '/inventory', icon: Icons.package, label: 'Inventory' },
    { path: '/notifications', icon: Icons.bell, label: 'Notifications' },
    { path: '/profile', icon: Icons.hospital, label: 'Hospital Profile' },
    { path: '/settings', icon: Icons.settings, label: 'Settings' }
  ]

  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <img src="/edonor-logo.png" alt="E-Donor" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            {sidebarOpen && <span>E-Donor</span>}
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogoutClick} className="logout-btn">
            <span className="nav-icon">{Icons.logOut}</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="header">
          <button 
            className="toggle-sidebar-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {Icons.menu}
          </button>
          
          <div className="header-right" ref={profileRef}>
            <div 
              className="profile-trigger"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="admin-info">
                <span className="admin-name">{adminData.name || 'Hospital Admin'}</span>
                <span className="admin-role">Administrator</span>
              </div>
              <div className="admin-avatar">
                {(adminData.name || 'H')[0].toUpperCase()}
              </div>
            </div>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    {(adminData.name || 'H')[0].toUpperCase()}
                  </div>
                  <div className="dropdown-user-info">
                    <span className="name">{adminData.name || 'Hospital Admin'}</span>
                    <span className="email">{adminData.email || 'admin@hospital.com'}</span>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <Link to="/profile" className="dropdown-item" onClick={() => setShowProfileMenu(false)}>
                  {Icons.user} Profile
                </Link>
                <Link to="/settings" className="dropdown-item" onClick={() => setShowProfileMenu(false)}>
                  {Icons.settings} Settings
                </Link>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item danger" onClick={handleLogoutClick}>
                  {Icons.logOut} Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="content">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modern-modal" style={{ maxWidth: '400px', padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                background: '#fee2e2', 
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '24px'
              }}>
                {Icons.logOut}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>
                Confirm Logout
              </h3>
              <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
                Are you sure you want to log out of your account?
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="btn-secondary-fill"
                  style={{ flex: 1, padding: '0.75rem', justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmLogout}
                  className="btn-danger-fill"
                  style={{ flex: 1, padding: '0.75rem', justifyContent: 'center' }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Layout
