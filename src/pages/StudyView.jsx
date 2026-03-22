import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { account } from '../appwrite/config';
import { useNavigate } from 'react-router-dom';

export default function StudyView() {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Get the logged-in user
    const initStudySession = async () => {
      try {
        const session = await account.get();
        setUser(session);
        
        // 2. Fetch the concepts from your backend
        // (Assuming you have a basic GET route, or we just fetch all for the demo)
        const response = await axios.get('http://localhost:5000/api/graph/all'); // We will add this quick route to backend if needed
        setCards(response.data.data || []);
      } catch (error) {
        console.error("Error loading study session:", error);
      } finally {
        setLoading(false);
      }
    };
    initStudySession();
  }, []);

  const handleRate = async (qualityScore) => {
    if (!user) return;
    
    const currentCard = cards[currentIndex];
    
    try {
      // Send the score to your SuperMemo-2 backend engine
      await axios.post('http://localhost:5000/api/review/submit', {
        userId: user.$id,
        conceptId: currentCard._id,
        quality: qualityScore
      });

      // Move to the next card
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to save review:", error);
      alert("Failed to save progress.");
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading your deck...</div>;
  
  if (cards.length === 0 || currentIndex >= cards.length) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">🎉 All Caught Up!</h2>
        <p className="text-slate-600 mb-6">You've reviewed all your concepts for today.</p>
        <button 
          onClick={() => navigate('/graph')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700"
        >
          Generate New Graph
        </button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="mb-8 text-slate-500 font-semibold">
        Card {currentIndex + 1} of {cards.length}
      </div>

      {/* The Flashcard */}
      <div 
        className="w-full max-w-lg h-80 perspective-1000 cursor-pointer"
        onClick={() => setIsFlipped(true)}
      >
        <div className={`relative w-full h-full transition-transform duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front of Card (Concept Title) */}
          <div className="absolute w-full h-full backface-hidden bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center p-8 text-center">
            <h2 className="text-4xl font-bold text-slate-800">{currentCard.title}</h2>
            {!isFlipped && (
              <p className="absolute bottom-6 text-sm text-slate-400 animate-pulse">Click to reveal answer</p>
            )}
          </div>

          {/* Back of Card (Concept Description) */}
          <div className="absolute w-full h-full backface-hidden bg-blue-50 rounded-2xl shadow-xl border border-blue-100 flex flex-col items-center justify-center p-8 text-center rotate-y-180">
            <h2 className="text-xl font-bold text-blue-900 mb-4">{currentCard.title}</h2>
            <p className="text-lg text-slate-700">{currentCard.description}</p>
          </div>

        </div>
      </div>

      {/* Rating Buttons (Only show when flipped) */}
      {isFlipped && (
        <div className="mt-10 flex gap-4 animate-fade-in-up">
          <button onClick={(e) => { e.stopPropagation(); handleRate(1); }} className="bg-red-100 text-red-700 px-6 py-3 rounded-lg font-bold hover:bg-red-200 transition">
            Forgot (1)
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleRate(3); }} className="bg-yellow-100 text-yellow-700 px-6 py-3 rounded-lg font-bold hover:bg-yellow-200 transition">
            Hard (3)
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleRate(4); }} className="bg-green-100 text-green-700 px-6 py-3 rounded-lg font-bold hover:bg-green-200 transition">
            Good (4)
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleRate(5); }} className="bg-blue-100 text-blue-700 px-6 py-3 rounded-lg font-bold hover:bg-blue-200 transition">
            Easy (5)
          </button>
        </div>
      )}
    </div>
  );
}