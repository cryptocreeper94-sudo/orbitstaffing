import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Building2, DollarSign, FileText, AlertCircle, CheckCircle2, TrendingUp, Send } from 'lucide-react';
import { WeatherWidget } from '@/components/WeatherWidget';

interface ConnectedCustomer {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  employees: number;
  activeAssignments: number;
  status: 'active' | 'syncing' | 'pending';
  lastSync: Date;
  revenue: number;
}

interface EmployeeData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  skills: string[];
  hourlyRate: number;
  assignedCustomer: string;
  status: 'available' | 'assigned' | 'on-assignment';
}

interface PayrollRecord {
  id: string;
  employeeName: string;
  customer: string;
  hoursWorked: number;
  hourlyRate: number;
  gross: number;
  status: 'draft' | 'submitted' | 'approved' | 'paid';
}

export default function PartnerAgencyDashboard() {
  const [customers, setCustomers] = useState<ConnectedCustomer[]>([
    {
      id: '1',
      name: 'ABC Manufacturing',
      contactPerson: 'John Smith',
      email: 'john@abcmfg.com',
      employees: 28,
      activeAssignments: 12,
      status: 'active',
      lastSync: new Date(Date.now() - 3600000),
      revenue: 45000
    },
    {
      id: '2',
      name: 'XYZ Construction',
      contactPerson: 'Maria Garcia',
      email: 'maria@xyzconst.com',
      employees: 15,
      activeAssignments: 8,
      status: 'active',
      lastSync: new Date(Date.now() - 7200000),
      revenue: 28000
    }
  ]);

  const [employees] = useState<EmployeeData[]>([
    { id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@email.com', phone: '555-1234', skills: ['welding', 'electrical'], hourlyRate: 18, assignedCustomer: 'ABC Manufacturing', status: 'on-assignment' },
    { id: '2', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@email.com', phone: '555-5678', skills: ['carpentry', 'roofing'], hourlyRate: 20, assignedCustomer: 'XYZ Construction', status: 'assigned' },
    { id: '3', firstName: 'Mike', lastName: 'Wilson', email: 'mike.w@email.com', phone: '555-9012', skills: ['plumbing', 'hvac'], hourlyRate: 22, assignedCustomer: 'ABC Manufacturing', status: 'available' }
  ]);

  const [payroll] = useState<PayrollRecord[]>([
    { id: '1', employeeName: 'John Doe', customer: 'ABC Manufacturing', hoursWorked: 40, hourlyRate: 18, gross: 720, status: 'approved' },
    { id: '2', employeeName: 'Sarah Johnson', customer: 'XYZ Construction', hoursWorked: 35, hourlyRate: 20, gross: 700, status: 'submitted' },
    { id: '3', employeeName: 'Mike Wilson', customer: 'ABC Manufacturing', hoursWorked: 38, hourlyRate: 22, gross: 836, status: 'draft' }
  ]);

  const totalRevenue = customers.reduce((sum, c) => sum + c.revenue, 0);
  const totalEmployees = customers.reduce((sum, c) => sum + c.employees, 0);
  const activeAssignments = customers.reduce((sum, c) => sum + c.activeAssignments, 0);

  return (
    <Shell>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading mb-2">Partner Agency Dashboard</h1>
        <p className="text-muted-foreground">Manage connected customers, employees, and payroll in one place.</p>
      </div>

      {/* Weather Widget + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <div className="lg:col-span-1">
          <WeatherWidget />
        </div>
        <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Connected Customers</p>
                <div className="text-3xl font-bold text-foreground">{customers.length}</div>
              </div>
              <Building2 className="w-6 h-6 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Employees</p>
                <div className="text-3xl font-bold text-foreground">{totalEmployees}</div>
              </div>
              <Users className="w-6 h-6 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Assignments</p>
                <div className="text-3xl font-bold text-foreground">{activeAssignments}</div>
              </div>
              <CheckCircle2 className="w-6 h-6 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Monthly Revenue</p>
                <div className="text-3xl font-bold text-primary">${(totalRevenue / 1000).toFixed(0)}K</div>
              </div>
              <TrendingUp className="w-6 h-6 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="customers" className="space-y-6">
        <TabsList className="bg-card border border-border/50">
          <TabsTrigger value="customers">Connected Customers</TabsTrigger>
          <TabsTrigger value="employees">Manage Employees</TabsTrigger>
          <TabsTrigger value="payroll">Payroll & Tax</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Connected Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Customers Using Your Agency</h2>
            <Button className="bg-primary hover:bg-primary/90" data-testid="button-add-customer">
              <Send className="w-4 h-4 mr-2" />
              Request New Connection
            </Button>
          </div>

          {customers.map(customer => (
            <Card key={customer.id} className="border-l-4 border-l-primary bg-card/50" data-testid={`customer-card-${customer.id}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-foreground">{customer.name}</h3>
                      <Badge variant="outline" className={customer.status === 'active' ? 'bg-green-900/30 border-green-700 text-green-300' : 'bg-yellow-900/30 border-yellow-700 text-yellow-300'}>
                        {customer.status === 'active' ? 'Active' : 'Syncing'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{customer.contactPerson} • {customer.email}</p>
                  </div>
                  <Button variant="outline" size="sm" data-testid={`button-manage-${customer.id}`}>
                    Manage
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-4 py-4 border-t border-b border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Employees</p>
                    <p className="text-xl font-bold text-foreground">{customer.employees}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Assignments</p>
                    <p className="text-xl font-bold text-foreground">{customer.activeAssignments}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Monthly Revenue</p>
                    <p className="text-xl font-bold text-primary">${customer.revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Last Sync</p>
                    <p className="text-sm text-foreground">{customer.lastSync.toLocaleTimeString()}</p>
                  </div>
                </div>

                <Button variant="ghost" size="sm" className="mt-3" data-testid={`button-sync-${customer.id}`}>
                  🔄 Sync Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Manage Employees Tab */}
        <TabsContent value="employees" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Your Employees</h2>
            <Button className="bg-primary hover:bg-primary/90" data-testid="button-add-employee">
              + Add Employee
            </Button>
          </div>

          <Card className="border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-card/50 border-b border-border/50">
                  <tr>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Name</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Email</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Skills</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Rate</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Assigned To</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id} className="border-b border-border/50 hover:bg-card/50" data-testid={`employee-row-${emp.id}`}>
                      <td className="px-6 py-3 font-medium text-foreground">{emp.firstName} {emp.lastName}</td>
                      <td className="px-6 py-3 text-muted-foreground text-xs">{emp.email}</td>
                      <td className="px-6 py-3 text-xs">
                        <div className="flex gap-1 flex-wrap">
                          {emp.skills.map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-3 font-medium text-primary">${emp.hourlyRate}/hr</td>
                      <td className="px-6 py-3 text-sm">{emp.assignedCustomer}</td>
                      <td className="px-6 py-3">
                        <Badge
                          variant="outline"
                          className={emp.status === 'on-assignment' ? 'bg-green-900/30 text-green-300' : emp.status === 'assigned' ? 'bg-blue-900/30 text-blue-300' : 'bg-gray-900/30 text-gray-300'}
                        >
                          {emp.status === 'on-assignment' ? 'On Assignment' : emp.status === 'assigned' ? 'Assigned' : 'Available'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Payroll & Tax Tab */}
        <TabsContent value="payroll" className="space-y-4">
          <h2 className="text-xl font-bold">Payroll & Tax Records</h2>

          <Card className="border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-card/50 border-b border-border/50">
                  <tr>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Employee</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Customer</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Hours</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Rate</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Gross</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Status</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.map(record => (
                    <tr key={record.id} className="border-b border-border/50 hover:bg-card/50" data-testid={`payroll-row-${record.id}`}>
                      <td className="px-6 py-3 font-medium text-foreground">{record.employeeName}</td>
                      <td className="px-6 py-3 text-sm text-muted-foreground">{record.customer}</td>
                      <td className="px-6 py-3 font-medium">{record.hoursWorked}h</td>
                      <td className="px-6 py-3 text-primary">${record.hourlyRate}/hr</td>
                      <td className="px-6 py-3 font-bold text-foreground">${record.gross.toFixed(2)}</td>
                      <td className="px-6 py-3">
                        <Badge
                          variant="outline"
                          className={
                            record.status === 'paid' ? 'bg-green-900/30 text-green-300' :
                            record.status === 'approved' ? 'bg-blue-900/30 text-blue-300' :
                            record.status === 'submitted' ? 'bg-yellow-900/30 text-yellow-300' :
                            'bg-gray-900/30 text-gray-300'
                          }
                        >
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-3">
                        <Button variant="ghost" size="sm" className="text-xs" data-testid={`button-action-${record.id}`}>
                          {record.status === 'draft' ? 'Submit' : 'View'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Tax Summary */}
          <Card className="bg-primary/10 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Tax & Compliance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Total Payroll (MTD)</p>
                  <p className="text-2xl font-bold text-foreground">$2,256</p>
                </div>
                <div className="bg-card/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Federal Tax (Withheld)</p>
                  <p className="text-2xl font-bold text-foreground">$225</p>
                </div>
                <div className="bg-card/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">FICA (Employer)</p>
                  <p className="text-2xl font-bold text-foreground">$173</p>
                </div>
                <div className="bg-card/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Net Payroll</p>
                  <p className="text-2xl font-bold text-primary">$1,858</p>
                </div>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90" data-testid="button-generate-tax-forms">
                <FileText className="w-4 h-4 mr-2" />
                Generate Tax Forms (941, W-2)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <h2 className="text-xl font-bold">Compliance & Documentation</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-green-500 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  I-9 Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Track I-9 verification status for all employees</p>
                <div className="space-y-2 text-sm mb-4">
                  <p><strong>Verified:</strong> 3/3 employees</p>
                  <p className="text-muted-foreground">All I-9 forms up to date</p>
                </div>
                <Button variant="outline" size="sm" className="w-full" data-testid="button-view-i9">
                  View Details
                </Button>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Background Checks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Employee background check status</p>
                <div className="space-y-2 text-sm mb-4">
                  <p><strong>Completed:</strong> 3/3 employees</p>
                  <p className="text-muted-foreground">All checks passed</p>
                </div>
                <Button variant="outline" size="sm" className="w-full" data-testid="button-view-bg">
                  View Details
                </Button>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  Workers Compensation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Workers comp insurance status</p>
                <div className="space-y-2 text-sm mb-4">
                  <p><strong>Status:</strong> Active</p>
                  <p className="text-muted-foreground">Expires: 12/31/2025</p>
                </div>
                <Button variant="outline" size="sm" className="w-full" data-testid="button-view-wc">
                  View Details
                </Button>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="w-5 h-5 text-purple-400" />
                  Audit Trail
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">All payroll and compliance changes logged</p>
                <div className="space-y-2 text-sm mb-4">
                  <p><strong>Last 30 Days:</strong> 47 changes</p>
                  <p className="text-muted-foreground">All audit-ready</p>
                </div>
                <Button variant="outline" size="sm" className="w-full" data-testid="button-view-audit">
                  View Audit Log
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Info Box */}
      <Card className="bg-primary/10 border-primary/30 mt-8">
        <CardContent className="p-6">
          <p className="text-sm text-foreground">
            💡 <strong>Real-Time Sync:</strong> All data syncs automatically with your connected customers. Changes to employees, assignments, and payroll are reflected instantly in their dashboard.
          </p>
        </CardContent>
      </Card>
    </Shell>
  );
}
