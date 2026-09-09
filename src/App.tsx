import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Maintenance from './pages/Maintenance'
import BikeDetail from './pages/BikeDetail'
import TirePressure from './pages/TirePressure'
import GearRatio from './pages/GearRatio'
import BikeFit from './pages/BikeFit'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sliddele" element={<Maintenance />} />
        <Route path="/sliddele/:bikeId" element={<BikeDetail />} />
        <Route path="/daektryk" element={<TirePressure />} />
        <Route path="/gear" element={<GearRatio />} />
        <Route path="/bikefit" element={<BikeFit />} />
      </Route>
    </Routes>
  )
}
