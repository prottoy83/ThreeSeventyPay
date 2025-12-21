import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type User = {
  firstName?: string
  lastName?: string
  email?: string
  uid?: string
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      if (raw) {
        setUser(JSON.parse(raw))
      } else {
        navigate('/login')
      }
    } catch {
      navigate('/login')
    }
  }, [navigate])

  if (!user) return null

  const cards = [
    { last4: '4242', brand: 'Visa', expiry: '12/26', status: 'Active' },
    { last4: '8888', brand: 'Mastercard', expiry: '09/27', status: 'Active' },
    { last4: '5555', brand: 'Amex', expiry: '03/25', status: 'Frozen' },
  ]

  const expenses = [
    { id: 1, merchant: 'Amazon', amount: 124.99, date: '2025-12-20', category: 'Shopping' },
    { id: 2, merchant: 'Netflix', amount: 15.99, date: '2025-12-19', category: 'Entertainment' },
    { id: 3, merchant: 'Uber', amount: 32.50, date: '2025-12-18', category: 'Transport' },
    { id: 4, merchant: 'Starbucks', amount: 8.45, date: '2025-12-17', category: 'Food' },
    { id: 5, merchant: 'Target', amount: 67.23, date: '2025-12-16', category: 'Shopping' },
  ]

  const predictions = [
    { category: 'Shopping', predicted: 450, trend: '+12%' },
    { category: 'Food & Dining', predicted: 320, trend: '-5%' },
    { category: 'Transportation', predicted: 180, trend: '+8%' },
  ]

  return (
    <section className="section">
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>
            Welcome back, {user.firstName}!
          </h1>
          <p className="section-sub" style={{ marginBottom: 0 }}>{user.email}</p>
        </div>

        {/* Balance Card */}
        <div className="dashboard-balance">
          <div>
            <p style={{ color: 'var(--muted)', marginBottom: 8 }}>Total Balance</p>
            <h2 style={{ fontSize: 36, margin: 0 }}>$12,487.52</h2>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary">Send Money</button>
            <button className="btn btn-secondary">Request</button>
          </div>
        </div>

        {/* Cards Section */}
        <div style={{ marginTop: 32 }}>
          <h3 className="section-title">Your Cards</h3>
          <div className="dashboard-grid">
            {cards.map((card, i) => (
              <div key={i} className="dashboard-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 4 }}>{card.brand}</p>
                    <p style={{ fontSize: 18, fontWeight: 600, letterSpacing: 2 }}>•••• {card.last4}</p>
                  </div>
                  <span
                    className="status-badge"
                    style={{
                      background: card.status === 'Active' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                      color: card.status === 'Active' ? 'var(--success)' : 'var(--danger)',
                    }}
                  >
                    {card.status}
                  </span>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 12 }}>Expires {card.expiry}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div style={{ marginTop: 32 }}>
          <h3 className="section-title">Recent Expenses</h3>
          <div className="expense-list">
            {expenses.map((exp) => (
              <div key={exp.id} className="expense-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="expense-icon">{exp.merchant[0]}</div>
                  <div>
                    <strong>{exp.merchant}</strong>
                    <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>{exp.category}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ color: 'var(--danger)' }}>-${exp.amount}</strong>
                  <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>{exp.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Predictions */}
        <div style={{ marginTop: 32 }}>
          <h3 className="section-title">Spending Predictions (Next Month)</h3>
          <div className="prediction-grid">
            {predictions.map((pred, i) => (
              <div key={i} className="prediction-card">
                <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 4 }}>{pred.category}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <h3 style={{ fontSize: 28, margin: 0 }}>${pred.predicted}</h3>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: pred.trend.startsWith('+') ? 'var(--danger)' : 'var(--success)',
                    }}
                  >
                    {pred.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
