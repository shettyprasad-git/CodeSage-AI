import React from 'react';

export default function LoadingSkeleton({ type = 'card' }) {
  if (type === 'stats') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl h-32 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="h-4 bg-gray-800 rounded w-24"></div>
              <div className="h-8 w-8 bg-gray-800 rounded-lg"></div>
            </div>
            <div className="h-8 bg-gray-800 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="glass-panel p-6 rounded-2xl h-80 flex flex-col justify-between animate-pulse">
        <div className="h-5 bg-gray-800 rounded w-1/4"></div>
        <div className="flex-1 my-6 bg-gray-800/40 rounded-xl flex items-end p-4 justify-around">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="w-8 bg-gray-800 rounded-t-md" style={{ height: `${20 + i * 10}%` }}></div>
          ))}
        </div>
        <div className="flex justify-between">
          <div className="h-3 bg-gray-800 rounded w-10"></div>
          <div className="h-3 bg-gray-800 rounded w-10"></div>
          <div className="h-3 bg-gray-800 rounded w-10"></div>
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-panel p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="h-10 w-10 bg-gray-800 rounded-lg shrink-0"></div>
              <div className="space-y-2 flex-1 max-w-xs">
                <div className="h-4 bg-gray-800 rounded"></div>
                <div className="h-3 bg-gray-800 rounded w-2/3"></div>
              </div>
            </div>
            <div className="h-7 bg-gray-800 rounded-full w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-2xl h-48 flex flex-col justify-between animate-pulse">
      <div className="h-5 bg-gray-800 rounded w-1/3"></div>
      <div className="h-3 bg-gray-800 rounded w-full"></div>
      <div className="h-3 bg-gray-800 rounded w-5/6"></div>
      <div className="h-8 bg-gray-800 rounded w-24"></div>
    </div>
  );
}
