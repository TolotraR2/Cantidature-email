import React, { useState, useEffect } from 'react'
import { useStore } from '../hooks/useStore.js'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Mail, Clock, AlertCircle } from 'lucide-react'

export default function Dashboard() {
  const { stats, entreprises, fetchStats, fetchEntreprises } = useStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      await fetchStats()
      await fetchEntreprises()
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>
  }

  const tauxSucces = stats.total > 0 ? Math.round((stats.envoyes / stats.total) * 100) : 0

  const pieData = [
    { name: 'Envoyées', value: stats.envoyes, color: '#3b82f6' },
    { name: 'Non envoyées', value: stats.non_envoyes, color: '#f59e0b' },
    { name: 'Échecs', value: stats.echecs, color: '#ef4444' }
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-gray-600 text-sm">Total entreprises</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-gray-600 text-sm">Envoyées</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.envoyes}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-gray-600 text-sm">En attente</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.non_envoyes}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-gray-600 text-sm">Taux succès</p>
              <h3 className="text-2xl font-bold text-gray-900">{tauxSucces}%</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Statut des candidatures</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} (${value})`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Types de candidatures</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: 'Recrutement', value: stats.recrutement },
                { name: 'Spontanée', value: stats.spontanee }
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
