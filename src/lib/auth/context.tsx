import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { getToken, setToken as persistToken } from '../api/client'

const STRAVA_CLIENT_ID = '145080'
const STRAVA_REDIRECT_URI = 'https://m-thane.github.io/Cykel-App/#/strava-callback'

interface AuthContextValue {
  isLoggedIn: boolean
  loginUrl: string
  setSession: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken())

  const value = useMemo<AuthContextValue>(() => {
    const params = new URLSearchParams({
      client_id: STRAVA_CLIENT_ID,
      response_type: 'code',
      redirect_uri: STRAVA_REDIRECT_URI,
      approval_prompt: 'auto',
      scope: 'activity:read_all',
    })
    return {
      isLoggedIn: !!token,
      loginUrl: `https://www.strava.com/oauth/authorize?${params.toString()}`,
      setSession: (t: string) => {
        persistToken(t)
        setTokenState(t)
      },
      logout: () => {
        persistToken(null)
        setTokenState(null)
      },
    }
  }, [token])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
