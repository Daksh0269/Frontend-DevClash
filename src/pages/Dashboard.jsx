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
    <div className="min-h-[calc(100vh-80px)] bg-[#0a0f1c] p-6 md:p-12 text-slate-200 selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-12 border-b border-white/5 pb-6">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">Configure Session</h1>
          <p className="text-slate-400 text-lg">Select your target area. The AI will track your weak concepts.</p>
        </div>

        {/* --- SECTION 1: SUBJECTS --- */}
        <div className="mb-12">
          {/* ⚡ Fixed Header Spacing */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/30">
              <span className="text-white font-black text-lg">1</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Select Subject</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Object.keys(syllabus).map(subject => (
              <div 
                key={subject}
                onClick={() => { setSelectedSubject(subject); setSelectedChapter(null); }}
                className="cursor-pointer transition-all duration-300 transform active:scale-95"
              >
                <Card 
                  hoverEffect={!selectedSubject || selectedSubject !== subject}
                  className={`h-full flex items-center justify-center text-center p-6 border-2 ${
                    selectedSubject === subject 
                      ? 'border-blue-500 bg-blue-600/10 shadow-[0_0_30px_rgba(37,99,235,0.2)]' 
                      : 'border-white/5'
                  }`}
                >
                  <span className={`text-xl font-bold ${selectedSubject === subject ? 'text-blue-400' : 'text-slate-300'}`}>
                    {subject}
                  </span>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* --- SECTION 2: CHAPTERS --- */}
        {selectedSubject && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400/30">
                <span className="text-white font-black text-lg">2</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-wide">Select Chapter</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {syllabus[selectedSubject].map(chapter => (
                <div 
                  key={chapter}
                  onClick={() => setSelectedChapter(chapter)}
                  className="cursor-pointer transition-all duration-300 transform active:scale-95"
                >
                  <Card 
                    hoverEffect={!selectedChapter || selectedChapter !== chapter}
                    className={`h-full flex items-center justify-center text-center p-5 border-2 ${
                      selectedChapter === chapter 
                        ? 'border-emerald-500 bg-emerald-600/10 shadow-[0_0_30px_rgba(16,185,129,0.15)]' 
                        : 'border-white/5'
                    }`}
                  >
                    <span className={`text-lg font-semibold ${selectedChapter === chapter ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {chapter}
                    </span>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- SECTION 3: LAUNCH PAD --- */}
        {selectedChapter && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-400/30">
                <span className="text-white font-black text-lg">3</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-wide">Session Length</h2>
            </div>
            
            <Card className="border-white/10 p-8 bg-black/20">
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {[10, 15, 30].map(count => (
                  <Button
                    key={count}
                    variant={questionCount === count ? 'primary' : 'outline'}
                    onClick={() => setQuestionCount(count)}
                    className="flex-1 py-4 text-lg"
                  >
                    {count} Questions
                  </Button>
                ))}
              </div>

              <Button 
                variant="success" 
                className="w-full py-5 text-xl tracking-widest uppercase font-black"
                onClick={handleStartTest}
              >
                Initialize NTA Simulator 🚀
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}