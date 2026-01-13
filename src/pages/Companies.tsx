import { motion } from "framer-motion";
import { Building2, MapPin, Users, Briefcase, Star, ExternalLink, Tag } from "lucide-react";

const companies = [
  {
    id: 1,
    name: "Google",
    category: "MAANG",
    website: "https://www.google.com/about/careers/applications/locations/bangalore",
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
    category: "Big Tech",
    website: "https://careers.microsoft.com/us/en/india",
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
    category: "MAANG",
    website: "https://www.amazon.jobs/en/locations/india",
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
    category: "MAANG",
    website: "https://www.meta.com/careers/",
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
    category: "MAANG",
    website: "https://www.apple.com/jobs/in/",
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
    category: "E-commerce",
    website: "https://www.flipkartcareers.com/",
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
    category: "SaaS",
    website: "https://www.oracle.com/careers/",
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
    category: "SaaS",
    website: "https://www.sprinklr.com/careers/",
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
    category: "SaaS",
    website: "https://www.salesforce.com/company/careers/",
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
    category: "Product",
    website: "https://www.adobe.com/careers.html",
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
    category: "Logistics",
    website: "https://www.uber.com/us/en/careers/",
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
    category: "Entertainment",
    website: "https://jobs.netflix.com/",
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
    category: "DevTools",
    website: "https://www.atlassian.com/company/careers",
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
    category: "Hardware",
    website: "https://www.nvidia.com/en-us/about-nvidia/careers/",
    logo: "N",
    location: "Bangalore, Pune, Hyderabad",
    employees: "26k+",
    openings: 30,
    avgPackage: "25-50 LPA",
    rating: 4.7,
    color: "#76B900",
  },
  {
    id: 15,
    name: "Tesla",
    category: "Automotive",
    website: "https://www.tesla.com/careers",
    logo: "T",
    location: "Bangalore",
    employees: "120k+",
    openings: 12,
    avgPackage: "30-50 LPA",
    rating: 4.0,
    color: "#E81922",
  },
  {
    id: 16,
    name: "Stripe",
    category: "FinTech",
    website: "https://stripe.com/jobs",
    logo: "S",
    location: "Remote, Bangalore",
    employees: "8k+",
    openings: 18,
    avgPackage: "35-55 LPA",
    rating: 4.3,
    color: "#635BFF",
  },
  {
    id: 17,
    name: "LinkedIn",
    category: "Social",
    website: "https://www.linkedin.com/help/linkedin/answer/a522735",
    logo: "L",
    location: "Bangalore",
    employees: "21k+",
    openings: 22,
    avgPackage: "25-45 LPA",
    rating: 4.5,
    color: "#0A66C2",
  },
  {
    id: 18,
    name: "Zomato",
    category: "FoodTech",
    website: "https://www.zomato.com/careers",
    logo: "Z",
    location: "Gurgaon, Bangalore",
    employees: "5k+",
    openings: 45,
    avgPackage: "18-35 LPA",
    rating: 3.9,
    color: "#CB202D",
  },
  {
    id: 19,
    name: "Goldman Sachs",
    category: "FinTech",
    website: "https://www.goldmansachs.com/careers/",
    logo: "G",
    location: "Bangalore, Hyderabad",
    employees: "45k+",
    openings: 55,
    avgPackage: "22-40 LPA",
    rating: 4.1,
    color: "#7399C6",
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
            className="glass rounded-2xl p-6 hover:border-primary/50 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              {/* Category Tag */}
              <div className="flex justify-end mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {company.category}
                </span>
              </div>

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
                <a 
                  href={company.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{company.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{company.employees} employees</span>
                </div>
              </div>
            </div>

            {/* Stats Section */}
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