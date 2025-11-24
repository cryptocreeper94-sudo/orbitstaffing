import React, { useState } from 'react';
import { Clock, Edit2, Save, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  const canEdit = userRole === 'admin' || userRole === 'dev';

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

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-700/50 rounded p-3 border border-slate-600">
          <div className="text-xs text-gray-400 mb-1">This Week</div>
          <div className="text-2xl font-bold text-cyan-400">{weeklyHours.toFixed(1)}h</div>
          <div className="text-xs text-gray-500 mt-1">Hours worked</div>
        </div>

        <div className="bg-slate-700/50 rounded p-3 border border-slate-600">
          <div className="text-xs text-gray-400 mb-1">All-Time</div>
          <div className="text-2xl font-bold text-cyan-400">{allTimeHours.toFixed(0)}h</div>
          <div className="text-xs text-gray-500 mt-1">Total hours</div>
        </div>
      </div>

      {canEdit && (
        <div className="mt-3 text-xs text-gray-400 bg-cyan-900/20 p-2 rounded border border-cyan-500/20">
          ✓ Admin/Dev can edit with documentation • All changes are hallmarked
        </div>
      )}
    </div>
  );
}
