import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  applyNodeChanges, 
  applyEdgeChanges 
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function GraphView() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);

  // Handlers to make the nodes draggable
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const handleGenerateGraph = async () => {
    if (!topic) return;
    setLoading(true);
    
    try {
      // 1. Generate the concepts via AI
      const aiResponse = await axios.post('http://localhost:5000/api/ai/generate', { topic });
      const concepts = aiResponse.data.data;

      // 2. Save to MongoDB to get real _id strings
      const dbResponse = await axios.post('http://localhost:5000/api/graph/save', {
        subject: topic,
        concepts: concepts
      });
      
      const savedGraph = dbResponse.data.data;

      // 3. Map Database output to React Flow UI
      const newNodes = [];
      const newEdges = [];

      savedGraph.forEach((concept, index) => {
        // Build the physical UI box for each concept
        newNodes.push({
          id: concept._id,
          // A simple algorithm to stagger the nodes so they don't stack perfectly on top of each other
          position: { x: 250 + (index % 2 === 0 ? 0 : 250), y: index * 120 }, 
          data: { label: concept.title },
          style: { 
            background: '#ffffff', 
            border: '2px solid #3b82f6', // Tailwind blue-500
            borderRadius: '10px',
            padding: '12px',
            fontWeight: 'bold',
            width: 180,
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }
        });

        // Draw lines from prerequisites to current concepts
        if (concept.prerequisites && concept.prerequisites.length > 0) {
          concept.prerequisites.forEach(prereq => {
            newEdges.push({
              id: `e-${prereq._id}-${concept._id}`,
              source: prereq._id, 
              target: concept._id,
              animated: true,
              style: { stroke: '#3b82f6', strokeWidth: 2 }
            });
          });
        }
      });

      setNodes(newNodes);
      setEdges(newEdges);

    } catch (error) {
      console.error("Error generating graph:", error);
      alert("Failed to generate graph. Check if your backend is running!");
    } finally {
      setLoading(false);
    }
  };

  return (
    // We use a strict 100vh here to prevent React Flow from collapsing
    <div className="flex flex-col bg-slate-50" style={{ height: '100vh', width: '100vw' }}>
      
      {/* Top Navigation & Controls */}
      <div className="flex justify-between items-center p-4 bg-white shadow-md z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-extrabold text-blue-900 tracking-tight">Retention Engine</h1>
          
          <input 
            type="text" 
            placeholder="e.g. React Hooks"
            className="border-2 border-slate-200 rounded-lg px-4 py-2 w-64 focus:outline-none focus:border-blue-500 transition"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          
          <button 
            onClick={handleGenerateGraph}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Thinking...' : 'Generate AI Path'}
          </button>
        </div>

        {/* The bridge to your Spaced Repetition engine! */}
        <Link 
          to="/study" 
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-sm"
        >
          Study Flashcards 🧠
        </Link>
      </div>

      {/* The Map Canvas */}
      <div style={{ width: '100vw', height: 'calc(100vh - 75px)' }} className="relative">
        
        {nodes.length === 0 && !loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <p className="text-slate-400 text-lg font-medium">Enter a topic above to generate your knowledge map.</p>
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background color="#cbd5e1" gap={20} size={2} />
          <Controls className="bg-white shadow-lg border-none rounded-lg" />
        </ReactFlow>
      </div>
    </div>
  );
}