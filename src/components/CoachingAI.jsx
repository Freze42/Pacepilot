import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Droplet, 
  Apple, 
  Heart, 
  Gauge, 
  TrendingUp, 
  HelpCircle,
  FileText
} from 'lucide-react';

export default function CoachingAI({ user, runs }) {
  const [activeSubTab, setActiveSubTab] = useState('chat'); // 'chat' | 'analyzer' | 'nutrition'
  const [messages, setMessages] = useState([
    { id: '1', role: 'coach', text: `Halo ${user.name}! Saya Coach AI PacePilot Anda. Saya baru saja menyinkronkan profil tingkat kebugaran Anda (${user.level.toUpperCase()}) dan data VO2Max (${user.vo2maxHistory[user.vo2maxHistory.length - 1]?.value || 48}).` },
    { id: '2', role: 'coach', text: "Ada pertanyaan seputar pacing lari, latihan interval, program kekuatan otot, atau butuh panduan nutrisi minum untuk lari jarak jauh (long run) hari ini?" }
  ]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText || !inputText.trim()) return;

    const userMsg = { id: 'user_' + Date.now(), role: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Simulate AI Coaching smart response
    setTimeout(() => {
      let replyText = "";
      const text = inputText.toLowerCase();

      if (text.includes('minum') || text.includes('nutrisi') || text.includes('long run') || text.includes('makan')) {
        replyText = "Untuk lari jarak jauh (Long Run > 60 menit), rekomendasi hidrasi & nutrisi Coach AI adalah:\n\n" +
          "💧 HIDRASI: Minum 150-200ml cairan elektrolit setiap 15-20 menit. Hindari minum air putih murni dalam jumlah berlebih tanpa garam natrium untuk mencegah hiponatremia.\n" +
          "🍌 KARBOHIDRAT: Konsumsi 30-60 gram karbohidrat cepat serap (seperti energy gel, kurma, atau pisang) setiap 45 menit lari.\n" +
          "🧇 SEBELUM LARI: Makan berat kaya karbohidrat kompleks 2-3 jam sebelum lari (misal oatmeal, nasi/roti gandum).\n" +
          "🍗 SETELAH LARI: Konsumsi rasio karbohidrat dan protein 3:1 dalam jendela 45 menit pasca-lari untuk mempercepat pemulihan serat otot paha Anda.";
      } else if (text.includes('vo2max') || text.includes('vo2 max') || text.includes('naik')) {
        replyText = `Melihat tingkat VO2Max Anda saat ini di angka ${user.vo2maxHistory[user.vo2maxHistory.length - 1]?.value || 48} ml/kg/min, cara terbaik menaikkannya adalah:\n\n` +
          "1. Latihan Interval Vo2Max (seperti sesi hari Kamis Anda!): Lari 4x800m dengan intensitas 90-95% detak jantung maksimal.\n" +
          "2. Konsistensi Volume Aerobik (Lari Zona 2): Lakukan 80% porsi lari mingguan Anda di intensitas rendah untuk memperbanyak pembuluh kapiler darah dan mitokondria di otot.\n" +
          "3. Turunkan Berat Badan Sedikit (jika berlebih): Karena VO2Max dihitung per kilogram berat badan, menurunkan persentase lemak tubuh akan otomatis melesatkan angka VO2Max Anda.";
      } else if (text.includes('cedera') || text.includes('lutut') || text.includes('sakit')) {
        replyText = "Jika Anda merasakan nyeri persendian lutut atau IT Band, segeralah beristirahat! Pastikan Anda tidak melewatkan sesi Strength Training (Latihan Kekuatan) di hari Rabu. Melatih otot paha depan (quadriceps), bokong (glutes), dan core akan menstabilkan lutut Anda saat membentur aspal.";
      } else {
        replyText = `Pertanyaan yang bagus seputar "${inputText}"! Sebagai pelari level ${user.level.toUpperCase()}, fokus utama Anda saat ini haruslah menjaga konsistensi detak jantung tetap berada di Zona 2 (Conversational Pace) pada lari harian, dan mengeksekusi latihan interval dengan tertib. Pastikan sepatu lari utama Anda masih berada di bawah limit sol aus.`;
      }

      setMessages(prev => [...prev, { id: 'ai_' + Date.now(), role: 'coach', text: replyText }]);
    }, 1000);
  };

  const sendQuickPrompt = (promptText) => {
    setInputText(promptText);
  };

  // Run File Analyzer Details
  const latestRun = runs.length > 0 ? runs[0] : null;

  // Compute heart rate zone distributions
  const hrZones = latestRun && latestRun.avgHr ? {
    z1: Math.round(latestRun.duration * 0.1), // 10% recovery
    z2: Math.round(latestRun.duration * 0.55), // 55% aerobic
    z3: Math.round(latestRun.duration * 0.2), // 20% tempo
    z4: Math.round(latestRun.duration * 0.12), // 12% threshold
    z5: Math.round(latestRun.duration * 0.03) // 3% anaerobic VO2Max
  } : { z1: 600, z2: 1800, z3: 500, z4: 200, z5: 40 };

  const formatMinSec = (sec) => {
    const mins = Math.floor(sec / 60);
    return `${mins}m`;
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      
      {/* Tab Selectors */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-2 flex gap-4 shrink-0 z-10">
        <button
          onClick={() => setActiveSubTab('chat')}
          className={`font-bold text-xs py-2 border-b-2 uppercase tracking-wider transition-all ${
            activeSubTab === 'chat' ? 'text-rose-500 border-rose-500' : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          Coach AI Chatbot
        </button>
        <button
          onClick={() => setActiveSubTab('analyzer')}
          className={`font-bold text-xs py-2 border-b-2 uppercase tracking-wider transition-all ${
            activeSubTab === 'analyzer' ? 'text-rose-500 border-rose-500' : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          AI Run File Analyzer (GPS/TCX)
        </button>
        <button
          onClick={() => setActiveSubTab('nutrition')}
          className={`font-bold text-xs py-2 border-b-2 uppercase tracking-wider transition-all ${
            activeSubTab === 'nutrition' ? 'text-rose-500 border-rose-500' : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          Panduan Minum & Nutrisi Long Run
        </button>
      </div>

      {/* CHAT SUB-TAB */}
      {activeSubTab === 'chat' && (
        <div className="flex-1 flex overflow-hidden">
          
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-slate-950/20">
            <div className="flex-1 overflow-y-auto p-6 space-y-4.5">
              {messages.map((m) => (
                <div 
                  key={m.id} 
                  className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-8.5 h-8.5 rounded-full shrink-0 flex items-center justify-center text-sm border ${
                    m.role === 'user' 
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                      : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                  }`}>
                    {m.role === 'user' ? '🏃‍♂️' : '🤖'}
                  </div>
                  
                  <div className={`p-4 rounded-xl text-xs leading-relaxed border shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-rose-600/15 border-rose-500/10 text-slate-100 rounded-tr-none' 
                      : 'bg-slate-900 border-slate-800/80 text-slate-200 rounded-tl-none whitespace-pre-line'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef}></div>
            </div>

            {/* Quick Prompts Bar */}
            <div className="px-6 py-2 border-t border-slate-850 bg-slate-900/30 flex gap-2 overflow-x-auto select-none shrink-0 scrollbar-none">
              <button 
                onClick={() => sendQuickPrompt("Berapa takaran minum yang pas saat long run?")}
                className="text-[10px] font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-full shrink-0 transition-all"
              >
                💧 Nutrisi & Minum Long Run
              </button>
              <button 
                onClick={() => sendQuickPrompt("Bagaimana cara meningkatkan VO2Max?")}
                className="text-[10px] font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-full shrink-0 transition-all"
              >
                📈 Tingkatkan VO2Max
              </button>
              <button 
                onClick={() => sendQuickPrompt("Bagaimana menu pencegahan cedera lutut?")}
                className="text-[10px] font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-full shrink-0 transition-all"
              >
                💪 Tips Cegah Cedera
              </button>
            </div>

            {/* Message input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-900 shrink-0 flex gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tanyakan apa saja kepada Coach AI..."
                className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <button
                type="submit"
                className="px-5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-rose-600/10 flex items-center justify-center"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* FILE ANALYZER SUB-TAB (Req 13) */}
      {activeSubTab === 'analyzer' && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {latestRun ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Details: Telemetry and HR Zones */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Core File Telemetry */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <span className="text-[9px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      LATEST RUN SYNC DETECTED
                    </span>
                    <h4 className="font-extrabold text-slate-100 text-base mt-2">{latestRun.name}</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Analisis instan file GPS oleh PacePilot AI</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Volume Jarak</span>
                      <strong className="text-sm font-extrabold text-white">{latestRun.distance.toFixed(2)} km</strong>
                    </div>
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Rata-rata Pace</span>
                      <strong className="text-sm font-extrabold text-rose-400">{latestRun.avgPace} /km</strong>
                    </div>
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Detak Jantung</span>
                      <strong className="text-sm font-extrabold text-red-500">{latestRun.avgHr} BPM</strong>
                    </div>
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">VO2Max Kontribusi</span>
                      <strong className="text-sm font-extrabold text-amber-400">+{latestRun.vo2Max}</strong>
                    </div>
                  </div>
                </div>

                {/* Heart Rate Zones Duration Breakdown */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                  <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-1.5">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>Distribusi Zona Detak Jantung (Heart Rate Zones)</span>
                  </h4>

                  <div className="space-y-3.5 text-xs">
                    {/* Zone 5 */}
                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span className="text-red-600">Zona 5 - Anaerobic / VO2Max (&gt;172 BPM)</span>
                        <span className="text-slate-400">{formatMinSec(hrZones.z5)}</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-red-600 h-full" style={{ width: '4%' }}></div>
                      </div>
                    </div>

                    {/* Zone 4 */}
                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span className="text-orange-500">Zona 4 - Threshold (156 - 172 BPM)</span>
                        <span className="text-slate-400">{formatMinSec(hrZones.z4)}</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-orange-500 h-full" style={{ width: '15%' }}></div>
                      </div>
                    </div>

                    {/* Zone 3 */}
                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span className="text-amber-500">Zona 3 - Tempo (141 - 155 BPM)</span>
                        <span className="text-slate-400">{formatMinSec(hrZones.z3)}</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-amber-500 h-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>

                    {/* Zone 2 */}
                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span className="text-emerald-500">Zona 2 - Aerobic / Conversational (125 - 140 BPM)</span>
                        <span className="text-slate-400">{formatMinSec(hrZones.z2)}</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-emerald-500 h-full" style={{ width: '50%' }}></div>
                      </div>
                    </div>

                    {/* Zone 1 */}
                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span className="text-indigo-400">Zona 1 - Active Recovery (&lt;125 BPM)</span>
                        <span className="text-slate-400">{formatMinSec(hrZones.z1)}</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-indigo-400 h-full" style={{ width: '6%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Sidebar: AI Analytics Findings */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 text-xs">
                <div className="border-b border-slate-800 pb-2.5 flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 text-amber-500" />
                  <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider">Laporan Diagnosis Coach AI</h4>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                    <span className="font-bold text-emerald-400 block mb-1">✔️ KELEBIHAN SENSIONAL:</span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Kontrol pacing lari luar biasa stabil! Distribusi denyut jantung dominan berada di Zona 2 ({Math.round(hrZones.z2/60)} menit), menandakan fondasi aerobik seluler Anda semakin kokoh dan efisien membakar asam lemak.
                    </p>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                    <span className="font-bold text-orange-400 block mb-1">⚠️ EVALUASI TEKNIS:</span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Terdeteksi fluktuasi detak jantung melonjak ke ambang anaerobik di tanjakan kilometer terakhir. Untuk lari berikutnya, usahakan kurangi frekuensi ayunan langkah (stride frequency) saat jalur berbukit agar tidak cepat lelah (bonking).
                    </p>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 space-y-2">
                    <span className="font-bold text-rose-400 block">📊 ESTIMASI VO2MAX & DERAJAT KEBUGARAN:</span>
                    <div className="flex items-center justify-between border-y border-slate-800 py-1.5 text-[11px] font-semibold text-slate-300">
                      <span>VO2Max Terdeteksi:</span>
                      <span className="text-white font-extrabold">{latestRun.vo2Max} ml/kg/min</span>
                    </div>
                    <p className="text-slate-400 text-[10px] leading-relaxed">
                      Sistem sinkronisasi mendeteksi penambahan tingkat kebugaran kardiovaskular. Angka ini secara otomatis disinkronkan ke grafik utama Anda tanpa perlu pencatatan manual yang canggung.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center max-w-xl mx-auto space-y-4">
              <FileText className="h-12 w-12 text-slate-600 mx-auto" />
              <div>
                <h4 className="font-bold text-slate-300">Belum ada file olahraga terunggah</h4>
                <p className="text-xs text-slate-500 leading-normal mt-1.5">
                  Unggah file aktivitas olahraga Anda (.gpx/.tcx) melalui menu jadwal latihan lari di tab "Training Plans" agar AI dapat langsung membaca dan menyajikan analisis fungsional rute, pacing, dan zona detak jantung Anda di sini.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* NUTRITION & HYDRATION SUB-TAB (Req 14) */}
      {activeSubTab === 'nutrition' && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Droplet className="h-5.5 w-5.5 text-blue-400" />
              <span>Rekomendasi Nutrisi & Hidrasi Long Run Pelari</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Saat melakukan lari jarak jauh (durasi lebih dari 60 menit), tubuh kehabisan cadangan glikogen otot dan cairan elektrolit. Panduan sains olahraga ini membantu Anda terhindar dari kram otot dan dehidrasi berat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
            {/* Liquid & Water recommendations */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <h4 className="font-bold text-sm text-blue-400 flex items-center gap-1.5 border-b border-slate-800 pb-3">
                <Droplet className="h-4.5 w-4.5" />
                <span>1. Strategi Hidrasi (Aturan Cairan & Garam)</span>
              </h4>

              <div className="space-y-3 text-slate-300">
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  <strong className="text-white">Sebelum Lari (Pre-Hydration):</strong>
                  <p className="mt-1 text-slate-400">Minum 500-600ml cairan elektrolit 2 jam sebelum latihan agar sel tubuh sepenuhnya terhidrasi sebelum suhu badan memanas.</p>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  <strong className="text-white">Saat Lari Berlangsung (During Run):</strong>
                  <p className="mt-1 text-slate-400">Minum 150ml hingga 200ml cairan setiap 15-20 menit lari. Gunakan minuman olahraga ber-elektrolit (Isotonic) untuk menggantikan garam natrium yang hilang lewat keringat.</p>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  <strong className="text-white">Setelah Lari Selesai (Post-Hydration):</strong>
                  <p className="mt-1 text-slate-400">Ganti setiap 1 kg berat badan yang menyusut pasca-lari dengan meminum 1-1.2 liter air elektrolit/air mineral dingin dalam waktu 2 jam pertama.</p>
                </div>
              </div>
            </div>

            {/* Nutrition & Carbohydrates recommendations */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <h4 className="font-bold text-sm text-amber-500 flex items-center gap-1.5 border-b border-slate-800 pb-3">
                <Apple className="h-4.5 w-4.5" />
                <span>2. Strategi Pengisian Energi (Carbo-Loading)</span>
              </h4>

              <div className="space-y-3 text-slate-300">
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  <strong className="text-white">Asupan Glikogen Saat Lari (30-60g Carbs):</strong>
                  <p className="mt-1 text-slate-400">Setiap 45 menit lari, tubuh membutuhkan sekitar 30 hingga 60 gram karbohidrat sederhana. Setara dengan:</p>
                  <ul className="list-disc list-inside mt-2 text-rose-400 space-y-0.5 font-semibold">
                    <li>1.5 bungkus Energy Gel komersial</li>
                    <li>1 buah pisang ambon berukuran sedang</li>
                    <li>4-5 butir buah kurma manis</li>
                  </ul>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  <strong className="text-white">Waktu Pengonsumsian Glikogen:</strong>
                  <p className="mt-1 text-slate-400">Jangan menunggu sampai lapar atau lemas (bonking). Konsumsilah asupan energi pertama Anda tepat di menit ke-40 atau ke-45 lari Anda.</p>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  <strong className="text-white">Prinsip Recovery Otot:</strong>
                  <p className="mt-1 text-slate-400">Gunakan rasio 3:1 antara karbohidrat dan protein dalam jendela makan 45 menit pertama setelah lari (misal: susu cokelat ditambah pisang, atau roti gandum isi dada ayam).</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
