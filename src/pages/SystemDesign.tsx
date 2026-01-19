import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Layers, Database, Cpu, Globe, Zap, ShieldCheck, Search, Filter, 
  ChevronRight, ExternalLink, BookOpen, Box, Calculator, HardDrive, 
  Network, Award, Clock, CheckCircle2, Workflow, X, Activity, Info, 
  Sparkles, MousePointer2, Plus, Trash2, Download, RefreshCcw,
  Link as LinkIcon, MousePointerClick, ZapOff, Server, Terminal,
  Settings, Save, Share2, Compass, Maximize
} from "lucide-react";
import { toast } from "sonner";

// --- DATA STRUCTURES ---
const designCategories = ["All Architecture", "Scalability", "Databases", "Microservices", "Caching", "Communication"];

const fundamentals = [
  { title: "Load Balancing", category: "Scalability", description: "Traffic distribution across server clusters.", icon: Network, status: "Mastered", link: "https://www.nginx.com/resources/glossary/load-balancing/", points: ["Consistent Hashing", "Layer 4 vs Layer 7"] },
  { title: "Database Sharding", category: "Databases", description: "Horizontal partitioning of massive data sets.", icon: Database, status: "In Progress", link: "https://github.com/donnemartin/system-design-primer#sharding", points: ["Range Partitioning", "Rebalancing Data"] },
  { title: "Caching Strategies", category: "Caching", description: "High-speed storage layers for performance.", icon: Zap, status: "Review", link: "https://aws.amazon.com/caching/strategies/", points: ["Eviction Policies", "Write-behind"] },
  { title: "CAP Theorem", category: "Scalability", description: "Consistency, Availability, and Partition Tolerance.", icon: ShieldCheck, status: "Mastered", link: "https://www.ibm.com/topics/cap-theorem", points: ["PACELC", "Eventual Consistency"] }
];

const caseStudies = [
  { id: "netflix", title: "Netflix CDN Design", category: "Microservices", description: "High-availability global streaming via Open Connect.", tags: ["CDN", "Chaos Eng"], readTime: "12 min", complexity: "Expert", metrics: "200M+ Users", source: "https://netflixtechblog.com/" },
  { id: "whatsapp", title: "WhatsApp Messaging", category: "Communication", description: "Real-time communication via Erlang/BEAM.", tags: ["WebSockets", "Erlang"], readTime: "10 min", complexity: "Hard", metrics: "100B msgs/day", source: "https://highscalability.com/the-whatsapp-architecture-facebook-bought-for-19-billion/" },
  { id: "uber", title: "Uber Dispatch Engine", category: "Scalability", description: "Geospatial indexing and real-time matching.", tags: ["Geospatial", "Go"], readTime: "15 min", complexity: "Expert", metrics: "1M requests/sec", source: "https://www.uber.com/en-IN/blog/engineering/" }
];

const whiteboardTools = [
  { type: 'Mobile App', icon: MousePointer2, color: 'text-rose-400' },
  { type: 'API Server', icon: Terminal, color: 'text-blue-400' },
  { type: 'NoSQL DB', icon: Database, color: 'text-amber-400' },
  { type: 'Load Balancer', icon: Network, color: 'text-emerald-400' },
  { type: 'Redis Cache', icon: Zap, color: 'text-purple-400' },
  { type: 'AWS S3', icon: Globe, color: 'text-cyan-400' },
];

