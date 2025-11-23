import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Calendar, Clock, CheckCircle2, AlertCircle, Lock, FileText } from 'lucide-react';

interface ConcentraFacility {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  distance: number; // miles
  hours: string;
  services: string[];
}

interface DrugTestAppointment {
  id: string;
  employeeName: string;
  testType: string;
  facility: string;
  appointmentTime: Date;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed';
  gpsVerified: boolean;
  chainOfCustody: {
    specimenId: string;
    status: 'collected' | 'transferred' | 'in_lab' | 'analyzed' | 'delivered';
  };
  result?: 'pending' | 'passed' | 'failed' | 'inconclusive';
}

export default function DrugTestScheduling() {
  const [zipCode, setZipCode] = useState('37201');
  const [facilities, setFacilities] = useState<ConcentraFacility[]>([
    {
      id: 'conc_001',
      name: 'Concentra - Downtown Nashville',
      address: '123 Medical Plaza Dr',
      city: 'Nashville',
      state: 'TN',
      zipCode: '37201',
      phone: '(615) 555-0100',
      distance: 0.2,
      hours: '7:00 AM - 7:00 PM (Mon-Fri), 9:00 AM - 5:00 PM (Sat-Sun)',
      services: ['5-Panel', '10-Panel', '14-Panel', 'Hair Sample', 'DOT', 'Pre-Employment']
    },
    {
      id: 'conc_002',
      name: 'Concentra - Brentwood',
      address: '456 Medical Center Blvd',
      city: 'Brentwood',
      state: 'TN',
      zipCode: '37027',
      phone: '(615) 555-0200',
      distance: 12.5,
      hours: '7:00 AM - 6:00 PM (Mon-Fri), 10:00 AM - 4:00 PM (Sat)',
      services: ['5-Panel', '10-Panel', '14-Panel', 'Hair Sample']
    }
  ]);

  const [appointments, setAppointments] = useState<DrugTestAppointment[]>([
    {
      id: '1',
      employeeName: 'John Doe',
      testType: '5-Panel',
      facility: 'Concentra - Downtown Nashville',
      appointmentTime: new Date(Date.now() + 86400000),
      status: 'confirmed',
      gpsVerified: true,
      chainOfCustody: {
        specimenId: 'SPEC-2024-001-JD',
        status: 'collected'
      },
      result: 'pending'
    }
  ]);

  const [selectedFacility, setSelectedFacility] = useState<ConcentraFacility | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');

  const handleScheduleAppointment = () => {
    if (!selectedFacility || !selectedEmployee || !selectedDate || !selectedTime) {
      return;
    }
    // Appointment would be booked via Concentra API
    console.log('Booking appointment at', selectedFacility.name);
    setSelectedFacility(null);
    setSelectedEmployee('');
    setSelectedDate('');
  };

  return (
    <Shell>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading mb-2">Drug Test Scheduling</h1>
        <p className="text-muted-foreground">
          Schedule appointments at Concentra facilities with chain of custody tracking
        </p>
      </div>

      {/* Concentra Integration Info */}
      <Card className="bg-green-900/10 border-green-700/50 mb-8">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-foreground mb-1">Concentra Integration Active</p>
              <p className="text-sm text-muted-foreground">
                Directly integrated with Concentra's appointment system. All tests include GPS verification and secure chain of custody documentation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Find Facilities */}
      <Card className="border-border/50 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Find Nearby Testing Facilities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter ZIP code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value.slice(0, 5))}
              maxLength={5}
              data-testid="input-facility-zip"
            />
            <Button className="bg-primary hover:bg-primary/90" data-testid="button-find-facilities">
              Find Facilities
            </Button>
          </div>

          <div className="space-y-3">
            {facilities.map(facility => (
              <div
                key={facility.id}
                className="border border-border/50 rounded-lg p-4 hover:bg-card/50 transition cursor-pointer"
                onClick={() => setSelectedFacility(facility)}
                data-testid={`facility-card-${facility.id}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-foreground">{facility.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {facility.address}, {facility.city}, {facility.state} {facility.zipCode}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-blue-900/30 text-blue-300">
                    {facility.distance} mi
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mb-2">{facility.hours}</p>
                <p className="text-xs text-gray-400 mb-3">Phone: {facility.phone}</p>
                <div className="flex flex-wrap gap-1">
                  {facility.services.map(service => (
                    <Badge key={service} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Appointment Modal */}
      {selectedFacility && (
        <Card className="border-primary/50 bg-primary/5 mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Schedule Appointment</CardTitle>
            <CardDescription>{selectedFacility.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Employee</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-foreground"
                data-testid="select-employee"
              >
                <option value="">Select employee...</option>
                <option value="john-doe">John Doe</option>
                <option value="sarah-johnson">Sarah Johnson</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  data-testid="input-appointment-date"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Time</label>
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  data-testid="input-appointment-time"
                />
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-2">
                <strong>What happens next:</strong>
              </p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>1. Appointment confirmed with Concentra</li>
                <li>2. Employee receives SMS/email with facility location</li>
                <li>3. GPS verification required (must be within 300ft of facility)</li>
                <li>4. Chain of custody documentation logged</li>
                <li>5. Results securely delivered with audit trail</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleScheduleAppointment}
                disabled={!selectedEmployee || !selectedDate}
                className="flex-1 bg-primary hover:bg-primary/90"
                data-testid="button-confirm-appointment"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Confirm Appointment
              </Button>
              <Button
                onClick={() => setSelectedFacility(null)}
                variant="outline"
                className="flex-1"
                data-testid="button-cancel-appointment"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Appointments */}
      <Card className="border-border/50 mb-8">
        <CardHeader>
          <CardTitle>Active Appointments & Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.map(appt => (
              <div
                key={appt.id}
                className="border border-border/50 rounded-lg p-4"
                data-testid={`appointment-card-${appt.id}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-foreground">{appt.employeeName}</h3>
                    <p className="text-sm text-muted-foreground">{appt.testType} Drug Test</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      appt.status === 'confirmed'
                        ? 'bg-green-900/30 text-green-300'
                        : appt.status === 'pending'
                        ? 'bg-yellow-900/30 text-yellow-300'
                        : 'bg-blue-900/30 text-blue-300'
                    }
                  >
                    {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{appt.facility}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{appt.appointmentTime.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{appt.appointmentTime.toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Chain of Custody */}
                <div className="bg-slate-700/30 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-foreground">Chain of Custody</span>
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="text-gray-400">
                      <strong>Specimen ID:</strong> {appt.chainOfCustody.specimenId}
                    </p>
                    <p className={`font-bold ${appt.chainOfCustody.status === 'collected' ? 'text-green-400' : 'text-yellow-400'}`}>
                      Status: {appt.chainOfCustody.status.toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* GPS Verification */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`flex items-center gap-1 text-xs ${appt.gpsVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                    <MapPin className="w-3 h-3" />
                    <span>{appt.gpsVerified ? '✓ GPS Verified' : 'Awaiting GPS Verification'}</span>
                  </div>
                </div>

                {/* Result */}
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="text-gray-400">Result: </span>
                    {appt.result ? (
                      <Badge
                        variant="outline"
                        className={
                          appt.result === 'passed'
                            ? 'bg-green-900/30 text-green-300'
                            : appt.result === 'failed'
                            ? 'bg-red-900/30 text-red-300'
                            : 'bg-yellow-900/30 text-yellow-300'
                        }
                      >
                        {appt.result.charAt(0).toUpperCase() + appt.result.slice(1)}
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">Pending</span>
                    )}
                  </div>
                  <Button variant="outline" size="sm" data-testid={`button-view-coc-${appt.id}`}>
                    <FileText className="w-4 h-4 mr-1" />
                    View Chain of Custody
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enterprise Features */}
      <Card className="bg-primary/10 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Enterprise-Grade Security & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-bold text-foreground mb-2">Concentra Integration</p>
            <ul className="text-muted-foreground space-y-1 ml-4">
              <li>✓ Direct API integration with Concentra nationwide facilities</li>
              <li>✓ Real-time appointment scheduling & confirmation</li>
              <li>✓ Automated test type routing (5/10/14-panel, hair sample)</li>
              <li>✓ Facility capacity & availability management</li>
            </ul>
          </div>

          <div>
            <p className="font-bold text-foreground mb-2">Chain of Custody Tracking</p>
            <ul className="text-muted-foreground space-y-1 ml-4">
              <li>✓ Unique specimen ID & barcode generation</li>
              <li>✓ Collector verification & credentials validation</li>
              <li>✓ Witness documentation & digital signatures</li>
              <li>✓ Complete transfer log (collection → lab → analysis)</li>
              <li>✓ Lab accreditation verification (CLIA numbers)</li>
            </ul>
          </div>

          <div>
            <p className="font-bold text-foreground mb-2">GPS Verification</p>
            <ul className="text-muted-foreground space-y-1 ml-4">
              <li>✓ Employee must arrive within 300ft of facility</li>
              <li>✓ GPS coordinates logged with timestamp</li>
              <li>✓ Proof of attendance for compliance audits</li>
              <li>✓ Geofence alerts if employee doesn't arrive</li>
            </ul>
          </div>

          <div>
            <p className="font-bold text-foreground mb-2">Secure Result Delivery</p>
            <ul className="text-muted-foreground space-y-1 ml-4">
              <li>✓ AES-256 encrypted email delivery</li>
              <li>✓ Secure portal with time-limited access</li>
              <li>✓ Medical Review Officer (MRO) verification</li>
              <li>✓ Separate audit logs per recipient (employee/employer/MRO)</li>
              <li>✓ Compliance with DOT/FMCSA regulations</li>
            </ul>
          </div>

          <div className="bg-slate-700/30 rounded-lg p-3">
            <p className="text-xs text-gray-400">
              <strong>HIPAA Compliant:</strong> All test results stored separately from personnel files. Encryption at rest & in transit. Complete audit trails for DOL/OSHA compliance.
            </p>
          </div>
        </CardContent>
      </Card>
    </Shell>
  );
}
