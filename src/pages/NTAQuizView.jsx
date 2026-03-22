import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { account } from '../appwrite/config';

// The 4 NTA Statuses
const STATUS = {
  UNVISITED: 'unvisited',
  NOT_ANSWERED: 'not_answered',
  ANSWERED: 'answered',
  MARKED_FOR_REVIEW: 'marked',
};

export default function NtaQuizView() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Grab the settings passed from the Dashboard
  const { subject, chapter, count } = location.state || { subject: 'Physics', chapter: 'Rotational Motion', count: 5 };

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // Stores { questionIndex: optionIndex }
  const [statuses, setStatuses] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState({ total: 0, correct: 0, incorrect: 0, unattempted: 0 });

  // ⚡ 1. Fetch Questions on Load
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.post('http://localhost:5000/api/quiz/start', {
          subject,
          chapter,
          count
        });
        
        setQuestions(response.data.data);
        setStatuses(Array(response.data.data.length).fill(STATUS.UNVISITED));
        setLoading(false);
      } catch (error) {
        console.error("Failed to load test:", error);
        alert("Failed to fetch questions. Have you seeded the database yet?");
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [subject, chapter, count]);

  // Timer Logic
  useEffect(() => {
    // Only run timer if we aren't loading and haven't submitted
    if (loading || isSubmitted) return;

    if (timeLeft <= 0) {
      submitExam();
      return;
    }
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, loading, isSubmitted]);

  // Format Time (MM:SS)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // NTA Navigation Logic
  const handleOptionSelect = (optionIndex) => {
    setAnswers({ ...answers, [currentIndex]: optionIndex });
  };

  const changeStatus = (newStatus) => {
    const newStatuses = [...statuses];
    newStatuses[currentIndex] = newStatus;
    setStatuses(newStatuses);
  };

  const handleSaveAndNext = () => {
    if (answers[currentIndex] !== undefined) {
      changeStatus(STATUS.ANSWERED);
    } else {
      changeStatus(STATUS.NOT_ANSWERED);
    }
    if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handleMarkForReviewAndNext = () => {
    changeStatus(STATUS.MARKED_FOR_REVIEW);
    if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handleClearResponse = () => {
    const newAnswers = { ...answers };
    delete newAnswers[currentIndex];
    setAnswers(newAnswers);
  };

  const jumpToQuestion = (index) => {
    if (statuses[currentIndex] === STATUS.UNVISITED) {
      const newStatuses = [...statuses];
      newStatuses[currentIndex] = STATUS.NOT_ANSWERED;
      setStatuses(newStatuses);
    }
    setCurrentIndex(index);
  };

  // ⚡ 2. Updated Submit Logic (Sending the full Question Data for Spaced Repetition)
  const submitExam = async () => {
    let c = 0, inc = 0, un = 0;
    
    questions.forEach((q, index) => {
      if (answers[index] === undefined) un++;
      else if (answers[index] === q.correctIndex) c++;
      else inc++;
    });

    setScore({
      total: (c * 4) - (inc * 1),
      correct: c,
      incorrect: inc,
      unattempted: un
    });
    setIsSubmitted(true);

    try {
      const session = await account.get(); 
      
      const reviewData = questions.map((q, index) => {
        const isCorrect = answers[index] === q.correctIndex;
        
        return {
          userId: session.$id,
          subject: subject,
          chapter: chapter,
          subConcept: q.subConcept || "General Concept", // Fallback just in case
          questionText: q.q,
          options: q.options,
          correctIndex: q.correctIndex,
          stepByStepSolution: q.stepByStepSolution,
          isCorrect: isCorrect // Passing boolean instead of 1-5 score for your 7/10 day custom logic
        };
      });

      await axios.post('http://localhost:5000/api/review/submit-batch', { reviews: reviewData });
      console.log("Study progress updated in database!");

    } catch (error) {
      console.error("Failed to update spaced repetition database", error);
    }
  };

  // ⚡ 3. Loading & Error States
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mb-4"></div>
        <h2 className="text-2xl font-bold text-slate-700">Loading NTA Environment...</h2>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">No Questions Found</h2>
        <p className="text-slate-600 mb-8">We don't have questions for {subject} - {chapter} yet.</p>
        <button onClick={() => navigate('/dashboard')} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold">
          Go Back
        </button>
      </div>
    );
  }

  // --- SCORE SCREEN UI ---
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-4xl w-full">
          <div className="text-center mb-10 pb-8 border-b border-slate-200">
            <h1 className="text-4xl font-black text-slate-800 mb-4">Exam Analysis</h1>
            <div className="text-6xl font-black text-blue-600 mb-2">{score.total} <span className="text-2xl text-slate-400">/ {questions.length * 4}</span></div>
            <p className="text-slate-500 font-medium bg-blue-50 inline-block px-4 py-1 rounded-full text-sm">Your targeted revisions have been scheduled.</p>
          </div>

          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-800">Instant Correction Report</h2>
            
            {questions.map((q, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === q.correctIndex;
              const isSkipped = userAnswer === undefined;

              let statusColor = "border-red-200 bg-red-50";
              let badgeColor = "bg-red-500";
              let statusText = "Incorrect (Review in 7 Days)";

              if (isCorrect) {
                statusColor = "border-emerald-200 bg-emerald-50";
                badgeColor = "bg-emerald-500";
                statusText = "Correct (Review in 10 Days)";
              } else if (isSkipped) {
                statusColor = "border-slate-200 bg-slate-50";
                badgeColor = "bg-slate-500";
                statusText = "Skipped (Review in 7 Days)";
              }

              return (
                <div key={index} className={`p-6 rounded-xl border-2 ${statusColor} relative`}>
                  <div className={`absolute top-0 right-0 -translate-y-1/2 translate-x-4 ${badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full shadow-md`}>
                    {statusText}
                  </div>
                  
                  {/* Shows the exact weak sub-concept identified */}
                  <div className="mb-2 inline-block px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Topic: {q.subConcept || "General Concept"}
                  </div>

                  <p className="text-lg font-semibold text-slate-800 mb-4">{q.q}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm font-medium mb-6">
                    <div className="p-3 bg-white rounded border border-slate-200 shadow-sm text-slate-500">
                      Your Answer: <span className={isCorrect ? "text-emerald-600" : "text-red-600 font-bold"}>
                        {isSkipped ? "None" : q.options[userAnswer]}
                      </span>
                    </div>
                    <div className="p-3 bg-white rounded border border-emerald-200 shadow-sm text-emerald-700">
                      Correct Answer: <span className="font-bold">{q.options[q.correctIndex]}</span>
                    </div>
                  </div>

                  {!isCorrect && (
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Step-by-Step Solution</h4>
                      <p className="text-slate-700 font-mono text-sm">{q.stepByStepSolution}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button onClick={() => navigate('/dashboard')} className="mt-10 w-full bg-slate-800 text-white font-bold py-4 rounded-xl hover:bg-slate-900 transition text-lg shadow-lg">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- NTA EXAM UI ---
  const q = questions[currentIndex];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="bg-blue-900 text-white p-4 flex justify-between items-center shadow-md z-10">
        <div className="font-bold text-xl">JEE Mains Mock Test Simulator</div>
        <div className="flex items-center gap-3 bg-blue-800 px-4 py-2 rounded-lg border border-blue-700">
          <span className="text-blue-200 text-sm font-semibold uppercase tracking-wider">Time Left</span>
          <span className="font-mono text-xl font-bold">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col border-r border-slate-200 bg-slate-50">
          <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Question {currentIndex + 1}</h2>
            <div className="flex gap-2 text-sm font-semibold text-slate-500">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">+4</span>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded">-1</span>
            </div>
          </div>

          <div className="p-8 flex-1 overflow-y-auto">
            <p className="text-xl text-slate-800 mb-8 leading-relaxed font-medium">{q.q}</p>
            <div className="space-y-4">
              {q.options.map((opt, idx) => (
                <label key={idx} className="flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition bg-white hover:border-blue-300 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
                  <input 
                    type="radio" 
                    name="option" 
                    className="w-5 h-5 text-blue-600"
                    checked={answers[currentIndex] === idx}
                    onChange={() => handleOptionSelect(idx)}
                  />
                  <span className="text-lg text-slate-700 font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center gap-4">
            <div className="flex gap-4">
              <button onClick={handleMarkForReviewAndNext} className="px-6 py-3 rounded border-2 border-purple-500 text-purple-700 font-bold hover:bg-purple-50 transition">
                Mark for Review & Next
              </button>
              <button onClick={handleClearResponse} className="px-6 py-3 rounded border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50 transition">
                Clear Response
              </button>
            </div>
            <button onClick={handleSaveAndNext} className="px-8 py-3 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-md">
              Save & Next
            </button>
          </div>
        </div>

        <div className="w-80 bg-white flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">
          <div className="p-4 bg-slate-100 border-b border-slate-200">
            <h3 className="font-bold text-slate-700">Question Palette</h3>
          </div>
          
          <div className="p-4 grid grid-cols-4 gap-3 overflow-y-auto flex-1 content-start">
            {questions.map((_, idx) => {
              let btnClass = "w-12 h-12 rounded-md font-bold text-lg flex items-center justify-center border-2 transition shadow-sm ";
              if (statuses[idx] === STATUS.ANSWERED) btnClass += "bg-green-500 border-green-600 text-white";
              else if (statuses[idx] === STATUS.NOT_ANSWERED) btnClass += "bg-red-500 border-red-600 text-white";
              else if (statuses[idx] === STATUS.MARKED_FOR_REVIEW) btnClass += "bg-purple-600 border-purple-700 text-white";
              else btnClass += "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"; 

              if (currentIndex === idx) btnClass += " ring-4 ring-blue-300 ring-offset-2";

              return (
                <button key={idx} onClick={() => jumpToQuestion(idx)} className={btnClass}>
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50">
             <button onClick={submitExam} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg shadow-md transition">
              Submit Final Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}