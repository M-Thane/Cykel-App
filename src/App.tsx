import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Maintenance from './pages/Maintenance'
import BikeDetail from './pages/BikeDetail'
import TirePressure from './pages/TirePressure'
import GearRatio from './pages/GearRatio'
import BikeFit from './pages/BikeFit'
import Training from './pages/Training'
import Login from './pages/Login'
import StravaCallback from './pages/StravaCallback'
import { useAuth } from './lib/auth/context'
import { useAppStore } from './store/useAppStore'

export default function App() {
  const { isLoggedIn } = useAuth()
  const loadState = useAppStore((s) => s.loadState)
  const reset = useAppStore((s) => s.reset)

  useEffect(() => {
    if (isLoggedIn) loadState()
    else reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn])

  return (
    <Routes>
      <Route path="/strava-callback" element={<StravaCallback />} />
      {!isLoggedIn ? (
        <Route path="*" element={<Login />} />
      ) : (
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sliddele" element={<Maintenance />} />
          <Route path="/sliddele/:bikeId" element={<BikeDetail />} />
          <Route path="/daektryk" element={<TirePressure />} />
          <Route path="/gear" element={<GearRatio />} />
          <Route path="/bikefit" element={<BikeFit />} />
          <Route path="/traening" element={<Training />} />
        </Route>
      )}
    </Routes>
  )
}
