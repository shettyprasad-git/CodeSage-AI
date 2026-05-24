import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Editor from '@monaco-editor/react';
import { 
  FileCode, 
  Upload, 
  Github, 
  GitCompare, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  Download,
  MessageSquare,
  Send,
  Loader2,
  ListRestart,
  Plus
} from 'lucide-react';
import Toast from '../components/Toast';

export default function ReviewWorkspace() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reviewIdParam = searchParams.get('id');
  const repoUrlParam = searchParams.get('repo');

  // Input tabs state
  const [activeTab, setActiveTab] = useState('paste');
  const [editorContent, setEditorContent] = useState('// Paste your code here or upload files to begin review...\n');
  const [language, setLanguage] = useState('javascript');
  const [prDiff, setPrDiff] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [selectedRepoUrl, setSelectedRepoUrl] = useState('');
  
  // Repository fetching state
  const [reposList, setReposList] = useState([]);
  const [repoFiles, setRepoFiles] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  // Review states
  const [analyzing, setAnalyzing] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  
  // Chat drawer states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [sendingChat, setSendingChat] = useState(false);

  // UI state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [selectedIssueId, setSelectedIssueId] = useState(null);

  // Refs
  const editorRef = useRef(null);
  const chatBottomRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load repositories list for selection
  useEffect(() => {
    const fetchRepos = async () => {
      setLoadingRepos(true);
      try {
        const res = await fetch('/api/repos', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setReposList(data.data);
          
          // If query param repo matches, auto select and load its files
          if (repoUrlParam) {
            setSelectedRepoUrl(repoUrlParam);
            setActiveTab('github');
            handleSelectRepo(repoUrlParam, data.data);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingRepos(false);
      }
    };

    if (token) {
      fetchRepos();
    }
  }, [token, repoUrlParam]);

  // Load existing review if ID present in URL
  useEffect(() => {
    const fetchReview = async () => {
      try {
        setAnalyzing(true);
        const res = await fetch(`/api/reviews/${reviewIdParam}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setReviewData(data.data);
          setEditorContent(data.data.code || data.data.prDiff || '');
          setReviewTitle(data.data.title);
          if (data.data.prDiff) {
            setPrDiff(data.data.prDiff);
            setActiveTab('diff');
          }
          // Seed initial chat greetings
          setChatHistory([
            { role: 'ai', content: `Hello! I've loaded your review "${data.data.title}" (Score: ${data.data.score}%). You can ask me how to resolve any of the ${data.data.issues?.length || 0} issues identified.` }
          ]);
        }
      } catch (e) {
        setToastType('error');
        setToastMessage('Failed to retrieve review records');
      } finally {
        setAnalyzing(false);
      }
    };

    if (token && reviewIdParam) {
      fetchReview();
    }
  }, [token, reviewIdParam]);

  // Save Monaco Editor Instance
  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  // Scroll editor to target line
  const handleScrollToLine = (lineNum, issueId) => {
    setSelectedIssueId(issueId);
    if (editorRef.current && lineNum > 0) {
      editorRef.current.revealLineInCenter(lineNum);
      editorRef.current.setPosition({ lineNumber: lineNum, column: 1 });
      editorRef.current.focus();
    }
  };

  // Select repo and pull simulation files
  const handleSelectRepo = async (url, list = reposList) => {
    setSelectedRepoUrl(url);
    const matched = list.find(r => r.url === url);
    if (!matched) return;
    
    setLoadingRepos(true);
    try {
      // Simulate repo files payload (same as imported metadata)
      const res = await fetch('/api/repos/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ repoUrl: url })
      });
      const data = await res.json();
      if (data.success) {
        setRepoFiles(data.files || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleSelectRepoFile = (file) => {
    setEditorContent(file.content);
    setReviewTitle(`File Audit: ${selectedRepoUrl.split('/').pop()}/${file.path}`);
    
    // Auto-detect language
    const ext = file.path.split('.').pop().toLowerCase();
    const langMap = {
      'js': 'javascript', 'jsx': 'javascript',
      'ts': 'typescript', 'tsx': 'typescript',
      'py': 'python', 'java': 'java', 'json': 'json',
      'css': 'css', 'html': 'html'
    };
    setLanguage(langMap[ext] || 'javascript');
    setToastType('info');
    setToastMessage(`Loaded ${file.path} successfully.`);
  };

  // Handle Drag & Drop / File uploads
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setEditorContent(event.target.result);
      setReviewTitle(`Uploaded Audit: ${file.name}`);
      // Auto-detect language from extension
      const ext = file.name.split('.').pop().toLowerCase();
      const langMap = {
        'js': 'javascript', 'jsx': 'javascript',
        'ts': 'typescript', 'tsx': 'typescript',
        'py': 'python', 'java': 'java', 'json': 'json',
        'css': 'css', 'html': 'html'
      };
      setLanguage(langMap[ext] || 'javascript');
      setToastType('success');
      setToastMessage(`Loaded ${file.name} successfully.`);
    };
    reader.readAsText(file);
  };

  // Trigger Review analyze API
  const handleRunAnalysis = async () => {
    const content = activeTab === 'diff' ? prDiff : editorContent;
    if (!content || content.trim() === '' || content.startsWith('// Paste your code')) {
      setToastType('error');
      setToastMessage('Please enter code or upload file to generate report');
      return;
    }

    setAnalyzing(true);
    setReviewData(null);

    try {
      const res = await fetch('/api/reviews/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code: activeTab === 'diff' ? '' : content,
          prDiff: activeTab === 'diff' ? content : '',
          title: reviewTitle || undefined,
          language,
          repoUrl: activeTab === 'github' ? selectedRepoUrl : undefined
        })
      });
      const data = await res.json();

      if (data.success) {
        setReviewData(data.data);
        setToastType('success');
        setToastMessage(`Review generated via ${data.source}!`);
        // Seed chat assistant details
        setChatHistory([
          { role: 'ai', content: `Audit complete. Review Score: ${data.data.score}% (${data.data.issues?.length || 0} issues). Ask me anything to debug.` }
        ]);
        navigate(`/review?id=${data.data._id}`, { replace: true });
      } else {
        setToastType('error');
        setToastMessage(data.error || 'Failed to review code');
      }
    } catch (e) {
      setToastType('error');
      setToastMessage('Server error running AI Code Review');
    } finally {
      setAnalyzing(false);
    }
  };

  // Chat request method
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || sendingChat || !reviewData) return;

    const userMsg = chatMessage.trim();
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setSendingChat(true);

    // Auto scroll chat
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    try {
      const res = await fetch(`/api/reviews/${reviewData._id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMsg,
          chatHistory: chatHistory.filter(c => c.role !== 'ai').map(c => ({
            role: c.role,
            content: c.content
          }))
        })
      });
      const data = await res.json();

      if (data.success) {
        setChatHistory(prev => [...prev, { role: 'ai', content: data.response }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'ai', content: 'Apologies, I encountered an issue retrieving that answer.' }]);
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', content: 'Connection timed out. Check connection.' }]);
    } finally {
      setSendingChat(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Export PDF layout printer
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 relative">
      {/* Workspace Left input/editor column */}
      <div className="flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden min-w-0 h-full border border-gray-800/80">
        
        {/* Editor tab panel selector */}
        <div className="bg-[#0b0f19] px-4 py-2 border-b border-gray-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-1">
            {[
              { id: 'paste', label: 'Paste Code', icon: FileCode },
              { id: 'upload', label: 'Upload File', icon: Upload },
              { id: 'github', label: 'GitHub Repo', icon: Github },
              { id: 'diff', label: 'PR Diff', icon: GitCompare }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'diff') setLanguage('diff');
                }}
                disabled={reviewIdParam !== null}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  activeTab === tab.id
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20'
                    : 'text-gray-400 hover:text-gray-200 disabled:opacity-40'
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            {activeTab !== 'diff' && (
              <select
                className="bg-gray-900 border border-gray-800/80 rounded-lg px-2.5 py-1.5 text-xs text-gray-300 outline-none"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={reviewIdParam !== null}
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="json">JSON</option>
              </select>
            )}

            {reviewIdParam ? (
              <button
                onClick={() => {
                  navigate('/review');
                  setReviewData(null);
                  setEditorContent('// Paste your code here or upload files to begin review...\n');
                  setReviewTitle('');
                  setPrDiff('');
                  setActiveTab('paste');
                }}
                className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-lg border border-gray-700/60 flex items-center space-x-1.5 transition-colors"
              >
                <ListRestart className="h-3.5 w-3.5" />
                <span>Reset Editor</span>
              </button>
            ) : (
              <button
                onClick={handleRunAnalysis}
                disabled={analyzing}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 text-xs font-bold text-white rounded-lg flex items-center space-x-1.5 transition-colors shadow shadow-indigo-600/30"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Auditing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Run AI Review</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Inner Tab Workspaces */}
        <div className="flex-1 min-h-0 relative bg-[#030712]">
          
          {/* Paste / Editor interface */}
          {activeTab === 'paste' && (
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={editorContent}
              onChange={(val) => setEditorContent(val || '')}
              onMount={handleEditorMount}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                readOnly: reviewIdParam !== null
              }}
            />
          )}

          {/* Drag & Drop File input workspace */}
          {activeTab === 'upload' && (
            reviewIdParam ? (
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={editorContent}
                onMount={handleEditorMount}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  readOnly: true
                }}
              />
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-4 rounded-xl border border-dashed border-gray-800 hover:border-indigo-500/50 hover:bg-indigo-500/3 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer text-center"
              >
                <Upload className="h-10 w-10 text-gray-500 mb-3 animate-float" />
                <p className="text-sm font-semibold text-white">Click or Drag File Here</p>
                <p className="text-xs text-gray-500 mt-1">Supports JS, PY, TS, Java, HTML, CSS, JSON text streams.</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
              </div>
            )
          )}

          {/* GitHub Repository selector / folder checklists */}
          {activeTab === 'github' && (
            reviewIdParam ? (
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={editorContent}
                onMount={handleEditorMount}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  readOnly: true
                }}
              />
            ) : (
              <div className="absolute inset-0 flex h-full">
                {/* Repository File Tree */}
                <div className="w-64 border-r border-gray-800/80 bg-gray-950/40 p-4 flex flex-col shrink-0">
                  <div className="space-y-1.5 mb-4 shrink-0">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Connect Repository</label>
                    <select
                      className="bg-gray-900 border border-gray-800 w-full rounded-lg px-2.5 py-1.5 text-xs text-gray-300 outline-none"
                      value={selectedRepoUrl}
                      onChange={(e) => handleSelectRepo(e.target.value)}
                    >
                      <option value="">Select a repository...</option>
                      {reposList.map(r => (
                        <option key={r._id} value={r.url}>{r.owner}/{r.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-1">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2.5">Repo Files</p>
                    {loadingRepos ? (
                      <div className="flex items-center space-x-2 py-4 justify-center text-xs text-gray-500">
                        <Loader2 className="h-4.5 w-4.5 animate-spin text-indigo-500" />
                        <span>Loading file tree...</span>
                      </div>
                    ) : repoFiles.length === 0 ? (
                      <p className="text-xs text-gray-600 italic">No files available. Select a repository to pull files.</p>
                    ) : (
                      <div className="space-y-1">
                        {repoFiles.map((file, i) => (
                          <button
                            key={i}
                            onClick={() => handleSelectRepoFile(file)}
                            className="flex items-center space-x-2 px-2.5 py-2 w-full text-left rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-900 transition-colors"
                          >
                            <FileCode className="h-4 w-4 text-indigo-400 shrink-0" />
                            <span className="truncate">{file.path}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Editor display side */}
                <div className="flex-1 h-full min-w-0">
                  <Editor
                    height="100%"
                    language={language}
                    theme="vs-dark"
                    value={editorContent}
                    onChange={(val) => setEditorContent(val || '')}
                    onMount={handleEditorMount}
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      lineNumbers: 'on',
                    }}
                  />
                </div>
              </div>
            )
          )}

          {/* Pull Request Diff paste interface */}
          {activeTab === 'diff' && (
            reviewIdParam ? (
              <Editor
                height="100%"
                language="diff"
                theme="vs-dark"
                value={editorContent}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  readOnly: true
                }}
              />
            ) : (
              <textarea
                placeholder="Paste your git diff file here..."
                className="w-full h-full bg-[#030712] font-mono text-sm text-indigo-200 p-6 outline-none resize-none leading-relaxed border-none"
                value={prDiff}
                onChange={(e) => setPrDiff(e.target.value)}
              />
            )
          )}

        </div>
      </div>

      {/* Workspace Right review output column */}
      <div className="w-full md:w-96 glass-panel rounded-2xl p-6 flex flex-col justify-between shrink-0 h-full border border-gray-800/80">
        
        {/* Loader or Mock instructions */}
        {!reviewData ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <Sparkles className="h-8 w-8 text-indigo-500/80 mb-3 animate-float" />
            <h4 className="text-sm font-semibold text-white">Auditing Workspace</h4>
            <p className="text-xs text-gray-500 max-w-xs mt-1.5 leading-relaxed">
              Load your script or repository file into the code editor on the left and click &ldquo;Run AI Review&rdquo; to pull AI diagnosis cards.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between h-full min-h-0">
            
            {/* Header: Score, Verdict, print button */}
            <div className="pb-4 border-b border-gray-800/80 mb-4 shrink-0">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate max-w-[180px]">
                  {reviewData.title}
                </span>
                
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={handleExportPDF}
                    className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors"
                    title="Export report"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setChatOpen(true)}
                    className="p-1.5 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 transition-colors"
                    title="Ask AI Chat"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-gray-900/60 p-3 rounded-xl border border-gray-800/80">
                <div className="text-center">
                  <span className="text-xs text-gray-500 block">Health Index</span>
                  <span className={`text-xl font-extrabold ${reviewData.score >= 80 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {reviewData.score}%
                  </span>
                </div>
                
                <div className="h-8 w-[1px] bg-gray-800"></div>

                <div className="text-center">
                  <span className="text-xs text-gray-500 block">Verdict</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center space-x-1 mt-0.5 ${
                    reviewData.status === 'approved' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {reviewData.status === 'approved' ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                        <span>Approve</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 shrink-0" />
                        <span>Needs Work</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="h-8 w-[1px] bg-gray-800"></div>

                <div className="text-center">
                  <span className="text-xs text-gray-500 block">Confidence</span>
                  <span className="text-xs font-bold text-gray-300 mt-1.5 block">
                    {reviewData.confidenceScore || 85}%
                  </span>
                </div>
              </div>
            </div>

            {/* List of Issue cards */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 mb-4 select-none">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                Audit Warnings ({reviewData.issues?.length || 0})
              </span>
              
              {reviewData.issues?.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-4">No warnings found. Code matches standard security measures.</p>
              ) : (
                reviewData.issues.map((issue, idx) => (
                  <div
                    key={issue._id || idx}
                    onClick={() => handleScrollToLine(issue.line, issue._id || idx)}
                    className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                      selectedIssueId === (issue._id || idx)
                        ? 'bg-indigo-600/10 border-indigo-500 shadow-md shadow-indigo-600/5'
                        : 'bg-gray-900/40 border-gray-800/80 hover:border-gray-700/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded ${
                        issue.severity === 'critical' ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
                        issue.severity === 'high' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20' :
                        issue.severity === 'medium' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' :
                        'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                      }`}>
                        {issue.severity}
                      </span>
                      
                      <span className="text-[10px] font-bold text-gray-500 shrink-0">
                        Line {issue.line}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-white mb-1.5">{issue.title}</h5>
                    <p className="text-[11px] text-gray-400 leading-normal mb-2">{issue.description}</p>
                    
                    {issue.suggestion && selectedIssueId === (issue._id || idx) && (
                      <div className="mt-2.5 pt-2.5 border-t border-gray-800/80 space-y-1">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Suggested Action:</span>
                        <p className="text-[10px] text-indigo-300 leading-normal mb-2">{issue.suggestion}</p>
                        {issue.snippet && (
                          <pre className="p-2 bg-black/60 rounded-lg text-[9px] font-mono text-emerald-400 border border-gray-800/60 overflow-x-auto">
                            {issue.snippet}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Quick action: Open chat assistant */}
            <div className="pt-3 border-t border-gray-800/80 shrink-0">
              <button
                onClick={() => setChatOpen(true)}
                className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
              >
                <MessageSquare className="h-4 w-4 text-indigo-400" />
                <span>Ask AI Debugger</span>
              </button>
            </div>

          </div>
        )}
      </div>

      {/* AI Chat drawer overlay panel */}
      {chatOpen && reviewData && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs flex justify-end">
          {/* Click outside to close */}
          <div className="absolute inset-0 -z-10" onClick={() => setChatOpen(false)}></div>
          
          <div className="w-full max-w-md bg-[#0b0f19] border-l border-gray-800 flex flex-col h-full shadow-2xl relative animate-slide-in">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>

            {/* Chat Header */}
            <div className="p-5 border-b border-gray-800/80 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">AI Review Debugger</h4>
                  <p className="text-[10px] text-gray-500 font-medium">Analyzing: {reviewData.title}</p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {chatHistory.map((ch, i) => (
                <div key={i} className={`flex flex-col ${ch.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                    ch.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'glass-panel text-gray-200 border-gray-800/60 rounded-tl-none'
                  }`}>
                    {ch.content}
                  </div>
                </div>
              ))}
              {sendingChat && (
                <div className="flex items-center space-x-2 text-xs text-gray-500 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                  <span>AI is formulating response...</span>
                </div>
              )}
              <div ref={chatBottomRef}></div>
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendChat} className="p-4 border-t border-gray-800/80 flex items-center gap-2 bg-gray-950/40 shrink-0">
              <input
                type="text"
                placeholder="Ask how to refactor SQL execution..."
                className="glass-input flex-1 px-3.5 py-2.5 text-xs outline-none"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                disabled={sendingChat}
              />
              <button
                type="submit"
                disabled={sendingChat || !chatMessage.trim()}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 text-white rounded-lg transition-colors shadow shadow-indigo-600/10"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
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
