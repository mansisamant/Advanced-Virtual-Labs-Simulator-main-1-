import { useState, useContext, useEffect } from 'react';
import {
  ArrowRight,
  Beaker,
  BookOpen,
  CheckCircle,
  Users,
  MessageCircle,
  Bot,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ResponsiveHeader from './shared-components/Header';
import Footer from './shared-components/Footer';
import StudentLogin from './LoginPage';
import StudentRegistration from './RegistrationPage';
import { UserContext } from './hooks/userContext';
// Import the useLabAssistant hook instead of handleAssistantToggle
import { useLabAssistant } from './shared-components/labAssistant';


const floatAnimation = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(2deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes fadeScale {
    0% { opacity: 0; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
  }
`;

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const navigate = useNavigate();
  const { user, isLoggedIn } = useContext(UserContext);
  
  // Force component re-render when login state changes
  const [rerender, setRerender] = useState(0);

  console.log('LandingPage rendered', { user, isLoggedIn });
  console.log("Backend URL:", import.meta.env.VITE_BACKEND_URL);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = floatAnimation;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  // This effect will trigger a re-render when isLoggedIn changes
  useEffect(() => {
    setRerender(prev => prev + 1);
    
    // If user just logged in, close any open modals
    if (isLoggedIn) {
      setShowLogin(false);
      setShowRegistration(false);
    }
  }, [isLoggedIn]);

  const toggleLoginModal = () => {
    setShowLogin(!showLogin);
    setShowRegistration(false);
  };

  const toggleRegistrationModal = () => {
    setShowRegistration(!showRegistration);
    setShowLogin(false); // Close login if open
  };

  const switchToLogin = () => {
    setShowRegistration(false);
    setShowLogin(true);
  };

  const switchToRegistration = () => {
    setShowLogin(false);
    setShowRegistration(true);
  };

  const closeModals = () => {
    setShowLogin(false);
    setShowRegistration(false);
  };


  const features = [
    {
      icon: <Beaker className="h-12 w-12 text-teal-400 group-hover:scale-110 transition-transform duration-300" />,
      title: "Interactive Experiments",
      description: "Perform virtual experiments with real-time simulations and accurate scientific models.",
      gradient: "from-teal-500/20 to-gray-800/20"
    },
    {
      icon: <Users className="h-12 w-12 text-teal-400 group-hover:scale-110 transition-transform duration-300" />,
      title: "Collaborative Learning",
      description: "Work together with classmates in real-time, sharing observations and results.",
      gradient: "from-teal-500/20 to-gray-800/20"
    },
    {
      icon: <BookOpen className="h-12 w-12 text-teal-400 group-hover:scale-110 transition-transform duration-300" />,
      title: "Comprehensive Resources",
      description: "Access lab manuals, tutorials, and reference materials directly in the platform.",
      gradient: "from-teal-500/20 to-gray-800/20"
    },
    {
      icon: <MessageCircle className="h-12 w-12 text-teal-400 group-hover:scale-110 transition-transform duration-300" />,
      title: "Instant Communication",
      description: "Chat with teammates and instructors for immediate feedback and guidance.",
      gradient: "from-teal-500/20 to-gray-800/20"
    },
    {
      icon: <Bot className="h-12 w-12 text-teal-400 group-hover:scale-110 transition-transform duration-300" />,
      title: "Virtual Lab Assistant",
      description: "Get AI-powered help with experiments, procedures, and scientific concepts.",
      gradient: "from-teal-500/20 to-gray-800/20"
    },
    {
      icon: <CheckCircle className="h-12 w-12 text-teal-400 group-hover:scale-110 transition-transform duration-300" />,
      title: "Progress Tracking",
      description: "Monitor your lab work progress and receive personalized feedback.",
      gradient: "from-teal-500/20 to-gray-800/20"
    }
  ];
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900">
      <ResponsiveHeader />

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#4a5568_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 animate-[slideUp_1s_ease-out]">
              <div className="space-y-6">
                <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight">
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                    Experience
                  </span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-200 pb-2">
                    Science
                  </span>
                  <span className="text-4xl md:text-5xl text-gray-400 font-light">
                    Virtually Anywhere
                  </span>
                </h1>
                
                <div className="flex flex-col sm:flex-row gap-6 pt-4">
                  {/* Check if user is NOT logged in before showing buttons */}
                  {!isLoggedIn && (
                    <>
                      <button
                        onClick={toggleLoginModal}
                        className="group relative px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-400 rounded-xl text-white font-medium text-lg shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all duration-300"
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          Student Login
                          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </button>
                      <button
                        onClick={toggleRegistrationModal}
                        className="group px-8 py-4 rounded-xl text-gray-300 font-medium text-lg border border-gray-700 hover:border-teal-500/50 hover:bg-teal-500/10 transition-all duration-300 hover:-translate-y-0.5"
                      >
                        <span className="flex items-center justify-center">
                          Register Now
                          <ArrowRight className="ml-2 h-5 w-5 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                        </span>
                      </button>
                    </>
                  )}
                  {/* If user is logged in, show a different call-to-action */}
                  {isLoggedIn && (
                    <button
                      onClick={() => navigate('/labs')}
                      className="group relative px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-400 rounded-xl text-white font-medium text-lg shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        Explore Labs
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* ...existing right column content... */}
            <div className="md:w-1/2">
              <div className="relative w-full max-w-xl mx-auto">
                {/* Decorative elements */}
                <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/30 to-gray-500/30 blur-2xl rounded-xl"></div>
                <div className="absolute -right-4 -bottom-4 w-full h-full border-4 border-teal-400/30 rounded-xl transform rotate-3"></div>
                <div className="absolute -left-4 -top-4 w-full h-full border-4 border-gray-400/30 rounded-xl transform -rotate-3"></div>
                
                {/* Main container */}
                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-2 rounded-xl shadow-2xl transform hover:scale-[1.02] transition-all duration-300 animate-[float_6s_ease-in-out_infinite]">
                  {/* Image */}
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src="/images/labs.gif"
                      alt="Virtual lab demonstration"
                      className="w-full h-auto max-h-[600px] object-cover transform hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-800 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-5"></div>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose Virtual Labs?</h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Our platform provides all the tools you need to conduct experiments,
              collaborate with peers, and enhance your scientific learning journey.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm 
                  border border-gray-700/50 hover:border-teal-500/50 transition-all duration-300 
                  hover:shadow-lg hover:shadow-teal-500/10 hover:-translate-y-1"
                style={{ animation: `fadeScale 0.6s ease-out ${index * 0.1}s backwards` }}
              >
                <div className="relative mb-6">
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} blur-2xl rounded-full`}></div>
                  <div className="relative z-10">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-teal-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-5"></div>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How Virtual Labs Work</h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Getting started is simple. Register, browse available labs, and begin experimenting in minutes.
            </p>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-stretch space-y-8 md:space-y-0 md:space-x-6">
            {['Create an Account', 'Choose Your Lab', 'Start Experimenting'].map((title, index) => (
              <div key={index} className="w-full md:w-1/3 group">
                <div className="h-full p-8 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm 
                  border border-gray-700/50 hover:border-teal-500/50 transition-all duration-300">
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-teal-400 to-teal-600 rounded-full 
                      flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-teal-500/20 
                      group-hover:scale-110 transition-transform duration-300">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-teal-400 transition-colors">
                    {title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    {index === 0 && 'Register with your student credentials to access the full platform.'}
                    {index === 1 && 'Browse our catalog of experiments across various scientific disciplines.'}
                    {index === 2 && 'Conduct experiments individually or collaborate with classmates in real-time.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-teal-600 via-teal-500 to-teal-600 text-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Learning Experience?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-white/90">
            Join thousands of students already using Virtual Labs to enhance their scientific education.
          </p>
          {!isLoggedIn ? (
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button onClick={toggleRegistrationModal}
                className="px-8 py-3 bg-white text-teal-600 font-medium rounded-lg hover:bg-gray-50 
                  transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-teal-700/20">
                Register Now
              </button>
              <button onClick={toggleLoginModal}
                className="px-8 py-3 border-2 border-white text-white font-medium rounded-lg 
                  hover:bg-white hover:text-teal-600 transition-all duration-300 hover:-translate-y-0.5">
                Student Login
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('/labs')}
              className="px-8 py-3 bg-white text-teal-600 font-medium rounded-lg hover:bg-gray-50 
                transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-teal-700/20">
              Explore Labs
            </button>
          )}
        </div>
      </section>
      
      {/* Modal Overlays */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={closeModals}
          ></div>
          
          <div className="relative w-full max-w-md mx-auto p-6 z-10">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-xl shadow-xl shadow-black/30 overflow-hidden">
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700/50">
                <h2 className="text-xl font-bold text-white">Sign In</h2>
                <button 
                  onClick={closeModals}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6">
                <StudentLogin 
                  onClose={closeModals} 
                  onSwitchToRegister={switchToRegistration}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={closeModals}
          ></div>
          
          <div className="relative w-full max-w-2xl mx-auto p-6 z-10">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-xl shadow-xl shadow-black/30 overflow-hidden">
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700/50">
                <h2 className="text-xl font-bold text-white">Create Account</h2>
                <button 
                  onClick={closeModals}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6">
                <StudentRegistration 
                  onClose={closeModals} 
                  onSwitchToLogin={switchToLogin}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
