import React from 'react'
import { FileText, Mail, Mail as MailIcon, Settings, History, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const location = useLocation()

  // Fermer la sidebar quand on change de page (mobile)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [location, isMobile])

  // Détecter les changements de taille d'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    // Sur desktop, ouvrir la sidebar par défaut
    if (window.innerWidth >= 768) {
      setSidebarOpen(true)
    }
  }, [])

  const menuItems = [
    { label: 'Tableau de bord', icon: FileText, path: '/' },
    { label: 'Entreprises', icon: MailIcon, path: '/entreprises' },
    { label: 'Historique', icon: History, path: '/historique' },
    { label: 'Configuration', icon: Settings, path: '/configuration' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-white shadow-lg transition-all duration-300 z-50 ${
          sidebarOpen ? 'w-64' : isMobile ? '-translate-x-full' : 'w-20'
        } ${isMobile ? 'transform' : ''}`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Mail className="w-8 h-8 text-blue-600 flex-shrink-0" />
            {sidebarOpen && <h1 className="text-xl font-bold text-gray-800">JobAutoApply</h1>}
          </div>
        </div>

        <nav className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-2 ${
                location.pathname === item.path
                  ? 'bg-blue-100 text-blue-600 font-semibold'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 w-full md:w-auto transition-all duration-300`}>
        {/* Top Bar */}
        <div className="bg-white shadow-sm sticky top-0 z-40 md:z-0">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition md:hidden"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex-1 text-center md:text-right">
              <h2 className="text-gray-600 text-sm font-semibold">
                 Job Auto Apply v1.0.0
              </h2>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