// --- SUB-COMPONENT: CAPACITY PLANNER TOOL ---
const CapacityPlanner = ({ onClose }: { onClose: () => void }) => {
  const [dau, setDau] = useState(1000000);
  const [requests, setRequests] = useState(15);
  
  const rps = Math.round((dau * requests) / 86400);
  const storage = ((dau * requests * 800) / (1024 * 1024 * 1024)).toFixed(2); // Avg 800 bytes per metadata

  return (
    <motion.div drag dragMomentum={false} initial={{ opacity: 0, x: 200, y: 100 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed z-[100] w-80 glass border border-primary/30 p-6 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl select-none">
      <div className="flex justify-between items-center mb-6">
        <span className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><Calculator className="w-3.5 h-3.5" /> Estimation Lab</span>
        <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg"><X className="w-4 h-4" /></button>
      </div>
      <div className="space-y-6">
        <div>
          <label className="text-[9px] font-bold uppercase opacity-50 block mb-2 tracking-widest">Active Users (DAU)</label>
          <input type="range" min="100000" max="100000000" step="100000" value={dau} onChange={(e) => setDau(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none accent-primary" />
          <p className="text-right text-xs font-mono mt-1 text-primary">{(dau/1000000).toFixed(1)}M</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-[8px] font-black opacity-40 uppercase mb-1">Avg Load</p>
            <p className="text-lg font-bold text-primary">{rps.toLocaleString()} <span className="text-[8px] opacity-50">RPS</span></p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-[8px] font-black opacity-40 uppercase mb-1">Disk Needs</p>
            <p className="text-lg font-bold text-cyan-400">{storage} <span className="text-[8px] opacity-50">GB</span></p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-[9px] text-muted-foreground leading-relaxed italic">Calculations assume 2x peak factor for distributed write-heavy systems.</p>
        </div>
      </div>
    </motion.div>
  );
};

// --- SUB-COMPONENT: SYSTEM WHITEBOARD ---
const SystemWhiteboard = () => {
  const [elements, setElements] = useState<{ id: number, type: string, x: number, y: number, icon: any }[]>([]);
  const [connections, setConnections] = useState<{ from: number, to: number }[]>([]);
  const [linkingNode, setLinkingNode] = useState<number | null>(null);

  // Auto-Recovery Logic
  useEffect(() => {
    const saved = localStorage.getItem('system_design_sandbox_v2');
    if (saved) {
      const { nodes, lines } = JSON.parse(saved);
      const restored = nodes.map((n: any) => ({ ...n, icon: whiteboardTools.find(t => t.type === n.type)?.icon || Box }));
      setElements(restored);
      setConnections(lines);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('system_design_sandbox_v2', JSON.stringify({ nodes: elements, lines: connections }));
  }, [elements, connections]);

  const addElement = (tool: any) => {
    const newEl = { id: Date.now(), type: tool.type, x: 150, y: 150, icon: tool.icon };
    setElements([...elements, newEl]);
    toast.success(`${tool.type} Component Initialized`);
  };

  const handleNodeInteraction = (id: number) => {
    if (linkingNode === null) {
      setLinkingNode(id);
      toast.info("Target connection point required");
    } else if (linkingNode === id) {
      setLinkingNode(null);
    } else {
      if (!connections.find(c => (c.from === linkingNode && c.to === id))) {
        setConnections([...connections, { from: linkingNode, to: id }]);
        toast.success("Logical link synchronized");
      }
      setLinkingNode(null);
    }
  };

  const removeNode = (id: number) => {
    setElements(elements.filter(el => el.id !== id));
    setConnections(connections.filter(c => c.from !== id && c.to !== id));
    toast.error("Component Decommissioned");
  };

  return (
    <div className="glass rounded-[3rem] border border-white/10 overflow-hidden h-[750px] flex flex-col relative shadow-2xl bg-zinc-950/50 backdrop-blur-sm">
      {/* SANDBOX HEADER */}
      <div className="p-8 border-b border-white/5 bg-black/40 flex justify-between items-center z-50">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
             <ShieldCheck className="text-primary w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black italic uppercase text-sm tracking-tighter text-foreground">Infrastructure Architect v2.5</h3>
            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" /> Sandbox Real-time Simulation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2 mr-4">
             {[1,2,3].map(i => <div key={i} className="w-7 h-7 rounded-full border-2 border-zinc-950 bg-muted flex items-center justify-center text-[8px] font-bold">U{i}</div>)}
          </div>
          <button onClick={() => {setElements([]); setConnections([]);}} className="p-3 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-2xl transition-all border border-transparent hover:border-destructive/20">
            <Trash2 className="w-5 h-5" />
          </button>
          <button className="px-8 py-3 bg-primary text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/30">
            Export Diagram
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* ASSET PALETTE */}
        <div className="w-28 border-r border-white/5 bg-black/60 p-6 space-y-6 flex flex-col items-center z-50 scrollbar-hide">
          <p className="text-[8px] font-black uppercase text-muted-foreground opacity-30 mb-2">Registry</p>
          {whiteboardTools.map((tool) => (
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} key={tool.type} onClick={() => addElement(tool)} 
              className="w-16 h-16 rounded-[1.2rem] bg-white/5 hover:bg-primary/5 border border-white/5 hover:border-primary/40 flex flex-col items-center justify-center group transition-all"
            >
              <tool.icon className={`w-6 h-6 ${tool.color} group-hover:scale-110 transition-transform mb-1.5`} />
              <span className="text-[6px] font-black uppercase opacity-40 group-hover:opacity-100 tracking-tighter text-center px-1 leading-tight">{tool.type}</span>
            </motion.button>
          ))}
        </div>

        {/* INTERACTIVE CANVAS AREA */}
        <div className="flex-1 bg-[url('https://www.toptal.com/designers/subtlepatterns/patterns/dot-grid.png')] bg-[length:24px_24px] relative overflow-hidden">
          
          {/* FLOW LINES (SVG LAYER) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--primary)" />
              </marker>
            </defs>
            {connections.map((conn, i) => {
              const fromNode = elements.find(el => el.id === conn.from);
              const toNode = elements.find(el => el.id === conn.to);
              if (!fromNode || !toNode) return null;
              return (
                <motion.line key={i} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  x1={fromNode.x + 60} y1={fromNode.y + 50} x2={toNode.x + 60} y2={toNode.y + 50}
                  stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="6,4" markerEnd="url(#arrowhead)"
                  className="drop-shadow-[0_0_12px_rgba(0,212,170,0.6)] opacity-40"
                />
              );
            })}
          </svg>

          {/* EMPTY STATE */}
          {elements.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/10 pointer-events-none">
              <Plus className="w-24 h-24 mb-6 stroke-[0.5]" />
              <p className="font-black uppercase text-xl tracking-[0.6em] italic">Deploy Infrastructure</p>
            </motion.div>
          )}
          
          {/* DRAGGABLE NODES */}
          <AnimatePresence>
            {elements.map((el) => (
              <motion.div
                key={el.id}
                drag
                dragMomentum={false}
                onDrag={(e, info) => {
                  setElements(prev => prev.map(item => item.id === el.id ? { ...item, x: item.x + info.delta.x, y: item.y + info.delta.y } : item));
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={() => handleNodeInteraction(el.id)}
                className={`absolute cursor-grab active:cursor-grabbing p-6 glass rounded-[2rem] flex flex-col items-center gap-4 shadow-2xl z-10 min-w-[120px] transition-all border-2 group ${
                  linkingNode === el.id ? 'border-primary bg-primary/5 ring-8 ring-primary/10' : 'border-white/10 hover:border-white/30'
                }`}
                style={{ left: 0, top: 0, x: el.x, y: el.y }}
              >
                <div className="relative">
                  <el.icon className={`w-12 h-12 ${linkingNode === el.id ? 'text-primary animate-pulse' : 'text-primary/80'}`} />
                  {linkingNode === el.id && <div className="absolute -top-3 -right-3 bg-primary text-black p-1.5 rounded-full shadow-lg"><LinkIcon className="w-3 h-3" /></div>}
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground leading-none">{el.type}</p>
                  <div className="h-0 group-hover:h-8 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 mt-1">
                     <button onClick={(e) => { e.stopPropagation(); removeNode(el.id); }} className="p-1.5 hover:text-destructive transition-colors bg-white/5 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                     <button className="p-1.5 hover:text-primary transition-colors bg-white/5 rounded-lg"><Settings className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* FOOTER CONTROLS */}
      <div className="bg-primary/10 border-t border-primary/20 p-5 flex items-center justify-center gap-12 backdrop-blur-md">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase text-primary tracking-widest">
            <MousePointerClick className="w-4 h-4" /> Link Components
          </div>
          <div className="flex items-center gap-3 text-[10px] font-black uppercase text-primary tracking-widest">
            <RefreshCcw className="w-4 h-4" /> Sync Persistent
          </div>
          <div className="flex items-center gap-3 text-[10px] font-black uppercase text-primary tracking-widest">
            <Activity className="w-4 h-4" /> Logic Simulation Active
          </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE WRAPPER ---
const SystemDesign = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Architecture");
  const [activeTab, setActiveTab] = useState<'concepts' | 'studies' | 'whiteboard'>('concepts');
  const [showPlanner, setShowPlanner] = useState(false);

  const openResource = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');

  const filteredFundamentals = useMemo(() => fundamentals.filter(f => 
    f.title.toLowerCase().includes(searchTerm.toLowerCase()) && (selectedCategory === "All Architecture" || f.category === selectedCategory)
  ), [searchTerm, selectedCategory]);

  return (
    <div className="space-y-10 pb-32 relative">
      {showPlanner && <CapacityPlanner onClose={() => setShowPlanner(false)} />}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-foreground leading-none">
            Architect <span className="text-primary underline decoration-primary/30 underline-offset-8">Academy</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-4 flex items-center gap-3 font-medium">
            <Layers className="w-5 h-5 text-primary" /> Engineering Scalable Distributed Ecosystems
          </p>
        </motion.div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input type="text" placeholder="Probe system patterns..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14 pr-8 py-4 bg-white/5 border border-white/10 rounded-3xl text-sm focus:ring-2 ring-primary/40 outline-none w-80 backdrop-blur-md transition-all" />
          </div>
          <button onClick={() => setShowPlanner(true)} className="p-4 rounded-[1.5rem] glass border border-primary/40 text-primary hover:bg-primary hover:text-black transition-all shadow-xl shadow-primary/10">
            <Calculator className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* ARCHITECTURE STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Latency Mastered', value: '82%', color: 'text-primary' },
           { label: 'High Availability', value: '94%', color: 'text-blue-400' },
           { label: 'Security Protocols', value: '65%', color: 'text-rose-400' },
           { label: 'Network Throughput', value: '78%', color: 'text-amber-400' }
         ].map(stat => (
           <div key={stat.label} className="glass p-6 rounded-3xl border border-white/5 flex flex-col justify-between h-32">
              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                 <h4 className={`text-3xl font-black ${stat.color}`}>{stat.value}</h4>
                 <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              </div>
           </div>
         ))}
      </div>

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* SIDEBAR */}
        <aside className="lg:col-span-3 space-y-8">
          <div className="glass p-8 rounded-[3.5rem] border border-white/5">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground mb-8">Learning Nodes</h3>
            <div className="space-y-3">
              {designCategories.map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-6 py-4 rounded-[1.2rem] text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between group ${selectedCategory === cat ? 'bg-primary text-black shadow-2xl' : 'hover:bg-white/5 text-muted-foreground'}`}>
                  {cat} <ChevronRight className={`w-4 h-4 transition-transform ${selectedCategory === cat ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="p-10 rounded-[3.5rem] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 relative overflow-hidden group">
            <Sparkles className="absolute -top-6 -right-6 w-24 h-24 opacity-10 group-hover:rotate-12 transition-transform text-primary" />
            <h4 className="text-xs font-black uppercase tracking-widest mb-6">Brainstorm Prompt</h4>
            <p className="text-[12px] text-muted-foreground leading-relaxed italic mb-10 font-medium">"How would you optimize a global distributed locking service with 99.9% consistency using Redis?"</p>
            <button className="w-full py-4 bg-white/10 border border-white/10 hover:bg-white/20 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">Generate Challenge</button>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="lg:col-span-9 space-y-10">
          <div className="flex p-1.5 bg-white/5 rounded-[2rem] w-fit border border-white/5 shadow-2xl backdrop-blur-md">
            {[ 
              { id: 'concepts', label: 'Design Patterns', icon: Layers }, 
              { id: 'studies', label: 'Company Blueprints', icon: Globe }, 
              { id: 'whiteboard', label: 'Architecture Sandbox', icon: Box } 
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`px-10 py-4 rounded-[1.7rem] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === tab.id ? 'bg-primary text-black shadow-2xl shadow-primary/20' : 'text-muted-foreground hover:text-white'}`}>
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'concepts' && (
              <motion.div key="concepts" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredFundamentals.map((item, idx) => (
                  <div key={idx} className="glass p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden group hover:border-primary/40 transition-all flex flex-col">
                    <div className="flex justify-between items-start mb-10">
                      <div className="p-5 rounded-[1.5rem] bg-white/5 text-primary group-hover:scale-110 transition-transform shadow-inner"><item.icon className="w-8 h-8" /></div>
                      <span className="px-5 py-2 rounded-full text-[10px] font-black uppercase border border-white/10 text-muted-foreground tracking-widest">{item.category}</span>
                    </div>
                    <h3 className="text-2xl font-black italic tracking-tighter mb-4 text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-10 opacity-80">{item.description}</p>
                    <div className="space-y-3 mb-12">
                      {item.points.map((p, pi) => ( <div key={pi} className="flex items-center gap-3 text-xs font-bold text-foreground/70"><CheckCircle2 className="w-4 h-4 text-primary" /> {p}</div> ))}
                    </div>
                    <button onClick={() => openResource(item.link)} className="mt-auto flex items-center justify-center gap-3 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase text-primary tracking-widest transition-all border border-white/5">Analyze Pattern <ExternalLink className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'studies' && (
              <motion.div key="studies" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                {caseStudies.map((study, idx) => (
                  <div key={idx} onClick={() => openResource(study.source)} className="glass p-8 rounded-[3.5rem] border border-white/5 flex flex-col md:flex-row items-center gap-10 hover:bg-white/5 transition-all cursor-pointer group">
                    <div className="w-full md:w-64 h-40 rounded-[2.5rem] bg-white/5 flex items-center justify-center border border-white/5 shrink-0 relative overflow-hidden group-hover:border-primary/30">
                       <Workflow className="w-16 h-16 text-muted-foreground opacity-20 group-hover:scale-110 group-hover:opacity-40 transition-all" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end p-6"><span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{study.complexity} Level</span></div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex flex-wrap gap-3 mb-5"> {study.tags.map(tag => ( <span key={tag} className="text-[10px] font-black px-4 py-1.5 rounded-full bg-primary/10 text-primary uppercase border border-primary/20">{tag}</span> ))} </div>
                      <h3 className="text-3xl font-black italic tracking-tighter group-hover:text-primary transition-colors mb-4">{study.title}</h3>
                      <p className="text-sm text-muted-foreground max-w-xl mb-6 leading-relaxed opacity-80">{study.description}</p>
                      <div className="flex items-center gap-10">
                        <div className="flex items-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest"><Clock className="w-4 h-4 text-primary" /> {study.readTime}</div>
                        <div className="flex items-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest"><Globe className="w-4 h-4 text-blue-400" /> {study.metrics}</div>
                      </div>
                    </div>
                    <div className="p-6 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                       <ChevronRight className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'whiteboard' && (
              <motion.div key="whiteboard" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                <SystemWhiteboard />
                <div className="flex items-center gap-8 p-10 rounded-[3.5rem] bg-white/5 border border-white/10 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-5"><Layers className="w-32 h-32" /></div>
                   <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20 shadow-inner">
                      <Info className="w-8 h-8" />
                   </div>
                   <div>
                      <h5 className="text-lg font-black italic uppercase text-foreground mb-1">Architecture Deployment Manual</h5>
                      <p className="text-xs font-medium leading-relaxed italic text-muted-foreground opacity-80">
                        Link nodes by clicking them in sequence. Drag to reposition the ecosystem. Your blueprints are automatically cached to <span className="text-primary font-bold">Local Encryption Engine</span>.
                      </p>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default SystemDesign;