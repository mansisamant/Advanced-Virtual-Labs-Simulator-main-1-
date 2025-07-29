import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

// Get all groups joined by a user
export const getJoinedGroups = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/groups/joined/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching joined groups:', error);
    throw error;
  }
};

// Get group details
export const getGroupDetails = async (groupId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/groups/${groupId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching group details:', error);
    throw error;
  }
};

// Create a new group
export const createGroup = async (groupData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/groups/create`, groupData);
    return response.data;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

/**
 * Update a group
 * @param {string} groupId - ID of the group to update
 * @param {Object} groupData - New group data
 * @returns {Promise<Object>} Response object
 */
export const updateGroup = async (groupId, groupData) => {
  try {
    console.log('Updating group:', groupId, 'with data:', groupData);
    const response = await axios.post(`${API_BASE_URL}/groups/update/${groupId}`, groupData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating group:', error);
    throw error;
  }
};

// Join a group
export const joinGroup = async (groupId, userId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/groups/join`, { groupId, userId });
    return response.data;
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
};

// Leave a group
export const leaveGroup = async (groupId, userId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/groups/leave`, { groupId, userId });
    return response.data;
  } catch (error) {
    console.error('Error leaving group:', error);
    throw error;
  }
};

// Get group messages
export const getGroupMessages = async (groupId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/groups/${groupId}/messages`);
    return response.data;
  } catch (error) {
    console.error('Error fetching group messages:', error);
    throw error;
  }
};

// Send a message to a group
export const sendGroupMessage = async (groupId, messageData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/groups/${groupId}/messages`, messageData);
    return response.data;
  } catch (error) {
    console.error('Error sending group message:', error);
    throw error;
  }
};

// Add admin to group
export const addGroupAdmin = async (groupId, userId, adminId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/groups/${groupId}/add-admin`, { 
      userId, 
      adminId 
    });
    return response.data;
  } catch (error) {
    console.error('Error adding group admin:', error);
    throw error;
  }
};

// Remove member from group
export const removeMember = async (groupId, userId, memberId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/groups/${groupId}/remove-member`, { 
      userId, 
      memberId 
    });
    return response.data;
  } catch (error) {
    console.error('Error removing group member:', error);
    throw error;
  }
};

// Delete group
export const deleteGroup = async (groupId, userId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/groups/${groupId}?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};

// Admin functions
export const getAllGroups = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/groups/user/${userId}`);
    
    // Ensure we always return an object with a groups property (even if empty)
    if (!response.data || !response.data.groups) {
      console.warn('getAllGroups response missing groups array:', response.data);
      return { 
        success: true, 
        groups: [] 
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching all groups:', error);
    // Return a default structure instead of throwing to prevent UI crashes
    return { 
      success: false, 
      groups: [],
      message: error.response?.data?.message || 'Failed to fetch groups'
    };
  }
};

/**
 * Add a member to a group
 * @param {string} groupId - ID of the group
 * @param {string} userId - ID of the user to add
 * @returns {Promise<Object>} Response object
 */
export const addMemberToGroup = async (groupId, userId) => {
  try {
    console.log("Adding member to group", { groupId, userId });
    // Explicitly set content type to ensure proper request formatting
    const response = await axios.post(
      `${API_BASE_URL}/groups/${groupId}/members`, 
      { userId },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding member to group:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to add member to group'
    };
  }
};
