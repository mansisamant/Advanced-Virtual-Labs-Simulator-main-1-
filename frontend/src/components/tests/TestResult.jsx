import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../hooks/userContext';
import { 
  ArrowLeft, 
  Check, 
  X, 
  Clock, 
  Award, 
  FileText, 
  AlertCircle, 
  CheckCircle
} from 'lucide-react';
import { getTestResult } from '../../services/testService';
import ResponsiveHeader from '../shared-components/Header';
import Footer from '../shared-components/Footer';

const TestResult = () => {
  const { user } = useContext(UserContext);
  const { resultId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [showingCorrectAnswers, setShowingCorrectAnswers] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!resultId) {
      setError('Invalid result ID');
      setLoading(false);
      return;
    }
    
    const fetchResult = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Call getTestResult with only the resultId parameter
        const response = await getTestResult(resultId);
        
        if (response.success) {
          console.log('Successfully fetched test result:', response.result);
          setResult(response.result);
        } else {
          console.error('Failed to fetch test result:', response.message);
          setError(response.message || 'Failed to load test result');
        }
      } catch (error) {
        console.error('Error fetching test result:', error);
        setError('Failed to load test result. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResult();
  }, [resultId, user, navigate]);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get grade letter based on percentage
  const getGradeLetter = (percentage) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };
  
  // Get background color based on grade
  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 80) return 'bg-teal-500';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  // Toggle showing correct answers
  const toggleCorrectAnswers = () => {
    setShowingCorrectAnswers(!showingCorrectAnswers);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-teal-400">Loading results...</p>
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
  
  if (!result) {
    return null;
  }
  
  const totalCorrect = result.gradedAnswers.filter(a => a.isCorrect).length;
  const totalQuestions = result.gradedAnswers.length;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <ResponsiveHeader />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-6">
          <button
            onClick={() => navigate('/tests')}
            className="flex items-center text-gray-400 hover:text-teal-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tests
          </button>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-lg overflow-hidden">
          {/* Result Header */}
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  {result.test?.title || 'Test Results'}
                </h1>
                <p className="text-gray-400">{result.test?.description}</p>
              </div>
              
              <div className="flex items-center text-gray-400 text-sm">
                <Clock className="h-4 w-4 mr-2" />
                <span>Completed: {formatDate(result.submittedAt)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Grade Circle */}
              <div className="bg-gray-800 rounded-xl p-4 flex flex-col items-center justify-center">
                <div className="relative w-24 h-24 mb-2">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#444"
                      strokeWidth="2"
                      strokeDasharray="100, 100"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={getGradeColor(result.percentage).replace('bg-', '#').replace('500', '400')}
                      strokeWidth="2"
                      strokeDasharray={`${result.percentage}, 100`}
                    />
                    <text x="18" y="20.5" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                      {result.percentage}%
                    </text>
                  </svg>
                  <div className={`absolute top-0 right-0 ${getGradeColor(result.percentage)} text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm`}>
                    {getGradeLetter(result.percentage)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-white font-medium">Final Grade</div>
                  <div className="text-gray-400 text-sm">{result.score} out of {result.totalPoints} points</div>
                </div>
              </div>
              
              {/* Question Stats */}
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="text-white font-medium mb-3">Question Statistics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-400">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                      <span>Correct</span>
                    </div>
                    <span className="text-white">{totalCorrect}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-400">
                      <X className="h-4 w-4 mr-2 text-red-400" />
                      <span>Incorrect</span>
                    </div>
                    <span className="text-white">{totalQuestions - totalCorrect}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-400">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>Total Questions</span>
                    </div>
                    <span className="text-white">{totalQuestions}</span>
                  </div>
                </div>
              </div>
              
              {/* Accuracy */}
              <div className="bg-gray-800 rounded-xl p-4 flex flex-col justify-center">
                <h3 className="text-white font-medium mb-3">Accuracy</h3>
                <div className="flex-grow flex items-center justify-center">
                  <div className="w-full bg-gray-700 rounded-full h-4">
                    <div 
                      className={`${getGradeColor(result.percentage)} rounded-full h-4`} 
                      style={{width: `${totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0}%`}}
                    ></div>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <span className="text-white font-medium">
                    {totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0}% accuracy
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Question Review */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium text-white">Question Review</h3>
              <div>
                <button
                  onClick={toggleCorrectAnswers}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    showingCorrectAnswers 
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                  }`}
                >
                  {showingCorrectAnswers ? 'Hide Correct Answers' : 'Show Correct Answers'}
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              {result.gradedAnswers.map((answer, index) => (
                <div key={index} className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="p-5 border-b border-gray-700/50">
                    <div className="flex justify-between items-start">
                      <h4 className="text-white font-medium text-lg">
                        Question {index + 1}
                      </h4>
                      <div className={`flex items-center px-2 py-1 rounded text-sm font-medium ${
                        answer.isCorrect 
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {answer.isCorrect ? (
                          <>
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Correct
                          </>
                        ) : (
                          <>
                            <X className="h-3.5 w-3.5 mr-1" />
                            Incorrect
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-300 mt-2">{answer.question}</p>
                  </div>
                  
                  <div className="p-5">
                    <div className="space-y-2">
                      {result.test?.questions && result.test.questions[index]?.options ? (
                        // Map through options when they exist
                        result.test.questions[index].options.map((option, optIndex) => {
                          const isUserAnswer = option === answer.userAnswer;
                          const isCorrectAnswer = option === answer.correctAnswer;
                          
                          let optionClass = 'border-gray-700 bg-gray-800/30 text-gray-400';
                          
                          if (showingCorrectAnswers && isCorrectAnswer) {
                            optionClass = 'border-green-500 bg-green-500/10 text-green-300';
                          } else if (isUserAnswer) {
                            optionClass = isCorrectAnswer
                              ? 'border-green-500 bg-green-500/10 text-green-300'
                              : 'border-red-500 bg-red-500/10 text-red-300';
                          }
                          
                          return (
                            <div 
                              key={optIndex}
                              className={`p-3 border rounded-lg flex items-center ${optionClass}`}
                            >
                              <div className="mr-3">
                                {showingCorrectAnswers && isCorrectAnswer && (
                                  <CheckCircle className="h-5 w-5 text-green-400" />
                                )}
                                {isUserAnswer && !isCorrectAnswer && (
                                  <X className="h-5 w-5 text-red-400" />
                                )}
                                {!isUserAnswer && !isCorrectAnswer && !showingCorrectAnswers && (
                                  <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                                )}
                                {isUserAnswer && isCorrectAnswer && (
                                  <CheckCircle className="h-5 w-5 text-green-400" />
                                )}
                              </div>
                              <span>{option}</span>
                            </div>
                          );
                        })
                      ) : (
                        // Fallback when options are not available
                        <>
                          <div className={`p-3 border rounded-lg flex items-center ${
                            answer.isCorrect
                              ? 'border-green-500 bg-green-500/10 text-green-300'
                              : 'border-red-500 bg-red-500/10 text-red-300'
                          }`}>
                            <div className="mr-3">
                              {answer.isCorrect ? (
                                <CheckCircle className="h-5 w-5 text-green-400" />
                              ) : (
                                <X className="h-5 w-5 text-red-400" />
                              )}
                            </div>
                            <span>Your answer: {answer.userAnswer || 'No answer provided'}</span>
                          </div>
                          
                          {showingCorrectAnswers && !answer.isCorrect && (
                            <div className="p-3 border rounded-lg flex items-center border-green-500 bg-green-500/10 text-green-300">
                              <div className="mr-3">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                              </div>
                              <span>Correct answer: {answer.correctAnswer}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-gray-500">Points: </span>
                        <span className="text-white font-medium">
                          {answer.earnedPoints} / {answer.points}
                        </span>
                      </div>
                      {answer.explanation && (
                        <div className="text-sm text-teal-400">
                          {/* Show explanation feature could be added here */}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TestResult;
