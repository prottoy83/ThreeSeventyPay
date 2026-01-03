export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span className="copyright">© {new Date().getFullYear()} ThreeSeventyPay</span>
        <div className="footer-links">
          <a href="#">Docs</a>
          <a href="#">API</a>
          <a href="#">Status</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </div>
    </footer>
  )
}
