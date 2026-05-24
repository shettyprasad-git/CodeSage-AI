import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('codesage_token') || null);
  const [settings, setSettings] = useState(null);
  
  const API_URL = import.meta.env.VITE_API_URL || '';

  // Fetch logged in user profile when token changes
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setUser(null);
        setSettings(null);
        setLoading(false);
        return;
      }

      try {
        // Fetch current user
        const userRes = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = await userRes.json();

        if (userData.success) {
          setUser(userData.data);
          
          // Fetch settings
          const settingsRes = await fetch(`${API_URL}/api/settings`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const settingsData = await settingsRes.json();
          if (settingsData.success) {
            setSettings(settingsData.data);
          }
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (error) {
        console.error('Error loading session profile:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('codesage_token', data.data.token);
        setToken(data.data.token);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('codesage_token', data.data.token);
        setToken(data.data.token);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  const logout = () => {
    localStorage.removeItem('codesage_token');
    setToken(null);
    setUser(null);
    setSettings(null);
  };

  const updateUserSettings = async (updatedSettings) => {
    if (!token) return { success: false };

    try {
      const res = await fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedSettings)
      });
      const data = await res.json();

      if (data.success) {
        setSettings(data.data);
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error };
    } catch (error) {
      return { success: false, error: 'Failed to save settings' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        settings,
        login,
        register,
        logout,
        updateUserSettings
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
