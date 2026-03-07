import React from 'react';
import { X, SlidersHorizontal, Zap, BellRing, UserCircle, Globe } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Click-away backdrop */}
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-zinc-800/50 bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                            <SlidersHorizontal size={18} />
                        </div>
                        <h2 className="text-xl font-bold text-zinc-100">Preferences & Settings</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 h-[400px] overflow-y-auto flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-6">
                        <SlidersHorizontal size={32} className="text-zinc-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-300 mb-2">Configurations Currently Unavailable</h3>
                    <p className="text-zinc-500 max-w-sm">
                        The settings module is currently under development. Preferences cannot be modifying at this time.
                    </p>
                </div>

                <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/80 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-zinc-400 font-medium hover:bg-zinc-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
