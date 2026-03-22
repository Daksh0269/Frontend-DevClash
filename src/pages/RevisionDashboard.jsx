import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { account } from '../appwrite/config';
import { useNavigate } from 'react-router-dom';

export default function RevisionDashboard() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'review', 'mastered'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const session = await account.get();
        const response = await axios.get(`http://localhost:5000/api/review/all/${session.$id}`);
        setCards(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load revision data:", error);
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  const formatReviewDate = (dateString) => {
    const reviewDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reviewDay = new Date(reviewDate);
    reviewDay.setHours(0, 0, 0, 0);

    const diffTime = reviewDay - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "OVERDUE";
    if (diffDays === 0) return "TODAY";
    if (diffDays === 1) return "TOMORROW";
    return `IN ${diffDays} DAYS`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#0a0f1c]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-50"></div>
      </div>
    );
  }

  const reviewingCards = cards.filter(card => card.status === 'Reviewing' || !card.status);
  const masteredCards = cards.filter(card => card.status === 'Mastered');

  // Reusable Card Component for elegant dark mode
  const ConceptCard = ({ card, type }) => {
    const isReview = type === 'review';
    const dateText = formatReviewDate(card.nextReviewDate);
    const isUrgent = dateText === "OVERDUE" || dateText === "TODAY";

    return (
      <div className={`p-5 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group ${
        isReview ? 'hover:border-amber-500/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                 : 'hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]'
      }`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-black/30 px-2 py-1 rounded">
              {card.subject}
            </span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-black/30 px-2 py-1 rounded">
              {card.chapter}
            </span>
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
            isUrgent && isReview ? 'bg-red-500/20 text-red-400 animate-pulse' : 
            isReview ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
          }`}>
            {dateText}
          </span>
        </div>
        <h3 className="font-bold text-slate-200 mb-2 text-lg">{card.subConcept}</h3>
        <p className="text-sm text-slate-500 line-clamp-2 group-hover:text-slate-400 transition-colors">
          {card.questionText}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-200 p-4 md:p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Neural Matrix</h1>
            <p className="text-slate-500 font-medium">Track your spaced repetition decay and mastered concepts.</p>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-6 py-3 rounded-lg font-bold transition-all"
            >
              New Mock Test
            </button>
            <button 
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all"
            >
              Start Daily Review ⚡
            </button>
          </div>
        </div>

        {/* Custom Tab Navigation */}
        <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-xl inline-flex border border-white/5 backdrop-blur-md">
          <button 
            onClick={() => setActiveView('overview')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeView === 'overview' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveView('review')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeView === 'review' ? 'bg-amber-500/20 text-amber-400 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Review Queue <span className="bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full text-xs">{reviewingCards.length}</span>
          </button>
          <button 
            onClick={() => setActiveView('mastered')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeView === 'mastered' ? 'bg-emerald-500/20 text-emerald-400 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Mastered Vault <span className="bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full text-xs">{masteredCards.length}</span>
          </button>
        </div>

        {/* Dynamic Views */}
        <div className="relative">
          
          {/* OVERVIEW: Split Screen */}
          {activeView === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Left Column: Review */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                  <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                  <h2 className="text-xl font-bold text-slate-300 tracking-wide">Pending Recall</h2>
                </div>
                {reviewingCards.slice(0, 10).map(card => <ConceptCard key={card._id} card={card} type="review" />)}
                {reviewingCards.length > 10 && <p className="text-center text-slate-500 text-sm py-4">+{reviewingCards.length - 10} more in Queue...</p>}
              </div>

              {/* Right Column: Mastered */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  <h2 className="text-xl font-bold text-slate-300 tracking-wide">Long-Term Memory</h2>
                </div>
                {masteredCards.slice(0, 10).map(card => <ConceptCard key={card._id} card={card} type="mastered" />)}
                {masteredCards.length > 10 && <p className="text-center text-slate-500 text-sm py-4">+{masteredCards.length - 10} more in Vault...</p>}
              </div>

            </div>
          )}

          {/* ISOLATED VIEW: Review Queue */}
          {activeView === 'review' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {reviewingCards.map(card => <ConceptCard key={card._id} card={card} type="review" />)}
              </div>
              {reviewingCards.length === 0 && (
                <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/5">
                  <h3 className="text-2xl font-bold text-slate-400 mb-2">Queue is Empty</h3>
                  <p className="text-slate-500">You are completely caught up on your active recall.</p>
                </div>
              )}
            </div>
          )}

          {/* ISOLATED VIEW: Mastered Vault */}
          {activeView === 'mastered' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {masteredCards.map(card => <ConceptCard key={card._id} card={card} type="mastered" />)}
              </div>
              {masteredCards.length === 0 && (
                <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/5">
                  <h3 className="text-2xl font-bold text-slate-400 mb-2">Vault is Empty</h3>
                  <p className="text-slate-500">Keep practicing to lock concepts into your long-term memory.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}