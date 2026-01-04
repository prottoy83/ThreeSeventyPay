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
    created_at: string
    first_name: string
    last_name: string
    email: string
}

export default function Referrals() {
    const navigate = useNavigate()
    const [user, setUser] = useState<User | null>(null)
    const [referrals, setReferrals] = useState<Referral[]>([])
    const [totalEarned, setTotalEarned] = useState(0)
    const [loading, setLoading] = useState(true)

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
        }
    }, [user])

    const fetchReferrals = async () => {
        try {
            const response = await axios.get(`http://localhost:5990/referrals/${user?.uid}`)
            if (response.status === 200) {
                setReferrals(response.data.referrals)
                setTotalEarned(response.data.total_rewards)
            }
        } catch (error) {
            console.error('Failed to fetch referrals:', error)
        } finally {
            setLoading(false)
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
                            <h2 className="balance-amount">{user.referralCode || "No Code Available"}</h2>
                        </div>
                        <div className="balance-actions">
                            <button className="btn btn-primary" onClick={copyToClipboard}>Copy Code</button>
                        </div>
                    </div>
                </div>

                <div className="balance-card" style={{ marginTop: '2rem' }}>
                    <div>
                        <p className="balance-label">Total Earned</p>
                        <h2 className="balance-amount">${totalEarned.toFixed(2)}</h2>
                    </div>
                </div>

                <div className="section-header" style={{ marginTop: '2rem' }}>
                    <h3 className="section-title">Your Referrals</h3>
                </div>

                <div className="card">
                    {loading ? <p>Loading...</p> : referrals.length === 0 ? (
                        <p style={{ padding: '1rem', color: '#666' }}>You haven't referred anyone yet. Share your code to start earning!</p>
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
                                    <div className="expense-amount">
                                        <h4 className="text-success">+${Number(ref.reward_amount).toFixed(2)}</h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
