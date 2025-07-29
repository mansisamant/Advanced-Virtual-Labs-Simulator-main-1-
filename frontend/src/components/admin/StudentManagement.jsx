import React, { useState, useEffect } from 'react';
import { Search, X, UserPlus, Edit, Trash2, UserCheck, Mail, Download } from 'lucide-react';
import axios from 'axios';
import { getAllGroups } from '../../services/groupService';

const StudentsManagement = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  
  // Form state for adding a new student
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    password: '',
    role: 'user'
  });
  
  // Fetch students from the backend
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/getUsers`);
        // filter out admin accounts 

        response.data = response.data.filter(user => user.role != 'admin');
        
        // Process students data to handle Firestore timestamps
        const studentsWithDates = response.data.map(student => {
          // Check if createdAt is a Firestore timestamp object (with seconds and nanoseconds)
          let formattedDate;
          if (student.createdAt) {
            if (typeof student.createdAt === 'object' && 'seconds' in student.createdAt) {
              // Convert Firestore timestamp to Date and then to ISO string
              formattedDate = new Date(student.createdAt.seconds * 1000).toISOString();
            } else if (typeof student.createdAt === 'string') {
              // Already a string, use as is
              formattedDate = student.createdAt;
            } else {
              // Use current date as fallback
              formattedDate = new Date().toISOString();
            }
          } else {
            formattedDate = new Date().toISOString();
          }
          
          return {
            ...student,
            createdAt: formattedDate
          };
        });
        
        setStudents(studentsWithDates);
        setFilteredStudents(studentsWithDates);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchGroups = async () => {
      try {
        const response = await getAllGroups();
        setGroups(response.groups || []);  // Changed from response.data to response.groups
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };
    
    fetchStudents();
    fetchGroups();
  }, []);
  
  // Filter students based on search term
  useEffect(() => {
    const results = students.filter(student => 
      student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(results);
  }, [searchTerm, students]);
  
  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Toggle student selection
  const toggleStudentSelection = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };
  
  // Select/deselect all students
  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(student => student.id));
    }
  };
  
  // Handle adding students to group
  const handleAddToGroup = async () => {
    if (!selectedGroup || selectedStudents.length === 0) return;
    
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/groups/${selectedGroup}/members`, {
        studentIds: selectedStudents
      });
      
      // Show success notification and close modal
      alert('Students added to group successfully');
      setShowGroupModal(false);
      setSelectedStudents([]);
      setSelectedGroup('');
    } catch (error) {
      console.error('Error adding students to group:', error);
      alert('Failed to add students to group');
    }
  };
  
  // Handle form input change for new student
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent({ ...newStudent, [name]: value });
  };
  
  // Handle adding a new student
  const handleAddStudent = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/register`, newStudent);
      
      // Refresh student list
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users?role=user`);
      setStudents(response.data);
      
      // Reset form and close modal
      setNewStudent({
        firstName: '',
        lastName: '',
        email: '',
        studentId: '',
        password: '',
        role: 'user'
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Failed to add student');
    }
  };
  
  // Handle deleting selected students
  const handleDeleteSelected = async () => {
    if (!selectedStudents.length) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedStudents.length} student(s)?`)) {
      return;
    }
    
    try {
      await Promise.all(
        selectedStudents.map(id => 
          axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/users/${id}`)
        )
      );
      
      // Refresh student list
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users?role=user`);
      setStudents(response.data);
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error deleting students:', error);
      alert('Failed to delete some students');
    }
  };
  
  // Export student data to CSV
  const exportToCSV = () => {
    const headers = ['Student ID', 'First Name', 'Last Name', 'Email', 'Created At'];
    const csvRows = [
      headers.join(','),
      ...filteredStudents.map(student => {
        // Format date for CSV
        const formattedDate = typeof student.createdAt === 'string'
          ? new Date(student.createdAt).toLocaleDateString()
          : new Date().toLocaleDateString();
          
        return [
          student.studentId || 'N/A',
          student.firstName || 'N/A',
          student.lastName || 'N/A',
          student.email || 'N/A',
          formattedDate
        ].join(',');
      })
    ];
    
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'students.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Send email to selected students
  const sendEmailToSelected = () => {
    const selectedEmails = filteredStudents
      .filter(student => selectedStudents.includes(student.id))
      .map(student => student.email)
      .join(';');
    
    window.open(`mailto:${selectedEmails}`);
  };
  
  return (
    <div className="students-management">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Students Management</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <UserPlus className="h-4 w-4 mr-2" /> Add Student
          </button>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search students..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {selectedStudents.length > 0 && (
              <>
                <button
                  onClick={() => setShowGroupModal(true)}
                  className="flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 text-sm"
                >
                  <UserCheck className="h-4 w-4 mr-1" /> Add to Group
                </button>
                <button
                  onClick={sendEmailToSelected}
                  className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm"
                >
                  <Mail className="h-4 w-4 mr-1" /> Email
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </button>
              </>
            )}
            <button
              onClick={exportToCSV}
              className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
            >
              <Download className="h-4 w-4 mr-1" /> Export
            </button>
          </div>
        </div>
      </div>
      
      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mb-2"></div>
            <p className="text-gray-500">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={selectedStudents.length === filteredStudents.length}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.studentId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {typeof student.createdAt === 'string' 
                          ? new Date(student.createdAt).toLocaleDateString()
                          : 'Invalid Date'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Add New Student</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddStudent} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={newStudent.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={newStudent.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={newStudent.email}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                <input
                  type="text"
                  name="studentId"
                  value={newStudent.studentId}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={newStudent.password}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add to Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Add to Group</h3>
              <button onClick={() => setShowGroupModal(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Adding {selectedStudents.length} student(s) to group
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Group</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select a group</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowGroupModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddToGroup}
                  disabled={!selectedGroup}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
                >
                  Add to Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsManagement;