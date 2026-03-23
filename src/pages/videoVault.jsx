import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { account } from '../appwrite/config';
import Card from '../components/Card';
import Button from '../components/Button';

export default function VideoVault() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('library'); // 'library' or 'history'

  const [libraryVideos, setLibraryVideos] = useState([]);
  const [historyVideos, setHistoryVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEngineData = async () => {
      try {
        // 1. Get the User First (If this fails, they aren't logged in)
        const session = await account.get();
        setUser(session);

        // 2. Fetch the Curated Videos (Independent Try/Catch)
        try {
          const vaultRes = await axios.get('http://localhost:5000/api/vault');
          if (vaultRes.data.success) {
            setLibraryVideos(vaultRes.data.data);
          }
        } catch (vaultErr) {
          console.error("Vault Error:", vaultErr);
        }

        // 3. Fetch the History (Independent Try/Catch)
        try {
          const historyRes = await axios.get(`http://localhost:5000/api/history/${session.$id}`);
          if (historyRes.data.success) {
            setHistoryVideos(historyRes.data.data);
          }
        } catch (historyErr) {
          console.error("History Error:", historyErr);
        }

      } catch (error) {
        console.error("User Session Failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEngineData();
  }, []);

  const handleMarkWatched = async (video) => {
    if (!user) return;
    try {
      const res = await axios.post('http://localhost:5000/api/history/mark-watched', {
        userId: user.$id,
        videoId: video.videoId || video.id, // Failsafe for the database save
        title: video.title,
        subject: video.subject
      });

      // Instantly update the UI history array so it feels incredibly fast
      if (res.data.success) {
        setHistoryVideos(prev => {
          // Remove it if it already exists so we can move it to the top
          const filtered = prev.filter(v => v.videoId !== (video.videoId || video.id));
          return [res.data.data, ...filtered];
        });
      }
    } catch (error) {
      console.error("Failed to save progress.");
    }
  };

  // Helper to check if a video is in our history
  const isWatched = (vidId) => historyVideos.some(h => h.videoId === vidId);

  // Filter the library search
  const filteredLibrary = libraryVideos.filter(vid =>
    vid.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vid.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ⚡ THE FAILSAFE: Calculates the correct ID right before rendering the player
  const playId = activeVideo ? (activeVideo.videoId || activeVideo.id) : null;

  if (loading) return <div className="text-center text-white mt-20">Loading Vault...</div>;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0a0f1c] p-6 text-slate-200">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Knowledge Vault</h1>
            <p className="text-slate-400">Master concepts through curated lectures and track your journey.</p>
          </div>

          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('library')}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'library' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Curated Library
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex gap-2 items-center ${activeTab === 'history' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              My History
              <span className="bg-black/30 px-2 py-0.5 rounded-full text-xs">{historyVideos.length}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left/Top: The Video Player Area */}
          <div className="lg:col-span-2 space-y-4">
            {activeVideo ? (
              <div className="animate-in fade-in duration-500">
                <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl mb-4">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${playId}?autoplay=1&rel=0`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>

                <div className="flex justify-between items-start p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                  <div>
                    <span className="text-xs font-black text-blue-400 uppercase tracking-widest">{activeVideo.subject}</span>
                    <h2 className="text-2xl font-bold text-white mt-1">{activeVideo.title}</h2>
                    {activeVideo.channel && <p className="text-slate-400 text-sm mt-1">Instructor: {activeVideo.channel}</p>}
                  </div>

                  <Button
                    variant={isWatched(playId) ? 'success' : 'primary'}
                    onClick={() => handleMarkWatched(activeVideo)}
                  >
                    {isWatched(playId) ? '✅ Completed' : 'Mark as Completed'}
                  </Button>
                </div>

                {activeVideo.notes && (
                  <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200/80 text-sm font-mono leading-relaxed">
                    <span className="font-bold text-amber-400 uppercase text-xs block mb-2">Quick Notes:</span>
                    {activeVideo.notes}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-500">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-2xl">▶️</div>
                <p className="font-medium">Select a video from the list to begin.</p>
              </div>
            )}
          </div>

          {/* Right/Bottom: The Sidebar List (Dynamic based on Tab) */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col h-[600px]">

            {activeTab === 'library' && (
              <input
                type="text"
                placeholder="Search concepts..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 mb-4 text-white focus:outline-none focus:border-blue-500 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            )}

            <div className="overflow-y-auto custom-scrollbar flex-1 space-y-3 pr-2">

              {/* RENDER LIBRARY TAB */}
              {activeTab === 'library' && filteredLibrary.map(video => {
                const currentId = video.videoId || video.id;
                return (
                  <div
                    key={video._id || currentId}
                    onClick={() => setActiveVideo(video)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${playId === currentId ? 'bg-blue-600/20 border-blue-500/50' : 'bg-black/20 border-transparent hover:bg-white/10'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                        {video.subject}
                      </span>
                      {isWatched(currentId) && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">✅ DONE</span>}
                    </div>
                    <h4 className="font-bold mt-2 text-slate-200 text-sm leading-snug">{video.title}</h4>
                  </div>
                );
              })}

              {/* RENDER HISTORY TAB */}
              {activeTab === 'history' && historyVideos.length === 0 && (
                <div className="text-center text-slate-500 py-10 text-sm">You haven't tracked any videos yet!</div>
              )}

              {activeTab === 'history' && historyVideos.map(record => {
                const currentId = record.videoId || record.id;
                return (
                  <div
                    key={record._id || currentId}
                    onClick={() => setActiveVideo(record)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${playId === currentId ? 'bg-emerald-600/20 border-emerald-500/50' : 'bg-black/20 border-white/5 hover:bg-white/10'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-black/40 px-2 py-0.5 rounded">
                        {record.subject}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(record.watchedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-bold mt-2 text-emerald-100 text-sm leading-snug">{record.title}</h4>
                    <div className="text-xs text-emerald-500 mt-2 font-medium flex items-center gap-1">
                      <span>↻</span> Click to Review
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}