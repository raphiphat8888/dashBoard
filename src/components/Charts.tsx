import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, children }) => (
  <div className="bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-2xl flex flex-col h-full">
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
      {subtitle && <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>}
    </div>
    <div className="w-full flex-1 min-h-[300px]">
      {children}
    </div>
  </div>
);

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const RegionalBarChart: React.FC<{ data: any[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
      <XAxis
        dataKey="name"
        stroke="#71717a"
        fontSize={12}
        tickLine={false}
        axisLine={false}
      />
      <YAxis
        stroke="#71717a"
        fontSize={12}
        tickLine={false}
        axisLine={false}
        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
      />
      <Tooltip
        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
        itemStyle={{ color: '#10b981' }}
        formatter={(value: number) => [`฿${value.toLocaleString()}`, 'Total Income']}
      />
      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

export const SocioEconomicPieChart: React.FC<{ data: any[] }> = ({ data }) => {
  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', padding: '12px' }}
          itemStyle={{ color: '#fff', fontSize: '13px' }}
          formatter={(value: number, name: string) => {
            const percent = ((value / total) * 100).toFixed(1);
            return [
              <span key="val">
                <span className="text-emerald-400 font-bold">฿{value.toLocaleString()}</span>
                <span className="text-zinc-500 ml-2">({percent}%)</span>
              </span>,
              <span key="name" className="text-zinc-300">{name}</span>
            ];
          }}
        />
        <Legend verticalAlign="bottom" height={36} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const IncomeDistBarChart: React.FC<{ data: any[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
      <XAxis
        dataKey="name"
        stroke="#71717a"
        fontSize={11}
        tickLine={false}
        axisLine={false}
        angle={-30}
        textAnchor="end"
        interval={0}
      />
      <YAxis
        stroke="#71717a"
        fontSize={12}
        tickLine={false}
        axisLine={false}
        tickFormatter={(value) => `${value}%`}
      />
      <Tooltip
        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
        itemStyle={{ color: '#10b981' }}
        formatter={(value: any) => [`${value}%`, 'Percentage']}
      />
      <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30}>
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fillOpacity={0.8} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

