import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, AlertTriangle, MapPin } from 'lucide-react';

import { fetchMasterData } from '../services/dataService';

const regions = ["ทั้งหมด", "กลาง", "เหนือ", "ใต้", "ตะวันออก", "ตะวันออกเฉียงเหนือ", "ตะวันตก"];

interface ProvinceDataGridProps {
    globalSearch?: string;
    setGlobalSearch?: (val: string) => void;
}

export const ProvinceDataGrid: React.FC<ProvinceDataGridProps> = ({ globalSearch, setGlobalSearch }) => {
    const [rawData, setRawData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const searchTerm = globalSearch !== undefined ? globalSearch : localSearchTerm;
    const updateSearchTerm = setGlobalSearch || setLocalSearchTerm;

    const [selectedRegion, setSelectedRegion] = useState('ทั้งหมด');
    type SortKey = 'income' | 'debt' | 'poverty' | 'debtRatio';
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'desc' | 'asc' }>({ key: 'income', direction: 'desc' });

    const [debug, setDebug] = useState<string>('');

    React.useEffect(() => {
        fetchMasterData()
            .then(data => {
                if (!data || data.length === 0) {
                    setDebug('No data returned.');
                } else if (!data.some(d => d.province)) {
                    setDebug('No item has province field. First item keys: ' + Object.keys(data[0] || {}).join(', '));
                }

                const mapped = data.filter((d: any) => d.province).map((d: any) => ({
                    region: d.region,
                    province: d.province,
                    income: Number(d.avg_household_income) || 0,
                    debt: Number(d.avg_household_debt) || 0,
                    poverty: Number(d.poverty_line_per_person_month) || 0,
                    debtRatio: Number(d.debt_to_income_months) || 0
                }));
                setRawData(mapped);
                setIsLoading(false);
            })
            .catch(err => {
                setDebug('Error fetching data: ' + err.message);
                setIsLoading(false);
            });
    }, []);

    const filteredAndSortedData = useMemo(() => {
        let result = [...rawData];

        if (selectedRegion !== 'ทั้งหมด') {
            result = result.filter(item => item.region === selectedRegion);
        }

        if (searchTerm) {
            result = result.filter(item =>
                item.province.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        result.sort((a, b) => {
            // @ts-ignore
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
            // @ts-ignore
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [searchTerm, selectedRegion, sortConfig, rawData]);

    const requestSort = (key: SortKey) => {
        let direction: 'desc' | 'asc' = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="space-y-6 mt-8">
            <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-100">เจาะลึกข้อมูลระดับจังหวัด</h2>
                <span className="px-2.5 py-1 text-xs font-semibold bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                    Interactive Data
                </span>
                {isLoading && (
                    <span className="text-sm text-zinc-400 animate-pulse ml-2 flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        กำลังโหลดข้อมูล...
                    </span>
                )}
            </div>

            {/* Control Panel */}
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4 flex flex-col lg:flex-row gap-4 justify-between items-center">
                {/* Search */}
                <div className="relative w-full lg:w-1/3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="ค้นหาจังหวัด..."
                        value={searchTerm}
                        onChange={(e) => updateSearchTerm(e.target.value)}
                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    <Filter size={18} className="text-zinc-500 mr-2 hidden sm:block" />
                    {regions.map(region => (
                        <button
                            key={region}
                            onClick={() => setSelectedRegion(region)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedRegion === region
                                ? 'bg-emerald-500 text-zinc-950'
                                : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-700/50'
                                }`}
                        >
                            {region}
                        </button>
                    ))}
                </div>
            </div>

            {debug && (
                <div className="bg-red-500/20 text-red-400 border border-red-500/50 rounded-xl p-4 text-sm font-mono whitespace-pre-wrap">
                    Debug Info: {debug}
                </div>
            )}

            {/* Data Grid */}
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden">
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-zinc-950/50 border-b border-zinc-800/50 text-xs font-semibold text-zinc-400">
                    <div className="col-span-3">จังหวัด / ภูมิภาค</div>
                    <div className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => requestSort('income')}>
                        รายได้เฉลี่ย <ArrowUpDown size={14} className={sortConfig.key === 'income' ? 'text-emerald-500' : ''} />
                    </div>
                    <div className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => requestSort('debt')}>
                        หนี้สิน <ArrowUpDown size={14} className={sortConfig.key === 'debt' ? 'text-emerald-500' : ''} />
                    </div>
                    <div className="col-span-3">สัดส่วนรายได้ vs หนี้ (Visual)</div>
                    <div className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-emerald-400 transition-colors justify-end" onClick={() => requestSort('poverty')}>
                        เส้นความยากจน <ArrowUpDown size={14} className={sortConfig.key === 'poverty' ? 'text-emerald-500' : ''} />
                    </div>
                </div>

                {/* Data Rows */}
                <div className="divide-y divide-zinc-800/50 max-h-[600px] overflow-y-auto">
                    {filteredAndSortedData.map((data, idx) => {
                        const incomeWidth = Math.min((data.income / 60000) * 100, 100);
                        const debtWidth = Math.min((data.debt / 500000) * 100, 100);
                        const isDanger = data.debtRatio > 8;

                        return (
                            <div
                                key={data.province}
                                className="group flex flex-col md:grid md:grid-cols-12 gap-4 px-6 py-4 items-start md:items-center hover:bg-zinc-800/30 transition-all duration-300 animate-in fade-in"
                                style={{ animationDelay: `${idx * 20}ms`, animationFillMode: 'both' }}
                            >
                                {/* Province */}
                                <div className="col-span-3 w-full">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-emerald-500" />
                                        <span className="font-bold text-zinc-200">{data.province}</span>
                                    </div>
                                    <span className="text-[10px] text-zinc-500 font-medium ml-6 px-1.5 py-0.5 rounded-sm bg-zinc-800/80 uppercase tracking-wider">{data.region}</span>
                                </div>

                                {/* Income */}
                                <div className="col-span-2 w-full flex justify-between md:block">
                                    <span className="md:hidden text-zinc-500 text-sm">รายได้:</span>
                                    <span className="font-semibold text-zinc-300">฿{data.income.toLocaleString()}</span>
                                </div>

                                {/* Debt */}
                                <div className="col-span-2 w-full flex justify-between md:block">
                                    <span className="md:hidden text-zinc-500 text-sm">หนี้สิน:</span>
                                    <span className={isDanger ? "font-semibold text-rose-400" : "font-semibold text-amber-500"}>
                                        ฿{data.debt.toLocaleString()}
                                    </span>
                                </div>

                                {/* Visuals */}
                                <div className="col-span-3 w-full space-y-2 mt-2 md:mt-0">
                                    <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden flex">
                                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${incomeWidth}%` }}></div>
                                    </div>
                                    <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden flex">
                                        <div className={`h-full rounded-full transition-all duration-1000 ease-out ${isDanger ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${debtWidth}%` }}></div>
                                    </div>
                                    {isDanger && <p className="text-[10px] text-rose-400 font-bold tracking-wide">! สัดส่วนหนี้สูง: {data.debtRatio} เท่า</p>}
                                </div>

                                {/* Poverty Line */}
                                <div className="col-span-2 w-full flex justify-between md:justify-end items-center mt-2 md:mt-0">
                                    <span className="md:hidden text-zinc-500 text-sm">เส้นความยากจน:</span>
                                    <span className="text-zinc-400 font-mono text-sm bg-zinc-950 px-2 py-1 rounded border border-zinc-800">฿{data.poverty.toLocaleString()}</span>
                                </div>
                            </div>
                        );
                    })}

                    {filteredAndSortedData.length === 0 && (
                        <div className="text-center py-20 text-zinc-500">
                            <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
                            <p>ไม่พบข้อมูลที่ค้นหา</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
