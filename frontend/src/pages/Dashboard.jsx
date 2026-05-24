import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  GitPullRequest, 
  History, 
  ShieldAlert, 
  Layers, 
  FolderGit, 
  TrendingUp,
  Github,
  Star,
  GitFork,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Toast from '../components/Toast';

export default function Dashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [repos, setRepos] = useState([]);
  const [history, setHistory] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Analytics Summary
      const summaryRes = await fetch('/api/analytics/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const summaryData = await summaryRes.json();
      
      // 2. Fetch Repositories
      const reposRes = await fetch('/api/repos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const reposData = await reposRes.json();

      // 3. Fetch History
      const historyRes = await fetch('/api/reviews?limit=5', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const historyData = await historyRes.json();

      if (summaryData.success && reposData.success && historyData.success) {
        setStats(summaryData.data.stats);
        setRepos(reposData.data);
        setHistory(historyData.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      setToastType('error');
      setToastMessage('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const handleImportRepo = async (e) => {
    e.preventDefault();
    if (!repoUrl) return;

    setImporting(true);
    try {
      const res = await fetch('/api/repos/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ repoUrl })
      });
      const data = await res.json();

      if (data.success) {
        setToastType('success');
        setToastMessage(`Successfully imported ${data.repository.name}! Initial audit complete.`);
        setShowImportModal(false);
        setRepoUrl('');
        fetchDashboardData();
        // Option to navigate straight to the created review
        if (data.initialReview) {
          setTimeout(() => {
            navigate(`/review?id=${data.initialReview._id}`);
          }, 1500);
        }
      } else {
        setToastType('error');
        setToastMessage(data.error || 'Failed to import repository');
      }
    } catch (error) {
      setToastType('error');
      setToastMessage('Server error importing repository');
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 py-4">
        <div className="h-10 bg-gray-800 rounded w-1/4 animate-pulse"></div>
        <LoadingSkeleton type="stats" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <LoadingSkeleton type="card" />
          </div>
          <div className="space-y-6">
            <LoadingSkeleton type="list" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-2">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <span>Welcome, {user?.username}</span>
            <Sparkles className="h-5 w-5 text-indigo-400 animate-float" />
          </h1>
          <p className="text-gray-400 text-sm mt-1">Review activity, vulnerability metrics, and recent repository audits.</p>
        </div>
        
        <div className="flex gap-3">
          <Link
            to="/review"
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white text-sm font-semibold rounded-xl border border-gray-800 transition-colors"
          >
            New Code Audit
          </Link>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Connect GitHub</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Code Quality Score', 
            value: `${stats?.averageScore || 100}%`, 
            desc: 'Average code score', 
            icon: TrendingUp, 
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10'
          },
          { 
            label: 'Total Reviews Run', 
            value: stats?.totalReviews || 0, 
            desc: 'Audit reports saved', 
            icon: GitPullRequest, 
            color: 'text-purple-400',
            bg: 'bg-purple-500/10'
          },
          { 
            label: 'Imported Repos', 
            value: stats?.totalRepos || 0, 
            desc: 'Connected repositories', 
            icon: FolderGit, 
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10'
          },
          { 
            label: 'Total Issues Flagged', 
            value: stats?.totalIssues || 0, 
            desc: 'Bugs & vulnerabilities', 
            icon: ShieldAlert, 
            color: stats?.totalIssues > 0 ? 'text-rose-400' : 'text-emerald-400',
            bg: stats?.totalIssues > 0 ? 'bg-rose-500/10' : 'bg-emerald-500/10'
          }
        ].map((card, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between h-32 hover:border-gray-700/60 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{card.label}</p>
                <p className="text-2xl font-extrabold text-white mt-1.5">{card.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.bg} ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-gray-400 font-medium truncate">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Workspace content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Repositories */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-800/80 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <FolderGit className="h-4.5 w-4.5 text-indigo-400" />
                <span>Connected Repositories</span>
              </h3>
              {repos.length > 0 && (
                <span className="text-xs font-medium text-gray-500">{repos.length} total</span>
              )}
            </div>

            {repos.length === 0 ? (
              <div className="py-12 text-center">
                <Github className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-white mb-1">No repositories connected yet</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto mb-4">Import public or private repositories via URLs to scan code components.</p>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-xs font-semibold rounded-lg transition-colors"
                >
                  Connect first repository
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-800/50">
                {repos.map((repo) => (
                  <div key={repo._id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div className="space-y-1 pr-4 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white hover:text-indigo-400 transition-colors truncate">
                          {repo.owner}/{repo.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-gray-800 text-[10px] font-medium text-gray-400">
                          {repo.language}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{repo.url}</p>
                    </div>

                    <div className="flex items-center space-x-6 shrink-0">
                      <div className="hidden sm:flex items-center space-x-3 text-xs text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Star className="h-3.5 w-3.5 text-yellow-500/80" />
                          <span>{repo.stars}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <GitFork className="h-3.5 w-3.5 text-gray-500" />
                          <span>{repo.forks}</span>
                        </div>
                      </div>
                      <Link
                        to={`/review?repo=${encodeURIComponent(repo.url)}`}
                        className="p-2 rounded-lg bg-gray-800/80 border border-gray-700/50 text-gray-400 hover:text-white transition-colors"
                        title="Audit files"
                      >
                        <ChevronRight className="h-4.5 w-4.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Review History checklist */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-800/80 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <History className="h-4.5 w-4.5 text-indigo-400" />
                <span>Recent Reviews</span>
              </h3>
              <Link to="/analytics" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-0.5">
                <span>View charts</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {history.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <p className="text-xs">No saved review history yet.</p>
                <Link to="/review" className="text-xs font-semibold text-indigo-400 hover:underline mt-1.5 block">Analyze code now</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((review) => (
                  <div
                    key={review._id}
                    onClick={() => navigate(`/review?id=${review._id}`)}
                    className="p-3 rounded-xl bg-gray-900/40 border border-gray-800/60 hover:border-indigo-500/20 hover:bg-gray-900/60 transition-all duration-200 cursor-pointer flex justify-between items-center"
                  >
                    <div className="min-w-0 pr-2 space-y-1">
                      <p className="text-sm font-semibold text-white truncate">{review.title}</p>
                      <div className="flex items-center space-x-2 text-[10px] text-gray-500">
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="capitalize">{review.issues?.length || 0} issues</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        review.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {review.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Github Repository Link Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-card border border-gray-800 relative overflow-hidden animate-scale-up">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500"></div>
            
            <div className="p-6">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2 mb-2">
                <Github className="h-5 w-5 text-indigo-400" />
                <span>Import GitHub Repository</span>
              </h3>
              <p className="text-xs text-gray-400 mb-6">Enter a public repository URL. CodeSage will fetch metadata and list code segments for audit.</p>

              <form onSubmit={handleImportRepo} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Repository URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/facebook/react"
                    className="glass-input w-full px-3.5 py-2.5 text-sm"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false);
                      setRepoUrl('');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={importing}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 text-xs font-semibold text-white rounded-lg transition-colors flex items-center space-x-1.5"
                  >
                    {importing ? (
                      <>
                        <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <span>Import Repo</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
