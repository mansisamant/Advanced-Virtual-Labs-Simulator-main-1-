import React, { useState, useEffect, useContext } from 'react';
import { 
  saveExperimentNotes, 
  getExperimentNotes, 
  saveExperimentResults, 
  getExperimentResults 
} from '../../../../services/experimentService';
import { UserContext } from '../../../hooks/userContext';

const ExperimentData = ({ 
  cpu, 
  program, 
  logs, 
  addLog,
  experimentId = '8085-microprocessor',
  onLoadSavedExperiment  // New prop to handle loading saved experiment data
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
      addLog('You need to be logged in to save notes', 'warning');
      return;
    }
    
    try {
      setSaving(true);
      const response = await saveExperimentNotes(user.id, experimentId, notes, noteId);
      if (response.success) {
        setNoteId(response.noteId);
        addLog('Notes saved successfully', 'success');
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
      addLog('You need to be logged in to load experiment results', 'warning');
      return;
    }
    
    try {
      setLoading(true);
      const response = await getExperimentResults(user.id, experimentId);
      if (response.success) {
        setSavedResults(response.results || []);
        if (response.results.length > 0) {
          addLog(`Loaded ${response.results.length} saved experiment results`, 'info');
        } else {
          addLog('No saved experiment results found', 'info');
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
      addLog('You need to be logged in to save experiment data', 'warning');
      return;
    }
    
    if (program.length === 0) {
      addLog('No program loaded to save', 'warning');
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare input data (program)
      const programData = program.map(instr => ({
        address: instr.address,
        raw: instr.raw,
        mnemonic: instr.mnemonic,
        operands: instr.operands,
        bytes: instr.bytes
      }));
      
      // Prepare output data (CPU state, memory, logs)
      const outputData = {
        registers: { ...cpu.registers },
        flags: { ...cpu.flags },
        memory: cpu.getMemory(0x0000, 0x100), // Get first 256 bytes of memory
        logs: logs.slice(-20) // Last 20 logs
      };
      
      const response = await saveExperimentResults(user.id, experimentId, { program: programData }, outputData);
      
      if (response.success) {
        addLog('Experiment data saved successfully', 'success');
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
      addLog('No experiment result selected to load', 'warning');
      return;
    }
    
    try {
      // Find the selected result from saved results
      const result = savedResults.find(r => r.id === selectedResult);
      if (result) {
        addLog(`Loading experiment result from ${new Date(result.createdAt).toLocaleString()}`, 'info');
        
        // Call the parent component's function to load the saved experiment
        onLoadSavedExperiment(result);
        
        addLog(`Successfully loaded experiment with ${result.input.program?.length || 0} instructions`, 'success');
      }
    } catch (error) {
      addLog('Failed to load experiment result', 'error');
      console.error('Error loading experiment result:', error);
    }
  };

  return (
    <div className="experiment-data">
      <div className="experiment-notes">
        <h3 className="section-title">Lab Notes</h3>
        <textarea
          className="notes-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Take notes about your experiment here..."
          disabled={loading || !user}
        />
        <div className="notes-controls">
          <button 
            className="btn btn-primary" 
            onClick={saveNotes} 
            disabled={saving || loading || !user}
          >
            {saving ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </div>
      
      <div className="experiment-results">
        <h3 className="section-title">Experiment Data</h3>
        <div className="results-controls">
          <button 
            className="btn btn-primary" 
            onClick={saveCurrentExperiment} 
            disabled={saving || !user}
          >
            {saving ? 'Saving...' : 'Save Current Experiment'}
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={loadExperimentResults} 
            disabled={loading || !user}
          >
            {loading ? 'Loading...' : 'Load Saved Experiments'}
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
                  {new Date(result.createdAt).toLocaleString()} - {result.input.program?.length || 0} instructions
                </option>
              ))}
            </select>
            <button 
              className="btn btn-secondary" 
              onClick={loadSelectedResult} 
              disabled={!selectedResult}
            >
              Load Selected Experiment
            </button>
          </div>
        )}
      </div>
      
      {!user && (
        <div className="login-prompt">
          <p>Please login to save and load experiment data.</p>
        </div>
      )}
    </div>
  );
};

export default ExperimentData;
