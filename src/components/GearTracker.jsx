import React, { useState } from 'react';
import { 
  Footprints, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertOctagon, 
  PlusCircle, 
  Edit,
  Sliders,
  Check
} from 'lucide-react';

export default function GearTracker({ shoes, setShoes, user, setUser }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingShoe, setEditingShoe] = useState(null);
  const [newShoe, setNewShoe] = useState({ brand: '', model: '', mileage: 0, limit: 500 });

  const handleAddShoe = (e) => {
    e.preventDefault();
    if (!newShoe.brand || !newShoe.model) return;

    const shoeObj = {
      id: 'shoe_' + Date.now(),
      brand: newShoe.brand,
      model: newShoe.model,
      mileage: parseFloat(newShoe.mileage) || 0,
      limit: parseInt(newShoe.limit) || 500,
      active: shoes.length === 0 // automatically active if it is the first shoe
    };

    const updatedShoes = [...shoes, shoeObj];
    setShoes(updatedShoes);
    localStorage.setItem('shoes', JSON.stringify(updatedShoes));

    // Also update in user profile
    const updatedUser = { ...user, shoes: updatedShoes };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    setNewShoe({ brand: '', model: '', mileage: 0, limit: 500 });
    setShowAddModal(false);
  };

  const handleToggleActive = (id) => {
    const updatedShoes = shoes.map(s => {
      return { ...s, active: s.id === id };
    });
    setShoes(updatedShoes);
    localStorage.setItem('shoes', JSON.stringify(updatedShoes));

    const updatedUser = { ...user, shoes: updatedShoes };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleDeleteShoe = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus sepatu ini dari rak perlengkapan?")) {
      const updatedShoes = shoes.filter(s => s.id !== id);
      
      // If the deleted shoe was active, activate another if available
      if (shoes.find(s => s.id === id)?.active && updatedShoes.length > 0) {
        updatedShoes[0].active = true;
      }

      setShoes(updatedShoes);
      localStorage.setItem('shoes', JSON.stringify(updatedShoes));

      const updatedUser = { ...user, shoes: updatedShoes };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const updatedShoes = shoes.map(s => {
      if (s.id === editingShoe.id) {
        return {
          ...s,
          brand: editingShoe.brand,
          model: editingShoe.model,
          limit: parseInt(editingShoe.limit) || 500,
          mileage: parseFloat(editingShoe.mileage) || 0
        };
      }
      return s;
    });
    setShoes(updatedShoes);
    localStorage.setItem('shoes', JSON.stringify(updatedShoes));

    const updatedUser = { ...user, shoes: updatedShoes };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    setEditingShoe(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Footprints className="h-5 w-5 text-rose-500" />
            <span>Gear Tracker (Sepatu Lari)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Lacak jarak tempuh sepatu Anda secara real-time. Kami akan memperingatkan Anda saat sepatu mendekati batas keausan sol (biasanya 500 km) untuk mencegah cedera lutut.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/10"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Sepatu</span>
        </button>
      </div>

      {/* Shoes Grid */}
      {shoes.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center max-w-xl mx-auto space-y-4">
          <Footprints className="h-12 w-12 text-slate-600 mx-auto" />
          <div>
            <h4 className="font-bold text-slate-300">Belum ada sepatu lari terdaftar</h4>
            <p className="text-xs text-slate-500 leading-normal mt-1.5">
              Anda perlu mendaftarkan setidaknya satu sepatu agar sistem kami dapat melacak jarak tempuh dan memotong kapasitas grip sol ketika Anda melakukan latihan.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-2 text-xs font-bold text-rose-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Daftarkan sepatu pertama sekarang</span>
            <PlusCircle className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shoes.map((shoe) => {
            const ratio = shoe.mileage / shoe.limit;
            const percentage = Math.min(Math.round(ratio * 100), 100);
            
            // Wear-and-tear color-coding
            let barColor = "bg-emerald-500";
            let textColor = "text-emerald-400";
            let warningText = "";

            if (percentage >= 90) {
              barColor = "bg-red-500 animate-pulse";
              textColor = "text-red-500 font-extrabold";
              warningText = "⚠️ Sol Kaki Sudah Aus! Bahaya Cedera Lutut.";
            } else if (percentage >= 75) {
              barColor = "bg-amber-500";
              textColor = "text-amber-400";
              warningText = "Sol mulai tipis. Rekomendasi cari cadangan.";
            }

            return (
              <div 
                key={shoe.id} 
                className={`bg-slate-900 border rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group shadow-lg ${
                  shoe.active 
                    ? 'border-rose-500/35 shadow-rose-500/5' 
                    : 'border-slate-800 hover:border-slate-700/80'
                }`}
              >
                {/* Active Glowing Badge */}
                {shoe.active && (
                  <div className="absolute top-0 right-0 bg-rose-500 text-white font-extrabold text-[9px] uppercase tracking-wider px-3 py-1 rounded-bl-lg shadow flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    <span>UTAMA</span>
                  </div>
                )}

                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-widest">{shoe.brand}</span>
                  <h4 className="text-base font-extrabold text-slate-100 mt-1">{shoe.model}</h4>
                  
                  {/* Mileage progress */}
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Jarak Tempuh: <strong className="text-white font-bold">{shoe.mileage.toFixed(1)} km</strong></span>
                      <span className="text-slate-500">Maks: {shoe.limit} km</span>
                    </div>

                    {/* Custom progress bar */}
                    <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800/80">
                      <div className={`${barColor} h-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-semibold">{percentage}% Terpakai</span>
                      {warningText && (
                        <span className={`text-[10px] font-bold ${textColor}`}>{warningText}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2.5">
                  <div className="flex gap-2">
                    {!shoe.active && (
                      <button
                        onClick={() => handleToggleActive(shoe.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded transition-all"
                      >
                        Set Sebagai Utama
                      </button>
                    )}
                    <button
                      onClick={() => setEditingShoe(shoe)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteShoe(shoe.id)}
                    className="p-1.5 bg-red-950/20 hover:bg-red-500/10 text-red-500 rounded transition-all"
                    title="Pensiunkan / Hapus Sepatu"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Shoe Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddShoe} className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-100 text-sm uppercase tracking-wide">Daftarkan Sepatu Lari Baru</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Merek Sepatu (Brand)</label>
                <input 
                  type="text" 
                  placeholder="Misal: Nike, Adidas, Hoka" 
                  required
                  value={newShoe.brand}
                  onChange={(e) => setNewShoe({ ...newShoe, brand: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded w-full p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Model Sepatu</label>
                <input 
                  type="text" 
                  placeholder="Misal: Pegasus 41, Vaporfly 3" 
                  required
                  value={newShoe.model}
                  onChange={(e) => setNewShoe({ ...newShoe, model: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded w-full p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Jarak Mulai (km)</label>
                  <input 
                    type="number" 
                    value={newShoe.mileage}
                    onChange={(e) => setNewShoe({ ...newShoe, mileage: parseFloat(e.target.value) || 0 })}
                    className="bg-slate-950 border border-slate-800 rounded w-full p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Batas Sol Aus (km)</label>
                  <input 
                    type="number" 
                    value={newShoe.limit}
                    onChange={(e) => setNewShoe({ ...newShoe, limit: parseInt(e.target.value) || 500 })}
                    className="bg-slate-950 border border-slate-800 rounded w-full p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow"
              >
                Simpan Sepatu
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Shoe Modal */}
      {editingShoe && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleEditSubmit} className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-100 text-sm uppercase tracking-wide">Edit Sepatu Lari</h3>
              <button type="button" onClick={() => setEditingShoe(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Merek Sepatu (Brand)</label>
                <input 
                  type="text" 
                  required
                  value={editingShoe.brand}
                  onChange={(e) => setEditingShoe({ ...editingShoe, brand: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded w-full p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Model Sepatu</label>
                <input 
                  type="text" 
                  required
                  value={editingShoe.model}
                  onChange={(e) => setEditingShoe({ ...editingShoe, model: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded w-full p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Total Jarak Tempuh (km)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={editingShoe.mileage}
                    onChange={(e) => setEditingShoe({ ...editingShoe, mileage: parseFloat(e.target.value) || 0 })}
                    className="bg-slate-950 border border-slate-800 rounded w-full p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Batas Sol Aus (km)</label>
                  <input 
                    type="number" 
                    value={editingShoe.limit}
                    onChange={(e) => setEditingShoe({ ...editingShoe, limit: parseInt(e.target.value) || 500 })}
                    className="bg-slate-950 border border-slate-800 rounded w-full p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setEditingShoe(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
