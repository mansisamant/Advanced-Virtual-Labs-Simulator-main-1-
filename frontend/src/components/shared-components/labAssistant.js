import { useState, useEffect } from 'react';
import VirtualLabAssistant from './VirtualLabAssistant';

// Global state for assistant visibility
let isAssistantVisible = false;
let subscribers = [];

// Subscribe to changes in assistant visibility
export const subscribeToAssistantState = (callback) => {
  subscribers.push(callback);
  return () => {
    subscribers = subscribers.filter(cb => cb !== callback);
  };
};

// Notify all subscribers about state changes
const notifySubscribers = (newState) => {
  subscribers.forEach(callback => callback(newState));
};

// Toggle assistant visibility
const handleAssistantToggle = (isOpen) => {
  console.log("Assistant is now:", isOpen ? "open" : "closed");
  isAssistantVisible = isOpen !== undefined ? isOpen : !isAssistantVisible;
  notifySubscribers(isAssistantVisible);
};

// Hook for components to use the assistant
export const useLabAssistant = () => {
  const [isVisible, setIsVisible] = useState(isAssistantVisible);

  useEffect(() => {
    const unsubscribe = subscribeToAssistantState((newState) => {
      setIsVisible(newState);
    });
    
    return unsubscribe;
  }, []);

  return {
    isVisible,
    toggle: handleAssistantToggle,
    show: () => handleAssistantToggle(true),
    hide: () => handleAssistantToggle(false)
  };
};

export default handleAssistantToggle;