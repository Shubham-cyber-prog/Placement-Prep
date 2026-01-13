import { useState } from "react"; // Added for functionality
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Video, 
  FileText, 
  Code2, 
  ExternalLink, 
  Download,
  Search,
  Layers,
  Star,
  Globe,
  Database,
  ShieldCheck,
  Cpu
} from "lucide-react";

const categories = ["All", "DSA", "System Design", "Core CS", "Databases", "Web Dev", "Design", "Prep", "DevOps"];

const resources = [
  // --- DSA & ALGORITHMS ---
  {
    id: 1,
    title: "Striver's SDE Sheet",
    provider: "Take U Forward",
    type: "Sheet",
    category: "DSA",
    description: "The most popular coding interview preparation sheet for MAANG roles.",
    link: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/",
    color: "#00C6FF",
    rating: 4.9,
    difficulty: "Advanced"
  },
  {
    id: 2,
    title: "NeetCode 150",
    provider: "NeetCode.io",
    type: "Practice",
    category: "DSA",
    description: "Curated 150 LeetCode problems covering all major patterns.",
    link: "https://neetcode.io/practice",
    color: "#00FF87",
    rating: 4.8,
    difficulty: "Mixed"
  },
  {
    id: 3,
    title: "Blind 75 List",
    provider: "LeetCode",
    type: "Sheet",
    category: "DSA",
    description: "The original 75 problems you need to know for technical interviews.",
    link: "https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions",
    color: "#FFA116",
    rating: 4.7,
    difficulty: "Intermediate"
  },
  {
    id: 4,
    title: "Grokking Algorithms",
    provider: "Aditya Bhargava",
    type: "Guide",
    category: "DSA",
    description: "An illustrated, friendly guide to understanding common algorithms.",
    link: "https://github.com/egonSchiele/grokking_algorithms",
    color: "#FF4B2B",
    rating: 4.9,
    difficulty: "Beginner"
  },

  // --- SYSTEM DESIGN ---
  {
    id: 5,
    title: "System Design Primer",
    provider: "Donne Martin",
    type: "Guide",
    category: "System Design",
    description: "Learn how to design large-scale systems. Massive GitHub resource.",
    link: "https://github.com/donnemartin/system-design-primer",
    color: "#6A11CB",
    rating: 4.9,
    difficulty: "Advanced"
  },
  {
    id: 6,
    title: "High Scalability Blog",
    provider: "Scalability Team",
    type: "Tutorial",
    category: "System Design",
    description: "Real-world architecture case studies from Netflix, Twitter, and more.",
    link: "http://highscalability.com/",
    color: "#2575FC",
    rating: 4.5,
    difficulty: "Advanced"
  },
  {
    id: 7,
    title: "Grokking System Design",
    provider: "DesignGurus",
    type: "Course",
    category: "System Design",
    description: "Framework for answering system design interview questions.",
    link: "https://www.designgurus.io/course/grokking-the-system-design-interview",
    color: "#F093FB",
    rating: 4.6,
    difficulty: "Intermediate"
  },

  // --- CORE CS FUNDAMENTALS ---
  {
    id: 8,
    title: "OS & Networking",
    provider: "GateSmashers",
    type: "Notes",
    category: "Core CS",
    description: "Clear and concise explanation of Operating Systems and Networks.",
    link: "https://www.youtube.com/@GateSmashers",
    color: "#8E2DE2",
    rating: 4.8,
    difficulty: "Beginner"
  },
  {
    id: 9,
    title: "Database Indexing",
    provider: "Use The Index, Luke",
    type: "Guide",
    category: "Databases",
    description: "A comprehensive guide to SQL performance and database indexing.",
    link: "https://use-the-index-luke.com/",
    color: "#4facfe",
    rating: 4.7,
    difficulty: "Intermediate"
  },
  {
    id: 10,
    title: "SQL Zoo",
    provider: "Interactive",
    type: "Practice",
    category: "Databases",
    description: "Learn SQL interactively with live queries and exercises.",
    link: "https://sqlzoo.net/",
    color: "#00dbde",
    rating: 4.4,
    difficulty: "Beginner"
  },

  // --- FRONTEND & WEB ---
  {
    id: 11,
    title: "JavaScript Info",
    provider: "Ilya Kantor",
    type: "Guide",
    category: "Web Dev",
    description: "From basic to advanced JS including closures and prototypes.",
    link: "https://javascript.info/",
    color: "#F7DF1E",
    rating: 4.9,
    difficulty: "Mixed"
  },
  {
    id: 12,
    title: "Frontend Handbook",
    provider: "Frontend Masters",
    type: "Sheet",
    category: "Web Dev",
    description: "The complete roadmap to becoming a frontend professional.",
    link: "https://frontendmasters.com/guides/front-end-handbook/2024/",
    color: "#E10098",
    rating: 4.6,
    difficulty: "Beginner"
  },

  // --- INTERVIEW PREP & BEHAVIORAL ---
  {
    id: 13,
    title: "Tech Interview Handbook",
    provider: "Yangshun Tay",
    type: "Guide",
    category: "Prep",
    description: "Curated interview preparation materials for busy engineers.",
    link: "https://www.techinterviewhandbook.org/",
    color: "#11998E",
    rating: 4.8,
    difficulty: "Intermediate"
  },
  {
    id: 14,
    title: "STAR Method Guide",
    provider: "The Muse",
    type: "Notes",
    category: "Behavioral",
    description: "Mastering behavioral interviews using the STAR framework.",
    link: "https://www.themuse.com/advice/star-interview-method",
    color: "#38ef7d",
    rating: 4.5,
    difficulty: "Beginner"
  },
  
  // Adding more resources to reach 30...
  { id: 15, title: "MDN Web Docs", provider: "Mozilla", type: "Guide", category: "Web Dev", description: "The definitive documentation for web developers.", link: "https://developer.mozilla.org", color: "#000000", rating: 5.0, difficulty: "Beginner" },
  { id: 16, title: "LeetCode Patterns", provider: "Sean Prashad", type: "Practice", category: "DSA", description: "Pattern-based categorization of LeetCode problems.", link: "https://seanprashad.com/leetcode-patterns/", color: "#f857a6", rating: 4.7, difficulty: "Intermediate" },
  { id: 17, title: "Low Level Design", provider: "Arpit Bhayani", type: "Video", category: "Design", description: "Deep dives into system design and LLD concepts.", link: "https://www.youtube.com/@arpit_bhayani", color: "#ff0000", rating: 4.8, difficulty: "Advanced" },
  { id: 18, title: "CSS Tricks", provider: "DigitalOcean", type: "Guide", category: "Web Dev", description: "Everything you ever wanted to know about CSS and Flexbox.", link: "https://css-tricks.com", color: "#ff8c00", rating: 4.6, difficulty: "Beginner" },
  { id: 19, title: "Algorithm Visualizer", provider: "Open Source", type: "Tutorial", category: "DSA", description: "Visualize data structures and algorithms in action.", link: "https://algorithm-visualizer.org/", color: "#4b6cb7", rating: 4.5, difficulty: "Beginner" },
  { id: 20, title: "Cracking the Coding Interview", provider: "Gayle McDowell", type: "Guide", category: "Prep", description: "189 programming questions and solutions.", link: "https://www.careercup.com/book", color: "#182848", rating: 4.9, difficulty: "Intermediate" },
  { id: 21, title: "ByteByteGo", provider: "Alex Xu", type: "Video", category: "System Design", description: "Simplified visual guides to system design concepts.", link: "https://bytebytego.com/", color: "#000428", rating: 4.9, difficulty: "Intermediate" },
  { id: 22, title: "React Patterns", provider: "React Team", type: "Sheet", category: "Web Dev", description: "Common design patterns for React applications.", link: "https://reactpatterns.com/", color: "#61dafb", rating: 4.7, difficulty: "Intermediate" },
  { id: 23, title: "Computer Networks", provider: "Tanenbaum", type: "Guide", category: "Core CS", description: "The classic academic reference for networking.", link: "https://www.pearson.com", color: "#5f2c82", rating: 4.3, difficulty: "Advanced" },
  { id: 24, title: "JavaScript 30", provider: "Wes Bos", type: "Course", category: "Web Dev", description: "30 projects in 30 days using vanilla JavaScript.", link: "https://javascript30.com/", color: "#ff9966", rating: 4.8, difficulty: "Beginner" },
  { id: 25, title: "Kubernetes Guide", provider: "K8s.io", type: "Tutorial", category: "DevOps", description: "Official documentation for container orchestration.", link: "https://kubernetes.io/docs/home/", color: "#326ce5", rating: 4.5, difficulty: "Advanced" },
  { id: 26, title: "Docker Deep Dive", provider: "Nigel Poulton", type: "Course", category: "DevOps", description: "Mastering containers and Docker architecture.", link: "https://www.docker.com", color: "#2496ed", rating: 4.7, difficulty: "Intermediate" },
  { id: 27, title: "Patterns of Architecture", provider: "Martin Fowler", type: "Guide", category: "System Design", description: "In-depth articles on software architecture patterns.", link: "https://martinfowler.com/architecture/", color: "#962678", rating: 4.8, difficulty: "Advanced" },
  { id: 28, title: "Refactoring Guru", provider: "Interactive", type: "Guide", category: "Design", description: "Clear explanation of design patterns and refactoring.", link: "https://refactoring.guru/", color: "#2d3436", rating: 4.9, difficulty: "Intermediate" },
  { id: 29, title: "Explain Shell", provider: "Tool", type: "Tutorial", category: "Core CS", description: "Break down any shell command to see what it does.", link: "https://explainshell.com/", color: "#00b894", rating: 4.4, difficulty: "Beginner" },
  { id: 30, title: "Roadmap.sh", provider: "Roadmap.sh", type: "Sheet", category: "Prep", description: "Step-by-step guides and paths to learn any tech.", link: "https://roadmap.sh", color: "#d63031", rating: 4.9, difficulty: "Beginner" },
];

