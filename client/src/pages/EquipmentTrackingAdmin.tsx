import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { HardHat, Plus, Trash2, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Equipment {
  id: string;
  type: string;
  quantity: number;
  costPerUnit: number;
  status: 'in_stock' | 'loaned' | 'damaged' | 'missing';
}

interface EquipmentLoan {
  id: string;
  workerId: string;
  workerName: string;
  equipmentType: string;
  quantity: number;
  costPerUnit: number;
  loanDate: string;
  dueDate: string;
  status: 'active' | 'returned' | 'deducted';
  returnedDate?: string;
  deductionApplied?: boolean;
}

const defaultEquipmentTypes = [
  { type: 'Hard Hat', costPerUnit: 15 },
  { type: 'Reflective Vest (S)', costPerUnit: 20 },
  { type: 'Reflective Vest (M)', costPerUnit: 20 },
  { type: 'Reflective Vest (L)', costPerUnit: 20 },
  { type: 'Reflective Vest (XL)', costPerUnit: 25 },
  { type: 'Safety Glasses', costPerUnit: 8 },
  { type: 'Work Gloves', costPerUnit: 12 },
  { type: 'Steel-Toe Boots', costPerUnit: 85 },
  { type: 'Respirator Mask', costPerUnit: 30 },
  { type: 'First Aid Kit', costPerUnit: 25 },
];

export default function EquipmentTrackingAdmin() {
  const [view, setView] = useState<'inventory' | 'loans' | 'returns'>('inventory');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loans, setLoans] = useState<EquipmentLoan[]>([]);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEquipment();
    loadLoans();
  }, []);

  const loadEquipment = async () => {
    try {
      const res = await fetch('/api/equipment/inventory');
      if (res.ok) {
        const data = await res.json();
        setEquipment(data);
      }
    } catch (err) {
      console.error('Load equipment error:', err);
      // Initialize with default inventory
      setEquipment(defaultEquipmentTypes.map((e, i) => ({
        id: `equip-${i}`,
        type: e.type,
        quantity: 50,
        costPerUnit: e.costPerUnit,
        status: 'in_stock' as const,
      })));
    }
  };

  const loadLoans = async () => {
    try {
      const res = await fetch('/api/equipment/loans');
      if (res.ok) {
        const data = await res.json();
        setLoans(data);
      }
    } catch (err) {
      console.error('Load loans error:', err);
    }
  };

  const assignEquipment = async () => {
    if (!selectedWorker || !selectedEquipment || quantity < 1) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const equipItem = equipment.find(e => e.id === selectedEquipment);
      if (!equipItem) {
        toast.error('Equipment not found');
        return;
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 2); // 2-day return deadline

      const res = await fetch('/api/equipment/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: selectedWorker,
          equipmentId: selectedEquipment,
          equipmentType: equipItem.type,
          quantity,
          costPerUnit: equipItem.costPerUnit,
          dueDate: dueDate.toISOString(),
        }),
      });

      if (res.ok) {
        toast.success(`${quantity}x ${equipItem.type} assigned to worker`);
        setSelectedWorker('');
        setSelectedEquipment('');
        setQuantity(1);
        loadLoans();
      } else {
        toast.error('Failed to assign equipment');
      }
    } catch (err) {
      console.error('Assign error:', err);
      toast.error('Error assigning equipment');
    } finally {
      setLoading(false);
    }
  };

  const recordReturn = async (loanId: string) => {
    try {
      const res = await fetch(`/api/equipment/return/${loanId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        toast.success('Equipment return recorded');
        loadLoans();
      }
    } catch (err) {
      console.error('Return error:', err);
      toast.error('Failed to record return');
    }
  };

  const applyDeduction = async (loanId: string) => {
    try {
      const res = await fetch(`/api/equipment/deduct/${loanId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        toast.success('Deduction applied to final paycheck');
        loadLoans();
      }
    } catch (err) {
      console.error('Deduction error:', err);
      toast.error('Failed to apply deduction');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <HardHat className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl font-bold text-white">Equipment Tracking</h1>
          </div>
          <p className="text-gray-400">Manage PPE inventory, assignments, and returns</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-slate-800/50 p-1 rounded-lg w-fit">
          <Button
            onClick={() => setView('inventory')}
            variant={view === 'inventory' ? 'default' : 'ghost'}
            className="rounded"
            data-testid="tab-inventory"
          >
            📦 Inventory
          </Button>
          <Button
            onClick={() => setView('loans')}
            variant={view === 'loans' ? 'default' : 'ghost'}
            className="rounded"
            data-testid="tab-loans"
          >
            📤 Active Loans
          </Button>
          <Button
            onClick={() => setView('returns')}
            variant={view === 'returns' ? 'default' : 'ghost'}
            className="rounded"
            data-testid="tab-returns"
          >
            ✓ Returns & Deductions
          </Button>
        </div>

        {/* Inventory View */}
        {view === 'inventory' && (
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Equipment Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-2 px-3 text-gray-300">Equipment Type</th>
                        <th className="text-center py-2 px-3 text-gray-300">In Stock</th>
                        <th className="text-center py-2 px-3 text-gray-300">Cost/Unit</th>
                        <th className="text-center py-2 px-3 text-gray-300">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipment.map(item => (
                        <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="py-3 px-3 text-white">{item.type}</td>
                          <td className="py-3 px-3 text-center text-cyan-400 font-semibold">{item.quantity}</td>
                          <td className="py-3 px-3 text-center text-gray-300">${item.costPerUnit}</td>
                          <td className="py-3 px-3 text-center">
                            <Badge
                              className={
                                item.quantity > 10
                                  ? 'bg-green-900 text-green-200'
                                  : item.quantity > 3
                                  ? 'bg-yellow-900 text-yellow-200'
                                  : 'bg-red-900 text-red-200'
                              }
                            >
                              {item.quantity > 10 ? 'Good Stock' : item.quantity > 3 ? 'Low' : 'Critical'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Assign Equipment */}
            <Card className="bg-slate-800/50 border-slate-700 border-2 border-cyan-600">
              <CardHeader>
                <CardTitle className="text-cyan-400">Assign Equipment to Worker</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Worker ID/Email</label>
                    <Input
                      value={selectedWorker}
                      onChange={(e) => setSelectedWorker(e.target.value)}
                      placeholder="worker@email.com"
                      data-testid="input-worker-id"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Equipment</label>
                    <select
                      value={selectedEquipment}
                      onChange={(e) => setSelectedEquipment(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                      data-testid="select-equipment"
                    >
                      <option value="">Select equipment</option>
                      {equipment.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.type} (${item.costPerUnit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      data-testid="input-quantity"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={assignEquipment}
                      disabled={loading}
                      className="w-full bg-cyan-600 hover:bg-cyan-700"
                      data-testid="button-assign"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Assign
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-400">Return deadline: 2 days from assignment. Unreturned equipment will be deducted from final paycheck.</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Active Loans View */}
        {view === 'loans' && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>Active Equipment Loans</CardTitle>
            </CardHeader>
            <CardContent>
              {loans.filter(l => l.status === 'active').length === 0 ? (
                <p className="text-gray-400">No active loans</p>
              ) : (
                <div className="space-y-3">
                  {loans.filter(l => l.status === 'active').map(loan => {
                    const now = new Date();
                    const due = new Date(loan.dueDate);
                    const isOverdue = now > due;
                    
                    return (
                      <div key={loan.id} className={`p-4 rounded border-2 ${isOverdue ? 'border-red-700 bg-red-900/20' : 'border-slate-700 bg-slate-700/30'}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-white">{loan.workerName}</p>
                            <p className="text-sm text-gray-400">{loan.equipmentType} x{loan.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-300">Cost: ${(loan.quantity * loan.costPerUnit).toFixed(2)}</p>
                            <Badge className={isOverdue ? 'bg-red-900 text-red-200' : 'bg-yellow-900 text-yellow-200'}>
                              {isOverdue ? 'OVERDUE' : 'Active'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                          <span>Loaned: {new Date(loan.loanDate).toLocaleDateString()}</span>
                          <span>Due: {new Date(loan.dueDate).toLocaleDateString()}</span>
                        </div>
                        <Button
                          onClick={() => recordReturn(loan.id)}
                          className="w-full bg-green-600 hover:bg-green-700 text-xs"
                          data-testid={`button-return-${loan.id}`}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-2" />
                          Mark as Returned
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Returns & Deductions View */}
        {view === 'returns' && (
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Returned Equipment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loans.filter(l => l.status === 'returned').length === 0 ? (
                  <p className="text-gray-400">No returned equipment yet</p>
                ) : (
                  <div className="space-y-2">
                    {loans.filter(l => l.status === 'returned').map(loan => (
                      <div key={loan.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
                        <div>
                          <p className="text-white">{loan.workerName} - {loan.equipmentType}</p>
                          <p className="text-xs text-gray-400">Returned: {loan.returnedDate ? new Date(loan.returnedDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <Badge className="bg-green-900 text-green-200">Returned</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 border-2 border-red-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  Unreturned - Apply Deductions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loans.filter(l => l.status === 'active' && new Date(l.dueDate) < new Date()).length === 0 ? (
                  <p className="text-gray-400">No unreturned overdue equipment</p>
                ) : (
                  <div className="space-y-3">
                    {loans.filter(l => l.status === 'active' && new Date(l.dueDate) < new Date()).map(loan => (
                      <div key={loan.id} className="p-4 rounded border-2 border-red-700 bg-red-900/20">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-white">{loan.workerName}</p>
                            <p className="text-sm text-gray-400">{loan.equipmentType} x{loan.quantity}</p>
                          </div>
                          <p className="text-lg font-bold text-red-400">-${(loan.quantity * loan.costPerUnit).toFixed(2)}</p>
                        </div>
                        <p className="text-xs text-gray-400 mb-3">Overdue since: {new Date(loan.dueDate).toLocaleDateString()}</p>
                        <Button
                          onClick={() => applyDeduction(loan.id)}
                          className="w-full bg-red-700 hover:bg-red-800"
                          data-testid={`button-deduct-${loan.id}`}
                        >
                          Apply Deduction to Final Paycheck
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
