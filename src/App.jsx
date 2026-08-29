import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import './App.css'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nxvxnjkxlsslxfpieylp.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54dnhuamt4bHNzbHhmcGlleWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMTI5MDIsImV4cCI6MjEwMzU4ODkwMn0.dLnCGdG-caY6ZnXUzXumGceYSFiWncTZ5V_ihaz6GYo'
const supabase = createClient(supabaseUrl, supabaseKey)

export default function App() {
  const [tickets, setTickets] = useState([])
  const [driverName, setDriverName] = useState('')
  const [violation, setViolation] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [])

  async function fetchTickets() {
    const { data } = await supabase.from('tickets').select('*').order('id', { ascending: false })
    if (data) setTickets(data)
  }

  async function createTicket(e) {
    e.preventDefault()
    if (!driverName.trim() || !violation.trim()) return

    setLoading(true)
    await supabase.from('tickets').insert([{ driver_name: driverName, violation }])
    setDriverName('')
    setViolation('')
    setLoading(false)
    fetchTickets()
  }

  async function updateTicket(id, currentViolation) {
    const newViolation = prompt("Update violation details:", currentViolation)
    if (!newViolation || newViolation === currentViolation) return
    
    await supabase.from('tickets').update({ violation: newViolation }).eq('id', id)
    fetchTickets()
  }

  async function deleteTicket(id) {
    if (!confirm("Are you sure you want to delete this citation record?")) return
    await supabase.from('tickets').delete().eq('id', id)
    fetchTickets()
  }

  return (
    <div className="dashboard-container">
      {/* Header Bar */}
      <header className="header">
        <h1>
          CRIVO Traffic Admin
          <span className="badge">Supabase Live</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>LGU San Guillermo</p>
      </header>

      {/* New Citation Form */}
      <section className="card">
        <h2 className="card-title">Issue New Citation</h2>
        <form onSubmit={createTicket} className="form-grid">
          <input 
            className="input-field"
            placeholder="Driver Full Name" 
            value={driverName} 
            onChange={(e) => setDriverName(e.target.value)} 
            required 
          />
          <input 
            className="input-field"
            placeholder="Violation Type (e.g. No Helmet)" 
            value={violation} 
            onChange={(e) => setViolation(e.target.value)} 
            required 
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : '+ Issue Ticket'}
          </button>
        </form>
      </section>

      {/* Citations Data Table */}
      <section className="card">
        <h2 className="card-title">Recent Traffic Citations ({tickets.length})</h2>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Driver Name</th>
                <th>Violation</th>
                <th style={{ width: '160px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-state">No citation records found. Create one above!</td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td style={{ fontWeight: '600', color: '#64748b' }}>#{ticket.id}</td>
                    <td style={{ fontWeight: '500' }}>{ticket.driver_name}</td>
                    <td>
                      <span style={{ 
                        background: '#f1f5f9', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        fontSize: '0.875rem' 
                      }}>
                        {ticket.violation}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => updateTicket(ticket.id, ticket.violation)} className="btn btn-edit">Edit</button>
                      <button onClick={() => deleteTicket(ticket.id)} className="btn btn-delete">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}