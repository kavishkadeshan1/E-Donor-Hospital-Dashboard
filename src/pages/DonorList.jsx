import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './DonorList.css'

function DonorList() {
  const [donors, setDonors] = useState([])
  const [filteredDonors, setFilteredDonors] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBloodType, setFilterBloodType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    // Simulate API call - Replace with actual API
    const mockDonors = [
      { id: 1, name: 'John Smith', email: 'john@example.com', phone: '555-0101', bloodType: 'O+', status: 'active', lastDonation: '2025-11-15', totalDonations: 5 },
      { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', phone: '555-0102', bloodType: 'A+', status: 'active', lastDonation: '2025-11-20', totalDonations: 3 },
      { id: 3, name: 'Michael Brown', email: 'michael@example.com', phone: '555-0103', bloodType: 'B+', status: 'active', lastDonation: '2025-10-10', totalDonations: 8 },
      { id: 4, name: 'Emily Davis', email: 'emily@example.com', phone: '555-0104', bloodType: 'AB+', status: 'inactive', lastDonation: '2025-08-05', totalDonations: 2 },
      { id: 5, name: 'James Wilson', email: 'james@example.com', phone: '555-0105', bloodType: 'O-', status: 'active', lastDonation: '2025-11-18', totalDonations: 12 },
      { id: 6, name: 'Linda Martinez', email: 'linda@example.com', phone: '555-0106', bloodType: 'A-', status: 'active', lastDonation: '2025-11-10', totalDonations: 4 },
      { id: 7, name: 'David Anderson', email: 'david@example.com', phone: '555-0107', bloodType: 'B-', status: 'active', lastDonation: '2025-09-22', totalDonations: 6 },
      { id: 8, name: 'Jennifer Taylor', email: 'jennifer@example.com', phone: '555-0108', bloodType: 'AB-', status: 'inactive', lastDonation: '2025-07-30', totalDonations: 1 }
    ]
    setDonors(mockDonors)
    setFilteredDonors(mockDonors)
  }, [])

  useEffect(() => {
    let filtered = donors

    if (searchTerm) {
      filtered = filtered.filter(donor =>
        donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.phone.includes(searchTerm)
      )
    }

    if (filterBloodType !== 'all') {
      filtered = filtered.filter(donor => donor.bloodType === filterBloodType)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(donor => donor.status === filterStatus)
    }

    setFilteredDonors(filtered)
  }, [searchTerm, filterBloodType, filterStatus, donors])

  return (
    <div className="donor-list">
      <div className="page-header">
        <div>
          <h1>Donor Management</h1>
          <p>Manage and track all registered blood donors</p>
        </div>
        <Link to="/donors/add" className="btn btn-primary">
          + Add New Donor
        </Link>
      </div>

      <div className="card filters-card">
        <div className="filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search donors by name, email, or phone..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <select
              className="form-select"
              value={filterBloodType}
              onChange={(e) => setFilterBloodType(e.target.value)}
            >
              <option value="all">All Blood Types</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>

            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-header">
          <h3>Total Donors: {filteredDonors.length}</h3>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Blood Type</th>
              <th>Status</th>
              <th>Last Donation</th>
              <th>Total Donations</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDonors.map(donor => (
              <tr key={donor.id}>
                <td>
                  <div className="donor-name">{donor.name}</div>
                </td>
                <td>
                  <div className="contact-info">
                    <div>{donor.email}</div>
                    <div className="phone">{donor.phone}</div>
                  </div>
                </td>
                <td>
                  <span className="blood-type">{donor.bloodType}</span>
                </td>
                <td>
                  <span className={`badge badge-${donor.status === 'active' ? 'success' : 'warning'}`}>
                    {donor.status}
                  </span>
                </td>
                <td>{donor.lastDonation}</td>
                <td>{donor.totalDonations}</td>
                <td>
                  <Link to={`/donors/${donor.id}`} className="btn-action">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredDonors.length === 0 && (
          <div className="no-results">
            <p>No donors found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DonorList
