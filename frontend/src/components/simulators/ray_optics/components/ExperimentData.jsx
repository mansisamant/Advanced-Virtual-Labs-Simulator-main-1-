import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../../hooks/userContext';
import { 
  saveExperimentNotes, 
  getExperimentNotes, 
  saveExperimentResults, 
  getExperimentResults 
} from '../../../../services/experimentService';

const ExperimentData = ({ 
  elementType, 
  focalLength, 
  objectDistance, 
  imageProps,
  onLoadSavedExperiment,
  experimentId = 'ray-optics' 
}) => {
  const { user } = useContext(UserContext);
  const [notes, setNotes] = useState('');
  const [noteId, setNoteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedResults, setSavedResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Load notes when component mounts
  useEffect(() => {
    if (user) {
      loadNotes();
      loadExperimentResults();
    }
  }, [user]);

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
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
      showMessage('You need to be logged in to save notes', 'error');
      return;
    }
    
    try {
      setSaving(true);
      const response = await saveExperimentNotes(user.id, experimentId, notes, noteId);
      if (response.success) {
        setNoteId(response.noteId);
        showMessage('Notes saved successfully', 'success');
      }
    } catch (error) {
      showMessage('Failed to save notes', 'error');
      console.error('Error saving notes:', error);
    } finally {
      setSaving(false);
    }
  };

  const loadExperimentResults = async () => {
    if (!user) {
      showMessage('You need to be logged in to load experiment results', 'error');
      return;
    }
    
    try {
      setLoading(true);
      const response = await getExperimentResults(user.id, experimentId);
      if (response.success) {
        setSavedResults(response.results || []);
      }
    } catch (error) {
      showMessage('Failed to load experiment results', 'error');
      console.error('Error loading experiment results:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentExperiment = async () => {
    if (!user) {
      showMessage('You need to be logged in to save experiment data', 'error');
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare input data
      const inputData = {
        elementType,
        focalLength,
        objectDistance
      };
      
      // Prepare output data
      const outputData = {
        imageProperties: imageProps
      };
      
      const response = await saveExperimentResults(user.id, experimentId, inputData, outputData);
      
      if (response.success) {
        showMessage('Experiment data saved successfully', 'success');
        loadExperimentResults();
      }
    } catch (error) {
      showMessage('Failed to save experiment data', 'error');
      console.error('Error saving experiment data:', error);
    } finally {
      setSaving(false);
    }
  };

  const loadSelectedResult = () => {
    if (!selectedResult) {
      showMessage('No experiment result selected to load', 'error');
      return;
    }
    
    try {
      const result = savedResults.find(r => r.id === selectedResult);
      if (result) {
        onLoadSavedExperiment(result);
        showMessage('Experiment loaded successfully', 'success');
      }
    } catch (error) {
      showMessage('Failed to load experiment result', 'error');
      console.error('Error loading experiment result:', error);
    }
  };

  return (
    <div className="experiment-data-panel">
      <h3 className="experiment-data-title">Experiment Data & Notes</h3>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="experiment-data-content">
        <div className="notes-section">
          <h4>Lab Notes</h4>
          <textarea
            className="notes-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Take notes about the experiment, observations, and conclusions..."
            disabled={loading || !user}
          ></textarea>
          <div className="button-row">
            <button
              className="save-button"
              onClick={saveNotes}
              disabled={saving || loading || !user}
            >
              {saving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
        
        <div className="results-section">
          <h4>Saved Experiments</h4>
          <div className="button-row">
            <button
              className="save-button"
              onClick={saveCurrentExperiment}
              disabled={saving || !user}
            >
              {saving ? 'Saving...' : 'Save Current Setup'}
            </button>
            <button
              className="load-button"
              onClick={loadExperimentResults}
              disabled={loading || !user}
            >
              {loading ? 'Loading...' : 'Load Saved Setups'}
            </button>
          </div>
          
          {savedResults.length > 0 && (
            <div className="saved-results">
              <select
                className="results-select"
                value={selectedResult || ''}
                onChange={(e) => setSelectedResult(e.target.value)}
              >
                <option value="">-- Select a saved experiment --</option>
                {savedResults.map(result => (
                  <option key={result.id} value={result.id}>
                    {new Date(result.createdAt).toLocaleString()} - {result.input.elementType}
                  </option>
                ))}
              </select>
              <button
                className="load-button"
                onClick={loadSelectedResult}
                disabled={!selectedResult}
              >
                Load Selected Setup
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
