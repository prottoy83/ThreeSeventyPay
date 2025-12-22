import { useEffect, useState } from 'react'

type Props = {
  isOpen: boolean
  type: 'bank' | 'card'
  uid: string
  onClose: () => void
  onAdded: () => void
}

export default function AddPaymentModal({ isOpen, type, uid, onClose, onAdded }: Props) {
  const [bank_name, setBankName] = useState('')
  const [acc_no, setAccNo] = useState('')
  const [routing_number, setRoutingNumber] = useState('')

  const [card_no, setCardNo] = useState('')
  const [exp_date, setExpDate] = useState('')
  const [cvv, setCvv] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setBankName(''); setAccNo(''); setRoutingNumber('');
      setCardNo(''); setExpDate(''); setCvv(''); setError(null); setSaving(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const submit = async () => {
    try {
      setSaving(true)
      setError(null)
      const body = type === 'bank'
        ? { method: 'bank', bank_name, acc_no, routing_number }
        : { method: 'card', card_no, exp_date, cvv }

      const res = await fetch(`http://localhost:5990/payMethods/addMethod/${uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || 'Failed to save')
      }
      onAdded()
    } catch (e: any) {
      setError(e?.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal">
      <div className="modal__overlay" onClick={onClose} />
      <div className="modal__content" role="dialog" aria-modal="true">
        <div className="modal__header">
          <h3 className="modal__title">{type === 'bank' ? 'Add Bank Account' : 'Add Card'}</h3>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        {type === 'bank' ? (
          <div className="modal__body">
            <label className="form__label">Bank Name
              <input className="form__input" value={bank_name} onChange={e => setBankName(e.target.value)} placeholder="e.g. Chase" />
            </label>
            <label className="form__label">Account Number
              <input className="form__input" value={acc_no} onChange={e => setAccNo(e.target.value)} placeholder="e.g. 123456789" />
            </label>
            <label className="form__label">Routing Number
              <input className="form__input" value={routing_number} onChange={e => setRoutingNumber(e.target.value)} placeholder="e.g. 1100000" />
            </label>
          </div>
        ) : (
          <div className="modal__body">
            <label className="form__label">Card Number
              <input className="form__input" value={card_no} onChange={e => setCardNo(e.target.value)} placeholder="e.g. 4242 4242 4242 4242" />
            </label>
            <label className="form__label">Expiry Date
              <input className="form__input" type="date" value={exp_date} onChange={e => setExpDate(e.target.value)} />
            </label>
            <label className="form__label">CVV
              <input className="form__input" value={cvv} onChange={e => setCvv(e.target.value)} placeholder="e.g. 123" />
            </label>
          </div>
        )}

        {error && <p className="form__error">{error}</p>}

        <div className="modal__footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
