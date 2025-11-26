import { useState } from 'react';
import { Search, Filter, Save, Trash2, Star, X, MapPin, DollarSign, Calendar, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchFilter {
  id: string;
  name: string;
  criteria: {
    skills?: string[];
    location?: string;
    minRate?: number;
    maxRate?: number;
    availability?: string[];
    rating?: number;
    industry?: string;
  };
  isFavorite?: boolean;
}

interface Worker {
  id: string;
  name: string;
  skills: string[];
  location: string;
  hourlyRate: number;
  rating: number;
  availability: string[];
  industry: string;
}

const mockWorkers: Worker[] = [
  {
    id: 'WRK-001',
    name: 'John Davis',
    skills: ['Forklift', 'Warehouse', 'Loading'],
    location: 'Nashville, TN',
    hourlyRate: 18.50,
    rating: 4.8,
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    industry: 'Warehouse',
  },
  {
    id: 'WRK-002',
    name: 'Sarah Chen',
    skills: ['Bartending', 'Customer Service', 'POS'],
    location: 'Memphis, TN',
    hourlyRate: 16.00,
    rating: 4.9,
    availability: ['Fri', 'Sat', 'Sun'],
    industry: 'Hospitality',
  },
  {
    id: 'WRK-003',
    name: 'Mike Torres',
    skills: ['Construction', 'Framing', 'Concrete'],
    location: 'Louisville, KY',
    hourlyRate: 22.00,
    rating: 4.7,
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    industry: 'Construction',
  },
];

export function AdvancedSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [savedFilters, setSavedFilters] = useState<SearchFilter[]>([
    {
      id: 'filter-1',
      name: 'Weekend Hospitality Workers',
      criteria: {
        industry: 'Hospitality',
        availability: ['Sat', 'Sun'],
        minRate: 15,
        maxRate: 20,
      },
      isFavorite: true,
    },
    {
      id: 'filter-2',
      name: 'Experienced Construction (Nashville)',
      criteria: {
        industry: 'Construction',
        location: 'Nashville',
        rating: 4.5,
        minRate: 20,
      },
      isFavorite: false,
    },
  ]);
  
  const [currentFilter, setCurrentFilter] = useState<SearchFilter['criteria']>({
    skills: [],
    location: '',
    minRate: undefined,
    maxRate: undefined,
    availability: [],
    rating: undefined,
    industry: '',
  });

  const [results, setResults] = useState<Worker[]>(mockWorkers);
  const [showSaveFilter, setShowSaveFilter] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');

  const handleSearch = () => {
    let filtered = mockWorkers;

    if (searchQuery) {
      filtered = filtered.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (currentFilter.industry) {
      filtered = filtered.filter(w => w.industry === currentFilter.industry);
    }

    if (currentFilter.location) {
      filtered = filtered.filter(w => w.location.toLowerCase().includes(currentFilter.location!.toLowerCase()));
    }

    if (currentFilter.minRate) {
      filtered = filtered.filter(w => w.hourlyRate >= currentFilter.minRate!);
    }

    if (currentFilter.maxRate) {
      filtered = filtered.filter(w => w.hourlyRate <= currentFilter.maxRate!);
    }

    if (currentFilter.rating) {
      filtered = filtered.filter(w => w.rating >= currentFilter.rating!);
    }

    if (currentFilter.availability && currentFilter.availability.length > 0) {
      filtered = filtered.filter(w =>
        currentFilter.availability!.some(day => w.availability.includes(day))
      );
    }

    setResults(filtered);
  };

  const loadFilter = (filter: SearchFilter) => {
    setCurrentFilter(filter.criteria);
    setSearchQuery('');
    setTimeout(handleSearch, 100);
  };

  const saveCurrentFilter = () => {
    if (!newFilterName.trim()) return;

    const newFilter: SearchFilter = {
      id: `filter-${Date.now()}`,
      name: newFilterName,
      criteria: { ...currentFilter },
      isFavorite: false,
    };

    setSavedFilters([...savedFilters, newFilter]);
    setNewFilterName('');
    setShowSaveFilter(false);
  };

  const deleteFilter = (id: string) => {
    setSavedFilters(savedFilters.filter(f => f.id !== id));
  };

  const toggleFavorite = (id: string) => {
    setSavedFilters(savedFilters.map(f =>
      f.id === id ? { ...f, isFavorite: !f.isFavorite } : f
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Advanced Search & Filters</h2>
        <p className="text-gray-400 text-sm">Find workers with powerful search and saved filter presets</p>
      </div>

      {/* Main Search Bar */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by name, skill, certification..."
              className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              data-testid="input-search-query"
            />
          </div>
          <Button onClick={handleSearch} className="bg-cyan-600 hover:bg-cyan-700 px-6" data-testid="button-search">
            Search
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </h3>
              <button
                onClick={() => setShowSaveFilter(!showSaveFilter)}
                className="text-xs text-cyan-400 hover:text-cyan-300"
                data-testid="button-save-filter"
              >
                <Save className="w-4 h-4" />
              </button>
            </div>

            {showSaveFilter && (
              <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                <input
                  type="text"
                  value={newFilterName}
                  onChange={(e) => setNewFilterName(e.target.value)}
                  placeholder="Filter name..."
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm mb-2"
                  data-testid="input-filter-name"
                />
                <Button onClick={saveCurrentFilter} className="w-full bg-cyan-600 hover:bg-cyan-700 text-sm py-2">
                  Save Filter
                </Button>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Industry</label>
                <select
                  value={currentFilter.industry}
                  onChange={(e) => setCurrentFilter({ ...currentFilter, industry: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  data-testid="select-industry"
                >
                  <option value="">All Industries</option>
                  <option value="Construction">Construction</option>
                  <option value="Hospitality">Hospitality</option>
                  <option value="Warehouse">Warehouse</option>
                  <option value="Events">Events</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Location</label>
                <input
                  type="text"
                  value={currentFilter.location}
                  onChange={(e) => setCurrentFilter({ ...currentFilter, location: e.target.value })}
                  placeholder="City, State"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  data-testid="input-location"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1 block">Min Rate ($)</label>
                  <input
                    type="number"
                    value={currentFilter.minRate || ''}
                    onChange={(e) => setCurrentFilter({ ...currentFilter, minRate: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                    data-testid="input-min-rate"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 mb-1 block">Max Rate ($)</label>
                  <input
                    type="number"
                    value={currentFilter.maxRate || ''}
                    onChange={(e) => setCurrentFilter({ ...currentFilter, maxRate: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                    data-testid="input-max-rate"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Min Rating</label>
                <select
                  value={currentFilter.rating || ''}
                  onChange={(e) => setCurrentFilter({ ...currentFilter, rating: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  data-testid="select-rating"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Availability</label>
                <div className="flex flex-wrap gap-1">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <button
                      key={day}
                      onClick={() => {
                        const days = currentFilter.availability?.includes(day)
                          ? currentFilter.availability.filter(d => d !== day)
                          : [...(currentFilter.availability || []), day];
                        setCurrentFilter({ ...currentFilter, availability: days });
                      }}
                      className={`px-2 py-1 text-xs rounded ${
                        currentFilter.availability?.includes(day)
                          ? 'bg-cyan-500 text-white'
                          : 'bg-slate-700 text-gray-300'
                      }`}
                      data-testid={`button-avail-${day}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Saved Filters */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h3 className="font-bold text-sm mb-3">Saved Filters</h3>
            <div className="space-y-2">
              {savedFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="flex items-center justify-between p-2 bg-slate-700/50 rounded hover:bg-slate-700 transition group"
                >
                  <button
                    onClick={() => loadFilter(filter)}
                    className="flex-1 text-left text-sm font-medium flex items-center gap-2"
                    data-testid={`button-load-filter-${filter.id}`}
                  >
                    {filter.isFavorite && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                    {filter.name}
                  </button>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => toggleFavorite(filter.id)}
                      className="p-1 hover:bg-slate-600 rounded"
                      data-testid={`button-fav-${filter.id}`}
                    >
                      <Star className={`w-3 h-3 ${filter.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
                    </button>
                    <button
                      onClick={() => deleteFilter(filter.id)}
                      className="p-1 hover:bg-red-600/20 rounded"
                      data-testid={`button-delete-${filter.id}`}
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Results ({results.length})</h3>
              <button
                onClick={() => {
                  setCurrentFilter({});
                  setSearchQuery('');
                  setResults(mockWorkers);
                }}
                className="text-xs text-gray-400 hover:text-white"
                data-testid="button-clear-filters"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-3">
              {results.map((worker) => (
                <div
                  key={worker.id}
                  className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition"
                  data-testid={`worker-${worker.id}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold">{worker.name}</h4>
                      <p className="text-xs text-gray-400">{worker.id}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-bold">{worker.rating}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div className="flex items-center gap-1 text-gray-400">
                      <MapPin className="w-3 h-3" />
                      {worker.location}
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <DollarSign className="w-3 h-3" />
                      ${worker.hourlyRate}/hr
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {worker.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {results.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No workers match your search criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
