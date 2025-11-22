import React, { useState } from 'react';
import WorkflowDemo from '@/components/WorkflowDemo';
import { Button } from '@/components/ui/button';

export default function WorkflowDemoPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <WorkflowDemo isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {!isOpen && (
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">See How ORBIT Works</h1>
          <p className="text-xl text-gray-700 mb-8">
            Visual walkthrough of the complete workflow—from worker download to payroll.
          </p>
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4"
            data-testid="button-open-demo"
          >
            Open Workflow Demo
          </Button>
        </div>
      )}
    </div>
  );
}
