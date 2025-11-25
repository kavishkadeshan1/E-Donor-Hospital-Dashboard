import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import './Login.css'

import { hospitalService } from '../services/firebaseService'
import { auth, isConfigured } from '../lib/firebase'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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

      if (isConfigured && auth) {
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
      } else {
        // Demo fallback when Firebase is not configured
        hospital = await hospitalService.getByEmail(formData.email.trim())
        if (!hospital) {
          setError('Demo login failed. Use a known hospital email.')
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
        <div className="login-header">
          <div className="logo">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="8" fill="#dc2626"/>
              <path d="M24 14V34M14 24H34" stroke="white" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </div>
          <h1>E-Donor Hospital Admin</h1>
          <p>Sign in to manage blood donation system</p>
          {!isConfigured && (
            <p className="error-message" style={{ marginTop: '8px' }}>
              Firebase is not configured. Add your keys to .env to enable login.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="hospital email in Firestore"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {!isConfigured && (
            <div className="demo-credentials">
              <p><strong>Demo Mode:</strong></p>
              <p>Any email/password works while Firebase is not configured.</p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default Login
