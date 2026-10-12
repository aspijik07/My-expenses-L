import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActivityLog } from '../types';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Scan,
  PlusCircle,
  Trash2,
  Edit3,
  Settings,
  Download,
  Upload,
  Smartphone,
} from 'lucide-react';

export const ActivityLogsView: React.FC = () => {
  const { logs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    // GHOST SECURITY FILTER: Paradox presence is 100% invisible in UI logs
    if (
      log.title.toLowerCase().includes('paradox') ||
      log.details?.toLowerCase().includes('paradox')
    ) {
      return false;
    }

    if (filterAction === 'LOGIN' && log.action !== 'LOGIN') return false;
    if (filterAction === 'SCAN' && log.action !== 'SCAN_RECEIPT') return false;
    if (filterAction === 'TX' && !['CREATE', 'UPDATE', 'DELETE'].includes(log.action)) return false;
    if (filterAction === 'SYSTEM' && !['SETTINGS_UPDATE', 'IMPORT', 'EXPORT'].includes(log.action)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = log.title.toLowerCase().includes(q);
      const matchDetails = log.details?.toLowerCase().includes(q);
      const matchAction = log.action.toLowerCase().includes(q);
      return matchTitle || matchDetails || matchAction;
    }

    return true;
  });

  const getActionIcon = (action: ActivityLog['action']) => {
    switch (action) {
      case 'LOGIN':
        return <Smartphone className="w-4 h-4 text-emerald-500" />;
      case 'SCAN_RECEIPT':
        return <Scan className="w-4 h-4 text-lavender-500" />;
      case 'CREATE':
        return <PlusCircle className="w-4 h-4 text-emerald-500" />;
      case 'UPDATE':
        return <Edit3 className="w-4 h-4 text-rosegold-500" />;
      case 'DELETE':
        return <Trash2 className="w-4 h-4 text-rose-500" />;
      case 'IMPORT':
        return <Upload className="w-4 h-4 text-blue-500" />;
      case 'EXPORT':
        return <Download className="w-4 h-4 text-indigo-500" />;
      default:
        return <Settings className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: ActivityLog['status']) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="w-3 h-3" />
            <span>Success</span>
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500">
            <AlertTriangle className="w-3 h-3" />
            <span>Notice</span>
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500">
            <AlertCircle className="w-3 h-3" />
            <span>Error</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          System Activity & Audit Logs
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Traceable audit log of OCR scans, manual additions, edits, and cloud sync events
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-3xl p-5 border border-rosegold-400/20 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit trail by description or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl text-xs bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Events</option>
            <option value="LOGIN">User Logins & Devices (IP/Audit)</option>
            <option value="SCAN">OCR Scans Only</option>
            <option value="TX">Transactions</option>
            <option value="SYSTEM">System & Settings</option>
          </select>
        </div>
      </div>

      {/* Logs Timeline */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 text-xs">
            No activity records match your criteria.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="glass-card rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/80 flex items-start justify-between gap-4"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mt-0.5">
                  {getActionIcon(log.action)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {log.title}
                    </span>
                    {getStatusBadge(log.status)}
                  </div>
                  {log.details && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {log.details}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 flex-shrink-0">
                <Clock className="w-3 h-3" />
                <span>{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
