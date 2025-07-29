import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

// Admin: Create a new test
export const createTest = async (testData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/tests/create`, testData);
    return response.data;
  } catch (error) {
    console.error('Error creating test:', error);
    throw error;
  }
};

// Admin: Get all tests
export const getAllTests = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tests`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tests:', error);
    throw error;
  }
};

// Admin: Get test by ID
export const getTestById = async (testId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tests/${testId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching test:', error);
    throw error;
  }
};

// Admin: Update test
export const updateTest = async (testId, testData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/tests/${testId}`, testData);
    return response.data;
  } catch (error) {
    console.error('Error updating test:', error);
    throw error;
  }
};

// Admin: Delete test
export const deleteTest = async (testId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/tests/${testId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting test:', error);
    throw error;
  }
};

// Admin: Assign test to users
export const assignTest = async (testId, userIds) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/tests/${testId}/assign`, { userIds });
    return response.data;
  } catch (error) {
    console.error('Error assigning test:', error);
    throw error;
  }
};

// Student: Get assigned tests for a user
export const getUserAssignedTests = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tests/assigned/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching assigned tests:', error);
    throw error;
  }
};

// Student: Start a test
export const startTest = async (testId, userId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/tests/${testId}/start`, { userId });
    return response.data;
  } catch (error) {
    console.error('Error starting test:', error);
    throw error;
  }
};

// Student: Submit test answers
export const submitTestAnswers = async (testId, userId, answers) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/tests/${testId}/submit`, {
      userId,
      answers
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting test answers:', error);
    throw error;
  }
};

// Get test results for a user
export const getUserTestResults = async (userId) => {
  try {
    console.log(`Fetching test results for user: ${userId}`);
    const response = await axios.get(`${API_BASE_URL}/tests/results/${userId}`);
    console.log('User test results response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching test results for user:', error);
    // Return a default structure instead of throwing
    return {
      success: false,
      results: [],
      message: `No test results found for this user (${error.message})`
    };
  }
};

// Get detailed test result
export const getTestResult = async (resultId) => {
  try {
    console.log(`Fetching detailed result for ID: ${resultId}`);
    
    // Add explicit check for resultId
    if (!resultId) {
      console.error('No result ID provided');
      return {
        success: false,
        message: 'Result ID is required'
      };
    }
    
    // Use the correct endpoint without passing userId
    const response = await axios.get(`${API_BASE_URL}/tests/result/${resultId}`);
    console.log('Result data received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching test result:', error);
    console.error('Error details:', {
      message: error.message,
      responseData: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url
    });
    
    // Return a structured error response instead of throwing
    return {
      success: false,
      message: 'Failed to fetch test result: ' + (error.response?.data?.message || error.message)
    };
  }
};

/**
 * Get all test results (for admin)
 */
export const getAllTestResults = async () => {
  try {
    console.log('Fetching all test results from the database');
    
    // Try first endpoint with better error handling
    try {
      const response = await axios.get(`${API_BASE_URL}/tests/results/all`);
      console.log(`Successfully fetched ${response.data.results?.length || 0} test results`);
      return response.data;
    } catch (firstError) {
      console.log('First endpoint failed, trying legacy endpoint:', firstError.message);
      
      // Fall back to legacy endpoint
      const response = await axios.get(`${API_BASE_URL}/tests/getResult`);
      console.log(`Successfully fetched ${response.data.results?.length || 0} test results via legacy endpoint`);
      return response.data;
    }
  } catch (error) {
    console.error('All attempts to fetch test results failed:', error);
    return {
      success: false,
      results: [],
      message: 'Failed to fetch test results: ' + (error.response?.data?.message || error.message)
    };
  }
};
