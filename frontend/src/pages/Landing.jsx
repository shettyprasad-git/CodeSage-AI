import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Terminal, 
  ShieldAlert, 
  Cpu, 
  Zap, 
  Sparkles,
  GitPullRequest,
  CheckCircle,
  FileCode,
  Github,
  Play
} from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Landing() {
  const [demoCode, setDemoCode] = useState(`function authenticateUser(user) {
  // TODO: Secure key storage
  const secretKey = "api_secret_key_88998";
  
  if (user.role == 'admin') {
    const access = eval(user.accessString);
    return access;
  }
  return false;
}`);
  
  const [demoIssues, setDemoIssues] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const triggerDemoReview = () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setDemoIssues([]);
    
    // Simulate AI review timing
    setTimeout(() => {
      setDemoIssues([
        {
          type: 'security',
          line: 3,
          title: 'Hardcoded API Key',
          description: 'A raw secret key is stored in source code. This leaves keys vulnerable in code repository history.',
          severity: 'critical'
        },
        {
          type: 'security',
          line: 5,
          title: 'Loose equality check',
          description: 'Using `==` allows JavaScript engine type coercion, which can bypass role validation checks.',
          severity: 'medium'
        },
        {
          type: 'bug',
          line: 6,
          title: 'Dangerous Eval execution',
          description: 'Using `eval()` executes code dynamically. If the parameter accessString is modified by the user, it leads to remote code execution.',
          severity: 'critical'
        }
      ]);
      setIsAnalyzing(false);
    }, 1800);
  };

  return (
    <div className="bg-[#050814] text-gray-100 min-h-screen relative font-sans">
      <Navbar />

      {/* Decorative background glows */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -z-10 animate-pulse-slow"></div>
      <div className="absolute top-80 right-1/4 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 md:pt-40 md:pb-28 text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300 mb-8 animate-float">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Intelligent Code Reviews are Here</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Automate Pull Request Reviews <br />
          <span className="text-gradient">With AI Precision</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
          “Your AI-Powered Senior Developer for Every Pull Request.” Automatically scans bugs, security leaks, code smells, and blocks performance sinks in seconds.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>Start Reviewing Free</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#demo"
            className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white font-semibold rounded-xl border border-gray-800/80 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Play className="h-4.5 w-4.5 text-indigo-400" />
            <span>Try Live Demo</span>
          </a>
        </div>

        {/* Floating statistics cards mockup */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { label: 'Security Flaws Found', value: '150k+' },
            { label: 'Average Code Score Raise', value: '+18%' },
            { label: 'Minutes Saved per PR', value: '35m' },
            { label: 'Dev Teams Enrolled', value: '2,400+' }
          ].map((stat, i) => (
            <div key={i} className="glass-panel p-4 rounded-xl text-center">
              <p className="text-2xl md:text-3xl font-extrabold text-white mb-1">{stat.value}</p>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </header>

      {/* Feature Showcase Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-gray-900/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Complete Static & AI Security Analysis</h2>
          <p className="text-gray-400">CodeSage runs deeper audits than standard checkers to isolate risks instantly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Security vulnerabilities */}
          <div className="glass-panel p-8 rounded-2xl border-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300 relative group overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-red-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 w-fit mb-6">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Vulnerability Scan</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Detect exposed tokens, SQL/NoSQL injections, CSRF issues, and outdated dependencies before they hit production branches.
            </p>
          </div>

          {/* Card 2: Performance metrics */}
          <div className="glass-panel p-8 rounded-2xl border-purple-500/10 hover:border-purple-500/30 transition-all duration-300 relative group overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 w-fit mb-6">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Performance Optimizations</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Flag blocking I/O calls, inefficient loop nests, missing caching wrappers, and heavy library loads with drop-in code fixes.
            </p>
          </div>

          {/* Card 3: Code smells & styling */}
          <div className="glass-panel p-8 rounded-2xl border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300 relative group overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 w-fit mb-6">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Style & Refactoring</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Enforce structural styling, highlight spaghetti methods, identify duplicate blocks, and advise on variable naming clarity.
            </p>
          </div>
        </div>
      </section>

      {/* Live AI Review Demo Sandbox */}
      <section id="demo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-gray-900/60 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">See CodeSage AI in Action</h2>
          <p className="text-gray-400">Trigger reviews on the sample JS script below and observe the diagnostic outputs.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
          {/* Left Panel: Monaco Mock Code input */}
          <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-[400px]">
            <div className="bg-[#0b0f19] px-4 py-3 border-b border-gray-800/80 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FileCode className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-semibold text-gray-300">authService.js</span>
              </div>
              <button
                onClick={triggerDemoReview}
                disabled={isAnalyzing}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 text-xs font-bold text-white rounded-lg flex items-center space-x-1.5 transition-all duration-200"
              >
                {isAnalyzing ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Auditing...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3" />
                    <span>Run Review</span>
                  </>
                )}
              </button>
            </div>
            
            <textarea
              className="flex-1 w-full bg-[#030712] font-mono text-sm text-indigo-200 p-4 outline-none resize-none overflow-y-auto leading-relaxed border-none"
              value={demoCode}
              onChange={(e) => setDemoCode(e.target.value)}
              disabled={isAnalyzing}
            />
          </div>

          {/* Right Panel: AI Review Output simulator */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between h-[400px] overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800/80">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Review Diagnostics</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  demoIssues.length > 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-gray-800 text-gray-400'
                }`}>
                  {demoIssues.length > 0 ? 'Needs Changes' : 'Waiting for Run'}
                </span>
              </div>

              {demoIssues.length === 0 ? (
                <div className="h-60 flex flex-col items-center justify-center text-center">
                  <Terminal className="h-8 w-8 text-gray-600 mb-3 animate-pulse" />
                  <p className="text-sm text-gray-500">Click &ldquo;Run Review&rdquo; on the editor to generate report cards.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {demoIssues.map((issue, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800/80 flex items-start space-x-3">
                      <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded shrink-0 ${
                        issue.severity === 'critical' 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {issue.severity}
                      </span>
                      <div className="space-y-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">Line {issue.line}: {issue.title}</p>
                        <p className="text-xs text-gray-400 leading-normal">{issue.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {demoIssues.length > 0 && (
              <div className="pt-4 border-t border-gray-800/80 flex justify-between items-center text-xs text-gray-500 font-medium">
                <span>Code Health Score: <strong className="text-red-400">45/100</strong></span>
                <span>Confidence score: 88%</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-gray-900/60 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Flexible Plans for Every Developer</h2>
          <p className="text-gray-400">Scale your automation as your developer counts grow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Plan 1 */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col justify-between">
            <div>
              <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-2">Hacker</p>
              <h3 className="text-3xl font-extrabold text-white mb-4">$0 <span className="text-sm font-normal text-gray-500">/ forever</span></h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">Perfect for personal hobby builders, side projects, and static analysis checks.</p>
              <hr className="border-gray-800/60 mb-6" />
              <ul className="space-y-3.5 mb-8">
                {['5 Code Reviews / day', 'Local Static Rules scan', 'GitHub URL pasting', 'Basic issue alerts'].map((feat, i) => (
                  <li key={i} className="flex items-center space-x-2.5 text-xs text-gray-300">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/signup" className="block text-center py-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-sm font-semibold rounded-xl text-white transition-colors duration-200">
              Get Started
            </Link>
          </div>

          {/* Plan 2: Pro */}
          <div className="glass-panel-accent p-8 rounded-2xl flex flex-col justify-between relative ring-2 ring-indigo-500/40 glow-purple">
            <span className="absolute -top-3.5 right-6 px-3 py-1 bg-indigo-600 text-white text-[10px] font-extrabold uppercase rounded-full tracking-widest shadow shadow-indigo-500/50">Most Popular</span>
            <div>
              <p className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-2">Pro Developer</p>
              <h3 className="text-3xl font-extrabold text-white mb-4">$29 <span className="text-xs font-normal text-gray-400">/ user / mo</span></h3>
              <p className="text-sm text-gray-300 mb-6 leading-relaxed">For professional software engineers and consultants seeking fast AI reviews.</p>
              <hr className="border-indigo-500/20 mb-6" />
              <ul className="space-y-3.5 mb-8">
                {['Unlimited AI reviews', 'Full Gemini API indexing', 'GitHub Repository syncing', 'Interactive AI Debug Chat', 'PDF report exports', 'Recharts analytics'].map((feat, i) => (
                  <li key={i} className="flex items-center space-x-2.5 text-xs text-gray-200">
                    <CheckCircle className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/signup" className="block text-center py-3 bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold rounded-xl text-white transition-colors duration-200 shadow-lg shadow-indigo-600/40">
              Go Pro
            </Link>
          </div>

          {/* Plan 3 */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col justify-between">
            <div>
              <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-2">Team Enterprise</p>
              <h3 className="text-3xl font-extrabold text-white mb-4">$89 <span className="text-xs font-normal text-gray-500">/ user / mo</span></h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">For large software teams seeking private LLM support and SLA metrics.</p>
              <hr className="border-gray-800/60 mb-6" />
              <ul className="space-y-3.5 mb-8">
                {['Dedicated Custom API configuration', 'SLA uptime guarantee', 'Priority support channels', 'Self-hosted Docker backend', 'SSO & Audit logs'].map((feat, i) => (
                  <li key={i} className="flex items-center space-x-2.5 text-xs text-gray-300">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/signup" className="block text-center py-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-sm font-semibold rounded-xl text-white transition-colors duration-200">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-gray-900/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Loved by Leading Developers</h2>
          <p className="text-gray-400">Discover what development engineers say about CodeSage AI reviews.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            {
              text: "“CodeSage caught a hardcoded session salt on line 42 of a massive pull request that three human reviewers completely missed. It's now standard in our CI script.”",
              author: "Sarah Jenkins",
              role: "Lead Platform Security at WebFlow"
            },
            {
              text: "“I copy-paste my React modules directly into CodeSage before opening a branch. It refactors state variables and identifies blocking loop issues instantly. Outstanding.”",
              author: "Marcus Chen",
              role: "Senior Full-Stack Engineer at Vercel"
            }
          ].map((item, i) => (
            <div key={i} className="glass-card p-6 border border-gray-800 flex flex-col justify-between">
              <p className="text-sm text-gray-300 italic mb-4 leading-relaxed">{item.text}</p>
              <div>
                <p className="text-sm font-bold text-white">{item.author}</p>
                <p className="text-xs text-indigo-400 font-medium">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#030611] py-12 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <Terminal className="h-5 w-5 text-indigo-400" />
            <span className="font-bold text-white text-md">CodeSage AI</span>
          </div>
          
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} CodeSage AI. Built for hackathons & production reviews. All rights reserved.
          </p>

          <div className="flex space-x-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition-colors">
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
