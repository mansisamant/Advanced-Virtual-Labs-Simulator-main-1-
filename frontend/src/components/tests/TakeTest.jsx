import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { UserContext } from '../hooks/userContext';
import { 
  Clock, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Flag, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { startTest, submitTestAnswers } from '../../services/testService';
import ResponsiveHeader from '../shared-components/Header';
import Footer from '../shared-components/Footer';

const TakeTest = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { testId } = useParams();
  const location = useLocation();
  const assignmentId = location.state?.assignmentId;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [test, setTest] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  
  const timerIntervalRef = useRef(null);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!testId || !assignmentId) {
      setError('Invalid test information. Please go back to the test list.');
      setLoading(false);
      return;
    }
    
    const initializeTest = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Start the test
        const response = await startTest(testId, user.id);
        
        if (response.success) {
          setTest(response.test);
          
          // Initialize user answers array
          const initialAnswers = response.test.questions.map(q => ({
            questionId: q.id,
            answer: null
          }));
          setUserAnswers(initialAnswers);
          
          // Set timer
          const timeLimit = response.test.timeLimit * 60; // convert to seconds
          setTimeRemaining(timeLimit);
          
          // Start timer
          startTimer(timeLimit);
        } else {
          setError(response.message || 'Failed to start test');
        }
      } catch (error) {
        console.error('Error starting test:', error);
        setError('Failed to load test. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    initializeTest();
    
    // Cleanup on unmount
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [testId, user, navigate, assignmentId]);
  
  const startTimer = (seconds) => {
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - submit the test
          clearInterval(timerIntervalRef.current);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours > 0 ? hours : null,
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].filter(Boolean).join(':');
  };
  
  const handleAnswerSelect = (answer) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex].answer = answer;
    setUserAnswers(updatedAnswers);
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleGoToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };
  
  const toggleFlagQuestion = (index) => {
    if (flaggedQuestions.includes(index)) {
      setFlaggedQuestions(flaggedQuestions.filter(i => i !== index));
    } else {
      setFlaggedQuestions([...flaggedQuestions, index]);
    }
  };
  
  const handleSubmitTest = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Stop the timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      
      // Filter out any null answers (optional)
      const validAnswers = userAnswers.filter(a => a.answer !== null);
      
      const response = await submitTestAnswers(testId, user.id, validAnswers);
      
      if (response.success) {
        // Redirect to the result page
        navigate(`/tests/result/${response.result.id}`);
      } else {
        setError(response.message || 'Failed to submit test');
        setIsSubmitting(false);
        setShowConfirmSubmit(false);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      setError('Failed to submit test. Please try again.');
      setIsSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };
  
  const getQuestionStatus = (index) => {
    const isAnswered = userAnswers[index]?.answer !== null;
    const isFlagged = flaggedQuestions.includes(index);
    const isCurrent = index === currentQuestionIndex;
    
    if (isCurrent) return 'current';
    if (isFlagged && isAnswered) return 'flagged-answered';
    if (isFlagged) return 'flagged';
    if (isAnswered) return 'answered';
    return 'unanswered';
  };
  
  const unansweredCount = userAnswers.filter(a => a.answer === null).length;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-teal-400">Loading test...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <ResponsiveHeader />
        
        <div className="container mx-auto px-4 pt-24 pb-12 flex flex-col items-center justify-center">
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg p-4 flex items-center mb-6 max-w-md">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
          
          <button
            onClick={() => navigate('/tests')}
            className="flex items-center bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tests
          </button>
        </div>
        
        <Footer />
      </div>
    );
  }
  
  if (!test) {
    return null;
  }
  
  const currentQuestion = test.questions[currentQuestionIndex];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <ResponsiveHeader minimized={true} />
      
      <main className="container mx-auto px-4 pt-16 pb-12">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-lg">
          {/* Test Header */}
          <div className="p-4 border-b border-gray-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">{test.title}</h1>
              <p className="text-gray-400 text-sm">{test.questions.length} questions</p>
            </div>
            
            <div className="flex items-center bg-gray-900/80 border border-gray-700 rounded-lg px-3 py-2 text-teal-400 font-mono">
              <Clock className="h-4 w-4 mr-2" />
              <span className={timeRemaining < 300 ? 'text-red-400 animate-pulse' : ''}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
          
          <div className="md:flex">
            {/* Question Navigation Sidebar */}
            <div className="w-full md:w-64 bg-gray-800/30 p-4 border-b md:border-b-0 md:border-r border-gray-700/50">
              <div className="text-sm font-medium text-gray-300 mb-3">Question Navigation</div>
              
              <div className="grid grid-cols-5 md:grid-cols-3 gap-2 mb-4">
                {test.questions.map((_, index) => {
                  const status = getQuestionStatus(index);
                  let bgColor = 'bg-gray-700 hover:bg-gray-600';
                  
                  if (status === 'current') bgColor = 'bg-teal-500 hover:bg-teal-600';
                  else if (status === 'flagged-answered') bgColor = 'bg-amber-500/80 hover:bg-amber-600';
                  else if (status === 'flagged') bgColor = 'bg-amber-500/50 hover:bg-amber-600';
                  else if (status === 'answered') bgColor = 'bg-gray-600 hover:bg-gray-500';
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleGoToQuestion(index)}
                      className={`w-full aspect-square flex items-center justify-center rounded ${bgColor} text-white transition-colors`}
                      title={`Question ${index + 1}${flaggedQuestions.includes(index) ? ' (Flagged)' : ''}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              
              <div className="text-sm text-gray-400 mb-4">
                <div className="flex items-center mb-1">
                  <div className="w-3 h-3 rounded-full bg-gray-600 mr-2"></div>
                  <span>Answered: {userAnswers.filter(a => a.answer !== null).length}</span>
                </div>
                <div className="flex items-center mb-1">
                  <div className="w-3 h-3 rounded-full bg-gray-700 mr-2"></div>
                  <span>Unanswered: {unansweredCount}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-amber-500/50 mr-2"></div>
                  <span>Flagged: {flaggedQuestions.length}</span>
                </div>
              </div>
              
              <button
                onClick={() => setShowConfirmSubmit(true)}
                disabled={isSubmitting}
                className="w-full py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Submit Test
                  </>
                )}
              </button>
            </div>
            
            {/* Question and Answers */}
            <div className="flex-grow p-6">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-300">
                    Question {currentQuestionIndex + 1} of {test.questions.length}
                  </h2>
                  
                  <button
                    onClick={() => toggleFlagQuestion(currentQuestionIndex)}
                    className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      flaggedQuestions.includes(currentQuestionIndex)
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                    }`}
                  >
                    <Flag className="h-3.5 w-3.5 mr-1.5" />
                    {flaggedQuestions.includes(currentQuestionIndex) ? 'Flagged' : 'Flag Question'}
                  </button>
                </div>
                
                <div className="bg-gray-800/80 border border-gray-700 rounded-lg p-4 mb-4">
                  <p className="text-white text-lg">{currentQuestion.text}</p>
                </div>
                
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <label 
                      key={index}
                      className={`block w-full p-4 border rounded-lg cursor-pointer transition-all ${
                        userAnswers[currentQuestionIndex]?.answer === option
                          ? 'border-teal-500 bg-teal-500/10 text-white'
                          : 'border-gray-700 bg-gray-800/30 text-gray-300 hover:bg-gray-800/60'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-5 h-5 mr-3 rounded-full flex items-center justify-center ${
                          userAnswers[currentQuestionIndex]?.answer === option
                            ? 'border-2 border-teal-400'
                            : 'border-2 border-gray-600'
                        }`}>
                          {userAnswers[currentQuestionIndex]?.answer === option && (
                            <div className="w-2.5 h-2.5 rounded-full bg-teal-400"></div>
                          )}
                        </div>
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={option}
                          checked={userAnswers[currentQuestionIndex]?.answer === option}
                          onChange={() => handleAnswerSelect(option)}
                          className="sr-only" // Hidden input for accessibility
                        />
                        <span>{option}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </button>
                
                <button
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === test.questions.length - 1}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="text-center mb-4">
              {unansweredCount > 0 ? (
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/20 text-amber-300 mb-2">
                  <AlertCircle className="h-6 w-6" />
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 text-green-300 mb-2">
                  <CheckCircle className="h-6 w-6" />
                </div>
              )}
              
              <h3 className="text-xl font-semibold text-white mb-1">
                {unansweredCount > 0 ? 'Unanswered Questions' : 'Submit Test'}
              </h3>
              
              <p className="text-gray-400">
                {unansweredCount > 0 
                  ? `You have ${unansweredCount} unanswered question${unansweredCount !== 1 ? 's' : ''}. Do you still want to submit?`
                  : 'Are you sure you want to submit your test? This action cannot be undone.'}
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitTest}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : 'Submit Test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeTest;
