import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AddPaymentModal from '../components/AddPaymentModal'

type User = {
  firstName?: string
  lastName?: string
  email?: string
  uid?: string
}

type PaymentMethod = {
  pm_id: number
  method_type: 'bank' | 'card'
  bank_name?: string | null
  branch_name?: string | null
  acc_no?: string | null
  routing_number?: string | null
  card_no?: string | null
  exp_date?: string | null
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [totalbalance, setBalance] = useState(0)
  const [user, setUser] = useState<User | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'bank' | 'card' | null>(null)

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

  useEffect(() => {
    if (user?.uid) {
      fetchTotalBalance()
      fetchPaymentMethods()
    }
  }, [user])

  const fetchTotalBalance = async () => {
    try {
      const response = await fetch(`http://localhost:5990/payMethods/totalBalance/${user?.uid}`)
      if(response.ok){
        const data = await response.json()
        setBalance(data.balance || 0)
      }
    }
    catch (e){
      console.log(e)
    }
  }

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch(`http://localhost:5990/payMethods/method/${user?.uid}`)
      if (response.ok) {
        const data = await response.json()
        setPaymentMethods(data.methods || [])
      }
    } catch (error) {
      console.error('Failed to fetch payment methods:', error)
    }
  }

  const openModal = (type: 'bank' | 'card') => { setModalType(type); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setModalType(null) }

  const deletePaymentMethod = async (pm_id: number, type: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return
    
    try {
      const response = await fetch(`http://localhost:5990/payMethods/deleteMethod/${pm_id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchPaymentMethods()
      } else {
        const data = await response.json()
        alert(data.message || 'Failed to delete payment method')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete payment method')
    }
  }

  if (!user) return null

  const bankAccounts = paymentMethods.filter(pm => pm.method_type === 'bank')
  const cards = paymentMethods.filter(pm => pm.method_type === 'card')

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
            <h2 style={{ fontSize: 36, margin: 0 }}>${totalbalance}</h2>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary">Send Money</button>
            <button className="btn btn-secondary">Request</button>
          </div>
        </div>

        {/* Bank Accounts Section */}
        <div style={{ marginTop: 32 }}>
          <h3 className="section-title">Linked Bank Accounts</h3>
          <div className="dashboard-grid">
            {bankAccounts.map((account) => {
              const last4 = account.acc_no ? account.acc_no.slice(-4) : null
              return (
                <div key={account.pm_id} className="dashboard-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 4 }}>{account.bank_name || 'Bank Account'}</p>
                      {account.branch_name && <h2 style={{ color: 'var(--muted)', fontSize: 18, marginBottom: 8 }}>Bank: {account.branch_name}</h2>}
                      <p style={{ fontSize: 18, fontWeight: 600 }}>{last4 ? `•••• ${last4}` : `Account #${account.pm_id}`}</p>
                    </div>
                    <button 
                      className="delete-btn"
                      onClick={() => deletePaymentMethod(account.pm_id, 'bank account')}
                      title="Delete"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 0 1 1.334-1.334h2.666a1.333 1.333 0 0 1 1.334 1.334V4m2 0v9.333a1.333 1.333 0 0 1-1.334 1.334H4.667a1.333 1.333 0 0 1-1.334-1.334V4h9.334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
            <div className="dashboard-card add-tile" onClick={() => openModal('bank')}>
              <div className="add-tile__icon">+</div>
              <div className="add-tile__text">
                <p className="add-tile__title">Add Bank Account</p>
                <p className="add-tile__subtitle">Link a new bank account</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards Section */}
        <div style={{ marginTop: 32 }}>
          <h3 className="section-title">Linked Cards</h3>
          <div className="dashboard-grid">
            {cards.map((card) => {
              const last4 = card.card_no ? card.card_no.slice(-4) : null
              return (
                <div key={card.pm_id} className="dashboard-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 4 }}>Card</p>
                      <p style={{ fontSize: 18, fontWeight: 600 }}>{last4 ? `•••• ${last4}` : `Card #${card.pm_id}`}</p>
                    </div>
                    <button 
                      className="delete-btn"
                      onClick={() => deletePaymentMethod(card.pm_id, 'card')}
                      title="Delete"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 0 1 1.334-1.334h2.666a1.333 1.333 0 0 1 1.334 1.334V4m2 0v9.333a1.333 1.333 0 0 1-1.334 1.334H4.667a1.333 1.333 0 0 1-1.334-1.334V4h9.334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
            <div className="dashboard-card add-tile" onClick={() => openModal('card')}>
              <div className="add-tile__icon">+</div>
              <div className="add-tile__text">
                <p className="add-tile__title">Add Card</p>
                <p className="add-tile__subtitle">Link a new credit or debit card</p>
              </div>
            </div>
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
        {/* Modal */}
        {modalType && (
          <AddPaymentModal
            isOpen={showModal}
            type={modalType}
            uid={user.uid!}
            onClose={closeModal}
            onAdded={() => { closeModal(); fetchPaymentMethods() }}
          />
        )}
      </div>
    </section>
  )
}
