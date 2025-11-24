import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';

interface FileUploadHandlerProps {
  workerId: string;
  docType: 'avatar' | 'i9_document';
  title?: string;
  onUploadSuccess: (url: string) => void;
  onError?: (error: string) => void;
}

export function FileUploadHandler({
  workerId,
  docType,
  title = 'Upload File',
  onUploadSuccess,
  onError
}: FileUploadHandlerProps) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;

        // Send to backend
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workerId,
            docType,
            fileData: base64,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type
          })
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        setUploaded(true);
        onUploadSuccess(data.url);
      };

      reader.onerror = () => {
        throw new Error('Failed to read file');
      };

      reader.readAsDataURL(file);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      onError?.(errorMsg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileSelect}
        className="hidden"
        data-testid={`input-file-${docType}`}
      />

      {uploaded ? (
        <>
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="text-sm text-green-300">Uploaded</span>
        </>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          data-testid={`button-upload-${docType}`}
        >
          <Upload className="w-3 h-3 mr-1" />
          {uploading ? 'Uploading...' : title}
        </Button>
      )}
    </div>
  );
}
