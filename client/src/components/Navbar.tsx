import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.svg'

type User = { firstName?: string; avatarUrl?: string }

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const navigate = useNavigate()

  const loadUser = () => {
    try {
      const raw = localStorage.getItem('user')
      if (raw) setUser(JSON.parse(raw))
      else setUser(null)
    } catch {
      setUser(null)
    }
  }

  useEffect(() => {
    loadUser()
    window.addEventListener('storage', loadUser)
    return () => window.removeEventListener('storage', loadUser)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    setShowMenu(false)
    navigate('/')
  }

  const initial = (user?.firstName?.[0] || 'U').toUpperCase()

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <div className="brand">
          <span className="brand-logo" aria-hidden>
            <img src={logo} alt="ThreeSeventyPay" width={20} height={20} />
          </span>
          <span className="brand-name">ThreeSeventyPay</span>
        </div>
        <div className="nav-actions">
          {user ? (
            <div style={{ position: 'relative' }}>
              <div 
                className="user-chip" 
                onClick={() => setShowMenu(!showMenu)}
                style={{ cursor: 'pointer' }}
                title={user.firstName || 'Account'}
              >
                <span className="avatar" aria-hidden>{initial}</span>
                <span>{user.firstName}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.6 }}>
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              {showMenu && (
                <div className="dropdown-menu">
                  <button className="dropdown-item" onClick={() => { navigate('/dashboard'); setShowMenu(false) }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5"/>
                      <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5"/>
                      <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5"/>
                      <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    Dashboard
                  </button>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={() => navigate('/signup')}>Sign Up</button>
              <button className="btn btn-primary" onClick={() => navigate('/login')}>Log In</button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
