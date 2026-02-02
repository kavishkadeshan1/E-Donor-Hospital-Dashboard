import { useState } from 'react'
import './Inventory.css'

// Static inventory data
const staticInventory = [
  { id: '1', bloodType: 'O+', units: 100, minRequired: 50, status: 'good', lastUpdated: 'Today, 10:30 AM' },
  { id: '2', bloodType: 'O-', units: 25, minRequired: 30, status: 'low', lastUpdated: 'Today, 09:15 AM' },
  { id: '3', bloodType: 'A+', units: 75, minRequired: 40, status: 'good', lastUpdated: 'Today, 11:00 AM' },
  { id: '4', bloodType: 'A-', units: 15, minRequired: 25, status: 'critical', lastUpdated: 'Yesterday, 04:30 PM' },
  { id: '5', bloodType: 'B+', units: 40, minRequired: 30, status: 'good', lastUpdated: 'Today, 08:45 AM' },
  { id: '6', bloodType: 'B-', units: 10, minRequired: 20, status: 'critical', lastUpdated: 'Yesterday, 02:00 PM' },
  { id: '7', bloodType: 'AB+', units: 35, minRequired: 20, status: 'good', lastUpdated: 'Today, 07:30 AM' },
  { id: '8', bloodType: 'AB-', units: 8, minRequired: 15, status: 'critical', lastUpdated: 'Yesterday, 06:00 PM' }
]

function Inventory() {
  const [inventory] = useState(staticInventory)

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

  const totalUnits = inventory.reduce((sum, item) => sum + item.units, 0)

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Blood Inventory</h1>
          <p>Blood bank stock levels overview</p>
        </div>
        <div className="total-units-badge">
          <span>Total Units: <strong>{totalUnits}</strong></span>
        </div>
      </div>

      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Blood Type</th>
              <th>Units Available</th>
              <th>Min Required</th>
              <th>Status</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id} className={`row-${item.status}`}>
                <td>
                  <span className="blood-type-cell">{item.bloodType}</span>
                </td>
                <td className="units-cell">{item.units}</td>
                <td>{item.minRequired}</td>
                <td>
                  <span className={`status-badge ${item.status}`}>
                    {getStatusLabel(item.status)}
                  </span>
                </td>
                <td className="date-cell">{item.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Inventory
