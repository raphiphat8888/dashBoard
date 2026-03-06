import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  Users,
  MapPin,
  Wallet,
  ArrowUpRight,
  Filter,
  Loader2,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StatCard } from './components/StatCard';
import { ChartCard, RegionalBarChart, SocioEconomicPieChart, IncomeDistBarChart } from './components/Charts';
import { SettingsModal } from './components/SettingsModal';
import { FilterModal } from './components/FilterModal';
import {
  fetchIncomeData,
  getAggregatedDataByRegion,
  getTopProvinces,
  getIncomeByClass,
  fetchIncomeDistData,
  getIncomeDistSummary
} from './services/dataService';
import { useLanguage } from './lib/LanguageContext';
import { ProvinceDataGrid } from './components/ProvinceDataGrid';
import { IncomeData } from './types';

export default function App() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiReport, setAiReport] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // System states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    region: 'All Regions',
    year: '2023',
    incomeType: 'Total Monthly Income'
  });

  const handleGenerateReport = () => {
    setActiveTab('analytics');
    setIsGenerating(true);
    setAiReport(false);
    setTimeout(() => {
      setIsGenerating(false);
      setAiReport(true);
    }, 2500);
  };

  const handleExportData = () => {
    // Quick CSV export
    const headers = ["Province", "Region", "Income", "Class"];
    const csvRows = [headers.join(",")];

    filteredData.forEach(row => {
      csvRows.push(`${row.province},${row.region},${row.value},${row.soc_eco_class1}`);
    });

    // Add BOM for Excel UTF-8
    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "economic_data_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewAllProvinces = () => {
    const grid = document.getElementById('province-data-grid');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const [data, setData] = useState<IncomeData[]>([]);
  const [distData, setDistData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchIncomeData(), fetchIncomeDistData()]).then(([res1, res2]) => {
      setData(res1);
      setDistData(res2);
      setIsLoading(false);
    });
  }, []);

  const bkkProvinces = ['กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'สมุทรสาคร', 'นครปฐม'];

  const filteredData = useMemo(() => {
    return data.filter(d => {
      // 1. Year Filter
      if (filters.year) {
        // Use loose equality or string conversion to be safe with types from PapaParse
        if (String(d.year_ad) !== String(filters.year)) return false;
      }

      // 2. Income Type Filter
      let matchIncome = false;
      const cleanIncome3 = d.source_income3?.trim();
      const cleanIncome1 = d.source_income1?.trim();

      switch (filters.incomeType) {
        case 'Wages & Salaries':
          matchIncome = cleanIncome3 === 'ค่าจ้างและเงินเดือน';
          break;
        case 'Business Income':
          matchIncome = cleanIncome3 === 'กำไรสุทธิจากการทำธุรกิจ';
          break;
        case 'Agriculture & Farm':
          matchIncome = cleanIncome3 === 'กำไรสุทธิจากการทำการเกษตร';
          break;
        case 'Pensions & Assistance':
          matchIncome = cleanIncome3 === 'เงินที่ได้รับเป็นการช่วยเหลือ';
          break;
        case 'Total Monthly Income':
        default:
          matchIncome = cleanIncome1 === 'รายได้ทั้งสิ้นต่อเดือน';
          break;
      }
      if (!matchIncome) return false;

      // 3. Region Filter
      if (filters.region !== 'All Regions') {
        const cleanRegion = d.region?.trim();
        if (filters.region === 'Bangkok Metropolitan') {
          if (!bkkProvinces.includes(d.province)) return false;
        } else if (filters.region === 'Central') {
          if (cleanRegion !== 'กลาง' || bkkProvinces.includes(d.province)) return false;
        } else if (filters.region === 'Northern' && cleanRegion !== 'เหนือ') return false;
        else if (filters.region === 'Northeastern' && cleanRegion !== 'ตะวันออกเฉียงเหนือ') return false;
        else if (filters.region === 'Southern' && cleanRegion !== 'ใต้') return false;
        else if (filters.region === 'Eastern' && cleanRegion !== 'ตะวันออก') return false;
        else if (filters.region === 'Western' && cleanRegion !== 'ตะวันตก') return false;
      }

      return true;
    });
  }, [data, filters]);

  // Create a list of provinces that match the region filter to filter distData
  const activeProvinces = useMemo(() => {
    return Array.from(new Set(filteredData.map(d => d.province)));
  }, [filteredData]);

  const filteredDistData = useMemo(() => {
    return distData.filter(d => {
      // 1. Year matching (income_distribution_2566 has 2566)
      // We convert e.g. 2023 -> 2566 for this specific dataset
      const thaiYear = parseInt(filters.year) + 543;
      if (Number(d.year) !== thaiYear) return false;

      // 2. Region Filter (match by provinces found in filteredData)
      if (filters.region !== 'All Regions') {
        if (!activeProvinces.includes(d.province)) return false;
      }

      return true;
    });
  }, [distData, activeProvinces, filters.year, filters.region]);

  const regionalData = useMemo(() => getAggregatedDataByRegion(filteredData), [filteredData]);
  const topProvinces = useMemo(() => getTopProvinces(filteredData), [filteredData]);
  const classData = useMemo(() => getIncomeByClass(filteredData), [filteredData]);
  const incomeDistSummary = useMemo(() => getIncomeDistSummary(filteredDistData), [filteredDistData]);

  const totalIncome = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.value, 0);
  }, [filteredData]);

  const avgIncome = useMemo(() => {
    return filteredData.length ? totalIncome / filteredData.length : 0;
  }, [filteredData, totalIncome]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-zinc-400">กำลังโหลดข้อมูลระบบ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex bg-zinc-950 font-sans selection:bg-emerald-500/30 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_800px_at_100%_200px,#10b9810a,transparent)]"></div>

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          searchTerm={globalSearch}
          onSearchChange={setGlobalSearch}
          onSearchSubmit={() => {
            setActiveTab('overview');
            setTimeout(handleViewAllProvinces, 100);
          }}
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">
                  {activeTab === 'overview' && t('App.Title.overview')}
                  {activeTab === 'regions' && t('App.Title.regions')}
                  {activeTab === 'demographics' && t('App.Title.demographics')}
                  {activeTab === 'analytics' && t('App.Title.analytics')}
                </h1>
                <p className="text-zinc-500 mt-1">
                  {language === 'en'
                    ? `Household Income Analysis - Thailand ${filters.year}`
                    : `วิเคราะห์รายได้ครัวเรือน - ประเทศไทย ปี ${parseInt(filters.year) + 543}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-all"
                >
                  <Filter size={16} />
                  {t('App.FiltersBtn')}
                </button>
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-zinc-950 rounded-xl text-sm font-semibold hover:bg-emerald-400 transition-all">
                  {t('App.ExportBtn')}
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>

            {/* Content Display based on Active Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title={t('App.Stat.TotalIncome')}
                    value={`฿${(totalIncome / 1000000).toFixed(2)}M`}
                    change="12.5%"
                    isPositive={true}
                    icon={Wallet}
                    color="emerald"
                    onClick={() => setActiveTab('analytics')}
                  />
                  <StatCard
                    title={t('App.Stat.AvgHousehold')}
                    value={`฿${avgIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    change="4.2%"
                    isPositive={true}
                    icon={TrendingUp}
                    color="blue"
                    onClick={() => setActiveTab('demographics')}
                  />
                  <StatCard
                    title={t('App.Stat.ProvincesTracked')}
                    value="77"
                    icon={MapPin}
                    color="amber"
                    onClick={() => {
                      setActiveTab('regions');
                    }}
                  />
                  <StatCard
                    title={t('App.Stat.EconomicGroups')}
                    value="8"
                    icon={Users}
                    color="rose"
                    onClick={() => setActiveTab('demographics')}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                  <div className="lg:col-span-2">
                    <ChartCard
                      title={t('App.Chart.RegionTitle')}
                      subtitle={t('App.Chart.RegionSub')}
                    >
                      <RegionalBarChart data={regionalData} />
                    </ChartCard>
                  </div>
                  <div className="lg:col-span-1">
                    <ChartCard
                      title={t('App.Chart.ClassTitle')}
                      subtitle={t('App.Chart.ClassSub')}
                    >
                      <SocioEconomicPieChart data={classData} />
                    </ChartCard>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                  <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-zinc-100">{t('App.TopProv.Title')}</h3>
                      <button onClick={handleViewAllProvinces} className="text-sm text-emerald-500 hover:text-emerald-400 font-medium">{t('App.TopProv.ViewAll')}</button>
                    </div>
                    <div className="divide-y divide-zinc-800/50">
                      {topProvinces.slice(0, 5).map((province, idx) => (
                        <div key={province.name} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-all">
                          <div className="flex items-center gap-4">
                            <span className="text-zinc-600 font-mono text-sm">{String(idx + 1).padStart(2, '0')}</span>
                            <span className="text-zinc-200 font-medium">{province.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-zinc-100 font-semibold">฿{province.value.toLocaleString()}</p>
                            <p className="text-xs text-zinc-500">{t('App.TopProv.MonthlyAvg')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-emerald-500 rounded-2xl p-8 relative overflow-hidden group">
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-zinc-950 leading-tight">{t('App.AI.PromoTitle')}</h3>
                        <p className="text-emerald-900/80 mt-4 max-w-sm">
                          {t('App.AI.PromoSub')}
                        </p>
                      </div>
                      <button
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                        className="mt-8 w-fit px-6 py-3 bg-zinc-950 text-emerald-500 rounded-xl font-bold hover:bg-zinc-900 transition-all shadow-xl"
                      >
                        {isGenerating ? t('App.AI.Analyzing') : t('App.AI.RunBtn')}
                      </button>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-400/50 rounded-full blur-3xl group-hover:bg-emerald-300/50 transition-all duration-700"></div>
                    <div className="absolute top-4 right-4 text-zinc-950/10">
                      <TrendingUp size={120} />
                    </div>
                  </div>
                </div>

                <div id="province-data-grid">
                  <ProvinceDataGrid globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} filters={filters} />
                </div>
              </>
            )}

            {activeTab === 'regions' && (
              <div className="space-y-8 mt-6">
                <ChartCard
                  title={t('App.Chart.RegionTitle')}
                  subtitle={t('App.Chart.RegionSub')}
                >
                  <div className="h-[400px]">
                    <RegionalBarChart data={regionalData} />
                  </div>
                </ChartCard>
              </div>
            )}

            {activeTab === 'demographics' && (
              <div className="space-y-8 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <ChartCard
                    title={t('App.Chart.ClassTitle')}
                    subtitle={t('App.Chart.ClassSub')}
                  >
                    <div className="h-[400px] flex items-center justify-center">
                      <SocioEconomicPieChart data={classData} />
                    </div>
                  </ChartCard>

                  <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl px-6 py-8 h-[400px] overflow-y-auto">
                    <h3 className="text-lg font-semibold text-zinc-100 mb-6">{t('App.Demo.DistMetrics')}</h3>
                    <div className="space-y-4">
                      {classData.map((cls, i) => (
                        <div key={i} className="flex justify-between items-center p-3 hover:bg-zinc-800/30 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'][i % 6]}`}></div>
                            <span className="text-zinc-300 font-medium">{cls.name}</span>
                          </div>
                          <span className="text-zinc-100 font-semibold">฿{cls.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <ChartCard
                    title="การกระจายรายได้ตามขนาดครัวเรือน (Income Distribution)"
                    subtitle="แสดงร้อยละเฉลี่ยของครัวเรือนตามช่วงรายได้ (Average distribution across all provinces)"
                  >
                    <div className="h-[350px]">
                      <IncomeDistBarChart data={incomeDistSummary} />
                    </div>
                  </ChartCard>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-8 mt-6">
                <div className="bg-emerald-500 rounded-2xl p-10 relative overflow-hidden group">
                  <div className="relative z-10">
                    <h3 className="text-4xl font-bold text-zinc-950 leading-tight tracking-tight">{t('App.An.Title')}</h3>
                    <p className="text-emerald-900/90 mt-4 max-w-2xl text-lg">
                      {t('App.An.Sub')}
                    </p>
                    <div className="mt-10 flex gap-4">
                      <button
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                        className="px-6 py-3 flex items-center gap-2 bg-zinc-950 text-emerald-500 rounded-xl font-bold hover:bg-zinc-900 transition-all shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                        {isGenerating ? t('App.AI.Analyzing') : t('App.An.GenBtn')}
                      </button>
                      <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="px-6 py-3 bg-emerald-400 text-zinc-950 rounded-xl font-bold hover:bg-emerald-300 transition-all shadow-xl">
                        {t('App.An.ConfigBtn')}
                      </button>
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute -right-12 -bottom-32 w-96 h-96 bg-emerald-400/50 rounded-full blur-3xl group-hover:bg-emerald-300/50 transition-all duration-700"></div>
                  <div className="absolute top-8 right-12 text-zinc-950/10 scale-150">
                    <TrendingUp size={160} />
                  </div>
                </div>

                {/* AI Generated Report Area */}
                {aiReport && (
                  <div className="bg-zinc-900/50 border border-emerald-500/30 rounded-2xl p-8 relative animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="absolute top-0 right-0 p-4">
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-semibold rounded-full border border-emerald-500/20">
                        <CheckCircle2 size={14} /> {t('App.An.AIVerified')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                        <Sparkles size={20} />
                      </div>
                      <h3 className="text-2xl font-bold text-zinc-100">{t('App.An.AISummary')}</h3>
                    </div>

                    <div className="space-y-5 text-zinc-300 leading-relaxed">
                      <p>
                        {t('App.An.BasedOn')} <strong className="text-zinc-100">77 {t('App.An.Provinces')}</strong>{t('App.An.TotalIs')} <strong className="text-zinc-100 font-mono text-emerald-400">฿{(totalIncome / 1000000).toFixed(2)}M</strong>.
                      </p>

                      <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/80">
                        <h4 className="text-zinc-100 font-semibold mb-3">{t('App.An.KeyObs')}</h4>
                        <ul className="space-y-3">
                          <li className="flex gap-3">
                            <TrendingUp size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span><strong className="text-zinc-200">{t('App.An.Obs1.Title')}</strong> {t('App.An.Obs1.Desc')}</span>
                          </li>
                          <li className="flex gap-3">
                            <Users size={18} className="text-blue-500 shrink-0 mt-0.5" />
                            <span><strong className="text-zinc-200">{t('App.An.Obs2.Title')}</strong> {t('App.An.Obs2.Desc')}</span>
                          </li>
                          <li className="flex gap-3">
                            <MapPin size={18} className="text-amber-500 shrink-0 mt-0.5" />
                            <span><strong className="text-zinc-200">{t('App.An.Obs3.Title')}</strong> {topProvinces.slice(0, 3).map(p => p.name).join(', ')} {t('App.An.Obs3.Desc')}</span>
                          </li>
                        </ul>
                      </div>

                      <p className="text-sm text-zinc-500 mt-4 italic">
                        {t('App.An.Rec')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={(newFilters) => {
          setFilters(newFilters);
        }}
        currentFilters={filters}
      />
    </div>
  );
}
