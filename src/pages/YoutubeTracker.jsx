import React, { useState } from 'react';
import axios from 'axios';
import { account } from '../appwrite/config';
import Card from '../components/Card';
import Button from '../components/Button';

export default function YoutubeTracker() {
  const [url, setUrl] = useState('');
  const [activeVideo, setActiveVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Helper to extract the 11-character video ID from any YouTube link format
  const extractVideoId = (link) => {
    const match = link.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
    return match ? match[1] : null;
  };

  const handleStartFocusSession = async () => {
    const id = extractVideoId(url);
    if (!id) return alert("Please enter a valid YouTube link.");

    setLoading(true);
    setSaveStatus('Initializing secure session...');

    try {
      // 1. Grab the real video title using a free oEmbed proxy (No API key needed!)
      let videoTitle = "External Focus Session";
      try {
        const embedRes = await axios.get(`https://noembed.com/embed?dataType=json&url=https://www.youtube.com/watch?v=${id}`);
        if (embedRes.data && embedRes.data.title) {
          videoTitle = embedRes.data.title;
        }
      } catch (e) {
        console.log("Could not fetch exact title, using default.");
      }

      // 2. Get the currently logged-in student
      const session = await account.get();

      // 3. Save it directly to their Watch History database!
      await axios.post('http://localhost:5000/api/history/mark-watched', {
        userId: session.$id,
        videoId: id,
        title: videoTitle,
        subject: "Self-Study" // Tags it so you know it was imported externally
      });

      // 4. Launch the theater mode
      setActiveVideo({ id, title: videoTitle });
      setSaveStatus('Tracking in your Vault ✅');
      setUrl(''); // Clear the input box

    } catch (error) {
      console.error(error);
      setSaveStatus('Session started (History sync failed)');
      // Let them watch it anyway even if the database fails
      setActiveVideo({ id, title: "External Focus Session" }); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0a0f1c] p-6 text-slate-200">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header & Input */}
        <div className="text-center md:text-left border-b border-white/5 pb-8">
          <h1 className="text-4xl font-black text-white mb-2">Zen Focus Player</h1>
          <p className="text-slate-400 mb-6 text-lg">Watch external lectures without algorithm distractions. Progress is saved to your Vault.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-3xl">
            <input 
              type="text" 
              placeholder="Paste any YouTube Link (e.g., https://youtu.be/...)"
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button 
              variant="primary" 
              className="px-8 py-4 text-lg whitespace-nowrap"
              onClick={handleStartFocusSession} 
              disabled={loading || !url}
            >
              {loading ? 'Securing...' : 'Start Session ⚡'}
            </Button>
          </div>
        </div>

        {/* The Theater Mode Player */}
        {activeVideo && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* Status Bar */}
            <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-t-2xl px-6 py-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <h2 className="text-lg font-bold text-white truncate max-w-[300px] sm:max-w-[500px]">
                  {activeVideo.title}
                </h2>
              </div>
              <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {saveStatus}
              </span>
            </div>

            {/* Distraction-Free Iframe */}
            <div className="aspect-video bg-black rounded-b-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border-x border-b border-white/10">
              <iframe 
                width="100%" 
                height="100%" 
                // rel=0 prevents showing random channels at the end, modestbranding removes the YT logo
                src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0&modestbranding=1`} 
                title="Zen Focus Player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>

            <div className="mt-6 text-center">
              <p className="text-slate-500 text-sm">
                Focus mode is active. Comments, recommended videos, and sidebar ads have been disabled.
              </p>
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}