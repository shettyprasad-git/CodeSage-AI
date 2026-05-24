import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Terminal, Lock, Mail, User, ArrowRight, Loader2 } from 'lucide-react';
import Toast from '../components/Toast';

export default function Signup() {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setToastType('error');
      setToastMessage('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setToastType('error');
      setToastMessage('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(username, email, password);
    setLoading(false);

    if (result.success) {
      setToastType('success');
      setToastMessage('Account created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } else {
      setToastType('error');
      setToastMessage(result.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#050814] flex flex-col justify-center items-center px-4 relative">
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/3 w-[30rem] h-[30rem] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/3 w-[25rem] h-[25rem] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse-slow"></div>

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 rounded-lg bg-indigo-600/20 border border-indigo-500/30 group-hover:border-indigo-500/60 transition-colors duration-300">
              <Terminal className="h-6 w-6 text-indigo-400" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              CodeSage <span className="text-indigo-400 font-medium">AI</span>
            </span>
          </Link>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-white text-center">Create Your Account</h2>
          <p className="mt-1 text-sm text-gray-500 text-center">Deploy reviews in seconds with AI automation</p>
        </div>

        <div className="glass-card p-8 border border-gray-800/80 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Username field */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  placeholder="codesage_dev"
                  className="glass-input w-full pl-10 pr-4 py-2.5 text-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Email field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="glass-input w-full pl-10 pr-4 py-2.5 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="Min. 6 characters"
                  className="glass-input w-full pl-10 pr-4 py-2.5 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-lg shadow-indigo-600/20 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs">
            <span className="text-gray-500">Already have an account? </span>
            <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage('')}
        />
      )}
    </div>
  );
}
