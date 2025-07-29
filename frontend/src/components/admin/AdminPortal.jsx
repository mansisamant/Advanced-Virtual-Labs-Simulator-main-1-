import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { UserContext } from '../hooks/userContext';
import { 
  Users, 
  LayoutDashboard, 
  UserCog, 
  FileText, 
  Microscope, 
  UserPlus,
  Menu,
  X,
  ClipboardList
} from 'lucide-react';
import ResponsiveHeader from '../shared-components/Header';
import Footer from '../shared-components/Footer';

const AdminPortal = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Check if user has admin privileges
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      navigate('/unauthorized');
    }
  }, [user, navigate]);

  // Get current active route for sidebar highlighting
  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <ResponsiveHeader />
      
      <div className="flex flex-grow pt-16">
        {/* Admin Sidebar - Desktop */}
        <div className="bg-gray-900 text-white w-64 flex-shrink-0 hidden md:block">
          <div className="p-5 border-b border-gray-800">
            <h2 className="text-xl font-bold flex items-center">
              <UserCog className="mr-2 h-6 w-6" />
              Admin Portal
            </h2>
            <p className="text-gray-400 text-sm mt-1">Manage your virtual labs</p>
          </div>
          
          <nav className="p-4">
            <div className="mb-6">
              <h3 className="text-xs uppercase text-gray-500 font-semibold mb-2 tracking-wider">Management</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/admin"
                    className={`flex items-center px-4 py-2.5 text-sm rounded-lg ${
                      location.pathname === '/admin' 
                        ? 'bg-indigo-700 text-white' 
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-3" />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/students"
                    className={`flex items-center px-4 py-2.5 text-sm rounded-lg ${
                      isActivePath('/admin/students') 
                        ? 'bg-indigo-700 text-white' 
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <Users className="h-4 w-4 mr-3" />
                    Students
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/groups"
                    className={`flex items-center px-4 py-2.5 text-sm rounded-lg ${
                      isActivePath('/admin/groups') 
                        ? 'bg-indigo-700 text-white' 
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <UserPlus className="h-4 w-4 mr-3" />
                    Groups
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xs uppercase text-gray-500 font-semibold mb-2 tracking-wider">Content</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/admin/tests"
                    className={`flex items-center px-4 py-2.5 text-sm rounded-lg ${
                      isActivePath('/admin/tests') 
                        ? 'bg-indigo-700 text-white' 
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <ClipboardList className="h-4 w-4 mr-3" />
                    Tests
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
        
        {/* Mobile Sidebar Toggle Button */}
        <div className="md:hidden fixed bottom-5 right-5 z-50">
          <button 
            onClick={toggleMobileMenu}
            className="p-3 bg-indigo-600 rounded-full shadow-lg text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50">
            <div className="bg-gray-900 text-white w-64 h-full overflow-y-auto">
              <div className="p-5 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center">
                  <UserCog className="mr-2 h-6 w-6" />
                  Admin Portal
                </h2>
                <button onClick={toggleMobileMenu} className="text-gray-400">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <nav className="p-4">
                <div className="mb-6">
                  <h3 className="text-xs uppercase text-gray-500 font-semibold mb-2 tracking-wider">Management</h3>
                  <ul className="space-y-1">
                    <li>
                      <Link
                        to="/admin"
                        onClick={toggleMobileMenu}
                        className={`flex items-center px-4 py-2.5 text-sm rounded-lg ${
                          location.pathname === '/admin' 
                            ? 'bg-indigo-700 text-white' 
                            : 'text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        <LayoutDashboard className="h-4 w-4 mr-3" />
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/students"
                        onClick={toggleMobileMenu}
                        className={`flex items-center px-4 py-2.5 text-sm rounded-lg ${
                          isActivePath('/admin/students') 
                            ? 'bg-indigo-700 text-white' 
                            : 'text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        <Users className="h-4 w-4 mr-3" />
                        Students
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/groups"
                        onClick={toggleMobileMenu}
                        className={`flex items-center px-4 py-2.5 text-sm rounded-lg ${
                          isActivePath('/admin/groups') 
                            ? 'bg-indigo-700 text-white' 
                            : 'text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        <UserPlus className="h-4 w-4 mr-3" />
                        Groups
                      </Link>
                    </li>
                  </ul>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xs uppercase text-gray-500 font-semibold mb-2 tracking-wider">Content</h3>
                  <ul className="space-y-1">
                    <li>
                      <Link
                        to="/admin/experiments"
                        onClick={toggleMobileMenu}
                        className={`flex items-center px-4 py-2.5 text-sm rounded-lg ${
                          isActivePath('/admin/experiments') 
                            ? 'bg-indigo-700 text-white' 
                            : 'text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        <Microscope className="h-4 w-4 mr-3" />
                        Experiments
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/tests"
                        onClick={toggleMobileMenu}
                        className={`flex items-center px-4 py-2.5 text-sm rounded-lg ${
                          isActivePath('/admin/tests') 
                            ? 'bg-indigo-700 text-white' 
                            : 'text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        <ClipboardList className="h-4 w-4 mr-3" />
                        Tests
                      </Link>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xs uppercase text-gray-500 font-semibold mb-2 tracking-wider">Reports</h3>
                  <ul className="space-y-1">
                    <li>
                      <Link
                        to="/admin/results"
                        onClick={toggleMobileMenu}
                        className={`flex items-center px-4 py-2.5 text-sm rounded-lg ${
                          isActivePath('/admin/results') 
                            ? 'bg-indigo-700 text-white' 
                            : 'text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        <FileText className="h-4 w-4 mr-3" />
                        Results
                      </Link>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>
          </div>
        )}
        
        {/* Main Content Area */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminPortal;