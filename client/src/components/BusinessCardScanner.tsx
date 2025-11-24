import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera, Upload, Check, Loader, AlertCircle, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface ScannedCard {
  fullName: string;
  title?: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  website?: string;
  linkedIn?: string;
  ocrConfidence?: number;
}

interface BusinessCardScannerProps {
  onCardScanned: (card: ScannedCard) => void;
  context: 'orbid' | 'franchisee';
  userId?: string;
  companyId?: string;
}

export function BusinessCardScanner({ 
  onCardScanned, 
  context,
  userId,
  companyId 
}: BusinessCardScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedCard | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<ScannedCard | null>(null);

  const processImage = async (file: File) => {
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = (e.target?.result as string).split(',')[1];
        
        // Send to backend for OCR processing
        const response = await fetch('/api/ocr/scan-business-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Image,
            context,
            userId,
            companyId,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setScannedData(result.cardData);
          setEditedData(result.cardData);
          toast.success(`Card scanned! Confidence: ${(result.cardData.ocrConfidence * 100).toFixed(0)}%`);
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to scan card');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Scanner error:', error);
      toast.error('Error processing image');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleSaveCard = () => {
    if (editedData) {
      onCardScanned(editedData);
      setScannedData(null);
      setEditedData(null);
      setEditMode(false);
      toast.success('Card added to CRM');
    }
  };

  const handleCancel = () => {
    setScannedData(null);
    setEditedData(null);
    setEditMode(false);
  };

  if (scannedData && editedData) {
    return (
      <Card className="bg-slate-800/50 border border-cyan-400/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-cyan-300">Business Card Scanned</span>
            {scannedData.ocrConfidence && (
              <span className="text-xs font-mono text-amber-300">
                {(scannedData.ocrConfidence * 100).toFixed(0)}% confidence
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!editMode ? (
            <div className="space-y-3 bg-slate-900/50 rounded p-4 border border-slate-700">
              <div>
                <p className="text-xs text-gray-400">Name</p>
                <p className="text-white font-semibold">{editedData.fullName}</p>
              </div>
              {editedData.title && (
                <div>
                  <p className="text-xs text-gray-400">Title</p>
                  <p className="text-gray-300">{editedData.title}</p>
                </div>
              )}
              {editedData.company && (
                <div>
                  <p className="text-xs text-gray-400">Company</p>
                  <p className="text-gray-300">{editedData.company}</p>
                </div>
              )}
              {editedData.email && (
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-cyan-300 text-sm">{editedData.email}</p>
                </div>
              )}
              {editedData.phone && (
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-gray-300">{editedData.phone}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                value={editedData.fullName}
                onChange={(e) => setEditedData({ ...editedData, fullName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                data-testid="input-scanned-name"
              />
              <input
                type="text"
                placeholder="Title"
                value={editedData.title || ''}
                onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                data-testid="input-scanned-title"
              />
              <input
                type="email"
                placeholder="Email"
                value={editedData.email || ''}
                onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                data-testid="input-scanned-email"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={editedData.phone || ''}
                onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                data-testid="input-scanned-phone"
              />
            </div>
          )}

          <div className="flex gap-2">
            {!editMode ? (
              <>
                <Button
                  onClick={() => setEditMode(true)}
                  size="sm"
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 gap-2"
                  data-testid="button-edit-card"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  onClick={handleSaveCard}
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                  data-testid="button-save-card"
                >
                  <Check className="w-4 h-4" />
                  Add to CRM
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setEditMode(false)}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  data-testid="button-done-editing"
                >
                  Done Editing
                </Button>
                <Button
                  onClick={handleSaveCard}
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  data-testid="button-save-edited"
                >
                  Save & Add
                </Button>
              </>
            )}
            <Button
              onClick={handleCancel}
              size="sm"
              variant="outline"
              className="flex-1"
              data-testid="button-cancel-scan"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border border-cyan-400/30">
      <CardHeader>
        <CardTitle className="text-cyan-300">Scan Business Card</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-400">
          Upload a photo or take a picture of a business card. We'll extract the information automatically.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => cameraInputRef.current?.click()}
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-700 gap-2"
            data-testid="button-camera-scan"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            Camera
          </Button>

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            variant="outline"
            className="gap-2"
            data-testid="button-upload-scan"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="bg-slate-900/50 rounded p-3 border border-slate-700 flex gap-2 text-xs text-gray-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
          <p>We use AI to read business cards. You can edit extracted data before saving.</p>
        </div>
      </CardContent>
    </Card>
  );
}
