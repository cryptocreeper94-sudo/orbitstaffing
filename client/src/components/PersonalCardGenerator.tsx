/**
 * Personal Card Generator
 * For Admin and Dev personal business cards
 * Separate from CRM, stored per account identity
 */
import React, { useState, useEffect, useRef } from 'react';
import { Download, Edit2, Save, Mail, Phone, MapPin, QrCode, ZoomIn, Camera, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';

interface PersonalCardData {
  fullName: string;
  title: string;
  companyName: string;
  email: string;
  phone: string;
  location: string;
  photoUrl?: string;
  brandColor: string;
  assetNumber?: string;
  stampColor?: string;
  upcCode?: string;
  serialNumber?: string;
}

interface PersonalCardGeneratorProps {
  userId: string;
  userName: string;
  cardType: 'admin' | 'dev';
  onSave?: (card: PersonalCardData) => void;
}

export default function PersonalCardGenerator({ userId, userName, cardType, onSave }: PersonalCardGeneratorProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [expandedField, setExpandedField] = useState<string | null>(null);
  
  const [cardData, setCardData] = useState<PersonalCardData>({
    fullName: userName,
    title: cardType === 'admin' ? 'Admin' : 'Developer',
    companyName: 'ORBIT Staffing',
    email: `${cardType}@orbitstaffing.io`,
    phone: '',
    location: '',
    brandColor: '#06B6D4',
    assetNumber: userId === 'orbit-0001' ? 'ORBIT-0001' : userId === 'orbit-0002' ? 'ORBIT-0002' : `ORBIT-${userId}`,
    stampColor: '#FFD700', // Gold
    upcCode: '',
    serialNumber: '',
  });

  useEffect(() => {
    loadCard();
  }, []);

  const loadCard = async () => {
    try {
      const endpoint = cardType === 'admin' 
        ? `/api/admin/personal-card/${userId}`
        : `/api/dev/personal-card/${userId}`;
      
      const res = await fetch(endpoint);
      if (res.ok) {
        const card = await res.json();
        if (card.id) {
          setCardData(card);
          setPhotoPreview(card.photoUrl || '');
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error('Failed to load card:', error);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setPhotoPreview(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const endpoint = cardType === 'admin' ? '/api/admin/personal-card' : '/api/dev/personal-card';
      const method = 'POST';
      
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [`${cardType}Id`]: userId,
          ...cardData,
          photoUrl: photoPreview,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        setCardData(saved);
        setIsEditing(false);
        if (onSave) onSave(saved);
      }
    } catch (error) {
      console.error('Failed to save card:', error);
      alert('Failed to save card');
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#1e293b',
        scale: 2,
        logging: false,
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${cardType}-card-${cardData.fullName.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download card:', error);
      alert('Failed to download card');
    }
  };

  const handleShare = async () => {
    const vcard = `${cardData.fullName}\n${cardData.title}\n${cardData.email}\n${cardData.phone}\n${cardData.assetNumber}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${cardData.fullName} - ${cardType} Card`,
          text: vcard,
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(vcard);
      alert('Card details copied to clipboard!');
    }
  };

  const handleGenerateHallmark = () => {
    // Generate unique hallmark with UPC and serial
    const timestamp = Date.now().toString(36).toUpperCase().slice(-6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const hallmarkId = `ORBIT-ASSET-${timestamp}-${random}`;
    const serialNumber = hallmarkId.replace('ORBIT-ASSET-', '');
    
    // Generate 12-digit UPC
    const digits = [];
    for (let i = 0; i < 11; i++) {
      digits.push(Math.floor(Math.random() * 10));
    }
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      sum += digits[i] * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    digits.push(checkDigit);
    const upcCode = digits.join('');
    
    setCardData(prev => ({
      ...prev,
      assetNumber: hallmarkId,
      serialNumber,
      upcCode,
    }));
  };

  const handleExportPDF = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#1e293b',
        scale: 3,
        logging: false,
      });

      // Use html2pdf library if available, otherwise use canvas
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `${cardType}-card-${cardData.fullName.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('Business card exported as image! For PDF printing, use your browser\'s Print to PDF feature.');
    } catch (error) {
      console.error('Failed to export card:', error);
      alert('Failed to export card');
    }
  };

  const vCardData = `BEGIN:VCARD\nVERSION:3.0\nFN:${cardData.fullName}\nTITLE:${cardData.title}\nORG:${cardData.companyName}\nEMAIL:${cardData.email}\nTEL:${cardData.phone}\nADR:;;${cardData.location}\nEND:VCARD`;

  const FieldWithPopup = ({ label, value, icon: Icon }: any) => (
    <div className="relative group">
      <div className="flex items-center gap-2">
        <Icon className="w-3 h-3 text-cyan-400" />
        <span className="text-[7px] text-gray-300 truncate">{value || label}</span>
        <button
          onClick={() => setExpandedField(expandedField === label ? null : label)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
          data-testid={`popup-${label.toLowerCase()}`}
        >
          <ZoomIn className="w-3 h-3 text-cyan-400" />
        </button>
      </div>
      
      {expandedField === label && (
        <div className="absolute bottom-full left-0 mb-2 bg-slate-900 border border-cyan-400 rounded p-2 whitespace-nowrap text-[8px] text-white z-50">
          {value}
        </div>
      )}
    </div>
  );

  if (isEditing) {
    return (
      <Card className="bg-slate-800 border-cyan-600 col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit2 className="w-5 h-5" />
            Edit {cardType.charAt(0).toUpperCase() + cardType.slice(1)} Card
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Photo:</label>
            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg cursor-pointer hover:border-cyan-400 transition-colors">
              <Camera className="w-4 h-4" />
              Upload Photo
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                data-testid="input-card-photo"
              />
            </label>
            {photoPreview && (
              <img src={photoPreview} alt="Preview" className="mt-2 h-20 rounded-lg" />
            )}
          </div>

          {/* Text Fields */}
          {Object.entries(cardData).map(([key, value]) => {
            if (key === 'brandColor' || key === 'stampColor' || key === 'assetNumber' || key === 'upcCode' || key === 'serialNumber' || typeof value !== 'string') return null;
            
            return (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                  {key === 'fullName' ? 'Full Name' : key === 'companyName' ? 'Company' : key}:
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setCardData({ ...cardData, [key]: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  data-testid={`input-card-${key}`}
                />
              </div>
            );
          })}

          {/* Stamp Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Stamp Color:</label>
            <div className="flex gap-2 flex-wrap">
              {['#FFD700', '#00D9FF', '#FF6B6B', '#4ECB71', '#9B59B6'].map(color => (
                <button
                  key={color}
                  onClick={() => setCardData({ ...cardData, stampColor: color })}
                  className={`w-8 h-8 rounded border-2 transition-all ${cardData.stampColor === color ? 'border-white scale-110' : 'border-gray-600'}`}
                  style={{ backgroundColor: color }}
                  data-testid={`button-stamp-color-${color}`}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Hallmark Generation */}
          <Button onClick={handleGenerateHallmark} className="w-full bg-purple-600 hover:bg-purple-700" data-testid="button-generate-hallmark">
            <QrCode className="w-4 h-4 mr-2" />
            Generate Hallmark (UPC & Serial)
          </Button>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1 bg-cyan-600 hover:bg-cyan-700" data-testid="button-save-personal-card">
              <Save className="w-4 h-4 mr-2" />
              Save Card
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-red-600 hover:bg-red-700"
              data-testid="button-cancel-edit-personal-card"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Card Preview */}
      <div className="flex justify-center">
        <div
          ref={cardRef}
          className="w-full max-w-[350px] h-[200px] rounded-lg shadow-2xl overflow-hidden flex relative cursor-pointer group"
          style={{ backgroundColor: cardData.brandColor + '15', border: `2px solid ${cardData.brandColor}` }}
          onClick={() => photoPreview && setImageModalOpen(true)}
          data-testid="card-personal-preview"
        >
          {/* Background */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="text-center text-4xl font-bold text-cyan-400">ORBIT</div>
          </div>

          {/* Photo */}
          <div
            className="w-[120px] h-[140px] bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center flex-shrink-0 border-r-2 border-b-2 relative z-10"
            style={{ borderColor: cardData.brandColor }}
          >
            {photoPreview ? (
              <>
                <img src={photoPreview} alt={cardData.fullName} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center">
                  <ZoomIn className="w-5 h-5 text-white" />
                </div>
              </>
            ) : (
              <Camera className="w-8 h-8 text-gray-500" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 p-3 flex flex-col justify-between text-white bg-gradient-to-br from-slate-900 to-slate-950 relative z-10">
            <div>
              <h3 className="font-bold text-sm leading-tight" style={{ color: cardData.brandColor }}>
                {cardData.fullName}
              </h3>
              <p className="text-[10px] opacity-90">{cardData.title}</p>
              <p className="text-[10px] opacity-75">{cardData.companyName}</p>
            </div>

            <div className="space-y-0 text-[8px]">
              <FieldWithPopup label="Email" value={cardData.email} icon={Mail} />
              <FieldWithPopup label="Phone" value={cardData.phone} icon={Phone} />
              <FieldWithPopup label="Location" value={cardData.location} icon={MapPin} />
            </div>
          </div>

          {/* QR Code Section (Bottom Left - Hallmark) */}
          <div className="absolute bottom-2 left-2 flex flex-col items-center gap-0.5 p-1.5 rounded bg-black/40 border-2" style={{ borderColor: cardData.stampColor }}>
            <div className="p-0.5 bg-white rounded-sm">
              <QRCode value={vCardData} size={36} level="H" margin={1} />
            </div>
            <span className="text-[5px] font-mono font-bold" style={{ color: cardData.stampColor }}>
              {cardData.upcCode || 'UPC'}
            </span>
            <span className="text-[4px] text-gray-300">
              {cardData.serialNumber ? cardData.serialNumber.slice(0, 8) : 'Serial'}
            </span>
          </div>

          {/* Asset Number & Brand (Bottom Right) */}
          <div className="absolute bottom-2 right-2 text-right flex flex-col items-end gap-1">
            <div className="text-[7px] font-bold text-white opacity-90 font-mono">
              {cardData.assetNumber}
            </div>
            <span className="text-[5px] text-gray-400">Powered by ORBIT</span>
          </div>

          {/* Bottom Borders */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 z-10" style={{ backgroundColor: cardData.brandColor }} />
          <div className="absolute bottom-0 right-0 h-1/2 w-0.5 z-10" style={{ backgroundColor: cardData.brandColor }} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-center flex-wrap mt-4">
        <Button onClick={() => setIsEditing(true)} className="bg-cyan-600 hover:bg-cyan-700" data-testid="button-edit-personal-card">
          <Edit2 className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700" data-testid="button-download-personal-card">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button onClick={handleExportPDF} className="bg-orange-600 hover:bg-orange-700" data-testid="button-export-pdf-card">
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
        <Button onClick={handleShare} className="bg-blue-600 hover:bg-blue-700" data-testid="button-share-personal-card">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  );
}
