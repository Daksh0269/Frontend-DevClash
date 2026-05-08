import React, { useState } from 'react';

export default function AITutor({ user }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI Tutor. I know your weak areas based on your test history. Ask me any JEE/NEET doubts.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Pass the userId (from Appwrite) and the chat history
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.$id, 
          message: userMessage.content,
          // Exclude the very first greeting and only send recent context if needed
          history: newMessages.slice(1, -1) 
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      }
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-black/40 border border-emerald-500/20 rounded-2xl h-[80vh] flex flex-col shadow-[0_0_30px_rgba(16,185,129,0.05)]">
      <div className="border-b border-emerald-500/20 pb-4 mb-4">
        <h2 className="text-2xl font-black text-white tracking-widest uppercase">
          Dev<span className="text-emerald-500">Tutor</span> AI
        </h2>
        <p className="text-sm text-slate-400">Strict Academic Assistant linked to your MongoDB Progress</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-xl text-sm ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-br-none' 
                : 'bg-white/5 text-slate-200 border border-emerald-500/10 rounded-bl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-emerald-500 text-sm animate-pulse">Tutor is analyzing...</div>}
      </div>

      <form onSubmit={sendMessage} className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a doubt or paste a question..."
          className="flex-1 bg-[#05070a] border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-200 outline-none transition-all"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-3 rounded-xl tracking-widest uppercase disabled:opacity-50 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}