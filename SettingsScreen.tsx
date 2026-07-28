import React, { useEffect, useRef, useState } from 'react';
import { QuadCorners, ScannedPage } from '../types';
import { applyPerspectiveCrop, autoDetectDocumentCorners } from '../utils/canvasUtils';
import { 
  Crop, 
  RotateCw, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Check, 
  X,
  Maximize2
} from 'lucide-react';

interface CropPerspectiveScreenProps {
  page: ScannedPage;
  onSaveCrop: (updatedPage: ScannedPage) => void;
  onCancel: () => void;
}

export const CropPerspectiveScreen: React.FC<CropPerspectiveScreenProps> = ({
  page,
  onSaveCrop,
  onCancel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [corners, setCorners] = useState<QuadCorners>(
    page.corners || {
      topLeft: { x: 50, y: 50 },
      topRight: { x: 500, y: 50 },
      bottomRight: { x: 500, y: 700 },
      bottomLeft: { x: 50, y: 700 },
    }
  );

  const [rotation, setRotation] = useState<number>(page.rotation || 0);
  const [activeCornerKey, setActiveCornerKey] = useState<keyof QuadCorners | null>(null);
  const [loupePosition, setLoupePosition] = useState<{ x: number; y: number } | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ w: number; h: number }>({ w: 800, h: 1000 });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Load Image and Draw Crop Canvas
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageDimensions({ w: img.naturalWidth || 800, h: img.naturalHeight || 1000 });
      
      // If no corners set, calculate auto corners
      if (!page.corners) {
        const auto = autoDetectDocumentCorners(img.naturalWidth, img.naturalHeight);
        setCorners(auto);
      }
    };
    img.src = page.originalImageDataUrl;
  }, [page.originalImageDataUrl]);

  // Draw crop overlay
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = imageDimensions.w;
    canvas.height = imageDimensions.h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw base dim overlay
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw clear crop quadrilateral
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(corners.topLeft.x, corners.topLeft.y);
    ctx.lineTo(corners.topRight.x, corners.topRight.y);
    ctx.lineTo(corners.bottomRight.x, corners.bottomRight.y);
    ctx.lineTo(corners.bottomLeft.x, corners.bottomLeft.y);
    ctx.closePath();
    ctx.clip();

    // Clear dim overlay inside crop box
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Draw crop border lines
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(corners.topLeft.x, corners.topLeft.y);
    ctx.lineTo(corners.topRight.x, corners.topRight.y);
    ctx.lineTo(corners.bottomRight.x, corners.bottomRight.y);
    ctx.lineTo(corners.bottomLeft.x, corners.bottomLeft.y);
    ctx.closePath();
    ctx.stroke();
  }, [corners, imageDimensions]);

  // Corner Drag Handlers with touch & mouse support
  const handlePointerDown = (cornerKey: keyof QuadCorners) => (e: React.PointerEvent) => {
    e.preventDefault();
    setActiveCornerKey(cornerKey);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeCornerKey || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const relativeY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    // Convert relative container coords to natural image dimensions
    const scaleX = imageDimensions.w / rect.width;
    const scaleY = imageDimensions.h / rect.height;

    const canvasX = Math.round(relativeX * scaleX);
    const canvasY = Math.round(relativeY * scaleY);

    setCorners((prev) => ({
      ...prev,
      [activeCornerKey]: { x: canvasX, y: canvasY },
    }));

    setLoupePosition({ x: relativeX, y: relativeY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeCornerKey) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (e) {}
      setActiveCornerKey(null);
      setLoupePosition(null);
    }
  };

  // Reset to full auto edge detection
  const handleAutoEdgeDetect = () => {
    const auto = autoDetectDocumentCorners(imageDimensions.w, imageDimensions.h);
    setCorners(auto);
  };

  // Apply Warp & Proceed
  const handleApplyCrop = async () => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      const croppedUrl = await applyPerspectiveCrop(img, corners, rotation);
      onSaveCrop({
        ...page,
        corners,
        rotation,
        processedImageDataUrl: croppedUrl,
      });
      setIsProcessing(false);
    };
    img.src = page.originalImageDataUrl;
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Crop className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Perspective Crop</h3>
            <p className="text-xs text-slate-500">Drag corners to flatten angled page edges</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoEdgeDetect}
            className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto Edge</span>
          </button>

          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
            title="Rotate 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Crop Stage */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full aspect-[3/4] max-h-[60vh] bg-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-800 select-none touch-none flex items-center justify-center"
      >
        {/* Source Image */}
        <img
          src={page.originalImageDataUrl}
          alt="Source"
          style={{ transform: `rotate(${rotation}deg)` }}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-transform duration-200"
        />

        {/* Canvas Quad Overlay */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-contain pointer-events-none" />

        {/* Draggable Corner Handles */}
        {containerRef.current && (
          <>
            {(['topLeft', 'topRight', 'bottomRight', 'bottomLeft'] as (keyof QuadCorners)[]).map((cornerKey) => {
              const pt = corners[cornerKey];
              // Convert canvas coords to container percentage
              const pctX = (pt.x / imageDimensions.w) * 100;
              const pctY = (pt.y / imageDimensions.h) * 100;

              return (
                <div
                  key={cornerKey}
                  onPointerDown={handlePointerDown(cornerKey)}
                  style={{ left: `${pctX}%`, top: `${pctY}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-white shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center transition-transform ${
                    activeCornerKey === cornerKey
                      ? 'bg-emerald-500 scale-125 z-30 ring-4 ring-emerald-500/30'
                      : 'bg-blue-600 hover:scale-110 z-20'
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                </div>
              );
            })}
          </>
        )}

        {/* Magnifying Loupe Window when dragging handle */}
        {loupePosition && activeCornerKey && (
          <div
            style={{
              left: `${Math.min(80, Math.max(20, loupePosition.x))}px`,
              top: `${Math.min(80, Math.max(20, loupePosition.y - 70))}px`,
            }}
            className="absolute z-40 w-24 h-24 rounded-full border-4 border-blue-500 bg-slate-900 shadow-2xl overflow-hidden pointer-events-none flex items-center justify-center ring-4 ring-black/50"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={page.originalImageDataUrl}
                alt="Magnified corner"
                style={{
                  width: `${imageDimensions.w * 2.5}px`,
                  maxHeight: 'none',
                  position: 'absolute',
                  left: `-${(corners[activeCornerKey].x / imageDimensions.w) * (imageDimensions.w * 2.5) - 48}px`,
                  top: `-${(corners[activeCornerKey].y / imageDimensions.h) * (imageDimensions.h * 2.5) - 48}px`,
                }}
              />
              {/* Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-0.5 bg-emerald-400/80" />
                <div className="h-full w-0.5 bg-emerald-400/80 absolute" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center"
        >
          Cancel
        </button>

        <button
          onClick={handleApplyCrop}
          disabled={isProcessing}
          className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <span>Flattening Document...</span>
          ) : (
            <>
              <span>Apply & Enhance</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
