export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div>
          <h1>Pay globally. Settle instantly. Build with confidence.</h1>
          <p className="lead">
            A modern payment gateway for startups and enterprises. Accept cards,
            wallets, and local methods with advanced fraud protection and real-time
            insights.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary">Create Free Account</button>
            <button className="btn btn-secondary">Contact Sales</button>
          </div>

          <div className="hero-card">
            <div className="card-row">
              <div className="card-pill">
                <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--success)' }} />
                Live approvals <span style={{color:'var(--muted)'}}>~98.7%</span>
              </div>
              <div className="card-pill">Avg. payout <span style={{color:'var(--muted)'}}>T+1</span></div>
              <div className="card-pill">Chargeback rate <span style={{color:'var(--muted)'}}>0.15%</span></div>
            </div>
          </div>
        </div>
        <div>
          <div className="hero-card">
            <div style={{ display:'grid', gap:12 }}>
              <div className="card-row">
                <div style={{display:'flex', alignItems:'center', gap:10}}>
                  <div className="feat-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3l8 4-8 4-8-4 8-4Zm0 18l8-4V9l-8 4v8Zm-8-4l8 4v-8L4 9v8Z" stroke="#9fb0d1" strokeWidth="1.5"/>
                    </svg>
                  </div>
                  <strong>Settlement Balance</strong>
                </div>
                <strong>$184,240.22</strong>
              </div>
              <div className="card-row">
                <div style={{display:'flex', alignItems:'center', gap:10}}>
                  <div className="feat-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14M5 12h14" stroke="#9fb0d1" strokeWidth="1.5"/>
                    </svg>
                  </div>
                  <strong>New Payments</strong>
                </div>
                <span>+2,431 today</span>
              </div>
              <div className="card-row">
                <div style={{display:'flex', alignItems:'center', gap:10}}>
                  <div className="feat-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M3 11h18M6 7h12M8 15h8" stroke="#9fb0d1" strokeWidth="1.5"/>
                    </svg>
                  </div>
                  <strong>Auth Rate</strong>
                </div>
                <span>98.7%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
