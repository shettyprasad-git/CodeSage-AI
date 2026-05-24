import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  ShieldAlert,
  Loader2
} from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Toast from '../components/Toast';

export default function Analytics() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const resData = await res.json();
        
        if (resData.success) {
          setData(resData.data);
        } else {
          setToastType('error');
          setToastMessage(resData.error || 'Failed to fetch analytics');
        }
      } catch (err) {
        setToastType('error');
        setToastMessage('Server error loading analytics dashboards');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAnalytics();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-8 py-4">
        <div className="h-10 bg-gray-800 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <LoadingSkeleton type="chart" />
          <LoadingSkeleton type="chart" />
          <LoadingSkeleton type="chart" />
          <LoadingSkeleton type="chart" />
        </div>
      </div>
    );
  }

  // Custom tooltips styling
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-lg border border-gray-800 text-xs">
          <p className="font-bold text-white mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color || '#8b5cf6' }}>
              {p.name}: <strong>{p.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 py-2">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <span>AI Audit Analytics</span>
          <BarChart3 className="h-6 w-6 text-indigo-400" />
        </h1>
        <p className="text-gray-400 text-sm mt-1">Granular charts on warning types, security metrics, and health trends.</p>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Code Quality Trend (Area Chart) */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800/80">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
            <TrendingUp className="h-4.5 w-4.5 text-indigo-400" />
            <span>Code Health Index Trend</span>
          </h3>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.qualityTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" name="Score" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Issue Density Distribution (Bar Chart) */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800/80">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
            <AlertTriangle className="h-4.5 w-4.5 text-purple-400" />
            <span>Audit Category Frequencies</span>
          </h3>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.issueDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Issues count">
                  {(data?.issueDistribution || []).map((entry, index) => {
                    const colors = ['#f43f5e', '#ec4899', '#3b82f6', '#eab308', '#06b6d4'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Severity Breakdown (Donut Pie Chart) */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800/80">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
            <ShieldAlert className="h-4.5 w-4.5 text-rose-400" />
            <span>Security Severity Split</span>
          </h3>
          
          <div className="h-72 w-full flex items-center justify-center">
            {data?.severitySplit?.reduce((sum, s) => sum + s.value, 0) === 0 ? (
              <p className="text-xs text-gray-500 italic">No issues recorded. Security scans are clean.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.severitySplit || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(data?.severitySplit || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 4: Review Activity Volume (Bar Chart) */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800/80">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Activity className="h-4.5 w-4.5 text-cyan-400" />
            <span>Weekly Review Volume</span>
          </h3>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.activity || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="reviews" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Audits run" />
              </BarChart>
            </ResponsiveContainer>
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
