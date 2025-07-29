import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../hooks/userContext';
import { 
  ClipboardList, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Play,
  CalendarClock,
  ChevronRight,
  Award
} from 'lucide-react';
import { getUserAssignedTests, getUserTestResults } from '../../services/testService';
import ResponsiveHeader from '../shared-components/Header';
import Footer from '../shared-components/Footer';

const TestList = () => {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('assigned');
  const [assignedTests, setAssignedTests] = useState([]);
  const [completedTests, setCompletedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);
  
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch assigned tests
      const assignedResponse = await getUserAssignedTests(user.id);
      
      if (assignedResponse.success) {
        // Filter out completed tests
        const assigned = assignedResponse.assignments.filter(
          assignment => assignment.status !== 'completed'
        );
        setAssignedTests(assigned);
      }
      
      // Fetch completed tests
      const resultsResponse = await getUserTestResults(user.id);
      
      if (resultsResponse.success) {
        setCompletedTests(resultsResponse.results);
      }
    } catch (error) {
      console.error('Error fetching user tests:', error);
      setError('Failed to load your tests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
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
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <ResponsiveHeader />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Tests</h1>
          <p className="text-gray-400">Take tests and view your results</p>
        </div>
        
        {/* Tabs */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden mb-8">
          <div className="flex border-b border-gray-700/50">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'assigned'
                  ? 'text-teal-400 border-b-2 border-teal-400'
                  : 'text-gray-400 hover:text-teal-300'
              }`}
            >
              <div className="flex items-center">
                <ClipboardList className="h-4 w-4 mr-2" />
                Assigned Tests
              </div>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'completed'
                  ? 'text-teal-400 border-b-2 border-teal-400'
                  : 'text-gray-400 hover:text-teal-300'
              }`}
            >
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Completed Tests
              </div>
            </button>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8 text-red-400">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            ) : activeTab === 'assigned' ? (
              <>
                {assignedTests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-900/20 text-teal-400 mb-4">
                      <ClipboardList className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">No Tests Assigned</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      You don't have any pending tests at the moment. Check back later or contact your instructor.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {assignedTests.map((assignment) => (
                      <div 
                        key={assignment.id}
                        className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-teal-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 flex flex-col"
                      >
                        <div className="p-5 flex-grow">
                          <h3 className="text-xl font-semibold text-white mb-2">{assignment.test?.title || 'Untitled Test'}</h3>
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{assignment.test?.description || 'No description available'}</p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-gray-400 text-sm">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>{assignment.test?.timeLimit || 60} minutes</span>
                            </div>
                            <div className="flex items-center text-gray-400 text-sm">
                              <CalendarClock className="h-4 w-4 mr-2" />
                              <span>Assigned: {formatDate(assignment.assignedAt)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-auto">
                          <Link
                            to={`/tests/take/${assignment.testId}`}
                            state={{ assignmentId: assignment.id }}
                            className="flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white py-3 font-medium transition-colors"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Test
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                {completedTests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-900/20 text-teal-400 mb-4">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">No Completed Tests</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      You haven't completed any tests yet. When you do, they'll appear here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {completedTests.map((result) => (
                      <div 
                        key={result.id}
                        className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-teal-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 flex flex-col"
                      >
                        <div className="p-5 flex-grow">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-xl font-semibold text-white">{result.test?.title || 'Untitled Test'}</h3>
                            <div className="flex items-center bg-teal-500/10 text-teal-300 px-2 py-1 rounded text-sm">
                              <Award className="h-3.5 w-3.5 mr-1" />
                              {result.percentage}%
                            </div>
                          </div>
                          
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{result.test?.description || 'No description available'}</p>
                          
                          <div className="text-sm text-gray-400">
                            <div className="mb-1">Score: {result.score} / {result.totalPoints}</div>
                            <div>Completed: {formatDate(result.submittedAt)}</div>
                          </div>
                        </div>
                        
                        <div className="mt-auto">
                          <Link
                            to={`/tests/result/${result.id}`}
                            className="flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white py-3 font-medium transition-colors"
                            aria-label={`View results for ${result.test?.title || 'test'}`}
                          >
                            View Results
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TestList;
