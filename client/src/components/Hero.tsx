export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-content">
          <h1 className="hero-title">
            Payments Intelligence. <span className="text-gradient">Simplified.</span>
          </h1>
          <p className="lead">
            The all-in-one AI-powered financial platform.
            Experience predictive insights, computer vision card entry,
            and real-time currency conversion for a smarter transaction experience.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary">Start Banking AI</button>
            <button className="btn btn-secondary">View Demo</button>
          </div>

          <div className="hero-stats">
            <div className="stat-pill">
              <span className="dot-success"></span>
              AI Accuracy <span className="stat-value">~99.2%</span>
            </div>
            <div className="stat-pill">Real-time <span className="stat-value">FX Rates</span></div>
            <div className="stat-pill">Support <span className="stat-value">24/7 Bot</span></div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card floating">
            <div className="card-stack">
              <div className="card-row">
                <div className="flex-center gap-sm">
                  <div className="feat-icon-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <strong>Vision Scan</strong>
                </div>
                <span className="badge-success">Success</span>
              </div>
              <div className="divider"></div>
              <div className="card-row">
                <div className="flex-center gap-sm">
                  <div className="feat-icon-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <strong>AI Prediction</strong>
                </div>
                <strong className="text-xl">Under Budget</strong>
              </div>
              <div className="card-row">
                <div className="flex-center gap-sm">
                  <div className="feat-icon-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <strong>Status</strong>
                </div>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>PLATINUM</span>
              </div>
            </div>
          </div>
          <div className="glow-effect"></div>
        </div>
      </div>
    </section>
  )
}
