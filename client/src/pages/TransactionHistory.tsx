import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

type User = {
    firstName?: string
    lastName?: string
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
    trx_id?: string
}

export default function TransactionHistory() {
    const navigate = useNavigate()
    const [user, setUser] = useState<User | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const raw = localStorage.getItem('user')
        if (raw) {
            setUser(JSON.parse(raw))
        } else {
            navigate('/login')
        }
    }, [navigate])

    useEffect(() => {
        if (user?.uid) {
            fetchHistory()
        }
    }, [user])

    const fetchHistory = async () => {
        try {
            const response = await axios.get(`http://localhost:5990/transactions/history/${user?.uid}`)
            setTransactions(response.data || [])
        } catch (error) {
            console.error('Failed to fetch transaction history:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="section">
            <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <p>Loading transactions...</p>
            </div>
        </div>
    )

    return (
        <section className="section">
            <div className="container">
                <div className="flex-center-between mb-xl">
                    <div>
                        <button
                            className="btn btn-secondary btn-sm mb-md"
                            onClick={() => navigate('/dashboard')}
                            style={{ padding: '0.4rem 0.8rem' }}
                        >
                            &larr; Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-bold">Transaction History</h1>
                    </div>
                </div>

                <div className="card">
                    <div className="expense-list">
                        {transactions.length === 0 ? (
                            <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No transactions found.</p>
                        ) : (
                            transactions.map((tx) => {
                                const isIncoming = tx.recipient_id === Number(user?.uid) ||
                                    tx.transaction_type === 'REFERRAL' ||
                                    tx.transaction_type === 'ADD_MONEY';
                                return (
                                    <div key={tx.tm_id} className="expense-item" style={{ borderBottom: '1px solid var(--border)', padding: '1.25rem 1rem' }}>
                                        <div className="flex-center-gap">
                                            <div className="expense-icon-box" style={{
                                                background: tx.transaction_type === 'REFERRAL' ? '#dcfce7' : '#e0f2fe',
                                                color: tx.transaction_type === 'REFERRAL' ? '#166534' : '#0369a1',
                                                width: '48px', height: '48px', fontSize: '1.2rem'
                                            }}>
                                                {tx.transaction_type === 'REFERRAL' ? '🎁' : (tx.description?.[0] || '💸')}
                                            </div>
                                            <div className="expense-details">
                                                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{tx.description || tx.transaction_type.replace('_', ' ')}</h4>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <span className="badge" style={{ fontSize: '0.75rem' }}>{tx.transaction_type.replace('_', ' ')}</span>
                                                    {tx.trx_id && <span style={{ color: '#888', fontSize: '0.75rem' }}>ID: {tx.trx_id}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="expense-amount" style={{ textAlign: 'right' }}>
                                            <h4 className={isIncoming ? 'text-success' : 'text-danger'} style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                                {isIncoming ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                                            </h4>
                                            <p style={{ fontSize: '0.85rem' }}>{new Date(tx.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
