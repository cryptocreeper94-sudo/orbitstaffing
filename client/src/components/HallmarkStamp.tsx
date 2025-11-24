/**
 * ORBIT Hallmark Stamp Component
 * Automatically displayed on all letters, invoices, and official documents
 */

interface HallmarkStampProps {
  hallmarkNumber: string;
  createdAt?: string;
  compact?: boolean;
}

export function HallmarkStamp({ hallmarkNumber, createdAt, compact = false }: HallmarkStampProps) {
  const date = createdAt ? new Date(createdAt).toLocaleDateString() : new Date().toLocaleDateString();
  
  if (compact) {
    return (
      <div className="text-xs text-slate-500 border-t border-slate-300 pt-2 mt-8">
        <p>Powered by ORBIT | Hallmark: <span className="font-mono font-bold">{hallmarkNumber}</span></p>
        <p className="text-xs">Issued: {date}</p>
      </div>
    );
  }

  return (
    <div className="my-8 p-4 border-2 border-slate-300 bg-slate-50">
      <div className="text-center space-y-2">
        <div className="text-2xl font-bold text-slate-700">◆ ORBIT HALLMARK ◆</div>
        <p className="text-sm font-mono font-bold text-slate-600">
          {hallmarkNumber}
        </p>
        <p className="text-xs text-slate-600">
          Unique Asset ID | Issued {date}
        </p>
        <p className="text-xs text-slate-500">
          This document is authentic and cataloged in the ORBIT registry
        </p>
      </div>
    </div>
  );
}
