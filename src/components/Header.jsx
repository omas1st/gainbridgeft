// src/components/Header.jsx
import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/header.css'

export default function Header(){
  const { user, logout } = useAuth()
  const [welcome, setWelcome] = useState(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const headerRef = useRef(null)

  useEffect(() => {
    function onWelcome(e) {
      const firstName = e?.detail?.firstName || ''
      if(firstName) {
        setWelcome(`Welcome, ${firstName}!`)
        setTimeout(() => setWelcome(null), 5000)
      }
    }

    window.addEventListener('gainbridge:welcome', onWelcome)
    return () => window.removeEventListener('gainbridge:welcome', onWelcome)
  }, [])

  // Scroll behavior logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHidden(true)
        setIsScrolled(true)
      } else if (currentScrollY < lastScrollY) {
        setIsHidden(false)
        setIsScrolled(currentScrollY > 50)
      }
      
      setLastScrollY(currentScrollY)
    }

    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })
    setIsScrolled(window.scrollY > 50)

    return () => {
      window.removeEventListener('scroll', throttledScroll)
    }
  }, [lastScrollY])

  function handleLogout(){
    logout()
    navigate('/')
    setIsMobileOpen(false)
  }

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  const calculateScrollProgress = () => {
    if (typeof window === 'undefined') return 0;
    const scrollY = window.scrollY;
    const documentHeight = document.body.scrollHeight - window.innerHeight;
    if (documentHeight <= 0) return 0;
    return Math.min((scrollY / documentHeight) * 100, 100);
  };

  const dashboardPaths = ['/dashboard', '/profile', '/agent', '/admin', '/messages', '/invest']
  const onDashboard = dashboardPaths.some(p => location.pathname.startsWith(p))

  const scrollProgress = calculateScrollProgress();
  const headerClass = `site-header ${isScrolled ? 'scrolled' : ''} ${isHidden ? 'hidden' : 'visible'} ${isMobileOpen ? 'mobile-open' : ''}`

  // Navigation items for dropdown
  const getNavigationItems = () => {
    if (user) {
      return [
        { icon: '👤', label: 'Profile', action: () => navigate('/profile'), show: true },
        { icon: '💰', label: 'Dashboard', action: () => navigate('/dashboard'), show: !onDashboard },
        { icon: '👥', label: 'Agent Dashboard', action: () => navigate('/agent'), show: user.profileType === 'Agent account' || user.role === 'agent' },
        { icon: '⚙️', label: 'Admin Panel', action: () => navigate('/admin'), show: user.role === 'admin' || user.role === 'management' },
        { icon: '📊', label: 'Invest', action: () => navigate('/invest'), show: true },
        { icon: '💳', label: 'Withdraw', action: () => navigate('/dashboard/withdraw'), show: true },
        { icon: '📈', label: 'Transactions', action: () => navigate('/dashboard/transactions'), show: true },
        { icon: '👥', label: 'Referrals', action: () => navigate('/dashboard/referrals'), show: true },
        { icon: '🚪', label: 'Logout', action: handleLogout, show: true, isLogout: true }
      ].filter(item => item.show);
    } else {
      return [
        { icon: '🔐', label: 'Login', action: () => navigate('/login'), show: true },
        { icon: '📝', label: 'Sign Up', action: () => navigate('/register'), show: true, isPrimary: true },
        { icon: '🔑', label: 'Reset Password', action: () => navigate('/reset-password'), show: true }
      ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      <header className={headerClass} ref={headerRef}>
        <div className="scroll-progress" style={{width: `${scrollProgress}%`}}></div>
        
        <div className="container header-inner">
          <div className="brand-area">
            <Link to="/" className="brand">
              <span className="brand-mark">GB</span>
              <span className="brand-text">Gainbridge investment</span>
            </Link>

            {/* Desktop Navigation */}
            {!user || !onDashboard ? (
              <nav className="main-nav">
                {/* Empty nav as requested */}
              </nav>
            ) : null}

            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Toggle menu"
            >
              {isMobileOpen ? '✕' : '☰'}
            </button>
          </div>

          {/* Desktop Actions Area */}
          <div className="actions-area">
            {user ? (
              <>
                <div className="greeting">Hi, {user.firstName || user.email}</div>

                {(user.role === 'admin' || user.role === 'management') && (
                  <div className="dropdown-wrap">
                    <button className="header-btn header-btn-small header-btn-primary">Admin</button>
                    <div className="dropdown">
                      <Link to="/admin" className="dropdown-item">
                        <span className="dropdown-item-icon">🏠</span>
                        Main
                      </Link>
                      <Link to="/admin/requests" className="dropdown-item">
                        <span className="dropdown-item-icon">📋</span>
                        Requests
                      </Link>
                      <Link to="/admin/deposits" className="dropdown-item">
                        <span className="dropdown-item-icon">💰</span>
                        Deposits
                      </Link>
                      <Link to="/admin/history" className="dropdown-item">
                        <span className="dropdown-item-icon">📊</span>
                        History
                      </Link>
                      <Link to="/admin/messages" className="dropdown-item">
                        <span className="dropdown-item-icon">💬</span>
                        Messages
                      </Link>
                      <Link to="/admin/settings" className="dropdown-item">
                        <span className="dropdown-item-icon">⚙️</span>
                        Settings
                      </Link>
                    </div>
                  </div>
                )}

                {user.profileType === 'Agent account' || user.role === 'agent' ? (
                  <button className="header-btn header-btn-small header-btn-success" onClick={() => navigate('/agent')}>
                    Agent
                  </button>
                ) : null}

                <button className="header-btn header-btn-small" onClick={() => navigate('/profile')}>
                  Profile
                </button>
                <button className="header-btn header-btn-small header-btn-ghost" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="header-btn header-btn-small header-btn-ghost">
                  Login
                </Link>
                <Link to="/register" className="header-btn header-btn-small header-btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <nav className="main-nav">
          <div className="mobile-nav-dropdown">
            {navigationItems.map((item, index) => (
              <React.Fragment key={item.label}>
                {item.isLogout && <div className="mobile-nav-divider" />}
                <button
                  className={`mobile-nav-item ${item.isLogout ? 'mobile-nav-item-logout' : ''}`}
                  onClick={item.action}
                >
                  <span className="mobile-nav-item-icon">{item.icon}</span>
                  {item.label}
                </button>
                {item.isPrimary && <div className="mobile-nav-divider" />}
              </React.Fragment>
            ))}
          </div>
        </nav>
      </header>

      {welcome && (
        <div className="welcome-banner">
          {welcome}
        </div>
      )}
    </>
  )
}