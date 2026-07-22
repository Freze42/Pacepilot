import React, { useState } from 'react';
import { 
  Zap, 
  Sparkles, 
  HelpCircle, 
  Check, 
  Smile, 
  Rocket, 
  Award,
  ChevronRight,
  User,
  Mail,
  Lock
} from 'lucide-react';

export default function AuthModal({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: 'Rio Pratama', email: 'rio@run.com', password: 'password123' });
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [detectedLevel, setDetectedLevel] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      // Simulate direct login with seeded Rio Pratama
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        onLoginSuccess(JSON.parse(savedUser));
      } else {
        // Fallback seed
        const defaultUser = {
          name: formData.name,
          level: 'intermediate',
          role: 'member',
          currentPace: "5:15",
          weightKg: 70,
          heightCm: 175,
          registeredAt: new Date().toISOString().split('T')[0],
          activeProgramId: '10k',
          currentWeek: 3,
          vo2maxHistory: [
            { date: "2026-07-10", value: 47.5 },
            { date: "2026-07-17", value: 48.0 }
          ],
          shoes: [
            { id: "shoe_1", brand: "Nike", model: "Pegasus 41", mileage: 284.5, limit: 500, active: true },
            { id: "shoe_2", brand: "Adidas", model: "Adizero Boston 12", mileage: 92.1, limit: 600, active: false }
          ]
        };
        localStorage.setItem('user', JSON.stringify(defaultUser));
        onLoginSuccess(defaultUser);
      }
    } else {
      // Registration flow -> Trigger diagnostic questions (Req 7)
      setShowDiagnostic(true);
    }
  };

  const DIAGNOSTIC_QUESTIONS = [
    {
      id: 1,
      title: "Berapa kali Anda berlatih lari dalam seminggu saat ini?",
      options: [
        { label: "Jarang, 0 hingga 1 kali seminggu", score: "beginner" },
        { label: "Sedang, rutin 2 hingga 3 kali seminggu", score: "intermediate" },
        { label: "Sering, 4 kali atau lebih seminggu", score: "pro" }
      ]
    },
    {
      id: 2,
      title: "Berapa lama durasi lari nonstop terlama Anda tanpa berjalan kaki?",
      options: [
        { label: "Kurang dari 15 menit", score: "beginner" },
        { label: "15 hingga 40 menit nonstop", score: "intermediate" },
        { label: "Lebih dari 40 menit nonstop", score: "pro" }
      ]
    },
    {
      id: 3,
      title: "Apa target terbesar yang ingin Anda capai di PacePilot?",
      options: [
        { label: "Memulai hidup sehat & lari kecil tanpa cidera", score: "beginner" },
        { label: "Menyelesaikan event lari 10K / Half-Marathon", score: "intermediate" },
        { label: "Memecahkan Personal Best (rekor waktu lari tercepat)", score: "pro" }
      ]
    }
  ];

  const handleAnswerSelect = (score) => {
    const updatedAnswers = [...answers, score];
    setAnswers(updatedAnswers);

    if (currentQuestion < DIAGNOSTIC_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Diagnostic complete -> Calculate level composition (Req 8)
      // Standard count of answers
      const counts = { beginner: 0, intermediate: 0, pro: 0 };
      updatedAnswers.forEach(ans => counts[annHelper(ans)] = (counts[annHelper(ans)] || 0) + 1);

      // Find the mode
      let finalLevel = 'intermediate';
      if (counts.beginner >= 2) finalLevel = 'beginner';
      else if (counts.pro >= 2) finalLevel = 'pro';

      setDetectedLevel(finalLevel);

      // Create new user with calculated level
      const newUser = {
        name: formData.name,
        level: finalLevel,
        role: 'member',
        currentPace: finalLevel === 'pro' ? "4:15" : (finalLevel === 'intermediate' ? "5:30" : "7:00"),
        weightKg: 70,
        heightCm: 175,
        registeredAt: new Date().toISOString().split('T')[0],
        activeProgramId: null, // let them choose on dashboard
        currentWeek: 1,
        vo2maxHistory: [
          { date: new Date().toISOString().split('T')[0], value: finalLevel === 'pro' ? 54.0 : (finalLevel === 'intermediate' ? 46.5 : 38.0) }
        ],
        shoes: [
          { id: "shoe_1", brand: "Nike", model: "Pegasus 41", mileage: 0, limit: 500, active: true }
        ]
      };

      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('schedules', JSON.stringify([])); // blank initially
    }
  };

  const annHelper = (val) => val;

  const handleDiagnosticDone = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      onLoginSuccess(JSON.parse(savedUser));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-4 z-50 overflow-hidden select-none">
      
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full filter blur-3xl"></div>

      {/* Main card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 relative overflow-hidden shadow-2xl z-10 flex flex-col justify-between max-h-[92vh]">
        
        {/* DIAGNOSTIC PROCESS (Req 7) */}
        {showDiagnostic ? (
          <div className="flex-1 flex flex-col justify-between py-2 text-xs">
            
            {!detectedLevel ? (
              // Questionnaire questions
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-white tracking-wide">PacePilot AI Diagnostic</h3>
                  <p className="text-[11px] text-slate-400 mt-1">Kami mendeteksi kebiasaan lari Anda untuk memberikan komposisi program latihan lari presisi.</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <span>Progres Diagnostik</span>
                    <span>Pertanyaan {currentQuestion + 1} dari {DIAGNOSTIC_QUESTIONS.length}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="bg-rose-500 h-full transition-all duration-300" 
                      style={{ width: `${((currentQuestion + 1) / DIAGNOSTIC_QUESTIONS.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Question and Option choices */}
                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-slate-200 leading-snug">
                    {DIAGNOSTIC_QUESTIONS[currentQuestion].title}
                  </h4>
                  
                  <div className="space-y-2.5">
                    {DIAGNOSTIC_QUESTIONS[currentQuestion].options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAnswerSelect(opt.score)}
                        className="w-full text-left bg-slate-950/60 border border-slate-800 hover:border-rose-500/40 hover:bg-rose-500/[0.01] p-3.5 rounded-xl transition-all font-semibold text-slate-300 hover:text-slate-100 flex items-center justify-between group"
                      >
                        <span>{opt.label}</span>
                        <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-rose-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Results Presentation Page (Req 8)
              <div className="space-y-6 text-center">
                <div className="w-16 h-12 flex items-center justify-center mx-auto">
                  {detectedLevel === 'pro' && <Award className="h-14 w-14 text-amber-400 animate-bounce" />}
                  {detectedLevel === 'intermediate' && <Rocket className="h-12 w-12 text-rose-500 animate-bounce" />}
                  {detectedLevel === 'beginner' && <Smile className="h-12 w-12 text-emerald-400 animate-bounce" />}
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded font-extrabold uppercase tracking-wider">
                    DIAGNOSTIK SELESAI ✔️
                  </span>
                  <h3 className="text-lg font-extrabold text-white tracking-wide mt-2">Kompetensi Terdeteksi: <span className="text-rose-500 uppercase">{detectedLevel}</span></h3>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Selamat bergabung! Berdasarkan analisis kami, tingkat lari Anda diplot pada level <strong className="text-rose-400 uppercase">{detectedLevel}</strong>.
                  </p>
                </div>

                {/* Compositions Affirmation (Req 8) */}
                <div className="bg-slate-950/60 border border-slate-800/80 p-4.5 rounded-xl text-left space-y-2 max-w-sm mx-auto">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-2">
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="font-bold text-[10px] text-slate-300 uppercase tracking-wider">KOMPOSISI SESI DIATUR ({detectedLevel.toUpperCase()})</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sesuai instruksi kesehatan atlet, <strong className="text-white">SEMUA SESI LATIHAN LARI & KEKUATAN BEBAN</strong> pada platform PacePilot akan dikonfigurasi mengikuti komposisi dan kapasitas level <strong className="text-rose-400 uppercase">{detectedLevel}</strong> Anda.
                  </p>
                </div>

                <button
                  onClick={handleDiagnosticDone}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-rose-600/10 uppercase tracking-wider"
                >
                  Masuk Ke Dashboard Anda
                </button>
              </div>
            )}

          </div>
        ) : (
          
          // REGULAR AUTHENTICATION (LOGIN & REGISTER SCREEN)
          <div className="space-y-6 text-xs font-semibold">
            {/* Logo */}
            <div className="text-center space-y-1.5">
              <div className="inline-flex bg-gradient-to-br from-rose-500 to-amber-500 p-2.5 rounded-xl shadow-lg shadow-rose-500/10 mb-2">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Pace<span className="text-rose-500">Pilot</span>
              </h2>
              <p className="text-[11px] text-slate-400">Premium AI Running Engine, Analytics & Training Plans</p>
            </div>

            {/* Auth selection */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-1 rounded-lg border border-slate-850">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`py-1.5 rounded-md text-xs font-bold uppercase transition-all ${isLogin ? 'bg-slate-800 text-white shadow' : 'text-slate-500'}`}
              >
                Masuk Akun
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`py-1.5 rounded-md text-xs font-bold uppercase transition-all ${!isLogin ? 'bg-slate-800 text-white shadow' : 'text-slate-500'}`}
              >
                Daftar Baru
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Nama Lengkap</label>
                  <div className="relative">
                    <User className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
                    <input 
                      type="text" 
                      required
                      placeholder="Rio Pratama"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500 w-full"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Alamat Email</label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
                  <input 
                    type="email" 
                    required
                    placeholder="rio@run.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500 w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500 w-full"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all mt-6 shadow-lg shadow-rose-600/10"
              >
                {isLogin ? 'Masuk Sesi Olahraga' : 'Registrasi & Mulai Diagnostik'}
              </button>
            </form>

            {/* Quick Helper */}
            <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1 mt-4">
              <HelpCircle className="h-3 w-3" />
              <span>Gunakan default email & sandi untuk uji coba cepat.</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
