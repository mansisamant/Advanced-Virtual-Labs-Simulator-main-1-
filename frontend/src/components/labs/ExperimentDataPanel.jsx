import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../hooks/userContext';
import { Save, Clock, FileText, BarChart2, Edit, Trash2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const ExperimentDataPanel = ({ experimentId }) => {
  const { user } = useContext(UserContext);
  const [results, setResults] = useState([]);
  const [notes, setNotes] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || `${import.meta.env.VITE_BACKEND_URL}/api`;

  useEffect(() => {
    if (user && experimentId) {
      fetchExperimentData();
    }
  }, [user, experimentId]);
  
  const fetchExperimentData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch results
      const resultsResponse = await axios.get(
        `${API_URL}/experiments/results/${user.id}/${experimentId}`
      );
      
      // Fetch notes
      const notesResponse = await axios.get(
        `${API_URL}/experiments/notes/${user.id}/${experimentId}`
      );
      
      setResults(resultsResponse.data.results || []);
      
      // If notes exist, set them and initialize newNote field
      if (notesResponse.data.notes) {
        setNotes(notesResponse.data.notes);
        setNewNote(notesResponse.data.notes.notes);
      } else {
        setNotes(null);
        setNewNote('');
      }
    } catch (err) {
      console.error("Error fetching experiment data:", err);
      setError(err.response?.data?.message || "Failed to load experiment data");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNoteSave = async () => {
    try {
      let response;
      
      // If we already have notes, update them
      if (notes) {
        response = await axios.post(`${API_URL}/experiments/notes`, {
          studentId: user.id,
          experimentId,
          notes: newNote,
          noteId: notes.id
        });
      } else {
        // Create new notes
        response = await axios.post(`${API_URL}/experiments/notes`, {
          studentId: user.id,
          experimentId,
          notes: newNote
        });
      }
      
      // Update the notes state with the new data
      if (response.data.success) {
        if (notes) {
          setNotes({
            ...notes,
            notes: newNote,
            updatedAt: new Date().toISOString()
          });
        } else {
          // Refetch to get the new note ID
          fetchExperimentData();
        }
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Error saving note:", err);
      setError(err.response?.data?.message || "Failed to save note");
    }
  };
  
  const handleNoteDelete = async () => {
    if (!notes) return;
    
    try {
      await axios.delete(`${API_URL}/experiments/notes/${notes.id}/${user.id}`);
      setNotes(null);
      setNewNote('');
    } catch (err) {
      console.error("Error deleting note:", err);
      setError(err.response?.data?.message || "Failed to delete note");
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <div className="experiment-data-panel animate-pulse">
        <div className="bg-gray-100 p-6 rounded-lg h-48"></div>
      </div>
    );
  }

  return (
    <div className="experiment-data-panel bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-indigo-600 px-4 py-3">
        <h3 className="text-white font-medium flex items-center">
          <BarChart2 className="h-4 w-4 mr-2" />
          Experiment Data
        </h3>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      <div className="p-4">
        {/* Results Section */}
        <div className="mb-6">
          <h4 className="text-gray-800 font-medium mb-3 flex items-center">
            <Save className="h-4 w-4 mr-2 text-indigo-600" />
            Past Results
          </h4>
          
          {results.length > 0 ? (
            <div className="bg-gray-50 rounded-md border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Input</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Output</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((result) => (
                    <tr key={result.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(result.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {Object.keys(result.input).length > 0 ? (
                          <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                            {JSON.stringify(result.input, null, 2)}
                          </pre>
                        ) : (
                          <span className="text-gray-400 italic">No input data</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {Object.keys(result.output).length > 0 ? (
                          <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                            {JSON.stringify(result.output, null, 2)}
                          </pre>
                        ) : (
                          <span className="text-gray-400 italic">No output data</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center text-gray-500">
              No previous results for this experiment
            </div>
          )}
        </div>
        
        {/* Notes Section */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-gray-800 font-medium flex items-center">
              <FileText className="h-4 w-4 mr-2 text-indigo-600" />
              My Notes
            </h4>
            <div className="flex gap-2">
              {notes && !isEditing && (
                <>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={handleNoteDelete}
                    className="p-1.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-gray-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
          
          {isEditing || !notes ? (
            <div className="bg-gray-50 rounded-md border border-gray-200 p-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full p-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={5}
                placeholder="Write your experiment notes here..."
              ></textarea>
              <div className="flex justify-end mt-2 gap-2">
                {notes && (
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setNewNote(notes.notes);
                    }}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleNoteSave}
                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Save Notes
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-md border border-gray-200 p-4">
              <div className="whitespace-pre-wrap text-gray-700">
                {notes.notes || <span className="text-gray-400 italic">No notes saved yet</span>}
              </div>
              {notes.updatedAt && (
                <div className="mt-2 text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Last updated: {formatDate(notes.updatedAt)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperimentDataPanel;