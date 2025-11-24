import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

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
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    // Simulate API call - Replace with actual API endpoint
    setTimeout(() => {
      // Demo credentials
      if (formData.email === 'admin@hospital.com' && formData.password === 'admin123') {
        const adminData = {
          id: 1,
          name: 'City General Hospital',
          email: formData.email,
          role: 'admin'
        }
        
        localStorage.setItem('hospitalAdminToken', 'demo-token-123')
        localStorage.setItem('hospitalAdminData', JSON.stringify(adminData))
        
        onLogin()
        navigate('/dashboard')
      } else {
        setError('Invalid email or password')
      }
      setLoading(false)
    }, 1000)
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
              placeholder="admin@hospital.com"
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

          <div className="demo-credentials">
            <p><strong>Demo Credentials:</strong></p>
            <p>Email: admin@hospital.com</p>
            <p>Password: admin123</p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
