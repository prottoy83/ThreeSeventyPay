import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email || !password) {
      setError('Please enter email and password.')
      return
    }
    try {
      const response = await axios.post('http://localhost:5990/auth/login', {
        email,
        pass: password
      })
      
      if (response.status === 200) {
        const { fname, lname, uid } = response.data
        localStorage.setItem('user', JSON.stringify({ 
          firstName: fname, 
          lastName: lname,
          uid,
          email 
        }))
        window.dispatchEvent(new Event('storage'))
        navigate('/dashboard')
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Invalid email or password. Please try again.')
      } else if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else if (err.code === 'ECONNREFUSED') {
        setError('Cannot connect to server. Please ensure the server is running.')
      } else {
        setError('An error occurred during login. Please try again.')
      }
      console.error('Login error:', err)
    }
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 520 }}>
        <div className="auth-card">
          <h2 className="section-title">Welcome back</h2>
          <p className="section-sub">Log in to your ThreeSeventyPay account.</p>
          {error && (
            <div style={{ marginBottom: 12, color: 'var(--danger)' }}>{error}</div>
          )}
          <form onSubmit={onSubmit}>
            <div className="field">
              <label>Email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
            </div>
            <div className="field">
              <label>Password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit">Log In</button>
              <Link to="/signup" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Create account</Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
