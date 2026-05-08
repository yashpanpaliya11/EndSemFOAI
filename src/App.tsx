import React from 'react';
import { motion } from 'motion/react';
import { useIssTracking } from './hooks/useIssTracking';
import { useNews } from './hooks/useNews';
import { IssMap } from './components/IssMap';
import { SpeedChart } from './charts/SpeedChart';
import { NewsChart } from './charts/NewsChart';
import { AiChatbot } from './chatbot/AiChatbot';
import { Satellite, Users, Zap, RefreshCw, Radio, Search } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

export default function App() {
  const { positions, currentPos, astros, loading: issLoading, manualRefresh } = useIssTracking();
  const { articles, loading: newsLoading, category, setCategory, searchQuery, setSearchQuery, refreshNews } = useNews();

  const handleRefresh = () => {
    manualRefresh();
    refreshNews();
    toast.success("Telemetry updated");
  };

  return (
    <div className="min-h-screen text-slate-200 font-sans selection:bg-blue-500/30">
      <div className="stars-bg"></div>
      <Toaster position="top-center" toastOptions={{ style: { background: '#1c1f33', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      
      {/* Top Navbar */}
      <nav className="glass-panel sticky top-0 z-40 px-6 py-4 flex flex-col sm:flex-row justify-between items-center border-b-0 border-white/5">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center border border-blue-400/30 font-bold">
            <Satellite size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-mono font-bold text-xl tracking-tight uppercase"><span className="text-blue-500">ISS</span> Live Tracker</h1>
            <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">System Telemetry Online</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={handleRefresh} className="p-2 rounded-full glassmorphism hover:bg-white/10 transition-colors flex items-center gap-2 px-4 text-sm font-mono">
            <RefreshCw size={14} className={issLoading ? 'animate-spin text-blue-400' : 'text-blue-400'} />
            SYNC
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 pt-8">
        
        {/* Left Column: ISS Telemetry & Map */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glassmorphism-dark p-4 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Radio size={48} /></div>
              <span className="text-xs font-mono text-slate-400 mb-1">LATITUDE</span>
              <span className="text-2xl font-mono">{currentPos?.lat.toFixed(4) || '---'}°</span>
            </div>
            <div className="glassmorphism-dark p-4 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Radio size={48} /></div>
              <span className="text-xs font-mono text-slate-400 mb-1">LONGITUDE</span>
              <span className="text-2xl font-mono">{currentPos?.lon.toFixed(4) || '---'}°</span>
            </div>
            <div className="glassmorphism-dark p-4 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Zap size={48} className="text-blue-500" /></div>
              <span className="text-xs font-mono text-blue-400 mb-1">SPEED</span>
              <span className="text-2xl font-mono text-white tracking-tight">{currentPos?.speed.toFixed(0) || '---'} <span className="text-sm text-slate-500 uppercase">km/h</span></span>
            </div>
            <div className="glassmorphism-dark p-4 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Users size={48} /></div>
              <span className="text-xs font-mono text-slate-400 mb-1">CREW IN SPACE</span>
              <span className="text-2xl font-mono">{astros?.number || '--'}</span>
            </div>
          </div>

          {/* Map */}
          <div className="glassmorphism-dark p-1 h-[400px] md:h-[500px] relative rounded-2xl overflow-hidden border border-white/5">
            <div className="absolute top-4 left-4 z-[400] glassmorphism px-3 py-1 text-xs font-mono hidden md:block border-blue-500/30 text-blue-300">
              ORBITAL TRACKING
            </div>
            {issLoading && positions.length === 0 ? (
               <div className="h-full w-full flex items-center justify-center">
                  <RefreshCw className="animate-spin text-blue-500" size={32} />
               </div>
            ) : (
                <div className="h-full w-full rounded-xl overflow-hidden pointer-events-auto">
                    <IssMap positions={positions} />
                </div>
            )}
          </div>

          {/* Speed Chart */}
          <div className="glassmorphism-dark p-5">
            <h2 className="font-mono text-sm tracking-wide text-slate-400 mb-2 uppercase border-b border-white/10 pb-2">Velocity Telemetry (Last 30 Cycles)</h2>
            <SpeedChart data={positions} />
          </div>

        </div>

        {/* Right Column: News & Astros */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Astros List */}
          <div className="glassmorphism-dark p-5">
             <h2 className="font-mono text-sm tracking-wide text-slate-400 mb-4 uppercase border-b border-white/10 pb-2">Active Personnel</h2>
             {astros ? (
                <ul className="space-y-3">
                  {astros.people.map((p, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-mono text-blue-300">{(p.name.match(/\b\w/g) || []).join('').substring(0,2)}</div>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-200">{p.name}</span>
                        <span className="text-xs text-slate-500 font-mono">{p.craft}</span>
                      </div>
                    </li>
                  ))}
                </ul>
             ) : (
                <div className="flex items-center justify-center py-6"><RefreshCw className="animate-spin text-slate-500" size={20} /></div>
             )}
          </div>

          {/* Space News */}
          <div className="glassmorphism-dark flex-1 flex flex-col p-0 overflow-hidden border border-white/5">
             <div className="p-5 border-b border-white/10 pb-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-mono text-sm tracking-wide text-slate-400 uppercase">Comm Intelligence</h2>
                    <select 
                      value={category} 
                      onChange={e => setCategory(e.target.value)}
                      className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs font-mono outline-none text-slate-300 pointer-events-auto"
                    >
                      <option value="space">Space</option>
                      <option value="technology">Tech</option>
                      <option value="science">Science</option>
                      <option value="ai">A.I.</option>
                    </select>
                </div>
                <div className="relative">
                  <input type="text" placeholder="Search logs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-slate-600 pointer-events-auto" />
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                </div>
             </div>

             {/* News List */}
             <div className="flex-1 overflow-y-auto max-h-[500px] p-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
                {newsLoading ? (
                    Array.from({length: 4}).map((_, i) => (
                        <div key={i} className="animate-pulse bg-white/5 h-24 rounded-lg m-2"></div>
                    ))
                ) : articles.length > 0 ? (
                    articles.map((a, i) => (
                        <a key={i} href={a.url} target="_blank" rel="noreferrer" className="block p-3 rounded-xl hover:bg-white/5 transition-colors group">
                            <div className="flex gap-3">
                                {a.urlToImage && (
                                    <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 hidden sm:block">
                                        <img src={a.urlToImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                )}
                                <div className="flex flex-col flex-1">
                                    <h3 className="text-sm font-medium leading-tight mb-1 line-clamp-2 text-slate-200 group-hover:text-blue-300 transition-colors">{a.title}</h3>
                                    <div className="flex justify-between items-center mt-auto">
                                        <span className="text-xs text-slate-500 font-mono tracking-tighter truncate max-w-[120px]">{a.source.name}</span>
                                        <span className="text-xs text-slate-600 font-mono">{new Date(a.publishedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    ))
                ) : (
                    <div className="p-6 text-center text-slate-500 text-sm">No transmissions found.</div>
                )}
             </div>
             
             {/* Article Chart */}
             <div className="border-t border-white/10 p-4 bg-black/20">
                <h3 className="font-mono text-xs text-slate-500 mb-2 uppercase text-center">Transmission Sources</h3>
                <NewsChart articles={articles} />
             </div>
          </div>

        </div>
      </main>

      <AiChatbot 
        dashboardData={{
            issLoc: currentPos ? { lat: currentPos.lat.toFixed(4), lon: currentPos.lon.toFixed(4) } : undefined,
            issSpeed: currentPos?.speed,
            astros: astros?.number,
            newsCount: articles.length,
            articles: articles.slice(0, 5).map(a => ({
                title: a.title,
                source: a.source?.name || 'Unknown',
                description: a.description || 'No summary available.',
                category: category || 'general',
                publishedAt: a.publishedAt
            }))
        }} 
      />
    </div>
  );
}
