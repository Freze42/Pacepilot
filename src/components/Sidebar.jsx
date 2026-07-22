import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Users, 
  Footprints, 
  Bot, 
  ShieldAlert,
  LogOut,
  Zap
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'training', label: 'Annual Volume', icon: BarChart3 },
    { id: 'progress', label: 'Fitness Progress', icon: TrendingUp },
    { id: 'plans', label: 'Training Plans', icon: Calendar },
    { id: 'coaching', label: 'Coaching AI', icon: Bot },
    { id: 'social', label: 'Social Feed', icon: Users },
    { id: 'gear', label: 'Gear Tracker', icon: Footprints },
  ];

  // If user is admin, show Admin Panel
  if (user && user.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin Panel', icon: ShieldAlert });
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0">
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2.5">
        <div className="bg-gradient-to-br from-rose-500 to-amber-500 p-1.5 rounded-lg shadow-lg shadow-rose-500/10">
          <Zap className="h-5 w-5 text-white animate-pulse" />
        </div>
        <div>
          <span className="font-bold text-lg text-white tracking-wide">Pace<span className="text-rose-500">Pilot</span></span>
          <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">AI Running Engine</span>
        </div>
      </div>

      {/* User Mini-Profile */}
      <div className="p-4 border-b border-slate-800/60 bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center font-bold text-rose-400 text-base shadow-inner">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-slate-100 truncate">{user.name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                user.level === 'pro' 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                  : user.level === 'intermediate'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {user.level}
              </span>
              {user.role === 'admin' && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider bg-violet-500/20 text-violet-400 border border-violet-500/30">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-rose-500/10 text-rose-400 border-l-2 border-rose-500 shadow-md shadow-rose-500/5'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`h-4.5 w-4.5 transition-colors ${isActive ? 'text-rose-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Keluar Sesi</span>
        </button>
      </div>
    </aside>
  );
}
