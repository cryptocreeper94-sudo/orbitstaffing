/**
 * Admin Business Card
 * Professional, printable business card for admins/team members
 * Supports photo upload, sharing, and printing
 */
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Share2, Upload, Edit2, Save, X } from 'lucide-react';
import QRCode from 'react-qr-code';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleDownload = () => {
    const element = document.getElementById('business-card-print');
    if (element) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 1050; // 3.5" at 300 DPI
        canvas.height = 600;  // 2" at 300 DPI
        // Basic PNG export - in production, use html2canvas or similar
        window.print();
      }
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
      <Card className="w-full max-w-2xl mx-auto bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Edit Business Card</span>
            <button onClick={() => setIsEditing(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Photo Upload */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Photo</label>
            <div className="flex gap-4 items-start">
              <div className="w-24 h-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-background/50">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-xs text-muted-foreground">No photo</div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm text-muted-foreground">Upload a professional headshot (recommended: 300x400px)</p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  data-testid="button-upload-photo"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Photo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  data-testid="input-photo-file"
                />
              </div>
            </div>
          </div>

          {/* Form Fields */}
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
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Company Name</label>
              <Input
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                data-testid="input-company"
              />
            </div>
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Brand Color</label>
              <div className="flex gap-2">
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
                  className="font-mono text-sm"
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
      {/* Business Card Preview - Actual 3.5" x 2" ratio */}
      <div className="flex justify-center">
        <div
          id="business-card-print"
          className="w-[350px] h-[200px] rounded-lg shadow-2xl overflow-hidden flex"
          style={{ backgroundColor: formData.brandColor + '15', border: `2px solid ${formData.brandColor}` }}
          data-testid="card-business-preview"
        >
          {/* Left side - Photo */}
          <div className="w-[120px] h-full bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center flex-shrink-0 border-r-2" style={{ borderColor: formData.brandColor }}>
            {photoPreview ? (
              <img src={photoPreview} alt={formData.fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="text-xs text-gray-500 text-center px-2">Add Photo</div>
            )}
          </div>

          {/* Right side - Info */}
          <div className="flex-1 p-4 flex flex-col justify-between text-white bg-gradient-to-br from-slate-900 to-slate-950">
            <div>
              <h3 className="font-bold text-base leading-tight" style={{ color: formData.brandColor }}>
                {formData.fullName}
              </h3>
              {formData.title && <p className="text-xs opacity-90 leading-tight">{formData.title}</p>}
              <p className="text-xs opacity-75 mt-1">{formData.companyName}</p>
            </div>

            <div className="space-y-0.5 text-xs">
              <p>{formData.email}</p>
              {formData.phone && <p>{formData.phone}</p>}
              {formData.location && <p>{formData.location}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* QR Code & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QR Code */}
        <div className="flex flex-col items-center space-y-4 bg-card/30 p-6 rounded-lg border border-border/30">
          <div className="bg-white p-3 rounded-lg">
            <QRCode value={vCardData} size={140} level="M" />
          </div>
          <p className="text-xs text-muted-foreground text-center">Scan to save contact</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 justify-center">
          <Button
            onClick={() => setIsEditing(true)}
            className="w-full"
            variant="outline"
            data-testid="button-edit-card"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Card
          </Button>
          <Button
            onClick={handleDownload}
            className="w-full"
            data-testid="button-download-card"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PNG
          </Button>
          <Button
            className="w-full"
            variant="secondary"
            data-testid="button-share-card"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Card
          </Button>
          <p className="text-xs text-muted-foreground text-center pt-2">
            Perfect for printing (3.5" × 2") or sharing via email/text
          </p>
        </div>
      </div>
    </div>
  );
}
