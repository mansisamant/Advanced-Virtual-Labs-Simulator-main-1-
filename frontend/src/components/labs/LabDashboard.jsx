import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Beaker,
  BookOpen,
  Clock,
  ChevronRight,
  Tag,
  Cpu,
} from "lucide-react";
import labsData from "../../virtual_db/labs.json";
import ResponsiveHeader from "../shared-components/Header";
import Footer from "../shared-components/Footer";
import { useLabAssistant } from "../shared-components/labAssistant";

export default function LabDashboard() {
  const [labs, setLabs] = useState([]);
  const [filteredLabs, setFilteredLabs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        setIsLoading(true);

        await new Promise((resolve) => setTimeout(resolve, 800));

        setLabs(labsData);
        setFilteredLabs(labsData);

        const uniqueCategories = [
          "All",
          ...new Set(labsData.map((lab) => lab.category)),
        ];
        setCategories(uniqueCategories);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching labs:", error);
        setIsLoading(false);
      }
    };

    fetchLabs();
  }, []);

  useEffect(() => {
    let result = labs;

    // Filter by category if not "All"
    if (selectedCategory !== "All") {
      result = result.filter((lab) => lab.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (lab) =>
          lab.name.toLowerCase().includes(query) ||
          lab.description.toLowerCase().includes(query) ||
          lab.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    setFilteredLabs(result);
  }, [searchQuery, selectedCategory, labs]);

  const handleLabSelect = (labId) => {
    navigate(`/experiment?lab=${labId}`);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const navigateToSimulator = () => {
    navigate("/simulator/8085");
  };

  // const handleAssistantToggle = (isOpen) => {
  //   console.log("Assistant is now:", isOpen ? "open" : "closed");
  // };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <ResponsiveHeader
        isConnected={isConnected}
        isConnecting={false}
      />

      <main className="flex-grow container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Virtual Laboratory
            </h1>
            <p className="text-gray-400">
              Explore interactive experiments across various scientific
              disciplines
            </p>
          </div>
          <div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search for labs by name, description or tags..."
                className="block w-full pl-10 pr-3 py-3 bg-gray-900/50 border border-gray-700 rounded-xl 
                  text-gray-300 placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-gray-400">Filter:</span>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedCategory === category
                        ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                        : "bg-gray-900/50 text-gray-400 border border-gray-700 hover:border-teal-500/30 hover:text-teal-300"
                    }`}
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lab Cards Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : filteredLabs.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 text-center">
            <div className="flex justify-center mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-400 mb-2">
              No Labs Found
            </h2>
            <p className="text-gray-500">
              We couldn't find any labs matching your search criteria. Please
              try a different search term or filter.
            </p>
            <button
              className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLabs.map((lab) => (
              <div
                key={lab._id}
                className="group bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 
                  hover:border-teal-500/30 transition-all duration-300 overflow-hidden flex flex-col"
              >
                <div
                  className="h-48 bg-cover bg-center relative"
                  style={{
                    backgroundImage: `url(${lab.thumbnail})`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent">
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-teal-500/90 text-white text-xs font-medium px-2.5 py-1 rounded-lg">
                        {lab.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-grow">
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-teal-400 transition-colors">
                    {lab.name}
                  </h3>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {lab.description}
                  </p>

                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{lab.estimated_time}</span>
                    <span className="mx-2">•</span>
                    <BookOpen className="h-4 w-4 mr-1" />
                    <span>{lab.difficulty}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {lab.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-900/50 text-gray-400 text-xs px-3 py-1.5 rounded-lg 
                          border border-gray-700/50 flex items-center"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-6 border-t border-gray-700/50">
                  <button
                    onClick={() => handleLabSelect(lab._id)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-teal-400 
                      hover:from-teal-600 hover:to-teal-500 text-white rounded-lg transition-all duration-300 
                      flex items-center justify-center group-hover:shadow-lg group-hover:shadow-teal-500/20"
                  >
                    Launch Lab
                    <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
