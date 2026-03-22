import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { account } from './appwrite/config';

// Pages
import Auth from './pages/Auth';
import StudyView from './pages/StudyView';
import GraphView from './pages/GraphView';
import QuizAnalyzer from './pages/QuizAnalysis';
import NtaQuizView from './pages/NTAQuizView';
import Dashboard from './pages/Dashboard';
import RevisionDashboard from './pages/RevisionDashboard';
import VideoVault from './pages/videoVault';
import YoutubeTracker from './pages/youtubeTracker';

// Components
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const session = await account.get();
      setUser(session);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#0a0f1c] text-slate-200">Loading Engine...</div>;

  return (
   <Router>
      {/* ⚡ FIXED: Added user={user} so buttons show up! */}
      <Navbar user={user} />
      
      <div className="min-h-screen bg-[#0a0f1c] text-slate-200">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
          <Route path="/graph" element={user ? <GraphView /> : <Navigate to="/" />} />
          <Route path="/study" element={user ? <StudyView /> : <Navigate to="/" />} />
          <Route path="/quiz" element={user ? <QuizAnalyzer /> : <Navigate to="/" />} />
          <Route path="/mock-test" element={user ? <NtaQuizView /> : <Navigate to="/" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/progress" element={user ? <RevisionDashboard /> : <Navigate to="/" />} />
          
          {/* ⚡ FIXED: Added routes for the new features */}
          <Route path="/vault" element={user ?  <VideoVault/>: <Navigate to="/" />} />
          <Route path="/focus" element={user ?  <YoutubeTracker/>: <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;