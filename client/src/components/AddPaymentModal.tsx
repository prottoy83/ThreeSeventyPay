import { useEffect, useState, useRef } from 'react'
import Tesseract from 'tesseract.js'

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
  const [exp_month, setExpMonth] = useState('')
  const [exp_year, setExpYear] = useState('')
  const [cvv, setCvv] = useState('')

  const [saving, setSaving] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) {
      setBankName(''); setBranchName(''); setAccNo(''); setRoutingNumber('');
      setCardNo(''); setExpMonth(''); setExpYear(''); setCvv(''); setError(null); setSaving(false)
      setIsScanning(false); setScanProgress(0)
    }
  }, [isOpen])

  if (!isOpen) return null

  const processImage = async (file: File) => {
    setIsScanning(true)
    setError(null)
    setScanProgress(0)

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setScanProgress(Math.floor(m.progress * 100))
          }
        }
      })

      const text = result.data.text
      console.log('Detected Text:', text)

      // 1. Extract Card Number (exactly 16 digits)
      const digitsOnly = text.replace(/[^0-9]/g, '')
      const cardNumberMatch = digitsOnly.match(/\d{16}/)

      if (cardNumberMatch) {
        const raw = cardNumberMatch[0]
        setCardNo(raw.replace(/(\d{4})(?=\d)/g, '$1 '))
      } else {
        setError("Couldn't find a valid 16-digit card number. Please ensure the card is clear and well-lit.")
      }

    } catch (err: any) {
      setError("Scanning failed: " + err.message)
    } finally {
      setIsScanning(false)
      setScanProgress(0)
    }
  }

  const handleScanClick = (mode: 'camera' | 'image') => {
    if (mode === 'camera') {
      cameraInputRef.current?.click()
    } else {
      imageInputRef.current?.click()
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processImage(file)
  }

  const submit = async () => {
    try {
      setSaving(true)
      setError(null)

      let exp_date = ''
      if (type === 'card' && exp_month && exp_year) {
        exp_date = `${exp_year}-${exp_month}-01`
      }

      const body = type === 'bank'
        ? { method: 'bank', bank_name, branch_name, acc_no, routing_number }
        : { method: 'card', card_no: card_no.replace(/\s/g, ''), exp_date, cvv }

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

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 15 }, (_, i) => (currentYear + i).toString())
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))

  return (
    <div className="modal">
      <div className="modal__overlay" onClick={onClose} />
      <div className="modal__content" role="dialog" aria-modal="true" style={{ maxWidth: '500px' }}>
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
              <div className="card-scanner-options" style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <button
                  className="btn btn-secondary"
                  style={{ display: 'flex', flexDirection: 'column', height: 'auto', padding: '1rem', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => handleScanClick('camera')}
                  disabled={isScanning}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                  <span>Scan from Camera</span>
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ display: 'flex', flexDirection: 'column', height: 'auto', padding: '1rem', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => handleScanClick('image')}
                  disabled={isScanning}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                  <span>Scan from Image</span>
                </button>

                <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} ref={cameraInputRef} onChange={onFileChange} />
                <input type="file" accept="image/*" style={{ display: 'none' }} ref={imageInputRef} onChange={onFileChange} />
              </div>

              {isScanning && (
                <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
                  <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>AI Scanning Card... {scanProgress}%</p>
                  <div style={{ height: '4px', background: '#eee', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--primary)', width: `${scanProgress}%`, transition: 'width 0.2s' }} />
                  </div>
                </div>
              )}

              <div className="input-group">
                <label className="label">Card Number</label>
                <input className="input" value={card_no} onChange={e => setCardNo(e.target.value)} placeholder="e.g. 4242 4242 4242 4242" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="label">Month</label>
                  <select className="input" value={exp_month} onChange={e => setExpMonth(e.target.value)}>
                    <option value="">Month</option>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="label">Year</label>
                  <select className="input" value={exp_year} onChange={e => setExpYear(e.target.value)}>
                    <option value="">Year</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="label">CVV</label>
                  <input className="input" value={cvv} onChange={e => setCvv(e.target.value)} placeholder="123" maxLength={4} />
                </div>
              </div>
            </>
          )}

          {error && <p className="form__error" style={{ color: 'var(--danger)', marginTop: '1rem', fontSize: '0.9rem' }}>{error}</p>}
        </div>

        <div className="modal__footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving || isScanning}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving || isScanning}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
