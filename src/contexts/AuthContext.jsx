// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import backend from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }){
  // Stored object will include token: { id, _id, email, firstName, ..., token }
  const [user, setUserState] = useState(() => {
    try {
      const raw = localStorage.getItem('gb_user')
      return raw ? JSON.parse(raw) : null
    } catch (err) {
      return null
    }
  })

  // loading while we hydrate / determine auth on app start
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  // Keep localStorage in sync whenever user changes and manage backend auth header
  useEffect(()=>{
    if (user) {
      localStorage.setItem('gb_user', JSON.stringify(user))
      try {
        // set Authorization header for axios instance (Bearer token)
        if (user.token) {
          backend.defaults.headers.common['Authorization'] = `Bearer ${user.token}`
        }
      } catch(e){ /* ignore */ }
    } else {
      localStorage.removeItem('gb_user')
      try {
        delete backend.defaults.headers.common['Authorization']
      } catch(e){ /* ignore */ }
    }
  },[user])

  // On mount, ensure axios header reflects persisted user and finish loading
  useEffect(() => {
    try {
      const raw = localStorage.getItem('gb_user')
      const persisted = raw ? JSON.parse(raw) : null
      if (persisted && persisted.token) {
        try { backend.defaults.headers.common['Authorization'] = `Bearer ${persisted.token}` } catch(e){}
      } else {
        try { delete backend.defaults.headers.common['Authorization'] } catch(e){}
      }
    } catch (e) {
      // ignore parsing errors
    } finally {
      // hydration complete
      setIsAuthLoading(false)
    }
  }, [])

  // internal setter that also persists (keeps existing function name and behavior)
  function setUser(newUserObj) {
    // newUserObj should contain token if available
    setUserState(newUserObj)
  }

  async function login(email, password){
    const { data } = await backend.post('/auth/login', { email, password })
    // server returns { user, token }
    const token = data.token
    const u = data.user || {}
    const stored = { ...(u._doc ? u._doc : u), id: u._id || u.id, token }
    setUser(stored)

    // set axios header immediately so subsequent requests use token
    try { backend.defaults.headers.common['Authorization'] = `Bearer ${token}` } catch(e){}

    // Best-effort notify admin about login (server also does this)
    try {
      await backend.post('/notify/login', {
        name: `${stored.firstName || ''} ${stored.lastName || ''}`.trim(),
        email: stored.email,
        phone: stored.phone || '',
        capital: stored.capital ?? 0
      })
    } catch (err) {
      // ignore
    }

    // UI welcome event
    try {
      window.dispatchEvent(new CustomEvent('gainbridge:welcome', { detail: { firstName: stored.firstName || '' } }))
    } catch(e){}

    return data
  }

  async function register(payload){
    const { data } = await backend.post('/auth/register', payload)
    const token = data.token
    const u = data.user || {}
    const stored = { ...(u._doc ? u._doc : u), id: u._id || u.id, token }
    setUser(stored)

    // set axios header immediately
    try { backend.defaults.headers.common['Authorization'] = `Bearer ${token}` } catch(e){}

    // Best-effort notify admin (server also handles)
    try {
      await backend.post('/notify/new-registration', {
        name: `${stored.firstName || ''} ${stored.lastName || ''}`.trim(),
        email: stored.email,
        phone: stored.phone || '',
        capital: stored.capital ?? 0
      })
    } catch (err) { /* ignore */ }

    try {
      window.dispatchEvent(new CustomEvent('gainbridge:welcome', { detail: { firstName: stored.firstName || '' } }))
    } catch(e){}

    return data
  }

  function logout(){
    // Clear user state and try to remove any auth headers stored on the API client
    setUser(null)

    // Defensive cleanup (localStorage is already handled by the effect above, but do an explicit remove)
    try { localStorage.removeItem('gb_user') } catch(e){}

    // Remove any default auth headers set on backend axios instance (best-effort)
    try {
      if (backend && backend.defaults && backend.defaults.headers) {
        delete backend.defaults.headers.common['Authorization']
        delete backend.defaults.headers.common['x-auth-token']
      }
    } catch(e) { /* ignore */ }

    // Dispatch a logout event for other parts of the app to respond to if needed
    try {
      window.dispatchEvent(new CustomEvent('gainbridge:logout'))
    } catch(e){}
  }

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      login,
      register,
      logout,
      // convenience flags for consumers
      isAuthenticated: !!user,
      isAuthLoading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
  return useContext(AuthContext)
}
