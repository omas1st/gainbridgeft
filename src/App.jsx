import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ResetPassword from './pages/Auth/ResetPassword'
import Invest from './pages/Invest'
import UserMain from './pages/Dashboard/UserMain'
import TransactionHistory from './pages/Dashboard/TransactionHistory'
import Referral from './pages/Dashboard/Referral'
import PrivateRoute from './components/PrivateRoute'

// New / previously missing imports
import MessageCenter from './components/MessageCenter'
import Withdraw from './pages/Dashboard/Withdraw'
import WithdrawPreview from './pages/Dashboard/WithdrawPreview'
import WithdrawConfirm from './pages/Dashboard/WithdrawConfirm'
import Profile from './pages/Profile'

// Admin imports (if using)
import AdminRequests from './pages/Admin/AdminRequests'
import AdminUserProfile from './pages/Admin/AdminUserProfile'
import AdminHistory from './pages/Admin/AdminHistory'

export default function App(){
  return (
    <>
      <Header />
      <main style={{paddingBottom:40}}>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/about" element={<About/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/reset-password" element={<ResetPassword/>} />
          <Route path="/invest" element={<Invest/>} />

          <Route path="/dashboard" element={<PrivateRoute><UserMain/></PrivateRoute>} />
          <Route path="/dashboard/transactions" element={<PrivateRoute><TransactionHistory/></PrivateRoute>} />
          <Route path="/dashboard/referrals" element={<PrivateRoute><Referral/></PrivateRoute>} />

          {/* Withdraw flow */}
          <Route path="/dashboard/withdraw" element={<PrivateRoute><Withdraw/></PrivateRoute>} />
          <Route path="/dashboard/withdraw/preview" element={<PrivateRoute><WithdrawPreview/></PrivateRoute>} />
          <Route path="/dashboard/withdraw/confirm" element={<PrivateRoute><WithdrawConfirm/></PrivateRoute>} />

          {/* Profile & messages */}
          <Route path="/profile" element={<PrivateRoute><Profile/></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute><MessageCenter/></PrivateRoute>} />

          {/* Admin */}
          <Route path="/admin/requests" element={<AdminRequests/>} />
          <Route path="/admin/user/:id" element={<AdminUserProfile/>} />
          <Route path="/admin/history" element={<AdminHistory/>} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
