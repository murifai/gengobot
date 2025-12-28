'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface ImageViewerProps {
  src: string;
  alt?: string;
  title?: string;
  className?: string;
}

export function ImageViewer({ src, alt = '問題画像', title, className }: ImageViewerProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  const openLightbox = () => {
    setIsLightboxOpen(true);
    setZoomLevel(100);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    // Restore body scroll
    document.body.style.overflow = '';
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const resetZoom = () => {
    setZoomLevel(100);
  };

  return (
    <>
      {/* Thumbnail/Preview */}
      <div className={cn('relative group cursor-pointer', className)}>
        <div className="relative overflow-hidden rounded-lg border-2 border-border bg-muted">
          <Image
            src={src}
            alt={alt}
            width={800}
            height={600}
            className="w-full h-auto object-contain"
            onClick={openLightbox}
          />

          {/* Overlay with zoom icon */}
          <div
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            onClick={openLightbox}
          >
            <div className="flex flex-col items-center gap-2 text-white">
              <Maximize2 className="h-8 w-8" />
              <span className="text-sm font-medium">クリックして拡大</span>
            </div>
          </div>
        </div>

        {title && (
          <div className="mt-2 text-sm text-center text-muted-foreground">
            {title}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <Button
            onClick={closeLightbox}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Zoom controls */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                zoomIn();
              }}
              variant="secondary"
              size="icon"
              disabled={zoomLevel >= 200}
              className="bg-black/50 hover:bg-black/70 text-white"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                zoomOut();
              }}
              variant="secondary"
              size="icon"
              disabled={zoomLevel <= 50}
              className="bg-black/50 hover:bg-black/70 text-white"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                resetZoom();
              }}
              variant="secondary"
              size="sm"
              className="bg-black/50 hover:bg-black/70 text-white text-xs"
            >
              {zoomLevel}%
            </Button>
          </div>

          {/* Image container with scroll */}
          <div
            className="max-w-[90vw] max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'center',
              }}
            >
              <Image
                src={src}
                alt={alt}
                width={1600}
                height={1200}
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Title at bottom */}
          {title && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
              {title}
            </div>
          )}

          {/* Instructions */}
          <div className="absolute bottom-4 right-4 text-white/70 text-xs">
            クリックで閉じる | スクロールで移動
          </div>
        </div>
      )}
    </>
  );
}
