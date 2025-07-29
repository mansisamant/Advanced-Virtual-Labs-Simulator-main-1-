import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './components/hooks/userContext';
import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import './components/shared-components/animations.css';

// Pages
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegistrationPage from './components/RegistrationPage';
import LabDashboard from './components/labs/LabDashboard';
import ExperimentPage from './components/labs/ExperimentPage';
import Room from './components/Room';
import GroupPage from './components/group/GroupPage';
import GroupManagement from './components/group/GroupManagement';
import GroupForm from './components/group/GroupForm';
import GroupDetail from './components/group/GroupDetail';
import UserProfile from './components/user/UserProfile';

// Simulators
import SimulatorTitration from './components/simulators/titration/SimulatorTitration';
import SimulatorOptics from './components/simulators/ray_optics/SimulatorOptics';
import Simulator8085 from './components/simulators/8085_microprocessor/Simulator8085';
import SimulatorOhmsLaw from './components/simulators/ohms_law/SimulatorOhmsLaw';
import SimulatorOS from './components/simulators/operating_system/SimulatorOS';
import SimulatorCN from './components/simulators/computer_networks/SimulatorCN';
import UserExperimentsDashboard from './components/experiments/MyExperiment';

// Admin Components
import AdminPortal from './components/admin/AdminPortal';
import AdminDashboard from './components/admin/AdminDashboard';
import StudentManagement from './components/admin/StudentManagement';
import GroupManagementAdmin from './components/admin/GroupManagement';
import TestManagement from './components/admin/TestManagement';

// Test Components
import TestList from './components/tests/TestList';
import TakeTest from './components/tests/TakeTest';
import TestResult from './components/tests/TestResult';

// Lab Assistant
import ChatBotPopup from './components/shared-components/ChatBotPopup';
import { useLabAssistant } from './components/shared-components/labAssistant';

// Chat bot toggle button component
function ChatBotButton() {
  const { toggle, isVisible } = useLabAssistant();
  const [hasNewMessage, setHasNewMessage] = useState(true);

  // Simulate new message notification on first load
  useEffect(() => {
    // Clear the notification when the assistant is opened
    if (isVisible) {
      setHasNewMessage(false);
    }
    
    // Show a notification after 10 seconds if the assistant is closed
    const timer = setTimeout(() => {
      if (!isVisible) {
        setHasNewMessage(true);
      }
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [isVisible]);
  
  return (
    <button
      onClick={() => {
        toggle();
        setHasNewMessage(false);
      }}
      className={`fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full ${
        isVisible ? 'bg-gray-700 hover:bg-gray-600' : 'bg-teal-500 hover:bg-teal-600'
      } shadow-lg shadow-teal-500/20 text-white transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${
        hasNewMessage && !isVisible ? 'animate-pulse-custom' : ''
      }`}
      aria-label="Toggle Lab Assistant"
    >
      <Bot size={24} />
      {hasNewMessage && !isVisible && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-400"></span>
        </span>
      )}
    </button>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/labs" element={<LabDashboard />} />
  
          <Route path="/chat" element={<Room />} />
          <Route path="/groups" element={<GroupPage />} />
          <Route path="/groups/:groupId" element={<GroupDetail />} />
          <Route path="/createGroup" element={<GroupForm />} />
          <Route path="/my-experiments" element={<UserExperimentsDashboard />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/experiment" element = {<ExperimentPage/>} />
          
          {/* Test Routes */}
          <Route path="/tests" element={<TestList />} />
          <Route path="/tests/take/:testId" element={<TakeTest />} />
          <Route path="/tests/result/:resultId" element={<TestResult />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminPortal />}>
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="groups" element={<GroupManagementAdmin />} />
            <Route path="tests" element={<TestManagement />} />
          </Route>
          
          <Route path="/admin/groups/create" element={<GroupForm />} />
          <Route path="/admin/groups/edit/:groupId" element={<GroupForm />} />
          
          {/* Simulator Routes */}
          <Route path="/simulator/titration" element={<SimulatorTitration />} />
          <Route path="/simulator/optics" element={<SimulatorOptics />} />
          <Route path="/simulator/8085" element={<Simulator8085 />} />
          <Route path="/simulator/ohms-law" element={<SimulatorOhmsLaw />} />
          <Route path="/simulator/process-scheduler" element={<SimulatorOS />} />
          <Route path='/simulator/network-sim' element={<SimulatorCN />} />
        </Routes>
        
        {/* Chat Bot Button and Popup - Available globally */}
        <ChatBotButton />
        <ChatBotPopup />
      </Router>
    </UserProvider>
  );
}

export default App;
