import React, { useState } from 'react';
import { Users, FileText, MapPin, Phone, Mail, Briefcase, Calendar, SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Employee {
  id: string;
  name: string;
  employeeNumber: string;
  image?: string;
  skillSet: string[];
  onboardDate: string;
  dispatchDate?: string;
  currentAssignment?: string;
  customerCode?: string;
  assignmentAddress?: string;
  onsiteContactName?: string;
  onsiteContactPhone?: string;
  emergencyContact?: string;
  notes?: string;
}

interface UniversalEmployeeRegistryProps {
  employees?: Employee[];
  userRole?: 'admin' | 'dev';
  onSelectEmployee?: (employee: Employee) => void;
}

export default function UniversalEmployeeRegistry({
  employees = [
    {
      id: '1',
      name: 'John Smith',
      employeeNumber: 'EMP-0001',
      image: '👨‍🔧',
      skillSet: ['Electrician', 'HVAC'],
      onboardDate: '2024-01-15',
      dispatchDate: '2024-02-01',
      currentAssignment: 'TechCorp Warehouse A',
      customerCode: 'TECHCORP-001',
      assignmentAddress: '123 Industrial Pkwy, Nashville, TN',
      onsiteContactName: 'Mike Johnson',
      onsiteContactPhone: '615-555-0123',
      emergencyContact: 'Jane Smith (615-555-0456)',
      notes: 'Top performer, highly reliable',
    },
    {
      id: '2',
      name: 'Maria Garcia',
      employeeNumber: 'EMP-0002',
      image: '👩‍🏭',
      skillSet: ['Forklift', 'Inventory'],
      onboardDate: '2024-02-01',
      dispatchDate: '2024-02-10',
      currentAssignment: 'Logistics Hub B',
      customerCode: 'LOGISTICS-002',
      assignmentAddress: '456 Warehouse Ln, Nashville, TN',
      onsiteContactName: 'Sarah Chen',
      onsiteContactPhone: '615-555-0789',
      emergencyContact: 'Carlos Garcia (615-555-0321)',
      notes: 'Available for overtime',
    },
  ],
  userRole = 'admin',
  onSelectEmployee,
}: UniversalEmployeeRegistryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [filterSkill, setFilterSkill] = useState<string>('');

  const allSkills = [...new Set(employees.flatMap(e => e.skillSet))];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeNumber.includes(searchTerm);
    const matchesSkill = !filterSkill || emp.skillSet.includes(filterSkill);
    return matchesSearch && matchesSkill;
  });

  if (selectedEmployee) {
    return (
      <div className="bg-slate-900 min-h-screen p-6">
        <button
          onClick={() => setSelectedEmployee(null)}
          className="text-cyan-400 hover:text-cyan-300 mb-4 flex items-center gap-2"
          data-testid="button-back-to-list"
        >
          ← Back to List
        </button>

        <div className="max-w-2xl mx-auto bg-slate-800 border border-cyan-500/30 rounded-lg p-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="text-6xl">{selectedEmployee.image || '👤'}</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{selectedEmployee.name}</h2>
              <div className="text-sm text-gray-400">{selectedEmployee.employeeNumber}</div>
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedEmployee.skillSet.map(skill => (
                  <span key={skill} className="px-2 py-1 bg-cyan-600/20 text-cyan-400 rounded text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Onboard Date</label>
                <div className="text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  {selectedEmployee.onboardDate}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">First Dispatch</label>
                <div className="text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  {selectedEmployee.dispatchDate || 'Not dispatched'}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Current Assignment</label>
                <div className="text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                  {selectedEmployee.currentAssignment || 'Available'}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Customer Code</label>
                <div className="text-white">{selectedEmployee.customerCode || 'N/A'}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Assignment Address</label>
                <div className="text-white flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400 mt-0.5" />
                  <div className="text-sm">{selectedEmployee.assignmentAddress || 'TBD'}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Onsite Contact</label>
                <div className="text-white text-sm">
                  {selectedEmployee.onsiteContactName}
                  {selectedEmployee.onsiteContactPhone && (
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" />
                      {selectedEmployee.onsiteContactPhone}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Emergency Contact</label>
                <div className="text-white text-sm">{selectedEmployee.emergencyContact || 'Not provided'}</div>
              </div>
            </div>
          </div>

          {selectedEmployee.notes && (
            <div className="mt-6 p-4 bg-slate-700/50 rounded border border-slate-600">
              <label className="block text-xs text-gray-400 mb-2">Notes</label>
              <div className="text-white text-sm">{selectedEmployee.notes}</div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button className="bg-cyan-600 hover:bg-cyan-700" data-testid="button-view-timecards">
              <FileText className="w-4 h-4 mr-2" />
              View Timecards
            </Button>
            <Button variant="outline" data-testid="button-view-i9">
              <FileText className="w-4 h-4 mr-2" />
              View I-9 Docs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Users className="w-6 h-6 text-cyan-400" />
          Universal Employee Registry
        </h2>

        {/* Filters */}
        <div className="bg-slate-800 border border-cyan-500/30 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Search</label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Name or Employee #"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                  data-testid="input-search-employee"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Filter by Skill</label>
              <select
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-cyan-400"
                data-testid="select-skill-filter"
              >
                <option value="">All Skills</option>
                {allSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-400">
                {filteredEmployees.length} / {employees.length} employees
              </div>
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="space-y-3">
          {filteredEmployees.map(emp => (
            <div
              key={emp.id}
              onClick={() => {
                setSelectedEmployee(emp);
                onSelectEmployee?.(emp);
              }}
              className="bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-lg p-4 cursor-pointer transition-colors"
              data-testid={`employee-card-${emp.id}`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{emp.image || '👤'}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg">{emp.name}</h3>
                  <div className="text-sm text-gray-400">{emp.employeeNumber}</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {emp.skillSet.slice(0, 3).map(skill => (
                      <span key={skill} className="px-2 py-1 bg-cyan-600/20 text-cyan-400 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="text-gray-400">
                    <div>Since {new Date(emp.onboardDate).toLocaleDateString()}</div>
                    {emp.currentAssignment && (
                      <div className="text-cyan-400 mt-1">{emp.currentAssignment}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredEmployees.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No employees found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
