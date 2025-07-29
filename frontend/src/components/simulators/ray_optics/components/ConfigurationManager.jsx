import React, { useState, useEffect } from 'react';
import './ConfigurationManager.css';

// Preset configurations - common ray optics examples
const PRESET_CONFIGURATIONS = [
  {
    id: 'preset-1',
    name: 'Convex Lens - Real Image',
    elementType: 'convexLens',
    focalLength: 10,
    objectDistance: 20,
    description: 'Object beyond 2F creates a real, inverted, smaller image between F and 2F'
  },
  {
    id: 'preset-2',
    name: 'Convex Lens - Virtual Image',
    elementType: 'convexLens',
    focalLength: 15,
    objectDistance: 10,
    description: 'Object between F and lens creates a virtual, upright, magnified image'
  },
  {
    id: 'preset-3',
    name: 'Concave Mirror - Real Image',
    elementType: 'concaveMirror',
    focalLength: 15,
    objectDistance: 25,
    description: 'Object beyond C creates a real, inverted, reduced image between F and C'
  },
  {
    id: 'preset-4',
    name: 'Concave Mirror - Virtual Image',
    elementType: 'concaveMirror',
    focalLength: 15,
    objectDistance: 10,
    description: 'Object between F and mirror creates a virtual, upright, magnified image'
  },
  {
    id: 'preset-5',
    name: 'Convex Mirror - Virtual Image',
    elementType: 'convexMirror',
    focalLength: 15,
    objectDistance: 25,
    description: 'Object in front of convex mirror creates a virtual, upright, reduced image'
  }
];

/**
 * ConfigurationManager component for saving, loading, and sharing optical configurations
 */
const ConfigurationManager = ({ 
  elementType, 
  focalLength, 
  objectDistance, 
  onLoadConfiguration 
}) => {
  const [savedConfigs, setSavedConfigs] = useState([]);
  const [configName, setConfigName] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTab, setActiveTab] = useState('saved');
  
  // Load saved configurations from localStorage on component mount
  useEffect(() => {
    const storedConfigs = localStorage.getItem('opticSimulatorConfigs');
    if (storedConfigs) {
      setSavedConfigs(JSON.parse(storedConfigs));
    }
  }, []);
  
  // Save configurations to localStorage when they change
  useEffect(() => {
    localStorage.setItem('opticSimulatorConfigs', JSON.stringify(savedConfigs));
  }, [savedConfigs]);
  
  // Handle saving the current configuration
  const handleSaveConfig = () => {
    if (!configName.trim()) {
      alert('Please enter a name for your configuration');
      return;
    }
    
    const newConfig = {
      id: Date.now(),
      name: configName,
      elementType,
      focalLength,
      objectDistance,
      dateCreated: new Date().toISOString()
    };
    
    setSavedConfigs([...savedConfigs, newConfig]);
    setConfigName('');
  };
  
  // Handle deleting a saved configuration
  const handleDeleteConfig = (id) => {
    setSavedConfigs(savedConfigs.filter(config => config.id !== id));
  };
  
  // Handle loading a saved configuration
  const handleLoadConfig = (config) => {
    if (onLoadConfiguration) {
      onLoadConfiguration({
        elementType: config.elementType,
        focalLength: config.focalLength,
        objectDistance: config.objectDistance
      });
    }
  };
  
  // Generate a shareable URL for the current configuration
  const handleShareConfig = () => {
    // Create URL parameters from current configuration
    const params = new URLSearchParams({
      type: elementType,
      focal: focalLength.toString(),
      object: objectDistance.toString()
    });
    
    // Generate a shareable URL
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    setShareUrl(url);
    setShowShareModal(true);
  };
  
  // Copy the share URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        alert('URL copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy URL: ', err);
      });
  };
    return (
    <div className="config-manager">
      {activeTab === 'saved' && (
        <div className="save-section">
          <input
            type="text"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            placeholder="Configuration name"
            className="config-input"
          />
          <button onClick={handleSaveConfig} className="config-button save-btn">
            Save
          </button>
          <button onClick={handleShareConfig} className="config-button share-btn">
            Share
          </button>
        </div>
      )}
      
      <div className="config-tabs">
        <button 
          className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`} 
          onClick={() => setActiveTab('saved')}
        >
          My Configurations
        </button>
        <button 
          className={`tab-btn ${activeTab === 'presets' ? 'active' : ''}`} 
          onClick={() => setActiveTab('presets')}
        >
          Example Scenarios
        </button>
      </div>
      
      {activeTab === 'saved' && (
        <div className="saved-configs">
          {savedConfigs.length > 0 ? (
            <div className="config-list">
              {savedConfigs.map(config => (
                <div className="config-item" key={config.id}>
                  <div className="config-details">
                    <h4>{config.name}</h4>
                    <p>
                      {config.elementType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
                      | f={config.focalLength}cm | u={config.objectDistance}cm
                    </p>
                  </div>
                  <div className="config-actions">
                    <button 
                      onClick={() => handleLoadConfig(config)} 
                      className="config-action-btn load-btn"
                      title="Load Configuration"
                    >
                      Load
                    </button>
                    <button 
                      onClick={() => handleDeleteConfig(config.id)} 
                      className="config-action-btn delete-btn"
                      title="Delete Configuration"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>You haven't saved any configurations yet.</p>
              <p>Set up the ray diagram as you like and click "Save" to store your configurations.</p>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'presets' && (
        <div className="preset-configs">
          <div className="config-list">
            {PRESET_CONFIGURATIONS.map(preset => (
              <div className="config-item preset-item" key={preset.id}>
                <div className="config-details">
                  <h4>{preset.name}</h4>
                  <p>
                    {preset.elementType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
                    | f={preset.focalLength}cm | u={preset.objectDistance}cm
                  </p>
                  <p className="preset-description">{preset.description}</p>
                </div>
                <div className="config-actions">
                  <button 
                    onClick={() => handleLoadConfig(preset)} 
                    className="config-action-btn load-btn"
                    title="Load Configuration"
                  >
                    Load
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {showShareModal && (
        <div className="share-modal-backdrop">
          <div className="share-modal">
            <h3>Share Configuration</h3>
            <p>Share this URL with others to let them view your configuration:</p>
            <div className="share-url-container">
              <input 
                type="text" 
                value={shareUrl} 
                readOnly 
                className="share-url-input"
              />
              <button onClick={copyToClipboard} className="copy-btn">
                Copy
              </button>
            </div>
            <button 
              onClick={() => setShowShareModal(false)} 
              className="close-modal-btn"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationManager;
