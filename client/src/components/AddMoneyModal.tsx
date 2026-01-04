import { useState, useEffect } from 'react'

type Props = {
    isOpen: boolean
    pm_id: number | null
    onClose: () => void
    onSuccess: () => void
}

export default function AddMoneyModal({ isOpen, pm_id, onClose, onSuccess }: Props) {
    const [amount, setAmount] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!isOpen) {
            setAmount('')
            setError(null)
            setSaving(false)
        }
    }, [isOpen])

    if (!isOpen || pm_id === null) return null

    const submit = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            setError('Please enter a valid positive amount')
            return
        }

        try {
            setSaving(true)
            setError(null)

            const response = await fetch(`http://localhost:5990/payMethods/addMoney`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pm_id,
                    amount: Number(amount),
                }),
            })

            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                throw new Error(data.message || 'Failed to add money')
            }

            onSuccess()
        } catch (e: any) {
            console.error(e)
            setError(e.message || 'Something went wrong')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="modal">
            <div className="modal__overlay" onClick={onClose} />
            <div className="modal__content" role="dialog" aria-modal="true">
                <div className="modal__header">
                    <h3 className="modal__title">Add Money</h3>
                    <button className="modal__close" onClick={onClose}>✕</button>
                </div>

                <div className="modal__body">
                    <div className="input-group">
                        <label className="label">Amount ($)</label>
                        <input
                            className="input"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={amount}
                            autoFocus
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="e.g. 100.00"
                        />
                    </div>
                    {error && <p className="form__error">{error}</p>}
                </div>

                <div className="modal__footer">
                    <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={submit} disabled={saving}>
                        {saving ? 'Processing...' : 'Add Money'}
                    </button>
                </div>
            </div>
        </div>
    )
}
