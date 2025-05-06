// Composant graphique de revenus
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * Composant affichant les revenus mensuels dans un graphique à barres
 * @param {Array} data - Données pour le graphique (format: [{name: 'Jan', revenue: 50000}, ...])
 */
const RevenueChart = ({ data = [] }) => {
  // Si aucune donnée disponible
  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Aucune donnée disponible</p>
      </div>
    );
  }

  // Formater les montants en FCFA
  const formatMoney = (value) => {
    return `${value.toLocaleString()} FCFA`;
  };

  // Couleur personnalisée pour les barres du graphique
  const barColor = '#4f46e5';

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickFormatter={formatMoney}
          />
          <Tooltip 
            formatter={formatMoney}
            contentStyle={{ 
              borderRadius: '0.5rem', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: 'none',
              padding: '0.5rem 1rem',
            }}
            labelStyle={{ fontWeight: 'bold', marginBottom: '0.25rem' }}
          />
          <Bar 
            dataKey="revenue" 
            fill={barColor} 
            radius={[4, 4, 0, 0]}
            barSize={40}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;