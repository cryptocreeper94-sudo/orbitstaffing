const AUTO_RESPONSES = [
  { message: "✅ Message received!", delay: 800 },
  { message: "👍 On it!", delay: 1200 },
  { message: "📍 ETA 5 minutes", delay: 1500 },
  { message: "✔️ Task completed!", delay: 2000 },
  { message: "🔔 Notification sent", delay: 1000 },
  { message: "📊 Processing...", delay: 600 },
  { message: "💾 Saved successfully", delay: 900 },
  { message: "🎯 Assignment confirmed", delay: 1100 },
];

export function getRandomAutoResponse(): { message: string; delay: number } {
  return AUTO_RESPONSES[Math.floor(Math.random() * AUTO_RESPONSES.length)];
}

export function simulateResponse(callback: (response: string) => void): () => void {
  const { message, delay } = getRandomAutoResponse();
  const timer = setTimeout(() => callback(message), delay);
  return () => clearTimeout(timer);
}

export function simulateTypingIndicator(
  onStart: () => void,
  onMessage: (message: string) => void,
  onEnd: () => void
): () => void {
  const { message, delay } = getRandomAutoResponse();
  
  onStart();
  
  const typingTimer = setTimeout(() => {
    onMessage(message);
    onEnd();
  }, delay + 500);

  return () => clearTimeout(typingTimer);
}

const WORKFLOW_TIPS: Record<string, string[]> = {
  '/admin': [
    "💡 Try clicking on a worker card to see their full profile",
    "💡 Use the search bar to filter workers by skill or location",
    "💡 The dashboard stats update in real-time with live data",
  ],
  '/developer': [
    "💡 Check the Integration Status to see what's configured",
    "💡 Use the To-Do list to track your setup progress",
    "💡 The Asset Tracker shows all registered hallmarks",
  ],
  '/crm': [
    "💡 Drag leads between columns to update their status",
    "💡 Click a lead to see full contact history",
    "💡 Use filters to segment by source or value",
  ],
  '/payroll-processing': [
    "💡 Select multiple timesheets for batch approval",
    "💡 Click the calculate button to preview payroll totals",
    "💡 Export to CSV for external accounting systems",
  ],
  '/employee-hub': [
    "💡 Check your upcoming shifts in the calendar view",
    "💡 Submit time-off requests directly from here",
    "💡 View your pay stubs and earnings history",
  ],
  '/owner-hub': [
    "💡 Monitor all locations from the overview dashboard",
    "💡 Generate revenue reports by clicking Analytics",
    "💡 Manage franchise settings in Configuration",
  ],
  '/jobs': [
    "💡 Click on a job to see full details and requirements",
    "💡 Use filters to find jobs by location or pay rate",
    "💡 Apply directly from the job listing page",
  ],
  '/marketing-hub': [
    "💡 Create campaigns using the template builder",
    "💡 Track open rates and click-through in Analytics",
    "💡 Schedule emails for optimal delivery times",
  ],
};

export function getTipsForPage(pathname: string): string[] {
  for (const [path, tips] of Object.entries(WORKFLOW_TIPS)) {
    if (pathname.startsWith(path)) {
      return tips;
    }
  }
  return [
    "💡 Explore this section to learn its features",
    "💡 All changes in sandbox mode are temporary",
    "💡 Click 'Exit to Live' when you're ready for real data",
  ];
}

export function getRandomTip(pathname: string): string {
  const tips = getTipsForPage(pathname);
  return tips[Math.floor(Math.random() * tips.length)];
}

export const SIMULATED_NOTIFICATIONS = [
  { type: 'success', title: 'Worker Clocked In', message: 'Jane Demo checked in at Nashville site' },
  { type: 'info', title: 'New Application', message: 'John Sample submitted an application' },
  { type: 'warning', title: 'Timesheet Due', message: '3 timesheets pending approval' },
  { type: 'success', title: 'Payment Processed', message: 'Payroll batch completed successfully' },
];

export function getRandomNotification() {
  return SIMULATED_NOTIFICATIONS[Math.floor(Math.random() * SIMULATED_NOTIFICATIONS.length)];
}
