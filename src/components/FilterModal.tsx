import React, { useState, useEffect } from 'react';
import { X, Filter as FilterIcon, Search, Calendar, MapPin, Briefcase } from 'lucide-react';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: any) => void;
    currentFilters: {
        region: string;
        year: string;
        incomeType: string;
    }
}

export const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply, currentFilters }) => {
    const [region, setRegion] = useState(currentFilters.region);
    const [year, setYear] = useState(currentFilters.year);
    const [incomeType, setIncomeType] = useState(currentFilters.incomeType);

    useEffect(() => {
        if (isOpen) {
            setRegion(currentFilters.region);
            setYear(currentFilters.year);
            setIncomeType(currentFilters.incomeType);
        }
    }, [isOpen, currentFilters]);

    if (!isOpen) return null;

    const handleApply = () => {
        onApply({ region, year, incomeType });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-zinc-800/50 bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                            <FilterIcon size={18} />
                        </div>
                        <h2 className="text-xl font-bold text-zinc-100">Filter Data</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                            <MapPin size={16} className="text-emerald-500" /> Geographic Region
                        </label>
                        <select
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all shadow-inner"
                        >
                            <option>All Regions</option>
                            <option>Bangkok Metropolitan</option>
                            <option>Central</option>
                            <option>Northern</option>
                            <option>Northeastern</option>
                            <option>Southern</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                            <Calendar size={16} className="text-emerald-500" /> Survey Year
                        </label>
                        <div className="flex gap-3">
                            {['2021', '2022', '2023'].map(y => (
                                <button
                                    key={y}
                                    onClick={() => setYear(y)}
                                    className={`flex-1 py-2.5 rounded-xl border font-medium transition-all ${year === y ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                                >
                                    {y}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                            <Briefcase size={16} className="text-emerald-500" /> Income Segment
                        </label>
                        <select
                            value={incomeType}
                            onChange={(e) => setIncomeType(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all shadow-inner"
                        >
                            <option>Total Monthly Income</option>
                            <option>Wages & Salaries</option>
                            <option>Business Income</option>
                            <option>Agriculture & Farm</option>
                            <option>Pensions & Assistance</option>
                        </select>
                    </div>
                </div>

                <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/80 flex justify-between items-center px-6">
                    <button
                        onClick={() => { setRegion('All Regions'); setYear('2023'); setIncomeType('Total Monthly Income'); }}
                        className="text-sm text-zinc-500 hover:text-zinc-300 font-medium transition-colors"
                    >
                        Reset Defaults
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-zinc-400 font-medium hover:bg-zinc-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApply}
                            className="px-6 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
