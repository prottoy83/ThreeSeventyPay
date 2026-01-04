import './App.css'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import CTA from './components/CTA'
import Footer from './components/Footer'
import Login from './pages/Login.tsx'
import Signup from './pages/Signup.tsx'
import Dashboard from './pages/Dashboard.tsx'
import PayLink from './pages/PayLink.tsx'
import Referrals from './pages/Referrals.tsx'
import CurrencyConverter from './pages/CurrencyConverter.tsx'
import TransactionHistory from './pages/TransactionHistory.tsx'

export default function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <Features />
              <CTA />
            </>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<TransactionHistory />} />
        <Route path="/referrals" element={<Referrals />} />
        <Route path="/currency" element={<CurrencyConverter />} />
        <Route path="/pay/:linkId" element={<PayLink />} />
      </Routes>
      <Footer />
    </div>
  )
}
