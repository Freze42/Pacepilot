import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Compass, 
  Flame, 
  Edit2, 
  Plus, 
  Megaphone, 
  Activity, 
  Search,
  Check
} from 'lucide-react';

export default function AdminPanel({ user, setUser }) {
  // Mock member database in admin state (persisted locally)
  const [members, setMembers] = useState(() => {
    const local = localStorage.getItem('admin_members');
    if (local) return JSON.parse(local);
    const initial = [
      { id: 'm1', name: 'Naufal Hakim', level: 'pro', vo2max: 58.4, email: 'naufal@run.com', activeProgram: '21k' },
      { id: 'm2', name: 'Adinda Lestari', level: 'beginner', vo2max: 38.2, email: 'adinda@run.com', activeProgram: '5k' },
      { id: 'm3', name: 'Rio Pratama', level: user.level, vo2max: user.vo2maxHistory[user.vo2maxHistory.length-1]?.value || 48.0, email: 'rio@run.com', activeProgram: user.activeProgramId || '10k' },
      { id: 'm4', name: 'Budi Santoso', level: 'intermediate', vo2max: 46.5, email: 'budi@run.com', activeProgram: '10k' }
    ];
    localStorage.setItem('admin_members', JSON.stringify(initial));
    return initial;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [editingMember, setEditingMember] = useState(null);
  const [announcements, setAnnouncements] = useState(() => {
    const local = localStorage.getItem('admin_announcements');
    return local ? JSON.parse(local) : [
      "Selamat menyambut Jakarta Half Marathon! Pastikan untuk mendownload rute GPX di tab plans.",
      "Informasi: Sesi kekuatan otot hari Rabu diperbarui dengan video gerakan core-preventing injury baru."
    ];
  });
  const [newAnnouncement, setNewAnnouncement] = useState('');

  const handleEditMember = (member) => {
    setEditingMember({ ...member });
  };

  const handleSaveMember = (e) => {
    e.preventDefault();
    const updated = members.map(m => {
      if (m.id === editingMember.id) {
        // If editing the current user (Rio Pratama), update the main user state!
        if (m.name === user.name) {
          const userVo2History = [...user.vo2maxHistory];
          // Replace or append last value
          userVo2History[userVo2History.length - 1] = { date: new Date().toISOString().split('T')[0], value: parseFloat(editingMember.vo2max) };
          
          const updatedUser = { 
            ...user, 
            level: editingMember.level, 
            vo2maxHistory: userVo2History 
          };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        return editingMember;
      }
      return m;
    });

    setMembers(updated);
    localStorage.setItem('admin_members', JSON.stringify(updated));
    setEditingMember(null);
  };

  const handleAddAnnouncement = (e) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;

    const updated = [newAnnouncement, ...announcements];
    setAnnouncements(updated);
    localStorage.setItem('admin_announcements', JSON.stringify(updated));
    setNewAnnouncement('');
  };

  const handleDeleteAnnouncement = (idx) => {
    const updated = announcements.filter((_, i) => i !== idx);
    setAnnouncements(updated);
    localStorage.setItem('admin_announcements', JSON.stringify(updated));
  };

  // Filtered members
  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Platform aggregates
  const totalKms = 3524.8;
  const avgVo2Max = (members.reduce((acc, m) => acc + m.vo2max, 0) / members.length).toFixed(1);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      
      {/* 1. Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/25 px-2.5 py-0.5 rounded font-extrabold uppercase tracking-wider">
            ADMINISTRATOR VIEW ONLY
          </span>
          <h3 className="text-xl font-extrabold text-white mt-1.5 flex items-center gap-1.5">
            <ShieldAlert className="h-5.5 w-5.5 text-violet-400" />
            <span>Panel Pengendalian Member PacePilot</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">Mengelola tingkat kebugaran lari, merubah level kompetisi atlet, dan mempublikasikan pengumuman ke seluruh member.</p>
        </div>
      </div>

      {/* 2. Platform Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4 shadow-md">
          <div className="p-2.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/10">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold">Total Member Terdaftar</span>
            <span className="text-lg font-extrabold text-white">{members.length} Atlet</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4 shadow-md">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold">Kilometer Terkumpul</span>
            <span className="text-lg font-extrabold text-white">{totalKms} km</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4 shadow-md">
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/10">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold">Rata-rata VO2Max Platform</span>
            <span className="text-lg font-extrabold text-white">{avgVo2Max} ml/kg/min</span>
          </div>
        </div>
      </div>

      {/* 3. Bottom Columns: Members List & Custom announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Members Management Table (2/3 width) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col h-[400px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-3">
            <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="h-4 w-4 text-violet-400" />
              <span>Daftar Member Terintegrasi</span>
            </h4>

            {/* Search */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Cari member lari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500 w-[180px]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-2">Nama Pelari</th>
                  <th className="py-2">Kompetensi</th>
                  <th className="py-2">Program</th>
                  <th className="py-2">VO2Max</th>
                  <th className="py-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-850/20 text-slate-300">
                    <td className="py-2.5">
                      <div className="font-bold text-slate-100">{m.name}</div>
                      <span className="text-[10px] text-slate-500">{m.email}</span>
                    </td>
                    <td className="py-2.5">
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                        m.level === 'pro' 
                          ? 'bg-rose-500/20 text-rose-400' 
                          : m.level === 'intermediate'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {m.level}
                      </span>
                    </td>
                    <td className="py-2.5 font-semibold uppercase text-[10px] text-slate-400">{m.activeProgram.toUpperCase()} Plan</td>
                    <td className="py-2.5 font-bold text-slate-200">{m.vo2max}</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => handleEditMember(m)}
                        className="p-1 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 rounded transition-colors"
                        title="Edit Profil Kompetensi"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Announcements Publisher (1/3 width) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col h-[400px]">
          <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3 mb-4 flex items-center gap-1.5">
            <Megaphone className="h-4 w-4 text-violet-400" />
            <span>Papan Pengumuman Admin</span>
          </h4>

          {/* Form */}
          <form onSubmit={handleAddAnnouncement} className="flex gap-2 mb-4 shrink-0">
            <input
              type="text"
              placeholder="Ketik memo pengumuman..."
              required
              value={newAnnouncement}
              onChange={(e) => setNewAnnouncement(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-lg shadow-lg flex items-center justify-center shrink-0"
            >
              <Plus className="h-4 w-4" />
            </button>
          </form>

          {/* Announcements list */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {announcements.map((ann, idx) => (
              <div key={idx} className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 flex items-start justify-between gap-3 text-xs leading-relaxed text-slate-300">
                <p className="flex-1">{ann}</p>
                <button
                  type="button"
                  onClick={() => handleDeleteAnnouncement(idx)}
                  className="text-red-500 hover:text-red-400 font-bold"
                  title="Hapus Memo"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveMember} className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-100 text-sm uppercase tracking-wide">Edit Detail Member</h3>
              <button type="button" onClick={() => setEditingMember(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded w-full p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Tingkat Kompetensi (Level)</label>
                <select
                  value={editingMember.level}
                  onChange={(e) => setEditingMember({ ...editingMember, level: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded w-full p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                >
                  <option value="beginner">Beginner (Komposisi Pemula)</option>
                  <option value="intermediate">Intermediate (Komposisi Menengah)</option>
                  <option value="pro">Pro (Komposisi Ahli)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Kapasitas VO2Max</label>
                <input 
                  type="number" 
                  step="0.1"
                  required
                  value={editingMember.vo2max}
                  onChange={(e) => setEditingMember({ ...editingMember, vo2max: parseFloat(e.target.value) || 30.0 })}
                  className="bg-slate-950 border border-slate-800 rounded w-full p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setEditingMember(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-lg shadow"
              >
                Simpan Profil
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
