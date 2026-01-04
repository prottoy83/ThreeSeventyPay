import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

type User = {
    firstName?: string
    lastName?: string
    email?: string
    uid?: string
    referralCode?: string
}

type Referral = {
    referral_id: number
    referred_id: number
    reward_amount: string
    display_amount: number
    status: 'available' | 'redeemed'
    created_at: string
    first_name: string
    last_name: string
    email: string
}

type PaymentMethod = {
    pm_id: number
    method_type: string
    acc_no?: string
    card_no?: string
    branch_name?: string
    balance?: number
}

export default function Referrals() {
    const navigate = useNavigate()
    const [user, setUser] = useState<User | null>(null)
    const [referrals, setReferrals] = useState<Referral[]>([])
    const [totalEarned, setTotalEarned] = useState(0)
    const [currentRedeemable, setCurrentRedeemable] = useState(0)
    const [totalRedeemed, setTotalRedeemed] = useState(0)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [showTransferModal, setShowTransferModal] = useState(false)
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [selectedPmId, setSelectedPmId] = useState<number | null>(null)
    const [transferring, setTransferring] = useState(false)

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
            fetchReferrals()
            fetchPaymentMethods()
        }
    }, [user])

    const fetchReferrals = async () => {
        try {
            const response = await axios.get(`http://localhost:5990/referrals/${user?.uid}`)
            if (response.status === 200) {
                setReferrals(response.data.referrals)
                setTotalEarned(response.data.total_rewards)
                setCurrentRedeemable(response.data.current_redeemable)
                setTotalRedeemed(response.data.total_redeemed)
            }
        } catch (error) {
            console.error('Failed to fetch referrals:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchPaymentMethods = async () => {
        try {
            const response = await axios.get(`http://localhost:5990/payMethods/method/${user?.uid}`)
            if (response.status === 200) {
                setPaymentMethods(response.data.methods || [])
            }
        } catch (error) {
            console.error('Failed to fetch payment methods:', error)
        }
    }

    const generateReferralCode = async () => {
        if (!user?.uid) return

        setGenerating(true)
        try {
            const response = await axios.post('http://localhost:5990/referrals/generate-code', {
                uid: user.uid
            })

            if (response.status === 200 || response.status === 201) {
                const newCode = response.data.referral_code

                const updatedUser = { ...user, referralCode: newCode }
                setUser(updatedUser)
                localStorage.setItem('user', JSON.stringify(updatedUser))
                alert('Referral code generated successfully!')
            }
        } catch (error: any) {
            console.error('Failed to generate referral code:', error)
            alert(error.response?.data?.error || 'Failed to generate referral code')
        } finally {
            setGenerating(false)
        }
    }

    const handleTransferClick = () => {
        if (paymentMethods.length === 0) {
            alert('Please add a payment method first to transfer your earnings.')
            return
        }
        if (currentRedeemable <= 0) {
            alert('No earnings available to transfer.')
            return
        }
        setShowTransferModal(true)
    }

    const handleTransferEarnings = async () => {
        if (!selectedPmId || !user?.uid) return

        setTransferring(true)
        try {
            const response = await axios.post('http://localhost:5990/referrals/transfer-earnings', {
                uid: user.uid,
                pm_id: selectedPmId
            })

            if (response.status === 200) {
                alert(`Successfully transferred $${response.data.amount_transferred.toFixed(2)} to your payment method!`)
                setShowTransferModal(false)
                setSelectedPmId(null)
                fetchReferrals()
                fetchPaymentMethods()
            }
        } catch (error: any) {
            console.error('Failed to transfer earnings:', error)
            alert(error.response?.data?.error || 'Failed to transfer earnings')
        } finally {
            setTransferring(false)
        }
    }

    const copyToClipboard = () => {
        if (user?.referralCode) {
            navigator.clipboard.writeText(user.referralCode)
            alert("Referral code copied!")
        }
    }

    if (!user) return null

    return (
        <section className="section">
            <div className="container">
                <div className="dashboard-header" style={{ flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h1 className="dashboard-welcome">Referral Program</h1>
                        <p className="dashboard-user-email">Invite friends and earn rewards</p>
                    </div>
                    <div className="balance-card" style={{ minWidth: '300px', flex: 1 }}>
                        <div>
                            <p className="balance-label">Your Referral Code</p>
                            <h2 className="balance-amount">
                                {user.referralCode || "No Code Yet"}
                            </h2>
                        </div>
                        <div className="balance-actions">
                            {user.referralCode ? (
                                <button className="btn btn-primary" onClick={copyToClipboard}>
                                    Copy Code
                                </button>
                            ) : (
                                <button
                                    className="btn btn-primary"
                                    onClick={generateReferralCode}
                                    disabled={generating}
                                >
                                    {generating ? 'Generating...' : 'Generate Code'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                    {/* All Time Earnings */}
                    <div className="balance-card" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
                        <div>
                            <p className="balance-label" style={{ color: '#94a3b8' }}>Total Earned (All Time)</p>
                            <h2 className="balance-amount">${totalEarned.toFixed(2)}</h2>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                {referrals.length} Total Referrals
                            </p>
                        </div>
                    </div>

                    {/* Redeemable Balance */}
                    <div className="balance-card" style={{ border: '1px solid #10b98133', background: '#064e3b11' }}>
                        <div>
                            <p className="balance-label" style={{ color: '#10b981' }}>Current Redeemable</p>
                            <h2 className="balance-amount" style={{ color: '#10b981' }}>${currentRedeemable.toFixed(2)}</h2>
                        </div>
                        <div className="balance-actions">
                            <button
                                className="btn btn-primary"
                                onClick={handleTransferClick}
                                disabled={currentRedeemable <= 0}
                                style={{ background: '#10b981', borderColor: '#10b981' }}
                            >
                                Transfer Now
                            </button>
                        </div>
                    </div>

                    {/* Redeemed Balance */}
                    <div className="balance-card" style={{ border: '1px solid #6366f133', background: '#312e8111' }}>
                        <div>
                            <p className="balance-label" style={{ color: '#6366f1' }}>Total Redeemed</p>
                            <h2 className="balance-amount" style={{ color: '#6366f1' }}>${totalRedeemed.toFixed(2)}</h2>
                        </div>
                    </div>
                </div>

                <div className="section-header" style={{ marginTop: '2.5rem' }}>
                    <h3 className="section-title">Referral History</h3>
                </div>

                <div className="card">
                    {loading ? <p>Loading...</p> : referrals.length === 0 ? (
                        <p style={{ padding: '2rem', color: '#666', textAlign: 'center' }}>You hasn't referred anyone yet. Share your code to start earning!</p>
                    ) : (
                        <div className="expense-list">
                            {referrals.map((ref) => (
                                <div key={ref.referral_id} className="expense-item">
                                    <div className="flex-center-gap">
                                        <div className="expense-icon-box" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                                            {ref.first_name[0]}
                                        </div>
                                        <div className="expense-details">
                                            <h4>{ref.first_name} {ref.last_name}</h4>
                                            <p>{new Date(ref.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <h4 className="text-success" style={{ marginBottom: '4px' }}>+${Number(ref.display_amount).toFixed(2)}</h4>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            background: ref.status === 'redeemed' ? '#f1f5f9' : '#dcfce7',
                                            color: ref.status === 'redeemed' ? '#64748b' : '#166534',
                                            textTransform: 'capitalize',
                                            fontWeight: '600'
                                        }}>
                                            {ref.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Transfer Modal */}
                {showTransferModal && (
                    <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Withdraw Earnings</h2>
                                <button className="modal-close" onClick={() => setShowTransferModal(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="balance-card" style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem' }}>
                                    <p className="balance-label" style={{ color: '#64748b' }}>Amount to Withdraw</p>
                                    <h2 className="balance-amount" style={{ color: '#0f172a' }}>${currentRedeemable.toFixed(2)}</h2>
                                </div>
                                <div className="input-group">
                                    <label className="label">Select Destination Account</label>
                                    <select
                                        className="input"
                                        value={selectedPmId || ''}
                                        onChange={(e) => setSelectedPmId(Number(e.target.value))}
                                    >
                                        <option value="">Choose a bank or card</option>
                                        {paymentMethods.map((pm) => (
                                            <option key={pm.pm_id} value={pm.pm_id}>
                                                {pm.method_type === 'bank'
                                                    ? `Bank: ${pm.branch_name} (*${pm.acc_no?.slice(-4)})`
                                                    : `Card: ${pm.method_type} (*${pm.card_no?.slice(-4)})`
                                                }
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowTransferModal(false)}
                                    disabled={transferring}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleTransferEarnings}
                                    disabled={!selectedPmId || transferring}
                                >
                                    {transferring ? 'Processing...' : 'Confirm Transfer'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
