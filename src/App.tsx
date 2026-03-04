import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  Wallet,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StatCard } from './components/StatCard';
import { ChartCard, RegionalBarChart, SocioEconomicPieChart } from './components/Charts';
import { 
  parseIncomeData, 
  getAggregatedDataByRegion, 
  getTopProvinces, 
  getIncomeByClass 
} from './services/dataService';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const data = useMemo(() => parseIncomeData(), []);
  
  const regionalData = useMemo(() => getAggregatedDataByRegion(data), [data]);
  const topProvinces = useMemo(() => getTopProvinces(data), [data]);
  const classData = useMemo(() => getIncomeByClass(data), [data]);

  const totalIncome = useMemo(() => {
    return data
      .filter(d => d.source_income1 === 'รายได้ทั้งสิ้นต่อเดือน')
      .reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

  const avgIncome = useMemo(() => {
    const filtered = data.filter(d => d.source_income1 === 'รายได้ทั้งสิ้นต่อเดือน');
    return filtered.length ? totalIncome / filtered.length : 0;
  }, [data, totalIncome]);

  return (
    <div className="flex min-h-screen bg-zinc-950 font-sans selection:bg-emerald-500/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#10b9810a,transparent)]"></div>
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Executive Overview</h1>
                <p className="text-zinc-500 mt-1">Household Income Analysis - Thailand 2023</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-all">
                  <Filter size={16} />
                  Filters
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-zinc-950 rounded-xl text-sm font-semibold hover:bg-emerald-400 transition-all">
                  Export Report
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Monthly Income" 
                value={`฿${(totalIncome / 1000000).toFixed(2)}M`}
                change="12.5%"
                isPositive={true}
                icon={Wallet}
                color="emerald"
              />
              <StatCard 
                title="Average Household" 
                value={`฿${avgIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                change="4.2%"
                isPositive={true}
                icon={TrendingUp}
                color="blue"
              />
              <StatCard 
                title="Provinces Tracked" 
                value="77"
                icon={MapPin}
                color="amber"
              />
              <StatCard 
                title="Economic Groups" 
                value="8"
                icon={Users}
                color="rose"
              />
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ChartCard 
                  title="Income Distribution by Region" 
                  subtitle="Aggregated monthly income across major Thailand regions"
                >
                  <RegionalBarChart data={regionalData} />
                </ChartCard>
              </div>
              <div className="lg:col-span-1">
                <ChartCard 
                  title="Socio-Economic Class" 
                  subtitle="Income share by household category"
                >
                  <SocioEconomicPieChart data={classData} />
                </ChartCard>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-zinc-100">Top Performing Provinces</h3>
                  <button className="text-sm text-emerald-500 hover:text-emerald-400 font-medium">View All</button>
                </div>
                <div className="divide-y divide-zinc-800/50">
                  {topProvinces.map((province, idx) => (
                    <div key={province.name} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-all">
                      <div className="flex items-center gap-4">
                        <span className="text-zinc-600 font-mono text-sm">{String(idx + 1).padStart(2, '0')}</span>
                        <span className="text-zinc-200 font-medium">{province.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-zinc-100 font-semibold">฿{province.value.toLocaleString()}</p>
                        <p className="text-xs text-zinc-500">Monthly Avg</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-500 rounded-2xl p-8 relative overflow-hidden group">
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-zinc-950 leading-tight">Generate AI Insights for your next strategy</h3>
                    <p className="text-emerald-900/80 mt-4 max-w-sm">
                      Our advanced analytics engine can predict economic trends based on current household data.
                    </p>
                  </div>
                  <button className="mt-8 w-fit px-6 py-3 bg-zinc-950 text-emerald-500 rounded-xl font-bold hover:bg-zinc-900 transition-all shadow-xl">
                    Run Analysis
                  </button>
                </div>
                {/* Decorative elements */}
                <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-400/50 rounded-full blur-3xl group-hover:bg-emerald-300/50 transition-all duration-700"></div>
                <div className="absolute top-4 right-4 text-zinc-950/10">
                  <TrendingUp size={120} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
