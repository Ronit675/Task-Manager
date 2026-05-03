import { createContext, useEffect, useState } from 'react'

import { apiRequest } from '../lib/api'

const AuthContext = createContext(null)
const storageKey = 'team-task-manager-auth'

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(storageKey) || '')
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(Boolean(localStorage.getItem(storageKey)))

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

    const loadUser = async () => {
      try {
        setIsLoading(true)
        const response = await apiRequest('/auth/me', { token })
        if (!cancelled) {
          setUser(response.user)
        }
      } catch {
        if (!cancelled) {
          setToken('')
          setUser(null)
          localStorage.removeItem(storageKey)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadUser()

    return () => {
      cancelled = true
    }
  }, [token])

  const persistSession = (nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)
    localStorage.setItem(storageKey, nextToken)
  }

  const signup = async (payload) => {
    const response = await apiRequest('/auth/signup', {
      method: 'POST',
      body: payload,
    })

    persistSession(response.token, response.user)
    return response
  }

  const login = async (payload) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: payload,
    })

    persistSession(response.token, response.user)
    return response
  }

  const logout = () => {
    setToken('')
    setUser(null)
    localStorage.removeItem(storageKey)
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token && user),
        isLoading,
        login,
        logout,
        setUser,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }
