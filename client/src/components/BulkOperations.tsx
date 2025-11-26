import { useState } from 'react';
import { Users, Calendar, DollarSign, RefreshCw, CheckCircle2, AlertCircle, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

type OperationType = 'availability' | 'reassign' | 'payroll' | 'status';

interface BulkOperation {
  id: string;
  type: OperationType;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  affectedCount: number;
  timestamp: Date;
  details: string;
}

export function BulkOperations() {
  const [selectedType, setSelectedType] = useState<OperationType>('availability');
  const [operations, setOperations] = useState<BulkOperation[]>([
    {
      id: 'op-001',
      type: 'availability',
      status: 'completed',
      affectedCount: 42,
      timestamp: new Date('2024-11-25T14:30:00'),
      details: 'Updated weekend availability for construction workers',
    },
    {
      id: 'op-002',
      type: 'reassign',
      status: 'completed',
      affectedCount: 15,
      timestamp: new Date('2024-11-25T10:15:00'),
      details: 'Reassigned shifts from Project A to Project B',
    },
  ]);

  const [formData, setFormData] = useState({
    workerIds: '',
    availabilityDays: [] as string[],
    targetProject: '',
    payrollAdjustment: '',
    newStatus: '',
  });

  const handleBulkOperation = () => {
    const newOp: BulkOperation = {
      id: `op-${Date.now()}`,
      type: selectedType,
      status: 'processing',
      affectedCount: formData.workerIds.split(',').filter(id => id.trim()).length,
      timestamp: new Date(),
      details: getOperationDetails(),
    };

    setOperations([newOp, ...operations]);

    // Simulate processing
    setTimeout(() => {
      setOperations(prev =>
        prev.map(op =>
          op.id === newOp.id ? { ...op, status: 'completed' } : op
        )
      );
    }, 2000);

    // Reset form
    setFormData({
      workerIds: '',
      availabilityDays: [],
      targetProject: '',
      payrollAdjustment: '',
      newStatus: '',
    });
  };

  const getOperationDetails = () => {
    switch (selectedType) {
      case 'availability':
        return `Update availability for ${formData.availabilityDays.join(', ')}`;
      case 'reassign':
        return `Reassign to ${formData.targetProject}`;
      case 'payroll':
        return `Apply ${formData.payrollAdjustment} adjustment`;
      case 'status':
        return `Change status to ${formData.newStatus}`;
      default:
        return 'Bulk operation';
    }
  };

  const operations_config = [
    {
      type: 'availability' as OperationType,
      icon: Calendar,
      title: 'Bulk Availability Update',
      description: 'Update availability for multiple workers at once',
      color: 'cyan',
    },
    {
      type: 'reassign' as OperationType,
      icon: RefreshCw,
      title: 'Bulk Shift Reassignment',
      description: 'Reassign shifts across multiple workers',
      color: 'purple',
    },
    {
      type: 'payroll' as OperationType,
      icon: DollarSign,
      title: 'Bulk Payroll Corrections',
      description: 'Apply payroll adjustments to multiple workers',
      color: 'green',
    },
    {
      type: 'status' as OperationType,
      icon: Users,
      title: 'Bulk Status Update',
      description: 'Change worker status (active/inactive/onboarding)',
      color: 'orange',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Bulk Operations</h2>
        <p className="text-gray-400 text-sm">Perform operations on multiple workers simultaneously</p>
      </div>

      {/* Operation Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {operations_config.map((op) => {
          const Icon = op.icon;
          return (
            <button
              key={op.type}
              onClick={() => setSelectedType(op.type)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedType === op.type
                  ? `border-${op.color}-500 bg-${op.color}-500/10`
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }`}
              data-testid={`button-bulk-${op.type}`}
            >
              <Icon className={`w-6 h-6 mb-2 text-${op.color}-400`} />
              <h3 className="font-bold text-sm mb-1">{op.title}</h3>
              <p className="text-xs text-gray-400">{op.description}</p>
            </button>
          );
        })}
      </div>

      {/* Operation Form */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Configure Bulk Operation</h3>
        
        <div className="space-y-4">
          {/* Worker IDs Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Worker IDs (comma-separated)
            </label>
            <textarea
              value={formData.workerIds}
              onChange={(e) => setFormData({ ...formData, workerIds: e.target.value })}
              placeholder="WRK-001, WRK-002, WRK-003..."
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400 resize-none h-24"
              data-testid="textarea-worker-ids"
            />
            <p className="text-xs text-gray-400 mt-1">
              {formData.workerIds.split(',').filter(id => id.trim()).length} worker(s) selected
            </p>
          </div>

          {/* Type-Specific Fields */}
          {selectedType === 'availability' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Available Days
              </label>
              <div className="flex flex-wrap gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <button
                    key={day}
                    onClick={() => {
                      const days = formData.availabilityDays.includes(day)
                        ? formData.availabilityDays.filter(d => d !== day)
                        : [...formData.availabilityDays, day];
                      setFormData({ ...formData, availabilityDays: days });
                    }}
                    className={`px-4 py-2 rounded-lg font-bold transition ${
                      formData.availabilityDays.includes(day)
                        ? 'bg-cyan-500 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                    data-testid={`button-day-${day}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedType === 'reassign' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Project/Assignment
              </label>
              <input
                type="text"
                value={formData.targetProject}
                onChange={(e) => setFormData({ ...formData, targetProject: e.target.value })}
                placeholder="Project ID or name"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                data-testid="input-target-project"
              />
            </div>
          )}

          {selectedType === 'payroll' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Payroll Adjustment
              </label>
              <select
                value={formData.payrollAdjustment}
                onChange={(e) => setFormData({ ...formData, payrollAdjustment: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                data-testid="select-payroll-adjustment"
              >
                <option value="">Select adjustment type</option>
                <option value="bonus_100">Add $100 Bonus</option>
                <option value="bonus_250">Add $250 Bonus</option>
                <option value="correction_plus">Positive Correction</option>
                <option value="correction_minus">Negative Correction</option>
              </select>
            </div>
          )}

          {selectedType === 'status' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Status
              </label>
              <select
                value={formData.newStatus}
                onChange={(e) => setFormData({ ...formData, newStatus: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                data-testid="select-new-status"
              >
                <option value="">Select status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="onboarding">Onboarding</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleBulkOperation}
              disabled={formData.workerIds.trim() === ''}
              className="bg-cyan-600 hover:bg-cyan-700 flex-1"
              data-testid="button-execute-bulk"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Execute Bulk Operation
            </Button>
            <Button
              onClick={() => setFormData({ workerIds: '', availabilityDays: [], targetProject: '', payrollAdjustment: '', newStatus: '' })}
              className="bg-slate-600 hover:bg-slate-700"
              data-testid="button-clear-form"
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Operation History */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Operation History</h3>
        <div className="space-y-3">
          {operations.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No bulk operations yet</p>
          ) : (
            operations.map((op) => (
              <div
                key={op.id}
                className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
                data-testid={`operation-${op.id}`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {op.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : op.status === 'processing' ? (
                    <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                  ) : op.status === 'failed' ? (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  ) : (
                    <Users className="w-5 h-5 text-gray-400" />
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-sm">{op.details}</p>
                    <p className="text-xs text-gray-400">
                      {op.affectedCount} workers • {op.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  op.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  op.status === 'processing' ? 'bg-cyan-500/20 text-cyan-400' :
                  op.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {op.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
