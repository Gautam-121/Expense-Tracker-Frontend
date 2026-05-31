import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Balances from './pages/Balances'
import Settlements from './pages/Settlements'
import Participants from './pages/Participants'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/groups/:code" element={<Dashboard />} />
      <Route path="/groups/:code/expenses" element={<Expenses />} />
      <Route path="/groups/:code/balances" element={<Balances />} />
      <Route path="/groups/:code/settlements" element={<Settlements />} />
      <Route path="/groups/:code/participants" element={<Participants />} />
    </Routes>
  )
}

export default App
