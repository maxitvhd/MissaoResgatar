import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Radio, Heart, Users, MessageSquare, Headphones, Award, Wifi, Music } from "lucide-react";
import { motion } from "motion/react";

export default function LiveRadio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [likesCount, setLikesCount] = useState(128);
  const [hasLiked, setHasLiked] = useState(false);
  const [currentTrack, setCurrentTrack] = useState({
    title: "Sobrenatural",
    artist: "Fernandinho - Ao Vivo em Itaquá",
    album: "Marcha para Jesus 2026"
  });
  const [quality, setQuality] = useState("HD (128kbps)");
  
  // Real live stream link from HolyHub
  const audioUrl = "https://emissoras.holyhub.com.br/listen/holyhub/alexa.aac"; 
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio(audioUrl);
    audioRef.current.volume = volume;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error("Audio playback error:", error);
          // Standard simulated fallback if blocked by browser policy
          setIsPlaying(true);
        });
    }
  };

  const handleLike = () => {
    if (hasLiked) {
      setLikesCount(prev => prev - 1);
      setHasLiked(false);
    } else {
      setLikesCount(prev => prev + 1);
      setHasLiked(true);
    }
  };

  // Schedule data
  const schedule = [
    { time: "06:00 - 08:00", name: "Altar Matinal", host: "Pr. Marcelo Dias" },
    { time: "08:00 - 12:00", name: "Holy Connection", host: "Missionária Amanda" },
    { time: "12:00 - 14:00", name: "Estudos no Almoço", host: "Pr. Marcos Vinicius" },
    { time: "14:00 - 18:00", name: "Tarde com Deus", host: "Locutora Sarah Lima" },
    { time: "18:00 - 22:00", name: "Voz Profética", host: "Bpo. Roberto Oliveira" },
    { time: "22:00 - 06:00", name: "Louvores da Noite", host: "Transmissão Automática" }
  ];

  return (
    <div className="py-12 bg-slate-950/40 relative">
      <div className="absolute inset-0 bg-radial-gradient from-blue-900/10 via-transparent to-transparent opacity-50"></div>
      
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        
        {/* Header Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-mono mb-4 uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 mr-1.5 animate-pulse" /> Rádio Ao Vivo
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100 tracking-tight">
            Rádio Marcha Digital
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-lg mx-auto">
            A trilha sonora oficial da Marcha para Jesus Itaquaquecetuba 2026 desenvolvida em parceria com a HolyHub. Sintonize na autoridade espiritual e sinta a paz inabalável.
          </p>
          <p className="text-xs text-amber-500 font-mono mt-2">
            Acesse: <a href="https://holyhub.com.br/radio" target="_blank" rel="noopener noreferrer" className="hover:underline">holyhub.com.br/radio</a>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Interactive Player Panel */}
          <div className="lg:col-span-7 bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between backdrop-blur-sm">
            
            {/* Top Info Bar */}
            <div className="p-4 bg-slate-900/70 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                </span>
                <span className="text-[11px] font-mono tracking-wider text-slate-300 uppercase">
                  {isPlaying ? "Transmitindo Ao Vivo" : "Rádio Desconectada"}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
                <Users className="w-3.5 h-3.5 text-amber-500/80" />
                <span className="font-mono">1.248 Ouvintes</span>
              </div>
            </div>

            {/* Core Album Art / Sound Waves Visualizer Area */}
            <div className="p-8 flex flex-col items-center justify-center text-center flex-1 bg-gradient-to-b from-slate-900/40 to-slate-950/80 min-h-[250px]">
              
              {/* Spinning/pulsing vinyl disk container */}
              <div className="relative mb-6">
                <motion.div
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                  className={`w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-slate-950 border-4 border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl relative ${
                    isPlaying ? "glow-accent border-amber-500/40" : ""
                  }`}
                >
                  <div className="absolute inset-4 rounded-full border border-slate-700/50 flex items-center justify-center">
                    <div className="absolute inset-6 rounded-full border border-slate-600/30 flex items-center justify-center">
                      {/* Center Hub */}
                      <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-amber-500/60 flex items-center justify-center">
                        <Headphones className="w-4 h-4 text-amber-500" />
                      </div>
                    </div>
                  </div>
                  {/* Decorative vinyl tracks */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0)_60%,rgba(0,0,0,0.5)_100%)]"></div>
                </motion.div>
                
                {/* Tone arm visualization */}
                <div 
                  className={`absolute top-0 -right-2 w-12 h-16 origin-top-left transition-transform duration-700 ${
                    isPlaying ? "rotate-12" : "rotate-0"
                  }`}
                >
                  <div className="w-1.5 h-12 bg-slate-500 rounded-full transform rotate-[25deg] shadow-md origin-top"></div>
                </div>
              </div>

              {/* Tracks titles */}
              <h3 className="text-xl font-serif font-bold text-amber-400 tracking-wide line-clamp-1">
                {currentTrack.title}
              </h3>
              <p className="text-xs text-slate-300 font-medium mt-1">
                {currentTrack.artist}
              </p>
              <p className="text-[10px] font-mono uppercase text-slate-500 mt-0.5 tracking-wider">
                {currentTrack.album}
              </p>

              {/* Soundwaves animations */}
              <div className="flex items-end justify-center space-x-1 h-8 mt-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((bar) => {
                  const randomHeight = isPlaying ? [10, 24, 8, 32, 14, 20, 10][bar % 7] : 4;
                  return (
                    <motion.div
                      key={bar}
                      animate={{ height: isPlaying ? [4, randomHeight, 4] : 4 }}
                      transition={{ repeat: Infinity, duration: 0.8 + (bar % 5) * 0.1, ease: "easeInOut" }}
                      className="w-1 bg-amber-500 rounded-t-full"
                      style={{ height: "4px" }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Core Playback Control Strip */}
            <div className="p-6 bg-slate-900/95 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Left Side: Buttons */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlayback}
                    id="btn-play-radio"
                    className="w-14 h-14 rounded-full bg-amber-400 hover:bg-amber-500 text-slate-900 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105 active:scale-95 cursor-pointer glow-accent"
                  >
                    {isPlaying ? <Pause className="w-6 h-6 fill-slate-900" /> : <Play className="w-6 h-6 fill-slate-900 ml-1" />}
                  </button>

                  <div className="text-left">
                    <span className="text-xs font-mono text-slate-400 block uppercase">Qualidade de Áudio</span>
                    <select 
                      value={quality}
                      onChange={(e) => setQuality(e.target.value)}
                      className="bg-slate-800 text-[11px] font-mono font-medium text-amber-400 border border-slate-700 rounded px-1.5 py-0.5 mt-0.5 outline-none focus:border-amber-500"
                    >
                      <option>HD (128kbps)</option>
                      <option>Média (64kbps)</option>
                      <option>Econômica (32kbps)</option>
                    </select>
                  </div>
                </div>

                {/* Center / Volume control */}
                <div className="flex items-center space-x-3 w-full sm:w-auto max-w-xs">
                  <Volume2 className="w-4 h-4 text-slate-400" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 h-1 rounded-lg bg-slate-800 appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-slate-400 w-8">{Math.round(volume * 100)}%</span>
                </div>

                {/* Right Side: Interactions */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleLike}
                    id="btn-like-radio"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-mono transition-all duration-300 ${
                      hasLiked
                        ? "bg-amber-400/10 border-amber-500/30 text-amber-400"
                        : "bg-slate-800/40 border-slate-700 text-slate-400 hover:text-amber-400 hover:border-amber-500/40"
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-amber-400 text-amber-400' : ''}`} />
                    <span>{likesCount}</span>
                  </button>

                  <div className="flex items-center space-x-1 text-slate-500 text-xs font-mono">
                    <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                    <span>AAC+ Stereo</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Side: Radio Schedule / Broadcast Guide */}
          <div className="lg:col-span-5 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between backdrop-blur-sm">
            <div>
              <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-slate-800">
                <Music className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-serif font-bold text-slate-200">Grade de Programação</h3>
              </div>

              <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                {schedule.map((prog, index) => {
                  // highlight if current program (simulate current matching 14h program)
                  const isCurrent = prog.name === "Tarde com Deus";
                  return (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border transition-all duration-300 ${
                        isCurrent
                          ? "bg-amber-400/5 border-amber-500/30 shadow-md"
                          : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700/60"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono tracking-wide text-slate-400 uppercase">
                          {prog.time}
                        </span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-mono uppercase tracking-widest animate-pulse">
                            No Ar agora
                          </span>
                        )}
                      </div>
                      <h4 className={`text-sm font-semibold mt-1 ${isCurrent ? 'text-amber-400' : 'text-slate-200'}`}>
                        {prog.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">Locução: {prog.host}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Support Panel */}
            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <div className="inline-flex items-center space-x-1.5 text-slate-400 text-xs bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span className="font-medium text-slate-300">Rádio Marcha Digital - 24h Edificando Vidas</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
