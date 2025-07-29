import React, { useState, useEffect, useContext } from 'react';
import { 
  saveExperimentNotes, 
  getExperimentNotes, 
  saveExperimentResults, 
  getExperimentResults 
} from '../../../../services/experimentService';
import { UserContext } from '../../../hooks/userContext';
import { Save } from 'lucide-react';

const ExperimentData = ({ 
  devices,
  connections,
  terminalOutput,
  simulationSettings,
  onLoadSavedExperiment,
  addLog,
  experimentId = 'computer-networks' 
}) => {
  const { user } = useContext(UserContext);
  const [notes, setNotes] = useState('');
  const [noteId, setNoteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedResults, setSavedResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);

  // Load notes when component mounts
  useEffect(() => {
    if (user) {
      loadNotes();
      loadExperimentResults(); // Also load saved experiments on mount
    }
  }, [user]);

  const loadNotes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await getExperimentNotes(user.id, experimentId);
      if (response.success && response.notes) {
        setNotes(response.notes.notes || '');
        setNoteId(response.notes.id);
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async () => {
    if (!user) {
      addLog('You need to be logged in to save notes', 'error');
      return;
    }
    
    try {
      setSaving(true);
      const response = await saveExperimentNotes(user.id, experimentId, notes, noteId);
      if (response.success) {
        setNoteId(response.noteId);
        addLog('Notes saved successfully', 'system');
      }
    } catch (error) {
      addLog('Failed to save notes', 'error');
      console.error('Error saving notes:', error);
    } finally {
      setSaving(false);
    }
  };

  const loadExperimentResults = async () => {
    if (!user) {
      addLog('You need to be logged in to load experiment results', 'error');
      return;
    }
    
    try {
      setLoading(true);
      const response = await getExperimentResults(user.id, experimentId);
      if (response.success) {
        setSavedResults(response.results || []);
        if (response.results.length > 0) {
          addLog(`Loaded ${response.results.length} saved experiment results`, 'system');
        } else {
          addLog('No saved experiment results found', 'system');
        }
      }
    } catch (error) {
      addLog('Failed to load experiment results', 'error');
      console.error('Error loading experiment results:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentExperiment = async () => {
    if (!user) {
      addLog('You need to be logged in to save experiment data', 'error');
      return;
    }
    
    if (devices.length === 0) {
      addLog('No network devices to save', 'error');
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare input data (network topology)
      const inputData = {
        devices: devices.map(device => ({
          id: device.id,
          name: device.name,
          type: device.type,
          x: device.x,
          y: device.y,
          ip: device.ip,
          mac: device.mac
        })),
        connections: connections.map(conn => ({
          from: conn.from,
          to: conn.to,
          latency: conn.latency,
          bandwidth: conn.bandwidth,
          packetLoss: conn.packetLoss
        }))
      };
      
      // Prepare output data (simulation settings and terminal output)
      const outputData = {
        simulationSettings,
        terminalOutput: terminalOutput.slice(-20) // Last 20 log entries
      };
      
      const response = await saveExperimentResults(user.id, experimentId, inputData, outputData);
      
      if (response.success) {
        addLog('Experiment data saved successfully', 'system');
        // Refresh the list of saved results
        loadExperimentResults();
      }
    } catch (error) {
      addLog('Failed to save experiment data', 'error');
      console.error('Error saving experiment data:', error);
    } finally {
      setSaving(false);
    }
  };

  const loadSelectedResult = () => {
    if (!selectedResult) {
      addLog('No experiment result selected to load', 'error');
      return;
    }
    
    try {
      // Find the selected result from saved results
      const result = savedResults.find(r => r.id === selectedResult);
      if (result) {
        addLog(`Loading experiment result from ${new Date(result.createdAt).toLocaleString()}`, 'system');
        
        // Call the parent component's function to load the saved experiment
        onLoadSavedExperiment(result);
        
        addLog(`Successfully loaded network with ${result.input.devices?.length || 0} devices and ${result.input.connections?.length || 0} connections`, 'system');
      }
    } catch (error) {
      addLog('Failed to load experiment result', 'error');
      console.error('Error loading experiment result:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-6">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Experiment Data</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={saveCurrentExperiment}
            disabled={saving || !user}
            className={`px-3 py-1 rounded text-sm flex items-center ${
              saving || !user
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            <Save className="h-4 w-4 mr-1" />
            {saving ? 'Saving...' : 'Save Experiment'}
          </button>
        </div>
      </div>
      
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notes Section */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Lab Notes</h4>
          <textarea
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Take notes about your experiment here..."
            disabled={loading || !user}
          ></textarea>
          <div className="mt-2 flex justify-end">
            <button
              onClick={saveNotes}
              disabled={saving || loading || !user}
              className={`px-3 py-1 rounded text-sm ${
                saving || loading || !user
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-50 text-green-600 hover:bg-green-100'
              }`}
            >
              {saving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
        
        {/* Saved Experiments Section */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Saved Experiments</h4>
          <div className="space-y-3">
            <button
              onClick={loadExperimentResults}
              disabled={loading || !user}
              className={`w-full px-3 py-2 rounded text-sm ${
                loading || !user
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              {loading ? 'Loading...' : 'Load Saved Experiments'}
            </button>
            
            {savedResults.length > 0 && (
              <div className="space-y-2">
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={selectedResult || ''}
                  onChange={(e) => setSelectedResult(e.target.value)}
                >
                  <option value="">-- Select a saved experiment --</option>
                  {savedResults.map(result => (
                    <option key={result.id} value={result.id}>
                      {new Date(result.createdAt).toLocaleString()} - {result.input.devices?.length || 0} devices
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={loadSelectedResult}
                  disabled={!selectedResult}
                  className={`w-full px-3 py-2 rounded text-sm ${
                    !selectedResult
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                >
                  Load Selected Experiment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {!user && (
        <div className="p-4 bg-red-50 border-t border-red-100 text-sm text-red-600">
          Please login to save and load experiment data.
        </div>
      )}
    </div>
  );
};

export default ExperimentData;
