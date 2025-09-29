// src/App.js
import React, { Suspense, useEffect } from 'react'
import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'

const Header = React.lazy(() => import('./components/Header'))
const Footer = React.lazy(() => import('./components/Footer'))
const Home = React.lazy(() => import('./pages/Home'))
const About = React.lazy(() => import('./pages/About'))
const Login = React.lazy(() => import('./pages/Auth/Login'))
const Register = React.lazy(() => import('./pages/Auth/Register'))
const ResetPassword = React.lazy(() => import('./pages/Auth/ResetPassword'))
const Invest = React.lazy(() => import('./pages/Invest'))
const InvestConfirm = React.lazy(() => import('./pages/InvestConfirm'))
const UserMain = React.lazy(() => import('./pages/Dashboard/UserMain'))
const TransactionHistory = React.lazy(() => import('./pages/Dashboard/TransactionHistory'))
const Referral = React.lazy(() => import('./pages/Dashboard/Referral'))
const MessageCenter = React.lazy(() => import('./components/MessageCenter'))
const Withdraw = React.lazy(() => import('./pages/Dashboard/Withdraw'))
const WithdrawPreview = React.lazy(() => import('./pages/Dashboard/WithdrawPreview'))
const WithdrawConfirm = React.lazy(() => import('./pages/Dashboard/WithdrawConfirm'))
const Profile = React.lazy(() => import('./pages/Profile'))

// Admin
const AdminMain = React.lazy(() => import('./pages/Admin/AdminMain'))
const AdminRequests = React.lazy(() => import('./pages/Admin/AdminRequests'))
const AdminDeposits = React.lazy(() => import('./pages/Admin/AdminDeposits'))
const AdminHistory = React.lazy(() => import('./pages/Admin/AdminHistory'))
const AdminUserProfile = React.lazy(() => import('./pages/Admin/AdminUserProfile'))
const AdminMessages = React.lazy(() => import('./pages/Admin/AdminMessages'))
const AdminSettings = React.lazy(() => import('./pages/Admin/AdminSettings')) // <-- added

const AgentDashboard = React.lazy(() => import('./pages/AgentDashboard'))

// PrivateRoute (protect dashboard/pages)
const PrivateRoute = React.lazy(() => import('./components/PrivateRoute'))

function Loader(){ return <div style={{padding:40}}>Loading...</div> }

// ScrollToTop: scrolls window to top on navigation (except for POP/back navigations)
function ScrollToTop(){
  const { pathname } = useLocation()
  const navigationType = useNavigationType() // 'PUSH' | 'POP' | 'REPLACE'

  // Disable browser automatic restoration so we can control scroll behavior consistently
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      try { window.history.scrollRestoration = 'manual' } catch (e) { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    // preserve browser back/forward expected behavior: if navigation is POP (back/forward), don't force scroll
    if (navigationType === 'POP') return

    // Some pages are lazy-loaded; using requestAnimationFrame helps ensure layout has settled.
    // We avoid setTimeout to keep behavior deterministic.
    requestAnimationFrame(() => {
      try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }) } catch (e) { /* ignore */ }
    })
  }, [pathname, navigationType])

  return null
}

export default function App(){
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader/>}>
        {/* scroll to top on route changes */}
        <ScrollToTop />

        <Header />
        <main style={{paddingBottom:40}}>
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/about" element={<About/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />
            <Route path="/reset-password" element={<ResetPassword/>} />
            <Route path="/invest" element={<Invest/>} />
            <Route path="/invest/confirm" element={<InvestConfirm/>} />

            {/* Protected dashboard routes */}
            <Route path="/dashboard" element={
              <Suspense fallback={<Loader/>}>
                <PrivateRoute><UserMain/></PrivateRoute>
              </Suspense>
            } />
            <Route path="/dashboard/transactions" element={
              <Suspense fallback={<Loader/>}>
                <PrivateRoute><TransactionHistory/></PrivateRoute>
              </Suspense>
            } />
            <Route path="/dashboard/referrals" element={
              <Suspense fallback={<Loader/>}>
                <PrivateRoute><Referral/></PrivateRoute>
              </Suspense>
            } />

            <Route path="/dashboard/withdraw" element={
              <Suspense fallback={<Loader/>}>
                <PrivateRoute><Withdraw/></PrivateRoute>
              </Suspense>
            } />
            <Route path="/dashboard/withdraw/preview" element={
              <Suspense fallback={<Loader/>}>
                <PrivateRoute><WithdrawPreview/></PrivateRoute>
              </Suspense>
            } />
            <Route path="/dashboard/withdraw/confirm" element={
              <Suspense fallback={<Loader/>}>
                <PrivateRoute><WithdrawConfirm/></PrivateRoute>
              </Suspense>
            } />

            {/* Profile and messages are user-specific — protect them */}
            <Route path="/profile" element={
              <Suspense fallback={<Loader/>}>
                <PrivateRoute><Profile/></PrivateRoute>
              </Suspense>
            } />
            <Route path="/messages" element={
              <Suspense fallback={<Loader/>}>
                <PrivateRoute><MessageCenter/></PrivateRoute>
              </Suspense>
            } />

            {/* Admin routes: require admin role */}
            <Route path="/admin" element={
              <Suspense fallback={<Loader/>}>
                <PrivateRoute requiredRole="admin"><AdminMain/></PrivateRoute>
              </Suspense>
            } />
            <Route path="/admin/requests" element={
              <Suspense fallback={<Loader/>}>
                <PrivateRoute requiredRole="admin"><AdminRequests/></PrivateRoute>
              </Suspense>
            } />
            <Route path="/admin/deposits" element={
              <Suspense fallback={<Loader/>}>
                <PrivateRoute requiredRole="admin"><AdminDeposits/></PrivateRoute>
              </Suspense>
            } />
            <Route path="/admin/history" element={
              <Suspense fallback={<Loader/>}>
                <PrivateRoute requiredRole="admin"><AdminHistory/></PrivateRoute>
              </Suspense>
            } />
            <Route path="/admin/user/:id" element={
              <Suspense fallback={<Loader/>}>
                <PrivateRoute requiredRole="admin"><AdminUserProfile/></PrivateRoute>
              </Suspense>
            } />
            <Route path="/admin/messages" element={
              <Suspense fallback={<Loader/>}>
                <PrivateRoute requiredRole="admin"><AdminMessages/></PrivateRoute>
              </Suspense>
            } />
            <Route path="/admin/settings" element={
              <Suspense fallback={<Loader/>}>
                <PrivateRoute requiredRole="admin"><AdminSettings/></PrivateRoute>
              </Suspense>
            } />

            {/* Agent routes: require agent role */}
            <Route path="/agent" element={
              <Suspense fallback={<Loader/>}>
                <PrivateRoute requiredRole="agent"><AgentDashboard/></PrivateRoute>
              </Suspense>
            } />
          </Routes>
        </main>
        <Footer />
      </Suspense>
    </ErrorBoundary>
  )
}