import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  applyNodeChanges, 
  applyEdgeChanges,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ⚡ CUSTOM NEON NODE COMPONENT
const ConceptNode = ({ data }) => (
  <div className="px-6 py-4 rounded-xl bg-[#0a0c10] border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] group hover:border-emerald-400 transition-all duration-500 min-w-[200px]">
    <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-500"></div>
    <div className="text-[10px] text-emerald-500/50 font-black uppercase tracking-[0.2em] mb-1">Concept Node</div>
    <div className="text-white font-bold tracking-wide text-sm">{data.label}</div>
    <div className="mt-3 flex justify-between items-center">
      <div className="w-full bg-white/5 h-[2px] rounded-full overflow-hidden">
        <div className="bg-emerald-500 h-full w-1/3 shadow-[0_0_10px_#10b981]"></div>
      </div>
    </div>
  </div>
);

export default function GraphView() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const nodeTypes = useMemo(() => ({ concept: ConceptNode }), []);

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
      const aiResponse = await axios.post('http://localhost:5000/api/ai/generate', { topic });
      const concepts = aiResponse.data.data;

      const dbResponse = await axios.post('http://localhost:5000/api/graph/save', {
        subject: topic,
        concepts: concepts
      });
      
      const savedGraph = dbResponse.data.data;

      const newNodes = [];
      const newEdges = [];

      savedGraph.forEach((concept, index) => {
        newNodes.push({
          id: concept._id,
          type: 'concept', // ⚡ Uses our custom neon component
          position: { x: index * 300, y: (index % 2 === 0 ? 100 : 300) }, 
          data: { label: concept.title },
        });

        if (concept.prerequisites && concept.prerequisites.length > 0) {
          concept.prerequisites.forEach(prereq => {
            newEdges.push({
              id: `e-${prereq._id}-${concept._id}`,
              source: prereq._id, 
              target: concept._id,
              animated: true,
              label: 'DEPENDENCY',
              labelStyle: { fill: '#10b981', fontSize: 8, fontWeight: 900, tracking: '0.2em' },
              style: { stroke: '#10b981', strokeWidth: 1, opacity: 0.4 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#10b981',
              },
            });
          });
        }
      });

      setNodes(newNodes);
      setEdges(newEdges);

    } catch (error) {
      console.error("Error generating graph:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-[#05070a]" style={{ height: '100vh', width: '100vw' }}>
      
      {/* 🟢 TOP NAV: COMMAND CENTER */}
      <div className="flex justify-between items-center px-8 py-5 bg-[#05070a] border-b border-emerald-500/10 z-10">
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-xl font-black text-white tracking-widest uppercase">
              Concept<span className="text-emerald-500">Mapper</span>
            </h1>
            <p className="text-[9px] text-emerald-500/50 font-bold tracking-[0.3em] uppercase">Neural Visualization Engine</p>
          </div>
          
          <div className="relative group">
            <input 
              type="text" 
              placeholder="ENTER SUBJECT AREA..."
              className="bg-black border border-white/10 rounded-xl px-6 py-3 w-80 text-xs font-bold tracking-widest text-emerald-400 focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-700"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <div className="absolute inset-0 rounded-xl bg-emerald-500/5 blur-xl group-hover:bg-emerald-500/10 transition-all pointer-events-none"></div>
          </div>
          
          <button 
            onClick={handleGenerateGraph}
            disabled={loading}
            className="group relative px-8 py-3 bg-emerald-600 rounded-xl overflow-hidden transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="relative z-10 text-black font-black text-xs tracking-[0.2em]">
              {loading ? 'MAPPING...' : 'INITIALIZE GRAPH'}
            </span>
            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </div>

        <button 
          onClick={() => navigate('/progress')}
          className="px-6 py-3 border border-emerald-500/20 text-emerald-500 font-black text-xs tracking-widest rounded-xl hover:bg-emerald-500/5 transition-all"
        >
          VIEW RECENT PATHS
        </button>
      </div>

      {/* 🟢 THE CANVAS */}
      <div style={{ width: '100vw', height: 'calc(100vh - 85px)' }} className="relative">
        
        {nodes.length === 0 && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="w-24 h-24 mb-6 border border-emerald-500/20 rounded-full flex items-center justify-center animate-pulse">
               <div className="w-12 h-12 bg-emerald-500/10 rounded-full"></div>
            </div>
            <p className="text-slate-500 text-[11px] font-black tracking-[0.5em] uppercase">Awaiting Subject Input</p>
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          className="bg-[#05070a]"
        >
          <Background color="#10b981" gap={30} size={1} opacity={0.05} />
          <Controls className="bg-[#0a0c10] border border-white/5 shadow-2xl [&_button]:border-white/5 [&_button]:fill-emerald-500" />
        </ReactFlow>

        {/* ⚡ BOTTOM OVERLAY HUD */}
        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md border border-white/5 p-4 rounded-2xl pointer-events-auto">
            <div className="text-[9px] text-slate-500 font-bold mb-1 tracking-widest">SYSTEM STATUS</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
              <span className="text-[10px] text-emerald-500 font-black tracking-widest uppercase">Neural Grid Active</span>
            </div>
          </div>
          
          <div className="flex gap-4 pointer-events-auto">
            <button className="bg-emerald-500 text-black px-6 py-4 rounded-2xl font-black text-xs tracking-widest shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:scale-105 transition-all uppercase">
              Download Study Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}