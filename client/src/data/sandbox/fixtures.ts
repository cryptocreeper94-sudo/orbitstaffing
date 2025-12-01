export const sandboxWorkers = [
  {
    id: 'demo-1',
    name: 'Jane Demo',
    email: 'jane.demo@example.com',
    phone: '(555) 123-4567',
    status: 'active',
    role: 'General Labor',
    hireDate: '2024-01-15',
    hourlyRate: 18.50,
    hoursThisWeek: 32,
    rating: 4.8,
  },
  {
    id: 'demo-2',
    name: 'John Sample',
    email: 'john.sample@example.com',
    phone: '(555) 987-6543',
    status: 'active',
    role: 'Skilled Trades',
    hireDate: '2024-02-20',
    hourlyRate: 24.00,
    hoursThisWeek: 40,
    rating: 4.5,
  },
  {
    id: 'demo-3',
    name: 'Maria Test',
    email: 'maria.test@example.com',
    phone: '(555) 555-5555',
    status: 'pending',
    role: 'Hospitality',
    hireDate: '2024-03-01',
    hourlyRate: 16.00,
    hoursThisWeek: 0,
    rating: null,
  },
];

export const sandboxClients = [
  {
    id: 'client-demo-1',
    name: 'Demo Construction Co.',
    contact: 'Bob Builder',
    email: 'bob@democonstruction.example',
    phone: '(555) 111-2222',
    status: 'active',
    activeWorkers: 12,
    openPositions: 3,
  },
  {
    id: 'client-demo-2',
    name: 'Sample Restaurant Group',
    contact: 'Chef Test',
    email: 'chef@samplerestaurant.example',
    phone: '(555) 333-4444',
    status: 'active',
    activeWorkers: 8,
    openPositions: 5,
  },
];

export const sandboxStats = {
  totalWorkers: 3,
  activeWorkers: 2,
  pendingWorkers: 1,
  totalClients: 2,
  openJobs: 8,
  placementsThisMonth: 15,
  revenue: 45250.00,
  payroll: 32180.00,
  hoursThisWeek: 72,
  avgRating: 4.65,
};

export const sandboxJobs = [
  {
    id: 'job-demo-1',
    title: 'Warehouse Associate',
    client: 'Demo Construction Co.',
    location: 'Nashville, TN',
    payRate: '$18-22/hr',
    shift: 'Day Shift',
    openings: 3,
    status: 'open',
  },
  {
    id: 'job-demo-2',
    title: 'Line Cook',
    client: 'Sample Restaurant Group',
    location: 'Louisville, KY',
    payRate: '$16-20/hr',
    shift: 'Evening',
    openings: 2,
    status: 'open',
  },
];

export const sandboxPayroll = {
  currentPeriod: {
    start: '2024-11-25',
    end: '2024-12-01',
    totalHours: 72,
    grossPay: 1440.00,
    taxes: 288.00,
    netPay: 1152.00,
  },
  pendingPayments: 2,
  processedThisMonth: 8,
};

export const sandboxCRMLeads = [
  {
    id: 'lead-demo-1',
    company: 'Future Client Inc.',
    contact: 'Prospect Person',
    email: 'prospect@futureclient.example',
    phone: '(555) 666-7777',
    status: 'qualified',
    source: 'Website',
    value: 25000,
    lastContact: '2024-11-28',
  },
  {
    id: 'lead-demo-2',
    company: 'Maybe Services LLC',
    contact: 'Undecided User',
    email: 'undecided@maybeservices.example',
    phone: '(555) 888-9999',
    status: 'new',
    source: 'Referral',
    value: 15000,
    lastContact: '2024-11-30',
  },
];
