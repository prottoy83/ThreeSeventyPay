import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'

type PaymentMethod = {
    pm_id: number
    method_type: 'bank' | 'card'
    acc_no?: string
    card_no?: string
    branch_name?: string
}

type CreatePaymentLinkModalProps = {
    isOpen: boolean
    uid: string
    onClose: () => void
    onCreated: () => void
}

export default function CreatePaymentLinkModal({
    isOpen,
    uid,
    onClose,
    onCreated,
}: CreatePaymentLinkModalProps) {
    const [amount, setAmount] = useState('')
    const [expiryHours, setExpiryHours] = useState('24')
    const [selectedPmId, setSelectedPmId] = useState<number | null>(null)
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [generatedLink, setGeneratedLink] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && uid) {
            fetchPaymentMethods()
        }
    }, [isOpen, uid])

    const fetchPaymentMethods = async () => {
        try {
            const response = await fetch(`http://localhost:5990/payMethods/method/${uid}`)
            if (response.ok) {
                const data = await response.json()
                setPaymentMethods(data.methods || [])
                if (data.methods && data.methods.length > 0) {
                    setSelectedPmId(data.methods[0].pm_id)
                }
            }
        } catch (error) {
            console.error('Failed to fetch payment methods:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount')
            return
        }

        if (!selectedPmId) {
            setError('Please select a payment method to receive funds')
            return
        }

        setLoading(true)

        try {
            const response = await fetch('http://localhost:5990/paylinks/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: uid,
                    amount: parseFloat(amount),
                    expiry_hours: parseInt(expiryHours),
                    pm_id: selectedPmId,
                }),
            })

            const data = await response.json()

            if (response.ok) {
                setGeneratedLink(data.full_url)
                onCreated()
            } else {
                setError(data.message || 'Failed to create payment link')
            }
        } catch (err) {
            setError('An error occurred while creating the payment link')
            console.error('Create payment link error:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleCopyLink = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink)
            alert('Payment link copied to clipboard!')
        }
    }

    const handleClose = () => {
        setAmount('')
        setExpiryHours('24')
        setError(null)
        setGeneratedLink(null)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Request Payment</h2>
                    <button className="modal-close" onClick={handleClose}>
                        ×
                    </button>
                </div>

                {!generatedLink ? (
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {error && <div className="form-error">{error}</div>}

                            <div className="input-group">
                                <label className="label">Amount to Request</label>
                                <input
                                    className="input"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label className="label">Receive Payment To</label>
                                <select
                                    className="input"
                                    value={selectedPmId || ''}
                                    onChange={(e) => setSelectedPmId(Number(e.target.value))}
                                    required
                                >
                                    {paymentMethods.length === 0 && (
                                        <option value="">No payment methods available</option>
                                    )}
                                    {paymentMethods.map((pm) => {
                                        const label =
                                            pm.method_type === 'bank'
                                                ? `Bank Account ${pm.branch_name || ''} - ${pm.acc_no?.slice(-4) || pm.pm_id}`
                                                : `Card - ${pm.card_no?.slice(-4) || pm.pm_id}`
                                        return (
                                            <option key={pm.pm_id} value={pm.pm_id}>
                                                {label}
                                            </option>
                                        )
                                    })}
                                </select>
                            </div>

                            <div className="input-group">
                                <label className="label">Link Expires In</label>
                                <select
                                    className="input"
                                    value={expiryHours}
                                    onChange={(e) => setExpiryHours(e.target.value)}
                                >
                                    <option value="1">1 hour</option>
                                    <option value="6">6 hours</option>
                                    <option value="12">12 hours</option>
                                    <option value="24">24 hours</option>
                                    <option value="48">48 hours</option>
                                    <option value="168">7 days</option>
                                </select>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading || paymentMethods.length === 0}
                            >
                                {loading ? 'Creating...' : 'Generate Payment Link'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="modal-body">
                        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
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
                            <h3 style={{ marginBottom: '0.5rem' }}>Payment Link Created!</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                Share this link to request ${parseFloat(amount).toFixed(2)}
                            </p>

                            {/* QR Code */}
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    marginBottom: '1.5rem',
                                    padding: '1rem',
                                    background: 'white',
                                    borderRadius: '12px',
                                    width: 'fit-content',
                                    margin: '0 auto 1.5rem',
                                }}
                            >
                                <QRCodeSVG
                                    value={generatedLink}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>

                            <div
                                style={{
                                    background: 'var(--surface)',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    marginBottom: '1rem',
                                    wordBreak: 'break-all',
                                }}
                            >
                                <code style={{ fontSize: '0.875rem' }}>{generatedLink}</code>
                            </div>

                            <button className="btn btn-primary" onClick={handleCopyLink}>
                                Copy Link
                            </button>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={handleClose}>
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
