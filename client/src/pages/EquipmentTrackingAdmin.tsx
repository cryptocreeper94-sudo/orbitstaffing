import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BentoGrid, BentoTile } from '@/components/ui/bento-grid';
import { PageHeader } from '@/components/ui/section-header';
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardContent, StatCard } from '@/components/ui/orbit-card';
import { HardHat, Plus, AlertCircle, CheckCircle2, ArrowLeft, Package, Users, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'wouter';

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
      dueDate.setDate(dueDate.getDate() + 2);

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

  const totalEquipment = equipment.reduce((sum, e) => sum + e.quantity, 0);
  const activeLoans = loans.filter(l => l.status === 'active').length;
  const overdueLoans = loans.filter(l => l.status === 'active' && new Date(l.dueDate) < new Date()).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Equipment Tracking"
          subtitle="Manage PPE inventory, assignments, and returns"
          breadcrumb={
            <Link href="/">
              <Button variant="ghost" className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-900/20 -ml-2" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          }
          actions={
            <div className="flex items-center gap-2">
              <HardHat className="w-8 h-8 text-yellow-500" />
            </div>
          }
        />

        <BentoGrid cols={4} gap="md" className="mb-6">
          <BentoTile>
            <StatCard
              label="Total Items"
              value={totalEquipment}
              icon={<Package className="w-6 h-6" />}
            />
          </BentoTile>
          <BentoTile>
            <StatCard
              label="Equipment Types"
              value={equipment.length}
              icon={<HardHat className="w-6 h-6" />}
            />
          </BentoTile>
          <BentoTile>
            <StatCard
              label="Active Loans"
              value={activeLoans}
              icon={<Users className="w-6 h-6" />}
            />
          </BentoTile>
          <BentoTile>
            <StatCard
              label="Overdue"
              value={overdueLoans}
              icon={<AlertTriangle className="w-6 h-6" />}
            />
          </BentoTile>
        </BentoGrid>

        <div className="flex flex-wrap gap-2 mb-6 bg-slate-800/50 p-1 rounded-lg">
          <Button
            onClick={() => setView('inventory')}
            variant={view === 'inventory' ? 'default' : 'ghost'}
            className="rounded text-xs sm:text-sm flex-1 sm:flex-none"
            data-testid="tab-inventory"
          >
            📦 <span className="hidden sm:inline ml-1">Inventory</span>
          </Button>
          <Button
            onClick={() => setView('loans')}
            variant={view === 'loans' ? 'default' : 'ghost'}
            className="rounded text-xs sm:text-sm flex-1 sm:flex-none"
            data-testid="tab-loans"
          >
            📤 <span className="hidden sm:inline ml-1">Loans</span>
          </Button>
          <Button
            onClick={() => setView('returns')}
            variant={view === 'returns' ? 'default' : 'ghost'}
            className="rounded text-xs sm:text-sm flex-1 sm:flex-none"
            data-testid="tab-returns"
          >
            ✓ <span className="hidden sm:inline ml-1">Returns</span>
          </Button>
        </div>

        {view === 'inventory' && (
          <BentoGrid cols={1} gap="md">
            <BentoTile>
              <OrbitCard hover={false} className="border-0 bg-transparent p-0">
                <OrbitCardHeader>
                  <OrbitCardTitle>Equipment Inventory</OrbitCardTitle>
                </OrbitCardHeader>
                <OrbitCardContent>
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
                </OrbitCardContent>
              </OrbitCard>
            </BentoTile>

            <BentoTile className="border-2 border-cyan-600">
              <OrbitCard hover={false} className="border-0 bg-transparent p-0">
                <OrbitCardHeader icon={<Plus className="w-5 h-5 text-cyan-400" />}>
                  <OrbitCardTitle className="text-cyan-400">Assign Equipment to Worker</OrbitCardTitle>
                </OrbitCardHeader>
                <OrbitCardContent className="space-y-4">
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
                </OrbitCardContent>
              </OrbitCard>
            </BentoTile>
          </BentoGrid>
        )}

        {view === 'loans' && (
          <BentoGrid cols={1} gap="md">
            <BentoTile>
              <OrbitCard hover={false} className="border-0 bg-transparent p-0">
                <OrbitCardHeader>
                  <OrbitCardTitle>Active Equipment Loans</OrbitCardTitle>
                </OrbitCardHeader>
                <OrbitCardContent>
                  {loans.filter(l => l.status === 'active').length === 0 ? (
                    <p className="text-gray-400">No active loans</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {loans.filter(l => l.status === 'active').map(loan => {
                        const now = new Date();
                        const due = new Date(loan.dueDate);
                        const isOverdue = now > due;
                        
                        return (
                          <OrbitCard 
                            key={loan.id} 
                            variant="default"
                            className={isOverdue ? 'border-2 border-red-700 bg-red-900/20' : ''}
                          >
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
                          </OrbitCard>
                        );
                      })}
                    </div>
                  )}
                </OrbitCardContent>
              </OrbitCard>
            </BentoTile>
          </BentoGrid>
        )}

        {view === 'returns' && (
          <BentoGrid cols={1} gap="md">
            <BentoTile>
              <OrbitCard hover={false} className="border-0 bg-transparent p-0">
                <OrbitCardHeader icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}>
                  <OrbitCardTitle>Returned Equipment</OrbitCardTitle>
                </OrbitCardHeader>
                <OrbitCardContent>
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
                </OrbitCardContent>
              </OrbitCard>
            </BentoTile>

            <BentoTile className="border-2 border-red-700">
              <OrbitCard hover={false} className="border-0 bg-transparent p-0">
                <OrbitCardHeader icon={<AlertCircle className="w-5 h-5 text-red-400" />}>
                  <OrbitCardTitle className="text-red-400">Unreturned - Apply Deductions</OrbitCardTitle>
                </OrbitCardHeader>
                <OrbitCardContent>
                  {loans.filter(l => l.status === 'active' && new Date(l.dueDate) < new Date()).length === 0 ? (
                    <p className="text-gray-400">No unreturned overdue equipment</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {loans.filter(l => l.status === 'active' && new Date(l.dueDate) < new Date()).map(loan => (
                        <OrbitCard key={loan.id} className="border-2 border-red-700 bg-red-900/20">
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
                        </OrbitCard>
                      ))}
                    </div>
                  )}
                </OrbitCardContent>
              </OrbitCard>
            </BentoTile>
          </BentoGrid>
        )}
      </div>
    </div>
  );
}
