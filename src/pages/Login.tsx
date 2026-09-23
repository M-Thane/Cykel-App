import { Bike } from 'lucide-react'
import { Button, Card } from '../components/ui'
import { useAuth } from '../lib/auth/context'
import { useLang } from '../lib/i18n/context'

export default function Login() {
  const { t } = useLang()
  const { loginUrl } = useAuth()

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-sm text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600">
          <Bike size={24} className="text-white" />
        </span>
        <h1 className="text-xl font-semibold text-slate-100">Cykel-App</h1>
        <p className="mt-2 text-sm text-slate-400">{t.login.subtitle}</p>
        <a href={loginUrl} className="mt-5 block">
          <Button className="w-full justify-center">{t.login.connectStrava}</Button>
        </a>
      </Card>
    </div>
  )
}
