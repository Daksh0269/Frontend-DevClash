import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { account } from '../appwrite/config';
import Card from '../components/Card';
import Button from '../components/Button';

// ⚡ The Hardcoded Curated Engine
const VIDEO_LIBRARY = [
  { id: 'v2pje4r_q8k', title: 'Rotational Motion One Shot', subject: 'Physics', channel: 'Physics Wallah' },
  { id: 'b7ZgUeW31vQ', title: 'Kinematics Complete Masterclass', subject: 'Physics', channel: 'Eduniti' },
  { id: '1uKwP0y0rKE', title: 'Organic Chemistry Basics (GOC)', subject: 'Chemistry', channel: 'Pankaj Sir' },
  { id: 'something1', title: 'Chemical Bonding & Structure', subject: 'Chemistry', channel: 'Unacademy' },
  { id: 'something2', title: 'Definite Integration Tricks', subject: 'Mathematics', channel: 'Neha Agrawal' },
  { id: 'something3', title: 'Complex Numbers JEE Mains', subject: 'Mathematics', channel: 'MathonGo' },
];

export default function VideoVault() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState(null);
  const [watchedVideos, setWatchedVideos] = useState([]); // Array of video IDs
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const session = await account.get();
        setUser(session);
        // Fetch their watch history
        const response = await axios.get(`http://localhost:5000/api/history/${session.$id}`);
        // Extract just the video IDs they have watched
        const watchedIds = response.data.data.map(record => record.videoId);
        setWatchedVideos(watchedIds);
      } catch (error) {
        console.error("Could not load user data");
      }
    };
    loadData();
  }, []);

  const handleMarkWatched = async (video) => {
    if (!user) return;
    try {
      await axios.post('http://localhost:5000/api/history/mark-watched', {
        userId: user.$id,
        videoId: video.id,
        title: video.title,
        subject: video.subject
      });
      // Update UI instantly
      if (!watchedVideos.includes(video.id)) {
        setWatchedVideos([...watchedVideos, video.id]);
      }
    } catch (error) {
      console.error("Failed to mark as watched");
    }
  };

  // Filter library based on search
  const filteredLibrary = VIDEO_LIBRARY.filter(vid => 
    vid.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    vid.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0a0f1c] p-6 text-slate-200">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Curated Vault</h1>
            <p className="text-slate-400">Master concepts through elite, hand-picked lectures.</p>
          </div>
          <div className="w-full md:w-96">
            <input 
              type="text" 
              placeholder="Search concepts (e.g., Rotation)..."
              className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-blue-500 shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
                    src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1`} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
                
                <div className="flex justify-between items-start p-4 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-sm">
                  <div>
                    <span className="text-xs font-black text-blue-400 uppercase tracking-widest">{activeVideo.subject}</span>
                    <h2 className="text-2xl font-bold text-white mt-1">{activeVideo.title}</h2>
                    <p className="text-slate-400 text-sm mt-1">Instructor: {activeVideo.channel}</p>
                  </div>
                  
                  <Button 
                    variant={watchedVideos.includes(activeVideo.id) ? 'success' : 'primary'}
                    onClick={() => handleMarkWatched(activeVideo)}
                  >
                    {watchedVideos.includes(activeVideo.id) ? '✅ Completed' : 'Mark as Completed'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-500">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">▶️</div>
                <p className="font-medium">Select a concept from the library to begin.</p>
              </div>
            )}
          </div>

          {/* Right/Bottom: The Library List */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 max-h-[600px] overflow-y-auto custom-scrollbar">
            <h3 className="text-lg font-bold text-white mb-4 px-2">Knowledge Base</h3>
            
            <div className="space-y-3">
              {filteredLibrary.map(video => {
                const isWatched = watchedVideos.includes(video.id);
                const isActive = activeVideo?.id === video.id;

                return (
                  <div 
                    key={video.id}
                    onClick={() => setActiveVideo(video)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                      isActive 
                        ? 'bg-blue-600/20 border-blue-500/50 shadow-md' 
                        : 'bg-black/20 border-transparent hover:bg-white/10 hover:border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-black/40 px-2 py-0.5 rounded">
                        {video.subject}
                      </span>
                      {isWatched && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">✅ DONE</span>}
                    </div>
                    <h4 className={`font-bold mt-2 ${isActive ? 'text-blue-300' : 'text-slate-200'}`}>
                      {video.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{video.channel}</p>
                  </div>
                );
              })}
              
              {filteredLibrary.length === 0 && (
                <p className="text-center text-slate-500 py-10">No concepts match your search.</p>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}