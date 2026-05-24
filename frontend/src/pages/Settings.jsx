import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Settings2, 
  Key, 
  Github, 
  Bell, 
  Palette, 
  Save, 
  Loader2, 
  CheckCircle2, 
  Eye, 
  EyeOff
} from 'lucide-react';
import Toast from '../components/Toast';

export default function Settings() {
  const { settings, updateUserSettings } = useAuth();
  
  const [theme, setTheme] = useState('dark');
  const [geminiKey, setGeminiKey] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [emailNotify, setEmailNotify] = useState(true);
  const [pushNotify, setPushNotify] = useState(false);

  // Field visibilities
  const [showGemini, setShowGemini] = useState(false);
  const [showGithub, setShowGithub] = useState(false);

  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    if (settings) {
      setTheme(settings.theme || 'dark');
      setGeminiKey(settings.geminiKey || '');
      setGithubToken(settings.githubToken || '');
      setEmailNotify(settings.notifications?.email ?? true);
      setPushNotify(settings.notifications?.push ?? false);
    }
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const result = await updateUserSettings({
      theme,
      geminiKey,
      githubToken,
      notifications: {
        email: emailNotify,
        push: pushNotify
      }
    });
    setSaving(false);

    if (result.success) {
      setToastType('success');
      setToastMessage(result.message || 'Settings updated successfully');
    } else {
      setToastType('error');
      setToastMessage(result.error || 'Failed to update settings');
    }
  };

  return (
    <div className="space-y-8 py-2 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <span>Settings</span>
          <Settings2 className="h-6 w-6 text-indigo-400" />
        </h1>
        <p className="text-gray-400 text-sm mt-1">Configure your personal LLM api tokens, repository connectors, and notifications.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: API Integrations */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800/80 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-gray-800/80 flex items-center space-x-2 shrink-0">
            <Key className="h-4.5 w-4.5 text-indigo-400" />
            <span>LLM & GitHub Access Tokens</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gemini Key */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Custom Gemini API Key</label>
              <div className="relative">
                <input
                  type={showGemini ? 'text' : 'password'}
                  placeholder="AI API Key (starts with AIza...)"
                  className="glass-input w-full px-3.5 py-2.5 pr-10 text-xs"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowGemini(!showGemini)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-white"
                >
                  {showGemini ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[10px] text-gray-500 leading-normal">
                If configured, CodeSage uses your key to run reviews, bypassing backend quotas.
              </p>
            </div>

            {/* GitHub Token */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">GitHub Personal Access Token</label>
              <div className="relative">
                <input
                  type={showGithub ? 'text' : 'password'}
                  placeholder="GitHub PAT (starts with ghp_...)"
                  className="glass-input w-full px-3.5 py-2.5 pr-10 text-xs"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowGithub(!showGithub)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-white"
                >
                  {showGithub ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[10px] text-gray-500 leading-normal">
                Increases Github REST API limits to sync larger repositories.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Layout & Aesthetics */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800/80 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-gray-800/80 flex items-center space-x-2 shrink-0">
            <Palette className="h-4.5 w-4.5 text-purple-400" />
            <span>Theme Configuration</span>
          </h3>

          <div className="space-y-2 max-w-xs">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Theme</label>
            <select
              className="bg-gray-900 border border-gray-800/80 w-full rounded-lg px-2.5 py-2 text-xs text-gray-300 outline-none"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="dark">Deep Space (Dark Theme)</option>
              <option value="light" disabled>Nebula Glow (Light Theme - Coming Soon)</option>
            </select>
          </div>
        </div>

        {/* Section 3: Notification Preferences */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800/80 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-gray-800/80 flex items-center space-x-2 shrink-0">
            <Bell className="h-4.5 w-4.5 text-cyan-400" />
            <span>Notification Settings</span>
          </h3>

          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded bg-gray-900 border-gray-800 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                checked={emailNotify}
                onChange={(e) => setEmailNotify(e.target.checked)}
              />
              <div className="text-xs">
                <span className="font-semibold text-white block">Email Alerts</span>
                <span className="text-gray-500">Receive summary reports after automated PR audits.</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded bg-gray-900 border-gray-800 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                checked={pushNotify}
                onChange={(e) => setPushNotify(e.target.checked)}
              />
              <div className="text-xs">
                <span className="font-semibold text-white block">In-browser Push Notifications</span>
                <span className="text-gray-500">Get warnings inside the sidebar when team collaborations review code.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/45 text-sm font-semibold text-white rounded-xl shadow-lg shadow-indigo-600/20 flex items-center space-x-2 transition-colors duration-200"
          >
            {saving ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                <span>Saving configurations...</span>
              </>
            ) : (
              <>
                <Save className="h-4.5 w-4.5" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </form>

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
