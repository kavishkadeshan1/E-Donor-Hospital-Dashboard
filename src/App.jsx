import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import DashboardEnhanced from './pages/DashboardEnhanced'
import DonorList from './pages/DonorList'
import DonorDetails from './pages/DonorDetails'
import AddDonor from './pages/AddDonor'
import BloodRequests from './pages/BloodRequests'
import Inventory from './pages/Inventory'
import HospitalProfile from './pages/HospitalProfile'
import Settings from './pages/Settings'
import SendNotification from './pages/SendNotification'
import Layout from './components/Layout'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('hospitalAdminToken')
    if (token) {
      setIsAuthenticated(true)
    }
    
    // Initialize dark mode from localStorage
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode && JSON.parse(savedDarkMode)) {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('hospitalAdminToken')
    localStorage.removeItem('hospitalAdminData')
    setIsAuthenticated(false)
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
          } 
        />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Routes>
                  <Route path="/dashboard" element={<DashboardEnhanced />} />
                  <Route path="/donors" element={<DonorList />} />
                  <Route path="/donors/:id" element={<DonorDetails />} />
                  <Route path="/donors/add" element={<AddDonor />} />
                  <Route path="/blood-requests" element={<BloodRequests />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/notifications" element={<SendNotification />} />
                  <Route path="/profile" element={<HospitalProfile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  )
}

export default App
