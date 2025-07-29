import React from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

/**
 * TutorialCard Component
 * 
 * A step-by-step tutorial card with progress indicators and navigation controls.
 * 
 * @param {Array} steps - Array of tutorial steps with title and content properties
 * @param {Number} currentStep - Current active step (1-based index)
 * @param {Function} onNext - Function to call when clicking next
 * @param {Function} onPrev - Function to call when clicking previous
 */
const TutorialCard = ({ steps, currentStep, onNext, onPrev }) => {
  if (!steps || steps.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No tutorial steps available.
      </div>
    );
  }

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === steps.length;
  const activeStep = steps[currentStep - 1];

  return (
    <div className="tutorial-card">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex space-x-2">
          {steps.map((_, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            
            return (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  isActive
                    ? 'bg-indigo-600'
                    : isCompleted
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Tutorial Content */}
      <div className="text-center mb-8">
        <div className="mb-4 text-sm text-indigo-600 font-medium">
          Step {currentStep} of {steps.length}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {activeStep.title}
        </h3>
        <p className="text-gray-600 max-w-lg mx-auto">
          {activeStep.content}
        </p>
      </div>
      
      {/* Navigation Controls */}
      <div className="flex justify-center items-center space-x-4">
        <button
          onClick={onPrev}
          disabled={isFirstStep}
          className={`flex items-center px-4 py-2 rounded-md text-sm transition-colors ${
            isFirstStep
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </button>
        
        {isLastStep ? (
          <button
            onClick={onNext}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
          >
            <Check className="h-4 w-4 mr-2" />
            Complete
          </button>
        ) : (
          <button
            onClick={onNext}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        )}
      </div>
      
      {/* Additional Description or Image */}
      {activeStep.image && (
        <div className="mt-6 rounded-lg overflow-hidden border border-gray-200">
          <img 
            src={activeStep.image} 
            alt={`Tutorial step ${currentStep}`}
            className="w-full h-auto"
          />
        </div>
      )}
      
      {activeStep.description && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
          <p>{activeStep.description}</p>
        </div>
      )}
    </div>
  );
};

export default TutorialCard;