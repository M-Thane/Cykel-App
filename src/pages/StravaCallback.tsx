import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api/client'
import { useAuth } from '../lib/auth/context'
import { useLang } from '../lib/i18n/context'

export default function StravaCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const { t } = useLang()
  const [error, setError] = useState<string | null>(null)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    const code = params.get('code')
    if (!code) {
      setError(t.login.missingCode)
      return
    }
    api
      .exchangeStravaCode(code)
      .then((res) => {
        setSession(res.token)
        navigate('/', { replace: true })
      })
      .catch(() => setError(t.login.exchangeFailed))
  }, [params, navigate, setSession, t])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-950 p-4 text-center">
      <p className={error ? 'text-red-400' : 'text-slate-300'}>{error ?? t.login.connecting}</p>
    </div>
  )
}
