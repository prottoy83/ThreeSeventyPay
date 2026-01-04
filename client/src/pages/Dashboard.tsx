import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AddPaymentModal from '../components/AddPaymentModal'
import AddMoneyModal from '../components/AddMoneyModal'
import CreatePaymentLinkModal from '../components/CreatePaymentLinkModal'
import PaymentModal from '../components/PaymentModal'

type User = {
  firstName?: string
  lastName?: string
  email?: string
  uid?: string
}

type Transaction = {
  tm_id: number
  sender_id: number
  recipient_id: number | null
  amount: number
  description: string
  transaction_type: string
  timestamp: string
  status: string
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
  balance?: number
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [totalbalance, setBalance] = useState(0)
  const [user, setUser] = useState<User | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'bank' | 'card' | null>(null)

  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false)
  const [transactionPmId, setTransactionPmId] = useState<number | null>(null)

  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

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
      fetchTransactions()
    }
  }, [user])

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`http://localhost:5990/transactions/history/${user?.uid}`)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data || [])
      }
    } catch (e) {
      console.log(e)
    }
  }

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



  const openAddMoneyModal = (pm_id: number) => {
    setTransactionPmId(pm_id)
    setShowAddMoneyModal(true)
  }

  const closeAddMoneyModal = () => {
    setShowAddMoneyModal(false)
    setTransactionPmId(null)
  }

  const openPaymentLinkModal = () => {
    setShowPaymentLinkModal(true)
  }

  const closePaymentLinkModal = () => {
    setShowPaymentLinkModal(false)
  }

  if (!user) return null

  const bankAccounts = paymentMethods.filter(pm => pm.method_type === 'bank')
  const cards = paymentMethods.filter(pm => pm.method_type === 'card')

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
            <h2 className="balance-amount">${totalbalance?.toFixed(2)}</h2>
          </div>
          <div className="balance-actions">
            <button className="btn btn-primary" onClick={() => setShowPaymentModal(true)}>Payment</button>
            <button className="btn btn-secondary" onClick={openPaymentLinkModal}>Request</button>
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
                  <p className="pm-balance" style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>Balance: ${Number(account.balance || 0).toFixed(2)}</p>
                </div>
                <div className="pm-brand">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                  <button className="btn btn-sm btn-primary" onClick={() => openAddMoneyModal(account.pm_id)}>Add Money</button>
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
                  <p className="pm-balance" style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>Balance: ${Number(card.balance || 0).toFixed(2)}</p>
                </div>
                <div className="pm-brand">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                  <button className="btn btn-sm btn-primary" onClick={() => openAddMoneyModal(card.pm_id)}>Add Money</button>
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

        {/* Recent Activity */}
        <div className="section-header">
          <h3 className="section-title">Recent Activity</h3>
        </div>
        <div className="expense-list">
          {transactions.length === 0 ? (
            <p style={{ padding: '1rem', color: '#666' }}>No recent activity found.</p>
          ) : (
            <>
              {transactions.slice(0, 5).map((tx) => {
                const isIncoming = tx.recipient_id === Number(user.uid) || tx.transaction_type === 'REFERRAL' || tx.transaction_type === 'ADD_MONEY';
                return (
                  <div key={tx.tm_id} className="expense-item">
                    <div className="flex-center-gap">
                      <div className="expense-icon-box" style={{
                        background: tx.transaction_type === 'REFERRAL' ? '#dcfce7' : '#e0f2fe',
                        color: tx.transaction_type === 'REFERRAL' ? '#166534' : '#0369a1'
                      }}>
                        {tx.transaction_type === 'REFERRAL' ? '🎁' : (tx.description?.[0] || '💸')}
                      </div>
                      <div className="expense-details">
                        <h4>{tx.description || tx.transaction_type}</h4>
                        <p>{tx.transaction_type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="expense-amount">
                      <h4 className={isIncoming ? 'text-success' : 'text-danger'}>
                        {isIncoming ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                      </h4>
                      <p>{new Date(tx.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                )
              })}
              {transactions.length > 5 && (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate('/transactions')}
                    style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}
                  >
                    Show More Activity &rarr;
                  </button>
                </div>
              )}
            </>
          )}
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

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          uid={user.uid!}
          paymentMethods={paymentMethods}
          onSuccess={() => {
            fetchTotalBalance()
            fetchPaymentMethods()
            fetchTransactions()
          }}
        />

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

        {/* Add Money Modal */}
        <AddMoneyModal
          isOpen={showAddMoneyModal}
          pm_id={transactionPmId}
          onClose={closeAddMoneyModal}
          onSuccess={() => {
            closeAddMoneyModal()
            fetchTotalBalance()
            fetchPaymentMethods()
          }}
        />

        {/* Create Payment Link Modal */}
        <CreatePaymentLinkModal
          isOpen={showPaymentLinkModal}
          uid={user.uid!}
          onClose={closePaymentLinkModal}
          onCreated={() => {
            // Optionally refresh data or show success message
          }}
        />
      </div>
    </section>
  )
}
