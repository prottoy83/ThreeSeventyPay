import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

export default function Signup() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [nid, setNID] = useState('')
  const [dob, setDob] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!firstName || !email || !password || !phone || !nid || !dob) {
      setError('Please fill out required fields.')
      return
    }
    try {
      const response = await axios.post('http://localhost:5990/auth/signup', {
        nid,
        fname: firstName,
        lname: lastName,
        email,
        phone,
        dob,
        pass: password
      })
      
      if (response.status === 201) {
        localStorage.setItem('user', JSON.stringify({ firstName, lastName, email, phone, nid, dob }))
        window.dispatchEvent(new Event('storage'))
        navigate('/dashboard')
      }
    } catch (err: any) {
      console.error('Signup error:', err)
      if (err.response?.status === 409) {
        setError('This email is already registered. Please log in instead.')
      } else if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else if (err.code === 'ECONNREFUSED') {
        setError('Cannot connect to server. Please ensure the server is running.')
      } else {
        setError('An error occurred during signup. Please try again.')
      }
      
    }
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 520 }}>
        <div className="auth-card">
          <h2 className="section-title">Create your account</h2>
          <p className="section-sub">Start accepting payments in minutes.</p>
          {error && (
            <div style={{ marginBottom: 12, color: 'var(--danger)' }}>{error}</div>
          )}
          <form onSubmit={onSubmit}>
            <div className="field-grid">
              <div className="field">
                <label>First name</label>
                <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Linus" />
              </div>
              <div className="field">
                <label>Last name</label>
                <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Torvalds" />
              </div>
            </div>
            <div className="field">
              <label>Email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
            </div>
            <div className="field">
              <label>Phone</label>
              <input className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+880 1712345678" />
            </div>
            <div className="field">
              <label>National ID</label>
              <input className="input" type="text" value={nid} onChange={(e) => setNID(e.target.value)} placeholder="44000000000" />
            </div>
            <div className="field">
              <label>Date of Birth</label>
              <input className="input" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>
            <div className="field">
              <label>Password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit">Sign Up</button>
              <Link to="/login" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Log in</Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
