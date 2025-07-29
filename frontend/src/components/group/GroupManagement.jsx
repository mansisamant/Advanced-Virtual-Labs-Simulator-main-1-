import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../hooks/userContext';
import ResponsiveHeader from '../shared-components/Header';
import Footer from '../shared-components/Footer';
import { Shield, Users, Plus, Search, Edit, Trash2, ArrowLeft, User, AlertCircle, Eye } from 'lucide-react';
import { getAllGroups, deleteGroup } from '../../services/groupService';

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const { isAdmin, isLoggedIn, user } = useContext(UserContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if not admin or not logged in
    if (!isLoggedIn || !isAdmin) {
      navigate('/');
      return;
    }
    
    fetchGroups();
  }, [isAdmin, isLoggedIn, navigate]);
  
  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const response = await getAllGroups();
      setGroups(response.groups || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      setError('Failed to fetch groups. Please try again later.');
      setIsLoading(false);
    }
  };
  
  const handleDeleteGroup = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      try {
        await deleteGroup(groupId, user.id);
        setGroups(groups.filter(group => group.id !== groupId));
      } catch (error) {
        console.error('Failed to delete group:', error);
        setError('Failed to delete group. Please try again later.');
      }
    }
  };
  
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900">
      <ResponsiveHeader isConnected={true} />
      
      <main className="pt-24 container mx-auto px-4 pb-12">
        <div className="flex items-center mb-6">
          <Link to="/admin" className="text-gray-400 hover:text-teal-400 mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-teal-400 mr-2" />
            <h1 className="text-2xl font-bold text-white">Group Management</h1>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800/50 text-gray-300 pl-10 pr-4 py-2 rounded-lg border border-gray-700/50 w-full focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            />
          </div>
          
          <Link 
            to="/admin/groups/create" 
            className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors whitespace-nowrap"
          >
            <Plus className="h-5 w-5 mr-1" />
            Create Group
          </Link>
        </div>
        
        {/* Groups Table */}
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden shadow-lg shadow-black/10">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="animate-spin h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-gray-400">Loading groups...</p>
            </div>
          ) : filteredGroups.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900/50 text-left">
                    <th className="px-6 py-3 text-gray-300 font-medium text-sm">Name</th>
                    <th className="px-6 py-3 text-gray-300 font-medium text-sm">Type</th>
                    <th className="px-6 py-3 text-gray-300 font-medium text-sm">Members</th>
                    <th className="px-6 py-3 text-gray-300 font-medium text-sm">Created</th>
                    <th className="px-6 py-3 text-gray-300 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {filteredGroups.map((group) => (
                    <tr key={group.id} className="hover:bg-gray-700/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-white font-medium">{group.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {group.isPrivate ? (
                          <span className="bg-gray-700/50 text-gray-300 text-xs px-2 py-1 rounded">Private</span>
                        ) : (
                          <span className="bg-teal-500/20 text-teal-300 text-xs px-2 py-1 rounded">Public</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-gray-300">{group.memberCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-400 text-sm">
                          {new Date(group.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Link 
                            to={`/groups/${group.id}`}
                            className="p-1.5 rounded hover:bg-teal-500/10 text-gray-400 hover:text-teal-400 transition-colors"
                            title="View Group"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link 
                            to={`/admin/groups/edit/${group.id}`}
                            className="p-1.5 rounded hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 transition-colors"
                            title="Edit Group"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            className="p-1.5 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete Group"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-gray-500 mb-3" />
              <h3 className="text-xl font-medium text-gray-300 mb-1">No groups found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery ? "No groups match your search criteria" : "There are no groups available"}
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default GroupManagement;