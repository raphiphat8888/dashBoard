import React from 'react';
import { Search, Bell, User } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input
            type="text"
            placeholder="Search data, provinces, or metrics..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-full transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-zinc-950"></span>
        </button>
        <div className="h-8 w-[1px] bg-zinc-800 mx-2"></div>
        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-zinc-100 leading-none">Executive User</p>
            <p className="text-xs text-zinc-500 mt-1">Administrator</p>
          </div>
          <div className="w-9 h-9 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 group-hover:bg-zinc-700 transition-all">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};
