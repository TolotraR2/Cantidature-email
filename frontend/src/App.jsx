import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Entreprises from './pages/Entreprises.jsx'
import Templates from './pages/Templates.jsx'
import Configuration from './pages/Configuration.jsx'
import Historique from './pages/Historique.jsx'

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/entreprises" element={<Entreprises />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/configuration" element={<Configuration />} />
          <Route path="/historique" element={<Historique />} />
        </Routes>
      </Layout>
    </Router>
  )
}
