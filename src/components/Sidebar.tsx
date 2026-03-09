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
      <div className="p-6 flex items-center justify-center border-b border-zinc-800/50 mb-4">
        <motion.div
          initial={{ rotate: -20, scale: 0.8, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1
          }}
          whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1, transition: { duration: 0.5 } }}
          className="text-3xl cursor-pointer"
        >
          📈
        </motion.div>
        <motion.span
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="ml-3 text-zinc-100 font-bold tracking-tight text-xl bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
        >
          DataSight
        </motion.span>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
              activeTab === item.id
                ? "bg-emerald-500/10 text-emerald-500"
                : "hover:bg-zinc-900/80 hover:text-zinc-200"
            )}
          >
            {activeTab === item.id && (
              <motion.div
                layoutId="active-indicator"
                className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
            <motion.div
              whileHover={{ rotate: [0, -15, 15, 0], transition: { duration: 0.4 } }}
            >
              <item.icon size={18} className={cn(
                "transition-colors",
                activeTab === item.id ? "text-emerald-500" : "group-hover:text-zinc-200"
              )} />
            </motion.div>
            <span className="text-sm font-medium">{t(item.labelKey)}</span>
          </motion.button>
        ))}
      </nav>
    </div>
  );
};
