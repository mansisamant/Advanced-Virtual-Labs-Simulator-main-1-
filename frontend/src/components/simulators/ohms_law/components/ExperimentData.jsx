import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../../hooks/userContext';
import { 
  saveExperimentNotes, 
  getExperimentNotes, 
  saveExperimentResults, 
  getExperimentResults 
} from '../../../../services/experimentService';

const ExperimentData = ({ 
  voltage,
  resistance,
  current,
  power,
  components,
  connections,
  circuitComplete,
  measurements,
  onLoadSavedExperiment,
  experimentId = 'ohms-law-circuit'
}) => {
  const { user } = useContext(UserContext);
  const [notes, setNotes] = useState('');
  const [noteId, setNoteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedResults, setSavedResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Load notes when component mounts
  useEffect(() => {
    if (user) {
      loadNotes();
      loadExperimentResults();
    }
  }, [user]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

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
      showNotification('You need to be logged in to save notes', 'error');
      return;
    }
    
    try {
      setSaving(true);
      const response = await saveExperimentNotes(user.id, experimentId, notes, noteId);
      if (response.success) {
        setNoteId(response.noteId);
        showNotification('Notes saved successfully');
      }
    } catch (error) {
      showNotification('Failed to save notes', 'error');
      console.error('Error saving notes:', error);
    } finally {
      setSaving(false);
    }
  };

  const loadExperimentResults = async () => {
    if (!user) {
      showNotification('You need to be logged in to load experiment results', 'error');
      return;
    }
    
    try {
      setLoading(true);
      const response = await getExperimentResults(user.id, experimentId);
      if (response.success) {
        setSavedResults(response.results || []);
      }
    } catch (error) {
      showNotification('Failed to load experiment results', 'error');
      console.error('Error loading experiment results:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentExperiment = async () => {
    if (!user) {
      showNotification('You need to be logged in to save experiment data', 'error');
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare input data
      const inputData = {
        voltage,
        resistance,
        components,
        connections
      };
      
      // Prepare output data
      const outputData = {
        current,
        power,
        circuitComplete,
        measurements
      };
      
      const response = await saveExperimentResults(user.id, experimentId, inputData, outputData);
      
      if (response.success) {
        showNotification('Experiment data saved successfully');
        loadExperimentResults();
      }
    } catch (error) {
      showNotification('Failed to save experiment data', 'error');
      console.error('Error saving experiment data:', error);
    } finally {
      setSaving(false);
    }
  };

  const loadSelectedResult = () => {
    if (!selectedResult) {
      showNotification('No experiment result selected to load', 'error');
      return;
    }
    
    try {
      const result = savedResults.find(r => r.id === selectedResult);
      if (result) {
        onLoadSavedExperiment(result);
        showNotification('Experiment loaded successfully');
      }
    } catch (error) {
      showNotification('Failed to load experiment result', 'error');
      console.error('Error loading experiment result:', error);
    }
  };

  return (
    <div className="experiment-data-container">
      <h2>Experiment Data & Notes</h2>
      
      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="experiment-data-grid">
        <div className="notes-section">
          <h3>Lab Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Take notes about your observations and conclusions from the Ohm's Law experiment..."
            disabled={loading || !user}
          ></textarea>
          <button 
            onClick={saveNotes}
            disabled={saving || loading || !user}
            className="save-button"
          >
            {saving ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
        
        <div className="saved-experiments-section">
          <h3>Saved Experiments</h3>
          <div className="buttons-row">
            <button
              onClick={saveCurrentExperiment}
              disabled={saving || !user}
              className="save-button"
            >
              {saving ? 'Saving...' : 'Save Current Circuit'}
            </button>
            
            <button
              onClick={loadExperimentResults}
              disabled={loading || !user}
              className="load-button"
            >
              {loading ? 'Loading...' : 'Load Saved Circuits'}
            </button>
          </div>
          
          {savedResults.length > 0 && (
            <div className="saved-results">
              <select
                value={selectedResult || ''}
                onChange={(e) => setSelectedResult(e.target.value)}
                className="results-select"
              >
                <option value="">-- Select a saved experiment --</option>
                {savedResults.map(result => (
                  <option key={result.id} value={result.id}>
                    {new Date(result.createdAt).toLocaleString()} - {result.input.voltage}V, {result.input.resistance}Ω
                  </option>
                ))}
              </select>
              
              <button
                onClick={loadSelectedResult}
                disabled={!selectedResult}
                className="load-button"
              >
                Load Selected Circuit
              </button>
            </div>
          )}
        </div>
      </div>
      
      {!user && (
        <div className="login-prompt">
          Please login to save and load experiment data.
        </div>
      )}
    </div>
  );
};

export default ExperimentData;
