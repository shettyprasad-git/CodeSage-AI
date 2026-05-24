import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Code2, 
  BarChart3, 
  Settings2, 
  LogOut, 
  Terminal,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout, settings } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Code Review', path: '/review', icon: Code2 },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings2 }
  ];

  return (
    <aside className="w-64 glass-panel border-r border-gray-800/80 flex flex-col h-screen sticky top-0 left-0 z-20">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-800/80 flex items-center space-x-2">
        <div className="p-1.5 rounded-md bg-indigo-600/20 border border-indigo-500/30">
          <Terminal className="h-5 w-5 text-indigo-400" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">
          CodeSage <span className="text-indigo-400 font-medium">AI</span>
        </span>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500 shadow-md shadow-indigo-600/5'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/40 border-l-2 border-transparent'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Session card */}
      <div className="p-4 border-t border-gray-800/80 space-y-4">
        {settings?.hasGeminiKey && (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Custom Gemini Key Active</span>
          </div>
        )}
        
        <div className="flex items-center space-x-3 px-2">
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.username} 
              className="h-9 w-9 rounded-full ring-2 ring-indigo-500/20 object-cover"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-inner">
              {user?.username ? user.username.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-all duration-150"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
