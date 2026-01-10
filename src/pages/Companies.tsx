import { motion } from "framer-motion";
import { Building2, MapPin, Users, Briefcase, Star, ExternalLink } from "lucide-react";

const companies = [
  {
    id: 1,
    name: "Google",
    logo: "G",
    location: "Bangalore, Hyderabad",
    employees: "150k+",
    openings: 45,
    avgPackage: "25-45 LPA",
    rating: 4.5,
    color: "#4285F4",
  },
  {
    id: 2,
    name: "Microsoft",
    logo: "M",
    location: "Bangalore, Hyderabad, Noida",
    employees: "200k+",
    openings: 60,
    avgPackage: "20-40 LPA",
    rating: 4.4,
    color: "#00BCF2",
  },
  {
    id: 3,
    name: "Amazon",
    logo: "A",
    location: "Bangalore, Chennai, Hyderabad",
    employees: "1.5M+",
    openings: 120,
    avgPackage: "18-35 LPA",
    rating: 4.2,
    color: "#FF9900",
  },
  {
    id: 4,
    name: "Meta",
    logo: "M",
    location: "Gurugram",
    employees: "70k+",
    openings: 25,
    avgPackage: "30-50 LPA",
    rating: 4.3,
    color: "#0668E1",
  },
  {
    id: 5,
    name: "Apple",
    logo: "A",
    location: "Bangalore, Hyderabad",
    employees: "160k+",
    openings: 30,
    avgPackage: "28-45 LPA",
    rating: 4.6,
    color: "#A3AAAE",
  },
  {
    id: 6,
    name: "Flipkart",
    logo: "F",
    location: "Bangalore",
    employees: "35k+",
    openings: 80,
    avgPackage: "15-30 LPA",
    rating: 4.1,
    color: "#F8E71C",
  },
  {
    id: 7,
    name: "Oracle",
    logo: "O",
    location: "Bangalore, Hyderabad, Noida",
    employees: "130k+",
    openings: 35,
    avgPackage: "15-35 LPA",
    rating: 4.0,
    color: "#F80000",
  },
  {
    id: 8,
    name: "Sprinklr",
    logo: "S",
    location: "Bangalore, Gurgaon",
    employees: "4k+",
    openings: 15,
    avgPackage: "25-35 LPA",
    rating: 4.2,
    color: "#FE4C00",
  },
  {
    id: 9,
    name: "Salesforce",
    logo: "S",
    location: "Hyderabad, Bangalore, Jaipur",
    employees: "75k+",
    openings: 40,
    avgPackage: "20-40 LPA",
    rating: 4.4,
    color: "#00A1E0",
  },
  {
    id: 10,
    name: "Adobe",
    logo: "A",
    location: "Noida, Bangalore",
    employees: "25k+",
    openings: 20,
    avgPackage: "22-45 LPA",
    rating: 4.5,
    color: "#FF0000",
  },
  {
    id: 11,
    name: "Uber",
    logo: "U",
    location: "Bangalore, Hyderabad",
    employees: "22k+",
    openings: 25,
    avgPackage: "25-45 LPA",
    rating: 4.1,
    color: "#000000",
  },
  {
    id: 12,
    name: "Netflix",
    logo: "N",
    location: "Mumbai",
    employees: "12k+",
    openings: 10,
    avgPackage: "35-60 LPA",
    rating: 4.4,
    color: "#E50914",
  },
  {
    id: 13,
    name: "Atlassian",
    logo: "A",
    location: "Bangalore",
    employees: "10k+",
    openings: 15,
    avgPackage: "30-55 LPA",
    rating: 4.6,
    color: "#0052CC",
  },
  {
    id: 14,
    name: "Nvidia",
    logo: "N",
    location: "Bangalore, Pune, Hyderabad",
    employees: "26k+",
    openings: 30,
    avgPackage: "25-50 LPA",
    rating: 4.7,
    color: "#76B900",
  },
];

const Companies = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Target Companies</h1>
        <p className="text-muted-foreground">Explore top companies and their hiring process</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Companies", value: "150+" },
          { label: "Open Positions", value: "2,500+" },
          { label: "Avg Package", value: "25 LPA" },
          { label: "Success Rate", value: "78%" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass rounded-xl p-4 text-center"
          >
            <p className="text-2xl font-bold gradient-text">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((company, index) => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="glass rounded-2xl p-6 hover:border-primary/50 transition-all cursor-pointer group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-background"
                  style={{ backgroundColor: company.color }}
                >
                  {company.logo}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {company.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="w-3 h-3 text-warning fill-warning" />
                    <span>{company.rating}</span>
                  </div>
                </div>
              </div>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{company.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{company.employees} employees</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div>
                <p className="text-xs text-muted-foreground">Open Positions</p>
                <p className="font-semibold text-foreground">{company.openings}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Avg Package</p>
                <p className="font-semibold text-primary">{company.avgPackage}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Companies;
