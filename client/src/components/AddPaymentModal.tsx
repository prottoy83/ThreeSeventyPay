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
  const [branch_name, setBranchName] = useState('')
  const [acc_no, setAccNo] = useState('')
  const [routing_number, setRoutingNumber] = useState('')

  const [card_no, setCardNo] = useState('')
  const [exp_date, setExpDate] = useState('')
  const [cvv, setCvv] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setBankName(''); setBranchName(''); setAccNo(''); setRoutingNumber('');
      setCardNo(''); setExpDate(''); setCvv(''); setError(null); setSaving(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const submit = async () => {
    try {
      setSaving(true)
      setError(null)
      const body = type === 'bank'
        ? { method: 'bank', bank_name, branch_name, acc_no, routing_number }
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

        <div className="modal__body">
          {type === 'bank' ? (
            <>
              <div className="input-group">
                <label className="label">Bank Name</label>
                <input className="input" value={bank_name} onChange={e => setBankName(e.target.value)} placeholder="e.g. Chase" />
              </div>
              <div className="input-group">
                <label className="label">Branch Name</label>
                <input className="input" value={branch_name} onChange={e => setBranchName(e.target.value)} placeholder="e.g. Downtown" />
              </div>
              <div className="input-group">
                <label className="label">Account Number</label>
                <input className="input" value={acc_no} onChange={e => setAccNo(e.target.value)} placeholder="e.g. 123456789" />
              </div>
              <div className="input-group">
                <label className="label">Routing Number</label>
                <input className="input" value={routing_number} onChange={e => setRoutingNumber(e.target.value)} placeholder="e.g. 1100000" />
              </div>
            </>
          ) : (
            <>
              <div className="input-group">
                <label className="label">Card Number</label>
                <input className="input" value={card_no} onChange={e => setCardNo(e.target.value)} placeholder="e.g. 4242 4242 4242 4242" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="label">Expiry Date</label>
                  <input className="input" type="date" value={exp_date} onChange={e => setExpDate(e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="label">CVV</label>
                  <input className="input" value={cvv} onChange={e => setCvv(e.target.value)} placeholder="e.g. 123" />
                </div>
              </div>
            </>
          )}

          {error && <p className="form__error">{error}</p>}
        </div>

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
