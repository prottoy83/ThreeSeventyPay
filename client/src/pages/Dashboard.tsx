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
      if (response.ok) {
        const data = await response.json()
        setBalance(data.balance || 0)
      }
    }
    catch (e) {
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
        <div className="dashboard-header">
          <h1 className="dashboard-welcome">
            Welcome back, {user.firstName}!
          </h1>
          <p className="dashboard-user-email">{user.email}</p>
        </div>

        {/* Balance Card */}
        <div className="balance-card">
          <div>
            <p className="balance-label">Total Balance</p>
            <h2 className="balance-amount">${totalbalance}</h2>
          </div>
          <div className="balance-actions">
            <button className="btn btn-primary">Send Money</button>
            <button className="btn btn-secondary">Request</button>
          </div>
        </div>

        {/* Bank Accounts Section */}
        <div className="section-header">
          <h3 className="section-title">Linked Bank Accounts</h3>
        </div>

        <div className="dashboard-grid">
          {bankAccounts.map((account) => {
            const last4 = account.acc_no ? account.acc_no.slice(-4) : null
            return (
              <div key={account.pm_id} className="card pm-card">
                <div>
                  <p className="pm-info-label">{account.bank_name || 'Bank Account'}</p>
                  {account.branch_name && <h2 className="pm-info-value text-xl mb-sm">{account.branch_name}</h2>}
                  <p className="pm-info-value">{last4 ? `•••• ${last4}` : `Account #${account.pm_id}`}</p>
                </div>
                <div className="pm-brand">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => deletePaymentMethod(account.pm_id, 'bank account')}
                  title="Delete"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 0 1 1.334-1.334h2.666a1.333 1.333 0 0 1 1.334 1.334V4m2 0v9.333a1.333 1.333 0 0 1-1.334 1.334H4.667a1.333 1.333 0 0 1-1.334-1.334V4h9.334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )
          })}
          <div className="add-tile" onClick={() => openModal('bank')}>
            <div className="add-tile__icon">+</div>
            <div className="add-tile__text">
              <p className="add-tile__title">Add Bank Account</p>
              <p className="add-tile__subtitle">Link a new bank account</p>
            </div>
          </div>
        </div>

        {/* Cards Section */}
        <div className="section-header">
          <h3 className="section-title">Linked Cards</h3>
        </div>

        <div className="dashboard-grid">
          {cards.map((card) => {
            const last4 = card.card_no ? card.card_no.slice(-4) : null
            return (
              <div key={card.pm_id} className="card pm-card">
                <div>
                  <p className="pm-info-label">Card</p>
                  <p className="pm-info-value">{last4 ? `•••• ${last4}` : `Card #${card.pm_id}`}</p>
                </div>
                <div className="pm-brand">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => deletePaymentMethod(card.pm_id, 'card')}
                  title="Delete"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 0 1 1.334-1.334h2.666a1.333 1.333 0 0 1 1.334 1.334V4m2 0v9.333a1.333 1.333 0 0 1-1.334 1.334H4.667a1.333 1.333 0 0 1-1.334-1.334V4h9.334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )
          })}
          <div className="add-tile" onClick={() => openModal('card')}>
            <div className="add-tile__icon">+</div>
            <div className="add-tile__text">
              <p className="add-tile__title">Add Card</p>
              <p className="add-tile__subtitle">Link a new credit or debit card</p>
            </div>
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="section-header">
          <h3 className="section-title">Recent Expenses</h3>
        </div>
        <div className="expense-list">
          {expenses.map((exp) => (
            <div key={exp.id} className="expense-item">
              <div className="flex-center-gap">
                <div className="expense-icon-box">{exp.merchant[0]}</div>
                <div className="expense-details">
                  <h4>{exp.merchant}</h4>
                  <p>{exp.category}</p>
                </div>
              </div>
              <div className="expense-amount">
                <h4 className="text-danger">-${exp.amount}</h4>
                <p>{exp.date}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Predictions */}
        <div className="section-header">
          <h3 className="section-title">Spending Predictions (Next Month)</h3>
        </div>
        <div className="dashboard-grid">
          {predictions.map((pred, i) => (
            <div key={i} className="card prediction-card">
              <p className="pm-info-label">{pred.category}</p>
              <div className="prediction-value">
                <h3 className="prediction-amount">${pred.predicted}</h3>
                <span
                  className={`badge ${pred.trend.startsWith('+') ? 'badge-danger' : 'badge-success'}`}
                >
                  {pred.trend}
                </span>
              </div>
            </div>
          ))}
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
