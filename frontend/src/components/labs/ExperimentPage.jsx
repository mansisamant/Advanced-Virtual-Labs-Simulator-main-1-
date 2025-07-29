import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Clipboard, FileText, BookOpen, Award, Save, ExternalLink, Info, AlertTriangle } from 'lucide-react';
import labsData from '../../virtual_db/labs.json';
import experimentsData from '../../virtual_db/experiements.json';
import usersData from '../../virtual_db/users.json';
import ResponsiveHeader from '../shared-components/Header';
import Footer from '../shared-components/Footer';
import { useLabAssistant } from '../shared-components/labAssistant';

export default function ExperimentPage() {
  const [searchParams] = useSearchParams();
  const labId = searchParams.get('lab');
  const experimentId = searchParams.get('experiment');
  const navigate = useNavigate();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [lab, setLab] = useState(null);
  const [experiments, setExperiments] = useState([]);
  const [currentExperiment, setCurrentExperiment] = useState(null);
  const [iframeKey, setIframeKey] = useState(0); // For forcing iframe reload
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [results, setResults] = useState({});
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Handle custom render types like the 8085 simulator
  useEffect(() => {
    if (currentExperiment && currentExperiment.render_type === "custom" && currentExperiment.module_url) {
      // Navigate to the custom module URL
      navigate(currentExperiment.module_url);
    }
  }, [currentExperiment, navigate]);

  // Simulated user authentication - in a real app, this would use Firebase Auth or similar
  useEffect(() => {
    // For demo purposes, we'll use the first user in our JSON data
    setCurrentUser(usersData[0]);
  }, []);

  // Fetch lab and experiments data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Find the selected lab
        const selectedLab = labsData.find(l => l._id === labId);
        
        if (!selectedLab) {
          throw new Error('Lab not found');
        }
        
        setLab(selectedLab);
        
        // Find all experiments for this lab
        const labExperiments = experimentsData.filter(exp => exp.lab_id === labId);
        setExperiments(labExperiments);
        
        // Set current experiment (either from URL param or first experiment)
        if (experimentId) {
          const selectedExperiment = experimentsData.find(exp => exp._id === experimentId);
          if (selectedExperiment) {
            setCurrentExperiment(selectedExperiment);
          } else {
            setCurrentExperiment(labExperiments[0]);
          }
          console.log('Selected experiment:', selectedExperiment);
        } else if (labExperiments.length > 0) {
          setCurrentExperiment(labExperiments[0]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading experiment:', error);
        setIsLoading(false);
      }
    };

    if (labId) {
      fetchData();
    } else {
      navigate('/labs');
    }
  }, [labId, experimentId, navigate]);

  // Simulate experiment completion
  const handleCompleteExperiment = () => {
    // In a real app, this would send data to Firebase/database
    const newResults = {
      completed: true,
      score: Math.floor(Math.random() * 21) + 80, // Random score 80-100
      timestamp: new Date().toISOString()
    };
    
    setResults(newResults);
    setShowCompletionModal(true);
    
    // Update progress in user object (simulation only)
    if (currentUser && currentExperiment) {
      const updatedUser = {...currentUser};
      if (!updatedUser.progress) {
        updatedUser.progress = {};
      }
      
      updatedUser.progress[currentExperiment._id] = {
        completed: true,
        score: newResults.score,
        last_attempt: newResults.timestamp,
        attempts: updatedUser.progress[currentExperiment._id]?.attempts 
          ? updatedUser.progress[currentExperiment._id].attempts + 1 
          : 1
      };
      
      setCurrentUser(updatedUser);
      console.log('Updated user progress:', updatedUser.progress);
    }
  };

  const selectExperiment = (experiment) => {
    setCurrentExperiment(experiment);
    setIframeKey(prev => prev + 1); // Force iframe reload
    navigate(`/experiment?lab=${labId}&experiment=${experiment._id}`);
  };

  const handleRestartExperiment = () => {
    setIframeKey(prev => prev + 1); // Force iframe reload
  };

  const handleBackToLabs = () => {
    navigate('/labs');
  };

  

  // Check if user has completed this experiment before
  const getExperimentProgress = () => {
    if (!currentUser || !currentExperiment) return null;
    return currentUser.progress?.[currentExperiment._id];
  };

  const experimentProgress = getExperimentProgress();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">      <ResponsiveHeader 
        isConnected={isConnected} 
        isConnecting={false}
      />
      
      <main className="flex-grow container mx-auto pt-20 pb-12">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-400"></div>
          </div>
        ) : (
          <div className="px-4">
            {/* Lab Header */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 p-6 mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-teal-300 mb-2">{lab?.name}</h1>
              <p className="text-gray-300 mb-4">{lab?.description}</p>
              <div className="flex flex-wrap gap-2">
                {lab?.tags.map((tag, index) => (
                  <span key={index} className="bg-gray-800/50 text-teal-300 px-2.5 py-1 rounded-md text-sm border border-teal-500/20">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Main Content Layout */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Sidebar */}
              <div className="lg:w-64 bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="bg-teal-500/10 border-b border-teal-500/20 px-4 py-3">
                  <h3 className="text-teal-300 font-medium">Available Experiments</h3>
                </div>
                <div className="divide-y divide-gray-800/50">
                  {experiments.map((experiment) => {
                    const isCompleted = currentUser?.progress?.[experiment._id]?.completed;
                    return (
                      <button
                        key={experiment._id}
                        className={`block w-full px-4 py-3 text-left transition-colors ${
                          currentExperiment?._id === experiment._id 
                            ? 'bg-teal-500/10 text-teal-300' 
                            : 'text-gray-300 hover:bg-teal-500/5 hover:text-teal-300'
                        }`}
                        onClick={() => selectExperiment(experiment)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{experiment.name}</span>
                          {isCompleted && (
                            <Award className="h-4 w-4 text-teal-400" />
                          )}
                        </div>
                        <span className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                          <span>{experiment.difficulty}</span>
                          <span>•</span>
                          <span>{experiment.estimated_time}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Main Area */}
              <div className="flex-1 flex flex-col">
                {currentExperiment ? (
                  <>
                    {/* Experiment Header */}
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 p-6 mb-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">
                          {currentExperiment.name}
                        </h2>
                        <div className="flex gap-2">
                          <button className="px-3 py-1.5 rounded-md border border-teal-500/20 text-teal-300 hover:bg-teal-500/10 text-sm">
                            {showInstructions ? 'Hide' : 'Show'} Instructions
                          </button>
                          <button className="px-3 py-1.5 rounded-md border border-teal-500/20 text-teal-300 hover:bg-teal-500/10 text-sm flex items-center">
                            <Play className="h-3.5 w-3.5 mr-1" /> Reset
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Instructions Panel */}
                    {showInstructions && (
                      <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 p-6 mb-4">
                        <h3 className="flex items-center text-lg font-semibold text-white mb-3">
                          <FileText className="h-5 w-5 mr-2 text-teal-400" />
                          Instructions
                        </h3>
                        <p className="text-gray-300 mb-4">{currentExperiment.description}</p>
                        <div className="bg-gray-700/50 p-4 rounded-md border border-teal-500/20">
                          <h4 className="font-medium text-teal-300 mb-2">Procedure</h4>
                          <div className="text-gray-300 whitespace-pre-line">
                            {currentExperiment.instructions}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Interactive Area */}
                    <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800/50 overflow-hidden flex-grow">
                      <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700/50 flex justify-between items-center">
                        <h3 className="font-medium text-teal-300">Interactive Simulation</h3>
                        <a href={currentExperiment.module_url} className="text-teal-400 text-sm flex items-center hover:text-teal-300">
                          Open in New Tab <ExternalLink className="h-3.5 w-3.5 ml-1" />
                        </a>
                      </div>
                      
                      <div className="flex-grow flex flex-col">
                        {/* Render iframe or component based on render_type */}
                        {currentExperiment.render_type === "iframe" ? (
                          <iframe
                            key={iframeKey}
                            src={currentExperiment.module_url}
                            title={currentExperiment.name}
                            className="w-full flex-grow border-0"
                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                            loading="lazy"
                          ></iframe>
                        ) : (
                          <div className="flex-grow flex items-center justify-center p-8 bg-gray-50">
                            <div className="text-center">
                              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-800 mb-2">Component Not Available</h3>
                              <p className="text-gray-600 max-w-md">
                                This experiment uses a custom renderer that isn't available in the demo version.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Bar */}
                      <div className="bg-gray-800/50 px-6 py-4 border-t border-gray-700/50">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-400">
                            Complete the steps above to finish this experiment
                          </div>
                          <div className="flex gap-3">
                            <button className="px-4 py-2 border border-teal-500/20 rounded-md text-teal-300 hover:bg-teal-500/10">
                              Save Progress
                            </button>
                            <button className="px-4 py-2 bg-teal-500/20 border border-teal-500/30 text-teal-300 rounded-md hover:bg-teal-500/30">
                              Complete Experiment
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-xl shadow-md p-8 text-center">
                    <div className="text-gray-500 mb-4">
                      <Clipboard className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No Experiment Selected</h3>
                    <p className="text-gray-600">
                      Please select an experiment from the list to begin.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="text-center mb-6">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Experiment Complete!</h2>
              <p className="text-gray-600 mt-2">
                You've successfully completed {currentExperiment?.name}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium text-gray-700">Your Score</span>
                <span className="text-xl font-bold text-indigo-600">{results.score}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full"
                  style={{ width: `${results.score}%` }}  
                ></div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowCompletionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleBackToLabs}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Back to Labs
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}
