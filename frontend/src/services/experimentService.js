import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

// Save experiment results
export const saveExperimentResults = async (studentId, experimentId, input, output) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/experiments/results`, {
      studentId,
      experimentId,
      input,
      output
    });
    return response.data;
  } catch (error) {
    console.error('Error saving experiment results:', error);
    throw error;
  }
};

// Get experiment results
export const getExperimentResults = async (studentId, experimentId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/experiments/results/${studentId}/${experimentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching experiment results:', error);
    throw error;
  }
};

// Save experiment notes
export const saveExperimentNotes = async (studentId, experimentId, notes, noteId = null) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/experiments/notes`, {
      studentId,
      experimentId,
      notes,
      noteId
    });
    return response.data;
  } catch (error) {
    console.error('Error saving experiment notes:', error);
    throw error;
  }
};

// Get experiment notes
export const getExperimentNotes = async (studentId, experimentId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/experiments/notes/${studentId}/${experimentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching experiment notes:', error);
    throw error;
  }
};

/**
 * Get recent experiment results for dashboard
 * @returns {Promise<Object>} Response containing recent experiment results
 */
export const getRecentExperimentResults = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/experiments/results/recent`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent experiment results:', error);
    // Return a default structure on error
    return {
      success: false,
      results: [],
      message: 'Failed to fetch experiment results'
    };
  }
};

/**
 * Get experiment results for a specific student
 * @param {string} studentId - ID of the student
 * @returns {Promise<Object>} Response containing student's experiment results
 */
export const getStudentExperimentResults = async (studentId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/experiments/results/student/${studentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching experiment results for student ${studentId}:`, error);
    throw error;
  }
};

export default {
  saveExperimentResults,
  getExperimentResults,
  saveExperimentNotes,
  getExperimentNotes,
  getRecentExperimentResults,
  getStudentExperimentResults
};
