import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../../hooks/userContext';
import { 
  saveExperimentNotes, 
  getExperimentNotes, 
  saveExperimentResults, 
  getExperimentResults 
} from '../../../../services/experimentService';

const ExperimentData = ({ 
  selectedAcid,
  selectedBase,
  concentration,
  volume,
  reactionComplete,
  measurements,
  onLoadSavedExperiment,
  experimentId = 'titration-experiment'
}) => {
  const { user } = useContext(UserContext);
  const [notes, setNotes] = useState('');
  const [noteId, setNoteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedResults, setSavedResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Load notes when component mounts
  useEffect(() => {
    if (user) {
      loadNotes();
      loadExperimentResults();
    }
  }, [user]);

  const showStatus = (message, isError = false) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(''), 3000);
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
      showStatus('You need to be logged in to save notes', true);
      return;
    }
    
    try {
      setSaving(true);
      const response = await saveExperimentNotes(user.id, experimentId, notes, noteId);
      if (response.success) {
        setNoteId(response.noteId);
        showStatus('Notes saved successfully');
      }
    } catch (error) {
      showStatus('Failed to save notes', true);
      console.error('Error saving notes:', error);
    } finally {
      setSaving(false);
    }
  };

  const loadExperimentResults = async () => {
    if (!user) {
      showStatus('You need to be logged in to load experiment results', true);
      return;
    }
    
    try {
      setLoading(true);
      const response = await getExperimentResults(user.id, experimentId);
      if (response.success) {
        setSavedResults(response.results || []);
      }
    } catch (error) {
      showStatus('Failed to load experiment results', true);
      console.error('Error loading experiment results:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentExperiment = async () => {
    if (!user) {
      showStatus('You need to be logged in to save experiment data', true);
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare input data
      const inputData = {
        selectedAcid,
        selectedBase,
        concentration
      };
      
      // Prepare output data
      const outputData = {
        volume,
        reactionComplete,
        measurements
      };
      
      const response = await saveExperimentResults(user.id, experimentId, inputData, outputData);
      
      if (response.success) {
        showStatus('Experiment data saved successfully');
        loadExperimentResults();
      }
    } catch (error) {
      showStatus('Failed to save experiment data', true);
      console.error('Error saving experiment data:', error);
    } finally {
      setSaving(false);
    }
  };

  const loadSelectedResult = () => {
    if (!selectedResult) {
      showStatus('No experiment result selected to load', true);
      return;
    }
    
    try {
      const result = savedResults.find(r => r.id === selectedResult);
      if (result) {
        onLoadSavedExperiment(result);
        showStatus('Experiment loaded successfully');
      }
    } catch (error) {
      showStatus('Failed to load experiment result', true);
      console.error('Error loading experiment result:', error);
    }
  };

  return (
    <div className="experiment-data-section">
      <h2>Experiment Data & Notes</h2>
      
      {statusMessage && (
        <div className="status-message">
          {statusMessage}
        </div>
      )}
      
      <div className="experiment-data-layout">
        <div className="notes-section">
          <h3>Lab Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Take notes about your titration experiment, observations, and conclusions..."
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
          <h3>Experiment Data</h3>
          
          <div className="experiment-buttons">
            <button
              onClick={saveCurrentExperiment}
              disabled={saving || !user}
              className="save-button"
            >
              {saving ? 'Saving...' : 'Save Current Experiment'}
            </button>
            
            <button
              onClick={loadExperimentResults}
              disabled={loading || !user}
              className="load-button"
            >
              {loading ? 'Loading...' : 'Load Saved Experiments'}
            </button>
          </div>
          
          {savedResults.length > 0 && (
            <div className="saved-results">
              <select
                value={selectedResult || ''}
                onChange={(e) => setSelectedResult(e.target.value)}
              >
                <option value="">-- Select a saved experiment --</option>
                {savedResults.map(result => (
                  <option key={result.id} value={result.id}>
                    {new Date(result.createdAt).toLocaleString()} - {result.input.selectedAcid} & {result.input.selectedBase}
                  </option>
                ))}
              </select>
              
              <button
                onClick={loadSelectedResult}
                disabled={!selectedResult}
                className="load-button"
              >
                Load Selected Experiment
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
