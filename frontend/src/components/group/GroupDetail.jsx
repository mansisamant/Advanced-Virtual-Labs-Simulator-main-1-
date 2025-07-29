import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../hooks/userContext';
import ResponsiveHeader from '../shared-components/Header';
import Footer from '../shared-components/Footer';
import { 
  Users, 
  Send, 
  ArrowLeft, 
  MessageSquare, 
  LogOut, 
  UserPlus, 
  Search, 
  X 
} from 'lucide-react';
import { getGroupDetails, leaveGroup, getGroupMessages, sendGroupMessage, addMemberToGroup } from '../../services/groupService';
import { getUserDetails, getAllUsers } from '../../services/userService';

const GroupDetail = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [members, setMembers] = useState([]);
  const [nonMembers, setNonMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNonMembers, setFilteredNonMembers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [addingMember, setAddingMember] = useState(null);
  const [indexMissing, setIndexMissing] = useState(false);
  const messagesEndRef = useRef(null);
  const { user, isLoggedIn } = useContext(UserContext);
  const navigate = useNavigate();
  const messagesInterval = useRef(null);

  // Fetch group details
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: `/groups/${groupId}` } });
      return;
    }

    fetchGroupDetails();
    
    // Set up polling for new messages
    messagesInterval.current = setInterval(fetchMessages, 5000);
    
    return () => {
      // Clean up the interval when component unmounts
      if (messagesInterval.current) {
        clearInterval(messagesInterval.current);
      }
    };
  }, [groupId, isLoggedIn, navigate]);

  // Check if user is admin when group loads
  useEffect(() => {
    if (group && user) {
      // Default to not being an admin
      let adminStatus = false;
      
      // First check the adminId field (for backward compatibility)
      if (group.adminId === user.id) {
        adminStatus = true;
      }
      
      // Then check the admins array if it exists
      if (group.admins && Array.isArray(group.admins)) {
        for (const admin of group.admins) {
          if (admin === user.id) {
            adminStatus = true;
            console.log("User is admin (from admins array):", user.id);
            break;
          }
        }
      }
      
      console.log("Admin check result:", { 
        userId: user.id, 
        adminId: group.adminId,
        adminsArray: group.admins || [],
        isAdmin: adminStatus
      });
      
      setIsAdmin(adminStatus);
    }
  }, [group, user]);

  // Filter non-members when search term changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = nonMembers.filter(
        user => 
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredNonMembers(filtered);
    } else {
      setFilteredNonMembers(nonMembers);
    }
  }, [searchTerm, nonMembers]);

  // Fetch group details
  const fetchGroupDetails = async () => {
    try {
      setIsLoading(true);
      
      // Use Promise.all to fetch group details and messages in parallel
      const [groupRes, messagesRes] = await Promise.all([
        getGroupDetails(groupId),
        getGroupMessages(groupId)
      ]);
      
      if (groupRes.success && groupRes.group) {
        console.log("Group details:", groupRes.group);
        setGroup(groupRes.group);
        
        // Directly set admin status here, without depending on the effect
        // check admin status using array 
        const group = groupRes.group;
        let adminStatus = false;
        if (group.admins && Array.isArray(group.admins)) {
        for (const admin of group.admins) {
          if (admin === user.id) {
            adminStatus = true;
            console.log("User is admin (from admins array):", user.id);
            break;
          }
        }
      }
        console.log("Setting admin status:", adminStatus, "Group admin:", groupRes.group.adminId, "User ID:", user.id);
        setIsAdmin(adminStatus);
        
        if (groupRes.group.members && groupRes.group.members.length > 0) {
          const memberDetails = await Promise.all(
            groupRes.group.members.map(async (memberId) => {
              const userDetails = await getUserDetails(memberId);
              return { 
                id: memberId, 
                firstName: userDetails.user?.firstName || 'User',
                lastName: userDetails.user?.lastName || '',
                username: userDetails.user?.username || 'User',
                email: userDetails.user?.email || ''
              };
            })
          );
          setMembers(memberDetails);
          
          // Fetch non-members immediately after group details are loaded if user is admin
          if (adminStatus) {
            console.log("User is admin, fetching non-members");
            fetchNonMembers(groupRes.group.members);
          }
        }
      }
      
      if (messagesRes.success) {
        setMessages(messagesRes.messages || []);
        if (messagesRes.indexMissing) {
          setIndexMissing(true);
          console.warn("Firestore index is missing for message queries. Messages may not be properly ordered.");
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching group:', error);
      setError('Failed to load group data: ' + (error.message || 'Unknown error'));
      setIsLoading(false);
    }
  };
  
  // Fetch users who are not members of the group
  const fetchNonMembers = async (currentMembers) => {
    try {
      console.log("Fetching non-members, current members:", currentMembers);
      const allUsers = await getAllUsers();
      console.log("All users:", allUsers);
      
      // Filter out users who are already members
      const nonMemberUsers = allUsers.filter(user => 
        !currentMembers.includes(user.id) && user.role != 'admin'
      );
      console.log("Non-member users:", nonMemberUsers);
      
      setNonMembers(nonMemberUsers);
      setFilteredNonMembers(nonMemberUsers);
    } catch (error) {
      console.error('Error fetching non-members:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await getGroupMessages(groupId);
      if (response.success && response.messages) {
        setMessages(response.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };
  useEffect(() => {
    // Only scroll on initial load (once)
    if (messages.length > 0 && isLoading === false) {
      // Use a flag to ensure this only happens once
      const initialLoadElement = document.getElementById('messages-container');
      if (initialLoadElement && !initialLoadElement.dataset.initialScrollDone) {
        initialLoadElement.dataset.initialScrollDone = 'true';
        initialLoadElement.scrollTop = initialLoadElement.scrollHeight;
      }
    }
  }, [isLoading, messages.length]);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() && !isSending) {
      try {
        setIsSending(true);
        
        const messageData = {
          content: inputMessage.trim(),
          userId: user.id,
          username: user.firstName 
        };
        
        await sendGroupMessage(groupId, messageData);
        setInputMessage('');
        
        // Fetch new messages after sending
        const response = await getGroupMessages(groupId);
        if (response.success && response.messages) {
          setMessages(response.messages);
          
          // Manually scroll to bottom after sending a message
          const messagesContainer = document.getElementById('messages-container');
          if (messagesContainer) {
            // Use a short timeout to ensure the DOM has updated
            setTimeout(() => {
              messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 50);
          }
        }
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleLeaveGroup = async () => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      try {
        await leaveGroup(groupId, user.id);
        navigate('/groups');
      } catch (error) {
        console.error('Error leaving group:', error);
        setError('Failed to leave the group');
      }
    }
  };
  
  const toggleMembersList = () => {
    setShowMembers(!showMembers);
  };

  const toggleAddMembers = () => {
    console.log("Toggling add members mode, current state:", showAddMembers);
    setShowAddMembers(!showAddMembers);
    setShowMembers(true); // Make sure members sidebar is visible
    setSearchTerm(''); // Reset search term
  };
  
  const handleAddMember = async (userId) => {
    if (!isAdmin) return;
    
    try {
      setAddingMember(userId);
      
      const response = await addMemberToGroup(groupId, userId);
      
      if (response.success) {
        // Refresh group details to get updated members list
        await fetchGroupDetails();
        
        // Show success message or toast notification
        alert('Member added successfully');
      } else {
        alert(response.message || 'Failed to add member');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Failed to add member. Please try again.');
    } finally {
      setAddingMember(null);
    }
  };

  const renderMessage = (message) => {
    const isCurrentUser = message.userId === user.id;
    
    // Regular text message
    return (
      <div className={`max-w-[70%] ${isCurrentUser ? 'bg-teal-500/20 text-teal-100' : 'bg-gray-700/50 text-gray-200'} rounded-xl px-4 py-2`}>
        {!isCurrentUser && (
          <div className="text-xs font-medium text-teal-300 mb-1">
            {message.username}
          </div>
        )}
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <div className="text-xs mt-1 opacity-70 flex items-center justify-end">
          {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
        </div>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900">
        <ResponsiveHeader/>
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900">
        <ResponsiveHeader isConnected={true} />
        <div className="pt-24 container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-gray-300 mb-6">{error || "Group not found"}</p>
          <button 
            onClick={() => navigate('/groups')} 
            className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
          >
            Back to Groups
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900">
      <ResponsiveHeader isConnected={true} />
      
      <main className="pt-20 pb-4 container mx-auto px-4">
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden shadow-xl shadow-black/10">
          {/* Group Header */}
          <div className="bg-gray-900/50 border-b border-gray-700/50 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/groups')}
                className="mr-3 p-1.5 rounded-full hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-white">{group.name}</h1>
              <span className="ml-3 bg-teal-500/20 text-teal-300 text-xs px-2 py-0.5 rounded-full">
                {members.length} members
              </span>
              {isAdmin && (
                <span className="ml-3 bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded-full">
                  You are admin
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMembersList}
                className={`p-2 rounded-full hover:bg-gray-700/50 transition-colors ${
                  showMembers ? 'bg-teal-500/20 text-teal-300' : 'text-gray-400 hover:text-white'
                }`}
                title="View Members"
              >
                <Users className="h-5 w-5" />
              </button>
              
              {isAdmin && (
                <button
                  onClick={toggleAddMembers}
                  className={`p-2 rounded-full hover:bg-gray-700/50 transition-colors ${
                    showAddMembers ? 'bg-teal-500/20 text-teal-300' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Add Members"
                  data-testid="add-members-button"
                >
                  <UserPlus className="h-5 w-5" />
                </button>
              )}
              
              <button
                onClick={handleLeaveGroup}
                className="p-2 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                title="Leave Group"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="flex h-[75vh]">
            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Messages */}
              <div 
                className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-transparent to-gray-800/30" 
                id="messages-container"
              >
                {indexMissing && (
                  <div className="mb-4 p-2 bg-yellow-500/20 text-yellow-200 rounded text-sm text-center">
                    Messages may not be properly ordered. Please contact the administrator to create the required Firestore index.
                  </div>
                )}
                
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="h-12 w-12 text-gray-500 mb-3" />
                    <h3 className="text-xl font-medium text-gray-300">No messages yet</h3>
                    <p className="text-gray-400 mt-2 max-w-md">
                      Be the first one to send a message in this group!
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={message.id || index}
                      className={`mb-4 flex ${message.userId === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.userId !== user.id && (
                        <div className="h-8 w-8 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center mr-2">
                          {message.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      {renderMessage(message)}
                    </div>
                  ))
               )}
              </div>
              
              {/* Message Input */}
              <div className="p-3 bg-gray-900/50 border-t border-gray-700/50">
                <form onSubmit={handleSendMessage} className="flex items-center">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 bg-gray-800/60 text-white placeholder-gray-400 rounded-l-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !inputMessage.trim()}
                    className={`bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-r-lg flex items-center justify-center transition-colors ${
                      isSending || !inputMessage.trim() ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSending ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </form>
              </div>
            </div>
            
            {/* Members Sidebar - Only show when toggled */}
            {showMembers && (
              <div className="w-64 border-l border-gray-700/50 bg-gray-900/30 overflow-y-auto">
                <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                  <h3 className="font-medium text-white">
                    {showAddMembers ? "Add Members" : "Group Members"}
                  </h3>
                  {!showAddMembers && (
                    <span className="bg-teal-500/20 text-teal-300 text-xs px-2 py-0.5 rounded-full">
                      {members.length}
                    </span>
                  )}
                </div>
                
                {showAddMembers ? (
                  <div>
                    <div className="p-3 border-b border-gray-700/50">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-gray-800/60 text-white placeholder-gray-500 rounded-lg pl-8 pr-3 py-1.5 text-sm border border-gray-700 focus:outline-none focus:border-teal-500"
                        />
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                        {searchTerm && (
                          <button 
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-2 overflow-y-auto max-h-[calc(75vh-80px)]">
                      {filteredNonMembers.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">
                          {searchTerm 
                            ? "No users matching your search"
                            : "No users available to add"}
                        </div>
                      ) : (
                        filteredNonMembers.map((nonMember) => (
                          <div key={nonMember.id} className="flex items-center p-2 rounded-lg hover:bg-gray-800/60">
                            <div className="h-8 w-8 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center mr-2 flex-shrink-0">
                              {nonMember.firstName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-300 truncate">
                                {nonMember.firstName} {nonMember.lastName}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {nonMember.email}
                              </p>
                            </div>
                            <button 
                              onClick={() => handleAddMember(nonMember.id)}
                              disabled={addingMember === nonMember.id}
                              className={`ml-2 p-1.5 rounded-full ${
                                addingMember === nonMember.id
                                  ? 'bg-gray-700 text-gray-400'
                                  : 'bg-teal-500/20 text-teal-300 hover:bg-teal-500/30'
                              }`}
                              title="Add to group"
                            >
                              {addingMember === nonMember.id ? (
                                <div className="h-4 w-4 border-2 border-teal-300 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <UserPlus className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="p-3 border-t border-gray-700/50">
                      <button 
                        onClick={() => setShowAddMembers(false)}
                        className="w-full py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
                      >
                        Back to Members
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center mb-3 last:mb-0">
                        <div className="h-8 w-8 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center mr-2">
                          {member.firstName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-300">
                            {member.firstName}
                            {member.id === user.id && (
                              <span className="ml-2 text-xs bg-gray-700/50 text-gray-300 px-1.5 py-0.5 rounded">
                                you
                              </span>
                            )}
                            {member.id === group.adminId && (
                              <span className="ml-2 text-xs bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded">
                                admin
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {isAdmin && (
                      <button 
                        onClick={toggleAddMembers}
                        className="w-full mt-4 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded-lg flex items-center justify-center text-sm transition-colors"
                        data-testid="add-members-button-bottom"
                      >
                        <UserPlus className="h-4 w-4 mr-1.5" />
                        Add Members
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default GroupDetail;