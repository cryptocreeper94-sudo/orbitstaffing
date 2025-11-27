import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  Star,
  Filter,
  Search,
  TrendingUp,
  Briefcase,
  Users,
  AlertCircle,
  ArrowRight,
  Heart,
  Bookmark,
  Share2
} from 'lucide-react';

interface Shift {
  id: string;
  title: string;
  company: string;
  location: string;
  address: string;
  date: string;
  startTime: string;
  endTime: string;
  payRate: number;
  duration: number;
  category: string;
  requiredSkills: string[];
  spotsTotal: number;
  spotsFilled: number;
  distance: number;
  rating: number;
  bonus: number | null;
  urgency: 'normal' | 'urgent' | 'critical';
  status: 'available' | 'claimed' | 'full';
}

const mockShifts: Shift[] = [
  {
    id: 'SH-001',
    title: 'Warehouse Associate',
    company: 'Acme Warehousing',
    location: 'Nashville, TN',
    address: '123 Industrial Pkwy, Nashville, TN 37210',
    date: '2025-12-02',
    startTime: '07:00 AM',
    endTime: '03:00 PM',
    payRate: 18.50,
    duration: 8,
    category: 'Warehouse',
    requiredSkills: ['Forklift Certified', 'Inventory Management'],
    spotsTotal: 5,
    spotsFilled: 3,
    distance: 2.3,
    rating: 4.8,
    bonus: 25,
    urgency: 'urgent',
    status: 'available'
  },
  {
    id: 'SH-002',
    title: 'Event Setup Crew',
    company: 'Premier Events LLC',
    location: 'Louisville, KY',
    address: '456 Convention Center Dr, Louisville, KY 40202',
    date: '2025-12-05',
    startTime: '05:00 PM',
    endTime: '11:00 PM',
    payRate: 22.00,
    duration: 6,
    category: 'Events',
    requiredSkills: ['Customer Service', 'Physical Labor'],
    spotsTotal: 10,
    spotsFilled: 7,
    distance: 45.2,
    rating: 4.7,
    bonus: null,
    urgency: 'normal',
    status: 'available'
  },
  {
    id: 'SH-003',
    title: 'Construction Laborer',
    company: 'BuildRight Construction',
    location: 'Knoxville, TN',
    address: '789 Builder Rd, Knoxville, TN 37919',
    date: '2025-12-03',
    startTime: '06:00 AM',
    endTime: '02:00 PM',
    payRate: 25.00,
    duration: 8,
    category: 'Construction',
    requiredSkills: ['Safety Training', 'Construction Experience'],
    spotsTotal: 8,
    spotsFilled: 8,
    distance: 78.5,
    rating: 4.9,
    bonus: 50,
    urgency: 'critical',
    status: 'full'
  },
  {
    id: 'SH-004',
    title: 'Retail Associate - Black Friday',
    company: 'MegaMart Retail',
    location: 'Nashville, TN',
    address: '321 Shopping Plaza, Nashville, TN 37211',
    date: '2025-11-29',
    startTime: '04:00 AM',
    endTime: '12:00 PM',
    payRate: 20.00,
    duration: 8,
    category: 'Retail',
    requiredSkills: ['Customer Service'],
    spotsTotal: 15,
    spotsFilled: 12,
    distance: 5.1,
    rating: 4.5,
    bonus: 100,
    urgency: 'critical',
    status: 'available'
  },
  {
    id: 'SH-005',
    title: 'Food Service Worker',
    company: 'Taste of Nashville Catering',
    location: 'Nashville, TN',
    address: '654 Culinary Way, Nashville, TN 37203',
    date: '2025-12-01',
    startTime: '10:00 AM',
    endTime: '06:00 PM',
    payRate: 16.50,
    duration: 8,
    category: 'Hospitality',
    requiredSkills: ['Food Handling Certification'],
    spotsTotal: 6,
    spotsFilled: 4,
    distance: 3.7,
    rating: 4.6,
    bonus: null,
    urgency: 'normal',
    status: 'available'
  }
];

