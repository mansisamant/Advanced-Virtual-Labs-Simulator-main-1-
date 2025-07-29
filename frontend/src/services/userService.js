import axios from 'axios';

const API_BASE_URL =  `${import.meta.env.VITE_BACKEND_URL}/api`;

// Get all users
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/getUsers`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// Get user details - added to fix the missing export error
export const getUserDetails = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}/details`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    // If the dedicated endpoint fails, try to fall back to the regular user endpoint
    try {
      const fallbackResponse = await getUserById(userId);
      return fallbackResponse;
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      throw error; // Throw the original error
    }
  }
};

// Update user
export const updateUser = async (userId, userData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Register new user
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/register`, userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/login`, credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export default {
  getAllUsers,
  getUserById,
  getUserDetails, // Add to default export
  updateUser,
  deleteUser,
  registerUser,
  loginUser
};
