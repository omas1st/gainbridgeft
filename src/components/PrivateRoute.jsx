// src/components/PrivateRoute.jsx
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * PrivateRoute usage:
 *  <PrivateRoute> <ProtectedPage /> </PrivateRoute>
 *  <PrivateRoute requiredRole="admin"> <AdminPage /> </PrivateRoute>
 *
 * - If isAuthLoading is true we render null (or could show a spinner).
 * - If user not logged in, redirect to /login and preserve origin in state.from
 * - If requiredRole is provided, ensure user.role (case-insensitive) matches
 */
export default function PrivateRoute({ children, requiredRole }) {
  const { user, isAuthLoading } = useAuth()
  const location = useLocation()

  // While auth is being determined, render nothing (avoid flicker). You can replace
  // with a spinner component if you prefer.
  if (isAuthLoading) return null

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (requiredRole) {
    const roleRaw = (user?.role || user?.profileType || '').toString().toLowerCase()
    if (roleRaw !== requiredRole.toString().toLowerCase()) {
      // not authorized for this role — redirect to login (or consider redirect to /)
      return <Navigate to="/login" replace state={{ from: location }} />
    }
  }

  return children
}
