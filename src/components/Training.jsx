import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid
} from 'recharts';
import { 
  BarChart3, 
  Calendar, 
  Activity, 
  Hourglass, 
  Compass, 
  Dumbbell 
} from 'lucide-react';
import { ANNUAL_VOLUME_CHART } from '../data/mockData';

export default function Training({ runs }) {
  const [selectedYear, setSelectedYear] = useState('2026');

  // Calculate annual sums from seeded volume chart
  const totalLari = ANNUAL_VOLUME_CHART.reduce((acc, d) => acc + d.Lari, 0);
  const totalSepeda = ANNUAL_VOLUME_CHART.reduce((acc, d) => acc + d.Sepeda, 0);
  const totalBebanHours = ANNUAL_VOLUME_CHART.reduce((acc, d) => acc + d.Beban, 0);
  const totalTSS = ANNUAL_VOLUME_CHART.reduce((acc, d) => acc + d.TSS, 0);

  // Total calculated values (adjusting with any newly completed runs in the current month!)
  const liveLariDistance = runs.reduce((acc, r) => acc + (r.type !== 'Strength' ? r.distance : 0), 0);
  const liveStrengthHours = runs.reduce((acc, r) => acc + (r.type === 'Strength' ? (r.duration / 3600) : 0), 0);

  // Blend newly uploaded runs into the current month of the chart (Jul)
  const chartData = ANNUAL_VOLUME_CHART.map((item) => {
    if (item.month === 'Jul') {
      return {
        ...item,
        Lari: Math.round(item.Lari + liveLariDistance),
        Beban: Math.round(item.Beban + liveStrengthHours)
      };
    }
    return item;
  });

  const updatedTotalLari = totalLari + liveLariDistance;
  const updatedTotalBeban = totalBebanHours + liveStrengthHours;
  const updatedTotalDistance = updatedTotalLari + totalSepeda;
  
  // Total hours (Estimate average pace of 5.5 min/km for run, 20 kmh for bike, and actual beban hours)
  const totalRunHours = updatedTotalLari * 5.5 / 60;
  const totalBikeHours = totalSepeda / 20;
  const totalDurationHrs = Math.round(totalRunHours + totalBikeHours + updatedTotalBeban);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      
      {/* Overview Title and Year Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-rose-500" />
            <span>Volume Latihan Tahunan</span>
          </h3>
          <p className="text-xs text-slate-400">Analisis terperinci volume latihan berdasarkan jenis olahraga dan akumulasi TSS bulanan.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-slate-400">Pilih Tahun:</span>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
          >
            <option value="2026">2026 (Berjalan)</option>
            <option value="2025">2025 (Arsip)</option>
          </select>
        </div>
      </div>

      {/* Summary Metrics Banner (Req 10) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Durasi */}
        <div className="bg-slate-900 border border-slate-800/80 p-4.5 rounded-xl flex items-center gap-4 shadow-md">
          <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
            <Hourglass className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Durasi Akumulatif</span>
            <span className="text-xl font-extrabold text-white tracking-tight">{totalDurationHrs} Jam</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Semua cabang olahraga</span>
          </div>
        </div>

        {/* Total Jarak */}
        <div className="bg-slate-900 border border-slate-800/80 p-4.5 rounded-xl flex items-center gap-4 shadow-md">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Total Jarak Tempuh</span>
            <span className="text-xl font-extrabold text-white tracking-tight">{updatedTotalDistance.toFixed(0)} km</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              🏃 {updatedTotalLari.toFixed(0)}km Lari | 🚴 {totalSepeda}km Sepeda
            </span>
          </div>
        </div>

        {/* Total TSS */}
        <div className="bg-slate-900 border border-slate-800/80 p-4.5 rounded-xl flex items-center gap-4 shadow-md">
          <div className="p-3 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/10">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Beban Latihan (TSS)</span>
            <span className="text-xl font-extrabold text-white tracking-tight">{totalTSS + Math.round(liveLariDistance * 6)} TSS</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Training Stress Score</span>
          </div>
        </div>
      </div>

      {/* Main Bar Chart Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 mb-4 gap-2">
          <div>
            <h4 className="font-bold text-sm text-slate-200 uppercase tracking-wide">Grafik Distribusi Volume Latihan Bulanan</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Visualisasi volume bulanan dipecah berdasarkan Lari (km), Bersepeda (km), dan Angkat Beban (jam).</p>
          </div>
          <div className="flex gap-4 text-[10px] font-semibold">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-500 rounded-sm"></span><span className="text-slate-300">Lari (km)</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span><span className="text-slate-300">Sepeda (km)</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-sm"></span><span className="text-slate-300">Beban (Jam)</span></div>
          </div>
        </div>

        {/* Stacked Bar Chart Wrapper */}
        <div className="h-[360px] min-h-0 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="#1e293b" vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                itemStyle={{ fontSize: '11px' }}
                labelClassName="text-slate-300 font-bold text-xs"
              />
              <Legend verticalAlign="bottom" height={36} iconSize={10} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Lari" name="Volume Lari (km)" stackId="a" fill="#f43f5e" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Sepeda" name="Volume Sepeda (km)" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Beban" name="Beban Otot (Jam)" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Informative Guidance */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-5">
        <div className="p-3.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0 w-fit">
          <Dumbbell className="h-6 w-6" />
        </div>
        <div>
          <h5 className="font-semibold text-sm text-slate-200">Bagaimana Membaca Volume Latihan Anda?</h5>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            Untuk pelari, penting menjaga rasio volume lari (70% - 80% dari total porsi latihan aerobik) diimbangi cross-training bersepeda untuk mengistirahatkan persendian lutut, serta latihan beban minimal seminggu sekali untuk pencegahan cedera. TSS (Training Stress Score) mengukur akumulasi kelelahan fungsional Anda.
          </p>
        </div>
      </div>

    </div>
  );
}
