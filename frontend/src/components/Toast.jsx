import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeConfig = {
    success: {
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
      shadow: 'shadow-emerald-500/10',
      Icon: CheckCircle2
    },
    error: {
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'border-red-500/30',
      iconColor: 'text-red-400',
      shadow: 'shadow-red-500/10',
      Icon: AlertCircle
    },
    info: {
      bg: 'rgba(59, 130, 246, 0.1)',
      border: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      shadow: 'shadow-blue-500/10',
      Icon: Info
    }
  };

  const config = typeConfig[type] || typeConfig.success;

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className={`pointer-events-auto flex items-center space-x-3 p-4 rounded-xl border ${config.border} glass-panel shadow-lg ${config.shadow} max-w-sm`}
            style={{ backgroundColor: config.bg }}
          >
            <config.Icon className={`h-5 w-5 shrink-0 ${config.iconColor}`} />
            <div className="flex-1 text-sm font-medium text-white">{message}</div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
