import React, { useState } from 'react';
import axios from 'axios';

export default function QuizAnalyzer() {
  // Hardcoded for the demo, but you would normally fetch these from your AI generate route!
  const [topic] = useState("JavaScript Promises");
  const [questions] = useState([
    { id: 1, q: "What does a Promise represent in JavaScript?", options: ["A guaranteed variable", "The eventual completion of an async operation", "A syntax error handler"], correct: 1 },
    { id: 2, q: "Which keyword is used to wait for a Promise to resolve?", options: ["pause", "halt", "await"], correct: 2 },
    { id: 3, q: "How do you catch an error in a Promise chain?", options: [".catch()", ".error()", ".fail()"], correct: 0 }
  ]);

  const [answers, setAnswers] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleSelect = (qId, optionIndex) => {
    setAnswers({ ...answers, [qId]: optionIndex });
  };

  const handleSubmit = async () => {
    setIsAnalyzing(true);
    try {
      // Send the questions and the student's selected answers to Gemini
      const response = await axios.post('http://localhost:5000/api/ai/evaluate-quiz', {
        topic,
        questions,
        userAnswers: answers
      });
      setAnalysis(response.data.data);
    } catch (error) {
      console.error("Evaluation failed", error);
      alert("Failed to analyze. Check backend.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
        <h2 className="text-xl font-bold text-slate-700">AI is analyzing your knowledge gaps...</h2>
        <p className="text-slate-500">Designing your custom syllabus.</p>
      </div>
    );
  }

  // THE RESULTS DASHBOARD
  if (analysis) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header Score */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
            <h1 className="text-4xl font-black text-slate-800 mb-2">{analysis.score}%</h1>
            <p className="text-lg text-slate-600">{analysis.encouragement}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Custom Schedule */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">📅 Your 3-Day Action Plan</h2>
              <div className="space-y-4">
                {analysis.studySchedule.map((day, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="font-bold text-blue-700 whitespace-nowrap">{day.day}</div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{day.focus}</h3>
                      <p className="text-sm text-slate-600">{day.actionItem}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Curated Resources */}
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">🎯 Weak Areas to Fix</h2>
                <ul className="list-disc pl-5 space-y-2">
                  {analysis.weakAreas.map((area, i) => (
                    <li key={i} className="text-slate-700 font-medium">{area}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">📺 Recommended Tutorials</h2>
                <div className="space-y-3">
                  {analysis.youtubeSearches.map((vid, i) => (
                    // Hackathon Trick: Directly link to YouTube search results to avoid needing the official YouTube API key
                    <a 
                      key={i} 
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(vid.searchQuery)}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="block p-3 border border-slate-200 rounded-lg hover:border-red-500 hover:shadow-md transition group"
                    >
                      <div className="font-semibold text-slate-800 group-hover:text-red-600 transition">{vid.title}</div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        ▶ Watch on YouTube
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button onClick={() => window.location.reload()} className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 transition">
            Take Another Assessment
          </button>
        </div>
      </div>
    );
  }

  // THE QUIZ UI
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Knowledge Check: {topic}</h1>
        
        <div className="space-y-8">
          {questions.map((q) => (
            <div key={q.id} className="space-y-3">
              <h3 className="font-semibold text-lg text-slate-700">{q.id}. {q.q}</h3>
              <div className="space-y-2">
                {q.options.map((opt, index) => (
                  <label key={index} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${answers[q.id] === index ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input 
                      type="radio" 
                      name={`question-${q.id}`} 
                      className="w-4 h-4 text-blue-600"
                      checked={answers[q.id] === index}
                      onChange={() => handleSelect(q.id, index)}
                    />
                    <span className="text-slate-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < questions.length}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit & Analyze My Weaknesses
        </button>
      </div>
    </div>
  );
}