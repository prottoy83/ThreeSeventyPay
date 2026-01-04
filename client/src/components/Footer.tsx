export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span className="copyright">© {new Date().getFullYear()} ThreeSeventyPay</span>
        <div className="footer-links">
          <a href="#">About</a>
          <a href="#">Terms</a>
        </div>
      </div>
    </footer>
  )
}
