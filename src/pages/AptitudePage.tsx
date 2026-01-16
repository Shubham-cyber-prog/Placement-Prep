import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Layers, 
  Star, 
  ExternalLink, 
  Clock, 
  Brain, 
  Divide, 
  PieChart, 
  MessageSquare,
  Zap,
  Play,
  TrendingUp,
  Shapes
} from "lucide-react";

const categories = ["All", "Quantitative", "Logical", "Verbal", "Data Interpretation", "Geometry", "Probability"];

const aptitudeTopics = [
  // --- QUANTITATIVE APTITUDE (1-20) ---
  { id: 1, title: "Profit and Loss", type: "Quantitative", category: "Quantitative", description: "Master concepts of cost price, selling price, and discount percentages.", questions: "45 Qs", time: "40m", color: "#00C6FF", rating: 4.9, difficulty: "Intermediate", link: "https://www.indiabix.com/aptitude/profit-and-loss/" },
  { id: 2, title: "Time and Work", type: "Quantitative", category: "Quantitative", description: "Calculate efficiency, man-days, and pipe/cistern problems.", questions: "50 Qs", time: "45m", color: "#0072ff", rating: 4.8, difficulty: "Intermediate", link: "https://www.indiabix.com/aptitude/time-and-work/" },
  { id: 3, title: "Permutation & Combination", type: "Quantitative", category: "Quantitative", description: "Counting principles, arrangements, and selection logic.", questions: "40 Qs", time: "50m", color: "#FF4B2B", rating: 4.9, difficulty: "Advanced", link: "https://www.geeksforgeeks.org/permutation-and-combination-formulas/" },
  { id: 4, title: "Simple Interest", type: "Quantitative", category: "Quantitative", description: "Learn interest calculation, principal amounts, and rate of return.", questions: "30 Qs", time: "30m", color: "#f9d423", rating: 4.7, difficulty: "Beginner", link: "https://www.indiabix.com/aptitude/simple-interest/" },
  { id: 5, title: "Compound Interest", type: "Quantitative", category: "Quantitative", description: "Master annual, semi-annual, and quarterly compounding logic.", questions: "35 Qs", time: "40m", color: "#e65c00", rating: 4.8, difficulty: "Intermediate", link: "https://www.indiabix.com/aptitude/compound-interest/" },
  { id: 6, title: "Averages", type: "Quantitative", category: "Quantitative", description: "Arithmetic mean, weighted average, and age-related problems.", questions: "25 Qs", time: "20m", color: "#834d9b", rating: 4.6, difficulty: "Beginner", link: "https://www.indiabix.com/aptitude/average/" },
  { id: 7, title: "Percentage", type: "Quantitative", category: "Quantitative", description: "Ratio-to-percentage conversions and growth/decay problems.", questions: "50 Qs", time: "45m", color: "#d397fa", rating: 4.9, difficulty: "Beginner", link: "https://www.indiabix.com/aptitude/percentage/" },
  { id: 8, title: "Ratio and Proportion", type: "Quantitative", category: "Quantitative", description: "Understand proportions, partnership ratios, and scaling.", questions: "40 Qs", time: "35m", color: "#2193b0", rating: 4.7, difficulty: "Intermediate", link: "https://www.indiabix.com/aptitude/ratio-and-proportion/" },
  { id: 9, title: "Boats and Streams", type: "Quantitative", category: "Quantitative", description: "Upstream and downstream speed calculations.", questions: "20 Qs", time: "25m", color: "#1e3c72", rating: 4.5, difficulty: "Intermediate", link: "https://www.indiabix.com/aptitude/boats-and-streams/" },
  { id: 10, title: "Trains", type: "Quantitative", category: "Quantitative", description: "Relative speed and platform length crossing logic.", questions: "30 Qs", time: "30m", color: "#2a5298", rating: 4.8, difficulty: "Intermediate", link: "https://www.indiabix.com/aptitude/problems-on-trains/" },
  { id: 11, title: "HCF and LCM", type: "Quantitative", category: "Quantitative", description: "Greatest common divisors and least common multiples.", questions: "25 Qs", time: "20m", color: "#6dd5ed", rating: 4.6, difficulty: "Beginner", link: "https://www.indiabix.com/aptitude/hcf-and-lcm/" },
  { id: 12, title: "Probability", type: "Quantitative", category: "Probability", description: "Dice, cards, and ball-picking probability scenarios.", questions: "40 Qs", time: "45m", color: "#f857a6", rating: 4.9, difficulty: "Advanced", link: "https://www.indiabix.com/aptitude/probability/" },
  { id: 13, title: "Clock and Calendar", type: "Quantitative", category: "Quantitative", description: "Angle between clock hands and odd-day calculations.", questions: "30 Qs", time: "35m", color: "#11998e", rating: 4.7, difficulty: "Intermediate", link: "https://www.indiabix.com/aptitude/calendar/" },
  { id: 14, title: "Partnership", type: "Quantitative", category: "Quantitative", description: "Profit distribution based on time and capital investment.", questions: "20 Qs", time: "20m", color: "#fc4a1a", rating: 4.5, difficulty: "Intermediate", link: "https://www.indiabix.com/aptitude/partnership/" },
  { id: 15, title: "Mixture & Alligation", type: "Quantitative", category: "Quantitative", description: "Mixing quantities to find desired weighted ratios.", questions: "30 Qs", time: "35m", color: "#4568dc", rating: 4.7, difficulty: "Advanced", link: "https://www.indiabix.com/aptitude/alligation-or-mixture/" },
  { id: 16, title: "Number System", type: "Quantitative", category: "Quantitative", description: "Divisibility rules, unit digits, and remainders.", questions: "50 Qs", time: "60m", color: "#3a1c71", rating: 4.8, difficulty: "Intermediate", link: "https://www.geeksforgeeks.org/number-system-in-maths/" },
  { id: 17, title: "Surds and Indices", type: "Quantitative", category: "Quantitative", description: "Exponential laws and simplifying irrational roots.", questions: "25 Qs", time: "30m", color: "#ffafbd", rating: 4.4, difficulty: "Intermediate", link: "https://www.indiabix.com/aptitude/surds-and-indices/" },
  { id: 18, title: "Chain Rule", type: "Quantitative", category: "Quantitative", description: "Direct and indirect proportion relationships.", questions: "20 Qs", time: "20m", color: "#2193b0", rating: 4.5, difficulty: "Beginner", link: "https://www.indiabix.com/aptitude/chain-rule/" },
  { id: 19, title: "Pipes and Cistern", type: "Quantitative", category: "Quantitative", description: "Inlet and outlet flow rate synchronization.", questions: "25 Qs", time: "30m", color: "#12c2e9", rating: 4.7, difficulty: "Intermediate", link: "https://www.indiabix.com/aptitude/pipes-and-cistern/" },
  { id: 20, title: "Stocks and Shares", type: "Quantitative", category: "Quantitative", description: "Dividends, brokerage, and investment returns.", questions: "15 Qs", time: "20m", color: "#cc2b5e", rating: 4.3, difficulty: "Advanced", link: "https://www.indiabix.com/aptitude/stocks-and-shares/" },

  // --- LOGICAL REASONING (21-35) ---
  { id: 21, title: "Blood Relations", type: "Logical", category: "Logical", description: "Decode complex family trees and relationship puzzles.", questions: "30 Qs", time: "25m", color: "#00FF87", rating: 4.8, difficulty: "Beginner", link: "https://www.indiabix.com/logical-reasoning/blood-relation-test/" },
  { id: 22, title: "Seating Arrangements", type: "Logical", category: "Logical", description: "Linear, circular, and multi-variable seating puzzles.", questions: "35 Qs", time: "30m", color: "#6A11CB", rating: 4.9, difficulty: "Intermediate", link: "https://www.geeksforgeeks.org/logical-reasoning-seating-arrangement/" },
  { id: 23, title: "Syllogism", type: "Logical", category: "Logical", description: "Venn diagram based logical deduction and conclusions.", questions: "40 Qs", time: "35m", color: "#b91d73", rating: 4.8, difficulty: "Advanced", link: "https://www.indiabix.com/logical-reasoning/syllogism/" },
  { id: 24, title: "Direction Sense", type: "Logical", category: "Logical", description: "Calculate displacement and final direction coordinates.", questions: "25 Qs", time: "20m", color: "#f4c4f3", rating: 4.7, difficulty: "Beginner", link: "https://www.indiabix.com/logical-reasoning/direction-sense-test/" },
  { id: 25, title: "Coding-Decoding", type: "Logical", category: "Logical", description: "Letter shifting, number coding, and deciphering patterns.", questions: "30 Qs", time: "25m", color: "#00c9ff", rating: 4.8, difficulty: "Intermediate", link: "https://www.geeksforgeeks.org/coding-decoding/" },
  { id: 26, title: "Number Series", type: "Logical", category: "Logical", description: "Identify missing terms using pattern recognition.", questions: "40 Qs", time: "30m", color: "#92fe9d", rating: 4.7, difficulty: "Intermediate", link: "https://www.indiabix.com/logical-reasoning/number-series/" },
  { id: 27, title: "Analogies", type: "Logical", category: "Logical", description: "Find relationships between pairs of words or numbers.", questions: "30 Qs", time: "20m", color: "#00f2fe", rating: 4.5, difficulty: "Beginner", link: "https://www.indiabix.com/logical-reasoning/analogies/" },
  { id: 28, title: "Data Sufficiency", type: "Logical", category: "Logical", description: "Determine if given statements suffice to answer a question.", questions: "30 Qs", time: "40m", color: "#4facfe", rating: 4.6, difficulty: "Advanced", link: "https://www.indiabix.com/logical-reasoning/data-sufficiency/" },
  { id: 29, title: "Statement & Conclusion", type: "Logical", category: "Logical", description: "Analyzing arguments for logical validity.", questions: "20 Qs", time: "25m", color: "#43e97b", rating: 4.4, difficulty: "Advanced", link: "https://www.indiabix.com/logical-reasoning/statement-and-conclusion/" },
  { id: 30, title: "Classification", type: "Logical", category: "Logical", description: "Identify the odd one out from sets of items.", questions: "25 Qs", time: "15m", color: "#fa709a", rating: 4.5, difficulty: "Beginner", link: "https://www.geeksforgeeks.org/classification-logical-reasoning/" },
  { id: 31, title: "Clocks Reasoning", type: "Logical", category: "Logical", description: "Mirror images and angle-based reasoning for clocks.", questions: "20 Qs", time: "20m", color: "#30cfd0", rating: 4.6, difficulty: "Intermediate", link: "https://www.indiabix.com/logical-reasoning/clocks/" },
  { id: 32, title: "Letter Series", type: "Logical", category: "Logical", description: "Predict the next alphabetic sequence in a series.", questions: "30 Qs", time: "20m", color: "#6a11cb", rating: 4.7, difficulty: "Beginner", link: "https://www.indiabix.com/logical-reasoning/letter-and-symbol-series/" },
  { id: 33, title: "Venn Diagrams", type: "Logical", category: "Logical", description: "Graphical representation of logical intersections.", questions: "25 Qs", time: "25m", color: "#ff0844", rating: 4.8, difficulty: "Intermediate", link: "https://www.indiabix.com/logical-reasoning/venn-diagrams/" },
  { id: 34, title: "Dice Reasoning", type: "Logical", category: "Logical", description: "Visualizing opposite faces of unfolded dice.", questions: "15 Qs", time: "15m", color: "#f093fb", rating: 4.6, difficulty: "Intermediate", link: "https://www.geeksforgeeks.org/logical-reasoning-dice-problems/" },
  { id: 35, title: "Input-Output", type: "Logical", category: "Logical", description: "Tracing step-by-step transformations of data strings.", questions: "20 Qs", time: "30m", color: "#5ee7df", rating: 4.7, difficulty: "Advanced", link: "https://www.geeksforgeeks.org/machine-input-output-logical-reasoning/" },

  // --- VERBAL REASONING (36-43) ---
  { id: 36, title: "Reading Comprehension", type: "Verbal", category: "Verbal", description: "Analyze passages for tone, context, and central themes.", questions: "25 Qs", time: "35m", color: "#FFA116", rating: 4.7, difficulty: "Advanced", link: "https://www.indiabix.com/verbal-ability/reading-comprehension/" },
  { id: 37, title: "Synonyms & Antonyms", type: "Verbal", category: "Verbal", description: "Vocabulary building for competitive exams.", questions: "100 Qs", time: "30m", color: "#00dbde", rating: 4.8, difficulty: "Beginner", link: "https://www.indiabix.com/verbal-ability/synonyms/" },
  { id: 38, title: "Error Detection", type: "Verbal", category: "Verbal", description: "Grammar check for subject-verb agreement and tenses.", questions: "50 Qs", time: "30m", color: "#fc00ff", rating: 4.6, difficulty: "Intermediate", link: "https://www.indiabix.com/verbal-ability/spotting-errors/" },
  { id: 39, title: "Sentence Correction", type: "Verbal", category: "Verbal", description: "Improvement of phrasing and structural coherence.", questions: "40 Qs", time: "30m", color: "#00cdac", rating: 4.5, difficulty: "Intermediate", link: "https://www.indiabix.com/verbal-ability/sentence-correction/" },
  { id: 40, title: "Idioms and Phrases", type: "Verbal", category: "Verbal", description: "Understanding non-literal expressions in English.", questions: "60 Qs", time: "25m", color: "#f77062", rating: 4.7, difficulty: "Beginner", link: "https://www.indiabix.com/verbal-ability/idioms-and-phrases/" },
  { id: 41, title: "One Word Substitution", type: "Verbal", category: "Verbal", description: "Concise vocabulary for better descriptive ability.", questions: "80 Qs", time: "30m", color: "#4facfe", rating: 4.8, difficulty: "Beginner", link: "https://www.indiabix.com/verbal-ability/one-word-substitutes/" },
  { id: 42, title: "Para Jumbles", type: "Verbal", category: "Verbal", description: "Ordering sentences for logical sequence and flow.", questions: "20 Qs", time: "30m", color: "#a18cd1", rating: 4.5, difficulty: "Advanced", link: "https://www.geeksforgeeks.org/parajumbles/" },
  { id: 43, title: "Closet Test", type: "Verbal", category: "Verbal", description: "Filling missing words based on semantic context.", questions: "30 Qs", time: "25m", color: "#ffecd2", rating: 4.4, difficulty: "Intermediate", link: "https://www.geeksforgeeks.org/cloze-test-verbal-ability/" },

  // --- DATA INTERPRETATION & MISC (44-50) ---
  { id: 44, title: "Bar Graphs", type: "DI", category: "Data Interpretation", description: "Analyze discrete data comparisons using vertical bars.", questions: "20 Qs", time: "20m", color: "#2575FC", rating: 4.5, difficulty: "Intermediate", link: "https://www.indiabix.com/data-interpretation/bar-charts/" },
  { id: 45, title: "Pie Charts", type: "DI", category: "Data Interpretation", description: "Analyzing proportional distribution of data slices.", questions: "20 Qs", time: "20m", color: "#f093fb", rating: 4.8, difficulty: "Intermediate", link: "https://www.indiabix.com/data-interpretation/pie-charts/" },
  { id: 46, title: "Line Charts", type: "DI", category: "Data Interpretation", description: "Track continuous trends over specific time intervals.", questions: "20 Qs", time: "20m", color: "#00f2fe", rating: 4.6, difficulty: "Intermediate", link: "https://www.indiabix.com/data-interpretation/line-charts/" },
  { id: 47, title: "Table Charts", type: "DI", category: "Data Interpretation", description: "Extracting row and column data for complex calculations.", questions: "25 Qs", time: "25m", color: "#43e97b", rating: 4.7, difficulty: "Intermediate", link: "https://www.indiabix.com/data-interpretation/table-charts/" },
  { id: 48, title: "Area & Volume", type: "Geometry", category: "Geometry", description: "2D and 3D surface area and volumetric logic.", questions: "30 Qs", time: "40m", color: "#fad0c4", rating: 4.7, difficulty: "Advanced", link: "https://www.indiabix.com/aptitude/area/" },
  { id: 49, title: "Heights and Distances", type: "Geometry", category: "Geometry", description: "Applying trigonometry to real-world elevation problems.", questions: "15 Qs", time: "20m", color: "#667eea", rating: 4.6, difficulty: "Intermediate", link: "https://www.indiabix.com/aptitude/height-and-distance/" },
  { id: 50, title: "Calendar Logic", type: "Quantitative", category: "Quantitative", description: "Determine days of the week for historical dates.", questions: "25 Qs", time: "20m", color: "#764ba2", rating: 4.8, difficulty: "Beginner", link: "https://www.indiabix.com/aptitude/calendar/" },
  { 
    id: 51, 
    title: "Clocks & Angles", 
    type: "Quantitative", 
    category: "Quantitative", 
    description: "Calculate degrees between hands, reflex angles, and mirror images of clock faces.", 
    questions: "25 Qs", 
    time: "25m", 
    color: "#ff5f6d", 
    rating: 4.7, 
    difficulty: "Intermediate", 
    link: "https://www.indiabix.com/aptitude/clocks/" 
 }
];

