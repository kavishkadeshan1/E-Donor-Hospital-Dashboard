import { useState, useEffect } from 'react'
import { inventoryService } from '../services/firebaseService'
import { Icons } from '../components/Icons'
import './Inventory.css'

function Inventory() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    const unsubscribe = inventoryService.subscribe((data) => {
      setInventory(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const getStatusClass = (status) => {
    switch (status) {
      case 'good':
        return 'good'
      case 'low':
        return 'low'
      case 'critical':
        return 'critical'
      default:
        return ''
    }
  }

  const totalUnits = inventory.reduce((sum, item) => sum + item.units, 0)
  const criticalCount = inventory.filter(item => item.status === 'critical').length
  const lowCount = inventory.filter(item => item.status === 'low').length

  const getStatusLabel = (status) => {
    switch (status) {
      case 'good':
        return 'Adequate'
      case 'low':
        return 'Low Stock'
      case 'critical':
        return 'Critical'
      default:
        return status
    }
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.bloodType.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Blood Inventory</h1>
          <p>Real-time monitoring of blood bank stock levels</p>
        </div>
        <button className="btn-primary">
          {Icons.plus}
          <span>Add Stock</span>
        </button>
      </div>

      <div className="stats-overview">
        <div className="stat-card total">
          <div className="stat-icon-wrapper">{Icons.droplet}</div>
          <div className="stat-info">
            <span className="stat-label">Total Units</span>
            <span className="stat-value">{totalUnits}</span>
          </div>
          <div className="stat-trend positive">
            {Icons.trendingUp}
            <span>+12% this week</span>
          </div>
        </div>

        <div className="stat-card critical">
          <div className="stat-icon-wrapper">{Icons.alertTriangle}</div>
          <div className="stat-info">
            <span className="stat-label">Critical Alerts</span>
            <span className="stat-value">{criticalCount}</span>
          </div>
          <div className="stat-trend negative">
            <span>Action Required</span>
          </div>
        </div>

        <div className="stat-card low">
          <div className="stat-icon-wrapper">{Icons.clock}</div>
          <div className="stat-info">
            <span className="stat-label">Low Stock</span>
            <span className="stat-value">{lowCount}</span>
          </div>
          <div className="stat-trend warning">
            <span>Restock Soon</span>
          </div>
        </div>

        <div className="stat-card good">
          <div className="stat-icon-wrapper">{Icons.checkCircle}</div>
          <div className="stat-info">
            <span className="stat-label">Healthy Stock</span>
            <span className="stat-value">{8 - criticalCount - lowCount}</span>
          </div>
          <div className="stat-trend positive">
            <span>Optimal Levels</span>
          </div>
        </div>
      </div>

      <div className="inventory-controls">
        <div className="search-bar">
          {Icons.search}
          <input 
            type="text" 
            placeholder="Search blood type..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'critical' ? 'active' : ''}`}
            onClick={() => setFilterStatus('critical')}
          >
            Critical
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'low' ? 'active' : ''}`}
            onClick={() => setFilterStatus('low')}
          >
            Low
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'good' ? 'active' : ''}`}
            onClick={() => setFilterStatus('good')}
          >
            Good
          </button>
        </div>
      </div>

      <div className="inventory-grid">
        {filteredInventory.map(item => (
          <div key={item.bloodType} className={`blood-card ${getStatusClass(item.status)}`}>
            <div className="card-header">
              <div className="blood-type-badge">
                <span className="blood-type">{item.bloodType}</span>
              </div>
              <div className={`status-pill ${item.status}`}>
                {getStatusLabel(item.status)}
              </div>
            </div>
            
            <div className="card-body">
              <div className="stock-level">
                <span className="current-units">{item.units}</span>
                <span className="unit-label">Units Available</span>
              </div>
              
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${Math.min((item.units / item.minRequired) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  <span>{Math.round((item.units / item.minRequired) * 100)}% Capacity</span>
                  <span>Min: {item.minRequired}</span>
                </div>
              </div>

              <div className="card-meta">
                <div className="meta-item">
                  <span className="meta-label">Last Updated</span>
                  <span className="meta-value">{item.lastUpdated}</span>
                </div>
              </div>
            </div>

            <div className="card-actions">
              <button className="action-btn secondary">Update</button>
              <button className="action-btn primary">Request</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Inventory
