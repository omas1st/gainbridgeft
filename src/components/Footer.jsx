import React from 'react'
import '../styles/footer.css'

export default function Footer(){
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">GB</div>
            <div className="footer-company">Gainbridge Investment</div>
          </div>
          
          <div className="footer-info">
            <p className="footer-tagline">Professional investment platform with weekday-compounded returns</p>
            <div className="footer-meta">
              <span className="footer-copyright">© {currentYear} Gainbridge Investment. All rights reserved.</span>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-compliance">
            <span className="compliance-badge">🔒 Secure Platform</span>
            <span className="compliance-badge">📈 Regulated Operations</span>
            <span className="compliance-badge">💼 Professional Management</span>
          </div>
        </div>
      </div>
    </footer>
  )
}