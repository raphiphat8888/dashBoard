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

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px] overflow-y-auto">
                    {/* Section 1 */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                            <UserCircle size={16} /> Profile
                        </h3>
                        <div className="p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-xl space-y-3 hover:border-emerald-500/30 transition-colors">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">Display Name</span>
                                <span className="text-zinc-200 font-medium">Executive User</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">Role</span>
                                <span className="text-zinc-200 font-medium bg-zinc-800 px-2 py-0.5 rounded-md">Administrator</span>
                            </div>
                            <button className="text-emerald-500 text-sm hover:text-emerald-400 mt-2 font-medium">Edit Profile...</button>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                            <BellRing size={16} /> Notifications
                        </h3>
                        <div className="p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-xl space-y-4 hover:border-emerald-500/30 transition-colors">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">Email Alerts</span>
                                <div className="relative inline-block w-10 h-5">
                                    <input type="checkbox" defaultChecked className="peer sr-only" />
                                    <div className="w-10 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                </div>
                            </label>
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">Weekly Reports</span>
                                <div className="relative inline-block w-10 h-5">
                                    <input type="checkbox" defaultChecked className="peer sr-only" />
                                    <div className="w-10 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                            <Globe size={16} /> Regional Data
                        </h3>
                        <div className="p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-xl space-y-4 hover:border-emerald-500/30 transition-colors text-sm">
                            <p className="text-zinc-400">Default tracking region</p>
                            <select className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none">
                                <option>All of Thailand</option>
                                <option>Central Region</option>
                                <option>Northern Region</option>
                                <option>Southern Region</option>
                            </select>
                        </div>
                    </div>

                    {/* Section 4 */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                            <Zap size={16} /> Advanced Features
                        </h3>
                        <div className="p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-xl space-y-4 hover:border-emerald-500/30 transition-colors text-sm">
                            <button className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors border border-zinc-700/50 flex items-center justify-center gap-2">
                                <Zap size={16} className="text-amber-400" />
                                Clear Local Cache
                            </button>
                            <button className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors border border-rose-500/20">
                                Reset Dashboard Layout
                            </button>
                        </div>
                    </div>
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
