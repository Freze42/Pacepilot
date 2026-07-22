import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  MapPin, 
  Camera, 
  Trophy, 
  Building, 
  Plus, 
  Sparkles,
  Heart,
  Share2
} from 'lucide-react';
import { MOCK_ACTIVITIES, SEGMENTS, CLUBS } from '../data/mockData';

export default function SocialFeed({ user, feed, setFeed }) {
  const [subTab, setSubTab] = useState('feed'); // 'feed' | 'clubs_segments'
  const [newPost, setNewPost] = useState({ title: '', desc: '', distance: '', duration: '', photo: '' });
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});

  // Preset gorgeous running photographs for mock photo uploads
  const PRESET_PHOTOS = [
    { name: "Beautiful Sun Road", url: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=600&q=80" },
    { name: "Forest Trail Climb", url: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=600&q=80" },
    { name: "Athletic Track Focus", url: "https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&w=600&q=80" },
    { name: "Coastline Sunset Run", url: "https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=600&q=80" }
  ];

  const handleKudos = (id) => {
    const updated = feed.map(act => {
      if (act.id === id) {
        return {
          ...act,
          kudos: act.hasKudosed ? act.kudos - 1 : act.kudos + 1,
          hasKudosed: !act.hasKudosed
        };
      }
      return act;
    });
    setFeed(updated);
  };

  const handleAddComment = (e, actId) => {
    e.preventDefault();
    const commentText = commentInputs[actId];
    if (!commentText || !commentText.trim()) return;

    const updated = feed.map(act => {
      if (act.id === actId) {
        return {
          ...act,
          comments: [
            ...act.comments,
            { id: 'comment_' + Date.now(), userName: user.name, text: commentText }
          ]
        };
      }
      return act;
    });

    setFeed(updated);
    setCommentInputs({ ...commentInputs, [actId]: '' });
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.distance || !newPost.duration) return;

    const customPost = {
      id: 'custom_act_' + Date.now(),
      userName: user.name,
      userLevel: user.level,
      userAvatar: "🏃‍♂️",
      title: newPost.title,
      description: newPost.desc || "Sesi lari pagi yang luar biasa bersama PacePilot!",
      distance: parseFloat(newPost.distance),
      duration: newPost.duration,
      avgPace: "5:12", // calculated average pace
      avgHr: 148,
      elevationGain: 15,
      kudos: 0,
      hasKudosed: false,
      comments: [],
      date: "Baru saja",
      photo: newPost.photo || null,
      segmentName: null
    };

    setFeed([customPost, ...feed]);
    setNewPost({ title: '', desc: '', distance: '', duration: '', photo: '' });
    setShowCreatePost(false);
  };

  // Club Join toggle
  const [clubsList, setClubsList] = useState(CLUBS);
  const handleToggleJoinClub = (clubId) => {
    setClubsList(clubsList.map(club => {
      if (club.id === clubId) {
        return {
          ...club,
          joined: !club.joined,
          members: club.joined ? club.members - 1 : club.members + 1
        };
      }
      return club;
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      
      {/* Social Tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex gap-4">
          <button
            onClick={() => setSubTab('feed')}
            className={`font-bold text-sm tracking-wide transition-all pb-3 -mb-3.5 border-b-2 uppercase ${
              subTab === 'feed'
                ? 'text-rose-500 border-rose-500'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Feed Aktivitas Teman
          </button>
          
          <button
            onClick={() => setSubTab('clubs_segments')}
            className={`font-bold text-sm tracking-wide transition-all pb-3 -mb-3.5 border-b-2 uppercase ${
              subTab === 'clubs_segments'
                ? 'text-rose-500 border-rose-500'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Klub & Segmen Tercepat
          </button>
        </div>

        {subTab === 'feed' && (
          <button
            onClick={() => setShowCreatePost(true)}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/10"
          >
            <Plus className="h-4 w-4" />
            <span>Bagikan Lari Manual</span>
          </button>
        )}
      </div>

      {/* FEED SUB-TAB */}
      {subTab === 'feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed stream */}
          <div className="lg:col-span-2 space-y-6">
            {feed.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
                <Users className="h-10 w-10 mx-auto opacity-50 mb-2" />
                <p className="text-xs">Feed kosong. Jadilah yang pertama memposting sesi latihan Anda!</p>
              </div>
            ) : (
              feed.map((act) => (
                <div key={act.id} className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 shadow-lg space-y-4">
                  
                  {/* Post Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-lg">
                        {act.userAvatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                          <span>{act.userName}</span>
                          <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded uppercase tracking-wider ${
                            act.userLevel === 'pro' 
                              ? 'bg-rose-500/20 text-rose-400' 
                              : act.userLevel === 'intermediate'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {act.userLevel}
                          </span>
                        </h4>
                        <span className="text-[10px] text-slate-500 font-semibold">{act.date}</span>
                      </div>
                    </div>

                    {act.segmentName && (
                      <span className="px-2.5 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        <span>Segmen: {act.segmentName.split(' ')[0]}...</span>
                      </span>
                    )}
                  </div>

                  {/* Body Text */}
                  <div>
                    <h5 className="font-extrabold text-slate-100 text-base leading-snug">{act.title}</h5>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">{act.description}</p>
                  </div>

                  {/* Run Stats Ribbon */}
                  <div className="grid grid-cols-4 gap-2 text-center bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-lg">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Jarak</span>
                      <span className="text-sm font-extrabold text-white">{act.distance.toFixed(2)} KM</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Durasi</span>
                      <span className="text-sm font-extrabold text-white">{act.duration}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Rerata Pace</span>
                      <span className="text-sm font-extrabold text-rose-400">{act.avgPace} /km</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Elevasi</span>
                      <span className="text-sm font-extrabold text-amber-400">+{act.elevationGain} m</span>
                    </div>
                  </div>

                  {/* Photo attachment if available */}
                  {act.photo && (
                    <div className="relative rounded-lg overflow-hidden border border-slate-800 aspect-[16/9] max-h-[250px] bg-slate-950">
                      <img src={act.photo} alt={act.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  )}

                  {/* Kudos and Actions */}
                  <div className="flex items-center gap-6 border-y border-slate-800/60 py-2.5 text-xs font-semibold">
                    <button
                      onClick={() => handleKudos(act.id)}
                      className={`flex items-center gap-1.5 transition-colors ${act.hasKudosed ? 'text-rose-500 font-extrabold scale-105' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      <ThumbsUp className={`h-4 w-4 ${act.hasKudosed ? 'fill-rose-500 stroke-rose-600' : ''}`} />
                      <span>{act.kudos} Kudos</span>
                    </button>

                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MessageSquare className="h-4 w-4" />
                      <span>{act.comments.length} Komentar</span>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="space-y-2.5">
                    {act.comments.map((comment) => (
                      <div key={comment.id} className="bg-slate-950/40 p-2.5 rounded border border-slate-850/60 text-xs">
                        <strong className="text-rose-400 mr-2">{comment.userName}</strong>
                        <span className="text-slate-300 leading-normal">{comment.text}</span>
                      </div>
                    ))}

                    <form onSubmit={(e) => handleAddComment(e, act.id)} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Tulis tanggapan atau semangati..."
                        value={commentInputs[act.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [act.id]: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded-lg p-2 flex-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                      <button
                        type="submit"
                        className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg transition-colors border border-slate-700"
                      >
                        Kirim
                      </button>
                    </form>
                  </div>

                </div>
              ))
            )}
          </div>

          {/* Social Sidebar Widgets */}
          <div className="space-y-6">
            
            {/* Quick stats / profile preview */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Gelar Athlete Anda</span>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center font-bold text-xl text-rose-400">
                  ⚡
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-200 text-base">{user.name}</h4>
                  <span className="text-xs text-slate-400 uppercase tracking-widest">{user.level} runner</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 flex justify-between text-center text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Kudos Diterima</span>
                  <span className="font-extrabold text-white text-base">48</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Klub Diikuti</span>
                  <span className="font-extrabold text-white text-base">2</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Stride</span>
                  <span className="font-extrabold text-white text-base">14k</span>
                </div>
              </div>
            </div>

            {/* Local Segments Shortlist */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3.5">
              <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2.5">
                <Trophy className="h-4 w-4 text-rose-500" />
                <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider">Segmen Strava Terpopuler</h4>
              </div>

              <div className="space-y-3 text-xs">
                {SEGMENTS.map((seg) => (
                  <div key={seg.id} className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
                    <span className="font-bold text-slate-200 block truncate">{seg.name}</span>
                    <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Jarak: {seg.distance} km • Elevasi: {seg.avgElevation}</span>
                    
                    {/* Leaderboard sample */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/50 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-amber-500">
                        <span>👑 {seg.leaderboard[0].name} (Pro)</span>
                        <span>{seg.leaderboard[0].time}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>🥈 {seg.leaderboard[1].name}</span>
                        <span>{seg.leaderboard[1].time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CLUBS & SEGMENTS SUB-TAB */}
      {subTab === 'clubs_segments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Clubs section */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h4 className="font-bold text-sm text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-1.5">
              <Building className="h-4 w-4 text-rose-500" />
              <span>Klub & Komunitas Lari</span>
            </h4>

            <div className="space-y-3.5">
              {clubsList.map((club) => (
                <div key={club.id} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <h5 className="font-bold text-slate-100 text-sm">{club.name}</h5>
                    <p className="text-xs text-slate-400 mt-1">{club.description}</p>
                    <span className="text-[10px] font-bold text-slate-500 mt-2 block uppercase">{club.members} Anggota Terdaftar</span>
                  </div>
                  <button
                    onClick={() => handleToggleJoinClub(club.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                      club.joined
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-600 hover:bg-rose-500 text-white shadow shadow-rose-600/10'
                    }`}
                  >
                    {club.joined ? 'Anggota ✔️' : 'Gabung'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Full Segments section */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h4 className="font-bold text-sm text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-rose-500" />
              <span>Leaderboard Segmen Lokal</span>
            </h4>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {SEGMENTS.map((seg) => (
                <div key={seg.id} className="space-y-2 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-200">{seg.name}</span>
                    <span className="text-[10px] text-rose-400 font-bold">{seg.distance} km</span>
                  </div>

                  {/* Leaderboard Table */}
                  <div className="mt-2 text-xs space-y-1">
                    {seg.leaderboard.map((runner) => (
                      <div key={runner.rank} className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded border border-slate-800/40">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold w-4 text-center ${runner.rank === 1 ? 'text-amber-500' : (runner.rank === 2 ? 'text-slate-400' : 'text-slate-500')}`}>
                            {runner.rank}
                          </span>
                          <span className="text-slate-300 font-semibold">{runner.name}</span>
                          <span className="text-[8px] bg-slate-800 px-1 text-slate-500 rounded uppercase">{runner.level}</span>
                        </div>
                        <span className="font-bold text-slate-200">{runner.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manual Activity Creation Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreatePost} className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-100 text-sm uppercase tracking-wide">Posting Aktivitas Baru</h3>
              <button type="button" onClick={() => setShowCreatePost(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Nama Aktivitas</label>
                <input 
                  type="text" 
                  placeholder="Misal: Morning Run with Friends" 
                  required
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded w-full p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Catatan & Deskripsi</label>
                <textarea 
                  placeholder="Bagaimana lari hari ini? Bagaimana kondisi cuaca?" 
                  rows="3"
                  value={newPost.desc}
                  onChange={(e) => setNewPost({ ...newPost, desc: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded w-full p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Jarak (KM)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="Misal: 5.0"
                    required
                    value={newPost.distance}
                    onChange={(e) => setNewPost({ ...newPost, distance: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded w-full p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Durasi (MM:SS)</label>
                  <input 
                    type="text" 
                    placeholder="Misal: 25:30"
                    required
                    value={newPost.duration}
                    onChange={(e) => setNewPost({ ...newPost, duration: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded w-full p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Photo customization list */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Lampirkan Foto Kegiatan</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {PRESET_PHOTOS.map((ph, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewPost({ ...newPost, photo: ph.url })}
                      className={`bg-slate-950/80 border p-1 rounded transition-all text-left overflow-hidden ${
                        newPost.photo === ph.url ? 'border-rose-500' : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <img src={ph.url} alt={ph.name} className="h-10 w-full object-cover rounded mb-1" />
                      <span className="text-[8px] text-slate-400 truncate block text-center font-semibold">{ph.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setShowCreatePost(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow"
              >
                Posting Berita Lari
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
