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

interface RegionalBarChartProps {
  data: any[];
  onBarClick?: (data: any | null, index?: number) => void;
}

export const RegionalBarChart: React.FC<RegionalBarChartProps> = ({ data, onBarClick }) => {
  const getRegionColor = (name: string, index: number) => {
    if (!name) return COLORS[index % COLORS.length];
    const n = name.toString().trim().toLowerCase();
    if (n.includes('ตะวันออกเฉียงเหนือ') || n.includes('northeast')) return '#8b5cf6'; // Purple
    if (n.includes('ตะวันออก') || n.includes('eastern')) return '#ec4899'; // Pink
    if (n.includes('ตะวันตก') || n.includes('western')) return '#ef4444'; // Red
    if (n.includes('กลาง') || n.includes('central')) return '#3b82f6'; // Blue
    if (n.includes('เหนือ') || n.includes('northern')) return '#f59e0b'; // Amber
    if (n.includes('ใต้') || n.includes('southern')) return '#06b6d4'; // Cyan
    return COLORS[index % COLORS.length];
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        style={{ outline: 'none' }}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        onClick={(state: any, event) => {
          if (onBarClick && (!state || !state.activePayload)) {
            onBarClick(null);
          }
        }}
      >
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
        <Bar
          dataKey="value"
          radius={[4, 4, 0, 0]}
          onClick={(data, index) => onBarClick && onBarClick(data, index)}
          className={onBarClick ? 'cursor-pointer hover:opacity-90 transition-opacity duration-200' : ''}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getRegionColor(entry.name, index)} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

interface SocioEconomicPieChartProps {
  data: any[];
  onPieClick?: (data: any | null, index?: number) => void;
}

export const SocioEconomicPieChart: React.FC<SocioEconomicPieChartProps> = ({ data, onPieClick }) => {
  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  const getClassColor = (name: string, index: number) => {
    if (!name) return COLORS[index % COLORS.length];
    const n = name.toString().trim().toLowerCase();
    if (n.includes('ธุรกิจ') || n.includes('business') || n.includes('ไม่ใช่การเกษตร')) return '#3b82f6'; // Blue (Business)
    if (n.includes('เกษตร') || n.includes('agri')) return '#10b981'; // Green (Agriculture)
    if (n.includes('ลูกจ้าง') || n.includes('employee')) return '#f59e0b'; // Amber (Employee)
    if (n.includes('ไม่ได้ปฏิบัติงาน') || n.includes('inactive')) return '#ef4444'; // Red (Inactive)
    return COLORS[index % COLORS.length];
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart
        style={{ outline: 'none' }}
        onClick={(state: any) => {
          if (onPieClick && (!state || !state.activePayload)) {
            onPieClick(null);
          }
        }}
      >
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          onClick={(data, index) => onPieClick && onPieClick(data, index)}
          className={onPieClick ? 'cursor-pointer hover:opacity-90 transition-opacity duration-200' : ''}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getClassColor(entry.name, index)} stroke="none" />
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

interface IncomeDistBarChartProps {
  data: any[];
  onBarClick?: (data: any | null, index?: number) => void;
}

export const IncomeDistBarChart: React.FC<IncomeDistBarChartProps> = ({ data, onBarClick }) => {
  const getDistColor = (name: string, index: number) => {
    if (!name) return '#8b5cf6';
    const n = name.toString().trim().toLowerCase();
    if (n.includes('ค่าจ้างและเงินเดือน') || n.includes('wages') || n.includes('salaries')) return '#3b82f6'; // Blue
    if (n.includes('ทำธุรกิจ') || n.includes('business')) return '#f59e0b'; // Amber
    if (n.includes('ทำการเกษตร') || n.includes('agri')) return '#10b981'; // Green
    if (n.includes('ช่วยเหลือ') || n.includes('assistance') || n.includes('pension')) return '#ef4444'; // Red
    if (n.includes('ทรัพย์สิน') || n.includes('property')) return '#ec4899'; // Pink
    return '#8b5cf6'; // Default Purple for non-cash, etc.
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        style={{ outline: 'none' }}
        margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
        onClick={(state: any) => {
          if (onBarClick && (!state || !state.activePayload)) {
            onBarClick(null);
          }
        }}
      >
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
        <Bar
          dataKey="value"
          radius={[4, 4, 0, 0]}
          barSize={30}
          onClick={(data, index) => onBarClick && onBarClick(data, index)}
          className={onBarClick ? 'cursor-pointer hover:opacity-90 transition-opacity duration-200 cursor-pointer pointer-events-auto' : ''}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getDistColor(entry.name, index)} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

