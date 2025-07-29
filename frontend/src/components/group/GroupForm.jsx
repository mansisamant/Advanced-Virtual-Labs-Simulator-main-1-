import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../hooks/userContext';
import ResponsiveHeader from '../shared-components/Header';
import Footer from '../shared-components/Footer';
import { Shield, Users, ArrowLeft, X, Plus, User, Save } from 'lucide-react';
import { getGroupDetails, createGroup, updateGroup } from '../../services/groupService';
import { getAllUsers } from '../../services/userService';

const GroupForm = () => {
  const { groupId } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
  });
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAdmin, isLoggedIn, user } = useContext(UserContext);
  const navigate = useNavigate();
  const isEditMode = !!groupId;
  
  useEffect(() => {
    // Redirect if not admin or not logged in
    if (!isLoggedIn || !isAdmin) {
      navigate('/');
      return;
    }
    
    fetchData();
  }, [groupId, isAdmin, isLoggedIn, navigate]);
  
  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Get all users from the system
      const usersData = await getAllUsers();
      console.log("Available users data:", usersData);
      
      // Make sure we're storing full user objects
      setAvailableUsers(usersData || []);
      
      if (isEditMode) {
        const groupResponse = await getGroupDetails(groupId);
        const group = groupResponse.group;
        
        setFormData({
          name: group.name,
          description: group.description || '',
          isPrivate: group.isPrivate || false,
        });
        
        // For editing mode, we need to get the full user objects for selected members
        if (group.members && group.members.length > 0) {
          // Convert member IDs to full user objects
          const memberUsers = [];
          for (const memberId of group.members) {
            const matchingUser = usersData.find(user => user.id === memberId);
            if (matchingUser) {
              memberUsers.push(matchingUser);
            }
          }
          console.log("Selected member users:", memberUsers);
          setSelectedUsers(memberUsers);
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load data. Please try again later.');
      setIsLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleUserSelect = (userId) => {
    // Find the full user object from available users
    const userToAdd = availableUsers.find(user => user.id === userId);
    console.log("Adding user:", userToAdd);
    
    if (userToAdd && !selectedUsers.some(u => u.id === userId)) {
      setSelectedUsers(prevUsers => [...prevUsers, userToAdd]);
    }
    setSearchQuery('');
  };
  
  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
    console.log("Removed user with ID:", userId, "Remaining users:", selectedUsers.length - 1);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      setError(null);
      
      // Extract just the IDs from the selected users
      const memberIds = selectedUsers.map(user => user.id);
      console.log("Submitting with member IDs:", memberIds);
      
      const payload = {
        ...formData,
        members: memberIds,
        creatorId: user.id,
        userId: user.id // Include userId for permissions check on update
      };
      
      console.log('Submitting form with payload:', payload);
      
      if (isEditMode) {
        const response = await updateGroup(groupId, payload);
        console.log('Update response:', response);
      } else {
        const response = await createGroup(payload);
        console.log('Create response:', response);
      }
      
      navigate('/admin/groups');
    } catch (error) {
      console.error('Failed to save group:', error);
      setError('Failed to save group: ' + (error.response?.data?.message || error.message || 'Unknown error'));
      setIsSaving(false);
    }
  };
  
  // Update the filtering logic to handle different user object structures
  const filteredUsers = searchQuery
    ? availableUsers.filter(user => {
        // Skip users that are already selected
        if (selectedUsers.some(u => u.id === user.id)) {
          return false;
        }
        
        // Check various user properties for matches
        const searchLower = searchQuery.toLowerCase();
        return (
          (user.firstName && user.firstName.toLowerCase().includes(searchLower)) ||
          (user.lastName && user.lastName.toLowerCase().includes(searchLower)) ||
          (user.email && user.email.toLowerCase().includes(searchLower)) ||
          (user.username && user.username.toLowerCase().includes(searchLower))
        );
      })
    : [];

  if (!isLoggedIn || !isAdmin) {
    return null; // Return null while redirecting
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900">
      <ResponsiveHeader isConnected={true} />
      
      <main className="pt-24 container mx-auto px-4 pb-12">
        <div className="flex items-center mb-6">
          <Link to="/admin/groups" className="text-gray-400 hover:text-teal-400 mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-teal-400 mr-2" />
            <h1 className="text-2xl font-bold text-white">
              {isEditMode ? 'Edit Group' : 'Create Group'}
            </h1>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden shadow-lg shadow-black/10">
            <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 px-6 py-4 border-b border-gray-700/50">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-teal-400 mr-2" />
                <h2 className="text-lg font-medium text-white">
                  {isEditMode ? 'Group Details' : 'New Group'}
                </h2>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-6 bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Group Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                      Group Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Enter group name"
                    />
                  </div>
                  
                  {/* Group Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Enter group description"
                    ></textarea>
                  </div>
                  
                  {/* Privacy Setting */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPrivate"
                      name="isPrivate"
                      checked={formData.isPrivate}
                      onChange={handleChange}
                      className="h-4 w-4 text-teal-500 border-gray-700 rounded bg-gray-900/50 focus:ring-teal-500"
                    />
                    <label htmlFor="isPrivate" className="ml-2 text-sm font-medium text-gray-300">
                      Private Group
                    </label>
                    <span className="ml-2 text-xs text-gray-400">
                      (Users must be explicitly added to private groups)
                    </span>
                  </div>
                </div>
                
                {/* User Management */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Group Members
                    </label>
                    
                    {/* User Search */}
                    <div className="relative mb-3">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search users to add..."
                        className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      {searchQuery && filteredUsers.length > 0 && (
                        <div className="absolute mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                          {filteredUsers.map(user => (
                            <div
                              key={user.id}
                              onClick={() => handleUserSelect(user.id)}
                              className="flex items-center px-4 py-2 hover:bg-gray-800 cursor-pointer"
                            >
                              <div className="h-8 w-8 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center mr-2">
                                {(user.firstName?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()}
                              </div>
                              <span className="text-gray-300">
                                {user.firstName && user.lastName 
                                  ? `${user.firstName} ${user.lastName}`
                                  : user.email || user.username || 'Unknown User'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {searchQuery && filteredUsers.length === 0 && (
                        <div className="absolute mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10 p-4 text-center">
                          <p className="text-gray-400 text-sm">No users found</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Selected Users */}
                    <div className="bg-gray-900/30 rounded-lg border border-gray-700/50 p-3 h-60 overflow-y-auto">
                      {selectedUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                          <Users className="h-8 w-8 text-gray-500 mb-2" />
                          <p className="text-gray-400 text-sm">No members added yet</p>
                          <p className="text-gray-500 text-xs mt-1">Search for users to add them to this group</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedUsers.map(user => (
                            <div key={user.id} className="flex justify-between items-center bg-gray-800/50 rounded-lg px-3 py-2">
                              <div className="flex items-center">
                                <div className="h-7 w-7 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center mr-2">
                                  {(user.firstName?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()}
                                </div>
                                <span className="text-gray-300 text-sm">
                                  {user.firstName && user.lastName 
                                    ? `${user.firstName} ${user.lastName}`
                                    : user.email || user.username || 'Unknown User'}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveUser(user.id)}
                                className="p-1 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="mt-8 flex justify-end space-x-3">
                <Link
                  to="/admin/groups"
                  className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`flex items-center px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors ${
                    isSaving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      {isEditMode ? 'Update Group' : 'Create Group'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default GroupForm;