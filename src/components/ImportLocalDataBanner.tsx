import { useState } from 'react'
import { Button, Card } from './ui'
import { api } from '../lib/api/client'
import { clearLegacyLocalData, hasLegacyLocalData, readLegacyLocalData } from '../lib/api/migrate'
import { useAppStore } from '../store/useAppStore'
import { useLang } from '../lib/i18n/context'

export default function ImportLocalDataBanner() {
  const { t } = useLang()
  const [visible, setVisible] = useState(hasLegacyLocalData)
  const [busy, setBusy] = useState(false)
  const loadState = useAppStore((s) => s.loadState)

  if (!visible) return null

  async function handleImport() {
    setBusy(true)
    const data = readLegacyLocalData()
    if (!data) {
      setVisible(false)
      setBusy(false)
      return
    }
    try {
      await api.importLocalData({
        bikes: data.bikes.map((b) => ({ id: b.id, name: b.name, discipline: b.discipline, archived: b.archived })),
        components: data.components.map((c) => ({
          bikeId: c.bikeId,
          type: c.type,
          customLabel: c.customLabel,
          installedAtKm: c.installedAtKm,
          installedAtDate: c.installedAtDate,
          lifespanKm: c.lifespanKm,
          active: c.active,
          replacedAtKm: c.replacedAtKm,
          replacedAtDate: c.replacedAtDate,
        })),
        rides: data.rides.map((r) => ({ bikeId: r.bikeId, date: r.date, km: r.km, note: r.note, durationMin: r.durationMin })),
        trainingProfile: data.trainingProfile,
      })
      clearLegacyLocalData()
      setVisible(false)
      await loadState()
    } finally {
      setBusy(false)
    }
  }

  function handleDismiss() {
    clearLegacyLocalData()
    setVisible(false)
  }

  return (
    <Card className="border-brand-700 bg-brand-900/20">
      <p className="text-sm text-slate-200">{t.login.importPrompt}</p>
      <div className="mt-3 flex gap-2">
        <Button onClick={handleImport} disabled={busy}>
          {t.login.importButton}
        </Button>
        <Button variant="ghost" onClick={handleDismiss} disabled={busy}>
          {t.login.importDismiss}
        </Button>
      </div>
    </Card>
  )
}