const Aptitude = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredTopics = aptitudeTopics.filter((topic) => {
    const matchesSearch = 
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === "All" || topic.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Aptitude Assessment</h1>
          <p className="text-muted-foreground">Master quantitative and logical reasoning</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search topics (e.g. Percentage)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass bg-background/20 rounded-xl pl-10 pr-4 py-2 border-none ring-1 ring-border focus:ring-primary outline-none w-full md:w-80"
          />
        </div>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTopics.map((topic, index) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ y: -5 }}
            className="glass rounded-2xl p-6 hover:border-primary/50 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {topic.category}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {topic.difficulty}
                </span>
              </div>

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-inner"
                    style={{ background: `linear-gradient(135deg, ${topic.color}, #1a1a1a)` }}
                  >
                    {topic.type === "Quantitative" && <Divide className="w-6 h-6" />}
                    {topic.type === "Logical" && <Brain className="w-6 h-6" />}
                    {topic.type === "Verbal" && <MessageSquare className="w-6 h-6" />}
                    {topic.type === "DI" && <PieChart className="w-6 h-6" />}
                    {topic.type === "Geometry" && <Shapes className="w-6 h-6" />}
                    {(!["Quantitative", "Logical", "Verbal", "DI", "Geometry"].includes(topic.type)) && <Zap className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                      {topic.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                         <Play className="w-2.5 h-2.5" /> {topic.questions}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                         <Clock className="w-2.5 h-2.5" /> {topic.time}
                      </span>
                    </div>
                  </div>
                </div>
                <a 
                  href={topic.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                {topic.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-warning fill-warning" />
                <span className="text-xs font-semibold">{topic.rating}</span>
              </div>
              <a 
                href={topic.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                Start Practice <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <div className="text-center py-20 glass rounded-3xl">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No topics found</h3>
          <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
        </div>
      )}
    </div>
  );
};

export default Aptitude;