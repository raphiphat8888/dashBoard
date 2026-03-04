import React from 'react';
import { LayoutDashboard, PieChart, BarChart3, Settings, Users, Map } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/LanguageContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSettings: () => void;
}

const menuItems = [
  { id: 'overview', labelKey: 'Sidebar.Overview', icon: LayoutDashboard },
  { id: 'regions', labelKey: 'Sidebar.RegionalAnalysis', icon: Map },
  { id: 'demographics', labelKey: 'Sidebar.SocioEconomic', icon: Users },
  { id: 'analytics', labelKey: 'Sidebar.Analytics', icon: BarChart3 },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onSettings }) => {
  const { t } = useLanguage();

  return (
    <div className="w-64 bg-zinc-950 text-zinc-400 flex flex-col h-full border-r border-zinc-800/50 z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-zinc-950 font-bold">
          D
        </div>
        <span className="text-zinc-100 font-semibold tracking-tight text-lg">Executive</span>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
              activeTab === item.id
                ? "bg-emerald-500/10 text-emerald-500"
                : "hover:bg-zinc-900 hover:text-zinc-200"
            )}
          >
            <item.icon size={18} className={cn(
              "transition-colors",
              activeTab === item.id ? "text-emerald-500" : "group-hover:text-zinc-200"
            )} />
            <span className="text-sm font-medium">{t(item.labelKey)}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800/50 space-y-1">
        <button
          onClick={onSettings}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-900 hover:text-zinc-200 transition-all"
        >
          <Settings size={18} />
          <span className="text-sm font-medium">{t('Sidebar.Settings')}</span>
        </button>
      </div>
    </div>
  );
};
