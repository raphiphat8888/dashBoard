import React from 'react';
import { LayoutDashboard, PieChart, BarChart3, Users, Map } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/LanguageContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'overview', labelKey: 'Sidebar.Overview', icon: LayoutDashboard },
  { id: 'regions', labelKey: 'Sidebar.RegionalAnalysis', icon: Map },
  { id: 'demographics', labelKey: 'Sidebar.SocioEconomic', icon: Users },
  { id: 'analytics', labelKey: 'Sidebar.Analytics', icon: BarChart3 },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();

  return (
    <div className="w-64 bg-zinc-950 text-zinc-400 flex flex-col h-full border-r border-zinc-800/50 z-20">
      <nav className="flex-1 px-4 space-y-1 mt-6">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
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
          </motion.button>
        ))}
      </nav>
    </div>
  );
};
