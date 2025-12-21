export default function CTA() {
  return (
    <section className="section">
      <div className="container cta">
        <div>
          <h3 style={{ marginBottom: 6 }}>Ready to get started?</h3>
          <p>Join thousands of businesses building with ThreeSeventyPay.</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-primary">Create Account</button>
          <button className="btn btn-ghost">Talk to Sales</button>
        </div>
      </div>
    </section>
  )
}
