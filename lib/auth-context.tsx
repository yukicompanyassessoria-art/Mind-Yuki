'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@/types'
import { USERS } from './mock-data'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const DEMO_CREDENTIALS: Record<string, string> = {
  'victor@yuki.com.br': 'yuki2026',
  'gustavo@yuki.com.br': 'yuki2026',
  'erika@yuki.com.br': 'yuki2026',
  'nicolas@yuki.com.br': 'yuki2026',
  'antonio@yuki.com.br': 'yuki2026',
  'gabriela@yuki.com.br': 'yuki2026',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('yuki_user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    const expectedPassword = DEMO_CREDENTIALS[email.toLowerCase()]
    if (!expectedPassword || expectedPassword !== password) return false

    const found = USERS.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!found) return false

    setUser(found)
    localStorage.setItem('yuki_user', JSON.stringify(found))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('yuki_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
