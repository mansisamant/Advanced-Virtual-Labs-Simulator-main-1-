import React, { useEffect, useState } from 'react';
import { X, Bot } from 'lucide-react';
import { useLabAssistant } from './labAssistant';
import VirtualLabAssistant from './VirtualLabAssistant';
import './animations.css';
import './scrollbar.css'; // Import the custom scrollbar styles

export default function ChatBotPopup() {
  const { isVisible, hide } = useLabAssistant();
  const [showWelcome, setShowWelcome] = useState(true);
  
  // Check if this is the first time opening the assistant
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenAssistantWelcome');
    setShowWelcome(!hasSeenWelcome && isVisible);
    
    if (isVisible && !hasSeenWelcome) {
      localStorage.setItem('hasSeenAssistantWelcome', 'true');
      
      // Hide welcome screen after 3 seconds
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Handle escape key to close the popup
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        hide();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [hide]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with click to close */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
        onClick={hide}
      />
      
      {/* Popup container with animation */}
      <div 
        className="relative bg-gray-900 border border-gray-700 rounded-lg shadow-2xl shadow-teal-500/10 w-full max-w-3xl h-[700px] max-h-[90vh] flex flex-col overflow-hidden animate-fadeScale"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-teal-400 animate-pulse" />
            <h3 className="text-lg font-semibold text-white">Lab Assistant</h3>
          </div>
          <button 
            onClick={hide}
            className="p-1 rounded-full hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Welcome Overlay */}
        {showWelcome && (
          <div className="absolute inset-0 z-10 bg-gradient-to-br from-teal-500 to-blue-600 flex flex-col items-center justify-center text-white p-8 animate-fadeIn">
            <Bot size={64} className="mb-6 animate-pulse-custom" />
            <h2 className="text-2xl font-bold mb-3 animate-slideUp">Welcome to Lab Assistant!</h2>
            <p className="text-center text-lg mb-4 animate-slideUp" style={{ animationDelay: '0.1s' }}>
              I'm here to help you with your virtual lab experiments.
            </p>
            <p className="text-center text-white/80 text-sm animate-slideUp" style={{ animationDelay: '0.2s' }}>
              Ask me questions about procedures, concepts, or get help with your experiments.
            </p>
          </div>
        )}
        
        {/* Virtual Lab Assistant Component */}
        <div className="flex-2 overflow-hidden">
          <VirtualLabAssistant />
        </div>
      </div>
    </div>
  );
}
