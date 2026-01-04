import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

type User = {
    firstName?: string
    uid?: string
}

// Allowed currency pairs - BDT must always be on one side
const ALLOWED_CURRENCIES = ['USD', 'CNY', 'EUR', 'GBP', 'RUB']

const CURRENCY_NAMES: { [key: string]: string } = {
    'BDT': 'Bangladeshi Taka',
    'USD': 'US Dollar',
    'CNY': 'Chinese Yuan',
    'EUR': 'Euro',
    'GBP': 'British Pound',
    'RUB': 'Russian Ruble'
}

export default function CurrencyConverter() {
    const navigate = useNavigate()
    const [user, setUser] = useState<User | null>(null)
    const [amount, setAmount] = useState('100')
    const [fromCurrency, setFromCurrency] = useState('BDT')
    const [toCurrency, setToCurrency] = useState('USD')
    const [convertedAmount, setConvertedAmount] = useState<number | null>(null)
    const [exchangeRate, setExchangeRate] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [lastUpdate, setLastUpdate] = useState<string | null>(null)

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
        if (amount && fromCurrency && toCurrency) {
            const delayDebounce = setTimeout(() => {
                convertCurrency()
            }, 500)
            return () => clearTimeout(delayDebounce)
        }
    }, [amount, fromCurrency, toCurrency])

    const convertCurrency = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            setConvertedAmount(null)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await axios.get('http://localhost:5990/currency/convert', {
                params: {
                    amount,
                    from: fromCurrency,
                    to: toCurrency
                }
            })

            setConvertedAmount(response.data.converted)
            setExchangeRate(response.data.rate)
            setLastUpdate(response.data.date)
        } catch (error: any) {
            console.error('Conversion error:', error)
            setError(error.response?.data?.error || 'Failed to convert currency')
            setConvertedAmount(null)
        } finally {
            setLoading(false)
        }
    }

    const swapCurrencies = () => {
        const temp = fromCurrency
        setFromCurrency(toCurrency)
        setToCurrency(temp)
    }

    if (!user) return null

    // From currency: Always BDT or one of the allowed currencies
    const fromOptions = fromCurrency === 'BDT'
        ? [{ code: 'BDT', name: CURRENCY_NAMES['BDT'] }]
        : ALLOWED_CURRENCIES.map(code => ({ code, name: CURRENCY_NAMES[code] }))

    // To currency: If from is BDT, show allowed currencies; if from is allowed currency, show BDT
    const toOptions = fromCurrency === 'BDT'
        ? ALLOWED_CURRENCIES.map(code => ({ code, name: CURRENCY_NAMES[code] }))
        : [{ code: 'BDT', name: CURRENCY_NAMES['BDT'] }]

    return (
        <section className="section">
            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-welcome">Currency Converter</h1>
                        <p className="dashboard-user-email">Convert BDT to USD, CNY, EUR, GBP, or RUB</p>
                    </div>
                </div>

                <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
                    <div style={{ padding: '2rem' }}>
                        {/* Amount Input */}
                        <div className="input-group">
                            <label className="label">Amount</label>
                            <input
                                className="input"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="100"
                                min="0"
                                step="0.01"
                            />
                        </div>

                        {/* From Currency */}
                        <div className="input-group">
                            <label className="label">From</label>
                            <select
                                className="input"
                                value={fromCurrency}
                                onChange={(e) => {
                                    const newFrom = e.target.value
                                    setFromCurrency(newFrom)
                                    // Auto-adjust 'to' currency
                                    if (newFrom === 'BDT') {
                                        setToCurrency('USD')
                                    } else {
                                        setToCurrency('BDT')
                                    }
                                }}
                            >
                                <option value="BDT">BDT - Bangladeshi Taka</option>
                                {ALLOWED_CURRENCIES.map(code => (
                                    <option key={code} value={code}>
                                        {code} - {CURRENCY_NAMES[code]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Swap Button */}
                        <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={swapCurrencies}
                                style={{ padding: '0.5rem 1rem' }}
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <polyline points="19 12 12 19 5 12"></polyline>
                                </svg>
                            </button>
                        </div>

                        {/* To Currency */}
                        <div className="input-group">
                            <label className="label">To</label>
                            <select
                                className="input"
                                value={toCurrency}
                                onChange={(e) => setToCurrency(e.target.value)}
                            >
                                {toOptions.map(({ code, name }) => (
                                    <option key={code} value={code}>
                                        {code} - {name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="form-error" style={{ marginTop: '1rem' }}>
                                {error}
                            </div>
                        )}

                        {/* Result */}
                        {loading ? (
                            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                                <p>Converting...</p>
                            </div>
                        ) : convertedAmount !== null && (
                            <div style={{ marginTop: '2rem' }}>
                                <div className="balance-card">
                                    <div>
                                        <p className="balance-label">Converted Amount</p>
                                        <h2 className="balance-amount">
                                            {convertedAmount.toFixed(2)} {toCurrency}
                                        </h2>
                                        {exchangeRate && (
                                            <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                                                1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                                            </p>
                                        )}
                                        {lastUpdate && (
                                            <p style={{ marginTop: '0.25rem', color: '#999', fontSize: '0.8rem' }}>
                                                Last updated: {lastUpdate}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Card */}
                <div className="card" style={{ maxWidth: '600px', margin: '1rem auto', padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>About Currency Conversion</h3>
                    <ul style={{ lineHeight: '1.8', color: '#666' }}>
                        <li>Exchange rates are updated regularly from the European Central Bank</li>
                        <li>Conversion happens in real-time as you type</li>
                        <li>Supports BDT conversion to USD, CNY, EUR, GBP, and RUB</li>
                        <li>Perfect for international payments and transfers</li>
                    </ul>
                </div>
            </div>
        </section>
    )
}
