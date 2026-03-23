import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';

const syllabus = {
  Physics: [
    'Units and Measurements', 'Motion in One Dimension', 'Motion in Two Dimensions', 
    'Laws of Motion', 'Work, Power, Energy', 'Center of Mass', 'Gravitation', 
    'Properties of Solids', 'Properties of Fluids', 'Ray Optics', 'Dual Nature of Radiation'
  ],
  Chemistry: [
    'Some Basic Concepts of Chemistry', 'Structure of Atom', 'Thermodynamics (C)', 
    'Ionic Equilibrium', 'Redox Reactions', 'Classification of Elements and Periodicity in Properties', 
    'p Block Elements (Group 15, 16, 17 & 18)', 'd and f Block Elements', 'Coordination Compounds', 
    'General Organic Chemistry', 'Aldehydes and Ketones', 'Carboxylic Acid Derivatives', 
    'Amines', 'Biomolecules'
  ],
  Mathematics: [
    'Quadratic Equation', 'Complex Number', 'Sequences and Series', 'Permutation Combination', 
    'Binomial Theorem', 'Statistics', 'Matrices', 'Determinants', 'Probability', 'Sets and Relations', 
    'Functions', 'Limits', 'Continuity and Differentiability', 'Differentiation', 
    'Application of Derivatives', 'Indefinite Integration', 'Definite Integration', 
    'Area Under Curves', 'Differential Equations', 'Straight Lines', 'Circle', 'Parabola', 
    'Ellipse', 'Hyperbola', 'Trigonometric Ratios & Identities', 'Trigonometric Equations', 
    'Inverse Trigonometric Functions', 'Three Dimensional Geometry'
  ]
};

export default function Dashboard() {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [questionCount, setQuestionCount] = useState(15);
  const navigate = useNavigate();

  const handleStartTest = () => {
    if (!selectedSubject || !selectedChapter) return;
    navigate('/mock-test', { 
      state: { subject: selectedSubject, chapter: selectedChapter, count: questionCount } 
    });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#05070a] p-6 md:p-12 text-slate-200 selection:bg-emerald-500/30">
      <div className="max-w-5xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-12 border-b border-emerald-500/10 pb-8">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
            Practice <span className="text-emerald-500">Tests</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium">Configure your session. Our engine adapts to your performance.</p>
        </div>

        {/* --- SECTION 1: SUBJECTS --- */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-black border border-emerald-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <span className="text-emerald-500 font-black text-lg font-mono">01</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide uppercase text-sm tracking-[0.2em]">Select Subject</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Object.keys(syllabus).map(subject => (
              <div 
                key={subject}
                onClick={() => { setSelectedSubject(subject); setSelectedChapter(null); }}
                className="cursor-pointer transition-all duration-300 transform active:scale-95"
              >
                <div className={`h-full flex items-center justify-center text-center p-8 rounded-2xl border-2 transition-all duration-500 ${
                    selectedSubject === subject 
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.1)]' 
                      : 'border-white/5 bg-white/[0.02] hover:border-emerald-500/30 hover:bg-white/[0.04]'
                  }`}
                >
                  <span className={`text-xl font-black tracking-widest uppercase ${selectedSubject === subject ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {subject}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- SECTION 2: CHAPTERS --- */}
        {selectedSubject && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-xl bg-black border border-emerald-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <span className="text-emerald-500 font-black text-lg font-mono">02</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-wide uppercase text-sm tracking-[0.2em]">Select Concept</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {syllabus[selectedSubject].map(chapter => (
                <div 
                  key={chapter}
                  onClick={() => setSelectedChapter(chapter)}
                  className="cursor-pointer transition-all duration-300 transform active:scale-95"
                >
                  <div className={`h-full flex items-center justify-center text-center p-5 rounded-xl border transition-all duration-300 ${
                      selectedChapter === chapter 
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_25px_rgba(16,185,129,0.1)]' 
                        : 'border-white/5 bg-white/[0.01] hover:border-white/20'
                    }`}
                  >
                    <span className={`text-sm font-bold tracking-tight ${selectedChapter === chapter ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {chapter}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- SECTION 3: LAUNCH PAD --- */}
        {selectedChapter && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-xl bg-black border border-emerald-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <span className="text-emerald-500 font-black text-lg font-mono">03</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-wide uppercase text-sm tracking-[0.2em]">Session Duration</h2>
            </div>
            
            <div className="bg-[#0a0c10] border border-white/5 rounded-3xl p-8 shadow-2xl">
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                {[10, 15, 30].map(count => (
                  <button
                    key={count}
                    onClick={() => setQuestionCount(count)}
                    className={`flex-1 py-4 rounded-2xl font-black text-sm tracking-widest transition-all duration-300 border-2 ${
                      questionCount === count 
                        ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
                        : 'border-white/5 text-slate-500 hover:border-white/20'
                    }`}
                  >
                    {count} QUESTIONS
                  </button>
                ))}
              </div>

              <button 
                className="w-full py-6 rounded-2xl text-xl tracking-[0.3em] uppercase font-black bg-white text-black hover:bg-emerald-500 transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)] active:scale-[0.98]"
                onClick={handleStartTest}
              >
                Start Practice Session
              </button>
              
              <p className="text-center mt-6 text-[10px] text-slate-600 uppercase tracking-[0.4em]">
                System Ready • Neural Engine Active
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}