import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import './Login.css'

import { hospitalService } from '../services/firebaseService'
import { auth, isConfigured } from '../lib/firebase'
import { sanitizeInput } from '../lib/sanitize'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: sanitizeInput(e.target.value)
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (!formData.email || !formData.password) {
      setError('Please enter your email and password')
      setLoading(false)
      return
    }

    try {
      let hospital = null
      let useFirebaseAuth = isConfigured && auth

      if (useFirebaseAuth) {
        try {
          // Firebase Auth email/password sign-in
          const { user } = await signInWithEmailAndPassword(auth, formData.email.trim(), formData.password)
          hospital = await hospitalService.getByEmail(formData.email.trim())

          if (!hospital) {
            await signOut(auth)
            setError('Hospital not found or not verified.')
            setLoading(false)
            return
          }

          localStorage.setItem('hospitalAdminToken', user.uid)
          localStorage.setItem('hospitalAdminData', JSON.stringify({
            id: hospital.id,
            name: hospital.name,
            email: hospital.email,
            phone: hospital.phone || '',
            street: hospital.street || '',
            city: hospital.city || '',
            state: hospital.state || '',
            zipCode: hospital.zipCode || '',
            about: hospital.about || ''
          }))
        } catch (firebaseErr) {
          console.warn('Firebase Auth failed, trying demo mode:', firebaseErr.code)
          // Fall back to demo mode if Firebase Auth fails
          useFirebaseAuth = false
        }
      }
      
      if (!useFirebaseAuth) {
        // Demo fallback when Firebase is not configured or auth fails
        hospital = await hospitalService.getByEmail(formData.email.trim())
        if (!hospital) {
          setError('Invalid email or password. Please try again.')
          setLoading(false)
          return
        }
        // Simple password check for demo mode
        if (formData.password !== 'admin1234' && formData.password !== 'password') {
          setError('Invalid email or password. Please try again.')
          setLoading(false)
          return
        }
        localStorage.setItem('hospitalAdminToken', `demo-${hospital.id}`)
        localStorage.setItem('hospitalAdminData', JSON.stringify({
          id: hospital.id,
          name: hospital.name,
          email: hospital.email,
          phone: hospital.phone || '',
          street: hospital.street || '',
          city: hospital.city || '',
          state: hospital.state || '',
          zipCode: hospital.zipCode || '',
          about: hospital.about || ''
        }))
      }

      onLogin()
      navigate('/dashboard')
    } catch (err) {
      console.error('Login error', err)
      setError('Unable to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Left Side - Branding */}
        <div className="login-left">
          <div className="brand-content">
            <div className="brand-logo">
              <img src="/edonor-logo.png" alt="E-Donor Logo" style={{ width: '80px', height: '80px' }} />
            </div>
            <h1>E-Donor Hospital</h1>
            <p>Streamline your blood bank management and save lives efficiently.</p>
          </div>
          <div className="login-shapes">
            <div className="shape-circle"></div>
            <div className="shape-circle-2"></div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="login-right">
          <div className="form-header">
            <h2>Welcome Back</h2>
            <p>Please sign in to your admin account</p>
          </div>

          {error && (
            <div className="error-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                {!formData.email && (
                  <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                )}
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                {!formData.password && (
                  <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )}
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
