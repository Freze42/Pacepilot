import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronRight, 
  Upload, 
  CheckCircle, 
  Clock, 
  Footprints, 
  Dumbbell, 
  Youtube,
  PlayCircle,
  HelpCircle,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Info
} from 'lucide-react';
import { PROGRAMS, getScheduleForProgram } from '../data/mockData';
import { generateMockTrack, parseGPX, parseTCX } from '../utils/gpxParser';

export default function TrainingPlans({ 
  user, 
  setUser, 
  runs, 
  setRuns, 
  schedules, 
  setSchedules, 
  addActivityFeed 
}) {
  const [selectedProgram, setSelectedProgram] = useState(user.activeProgramId);
  const [activeSession, setActiveSession] = useState(null);
  const [treadmillMode, setTreadmillMode] = useState(false);
  const [treadmillStats, setTreadmillStats] = useState({ steps: 8500, distance: 5.2, duration: 32 });
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadErrorSuccess] = useState('');

  // Enroll User into a program
  const handleEnroll = (programId) => {
    const updatedUser = { ...user, activeProgramId: programId, currentWeek: 1 };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Generate new schedules for week 1
    const newSched = getScheduleForProgram(programId, user.level, 1);
    setSchedules(newSched);
    localStorage.setItem('schedules', JSON.stringify(newSched));
    setSelectedProgram(programId);
  };

  const handleResetProgram = () => {
    if (window.confirm("Apakah Anda yakin ingin membatalkan program saat ini dan memilih ulang?")) {
      const updatedUser = { ...user, activeProgramId: null, currentWeek: 1 };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSchedules([]);
      localStorage.setItem('schedules', JSON.stringify([]));
      setSelectedProgram(null);
    }
  };

  // Complete session via Demo GPX Track
  const handleCompleteWithDemoTrack = (trackName, distance) => {
    setUploadError('');
    try {
      const simulatedWorkout = generateMockTrack(
        activeSession.title,
        user.level,
        distance || activeSession.distanceKm
      );

      completeSession(simulatedWorkout, "File TCX/GPX Terunggah (Simulasi Sukses)");
    } catch (e) {
      setUploadError("Gagal menghasilkan trek demo.");
    }
  };

  // Complete session via file upload
  const handleFileUpload = (e) => {
    setUploadError('');
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      let workoutStats = null;

      if (file.name.endsWith('.gpx')) {
        workoutStats = parseGPX(text);
      } else if (file.name.endsWith('.tcx')) {
        workoutStats = parseTCX(text);
      } else {
        setUploadError("Format file tidak didukung. Harap unggah file berekstensi .gpx atau .tcx");
        return;
      }

      if (!workoutStats) {
        setUploadError("Gagal membaca koordinat GPS dari file. Pastikan file valid.");
        return;
      }

      completeSession(workoutStats, `File ${file.name} Berhasil Diproses`);
    };
    reader.readAsText(file);
  };

  // Complete session via Treadmill Mode
  const handleCompleteTreadmill = () => {
    // Construct simulated run based on treadmill metrics
    const simulatedDistance = parseFloat(treadmillStats.distance);
    const simulatedDurationSec = parseInt(treadmillStats.duration) * 60;
    const speedKmh = simulatedDistance / (simulatedDurationSec / 3600);
    const avgHr = user.level === 'pro' ? 145 : (user.level === 'intermediate' ? 138 : 130);
    
    const paceMin = Math.floor(60 / speedKmh);
    const paceSec = Math.floor(((60 / speedKmh) - paceMin) * 60);
    const paceString = `${paceMin}:${paceSec < 10 ? '0' : ''}${paceSec}`;

    const newWorkout = {
      id: 'activity_treadmill_' + Date.now(),
      name: `🏃‍♂️ Sesi Treadmill: ${activeSession.title}`,
      date: new Date().toISOString().split('T')[0],
      distance: simulatedDistance,
      duration: simulatedDurationSec,
      avgPace: paceString,
      avgHr,
      maxHr: avgHr + 22,
      calories: Math.round(70 * 8.5 * (simulatedDurationSec / 3600)),
      elevationGain: 0, // flat
      vo2Max: user.level === 'pro' ? 56 : (user.level === 'intermediate' ? 48 : 41),
      isTreadmill: true,
      points: [] // no coordinates
    };

    completeSession(newWorkout, "Latihan Selesai via Mode Treadmill!");
  };

  // Helper to persist workout into runs database & mark session complete
  const completeSession = (newWorkout, successMsg) => {
    // 1. Save workout into runs history
    const updatedRuns = [newWorkout, ...runs];
    setRuns(updatedRuns);
    localStorage.setItem('runs', JSON.stringify(updatedRuns));

    // 2. Mark active session as completed
    const updatedSchedules = schedules.map(s => {
      if (s.id === activeSession.id) {
        return { ...s, isCompleted: true, fileUploaded: newWorkout.id };
      }
      return s;
    });
    setSchedules(updatedSchedules);
    localStorage.setItem('schedules', JSON.stringify(updatedSchedules));

    // 3. Update User VO2Max & Shoe Mileage
    const updatedVo2MaxHistory = [...user.vo2maxHistory, { date: newWorkout.date, value: newWorkout.vo2Max }];
    
    // Increment shoe mileage of the active shoe
    const updatedShoes = user.shoes.map(s => {
      if (s.active) {
        return { ...s, mileage: s.mileage + newWorkout.distance };
      }
      return s;
    });

    const updatedUser = { 
      ...user, 
      vo2maxHistory: updatedVo2MaxHistory,
      shoes: updatedShoes
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    // 4. Push to Strava Social Feed
    const feedDesc = newWorkout.isTreadmill 
      ? `Menyelesaikan target latihan di dalam ruangan (Treadmill). Total langkah kaki: ${treadmillStats.steps} langkah.`
      : `Menuntaskan menu latihan luar ruangan (${activeSession.title}) dengan performa luar biasa! Rute terpetakan di map GPS.`;

    addActivityFeed({
      userName: user.name,
      userLevel: user.level,
      userAvatar: "🏃‍♂️",
      title: newWorkout.name,
      description: feedDesc,
      distance: newWorkout.distance,
      duration: new Date(newWorkout.duration * 1000).toISOString().substr(11, 8),
      avgPace: newWorkout.avgPace,
      avgHr: newWorkout.avgHr,
      elevationGain: newWorkout.elevationGain,
      kudos: 0,
      hasKudosed: false,
      comments: [],
      date: "Baru saja",
      photo: null
    });

    setUploadErrorSuccess(successMsg);
    setTimeout(() => {
      setActiveSession(null);
      setUploadErrorSuccess('');
      setTreadmillMode(false);
    }, 2000);
  };

  // Complete Strength Training Workout manually
  const completeStrengthWorkout = () => {
    const newWorkout = {
      id: 'activity_strength_' + Date.now(),
      name: `💪 ${activeSession.title}`,
      date: new Date().toISOString().split('T')[0],
      distance: 0,
      duration: activeSession.durationMin * 60,
      avgPace: "--",
      avgHr: 120,
      maxHr: 145,
      calories: activeSession.durationMin * 6,
      elevationGain: 0,
      vo2Max: user.vo2maxHistory[user.vo2maxHistory.length - 1]?.value || 48, // unchanged
      type: "Strength",
      points: []
    };

    // 1. Save workout into runs history
    const updatedRuns = [newWorkout, ...runs];
    setRuns(updatedRuns);
    localStorage.setItem('runs', JSON.stringify(updatedRuns));

    // 2. Mark strength session completed
    const updatedSchedules = schedules.map(s => {
      if (s.id === activeSession.id) {
        return { ...s, isCompleted: true, fileUploaded: newWorkout.id };
      }
      return s;
    });
    setSchedules(updatedSchedules);
    localStorage.setItem('schedules', JSON.stringify(updatedSchedules));

    // 3. Add to social feed
    addActivityFeed({
      userName: user.name,
      userLevel: user.level,
      userAvatar: "🏃‍♂️",
      title: newWorkout.name,
      description: `Menyelesaikan menu Latihan Kekuatan & Pencegahan Cedera mingguan! Sangat penting untuk melatih otot paha, betis, dan perut agar lari makin ekonomis dan bebas cedera lutut.`,
      distance: 0,
      duration: `${activeSession.durationMin}:00`,
      avgPace: "--",
      avgHr: 120,
      elevationGain: 0,
      kudos: 0,
      hasKudosed: false,
      comments: [],
      date: "Baru saja",
      photo: null
    });

    setUploadErrorSuccess("Sesi Latihan Kekuatan Selesai!");
    setTimeout(() => {
      setActiveSession(null);
      setUploadErrorSuccess('');
    }, 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      
      {/* 1. If User has NO active program enrolled */}
      {!user.activeProgramId ? (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-slate-100">Pilih Program Latihan Lari Personal Anda</h3>
            <p className="text-xs text-slate-400 mt-1">
              Rekomendasi rencana latihan cerdas dari Coach AI PacePilot. Semua intensitas, interval lari, dan program penguatan otot dirancang presisi mengikuti level Anda: 
              <span className="text-rose-400 font-bold uppercase ml-1">{user.level}</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.values(PROGRAMS).map((program) => {
              const scheduleSample = getScheduleForProgram(program.id, user.level, 1);
              return (
                <div 
                  key={program.id} 
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700/80 transition-all flex flex-col justify-between group shadow-lg"
                >
                  <div className={`h-2.5 bg-gradient-to-r ${program.color}`}></div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-lg font-extrabold text-slate-100 group-hover:text-rose-400 transition-colors">{program.name}</h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{program.description}</p>
                      
                      <div className="grid grid-cols-2 gap-3 mt-4.5 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Durasi Program</span>
                          <span className="text-xs font-bold text-slate-300">{program.durationWeeks} Minggu</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-semibold">Volume Mingguan</span>
                          <span className="text-xs font-bold text-slate-300">{program.sessionsPerWeek} Sesi / Mgg</span>
                        </div>
                      </div>

                      {/* Weekly composition preview */}
                      <div className="mt-4.5 border-t border-slate-800/80 pt-3">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Komposisi Sesi {user.level}:</span>
                        <div className="space-y-1.5 text-xs text-slate-400">
                          {scheduleSample.map((s, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-slate-950/20 px-2 py-1 rounded">
                              <span className="font-semibold text-slate-300">{s.day}</span>
                              <span className="text-slate-400 text-[11px] truncate max-w-[150px]">{s.type}: {s.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleEnroll(program.id)}
                      className="w-full mt-6 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2.5 rounded-lg transition-all shadow-md shadow-rose-600/10 uppercase tracking-wider"
                    >
                      Daftar Program Latihan ini
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        
        // 2. If User HAS an active program enrolled
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
            <div>
              <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                PROGRAM AKTIF: {PROGRAMS[user.activeProgramId]?.name}
              </span>
              <h3 className="text-xl font-extrabold text-white mt-1.5 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-rose-500" />
                <span>Minggu Ke-{user.currentWeek} dari {PROGRAMS[user.activeProgramId]?.durationWeeks}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Rencana latihan terstruktur yang disesuaikan untuk level <strong className="text-rose-400 uppercase">{user.level}</strong>. Klik jadwal di bawah untuk mencatat & mengunggah file lari Anda.
              </p>
            </div>

            <button
              onClick={handleResetProgram}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 text-red-400 border border-red-500/10 hover:border-red-500/20 hover:bg-red-500/5 rounded-lg transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Ganti Program</span>
            </button>
          </div>

          {/* Active Week Sessions List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {schedules.map((session) => {
              const isRun = session.type !== 'Strength';
              return (
                <div
                  key={session.id}
                  onClick={() => setActiveSession(session)}
                  className={`bg-slate-900 border cursor-pointer rounded-xl p-4.5 flex flex-col justify-between group transition-all transform hover:-translate-y-1 shadow-md hover:shadow-lg ${
                    session.isCompleted
                      ? 'border-emerald-500/30 hover:border-emerald-500/50 bg-emerald-500/[0.01]'
                      : 'border-slate-800 hover:border-rose-500/40 hover:bg-rose-500/[0.01]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5">
                      <span className="text-xs font-bold text-slate-400">{session.day}</span>
                      {session.isCompleted ? (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                          <CheckCircle className="h-2.5 w-2.5" />
                          <span>SELESAI</span>
                        </div>
                      ) : (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isRun ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                        }`}>
                          {session.type}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-slate-200 group-hover:text-rose-400 transition-colors leading-snug">{session.title}</h4>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{session.desc}</p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    {isRun ? (
                      <div className="flex items-center gap-1 font-semibold text-slate-300">
                        <Footprints className="h-3.5 w-3.5 text-rose-500" />
                        <span>{session.distanceKm} KM</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 font-semibold text-slate-300">
                        <Dumbbell className="h-3.5 w-3.5 text-amber-500" />
                        <span>Kekuatan</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 font-semibold text-slate-300">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      <span>{session.durationMin} Menit</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Training Log Upload History List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h4 className="font-bold text-sm text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
              <Upload className="h-4 w-4 text-rose-500" />
              <span>Log Riwayat Unggahan TCX / GPX Latihan</span>
            </h4>

            {runs.filter(r => r.programId === user.activeProgramId).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
                <HelpCircle className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-xs">Belum ada riwayat lari pada program ini. Klik salah satu jadwal lari di atas untuk mengunggah latihan pertama Anda!</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {runs.filter(r => r.programId === user.activeProgramId).map((run) => (
                  <div key={run.id} className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded tracking-wide mr-2 uppercase">LATIHAN SELESAI</span>
                      <strong className="text-slate-200">{run.name}</strong>
                      <span className="text-slate-400 block sm:inline sm:ml-3">Terlaksana pada: {run.date}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-300">
                      <span>📏 {run.distance.toFixed(1)} km</span>
                      <span>⏱️ {run.avgPace} /km</span>
                      <span>❤️ {run.avgHr} BPM</span>
                      <span className="text-rose-400 font-bold">⚡ VO2Max: {run.vo2Max}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Interactive Detail & Completion Modal */}
      {activeSession && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider">
                  Menu Sesi • {activeSession.day} • {activeSession.type}
                </span>
                <h3 className="text-base font-extrabold text-white mt-1">{activeSession.title}</h3>
              </div>
              <button 
                onClick={() => {
                  setActiveSession(null);
                  setTreadmillMode(false);
                }} 
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 max-h-[480px]">
              
              {/* Structured Workouts Composition (Req 16 & Req 8) */}
              <div className="bg-slate-950/60 rounded-xl p-4.5 border border-slate-800 space-y-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Struktur Menu Sesi ({user.level.toUpperCase()})</span>
                
                <div className="space-y-2 text-xs leading-relaxed">
                  <div className="bg-slate-900 border-l-2 border-emerald-500 px-3 py-1.5 rounded">
                    <span className="font-bold text-emerald-400 block uppercase text-[10px]">1. Pemanasan (Warm-up)</span>
                    <p className="text-slate-300 mt-1">{activeSession.warmup}</p>
                  </div>

                  <div className="bg-slate-900 border-l-2 border-rose-500 px-3 py-1.5 rounded">
                    <span className="font-bold text-rose-400 block uppercase text-[10px]">2. Porsi Utama (Composition)</span>
                    <p className="text-slate-300 mt-1">{activeSession.composition}</p>
                  </div>

                  <div className="bg-slate-900 border-l-2 border-indigo-500 px-3 py-1.5 rounded">
                    <span className="font-bold text-indigo-400 block uppercase text-[10px]">3. Pendinginan (Cool-down)</span>
                    <p className="text-slate-300 mt-1">{activeSession.cooldown}</p>
                  </div>
                </div>
              </div>

              {/* Error and Success states */}
              {uploadError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-lg flex items-center gap-2 animate-bounce">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              {/* Complete Session Action Block */}
              {activeSession.isCompleted ? (
                <div className="bg-emerald-500/5 border border-emerald-500/25 p-4 rounded-xl text-center space-y-2">
                  <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto" />
                  <h5 className="font-bold text-slate-200">Sesi Latihan Ini Sudah Selesai!</h5>
                  <p className="text-xs text-slate-400">Kerja bagus, riwayat lari Anda telah tersimpan dan menyinkronkan VO2Max Anda secara otomatis.</p>
                </div>
              ) : activeSession.type === 'Strength' ? (
                
                // STRENGTH WORKOUT LOG FLOW
                <div className="space-y-4">
                  <div className="bg-slate-950/40 p-4 rounded-lg border border-slate-800 flex items-start gap-4">
                    <div className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/10 rounded">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-slate-200">Rekomendasi Video Penguatan Otot Runners</h5>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Klik tautan di bawah untuk mempelajari formulir gerakan latihan kekuatan kaki murni guna mengoptimalkan stride lari Anda.
                      </p>

                      {/* YouTube Redirect Link Fallback (Req 15) */}
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(activeSession.searchQuery)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] rounded transition-all"
                      >
                        <Youtube className="h-3.5 w-3.5" />
                        <span>Cari Latihan di YouTube</span>
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={completeStrengthWorkout}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-lg transition-all shadow-md shadow-emerald-600/15 uppercase tracking-wider"
                  >
                    Konfirmasi Sesi Latihan Selesai
                  </button>
                </div>

              ) : (

                // RUN WORKOUT LOG FLOW
                <div className="space-y-4">
                  {/* Treadmill Mode Switcher (Req 16) */}
                  <div className="flex items-center justify-between bg-slate-950/60 px-4 py-3 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2">
                      <Footprints className="h-4 w-4 text-rose-500" />
                      <div>
                        <span className="font-semibold text-xs text-slate-200 block">Treadmill Mode (Latihan Indoor)</span>
                        <span className="text-[10px] text-slate-400 block">Aktifkan untuk input lari dalam ruangan secara manual</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setTreadmillMode(!treadmillMode)}
                      className="text-rose-500 focus:outline-none transition-transform"
                    >
                      {treadmillMode ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8 text-slate-600" />}
                    </button>
                  </div>

                  {treadmillMode ? (
                    
                    // TREADMILL INPUT MODE
                    <div className="space-y-4 bg-slate-950/40 p-4 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">Formulir Lari Treadmill</span>
                      <div className="grid grid-cols-3 gap-3 text-xs text-slate-300">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Jumlah Langkah</label>
                          <input 
                            type="number" 
                            value={treadmillStats.steps}
                            onChange={(e) => setTreadmillStats({ ...treadmillStats, steps: parseInt(e.target.value) || 0 })}
                            className="bg-slate-900 border border-slate-800 rounded w-full p-2 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Jarak (KM)</label>
                          <input 
                            type="number" 
                            step="0.1" 
                            value={treadmillStats.distance}
                            onChange={(e) => setTreadmillStats({ ...treadmillStats, distance: parseFloat(e.target.value) || 0 })}
                            className="bg-slate-900 border border-slate-800 rounded w-full p-2 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Durasi (Menit)</label>
                          <input 
                            type="number" 
                            value={treadmillStats.duration}
                            onChange={(e) => setTreadmillStats({ ...treadmillStats, duration: parseInt(e.target.value) || 0 })}
                            className="bg-slate-900 border border-slate-800 rounded w-full p-2 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleCompleteTreadmill}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-lg transition-all shadow-md shadow-emerald-600/15 uppercase tracking-wider"
                      >
                        Simpan Latihan Treadmill Selesai
                      </button>
                    </div>

                  ) : (

                    // FILE UPLOAD MODE
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-slate-800 rounded-xl p-6 hover:border-rose-500/50 transition-all flex flex-col items-center justify-center text-center space-y-2 relative">
                        <Upload className="h-8 w-8 text-rose-500 opacity-70 mb-1" />
                        <div>
                          <span className="font-bold text-xs text-slate-200 block">Pilih File GPX atau TCX</span>
                          <span className="text-[10px] text-slate-500 block">Seret file ke sini atau klik untuk mencari berkas</span>
                        </div>
                        
                        <input
                          type="file"
                          accept=".gpx,.tcx"
                          onChange={handleFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>

                      {/* Demo Quick Injections to bypass real file requirement (Extremely premium!) */}
                      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Metode Uji Coba Cepat (Use High-Fi Demo GPS Tracks)</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Jika Anda tidak memiliki jam olahraga atau file GPX eksternal saat ini, klik salah satu rute simulasi rute GPS di bawah untuk merasakan proses parsing data, sync VO2Max, dan visualisasi peta seketika!
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-bold">
                          <button
                            onClick={() => handleCompleteWithDemoTrack("Kendal Bay Coastal Loop", activeSession.distanceKm)}
                            className="bg-slate-900 border border-slate-800 hover:border-rose-500/40 hover:bg-rose-500/5 text-slate-300 p-2 rounded transition-all text-left flex flex-col"
                          >
                            <span className="text-slate-200">🌊 Kendal Bay Seafront Loop</span>
                            <span className="text-[9px] text-slate-500 font-medium">Loop pantai • {activeSession.distanceKm} km</span>
                          </button>
                          
                          <button
                            onClick={() => handleCompleteWithDemoTrack("Jakarta CFD Loop Road", activeSession.distanceKm)}
                            className="bg-slate-900 border border-slate-800 hover:border-rose-500/40 hover:bg-rose-500/5 text-slate-300 p-2 rounded transition-all text-left flex flex-col"
                          >
                            <span className="text-slate-200">🏢 Jakarta CFD Sudirman</span>
                            <span className="text-[9px] text-slate-500 font-medium">Flat road • {activeSession.distanceKm} km</span>
                          </button>
                        </div>
                      </div>
                    </div>

                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
