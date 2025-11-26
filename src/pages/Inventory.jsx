import { useState, useEffect } from 'react'
import { inventoryService } from '../services/firebaseService'
import './Inventory.css'

function Inventory() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)

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
        return 'status-good'
      case 'low':
        return 'status-low'
      case 'critical':
        return 'status-critical'
      default:
        return ''
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'good':
        return 'badge-success'
      case 'low':
        return 'badge-warning'
      case 'critical':
        return 'badge-danger'
      default:
        return ''
    }
  }

  const totalUnits = inventory.reduce((sum, item) => sum + item.units, 0)
  const criticalCount = inventory.filter(item => item.status === 'critical').length
  const lowCount = inventory.filter(item => item.status === 'low').length

  return (
    <div className="inventory">
      <div className="page-header">
        <div>
          <h1>Blood Inventory</h1>
          <p>Monitor and manage blood bank inventory levels</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">🩸</div>
          <div className="stat-content">
            <div className="stat-value">{totalUnits}</div>
            <div className="stat-label">Total Units</div>
          </div>
        </div>

        <div className="stat-card stat-danger">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{criticalCount}</div>
            <div className="stat-label">Critical Levels</div>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <div className="stat-value">{lowCount}</div>
            <div className="stat-label">Low Stock</div>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-value">{8 - criticalCount - lowCount}</div>
            <div className="stat-label">Adequate Stock</div>
          </div>
        </div>
      </div>

      <div className="inventory-grid">
        {inventory.map(item => (
          <div key={item.bloodType} className={`inventory-card ${getStatusClass(item.status)}`}>
            <div className="inventory-header">
              <div className="blood-type-large">{item.bloodType}</div>
              <span className={`badge ${getStatusBadge(item.status)}`}>
                {item.status}
              </span>
            </div>
            <div className="inventory-body">
              <div className="units-display">
                <div className="units-number">{item.units}</div>
                <div className="units-label">Units Available</div>
              </div>
              <div className="inventory-details">
                <div className="detail-item">
                  <span className="detail-label">Minimum Required:</span>
                  <span className="detail-value">{item.minRequired} units</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Updated:</span>
                  <span className="detail-value">{item.lastUpdated}</span>
                </div>
              </div>
            </div>
            <div className="inventory-footer">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min((item.units / item.minRequired) * 100, 100)}%`
                  }}
                />
              </div>
              <div className="progress-label">
                {Math.round((item.units / item.minRequired) * 100)}% of minimum requirement
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Inventory
