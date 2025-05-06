// Composant graphique de taux d'occupation
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * Composant affichant le taux d'occupation dans un graphique en ligne
 * @param {Array} data - Données pour le graphique (format: [{name: 'Jan', occupancy: 75}, ...])
 */
const OccupancyChart = ({ data = [] }) => {
  // Si aucune donnée disponible
  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Aucune donnée disponible</p>
      </div>
    );
  }

  // Formater les pourcentages
  const formatPercent = (value) => {
    return `${value}%`;
  };

  // Couleur personnalisée pour la ligne
  const lineColor = '#8b5cf6';

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
            tickFormatter={formatPercent}
            domain={[0, 100]}
          />
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Taux d\'occupation']}
            contentStyle={{ 
              borderRadius: '0.5rem', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: 'none',
              padding: '0.5rem 1rem',
            }}
            labelStyle={{ fontWeight: 'bold', marginBottom: '0.25rem' }}
          />
          <Line 
            type="monotone" 
            dataKey="occupancy" 
            stroke={lineColor} 
            strokeWidth={3}
            dot={{ stroke: lineColor, strokeWidth: 2, r: 4, fill: 'white' }}
            activeDot={{ stroke: lineColor, strokeWidth: 2, r: 6, fill: 'white' }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OccupancyChart;