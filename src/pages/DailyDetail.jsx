import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { account } from '../appwrite/config';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';

export default function DailyReview() {
  const [user, setUser] = useState(null);
  const [dueQueue, setDueQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDueCards = async () => {
      try {
        const session = await account.get();
        setUser(session);
        
        // Fetch all cards for this user
        const response = await axios.get(`http://localhost:5000/api/review/all/${session.$id}`);
        const allCards = response.data.data;

        // Filter for cards that are Reviewing AND Due Today/Overdue
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const urgentCards = allCards.filter(card => {
          if (card.status === 'Mastered') return false;
          
          const reviewDate = new Date(card.nextReviewDate || new Date());
          reviewDate.setHours(0, 0, 0, 0);
          
          return reviewDate <= today; // Due today or earlier
        });

        setDueQueue(urgentCards);
      } catch (error) {
        console.error("Failed to load review queue:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDueCards();
  }, []);

  const handleRateMemory = async (qualityScore) => {
    const currentCard = dueQueue[currentIndex];

    try {
      // Send the quality score to your SM2 algorithm in the backend
      await axios.post('http://localhost:5000/api/review/process', {
        userId: user.$id,
        conceptId: currentCard.conceptId || currentCard._id, // Fallback depending on your DB structure
        quality: qualityScore
      });

      // Move to the next card
      if (currentIndex < dueQueue.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false); // Reset the flip state for the next card
      } else {
        // Queue is finished!
        setDueQueue([]); 
      }
    } catch (error) {
      console.error("Failed to process review:", error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center text-white font-bold">Loading Neural Matrix...</div>;
  }

  // FINISHED STATE
  if (dueQueue.length === 0 || currentIndex >= dueQueue.length) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#0a0f1c] flex flex-col items-center justify-center p-6 text-slate-200">
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-4xl mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
          ✓
        </div>
        <h1 className="text-4xl font-black text-white mb-4">You're all caught up!</h1>
        <p className="text-slate-400 mb-8 max-w-md text-center">
          You have successfully completed your active recall session for today. Your neural decay has been reset.
        </p>
        <Button variant="primary" onClick={() => navigate('/progress')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const currentCard = dueQueue[currentIndex];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0a0f1c] p-6 flex flex-col items-center justify-center text-slate-200 selection:bg-blue-500/30">
      <div className="w-full max-w-2xl">
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm font-bold text-slate-400 mb-2 tracking-widest uppercase">
            <span>Daily Review</span>
            <span>{currentIndex + 1} / {dueQueue.length}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(37,99,235,0.5)]" 
              style={{ width: `${((currentIndex + 1) / dueQueue.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* The Flashcard */}
        <Card className="min-h-[400px] flex flex-col border-white/10 bg-black/40 shadow-2xl relative overflow-hidden transition-all duration-500">
          
          {/* Tags */}
          <div className="absolute top-6 left-6 flex gap-2">
            <span className="text-xs font-black bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full uppercase tracking-wider border border-blue-500/20">
              {currentCard.subject}
            </span>
            <span className="text-xs font-black bg-white/10 text-slate-300 px-3 py-1 rounded-full uppercase tracking-wider border border-white/5">
              {currentCard.chapter}
            </span>
          </div>

          {/* Flashcard Content Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center mt-12">
            <h2 className="text-2xl font-black text-white mb-6 tracking-wide">
              {currentCard.subConcept}
            </h2>
            
            <p className="text-lg text-slate-300 leading-relaxed font-medium">
              {currentCard.questionText}
            </p>

            {/* The Answer Reveal Area */}
            {isFlipped && (
              <div className="mt-8 pt-8 border-t border-white/10 w-full animate-in fade-in slide-in-from-top-4 duration-500">
                <p className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-3">Self-Assessment</p>
                <p className="text-slate-400 italic">
                  Did you accurately recall the formula, rule, or concept required to solve this?
                </p>
              </div>
            )}
          </div>

          {/* Controls Area */}
          <div className="p-6 bg-white/5 border-t border-white/10 mt-auto">
            {!isFlipped ? (
              <Button 
                variant="primary" 
                className="w-full py-4 text-lg shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                onClick={() => setIsFlipped(true)}
              >
                Reveal Answer / Assess Memory
              </Button>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in zoom-in-95 duration-300">
                <button 
                  onClick={() => handleRateMemory(1)}
                  className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 py-3 rounded-xl font-bold transition-all flex flex-col items-center gap-1"
                >
                  <span className="text-xl">😓</span>
                  <span>Forgot (1)</span>
                </button>
                <button 
                  onClick={() => handleRateMemory(3)}
                  className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 py-3 rounded-xl font-bold transition-all flex flex-col items-center gap-1"
                >
                  <span className="text-xl">🤔</span>
                  <span>Hard (3)</span>
                </button>
                <button 
                  onClick={() => handleRateMemory(5)}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 py-3 rounded-xl font-bold transition-all flex flex-col items-center gap-1"
                >
                  <span className="text-xl">😎</span>
                  <span>Easy (5)</span>
                </button>
              </div>
            )}
          </div>
          
        </Card>
      </div>
    </div>
  );
}