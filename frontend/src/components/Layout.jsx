import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import { Loader2 } from 'lucide-react';

export default function Layout({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050814] flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
          <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full"></div>
        </div>
        <p className="mt-4 text-sm text-gray-400 font-medium">Securing session...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Let the useEffect redirect
  }

  return (
    <div className="flex bg-[#050814] min-h-screen text-gray-100 overflow-hidden">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main content space */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        {/* Decorative background glows */}
        <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-1/4 w-[30rem] h-[30rem] bg-pink-600/3 rounded-full blur-[100px] pointer-events-none -z-10"></div>

        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
