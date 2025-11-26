import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

interface PaystubData {
  id: string;
  employeeId: string;
  workerName: string;
  workerEmail?: string;
  payPeriodStart: Date | string;
  payPeriodEnd: Date | string;
  payDate: Date | string;
  
  // Hours
  regularHours: string | number;
  overtimeHours: string | number;
  totalHours: string | number;
  
  // Pay
  hourlyRate: string | number;
  regularPay: string | number;
  overtimePay: string | number;
  grossPay: string | number;
  
  // Deductions
  federalIncomeTax: string | number;
  socialSecurityTax: string | number;
  medicareTax: string | number;
  additionalMedicareTax?: string | number;
  stateTax: string | number;
  localTax?: string | number;
  totalMandatoryDeductions: string | number;
  
  // Garnishments
  totalGarnishments?: string | number;
  garnishmentsBreakdown?: any[];
  
  // Net
  netPay: string | number;
  
  // Metadata
  hallmarkAssetNumber?: string;
  workState?: string;
  workCity?: string;
  status?: string;
}

interface PaystubProps {
  paystub: PaystubData;
  className?: string;
}

export function Paystub({ paystub, className = '' }: PaystubProps) {
  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num || 0);
  };

  const formatNumber = (value: string | number, decimals: number = 2) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return (num || 0).toFixed(decimals);
  };

  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'MM/dd/yyyy');
  };

  const totalDeductions = 
    parseFloat(paystub.totalMandatoryDeductions?.toString() || '0') +
    parseFloat(paystub.totalGarnishments?.toString() || '0');

  return (
    <Card className={`bg-white text-black p-8 max-w-3xl mx-auto font-mono ${className}`} data-testid="paystub-display">
      {/* Header */}
      <div className="text-center mb-6 border-b-4 border-double border-black pb-4">
        <div className="text-2xl font-bold mb-1" data-testid="text-company-name">ORBIT STAFFING OS</div>
        <div className="text-sm" data-testid="text-hallmark">
          Powered by ORBIT #{paystub.hallmarkAssetNumber || 'N/A'}
        </div>
        <div className="text-lg font-semibold mt-2" data-testid="text-paystub-title">
          PAYSTUB - {formatDate(paystub.payPeriodStart)} to {formatDate(paystub.payPeriodEnd)}
        </div>
      </div>

      {/* Employee Information */}
      <div className="mb-6">
        <div className="font-bold text-sm mb-2 uppercase border-b border-black">Employee Information</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-semibold">Name:</span> <span data-testid="text-worker-name">{paystub.workerName}</span>
          </div>
          <div>
            <span className="font-semibold">ID:</span> <span data-testid="text-worker-id">{paystub.employeeId.substring(0, 8)}</span>
          </div>
          <div>
            <span className="font-semibold">Pay Period:</span> <span data-testid="text-pay-period">{formatDate(paystub.payPeriodStart)} - {formatDate(paystub.payPeriodEnd)}</span>
          </div>
          <div>
            <span className="font-semibold">Pay Date:</span> <span data-testid="text-pay-date">{formatDate(paystub.payDate)}</span>
          </div>
        </div>
      </div>

      {/* Earnings */}
      <div className="mb-6">
        <div className="font-bold text-sm mb-2 uppercase border-b border-black">Earnings</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-400">
              <th className="text-left py-1"></th>
              <th className="text-right py-1">Hours</th>
              <th className="text-right py-1">Rate</th>
              <th className="text-right py-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-1">Regular Pay</td>
              <td className="text-right" data-testid="text-regular-hours">{formatNumber(paystub.regularHours)}</td>
              <td className="text-right" data-testid="text-hourly-rate">{formatCurrency(paystub.hourlyRate)}</td>
              <td className="text-right" data-testid="text-regular-pay">{formatCurrency(paystub.regularPay)}</td>
            </tr>
            {parseFloat(paystub.overtimeHours?.toString() || '0') > 0 && (
              <tr>
                <td className="py-1">Overtime Pay (1.5x)</td>
                <td className="text-right" data-testid="text-overtime-hours">{formatNumber(paystub.overtimeHours)}</td>
                <td className="text-right" data-testid="text-overtime-rate">{formatCurrency(parseFloat(paystub.hourlyRate?.toString() || '0') * 1.5)}</td>
                <td className="text-right" data-testid="text-overtime-pay">{formatCurrency(paystub.overtimePay)}</td>
              </tr>
            )}
            <tr className="border-t border-gray-400 font-semibold">
              <td className="py-1" colSpan={3}>Gross Pay</td>
              <td className="text-right" data-testid="text-gross-pay">{formatCurrency(paystub.grossPay)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Deductions */}
      <div className="mb-6">
        <div className="font-bold text-sm mb-2 uppercase border-b border-black">Deductions</div>
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td className="py-1">Federal Income Tax</td>
              <td className="text-right text-red-600" data-testid="text-federal-tax">-{formatCurrency(paystub.federalIncomeTax)}</td>
            </tr>
            <tr>
              <td className="py-1">State Tax ({paystub.workState || 'N/A'})</td>
              <td className="text-right text-red-600" data-testid="text-state-tax">-{formatCurrency(paystub.stateTax)}</td>
            </tr>
            <tr>
              <td className="py-1">Social Security (6.2%)</td>
              <td className="text-right text-red-600" data-testid="text-social-security">-{formatCurrency(paystub.socialSecurityTax)}</td>
            </tr>
            <tr>
              <td className="py-1">Medicare (1.45%)</td>
              <td className="text-right text-red-600" data-testid="text-medicare">-{formatCurrency(paystub.medicareTax)}</td>
            </tr>
            {parseFloat(paystub.additionalMedicareTax?.toString() || '0') > 0 && (
              <tr>
                <td className="py-1">Additional Medicare (0.9%)</td>
                <td className="text-right text-red-600" data-testid="text-additional-medicare">-{formatCurrency(paystub.additionalMedicareTax)}</td>
              </tr>
            )}
            {parseFloat(paystub.localTax?.toString() || '0') > 0 && (
              <tr>
                <td className="py-1">Local Tax ({paystub.workCity || 'N/A'})</td>
                <td className="text-right text-red-600" data-testid="text-local-tax">-{formatCurrency(paystub.localTax)}</td>
              </tr>
            )}
            {paystub.garnishmentsBreakdown && paystub.garnishmentsBreakdown.length > 0 && (
              <>
                {paystub.garnishmentsBreakdown.map((garnishment: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-1">Garnishment ({garnishment.type})</td>
                    <td className="text-right text-red-600" data-testid={`text-garnishment-${idx}`}>-{formatCurrency(garnishment.amount)}</td>
                  </tr>
                ))}
              </>
            )}
            <tr className="border-t border-gray-400 font-semibold">
              <td className="py-1">Total Deductions</td>
              <td className="text-right text-red-600" data-testid="text-total-deductions">-{formatCurrency(totalDeductions)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Net Pay */}
      <div className="mb-6 bg-gray-100 p-4 border-2 border-black">
        <div className="flex justify-between items-center">
          <div className="font-bold text-lg uppercase">Net Pay</div>
          <div className="font-bold text-2xl text-green-600" data-testid="text-net-pay">{formatCurrency(paystub.netPay)}</div>
        </div>
      </div>

      {/* Footer */}
      <Separator className="my-4 bg-black" />
      <div className="text-xs text-center text-gray-600">
        <div className="mb-2">
          <Badge variant="outline" className="text-xs" data-testid="badge-status">
            {paystub.status === 'processed' ? '✓ Processed' : '⏳ Pending'}
          </Badge>
        </div>
        <div className="mb-1">Payment Method: Direct Deposit</div>
        <div className="mb-3">Account: ****1234</div>
        <div className="italic">
          This document is electronically generated and verified.
        </div>
        <div className="font-semibold mt-1">
          ORBIT Hallmark: #{paystub.hallmarkAssetNumber || 'N/A'}
        </div>
      </div>
    </Card>
  );
}

export default Paystub;
