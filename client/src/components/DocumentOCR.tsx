import { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Scan, Eye, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type DocumentType = 'i9' | 'drivers_license' | 'ssn_card' | 'contract' | 'other';

interface ScannedDocument {
  id: string;
  fileName: string;
  type: DocumentType;
  status: 'processing' | 'completed' | 'failed';
  uploadedAt: Date;
  extractedData?: {
    [key: string]: string;
  };
  confidence?: number;
}

export function DocumentOCR() {
  const [documents, setDocuments] = useState<ScannedDocument[]>([
    {
      id: 'doc-001',
      fileName: 'john_davis_i9.pdf',
      type: 'i9',
      status: 'completed',
      uploadedAt: new Date('2024-11-25T10:30:00'),
      extractedData: {
        'Full Name': 'John Michael Davis',
        'SSN': '***-**-6789',
        'Date of Birth': '03/15/1992',
        'Citizenship Status': 'US Citizen',
      },
      confidence: 94,
    },
    {
      id: 'doc-002',
      fileName: 'sarah_chen_license.jpg',
      type: 'drivers_license',
      status: 'completed',
      uploadedAt: new Date('2024-11-25T09:15:00'),
      extractedData: {
        'Full Name': 'Sarah Chen',
        'License Number': 'TN-6789234',
        'Expiration Date': '08/12/2026',
        'Address': '123 Main St, Nashville, TN',
      },
      confidence: 97,
    },
  ]);

  const [selectedType, setSelectedType] = useState<DocumentType>('i9');

  const documentTypes = [
    { type: 'i9' as DocumentType, name: 'I-9 Forms', icon: FileText, color: 'cyan' },
    { type: 'drivers_license' as DocumentType, name: 'Driver\'s License', icon: FileText, color: 'purple' },
    { type: 'ssn_card' as DocumentType, name: 'SSN Card', icon: FileText, color: 'green' },
    { type: 'contract' as DocumentType, name: 'Contracts', icon: FileText, color: 'orange' },
    { type: 'other' as DocumentType, name: 'Other Documents', icon: FileText, color: 'gray' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const newDoc: ScannedDocument = {
      id: `doc-${Date.now()}`,
      fileName: file.name,
      type: selectedType,
      status: 'processing',
      uploadedAt: new Date(),
    };

    setDocuments([newDoc, ...documents]);

    // Simulate OCR processing
    setTimeout(() => {
      setDocuments(prev => prev.map(doc => {
        if (doc.id === newDoc.id) {
          return {
            ...doc,
            status: 'completed',
            confidence: Math.floor(Math.random() * 15) + 85,
            extractedData: getMockExtractedData(selectedType),
          };
        }
        return doc;
      }));
    }, 3000);
  };

  const getMockExtractedData = (type: DocumentType): { [key: string]: string } => {
    switch (type) {
      case 'i9':
        return {
          'Full Name': 'Sample Name',
          'SSN': '***-**-1234',
          'Date of Birth': '01/01/1990',
          'Citizenship Status': 'Pending verification',
        };
      case 'drivers_license':
        return {
          'Full Name': 'Sample Name',
          'License Number': 'TN-1234567',
          'Expiration Date': '12/31/2025',
        };
      case 'ssn_card':
        return {
          'Full Name': 'Sample Name',
          'SSN': '***-**-1234',
        };
      default:
        return { 'Status': 'Data extracted' };
    }
  };

  const deleteDocument = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Scan className="w-7 h-7 text-cyan-400" />
          Document OCR & Scanning
        </h2>
        <p className="text-gray-400 text-sm">AI-powered document scanning and data extraction</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            <span className="text-sm font-bold text-gray-400">Total Documents</span>
          </div>
          <p className="text-2xl font-bold">{documents.length}</p>
          <p className="text-xs text-gray-400 mt-1">Scanned & processed</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            <span className="text-sm font-bold text-gray-400">Success Rate</span>
          </div>
          <p className="text-2xl font-bold">
            {documents.length > 0 ? Math.round((documents.filter(d => d.status === 'completed').length / documents.length) * 100) : 0}%
          </p>
          <p className="text-xs text-gray-400 mt-1">OCR accuracy</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Scan className="w-6 h-6 text-purple-400" />
            <span className="text-sm font-bold text-gray-400">Avg Confidence</span>
          </div>
          <p className="text-2xl font-bold">
            {documents.length > 0
              ? Math.round(documents.filter(d => d.confidence).reduce((sum, d) => sum + (d.confidence || 0), 0) / documents.filter(d => d.confidence).length)
              : 0}%
          </p>
          <p className="text-xs text-gray-400 mt-1">AI confidence score</p>
        </div>
      </div>

      {/* Document Type Selection */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Upload Documents</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {documentTypes.map((docType) => {
            const Icon = docType.icon;
            return (
              <button
                key={docType.type}
                onClick={() => setSelectedType(docType.type)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  selectedType === docType.type
                    ? `border-${docType.color}-500 bg-${docType.color}-500/10`
                    : 'border-slate-700 bg-slate-700/50 hover:border-slate-600'
                }`}
                data-testid={`button-type-${docType.type}`}
              >
                <Icon className={`w-6 h-6 mx-auto mb-2 text-${docType.color}-400`} />
                <p className="text-xs font-bold">{docType.name}</p>
              </button>
            );
          })}
        </div>

        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg hover:border-cyan-500 transition cursor-pointer bg-slate-700/30">
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-sm text-gray-400">Drop files here or click to upload</span>
          <span className="text-xs text-gray-500 mt-1">Supports PDF, JPG, PNG (Max 10MB)</span>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="hidden"
            data-testid="input-file-upload"
          />
        </label>
      </div>

      {/* Document List */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Scanned Documents</h3>
        
        <div className="space-y-3">
          {documents.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No documents uploaded yet</p>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 bg-slate-700/50 rounded-lg"
                data-testid={`document-${doc.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className={`w-5 h-5 ${
                      doc.status === 'completed' ? 'text-green-400' :
                      doc.status === 'processing' ? 'text-cyan-400' :
                      'text-red-400'
                    }`} />
                    <div className="flex-1">
                      <p className="font-bold text-sm">{doc.fileName}</p>
                      <p className="text-xs text-gray-400">
                        {doc.uploadedAt.toLocaleString()} • {doc.type.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {doc.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                        <CheckCircle2 className="w-3 h-3" />
                        {doc.confidence}% Confidence
                      </span>
                    )}
                    {doc.status === 'processing' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400">
                        <Scan className="w-3 h-3 animate-pulse" />
                        Processing...
                      </span>
                    )}
                    {doc.status === 'failed' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-red-500/20 text-red-400">
                        <AlertCircle className="w-3 h-3" />
                        Failed
                      </span>
                    )}
                    
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="p-2 hover:bg-red-600/20 rounded transition"
                      data-testid={`button-delete-${doc.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                {doc.extractedData && doc.status === 'completed' && (
                  <div className="mt-3 pt-3 border-t border-slate-600">
                    <p className="text-xs font-bold text-gray-400 mb-2">Extracted Data:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(doc.extractedData).map(([key, value]) => (
                        <div key={key} className="text-xs">
                          <span className="text-gray-400">{key}: </span>
                          <span className="font-bold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* OCR Features */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Scan className="w-5 h-5 text-cyan-400" />
          AI OCR Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Automatic Data Extraction</p>
              <p className="text-xs text-gray-400">Extract name, SSN, dates, and more</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Compliance Validation</p>
              <p className="text-xs text-gray-400">Verify document authenticity</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Multi-Format Support</p>
              <p className="text-xs text-gray-400">PDF, JPG, PNG, and more</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Confidence Scoring</p>
              <p className="text-xs text-gray-400">AI accuracy indicators</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
