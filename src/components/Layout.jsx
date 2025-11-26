import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icons } from './Icons'
import './Layout.css'

function Layout({ children, onLogout }) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const adminData = JSON.parse(localStorage.getItem('hospitalAdminData') || '{}')

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
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="8" fill="#dc2626"/>
              <path d="M24 14V34M14 24H34" stroke="white" strokeWidth="4" strokeLinecap="round"/>
            </svg>
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
          <button onClick={onLogout} className="logout-btn">
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
          
          <div className="header-right">
            <div className="admin-info">
              <span className="admin-name">{adminData.name || 'Hospital Admin'}</span>
              <span className="admin-role">Administrator</span>
            </div>
            <div className="admin-avatar">
              {(adminData.name || 'H')[0].toUpperCase()}
            </div>
          </div>
        </header>

        <main className="content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
