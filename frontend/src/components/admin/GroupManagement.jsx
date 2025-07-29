import React, { useState, useEffect } from 'react';
import { Search, X, Plus, Edit, Trash2, Users, Calendar, School, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { Link} from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../hooks/userContext'; 
import { createGroup, deleteGroup, getAllGroups, updateGroup } from '../../services/groupService';
import { getAllUsers } from '../../services/userService';

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const {user} = useContext(UserContext); 
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    year: new Date().getFullYear(),
    course: '',
    department: '',
    members: [],
    creatorId: user.id // Assuming userId is stored in localStorage
  });
  
  // Fetch groups and students data
  useEffect(() => {
    fetchData();
  }, []);
  
  // Submit the form (add or edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedGroup) {
        // Update existing group
        await updateGroup(selectedGroup.id, formData);
      } else {
        // Create new group
        await createGroup(formData);
      }
      
      // Refresh groups list
      fetchData(); // Use the fetchData function instead of direct API call
      
      // Close modal
      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving group:', error);
      alert('Failed to save group: ' + (error.message || 'Unknown error'));
    }
  };
  
  // Fetch groups and students data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (!user || !user.id) {
        console.error('User ID is undefined, cannot fetch data');
        setGroups([]);
        setFilteredGroups([]);
        setLoading(false);
        return;
      }
      
      // Fetch groups
      console.log('Fetching groups for user ID:', user.id);
      const groupsResponse = await getAllGroups(user.id);
      console.log('Groups response:', groupsResponse);
      
      // Ensure we have a valid groups array
      const groupsData = groupsResponse?.groups || [];
      console.log('Groups data to use:', groupsData);
      
      setGroups(groupsData);
      setFilteredGroups(groupsData);
      
      // Fetch students
      const studentsResponse = await getAllUsers();
      console.log('Students response:', studentsResponse);
      
      // Ensure we have a valid students array
      const studentsData = Array.isArray(studentsResponse) ? studentsResponse : [];
      const filteredStudents = studentsData.filter(user => user.role !== 'admin');
      
      setStudents(filteredStudents);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set empty arrays to prevent filter errors
      setGroups([]);
      setFilteredGroups([]);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter groups based on search term
  useEffect(() => {
    if (!Array.isArray(groups)) {
      console.warn('Groups is not an array:', groups);
      setFilteredGroups([]);
      return;
    }
    
    try {
      const results = groups.filter(group => {
        if (!group) return false;
        
        return (
          (group.name && group.name.toLowerCase().includes((searchTerm || '').toLowerCase())) ||
          (group.code && group.code.toLowerCase().includes((searchTerm || '').toLowerCase())) ||
          (group.department && group.department.toLowerCase().includes((searchTerm || '').toLowerCase()))
        );
      });
      
      setFilteredGroups(results);
    } catch (error) {
      console.error('Error filtering groups:', error);
      setFilteredGroups([]);
    }
  }, [searchTerm, groups]);
  
  // Handle search change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Handle member selection
  const handleMemberToggle = (studentId) => {
    const newMembers = [...formData.members];
    
    if (newMembers.includes(studentId)) {
      // Remove member
      const index = newMembers.indexOf(studentId);
      newMembers.splice(index, 1);
    } else {
      // Add member
      newMembers.push(studentId);
    }
    
    setFormData({ ...formData, members: newMembers });
  };
  
  // Open edit modal with group data
  const handleEdit = (group) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name || '',
      description: group.description || '',
      code: group.code || '',
      year: group.year || new Date().getFullYear(),
      course: group.course || '',
      department: group.department || '',
      members: group.members || [],
      creatorId: user.id 
    });
    setShowAddModal(true);
  };
  
  // Open add modal with empty form
  const handleAdd = () => {
    setSelectedGroup(null);
    setFormData({
      name: '',
      description: '',
      code: '',
      year: new Date().getFullYear(),
      course: '',
      department: '',
      members: [],
      creatorId: user.id
    });
    setShowAddModal(true);
  };
  
  // Delete group
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this group?')) {
      return;
    }
    
    try {
      await deleteGroup(id, user.id);
      // Refresh groups list
      setGroups(groups.filter(group => group.id !== id));
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Failed to delete group');
    }
  };
  
  // Generate a random group code
  const generateGroupCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setFormData({ ...formData, code });
  };
  
  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    !studentSearchTerm || 
    student.firstName?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    student.lastName?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    student.studentId?.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );
  
  return (
    <div className="group-management">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Group Management</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" /> Create Group
          </button>
        </div>
      </div>
      
      {/* Search bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search groups..."
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
      </div>
      
      {/* Groups Grid */}
      <div className="mb-6">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mb-2"></div>
            <p className="text-gray-500">Loading groups...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">No groups found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <div key={group.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{group.name}</h3>
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => handleEdit(group)}
                        className="text-gray-400 hover:text-indigo-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(group.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-gray-500 text-sm mb-4 line-clamp-2">{group.description}</div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-700">{group.members?.length || 0} Students</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <School className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-700">{group.course || 'No Course'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-700">{group.batchYear || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs py-1 px-2 bg-indigo-50 text-indigo-700 rounded-md font-medium">
                      Code: {group.code || 'N/A'}
                    </span>
                    <Link
                      to={`/admin/groups/${group.id}`}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add/Edit Group Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedGroup ? 'Edit Group' : 'Create New Group'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group Code</label>
                  <div className="flex">
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-l-md px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={generateGroupCode}
                      className="px-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-600 hover:bg-gray-200"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 h-24"
                  placeholder="Provide a brief description of this group"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., BTech CSE"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Add Members</label>
                
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    placeholder="Search students..."
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                
                <div className="border border-gray-300 rounded-md max-h-60 overflow-y-auto">
                  {filteredStudents.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No students found
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Select
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStudents.map((student) => (
                          <tr key={student.id} className={formData.members.includes(student.id) ? 'bg-indigo-50' : ''}>
                            <td className="px-6 py-2 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={formData.members.includes(student.id)}
                                onChange={() => handleMemberToggle(student.id)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {student.firstName} {student.lastName}
                              </div>
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{student.studentId}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                
                <div className="mt-2 text-sm text-gray-500">
                  {formData.members.length} students selected
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-3 border-t">
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
                  {selectedGroup ? 'Update Group' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupManagement;