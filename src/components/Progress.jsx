import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  Heart,
  HelpCircle
} from 'lucide-react';
import { DAILY_TRAINING_METRICS } from '../data/mockData';

export default function Progress() {
  const currentMetrics = DAILY_TRAINING_METRICS[DAILY_TRAINING_METRICS.length - 1];

  const getFormZoneInfo = (tsb) => {
    if (tsb > 5) return { text: "Fresh (Fresnes/Tapering) 🍃", desc: "Kondisi sangat segar! Sangat ideal untuk hari balapan atau uji coba Personal Best (PB).", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    if (tsb >= -10 && tsb <= 5) return { text: "Optimal (Peningkatan Kebugaran) 🚀", desc: "Zona latihan paling produktif! Tubuh beradaptasi dengan baik terhadap stimulus beban lari.", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    if (tsb >= -25 && tsb < -10) return { text: "Overreaching (Kelelahan Fungsional) ⚠️", desc: "Akumulasi kelelahan sedang tinggi. Butuh lari pemulihan (easy recovery) atau istirahat ekstra.", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" };
    return { text: "Injury Risk (Bahaya Cedera!) 🚨", desc: "Sangat rawan cedera otot & sendi. Kurangi volume lari segera dan lakukan pemulihan total.", color: "text-red-400 bg-red-500/10 border-red-500/20" };
  };

  const zoneInfo = getFormZoneInfo(currentMetrics.TSB);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      
      {/* Introduction Header */}
      <div>
        <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-rose-500" />
          <span>Analisis Kebugaran Tingkat Lanjut</span>
        </h3>
        <p className="text-xs text-slate-400">Melacak performa jangka panjang menggunakan metrik fisiologis standard industri olahraga (CTL, ATL, TSB).</p>
      </div>

      {/* Current State Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Fitness (CTL)</span>
          <span className="text-2xl font-extrabold text-rose-400 mt-1 block">{currentMetrics.CTL}</span>
          <span className="text-[10px] text-slate-500">Chronic Training Load (Beban 42 Hari)</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Fatigue (ATL)</span>
          <span className="text-2xl font-extrabold text-blue-400 mt-1 block">{currentMetrics.ATL}</span>
          <span className="text-[10px] text-slate-500">Acute Training Load (Beban 7 Hari)</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Form (TSB)</span>
          <span className={`text-2xl font-extrabold mt-1 block ${currentMetrics.TSB >= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
            {currentMetrics.TSB}
          </span>
          <span className="text-[10px] text-slate-500">Training Stress Balance (CTL - ATL)</span>
        </div>

        <div className={`border rounded-xl p-4 flex flex-col justify-between shadow-md ${zoneInfo.color}`}>
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-85">Status Pemulihan Hari Ini</span>
          <span className="font-bold text-xs mt-1 block truncate">{zoneInfo.text}</span>
          <span className="text-[9px] opacity-75 mt-0.5 leading-tight">{zoneInfo.desc.slice(0, 50)}...</span>
        </div>
      </div>

      {/* Dual Line Chart: Fitness (CTL) vs Fatigue (ATL) (Req 10) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Fitness & Fatigue Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col h-[340px] shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div>
              <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider">Keseimbangan Kebugaran (CTL vs ATL)</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Membandingkan kapasitas fisik jangka panjang (CTL) dengan kelelahan jangka pendek (ATL).</p>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DAILY_TRAINING_METRICS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickLine={false} tickFormatter={(str) => str.slice(5, 10)} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '11px' }}
                  labelClassName="text-slate-300 font-bold text-xs"
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="CTL" name="Fitness (CTL - Beban Kumulatif)" stroke="#f43f5e" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="ATL" name="Fatigue (ATL - Kelelahan Akut)" stroke="#3b82f6" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Form (TSB) Chart Showing Recovery Zones (Req 10) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col h-[340px] shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div>
              <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider">Form & Zona Pemulihan (TSB)</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Nilai TSB menentukan apakah Anda siap balapan (Fresh), berlatih keras (Optimal), atau terancam cedera.</p>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DAILY_TRAINING_METRICS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTsb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.05}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.25}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickLine={false} tickFormatter={(str) => str.slice(5, 10)} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} domain={[-40, 25]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '11px' }}
                  labelClassName="text-slate-300 font-bold text-xs"
                />
                <ReferenceLine y={5} label={{ value: 'Tapering/Fresh (>+5)', fill: '#fbbf24', fontSize: 8, position: 'insideBottomRight' }} stroke="#f59e0b" strokeDasharray="3 3" />
                <ReferenceLine y={-10} label={{ value: 'Optimal Target (-10)', fill: '#10b981', fontSize: 8, position: 'insideTopRight' }} stroke="#10b981" strokeDasharray="3 3" />
                <ReferenceLine y={-25} label={{ value: 'Overreaching Danger (-25)', fill: '#ef4444', fontSize: 8, position: 'insideTopRight' }} stroke="#ef4444" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="TSB" name="Form Lari (TSB)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTsb)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Guide & Tech details on how Recharts/ChartJS works (Req 10) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
        <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
          <HelpCircle className="h-4.5 w-4.5 text-rose-500" />
          <span>Panduan Pengembang: Rekomendasi Library Chart Terpilih</span>
        </h4>
        
        <p className="text-xs text-slate-400 leading-relaxed">
          Untuk mengimplementasikan visualisasi data lari canggih seperti di atas, library <strong className="text-white">Recharts</strong> merupakan pilihan paling unggul untuk ekosistem React, diikuti oleh <strong className="text-white">Chart.js (melalui react-chartjs-2)</strong>. Berikut adalah komparasi teknisnya:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
            <h5 className="font-semibold text-rose-400 mb-1.5">1. Recharts (Direkomendasikan & Digunakan di Sini)</h5>
            <ul className="space-y-1 text-slate-400 list-disc list-inside">
              <li><strong className="text-slate-300">Deklaratif & Berbasis Komponen</strong>: Menggunakan syntax React murni seperti <code className="text-rose-300 font-mono text-[10px] bg-rose-500/10 px-1 py-0.5 rounded">&lt;LineChart&gt;</code>, <code className="text-rose-300 font-mono text-[10px] bg-rose-500/10 px-1 py-0.5 rounded">&lt;Area&gt;</code> yang sangat intuitif.</li>
              <li><strong className="text-slate-300">Responsif Secara Alami</strong>: Dilengkapi dengan wrapper <code className="text-rose-300 font-mono text-[10px] bg-rose-500/10 px-1 py-0.5 rounded">&lt;ResponsiveContainer&gt;</code> untuk tata letak grid dashboard responsif tanpa konfigurasi resize manual.</li>
              <li><strong className="text-slate-300">Interaktivitas Tinggi</strong>: Tooltip melayang, zoom, click event, dan custom tooltip HTML terintegrasi instan dengan state React.</li>
            </ul>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
            <h5 className="font-semibold text-blue-400 mb-1.5">2. Chart.js & react-chartjs-2</h5>
            <ul className="space-y-1 text-slate-400 list-disc list-inside">
              <li><strong className="text-slate-300">Berbasis Canvas HTML5</strong>: Performa rendering data point berjumlah ribuan jauh lebih cepat daripada SVG (Recharts). Sangat ideal untuk grafik GPS Pace frekuensi tinggi.</li>
              <li><strong className="text-slate-300">File Size Lebih Ringkas</strong>: Cocok untuk aplikasi hybrid Flutter/HTML atau situs web super ringan.</li>
              <li><strong className="text-slate-300">Konfigurasi Berbasis JSON</strong>: Penulisan chart menggunakan sebuah objek konfigurasi tunggal besar yang terkadang sulit disinkronkan dengan re-render state React.</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}
