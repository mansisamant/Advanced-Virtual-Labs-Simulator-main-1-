import { useState } from 'react';
import { User, Mail, Lock, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function StudentRegistration({ onClose, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    agreeToTerms: false
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null); // null, 'success', 'error'
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setRegistrationStatus(null);
    setStatusMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        setRegistrationStatus('success');
        setStatusMessage('Registration successful! Redirecting to login...');
        
        setTimeout(() => {
          onSwitchToLogin(); // switch to login view
        }, 2000);
      } else {
        setRegistrationStatus('error');
        setStatusMessage(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setRegistrationStatus('error');
      setStatusMessage('An error occurred. Please try again later.');
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900">
      
      <main className={`${onClose ? '' : 'pt-24 pb-12'} container mx-auto px-4 flex items-center justify-center`}>
        <div className="w-full max-w-2xl">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-xl shadow-black/30 overflow-hidden p-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
              <p className="text-gray-400 mt-2">Join the virtual labs community</p>
            </div>
            
            {registrationStatus && (
              <div className={`mb-6 p-4 rounded-lg flex items-center ${
                registrationStatus === 'success' 
                  ? 'bg-green-500/20 border border-green-500/30 text-green-300' 
                  : 'bg-red-500/20 border border-red-500/30 text-red-300'
              }`}>
                {registrationStatus === 'success' ? (
                  <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                )}
                <span>{statusMessage}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name fields (first and last) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2.5 bg-gray-800/60 border ${errors.firstName ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500`}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2.5 bg-gray-800/60 border ${errors.lastName ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>
                  )}
                </div>
              </div>
              
              {/* Email field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 bg-gray-800/60 border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500`}
                    placeholder="your.email@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>
              
              {/* Student ID field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="studentId">
                  Student ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="studentId"
                    name="studentId"
                    type="text"
                    value={formData.studentId}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 bg-gray-800/60 border ${errors.studentId ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500`}
                    placeholder="e.g., S12345678"
                  />
                </div>
                {errors.studentId && (
                  <p className="mt-1 text-sm text-red-400">{errors.studentId}</p>
                )}
              </div>
              
              {/* Password fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2.5 bg-gray-800/60 border ${errors.password ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2.5 bg-gray-800/60 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
              
              {/* Terms and Conditions */}
              <div className="flex items-start mt-4">
                <div className="flex items-center h-5">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className={`h-4 w-4 text-teal-500 focus:ring-teal-500 bg-gray-800 border-gray-700 rounded ${errors.agreeToTerms ? 'border-red-500' : ''}`}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agreeToTerms" className="font-medium text-gray-300">
                    I agree to the <a href="#" className="text-teal-400 hover:text-teal-300 transition-colors">Terms and Conditions</a> and <a href="#" className="text-teal-400 hover:text-teal-300 transition-colors">Privacy Policy</a>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="mt-1 text-sm text-red-400">{errors.agreeToTerms}</p>
                  )}
                </div>
              </div>
              
              {/* Registration Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2.5 px-4 mt-6 rounded-lg shadow-lg shadow-teal-900/20 text-white font-medium bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:opacity-70 transition-colors"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Registering...
                  </span>
                ) : 'Create Account'}
              </button>
              
              {/* Login link */}
              <div className="text-center mt-6">
                <p className="text-sm text-gray-400">
                  Already have an account?{' '}
                  {onSwitchToLogin ? (
                    <button
                      type="button"
                      onClick={onSwitchToLogin}
                      className="font-medium text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      Sign in instead
                    </button>
                  ) : (
                    <a href="/login" className="font-medium text-teal-400 hover:text-teal-300 transition-colors">
                      Sign in instead
                    </a>
                  )}
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}