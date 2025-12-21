const features = [
  {
    title: 'Global Acceptance',
    desc: 'Cards, wallets, and 70+ local payment methods.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4 7h16v10H4z" stroke="#9fb0d1" strokeWidth="1.5"/>
        <path d="M4 9h16" stroke="#9fb0d1" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    title: 'Advanced Fraud',
    desc: 'Adaptive risk scoring and device fingerprinting.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 3l8 4v5c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V7l8-4Z" stroke="#9fb0d1" strokeWidth="1.5"/>
        <path d="M9 12l2 2 4-4" stroke="#2b86ff" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    title: 'Instant Payouts',
    desc: 'Flexible settlement windows with T+1 availability.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 8v8M8 12h8" stroke="#9fb0d1" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="9" stroke="#9fb0d1" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    title: 'Compliant by Design',
    desc: 'PCI-DSS, 3DS2, SCA, and regional mandates.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M5 12h14M12 5v14" stroke="#9fb0d1" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    title: 'Developer Friendly',
    desc: 'REST APIs, webhooks, and rich SDKs.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" stroke="#9fb0d1" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    title: 'Real-time Insights',
    desc: 'Dashboards, reporting, and anomaly detection.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4 18V6m6 12V10m6 8V8" stroke="#9fb0d1" strokeWidth="1.5"/>
      </svg>
    ),
  },
]

export default function Features() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">A full-stack payment platform</h2>
        <p className="section-sub">Designed for performance, reliability, and scale.</p>
        <div className="features">
          {features.map((f) => (
            <article key={f.title} className="feature">
              <div className="feat-icon" aria-hidden>{f.icon}</div>
              <strong>{f.title}</strong>
              <p>{f.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
