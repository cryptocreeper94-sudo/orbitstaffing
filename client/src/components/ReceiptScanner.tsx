import { useState, useRef } from 'react';
import { Camera, Upload, Receipt, Trash2, Download, DollarSign, Calendar, Store, Tag, CheckCircle2, Loader, Eye, Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ScannedReceipt {
  id: string;
  fileName: string;
  imageData?: string;
  vendor: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
  status: 'processing' | 'completed' | 'failed';
  uploadedAt: Date;
  confidence?: number;
}

const EXPENSE_CATEGORIES = [
  { value: 'fuel', label: 'Fuel/Gas', icon: '⛽' },
  { value: 'meals', label: 'Meals & Entertainment', icon: '🍔' },
  { value: 'supplies', label: 'Office Supplies', icon: '📎' },
  { value: 'equipment', label: 'Equipment', icon: '🔧' },
  { value: 'travel', label: 'Travel', icon: '✈️' },
  { value: 'utilities', label: 'Utilities', icon: '💡' },
  { value: 'software', label: 'Software/Subscriptions', icon: '💻' },
  { value: 'marketing', label: 'Marketing/Advertising', icon: '📢' },
  { value: 'other', label: 'Other', icon: '📋' },
];

export function ReceiptScanner() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const [receipts, setReceipts] = useState<ScannedReceipt[]>([
    {
      id: 'rcpt-001',
      fileName: 'shell_gas_station.jpg',
      vendor: 'Shell Gas Station',
      amount: 52.47,
      date: '2024-11-28',
      category: 'fuel',
      description: 'Business travel - client meeting',
      status: 'completed',
      uploadedAt: new Date('2024-11-28T14:30:00'),
      confidence: 96,
    },
    {
      id: 'rcpt-002',
      fileName: 'office_depot.jpg',
      vendor: 'Office Depot',
      amount: 127.89,
      date: '2024-11-25',
      category: 'supplies',
      description: 'Printer paper and ink cartridges',
      status: 'completed',
      uploadedAt: new Date('2024-11-25T10:15:00'),
      confidence: 94,
    },
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [showAddManual, setShowAddManual] = useState(false);
  const [manualReceipt, setManualReceipt] = useState({
    vendor: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'fuel',
    description: '',
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<ScannedReceipt | null>(null);

  const processImage = async (file: File) => {
    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      
      const newReceipt: ScannedReceipt = {
        id: `rcpt-${Date.now()}`,
        fileName: file.name,
        imageData: imageData,
        vendor: 'Processing...',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        category: 'other',
        status: 'processing',
        uploadedAt: new Date(),
      };

      setReceipts(prev => [newReceipt, ...prev]);

      setTimeout(() => {
        const mockVendors = ['Shell', 'Exxon', 'BP', 'Chevron', 'QuikTrip', 'Costco Gas', 'Kroger Fuel'];
        const mockAmount = (Math.random() * 80 + 20).toFixed(2);
        
        setReceipts(prev => prev.map(r => {
          if (r.id === newReceipt.id) {
            return {
              ...r,
              vendor: mockVendors[Math.floor(Math.random() * mockVendors.length)],
              amount: parseFloat(mockAmount),
              category: 'fuel',
              status: 'completed',
              confidence: Math.floor(Math.random() * 10) + 90,
            };
          }
          return r;
        }));
        
        toast.success('Receipt scanned successfully!');
        setIsUploading(false);
      }, 2500);
    };
    
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
    e.target.value = '';
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
    e.target.value = '';
  };

  const handleAddManual = () => {
    if (!manualReceipt.vendor || !manualReceipt.amount) {
      toast.error('Please enter vendor and amount');
      return;
    }

    const newReceipt: ScannedReceipt = {
      id: `rcpt-${Date.now()}`,
      fileName: 'manual_entry',
      vendor: manualReceipt.vendor,
      amount: parseFloat(manualReceipt.amount),
      date: manualReceipt.date,
      category: manualReceipt.category,
      description: manualReceipt.description,
      status: 'completed',
      uploadedAt: new Date(),
      confidence: 100,
    };

    setReceipts(prev => [newReceipt, ...prev]);
    setShowAddManual(false);
    setManualReceipt({
      vendor: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: 'fuel',
      description: '',
    });
    toast.success('Receipt added manually');
  };

  const deleteReceipt = (id: string) => {
    setReceipts(prev => prev.filter(r => r.id !== id));
    toast.success('Receipt deleted');
  };

  const totalExpenses = receipts.reduce((sum, r) => sum + (r.status === 'completed' ? r.amount : 0), 0);
  const categoryTotals = receipts.reduce((acc, r) => {
    if (r.status === 'completed') {
      acc[r.category] = (acc[r.category] || 0) + r.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const exportToCSV = () => {
    const headers = ['Date', 'Vendor', 'Category', 'Amount', 'Description'];
    const rows = receipts
      .filter(r => r.status === 'completed')
      .map(r => [r.date, r.vendor, r.category, r.amount.toFixed(2), r.description || '']);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipts_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Receipts exported to CSV');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Receipt className="w-7 h-7 text-green-400" />
          Receipt Scanner
        </h2>
        <p className="text-gray-400 text-sm">Scan and track business receipts for tax deductions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-6 h-6 text-cyan-400" />
            <span className="text-sm font-bold text-gray-400">Total Receipts</span>
          </div>
          <p className="text-2xl font-bold">{receipts.length}</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-6 h-6 text-green-400" />
            <span className="text-sm font-bold text-gray-400">Total Expenses</span>
          </div>
          <p className="text-2xl font-bold text-green-400">${totalExpenses.toFixed(2)}</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-6 h-6 text-orange-400" />
            <span className="text-sm font-bold text-gray-400">Fuel Expenses</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">${(categoryTotals['fuel'] || 0).toFixed(2)}</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-6 h-6 text-purple-400" />
            <span className="text-sm font-bold text-gray-400">Categories</span>
          </div>
          <p className="text-2xl font-bold">{Object.keys(categoryTotals).length}</p>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Add Receipt</h3>
        
        <div className="flex flex-wrap gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            data-testid="input-receipt-file"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            className="hidden"
            data-testid="input-receipt-camera"
          />
          
          <Button
            onClick={() => cameraInputRef.current?.click()}
            className="bg-cyan-600 hover:bg-cyan-700"
            disabled={isUploading}
            data-testid="button-capture-receipt"
          >
            <Camera className="w-4 h-4 mr-2" />
            {isUploading ? 'Processing...' : 'Take Photo'}
          </Button>
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20"
            disabled={isUploading}
            data-testid="button-upload-receipt"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
          </Button>
          
          <Button
            onClick={() => setShowAddManual(!showAddManual)}
            variant="outline"
            className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
            data-testid="button-manual-receipt"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Manually
          </Button>
          
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="border-green-500 text-green-400 hover:bg-green-500/20 ml-auto"
            data-testid="button-export-receipts"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {showAddManual && (
          <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-purple-500/30 space-y-4">
            <h4 className="font-bold text-purple-400">Manual Entry</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Vendor *</label>
                <input
                  type="text"
                  value={manualReceipt.vendor}
                  onChange={(e) => setManualReceipt(prev => ({ ...prev, vendor: e.target.value }))}
                  placeholder="e.g., Shell Gas Station"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
                  data-testid="input-manual-vendor"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={manualReceipt.amount}
                  onChange={(e) => setManualReceipt(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
                  data-testid="input-manual-amount"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date</label>
                <input
                  type="date"
                  value={manualReceipt.date}
                  onChange={(e) => setManualReceipt(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
                  data-testid="input-manual-date"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <select
                  value={manualReceipt.category}
                  onChange={(e) => setManualReceipt(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
                  data-testid="select-manual-category"
                >
                  {EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description (optional)</label>
              <input
                type="text"
                value={manualReceipt.description}
                onChange={(e) => setManualReceipt(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Business travel to Nashville"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
                data-testid="input-manual-description"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddManual} className="bg-purple-600 hover:bg-purple-700" data-testid="button-save-manual">
                Save Receipt
              </Button>
              <Button onClick={() => setShowAddManual(false)} variant="ghost" className="text-gray-400">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h3 className="font-bold">Receipt History</h3>
          <span className="text-sm text-gray-400">{receipts.length} receipts</span>
        </div>
        
        <div className="divide-y divide-slate-700">
          {receipts.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No receipts yet. Scan or add your first receipt!</p>
            </div>
          ) : (
            receipts.map(receipt => {
              const category = EXPENSE_CATEGORIES.find(c => c.value === receipt.category);
              return (
                <div key={receipt.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-2xl">
                      {category?.icon || '📋'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{receipt.vendor}</span>
                        {receipt.status === 'processing' && (
                          <span className="flex items-center gap-1 text-xs text-yellow-400">
                            <Loader className="w-3 h-3 animate-spin" />
                            Processing...
                          </span>
                        )}
                        {receipt.confidence && receipt.status === 'completed' && (
                          <span className="text-xs text-green-400">{receipt.confidence}% confidence</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {receipt.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {category?.label || receipt.category}
                        </span>
                        {receipt.description && (
                          <span className="truncate max-w-xs">{receipt.description}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-400">${receipt.amount.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      {receipt.imageData && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-cyan-400 hover:text-cyan-300"
                          onClick={() => setPreviewImage(receipt.imageData || null)}
                          data-testid={`button-view-receipt-${receipt.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => deleteReceipt(receipt.id)}
                        data-testid={`button-delete-receipt-${receipt.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {Object.keys(categoryTotals).length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="font-bold mb-4">Expense Summary by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(categoryTotals).map(([cat, total]) => {
              const category = EXPENSE_CATEGORIES.find(c => c.value === cat);
              return (
                <div key={cat} className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{category?.icon || '📋'}</span>
                    <span className="text-sm text-gray-400">{category?.label || cat}</span>
                  </div>
                  <p className="text-xl font-bold text-white">${total.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl max-h-[80vh]">
            <img src={previewImage} alt="Receipt" className="max-w-full max-h-[80vh] rounded-lg" />
            <Button
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700"
              onClick={() => setPreviewImage(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
