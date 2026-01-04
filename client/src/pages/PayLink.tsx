import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

type PaymentMethod = {
    pm_id: number
    method_type: 'bank' | 'card'
    acc_no?: string
    card_no?: string
    branch_name?: string
    balance?: number
}

type PaymentLinkDetails = {
    link_id: number
    amount: number
    recipient_name: string
    recipient_email: string
    expiry: string
    created_at: string
}

export default function PayLink() {
    const { linkId } = useParams<{ linkId: string }>()
    const navigate = useNavigate()

    const [linkDetails, setLinkDetails] = useState<PaymentLinkDetails | null>(null)
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [selectedPmId, setSelectedPmId] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [paying, setPaying] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        // Check if user is logged in
        try {
            const raw = localStorage.getItem('user')
            if (raw) {
                const userData = JSON.parse(raw)
                setUser(userData)
            } else {
                setError('Please log in to make a payment')
                setLoading(false)
                return
            }
        } catch {
            setError('Please log in to make a payment')
            setLoading(false)
            return
        }
    }, [])

    useEffect(() => {
        if (linkId && user?.uid) {
            fetchLinkDetails()
            fetchPaymentMethods()
        }
    }, [linkId, user])

    const fetchLinkDetails = async () => {
        try {
            const response = await fetch(`http://localhost:5990/paylinks/details/${linkId}`)
            const data = await response.json()

            if (response.ok) {
                setLinkDetails(data)
            } else {
                setError(data.message || 'Failed to load payment link')
            }
        } catch (err) {
            setError('Failed to load payment link details')
            console.error('Fetch link error:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchPaymentMethods = async () => {
        try {
            const response = await fetch(`http://localhost:5990/payMethods/method/${user.uid}`)
            if (response.ok) {
                const data = await response.json()
                const methods = data.methods || []
                setPaymentMethods(methods)

                // Auto-select first method with sufficient balance
                const sufficientMethod = methods.find((pm: PaymentMethod) =>
                    (pm.balance || 0) >= (linkDetails?.amount || 0)
                )
                if (sufficientMethod) {
                    setSelectedPmId(sufficientMethod.pm_id)
                } else if (methods.length > 0) {
                    setSelectedPmId(methods[0].pm_id)
                }
            }
        } catch (error) {
            console.error('Failed to fetch payment methods:', error)
        }
    }

    const handlePayment = async () => {
        if (!selectedPmId) {
            setError('Please select a payment method')
            return
        }

        if (!linkDetails) return

        const selectedMethod = paymentMethods.find((pm) => pm.pm_id === selectedPmId)
        if (!selectedMethod) {
            setError('Invalid payment method selected')
            return
        }

        const balance = selectedMethod.balance || 0
        if (balance < linkDetails.amount) {
            setError(`Insufficient balance. You have $${balance.toFixed(2)} but need $${linkDetails.amount.toFixed(2)}`)
            return
        }

        setPaying(true)
        setError(null)

        try {
            const response = await fetch(`http://localhost:5990/paylinks/pay/${linkId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    payer_id: user.uid,
                    pm_id: selectedPmId,
                }),
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess(true)
                setTimeout(() => {
                    navigate('/dashboard')
                }, 3000)
            } else {
                setError(data.message || 'Payment failed')
            }
        } catch (err) {
            setError('An error occurred while processing payment')
            console.error('Payment error:', err)
        } finally {
            setPaying(false)
        }
    }

    if (loading) {
        return (
            <section className="section">
                <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <p>Loading payment details...</p>
                </div>
            </section>
        )
    }

    if (error && !linkDetails) {
        return (
            <section className="section">
                <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <svg
                            width="64"
                            height="64"
                            fill="none"
                            stroke="var(--danger)"
                            viewBox="0 0 24 24"
                            style={{ margin: '0 auto' }}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Payment Link Error</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{error}</p>
                    <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                        Go to Dashboard
                    </button>
                </div>
            </section>
        )
    }

    if (success) {
        return (
            <section className="section">
                <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <svg
                            width="64"
                            height="64"
                            fill="none"
                            stroke="var(--success)"
                            viewBox="0 0 24 24"
                            style={{ margin: '0 auto' }}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Payment Successful!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        You've successfully sent ${linkDetails?.amount.toFixed(2)} to {linkDetails?.recipient_name}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Redirecting to dashboard...
                    </p>
                </div>
            </section>
        )
    }

    return (
        <section className="section">
            <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="card" style={{ padding: '2rem' }}>
                    <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Payment Request</h2>

                    {linkDetails && (
                        <>
                            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    You're paying
                                </p>
                                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                                    ${linkDetails.amount.toFixed(2)}
                                </h1>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    to <strong>{linkDetails.recipient_name}</strong>
                                </p>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                    {linkDetails.recipient_email}
                                </p>
                            </div>

                            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface)', borderRadius: '8px' }}>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    Link expires: {new Date(linkDetails.expiry).toLocaleString()}
                                </p>
                            </div>

                            {error && (
                                <div className="form-error" style={{ marginBottom: '1rem' }}>
                                    {error}
                                </div>
                            )}

                            <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                                <label className="label">Pay From</label>
                                <select
                                    className="input"
                                    value={selectedPmId || ''}
                                    onChange={(e) => setSelectedPmId(Number(e.target.value))}
                                    disabled={paying}
                                >
                                    {paymentMethods.length === 0 && (
                                        <option value="">No payment methods available</option>
                                    )}
                                    {paymentMethods.map((pm) => {
                                        const balance = pm.balance || 0
                                        const hasSufficient = balance >= linkDetails.amount
                                        const label =
                                            pm.method_type === 'bank'
                                                ? `Bank ${pm.branch_name || ''} - ${pm.acc_no?.slice(-4) || pm.pm_id}`
                                                : `Card - ${pm.card_no?.slice(-4) || pm.pm_id}`
                                        return (
                                            <option key={pm.pm_id} value={pm.pm_id}>
                                                {label} (Balance: ${balance.toFixed(2)})
                                                {!hasSufficient ? ' - Insufficient' : ''}
                                            </option>
                                        )
                                    })}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => navigate('/dashboard')}
                                    disabled={paying}
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handlePayment}
                                    disabled={paying || !selectedPmId || paymentMethods.length === 0}
                                    style={{ flex: 1 }}
                                >
                                    {paying ? 'Processing...' : `Pay $${linkDetails.amount.toFixed(2)}`}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    )
}
