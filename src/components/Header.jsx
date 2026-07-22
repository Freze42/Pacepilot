import React from 'react';
import { ShieldCheck, UserCheck, Flame, Dumbbell } from 'lucide-react';

export default function Header({ activeTab, user, setUser, shoes }) {
  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Utama';
      case 'training': return 'Annual Training Volume';
      case 'progress': return 'Fitness Progress (CTL/ATL)';
      case 'plans': return 'Training Plans & Coaching';
      case 'social': return 'Social Feed (Klub & Aktivitas)';
      case 'gear': return 'Gear Tracker (Mil Sepatu)';
      case 'coaching': return 'Coaching AI Session';
      case 'admin': return 'Admin Panel (Kelola Member)';
      default: return 'PacePilot';
    }
  };

  const activeShoe = shoes.find(s => s.active);
  const shoeWarning = activeShoe && activeShoe.mileage >= activeShoe.limit - 50;

  // Toggle user role for testing admin features!
  const toggleRole = () => {
    const nextRole = user.role === 'admin' ? 'member' : 'admin';
    setUser({ ...user, role: nextRole });
  };

  const getVO2MaxStatus = (val) => {
    if (val > 55) return { text: 'Excellent 🔥', color: 'text-rose-400' };
    if (val > 47) return { text: 'Good ⭐', color: 'text-amber-400' };
    return { text: 'Average 👍', color: 'text-emerald-400' };
  };

  const userVo2Max = user.vo2maxHistory[user.vo2maxHistory.length - 1]?.value || 48;

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-slate-100 tracking-tight">{getTitle()}</h2>
        
        {/* Active Shoe Warning Badge */}
        {shoeWarning && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Sepatu hampir pensiun! ({Math.round(activeShoe.mileage)} km)</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Stats Grid */}
        <div className="hidden lg:flex items-center gap-6 text-xs border-r border-slate-800 pr-6">
          {/* Active Program */}
          {user.activeProgramId ? (
            <div className="text-right">
              <span className="text-slate-400 block">Program Aktif</span>
              <span className="font-semibold text-rose-400 uppercase tracking-wider">{user.activeProgramId.toUpperCase()} Run</span>
            </div>
          ) : (
            <div className="text-right">
              <span className="text-slate-400 block">Program Aktif</span>
              <span className="font-semibold text-slate-500">Belum Terdaftar</span>
            </div>
          )}

          {/* VO2Max Widget */}
          <div className="text-right">
            <span className="text-slate-400 block">VO2Max Terkalkulasi</span>
            <div className="flex items-center justify-end gap-1 font-bold">
              <span className="text-white text-sm">{userVo2Max}</span>
              <span className={`text-[10px] ${getVO2MaxStatus(userVo2Max).color}`}>{getVO2MaxStatus(userVo2Max).text}</span>
            </div>
          </div>
        </div>

        {/* Role Toggle Trigger for demo purposes */}
        <button
          onClick={toggleRole}
          title="Klik untuk mensimulasikan role Admin / Member"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            user.role === 'admin'
              ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30 hover:bg-violet-600/30'
              : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700/80'
          }`}
        >
          {user.role === 'admin' ? (
            <>
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Simulasi Admin</span>
            </>
          ) : (
            <>
              <UserCheck className="h-3.5 w-3.5" />
              <span>Simulasi Member</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
