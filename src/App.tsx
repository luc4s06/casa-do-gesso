import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import CustomerDetails from './pages/CustomerDetails'
import NewCustomer from './pages/NewCustomer'
import Withdrawals from './pages/Withdrawals'
import NewWithdrawal from './pages/NewWithdrawal'
import Payments from './pages/Payments'
import Prices from './pages/Prices'
import WeeklyReports from './pages/WeeklyReports'
import Settings from './pages/Settings'
import Login from './pages/Login'
import { LoadingState } from './components/AsyncState'
import { useAuth } from './hooks/useAuth'

export default function App() {
  const { session, loading } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)

  if (loading) return <LoadingState />
  if (!session) return <Login />

  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      <Sidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setDrawerOpen(true)} />
        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Customers />} />
            <Route path="/clientes/novo" element={<NewCustomer />} />
            <Route path="/clientes/:id" element={<CustomerDetails />} />
            <Route path="/retiradas" element={<Withdrawals />} />
            <Route path="/retiradas/nova" element={<NewWithdrawal />} />
            <Route path="/pagamentos" element={<Payments />} />
            <Route path="/precos" element={<Prices />} />
            <Route path="/relatorios" element={<WeeklyReports />} />
            <Route path="/configuracoes" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
