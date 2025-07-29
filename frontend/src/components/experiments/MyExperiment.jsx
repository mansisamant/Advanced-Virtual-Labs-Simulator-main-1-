import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../hooks/userContext';
import { Calendar, FileText, BarChart2, Clock, ExternalLink, AlertCircle } from 'lucide-react';
import axios from 'axios';
import experimentsData from '../../virtual_db/experiements.json';
import labsData from '../../virtual_db/labs.json';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

const UserExperimentsDashboard = () => {
  const { user } = useContext(UserContext);
  const [userExperiments, setUserExperiments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchUserExperiments = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Get all results for student
        const resultsResponse = await axios.get(`${API_URL}/experiments/results/student/${user.id}`);
        
        // Get all notes for student
        const notesResponse = await axios.get(`${API_URL}/experiments/notes/student/${user.id}`);
        
        // Combine data to create a complete view
        const results = resultsResponse.data.results || [];
        const notes = notesResponse.data.notes || [];
        
        // Group by experimentId
        const experiments = {};
        
        // Add results
        results.forEach(result => {
          if (!experiments[result.experimentId]) {
            experiments[result.experimentId] = {
              experimentId: result.experimentId,
              results: [],
              notes: null,
            };
          }
          experiments[result.experimentId].results.push(result);
        });
        
        // Add notes
        notes.forEach(note => {
          if (!experiments[note.experimentId]) {
            experiments[note.experimentId] = {
              experimentId: note.experimentId,
              results: [],
              notes: note,
            };
          } else {
            experiments[note.experimentId].notes = note;
          }
        });
        
        // Convert to array
        const experimentsArray = Object.values(experiments);
        
        // Enrich experiment data with metadata from experimentsData
        const enrichedExperiments = experimentsArray.map(experiment => {
          const metadata = experimentsData.find(e => e._id === experiment.experimentId) || {};
          const lab = metadata.lab_id ? labsData.find(l => l._id === metadata.lab_id) || {} : {};
          
          return {
            ...experiment,
            metadata: {
              ...metadata,
              labName: lab.name || 'Unknown Lab'
            }
          };
        });
        
        setUserExperiments(enrichedExperiments);
      } catch (err) {
        console.error("Error fetching user experiments:", err);
        setError(err.response?.data?.message || "Failed to load experiments data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserExperiments();
  }, [user]);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const getLatestActivity = (experiment) => {
    const dates = [];
    
    if (experiment.notes?.updatedAt) {
      dates.push(new Date(experiment.notes.updatedAt));
    }
    
    experiment.results.forEach(result => {
      if (result.createdAt) {
        dates.push(new Date(result.createdAt));
      }
    });
    
    if (dates.length === 0) return 'No activity';
    
    const latest = new Date(Math.max(...dates));
    return formatDate(latest);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse p-4">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-100 p-6 rounded-lg mb-4 h-32"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="text-red-700 font-medium">Error loading your experiments</h3>
        </div>
        <p className="text-red-600 mt-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="user-experiments-dashboard p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Experiments</h2>
      
      {userExperiments.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-500 mb-4">You haven't conducted any experiments yet.</p>
          <Link to="/labs" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Browse Available Labs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userExperiments.map((experiment) => (
            <div
              key={experiment.experimentId}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="bg-indigo-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-medium text-gray-800 truncate">
                  {experiment.metadata?.name || 'Unnamed Experiment'}
                </h3>
                <p className="text-sm text-gray-500">{experiment.metadata?.labName || 'Unknown Lab'}</p>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-sm">
                    <span className="text-gray-500 flex items-center mb-1">
                      <Clock className="h-3.5 w-3.5 mr-1" /> Last Activity
                    </span>
                    <span className="font-medium text-gray-800">{getLatestActivity(experiment)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500 flex items-center mb-1">
                      <BarChart2 className="h-3.5 w-3.5 mr-1" /> Results
                    </span>
                    <span className="font-medium text-gray-800">{experiment.results.length}</span>
                  </div>
                </div>
                
                <div className="text-sm mb-4">
                  <span className="text-gray-500 flex items-center mb-1">
                    <FileText className="h-3.5 w-3.5 mr-1" /> Notes
                  </span>
                  <p className="text-gray-800 truncate">
                    {experiment.notes ? (
                      experiment.notes.notes.substring(0, 50) + (experiment.notes.notes.length > 50 ? '...' : '')
                    ) : (
                      <span className="text-gray-400 italic">No notes</span>
                    )}
                  </p>
                </div>
                
                <Link
                  to={`/experiment?lab=${experiment.metadata?.lab_id || ''}&experiment=${experiment.experimentId}`}
                  className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Experiment
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserExperimentsDashboard;