import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserCircle, Plus, Search, Users, MessageCircle } from 'lucide-react';
import ResponsiveHeader from '../shared-components/Header';
import Footer from '../shared-components/Footer';
import { UserContext } from '../hooks/userContext';
import { getJoinedGroups } from '../../services/groupService';

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState(null);
  const { isLoggedIn, user, isAdmin } = useContext(UserContext);
  
  useEffect(() => {
    if (isLoggedIn && user) {
      fetchGroups();
    }
  }, [isLoggedIn, user]);
  
  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const response = await getJoinedGroups(user.id);
      setGroups(response.groups || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      setError('Failed to load your groups. Please try again later.');
      setIsLoading(false);
    }
  };
  
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 pb-12">
      <ResponsiveHeader isConnected={isConnected} />
      
      <main className="pt-24 container mx-auto px-4 mb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Groups</h1>
            <p className="text-gray-400">Join groups to collaborate with other students</p>
          </div>
          
          {isAdmin && (
            <Link 
              to="/createGroup" 
              className="mt-4 md:mt-0 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
            >
              <Plus className="h-5 w-5 mr-1" />
              Create Group
            </Link>
          )}
        </div>
        
        {/* Search */}
        <div className="mb-8 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800/50 text-gray-300 pl-10 pr-4 py-3 rounded-xl border border-gray-700/50 w-full focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            />
          </div>
        </div>
        
        {/* Groups List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700/50">
            <Users className="h-12 w-12 mx-auto text-gray-500 mb-3" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">No groups found</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              {searchQuery ? "No groups match your search criteria" : "There are no groups available at the moment"}
            </p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

const GroupCard = ({ group }) => {
  // Add count for display if available
  const memberCount = group.members?.length || 0;
  
  return (
    <Link
      to={`/groups/${group.id}`}
      className="block bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden transition-all duration-300 hover:border-teal-500/40 hover:bg-gray-800/60 hover:shadow-lg hover:shadow-teal-500/10"
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center mb-3">
            <div className="h-10 w-10 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center mr-3">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-medium text-white">{group.name}</h3>
          </div>
          
          {group.isPrivate && (
            <span className="bg-gray-700/50 text-gray-400 text-xs px-2 py-1 rounded">Private</span>
          )}
        </div>
        
        <p className="text-gray-400 text-sm line-clamp-2 mb-4">{group.description}</p>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/50">
          <div className="flex items-center text-sm text-gray-400">
            <Users className="h-4 w-4 mr-1" />
            <span>{memberCount} members</span>
          </div>
          
          {group.hasUnreadMessages && (
            <div className="flex items-center text-teal-400">
              <MessageCircle className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">New messages</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default GroupsPage;