export function ShiftMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [savedShifts, setSavedShifts] = useState<string[]>([]);

  const categories = ['all', 'Warehouse', 'Construction', 'Events', 'Retail', 'Hospitality'];

  const availableShifts = mockShifts.filter(s => s.status === 'available');
  const urgentShifts = availableShifts.filter(s => s.urgency === 'urgent' || s.urgency === 'critical');

  const handleSaveShift = (shiftId: string) => {
    if (savedShifts.includes(shiftId)) {
      setSavedShifts(savedShifts.filter(id => id !== shiftId));
    } else {
      setSavedShifts([...savedShifts, shiftId]);
    }
  };

  const calculateEarnings = (shift: Shift) => {
    const baseEarnings = shift.payRate * shift.duration;
    const bonusAmount = shift.bonus || 0;
    return baseEarnings + bonusAmount;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-cyan-400" />
          Shift Marketplace
        </h2>
        <p className="text-gray-400">Browse and claim open shifts • Self-scheduling • Real-time availability</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/30 border border-cyan-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <Briefcase className="w-6 h-6 text-cyan-400" />
            <span className="text-2xl font-bold text-white">{availableShifts.length}</span>
          </div>
          <p className="text-cyan-300 font-bold mt-2">Available Shifts</p>
        </div>
        <div className="bg-gradient-to-br from-red-900/50 to-red-800/30 border border-red-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <span className="text-2xl font-bold text-white">{urgentShifts.length}</span>
          </div>
          <p className="text-red-300 font-bold mt-2">Urgent Fills</p>
        </div>
        <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 border border-green-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <DollarSign className="w-6 h-6 text-green-400" />
            <span className="text-2xl font-bold text-white">
              ${mockShifts.reduce((sum, s) => sum + (s.bonus || 0), 0)}
            </span>
          </div>
          <p className="text-green-300 font-bold mt-2">Bonus Pool</p>
        </div>
        <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <Bookmark className="w-6 h-6 text-purple-400" />
            <span className="text-2xl font-bold text-white">{savedShifts.length}</span>
          </div>
          <p className="text-purple-300 font-bold mt-2">Saved Shifts</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search shifts by title, company, or location..."
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-shifts"
          />
        </div>
        <Button variant="outline" data-testid="button-advanced-filters">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
            data-testid={`filter-category-${category}`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Shift Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockShifts
          .filter(shift => selectedCategory === 'all' || shift.category === selectedCategory)
          .map((shift) => (
            <div
              key={shift.id}
              className={`bg-slate-800 border rounded-lg p-6 transition-all hover:border-cyan-500 ${
                shift.status === 'full'
                  ? 'border-slate-700 opacity-60'
                  : shift.urgency === 'critical'
                  ? 'border-red-500/50'
                  : shift.urgency === 'urgent'
                  ? 'border-yellow-500/50'
                  : 'border-slate-700'
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-white">{shift.title}</h3>
                    {shift.status === 'full' && (
                      <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded">FULL</span>
                    )}
                    {shift.urgency === 'urgent' && shift.status !== 'full' && (
                      <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded animate-pulse">URGENT</span>
                    )}
                    {shift.urgency === 'critical' && shift.status !== 'full' && (
                      <span className="px-2 py-1 bg-red-600 text-white text-xs rounded animate-pulse">CRITICAL</span>
                    )}
                  </div>
                  <p className="text-gray-400 font-medium">{shift.company}</p>
                </div>
                <button
                  onClick={() => handleSaveShift(shift.id)}
                  className="focus:outline-none"
                  data-testid={`button-save-${shift.id}`}
                >
                  {savedShifts.includes(shift.id) ? (
                    <Bookmark className="w-6 h-6 text-purple-400 fill-purple-400" />
                  ) : (
                    <Bookmark className="w-6 h-6 text-gray-600 hover:text-gray-500" />
                  )}
                </button>
              </div>

              {/* Location & Date */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm">{shift.location}</span>
                  <span className="text-xs text-gray-500">• {shift.distance} miles away</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm">{shift.date}</span>
                  <span className="text-xs text-gray-500">• {shift.startTime} - {shift.endTime}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm">{shift.duration} hours</span>
                </div>
              </div>

              {/* Pay Information */}
              <div className="bg-gradient-to-r from-green-900/30 to-green-800/20 border border-green-700/50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Hourly Rate</p>
                    <p className="text-2xl font-bold text-green-400">${shift.payRate}/hr</p>
                  </div>
                  {shift.bonus && (
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-1">Shift Bonus</p>
                      <p className="text-xl font-bold text-yellow-400">+${shift.bonus}</p>
                    </div>
                  )}
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-1">Total Earnings</p>
                    <p className="text-2xl font-bold text-white">${calculateEarnings(shift)}</p>
                  </div>
                </div>
              </div>

              {/* Skills Required */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Required Skills:</p>
                <div className="flex gap-2 flex-wrap">
                  {shift.requiredSkills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 bg-cyan-900/30 text-cyan-300 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Spots & Rating */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">
                    {shift.spotsFilled}/{shift.spotsTotal} spots filled
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm text-white font-bold">{shift.rating}</span>
                  <span className="text-xs text-gray-400">company rating</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {shift.status === 'available' ? (
                  <>
                    <Button
                      className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                      data-testid={`button-claim-${shift.id}`}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Claim Shift
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedShift(shift)}
                      data-testid={`button-details-${shift.id}`}
                    >
                      Details
                    </Button>
                  </>
                ) : (
                  <Button
                    className="flex-1"
                    variant="outline"
                    disabled
                    data-testid={`button-full-${shift.id}`}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Fully Staffed
                  </Button>
                )}
              </div>
            </div>
          ))}
      </div>

      {/* Shift Detail Modal (shown when selectedShift is set) */}
      {selectedShift && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedShift.title}</h2>
                <p className="text-gray-400">{selectedShift.company}</p>
              </div>
              <button
                onClick={() => setSelectedShift(null)}
                className="text-gray-400 hover:text-white"
                data-testid="button-close-modal"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-400 mb-2">LOCATION</h3>
                <p className="text-white">{selectedShift.address}</p>
                <p className="text-sm text-gray-400 mt-1">{selectedShift.distance} miles from your location</p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-400 mb-2">SCHEDULE</h3>
                <p className="text-white">{selectedShift.date}</p>
                <p className="text-white">{selectedShift.startTime} - {selectedShift.endTime} ({selectedShift.duration} hours)</p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-400 mb-2">COMPENSATION</h3>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Base Pay:</span>
                    <span className="text-white font-bold">${selectedShift.payRate}/hr × {selectedShift.duration}h = ${selectedShift.payRate * selectedShift.duration}</span>
                  </div>
                  {selectedShift.bonus && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">Shift Bonus:</span>
                      <span className="text-yellow-400 font-bold">+${selectedShift.bonus}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-600 pt-2 mt-2 flex justify-between">
                    <span className="text-white font-bold">Total Earnings:</span>
                    <span className="text-green-400 font-bold text-xl">${calculateEarnings(selectedShift)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-400 mb-2">REQUIRED SKILLS</h3>
                <div className="flex gap-2 flex-wrap">
                  {selectedShift.requiredSkills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-cyan-900/30 text-cyan-300 text-sm rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-400 mb-2">COMPANY RATING</h3>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-bold text-lg">{selectedShift.rating}</span>
                  <span className="text-gray-400">/ 5.0</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                  data-testid="button-claim-modal"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Claim This Shift
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedShift(null)}
                  data-testid="button-cancel-modal"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
