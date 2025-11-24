/**
 * Image Modal Component
 * Allows images and uploads to be enlarged/viewed in a modal
 */
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  title?: string;
  onDownload?: () => void;
  onShare?: () => void;
}

export function ImageModal({
  open,
  onOpenChange,
  imageUrl,
  title,
  onDownload,
  onShare,
}: ImageModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-screen overflow-auto bg-slate-950 border-border/50">
        <div className="relative w-full h-full flex flex-col gap-4">
          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-2 right-2 z-50 p-2 rounded-lg bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-close-modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title */}
          {title && (
            <div className="pt-4 px-4">
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            </div>
          )}

          {/* Image */}
          <div className="flex items-center justify-center py-4">
            <img
              src={imageUrl}
              alt={title || 'Enlarged view'}
              className="max-w-full max-h-[600px] rounded-lg shadow-lg"
              data-testid="img-enlarged"
            />
          </div>

          {/* Actions */}
          {(onDownload || onShare) && (
            <div className="flex gap-2 justify-center px-4 pb-4">
              {onDownload && (
                <Button
                  onClick={onDownload}
                  variant="outline"
                  className="border-primary/20 hover:bg-primary/10 text-primary"
                  data-testid="button-download-image"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
              {onShare && (
                <Button
                  onClick={onShare}
                  variant="outline"
                  className="border-primary/20 hover:bg-primary/10 text-primary"
                  data-testid="button-share-image"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
