import { useState, useContext } from 'react';
import { User, Lock, AlertCircle, Loader, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './hooks/userContext';

export default function StudentLogin({ onClose, onSwitchToRegister }) {
  const navigate = useNavigate();
  const { setUser, setIsLoggedIn } = useContext(UserContext);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSuccess = (userData) => {
    // Store user data in context and localStorage
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isLoggedIn', true);
    
    // Close modal if we're in a modal
    if (onClose) {
      onClose();
    }
    
    // Navigate based on role
    if (userData.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setLoginError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      // Extract user data from response
      const userData = {
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        id: data.user.id,
        role: data.user.role || 'user',
        studentId: data.user.studentId
      };

      handleLoginSuccess(userData);
      onClose(); // Close the modal after successful login
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900">
      
      <main className={`${onClose ? '' : 'pt-24 pb-12'} container mx-auto px-4 flex items-center justify-center`}>
        <div className="w-full max-w-md">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-xl shadow-black/30 overflow-hidden p-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">Sign In</h2>
              <p className="text-gray-400 mt-2">Access your virtual labs account</p>
            </div>

            {loginError && (
              <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 pr-3 py-2.5 bg-gray-800/60 border ${errors.email ? 'border-red-500' : 'border-gray-700'} w-full rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500`}
                    placeholder="your@email.com"
                  />
                </div>
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 pr-3 py-2.5 bg-gray-800/60 border ${errors.password ? 'border-red-500' : 'border-gray-700'} w-full rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium rounded-lg hover:from-teal-600 hover:to-teal-700 disabled:opacity-70 transition-colors shadow-lg shadow-teal-900/20 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Signing in...
                  </span>
                ) : 'Sign in'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{' '}
                {onSwitchToRegister ? (
                  <button onClick={onSwitchToRegister} className="text-teal-400 font-medium hover:text-teal-300 transition-colors">
                    Register now
                  </button>
                ) : (
                  <a href="/register" className="text-teal-400 font-medium hover:text-teal-300 transition-colors">
                    Register now
                  </a>
                )}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}