const StudyMaterial = () => {
  // 1. Initialize State
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // 2. Updated Multi-layer filter logic
  const filteredResources = resources.filter((resource) => {
    const matchesSearch = 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === "All" || resource.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Study Resources</h1>
          <p className="text-muted-foreground">Premium curated content for your preparation</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search topics..." 
            // 3. Bind input to state
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass bg-background/20 rounded-xl pl-10 pr-4 py-2 border-none ring-1 ring-border focus:ring-primary outline-none w-full md:w-64"
          />
        </div>
      </div>
        {/* Categories Filter Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <div className="flex items-center gap-2 px-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                activeCategory === cat 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "glass hover:bg-muted text-muted-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 4. Map through filteredResources instead of original resources */}
        {filteredResources.map((resource, index) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            className="glass rounded-2xl p-6 hover:border-primary/50 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {resource.category}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {resource.difficulty}
                </span>
              </div>

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                    style={{ background: `linear-gradient(135deg, ${resource.color}, #1a1a1a)` }}
                  >
                    {/* Logic for Dynamic Icons based on category/type */}
                    {resource.category === "DSA" && <Code2 className="w-6 h-6" />}
                    {resource.category === "System Design" && <Globe className="w-6 h-6" />}
                    {resource.category === "Databases" && <Database className="w-6 h-6" />}
                    {resource.category === "Web Dev" && <Globe className="w-6 h-6" />}
                    {resource.category === "DevOps" && <ShieldCheck className="w-6 h-6" />}
                    {resource.category === "Core CS" && <Cpu className="w-6 h-6" />}
                    {(!["DSA", "System Design", "Databases", "Web Dev", "DevOps", "Core CS"].includes(resource.category)) && <BookOpen className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                      {resource.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{resource.provider}</p>
                  </div>
                </div>
                <a 
                  href={resource.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {resource.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-warning fill-warning" />
                <span className="text-xs font-semibold">{resource.rating}</span>
              </div>
              <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                Open Resource <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State: Shows if no search results are found */}
      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No resources found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default StudyMaterial;