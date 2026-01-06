import { useState } from 'react'
import axios from 'axios'

interface PaymentModalProps {
    isOpen: boolean
    onClose: () => void
    uid: string
    paymentMethods: any[]
    onSuccess: () => void
}

const PARTNERED_PLACES: Record<string, string[]> = {
    Shopping: ['Amazon', 'Daraz', 'Ebay', 'Shawpno', 'Unimart', 'Bikroy'],
    Education: ['BRACU', 'NSU', 'EWU', 'AUST'],
    Entertainment: ['Netflix', 'Hulu', 'Disney', 'Cable', 'Prime'],
    Games: ['Steam', 'Epic Games', 'Origin'],
    Food: ['Foodpanda', 'Pathao Food', 'Dominos', 'Pizza Hut', 'KFC', 'BFC', 'Khabar Dabar']
};

export default function PaymentModal({ isOpen, onClose, uid, paymentMethods, onSuccess }: PaymentModalProps) {
    const [amount, setAmount] = useState('')
    const [trxId, setTrxId] = useState('')
    const [recipient, setRecipient] = useState('')
    const [selectedPmId, setSelectedPmId] = useState('')
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault()

        if (trxId.length !== 12) {
            alert('TRX ID must be 12 characters')
            return
        }

        if (!selectedPmId) {
            alert('Please select a payment method')
            return
        }

        setLoading(true)
        try {
            const response = await axios.post('http://localhost:5990/transactions/payment', {
                uid,
                pm_id: selectedPmId,
                amount,
                recipient_name: recipient,
                trx_id: trxId
            })

            if (response.status === 200) {
                alert('Payment successful!')
                onSuccess()
                onClose()
            }
        } catch (error: any) {
            alert(error.response?.data?.error || 'Payment failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Partner Payment</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handlePayment} className="modal-body">
                    <div className="input-group">
                        <label className="label">TRX ID (12 characters)</label>
                        <input
                            className="input"
                            placeholder="Enter 12-char TRX ID"
                            maxLength={12}
                            value={trxId}
                            onChange={e => setTrxId(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="label">Payment Amount ($)</label>
                        <input
                            className="input"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="label">Recipient Provider</label>
                        <select
                            className="input"
                            value={recipient}
                            onChange={e => setRecipient(e.target.value)}
                            required
                        >
                            <option value="">Select Partnered Place</option>
                            {Object.entries(PARTNERED_PLACES).map(([category, places]) => (
                                <optgroup key={category} label={category}>
                                    {places.map(place => (
                                        <option key={place} value={place}>{place}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="label">Pay From</label>
                        <select
                            className="input"
                            value={selectedPmId}
                            onChange={e => setSelectedPmId(e.target.value)}
                            required
                        >
                            <option value="">Select Account/Card</option>
                            {paymentMethods.map(pm => (
                                <option key={pm.pm_id} value={pm.pm_id}>
                                    {pm.method_type === 'bank' ? `${pm.branch_name} (*${pm.acc_no.slice(-4)})` : `Card (*${pm.card_no.slice(-4)})`} - Balance: ${Number(pm.balance || 0).toFixed(2)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="modal-footer" style={{ marginTop: '1.5rem', padding: 0 }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Complete Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
