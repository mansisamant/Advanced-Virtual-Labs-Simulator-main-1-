import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../hooks/userContext';
import ResponsiveHeader from '../shared-components/Header';
import Footer from '../shared-components/Footer';
import { User, Mail, Edit, Save, X } from 'lucide-react';

const UserProfile = () => {
  const { user, isLoggedIn, updateUserContext } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Profile page loaded, user:", user);
    
    // Redirect if not logged in
    if (!isLoggedIn) {
      console.log("Not logged in, redirecting to login");
      navigate('/login');
      return;
    }

    // Set initial form data from user context
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
    }
  }, [user, isLoggedIn, navigate]);

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving profile:", profileData);
    
    // Update user context with new data
    updateUserContext({
      firstName: profileData.firstName,
      lastName: profileData.lastName
    });
    
    // Exit edit mode
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900">
        <ResponsiveHeader />
        <div className="pt-24 flex items-center justify-center h-screen">
          <div className="text-white">Loading user profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900">
      <ResponsiveHeader />
      
      <main className="pt-24 container mx-auto px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>
          
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
            <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
              <h2 className="text-xl font-medium text-white">Profile Information</h2>
              
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center"
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit Profile
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:space-x-4">
                  <div className="flex-1 mb-4 md:mb-0">
                    <label className="block text-sm font-medium text-gray-400 mb-1">First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white">
                        {profileData.firstName || 'Not set'}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white">
                        {profileData.lastName || 'Not set'}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <div className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white flex items-center">
                    <Mail className="h-4 w-4 text-teal-400 mr-2" />
                    {profileData.email}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>
              </div>
              
              {isEditing && (
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-600 rounded-lg text-white hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center"
                  >
                    <Save className="h-4 w-4 mr-1" /> Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserProfile;
