import React, { useState, useEffect, useRef } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
import { 
  Flame, 
  Timer, 
  Compass, 
  Heart, 
  Moon, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  Play, 
  Pause, 
  RotateCcw,
  Zap
} from 'lucide-react';
import { 
  DAILY_TRAINING_METRICS, 
  SLEEP_DATA, 
  HEART_RATE_HOURLY 
} from '../data/mockData';

export default function Dashboard({ runs, user }) {
  const latestRun = runs.length > 0 ? runs[0] : null;

  // Calculate total stats
  const totalDistance = runs.reduce((acc, r) => acc + r.distance, 0);
  const totalDurationMin = runs.reduce((acc, r) => acc + Math.round(r.duration / 60), 0);
  const totalDurationHrs = (totalDurationMin / 60).toFixed(1);
  const totalRuns = runs.length;

  // Latest Activity Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(2); // speeds: 1, 2, 5, 10
  const playbackTimer = useRef(null);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (playbackTimer.current) clearInterval(playbackTimer.current);
    };
  }, []);

  // Handle Playback Interval
  useEffect(() => {
    if (isPlaying && latestRun && latestRun.points && latestRun.points.length > 0) {
      playbackTimer.current = setInterval(() => {
        setPlaybackIndex((prevIndex) => {
          if (prevIndex >= latestRun.points.length - 1) {
            setIsPlaying(false);
            return 0; // loop back to start
          }
          return prevIndex + 1;
        });
      }, 300 / playbackSpeed);
    } else {
      if (playbackTimer.current) {
        clearInterval(playbackTimer.current);
      }
    }
    return () => {
      if (playbackTimer.current) clearInterval(playbackTimer.current);
    };
  }, [isPlaying, latestRun, playbackSpeed]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setPlaybackIndex(0);
  };

  // Get active point stats during playback
  const activePoint = latestRun && latestRun.points && latestRun.points[playbackIndex] 
    ? latestRun.points[playbackIndex] 
    : (latestRun && latestRun.points ? latestRun.points[0] : null);

  // SVG route drawer
  const renderSVGRoute = () => {
    if (!latestRun || !latestRun.points || latestRun.points.length === 0) return null;

    const pts = latestRun.points;
    const lats = pts.map(p => p.lat);
    const lons = pts.map(p => p.lon);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const latSpan = maxLat - minLat || 0.0001;
    const lonSpan = maxLon - minLon || 0.0001;

    // Project points into a 300x160 canvas bounding box
    const width = 300;
    const height = 160;
    const padding = 20;

    const project = (lat, lon) => {
      const x = padding + ((lon - minLon) / lonSpan) * (width - 2 * padding);
      // Invert Y because SVG coordinates increase downwards
      const y = height - padding - ((lat - minLat) / latSpan) * (height - 2 * padding);
      return { x, y };
    };

    // Build SVG Path
    let pathD = "";
    pts.forEach((pt, idx) => {
      const { x, y } = project(pt.lat, pt.lon);
      if (idx === 0) {
        pathD += `M ${x} ${y}`;
      } else {
        pathD += ` L ${x} ${y}`;
      }
    });

    const runnerPoint = activePoint ? project(activePoint.lat, activePoint.lon) : project(pts[0].lat, pts[0].lon);
    const startPoint = project(pts[0].lat, pts[0].lon);
    const endPoint = project(pts[pts.length - 1].lat, pts[pts.length - 1].lon);

    return (
      <svg className="w-full h-full text-rose-500 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        {/* Glow behind route */}
        <path d={pathD} fill="none" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="opacity-15 blur-sm" />
        {/* Actual Route Line */}
        <path d={pathD} fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Start Point */}
        <circle cx={startPoint.x} cy={startPoint.y} r="5" fill="#10b981" stroke="#0f172a" strokeWidth="1.5" />
        {/* End Point */}
        <circle cx={endPoint.x} cy={endPoint.y} r="5" fill="#6366f1" stroke="#0f172a" strokeWidth="1.5" />

        {/* Runner Avatar moving along the path */}
        <g transform={`translate(${runnerPoint.x}, ${runnerPoint.y})`}>
          <circle cx="0" cy="0" r="10" fill="#f43f5e" className="ring-pulse opacity-40" />
          <circle cx="0" cy="0" r="5" fill="#ffffff" stroke="#e11d48" strokeWidth="2" />
        </g>
      </svg>
    );
  };

  // Generate calendar days for current month (July 2026)
  const renderCalendar = () => {
    const daysInMonth = 31;
    const startingDayOfWeek = 3; // July 1, 2026 was a Wednesday
    
    // Create pre-filled run dates array
    const runDates = runs.map(r => new Date(r.date).getDate());

    const calendarCells = [];
    
    // Empty cells for alignment
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarCells.push(<div key={`empty-${i}`} className="h-6 w-6"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const hasRun = runDates.includes(day);
      calendarCells.push(
        <div 
          key={`day-${day}`} 
          className={`h-7 w-7 text-[10px] font-semibold flex items-center justify-center rounded-full transition-all relative ${
            hasRun 
              ? 'bg-rose-500 text-white shadow shadow-rose-500/30 font-bold scale-105' 
              : 'text-slate-400 hover:bg-slate-800'
          }`}
          title={hasRun ? "Sesi Lari Selesai!" : `Hari ke-${day}`}
        >
          {day}
          {hasRun && (
            <span className="absolute bottom-0 w-1 h-1 rounded-full bg-amber-300"></span>
          )}
        </div>
      );
    }

    return (
      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4.5 flex flex-col justify-between h-[210px] shadow-lg shadow-slate-950/20">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-xs uppercase tracking-wider">
            <CalendarIcon className="h-3.5 w-3.5 text-rose-500" />
            <span>Kalender Aktivitas</span>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold">Juli 2026</span>
        </div>
        
        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-slate-500 uppercase tracking-wider">
          <span>Sn</span><span>Sl</span><span>Rb</span><span>Km</span><span>Jm</span><span>Sb</span><span>Mg</span>
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 gap-1.5 justify-items-center mt-1">
          {calendarCells}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      
      {/* 1. Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Durasi Total Card */}
        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-xl flex items-center gap-4 relative overflow-hidden group hover:border-rose-500/20 transition-all shadow-lg">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 group-hover:scale-110 transition-transform duration-300">
            <Timer className="h-20 w-20 text-rose-500" />
          </div>
          <div className="p-3 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/10">
            <Timer className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block uppercase font-semibold tracking-wider">Durasi Total</span>
            <span className="text-2xl font-bold text-white tracking-tight">{totalDurationHrs} jam</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5 mt-0.5">🏃‍♂️ {totalDurationMin} menit lari</span>
          </div>
        </div>

        {/* Jarak Total Card */}
        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-xl flex items-center gap-4 relative overflow-hidden group hover:border-rose-500/20 transition-all shadow-lg">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 group-hover:scale-110 transition-transform duration-300">
            <Compass className="h-20 w-20 text-rose-500" />
          </div>
          <div className="p-3 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/10">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block uppercase font-semibold tracking-wider">Jarak Tempuh</span>
            <span className="text-2xl font-bold text-white tracking-tight">{totalDistance.toFixed(1)} km</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">Sebaran rute terpetakan</span>
          </div>
        </div>

        {/* Total Runs Card */}
        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-xl flex items-center gap-4 relative overflow-hidden group hover:border-rose-500/20 transition-all shadow-lg">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 group-hover:scale-110 transition-transform duration-300">
            <Zap className="h-20 w-20 text-rose-500" />
          </div>
          <div className="p-3 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/10">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block uppercase font-semibold tracking-wider">Total Latihan</span>
            <span className="text-2xl font-bold text-white tracking-tight">{totalRuns} Sesi</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Schedules completed: {runs.filter(r => r.programId).length}</span>
          </div>
        </div>

        {/* VO2Max Speedometer Card */}
        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-xl flex items-center gap-4 relative overflow-hidden group hover:border-rose-500/20 transition-all shadow-lg">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 group-hover:scale-110 transition-transform duration-300">
            <Flame className="h-20 w-20 text-rose-500" />
          </div>
          <div className="p-3 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/10">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block uppercase font-semibold tracking-wider">Kapasitas VO2Max</span>
            <span className="text-2xl font-bold text-white tracking-tight">
              {user.vo2maxHistory[user.vo2maxHistory.length - 1]?.value || 48} ml/kg
            </span>
            <span className="text-[10px] text-rose-400 block mt-0.5 font-medium animate-pulse">⚡ Sinkron otomatis log</span>
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Last Activity Playback Map & Activity Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Playback Map Widget */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col h-[340px] shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div>
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-xs uppercase tracking-wider">
                <Compass className="h-3.5 w-3.5 text-rose-500" />
                <span>Peta Aktivitas Terakhir (Strava Playback)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {latestRun ? latestRun.name : 'Belum ada aktivitas lari'} • {latestRun ? latestRun.date : ''}
              </p>
            </div>
            {latestRun && (
              <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded border border-slate-700/60">
                <button 
                  onClick={handlePlayPause}
                  className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5 text-rose-400" /> : <Play className="h-3.5 w-3.5 text-emerald-400" fill="currentColor" />}
                </button>
                <button 
                  onClick={handleReset}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  title="Reset"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <span className="text-[9px] font-bold text-slate-400 px-1 border-l border-slate-700">SP:</span>
                {[1, 2, 5, 10].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`text-[9px] font-bold px-1 rounded hover:bg-slate-700 transition-colors ${playbackSpeed === speed ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400'}`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">
            {latestRun ? (
              <>
                {/* SVG/Canvas Map Representation */}
                <div className="md:col-span-2 bg-slate-950/80 border border-slate-800 rounded-lg p-2 relative flex items-center justify-center overflow-hidden">
                  {renderSVGRoute()}
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">START</span>
                    <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">FINISH</span>
                  </div>
                </div>

                {/* Animated Dials */}
                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 flex flex-col justify-between text-xs space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800/60 pb-1">
                    Live Stats Telemetry
                  </span>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Jarak:</span>
                    <span className="font-bold text-white text-sm">
                      {activePoint ? activePoint.dist.toFixed(2) : "0.00"} km
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Pace:</span>
                    <span className="font-bold text-rose-400 text-sm">
                      {activePoint ? activePoint.pace : "--:--"} min/km
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Detak Jantung:</span>
                    <span className="font-bold text-red-500 text-sm flex items-center gap-1">
                      <Heart className="h-3 w-3 fill-red-500 animate-ping" />
                      {activePoint && activePoint.hr ? `${activePoint.hr} BPM` : "145 BPM"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Ketinggian:</span>
                    <span className="font-bold text-amber-400 text-sm">
                      {activePoint ? `${Math.round(activePoint.ele)} m` : "0 m"}
                    </span>
                  </div>

                  {/* Playback progress bar */}
                  {latestRun && latestRun.points && (
                    <div className="pt-2 border-t border-slate-800/60">
                      <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold mb-1">
                        <span>PROGRESS</span>
                        <span>{Math.round((playbackIndex / (latestRun.points.length - 1)) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={latestRun.points.length - 1}
                        value={playbackIndex}
                        onChange={(e) => {
                          setIsPlaying(false);
                          setPlaybackIndex(parseInt(e.target.value, 10));
                        }}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="col-span-3 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                  <Compass className="h-6 w-6" />
                </div>
                <div>
                  <h5 className="font-semibold text-slate-300">Belum ada rute terpetakan</h5>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Pilih program latihan lari kamu, jalankan sesinya, lalu unggah file GPX/TCX untuk melihat visualisasi peta.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Activity Calendar (Req 10) */}
        <div className="flex flex-col gap-6">
          {renderCalendar()}
        </div>

      </div>

      {/* 3. Bottom Row: CTL/ATL Chart, Sleep tracker, and Daily Heart Rate */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CTL/ATL Fitness Progress Widget (Req 10) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col h-[280px] shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-xs uppercase tracking-wider">
              <TrendingUp className="h-3.5 w-3.5 text-rose-500" />
              <span>Metrik Progres (CTL/ATL/TSB)</span>
            </div>
            <span className="text-[9px] bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase">Optimal Zone</span>
          </div>

          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DAILY_TRAINING_METRICS.slice(-15)}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickLine={false} tickFormatter={(str) => str.slice(8,10)} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} width={15} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} 
                  labelClassName="text-slate-400 text-xs font-semibold"
                  itemStyle={{ fontSize: '11px' }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '9px', paddingTop: '5px' }} />
                <Line type="monotone" dataKey="CTL" stroke="#f43f5e" strokeWidth={2.5} name="Fitness (CTL)" dot={false} />
                <Line type="monotone" dataKey="ATL" stroke="#3b82f6" strokeWidth={1.5} name="Fatigue (ATL)" dot={false} strokeDasharray="3 3" />
                <Line type="monotone" dataKey="TSB" stroke="#f59e0b" strokeWidth={1.5} name="Form (TSB)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sleep Tracker Widget (Req 10) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col h-[280px] shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-xs uppercase tracking-wider">
              <Moon className="h-3.5 w-3.5 text-rose-500" />
              <span>Sleep Tracker (7 Hari Terakhir)</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Avg: 7.2 jam</span>
          </div>

          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SLEEP_DATA}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} width={15} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '11px' }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '9px', paddingTop: '5px' }} />
                <Bar dataKey="hours" name="Durasi Tidur (Jam)" fill="#4f46e5" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="deepSleep" name="Deep Sleep (Jam)" fill="#e11d48" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Heart Rate Widget (Req 10) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col h-[280px] shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-xs uppercase tracking-wider">
              <Heart className="h-3.5 w-3.5 text-rose-500" />
              <span>Heart Rate Harian</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              RHR: 48 BPM
            </span>
          </div>

          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HEART_RATE_HOURLY}>
                <defs>
                  <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} width={15} domain={[40, 120]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="bpm" name="Detak Jantung (BPM)" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorHr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
