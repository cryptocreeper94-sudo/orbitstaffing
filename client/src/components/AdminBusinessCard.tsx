/**
 * Admin Business Card
 * Professional, printable business card for admins/team members
 * Supports photo upload, sharing, and printing with QR code
 */
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Share2, Upload, Edit2, Save, X, Shield, ZoomIn } from 'lucide-react';
import QRCode from 'react-qr-code';
import { ImageModal } from '@/components/ImageModal';
import { toast } from 'sonner';

interface AdminBusinessCardProps {
  adminId: string;
  fullName: string;
  title?: string;
  companyName: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  photoUrl?: string;
  brandColor?: string;
  onSave?: (data: any) => void;
}

export function AdminBusinessCard({
  adminId,
  fullName,
  title,
  companyName,
  email,
  phone,
  location,
  website,
  photoUrl,
  brandColor = '#06B6D4',
  onSave,
}: AdminBusinessCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(photoUrl);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    fullName,
    title: title || '',
    companyName,
    email,
    phone: phone || '',
    location: location || '',
    website: website || '',
    brandColor: brandColor || '#06B6D4',
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/business-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId,
          ...formData,
          photoUrl: photoPreview,
        }),
      });

      if (response.ok) {
        const saved = await response.json();
        onSave?.(saved);
        setIsEditing(false);
        toast.success('Business card saved successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save business card');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Error saving business card');
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${formData.fullName.replace(/\s+/g, '-')}-business-card.png`;
      link.click();
      toast.success('Business card downloaded');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download business card');
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
      });

      canvas.toBlob((blob: Blob | null) => {
        if (!blob) {
          toast.error('Failed to create image');
          return;
        }
        
        if (navigator.share) {
          try {
            const file = new File([blob], 'business-card.png', { type: 'image/png' });
            navigator.share({
              title: `${formData.fullName}'s Business Card`,
              text: `Connect with ${formData.fullName} - ${formData.title || formData.companyName}`,
              files: [file],
            }).then(() => {
              toast.success('Business card shared');
            }).catch((err) => {
              if (err.name !== 'AbortError') {
                toast.error('Sharing failed');
              }
            });
          } catch (err) {
            toast.error('Share not available');
          }
        } else {
          toast.error('Share not supported on this device');
        }
      });
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share business card');
    }
  };

  // vCard format for QR code
  const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${formData.fullName}
TITLE:${formData.title}
ORG:${formData.companyName}
EMAIL:${formData.email}
TEL:${formData.phone}
ADR:;;${formData.location};;;USA
URL:${formData.website}
END:VCARD`;

  if (isEditing) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Edit Business Card</span>
            <button onClick={() => setIsEditing(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Photo Upload - Square with Click to Edit */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Photo (Square)</label>
            <div 
              className="w-32 h-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-background/50 cursor-pointer hover:border-primary transition-colors group relative"
              onClick={() => fileInputRef.current?.click()}
            >
              {photoPreview ? (
                <>
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                </>
              ) : (
                <div className="text-center text-xs text-muted-foreground">
                  <Upload className="w-6 h-6 mx-auto mb-1 opacity-50" />
                  Click to upload
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              data-testid="input-photo-file"
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  data-testid="input-fullname"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Operations Manager"
                  data-testid="input-title"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name</label>
              <Input
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                data-testid="input-company"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (615) 555-0123"
                  data-testid="input-phone"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Nashville, TN"
                  data-testid="input-location"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Website</label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="www.example.com"
                  data-testid="input-website"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Brand Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={formData.brandColor}
                  onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                  className="h-10 w-14 rounded border border-border cursor-pointer"
                  data-testid="input-color"
                />
                <Input
                  value={formData.brandColor}
                  onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                  className="font-mono text-sm flex-1"
                  data-testid="input-color-hex"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1" data-testid="button-save-card">
              <Save className="w-4 h-4 mr-2" />
              Save Card
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="flex-1"
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Business Card Preview - Responsive */}
      <div className="flex justify-center">
        <div
          ref={cardRef}
          id="business-card-print"
          className="w-full max-w-[350px] sm:w-[350px] h-auto sm:h-[200px] aspect-video sm:aspect-auto rounded-lg shadow-2xl overflow-hidden flex relative cursor-pointer group"
          style={{ backgroundColor: formData.brandColor + '15', border: `2px solid ${formData.brandColor}` }}
          onClick={() => photoPreview && setImageModalOpen(true)}
          data-testid="card-business-preview"
        >
          {/* Background Logo - ORBIT */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <div className="text-center">
              <Shield className="w-32 h-32 text-cyan-400 mx-auto" />
              <div className="text-4xl font-bold text-cyan-400">ORBIT</div>
            </div>
          </div>

          {/* Left side - Photo (Square, constrained height, with QR space) */}
          <div className="w-[80px] sm:w-[120px] h-[120px] sm:h-[140px] bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center flex-shrink-0 border-r-2 border-b-2 relative z-10 group-hover:opacity-90 transition-opacity" style={{ borderColor: formData.brandColor }}>
            {photoPreview ? (
              <>
                <img src={photoPreview} alt={formData.fullName} className="w-full h-full object-cover" />
                {photoPreview && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                    <ZoomIn className="w-5 h-5 text-white" />
                  </div>
                )}
              </>
            ) : (
              <div className="text-xs text-gray-500 text-center px-2">Photo</div>
            )}
          </div>

          {/* Middle - Info */}
          <div className="flex-1 p-2 sm:p-3 flex flex-col justify-between text-white bg-gradient-to-br from-slate-900 to-slate-950 relative z-10">
            <div>
              <h3 className="font-bold text-xs sm:text-sm leading-tight" style={{ color: formData.brandColor }}>
                {formData.fullName}
              </h3>
              {formData.title && <p className="text-[8px] sm:text-[10px] opacity-90 leading-tight">{formData.title}</p>}
              <p className="text-[8px] sm:text-[10px] opacity-75 mt-0.5">{formData.companyName}</p>
            </div>

            <div className="space-y-0 text-[7px] sm:text-[9px]">
              <p className="truncate">{formData.email}</p>
              {formData.phone && <p className="truncate">{formData.phone}</p>}
              {formData.location && <p className="truncate">{formData.location}</p>}
            </div>
          </div>

          {/* Bottom Left - Tiny QR Code */}
          <div className="absolute bottom-1.5 left-1.5 p-1 rounded z-20 bg-gradient-to-b from-slate-800 to-slate-900">
            <QRCode value={vCardData} size={32} level="M" />
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {photoPreview && (
        <ImageModal
          open={imageModalOpen}
          onOpenChange={setImageModalOpen}
          imageUrl={photoPreview}
          title={`${formData.fullName}'s Photo`}
        />
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={() => setIsEditing(true)}
          className="flex-1 sm:flex-none"
          variant="outline"
          data-testid="button-edit-card"
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Edit Card
        </Button>
        <Button
          onClick={handleDownload}
          className="flex-1 sm:flex-none"
          data-testid="button-download-card"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button
          onClick={handleShare}
          className="flex-1 sm:flex-none"
          variant="secondary"
          data-testid="button-share-card"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        Professional business card (3.5" × 2") with QR contact sharing
      </p>
    </div>
  );
}
