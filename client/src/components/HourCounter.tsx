import React, { useState, useEffect } from 'react';
import { Clock, Edit2, Save, X, AlertCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Worker {
  id: string;
  firstName: string;
  lastName: string;
}

interface HourData {
  period: 'today' | 'week' | 'allTime';
  hours: number;
  updatedAt?: string;
}

interface HourCounterProps {
  workerId?: string;
  weeklyHours?: number;
  allTimeHours?: number;
  userRole?: 'worker' | 'admin' | 'dev';
  onEdit?: (weeklyHours: number, allTimeHours: number, editNotes: string) => Promise<void>;
}

export default function HourCounter({
  workerId,
  weeklyHours = 38.5,
  allTimeHours = 1240,
  userRole = 'worker',
  onEdit,
}: HourCounterProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editWeekly, setEditWeekly] = useState(weeklyHours.toString());
  const [editAllTime, setEditAllTime] = useState(allTimeHours.toString());
  const [editNotes, setEditNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  // New filtering state
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(workerId || '');
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'allTime'>('week');
  const [isLoading, setIsLoading] = useState(false);
  const [displayHours, setDisplayHours] = useState({ today: 0, week: weeklyHours, allTime: allTimeHours });

  const canEdit = userRole === 'admin' || userRole === 'dev';

  // Fetch workers list on mount (for dev/admin)
  useEffect(() => {
    if ((userRole === 'admin' || userRole === 'dev') && workers.length === 0) {
      fetchWorkers();
    }
  }, [userRole, workers.length]);

  // Fetch hours when worker or period changes
  useEffect(() => {
    if (selectedWorkerId && (userRole === 'admin' || userRole === 'dev')) {
      fetchWorkerHours();
    }
  }, [selectedWorkerId, selectedPeriod, userRole]);

  const fetchWorkers = async () => {
    try {
      const res = await fetch('/api/workers');
      if (res.ok) {
        const data = await res.json();
        setWorkers(Array.isArray(data) ? data : data.workers || []);
        if (data.length > 0 && !selectedWorkerId) {
          setSelectedWorkerId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch workers:', err);
    }
  };

  const fetchWorkerHours = async () => {
    if (!selectedWorkerId) return;
    
    try {
      setIsLoading(true);
      const res = await fetch(`/api/timesheets/worker/${selectedWorkerId}?period=${selectedPeriod}`);
      if (res.ok) {
        const data = await res.json();
        setDisplayHours(prev => ({
          ...prev,
          [selectedPeriod]: data.hours || 0
        }));
      }
    } catch (err) {
      console.error('Failed to fetch hours:', err);
      setDisplayHours(prev => ({ ...prev, [selectedPeriod]: 0 }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    const weekly = parseFloat(editWeekly);
    const allTime = parseFloat(editAllTime);

    if (isNaN(weekly) || isNaN(allTime)) {
      setError('Please enter valid hour amounts');
      return;
    }

    if (!editNotes.trim() && canEdit) {
      setError('Please provide edit notes for documentation');
      return;
    }

    try {
      setIsSaving(true);
      if (onEdit) {
        await onEdit(weekly, allTime, editNotes);
      }
      setIsEditing(false);
    } catch (err) {
      setError('Failed to save hours');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedWorker = workers.find(w => w.id === selectedWorkerId);
  const workerName = selectedWorker ? `${selectedWorker.firstName} ${selectedWorker.lastName}` : 'Select Worker';
  const periodLabel = selectedPeriod === 'today' ? 'Today' : selectedPeriod === 'week' ? 'This Week' : 'All-Time';
  const currentHours = displayHours[selectedPeriod] || 0;

  if (isEditing && canEdit) {
    return (
      <div className="bg-slate-800 border border-cyan-500/30 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Edit Hours
          </h3>
          <button
            onClick={() => {
              setIsEditing(false);
              setError('');
              setEditWeekly(weeklyHours.toString());
              setEditAllTime(allTimeHours.toString());
              setEditNotes('');
            }}
            className="text-gray-400 hover:text-white"
            data-testid="button-cancel-edit"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Weekly Hours</label>
            <input
              type="number"
              step="0.5"
              value={editWeekly}
              onChange={(e) => setEditWeekly(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              data-testid="input-weekly-hours"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">All-Time Hours</label>
            <input
              type="number"
              step="0.5"
              value={editAllTime}
              onChange={(e) => setEditAllTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              data-testid="input-alltime-hours"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Edit Notes (required)</label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Document why these hours were adjusted..."
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 resize-none h-20 text-sm"
              data-testid="textarea-edit-notes"
            />
            <div className="text-xs text-gray-400 mt-1">✓ All edits are hallmarked and tracked</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-600/50 rounded p-3 flex items-start gap-2 text-red-300 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-green-600 hover:bg-green-700"
            data-testid="button-save-hours"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            onClick={() => {
              setIsEditing(false);
              setError('');
            }}
            variant="outline"
            className="flex-1"
            data-testid="button-cancel"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-cyan-500/30 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          Hour Summary
        </h3>
        {canEdit && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
            data-testid="button-edit-hours"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Worker & Period Selection - Only for admin/dev */}
      {(userRole === 'admin' || userRole === 'dev') && (
        <div className="mb-4 space-y-2 pb-4 border-b border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-gray-400">Viewing:</span>
          </div>
          
          {/* Worker Dropdown */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Worker</label>
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-cyan-400"
              data-testid="select-worker-hours"
            >
              <option value="">-- Select Worker --</option>
              {workers.map(w => (
                <option key={w.id} value={w.id}>
                  {w.firstName} {w.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Time Period Buttons */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Period</label>
            <div className="flex gap-1">
              {(['today', 'week', 'allTime'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`flex-1 px-2 py-1 text-xs font-bold rounded transition-all ${
                    selectedPeriod === period
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                  data-testid={`button-period-${period}`}
                >
                  {period === 'today' ? 'Today' : period === 'week' ? 'Week' : 'All-Time'}
                </button>
              ))}
            </div>
          </div>

          {selectedWorkerId && (
            <div className="text-xs text-cyan-400 mt-1">
              ✓ Showing {periodLabel.toLowerCase()} hours for {selectedWorker?.firstName}
            </div>
          )}
        </div>
      )}

      {/* Hours Display */}
      {isLoading ? (
        <div className="text-center py-4 text-gray-400">Loading hours...</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-700/50 rounded p-3 border border-slate-600">
            <div className="text-xs text-gray-400 mb-1">{periodLabel}</div>
            <div className="text-2xl font-bold text-cyan-400">
              {currentHours.toFixed(1)}h
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {userRole === 'admin' || userRole === 'dev' 
                ? (selectedWorkerId ? 'Hours tracked' : 'Select a worker')
                : 'Hours worked'
              }
            </div>
          </div>

          <div className="bg-slate-700/50 rounded p-3 border border-slate-600">
            <div className="text-xs text-gray-400 mb-1">Reference</div>
            <div className="text-2xl font-bold text-cyan-400">{allTimeHours.toFixed(0)}h</div>
            <div className="text-xs text-gray-500 mt-1">Total hours</div>
          </div>
        </div>
      )}

      {canEdit && (
        <div className="mt-3 text-xs text-gray-400 bg-cyan-900/20 p-2 rounded border border-cyan-500/20">
          ✓ Admin/Dev: Select worker above to view hours • Edit button available for manual adjustments
        </div>
      )}
    </div>
  );
}
