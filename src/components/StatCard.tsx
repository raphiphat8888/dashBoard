import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  color: 'emerald' | 'blue' | 'amber' | 'rose';
}

const colorMap = {
  emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon: Icon, color }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-2xl hover:border-zinc-700 transition-all group"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-zinc-100 mt-2 tracking-tight">{value}</h3>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn(
                "text-xs font-medium px-1.5 py-0.5 rounded-md",
                isPositive ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
              )}>
                {isPositive ? '+' : ''}{change}
              </span>
              <span className="text-xs text-zinc-600">vs last period</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110 duration-300 border", colorMap[color])}>
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
};
