import React, { useState } from 'react';
import { Users, FileText, MapPin, Phone, Mail, Briefcase, Calendar, SearchIcon, QrCode, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QRCode from 'react-qr-code';

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
  contactType?: 'employee' | 'customer';
}

interface UniversalEmployeeRegistryProps {
  employees?: Employee[];
  userRole?: 'admin' | 'dev';
  onSelectEmployee?: (employee: Employee) => void;
}

export default function UniversalEmployeeRegistry({
  employees: initialEmployees = [
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
      contactType: 'employee' as const,
    },
    {
      id: '3',
      name: 'TechCorp Facility Manager',
      employeeNumber: 'CUST-0001',
      image: '🏢',
      skillSet: ['Facilities', 'Operations', 'Management'],
      onboardDate: '2024-01-10',
      currentAssignment: 'TechCorp HQ',
      customerCode: 'TECHCORP-001',
      assignmentAddress: '789 Tech Park, Nashville, TN',
      onsiteContactName: 'Robert Wilson',
      onsiteContactPhone: '615-555-0456',
      emergencyContact: 'TechCorp Main (615-555-0100)',
      notes: 'Needs 3 workers weekly, prefers morning shifts',
      contactType: 'customer' as const,
    },
    {
      id: '4',
      name: 'Logistics Solutions Director',
      employeeNumber: 'CUST-0002',
      image: '🏭',
      skillSet: ['Supply Chain', 'Logistics', 'Staffing'],
      onboardDate: '2024-02-05',
      currentAssignment: 'Logistics Hub B',
      customerCode: 'LOGISTICS-002',
      assignmentAddress: '456 Warehouse Ln, Nashville, TN',
      onsiteContactName: 'Angela Martinez',
      onsiteContactPhone: '615-555-0789',
      emergencyContact: 'Logistics Main (615-555-0200)',
      notes: 'Interested in equipment tracking feature, follow up next week',
      contactType: 'customer' as const,
    },
  ],
  userRole = 'admin',
  onSelectEmployee,
}: UniversalEmployeeRegistryProps) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [filterSkill, setFilterSkill] = useState<string>('');
  const [expandedNote, setExpandedNote] = useState(selectedEmployee?.notes || '');
  const [isSavingNote, setIsSavingNote] = useState(false);

  const allSkills = [...new Set(employees.flatMap(e => e.skillSet))];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeNumber.includes(searchTerm);
    const matchesSkill = !filterSkill || emp.skillSet.includes(filterSkill);
    return matchesSearch && matchesSkill;
  });

  const handleSaveNote = async () => {
    if (!selectedEmployee) return;
    
    try {
      setIsSavingNote(true);
      
      // Determine file type - employee or customer
      const fileType = selectedEmployee.contactType === 'customer' ? 'customer' : 'employee';
      
      // Update local state
      const updatedEmployees = employees.map(emp =>
        emp.id === selectedEmployee.id ? { ...emp, notes: expandedNote } : emp
      );
      setEmployees(updatedEmployees);
      
      // Update selected employee with new notes
      setSelectedEmployee({ ...selectedEmployee, notes: expandedNote });
      
      // In production, save to backend with file type:
      // await fetch(`/api/${fileType}s/${selectedEmployee.id}/notes`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ notes: expandedNote })
      // });
      
      console.log(`✓ Notes saved to ${fileType} file for ${selectedEmployee.name}`);
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSavingNote(false);
    }
  };

  if (selectedEmployee) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto">
        {/* Full Screen Card View - Landscape Optimized */}
        <div className="w-full min-h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8 flex flex-col">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                setSelectedEmployee(null);
                setExpandedNote('');
              }}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 text-lg font-bold"
              data-testid="button-back-to-list"
            >
              ← Back to Cards
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Contact Card - Full View</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                selectedEmployee.contactType === 'customer' 
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500' 
                  : 'bg-green-600/30 text-green-300 border border-green-500'
              }`}
              data-testid={`badge-contact-type-${selectedEmployee.contactType || 'employee'}`}
              >
                {selectedEmployee.contactType === 'customer' ? '🏢 Customer File' : '👤 Employee File'}
              </span>
            </div>
            <div className="w-24"></div>
          </div>

          {/* Main Content - Landscape Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
            {/* Left - Large Card Display */}
            <div className="lg:col-span-1 flex items-center justify-center">
              <div className="relative w-full max-w-sm h-80 rounded-lg shadow-2xl overflow-hidden border-2 border-cyan-400" style={{ backgroundColor: '#1e293b' }}>
                {/* Background */}
                <div className="absolute inset-0 opacity-5 pointer-events-none text-center pt-20">
                  <div className="text-4xl font-bold text-cyan-400">ORBIT</div>
                </div>

                {/* Left Section - Avatar */}
                <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-b from-slate-700 to-slate-800 border-r-2 border-b-2 border-cyan-400 flex items-center justify-center">
                  <div className="text-7xl">{selectedEmployee.image || '👤'}</div>
                </div>

                {/* Right Section - Info */}
                <div className="ml-32 p-4 h-full flex flex-col justify-between bg-gradient-to-br from-slate-900 to-slate-950">
                  {/* Name & Title */}
                  <div>
                    <h3 className="font-bold text-white text-lg" style={{ color: '#06B6D4' }}>
                      {selectedEmployee.name}
                    </h3>
                    <p className="text-xs opacity-90">{selectedEmployee.employeeNumber}</p>
                    <p className="text-xs opacity-75">ORBIT Staffing</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedEmployee.skillSet.slice(0, 3).map(skill => (
                        <span key={skill} className="px-1.5 py-0.5 bg-cyan-600/30 text-cyan-300 rounded text-[7px]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Onboard Date */}
                  <div className="text-xs text-gray-400">
                    Since {new Date(selectedEmployee.onboardDate).toLocaleDateString()}
                  </div>
                </div>

                {/* QR Code Section - Bottom Left */}
                <div className="absolute bottom-2 left-2 flex flex-col items-center gap-0.5 p-1 rounded bg-black/50 border border-yellow-400">
                  <div className="p-0.5 bg-white rounded-sm">
                    <QRCode value={`VCARD:${selectedEmployee.name}`} size={32} level="H" margin={0} />
                  </div>
                  <span className="text-[6px] font-mono font-bold text-yellow-400">
                    {selectedEmployee.employeeNumber}
                  </span>
                </div>

                {/* Serial - Bottom Right */}
                <div className="absolute bottom-2 right-2 text-right text-[7px]">
                  <div className="font-bold text-white font-mono">ORBIT-{selectedEmployee.employeeNumber}</div>
                  <div className="text-gray-400 text-[6px]">Powered by ORBIT</div>
                </div>
              </div>
            </div>

            {/* Right - Details & Notes */}
            <div className="lg:col-span-2 space-y-6 overflow-y-auto">
              {/* Employee Information */}
              <div className="bg-slate-800 border border-cyan-500/30 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-cyan-400" />
                  Employee Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Name</label>
                    <div className="text-white font-semibold">{selectedEmployee.name}</div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Employee ID</label>
                    <div className="text-white font-semibold">{selectedEmployee.employeeNumber}</div>
                  </div>

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
                    <label className="block text-xs text-gray-400 mb-1">Skills</label>
                    <div className="flex flex-wrap gap-1">
                      {selectedEmployee.skillSet.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-cyan-600/20 text-cyan-400 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Current Assignment</label>
                    <div className="text-white">{selectedEmployee.currentAssignment || 'Unassigned'}</div>
                  </div>
                </div>
              </div>

              {/* Contact & Location Information */}
              <div className="bg-slate-800 border border-cyan-500/30 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  Contact Details
                </h2>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Assignment Address</label>
                    <div className="text-white">{selectedEmployee.assignmentAddress || 'N/A'}</div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Onsite Contact</label>
                    <div className="text-white">{selectedEmployee.onsiteContactName || 'N/A'}</div>
                    <div className="text-sm text-cyan-400 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {selectedEmployee.onsiteContactPhone || 'N/A'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Emergency Contact</label>
                    <div className="text-white">{selectedEmployee.emergencyContact || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="bg-slate-800 border border-cyan-500/30 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  Notes & Comments
                  <span className="ml-auto text-xs text-gray-400">
                    Saves to {selectedEmployee.contactType === 'customer' ? 'Customer' : 'Employee'} File
                  </span>
                </h2>
                
                <textarea
                  value={expandedNote}
                  onChange={(e) => setExpandedNote(e.target.value)}
                  placeholder="Add notes, observations, or any important information about this contact..."
                  className="w-full h-32 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 resize-none"
                  data-testid={`textarea-employee-notes-${selectedEmployee.id}`}
                />
                
                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={handleSaveNote}
                    disabled={isSavingNote || expandedNote === selectedEmployee.notes}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    data-testid="button-save-note"
                  >
                    {isSavingNote ? '💾 Saving...' : '💾 Save Notes'}
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setExpandedNote(selectedEmployee.notes || '');
                    }}
                    variant="outline"
                    className="text-gray-300 border-gray-600"
                    data-testid="button-cancel-note"
                  >
                    Cancel
                  </Button>
                </div>

                {selectedEmployee.notes && !expandedNote && (
                  <div className="mt-3 text-xs text-gray-400">
                    ✓ Current notes: {selectedEmployee.notes.substring(0, 50)}...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show card list view
  return (
    <div className="bg-slate-900 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
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

        {/* Employee List - Business Card Format */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map(emp => {
            // Generate placeholder serial and UPC for demo
            const serialNumber = `ORBIT-${emp.employeeNumber.replace('EMP-', '')}`;
            const upcCode = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
            const vCardData = `BEGIN:VCARD\nVERSION:3.0\nFN:${emp.name}\nTITLE:${emp.skillSet[0] || 'Staff'}\nORG:ORBIT Staffing\nEND:VCARD`;
            
            return (
              <div
                key={emp.id}
                onClick={() => {
                  setSelectedEmployee(emp);
                  onSelectEmployee?.(emp);
                }}
                className="relative h-48 rounded-lg shadow-lg overflow-hidden cursor-pointer group border-2 border-cyan-500/30 hover:border-cyan-400 transition-all hover:shadow-lg hover:shadow-cyan-500/30"
                style={{ backgroundColor: '#1e293b' }}
                data-testid={`employee-card-${emp.id}`}
              >
                {/* Background */}
                <div className="absolute inset-0 opacity-5 pointer-events-none text-center pt-20">
                  <div className="text-2xl font-bold text-cyan-400">ORBIT</div>
                </div>

                {/* Left Section - Avatar */}
                <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-b from-slate-700 to-slate-800 border-r-2 border-b-2 border-cyan-400 flex items-center justify-center flex-shrink-0">
                  <div className="text-4xl">{emp.image || '👤'}</div>
                </div>

                {/* Right Section - Info */}
                <div className="ml-24 p-3 h-full flex flex-col justify-between bg-gradient-to-br from-slate-900 to-slate-950 relative z-10">
                  {/* Name & Title */}
                  <div>
                    <h3 className="font-bold text-white text-xs leading-tight truncate" style={{ color: '#06B6D4' }}>
                      {emp.name}
                    </h3>
                    <p className="text-[9px] opacity-90 truncate">{emp.employeeNumber}</p>
                    <p className="text-[8px] opacity-75">ORBIT Staffing</p>
                    <div className="flex flex-wrap gap-0.5 mt-1">
                      {emp.skillSet.slice(0, 2).map(skill => (
                        <span key={skill} className="px-1 py-0 bg-cyan-600/30 text-cyan-300 rounded text-[7px]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Onboard Date */}
                  <div className="text-[7px] text-gray-400">
                    Since {new Date(emp.onboardDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                  </div>
                </div>

                {/* QR Code Section - Bottom Left */}
                <div className="absolute bottom-1.5 left-1.5 flex flex-col items-center gap-0.5 p-1 rounded bg-black/50 border border-yellow-400">
                  <div className="p-0.5 bg-white rounded-sm">
                    <QRCode value={vCardData} size={24} level="H" margin={0} />
                  </div>
                  <span className="text-[5px] font-mono font-bold text-yellow-400 text-center">
                    {upcCode.slice(0, 6)}
                  </span>
                </div>

                {/* Serial & Asset - Bottom Right */}
                <div className="absolute bottom-1.5 right-1.5 text-right text-[6px]">
                  <div className="font-bold text-white font-mono">
                    {serialNumber.slice(0, 12)}
                  </div>
                  <div className="text-gray-400 text-[5px]">Powered by ORBIT</div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 z-20">
                  <div className="text-white text-center">
                    <p className="text-xs font-bold">Click to expand</p>
                  </div>
                </div>
              </div>
            );
          })}

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
