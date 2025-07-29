import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../hooks/userContext';
import { 
  Users, 
  Beaker, 
  FileText, 
  ArrowUpRight, 
  ClipboardList,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllUsers } from '../../services/userService';
import { getAllTests, getAllTestResults } from '../../services/testService';
import { getAllGroups } from '../../services/groupService';
import { getRecentExperimentResults } from '../../services/experimentService';

const AdminDashboard = () => {
  const { user } = useContext(UserContext);
  const [stats, setStats] = useState({
    students: 0,
    experiments: 0,
    tests: 0,
    groups: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch students
        const studentsResponse = await getAllUsers();
        const students = studentsResponse.filter(user => user.role != 'admin');
        console.log('Fetched students:', students);
        
        // Fetch experiment count
        const experimentsResponse = 5;
        
        // Fetch test count
        const testsResponse = await getAllTests();
        console.log('Fetched tests:', testsResponse);
        
        // Fetch group count
        const groupsResponse = await getAllGroups(user.id);
        console.log('Fetched groups:', groupsResponse);
        
        // Set all stats
        setStats({
          students: students.length || 0,
          experiments: experimentsResponse || 0,
          tests: testsResponse.tests?.length || 0,
          groups: groupsResponse.groups?.length || 0
        });
        
        // Fetch recent activities - combine from multiple sources
        await fetchRecentActivities(students);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const fetchRecentActivities = async (students) => {
    try {
      // Create a map of user IDs to names for easier lookup
      const userMap = {};
      students.forEach(student => {
        userMap[student.id] = `${student.firstName || ''} ${student.lastName || ''}`.trim();
      });
      
      // 1. Fetch recent test results
      const testResultsResponse = await getAllTestResults();
      const testResults = testResultsResponse.success ? testResultsResponse.results : [];
      
      // 2. Fetch recent experiment results
      const experimentResultsResponse = await getRecentExperimentResults();
      const experimentResults = experimentResultsResponse.success ? experimentResultsResponse.results : [];
      
      // 3. Get recent groups (from the already fetched groups data)
      const groupsResponse = await getAllGroups(user.id);
      const groups = groupsResponse.groups || [];
      
      // Transform test results into activities
      const testActivities = testResults.slice(0, 5).map(result => ({
        id: result.id,
        type: 'test',
        name: result.test?.title || 'Untitled Test',
        student: userMap[result.userId] || 'Unknown Student',
        studentId: result.userId,
        date: result.submittedAt || new Date().toISOString(),
        score: `${result.percentage || 0}%`,
        details: result
      }));
      
      // Transform experiment results into activities
      const experimentActivities = experimentResults.slice(0, 5).map(result => ({
        id: result.id,
        type: 'experiment',
        name: result.experimentName || 'Lab Experiment',
        student: userMap[result.studentId] || 'Unknown Student',
        studentId: result.studentId,
        date: result.createdAt || new Date().toISOString(),
        details: result
      }));
      
      // Transform groups into activities (newest groups first)
      const groupActivities = groups
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 3)
        .map(group => ({
          id: group.id,
          type: 'group',
          name: group.name || 'Untitled Group',
          action: 'created',
          date: group.createdAt || new Date().toISOString(),
          details: group
        }));
      
      // Combine all activities, sort by date, and limit to 10
      const allActivities = [...testActivities, ...experimentActivities, ...groupActivities]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);
      
      setRecentActivities(allActivities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setRecentActivities([]);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Students</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.students}</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/students" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              View all students <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Experiments</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.experiments}</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <Beaker className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/experiments" className="text-sm text-green-600 hover:text-green-800 flex items-center">
              Manage experiments <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Active Tests</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.tests}</h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <ClipboardList className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/tests" className="text-sm text-purple-600 hover:text-purple-800 flex items-center">
              View all tests <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Student Groups</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.groups}</h3>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <UserCheck className="h-6 w-6 text-amber-500" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/groups" className="text-sm text-amber-600 hover:text-amber-800 flex items-center">
              Manage groups <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <div key={activity.id || index} className="px-6 py-4 flex items-start">
                <div className={`p-2 rounded-lg mr-4 ${
                  activity.type === 'test' 
                    ? 'bg-purple-50' 
                    : activity.type === 'experiment'
                      ? 'bg-green-50'
                      : 'bg-amber-50'
                }`}>
                  {activity.type === 'test' ? (
                    <ClipboardList className={`h-5 w-5 text-purple-500`} />
                  ) : activity.type === 'experiment' ? (
                    <Beaker className={`h-5 w-5 text-green-500`} />
                  ) : (
                    <UserCheck className={`h-5 w-5 text-amber-500`} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-800">
                      {activity.type !== 'group' ? `${activity.student} completed ` : ''}
                      {activity.name}
                    </h3>
                    <span className="text-xs text-gray-500">{formatDate(activity.date)}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {activity.type === 'test' 
                      ? `Scored ${activity.score} on the test`
                      : activity.type === 'experiment'
                        ? 'Completed the experiment'
                        : `Group was ${activity.action}`
                    }
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              No recent activity to display
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/admin/students" 
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Users className="h-5 w-5 text-blue-500 mr-3" />
            <span className="text-gray-700">Manage Students</span>
          </Link>
          
          <Link 
            to="/admin/tests" 
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ClipboardList className="h-5 w-5 text-purple-500 mr-3" />
            <span className="text-gray-700">Create Test</span>
          </Link>
          
          <Link 
            to="/admin/groups" 
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <UserCheck className="h-5 w-5 text-amber-500 mr-3" />
            <span className="text-gray-700">Create Group</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
