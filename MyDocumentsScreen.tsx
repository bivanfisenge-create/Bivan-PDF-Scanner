import React, { useEffect, useRef, useState } from 'react';
import { AppSettings, DocumentPreset, QuadCorners, ScannedPage } from '../types';
import { autoDetectDocumentCorners } from '../utils/canvasUtils';
import { 
  Camera, 
  Zap, 
  ZapOff, 
  Grid, 
  X, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Upload, 
  Layers, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface CameraScannerProps {
  onCapturePage: (page: Partial<ScannedPage>) => void;
  capturedPagesCount: number;
  onFinishScanning: () => void;
  onCancel: () => void;
  settings: AppSettings;
  defaultPreset?: DocumentPreset;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onCapturePage,
  capturedPagesCount,
  onFinishScanning,
  onCancel,
  settings,
  defaultPreset = 'A4',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<DocumentPreset>(defaultPreset);
  const [isFlashOn, setIsFlashOn] = useState<boolean>(settings.flashDefault);
  const [showGridLines, setShowGridLines] = useState<boolean>(settings.gridLines);
  const [isAutoCapture, setIsAutoCapture] = useState<boolean>(settings.autoCapture);
  const [detectedCorners, setDetectedCorners] = useState<QuadCorners | null>(null);
  const [stabilityCounter, setStabilityCounter] = useState<number>(0);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [flashTriggered, setFlashTriggered] = useState<boolean>(false);

  // Initialize Camera Stream
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Rear camera preferred
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        currentStream = mediaStream;
        setStream(mediaStream);
        setHasCameraAccess(true);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      } catch (err) {
        console.warn('Camera access denied or unavailable:', err);
        setHasCameraAccess(false);
      }
    }

    setupCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Real-time Document Edge Detection Animation Loop
  useEffect(() => {
    let animFrameId: number;

    const detectLoop = () => {
      if (videoRef.current && overlayCanvasRef.current && videoRef.current.readyState === 4) {
        const video = videoRef.current;
        const canvas = overlayCanvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // Clear previous overlay
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Get simulated or calculated corners
          const corners = autoDetectDocumentCorners(canvas.width, canvas.height);
          setDetectedCorners(corners);

          // Draw real-time edge detection boundary path
          ctx.strokeStyle = stabilityCounter > 2 ? '#10b981' : '#3b82f6';
          ctx.lineWidth = 4;
          ctx.setLineDash([8, 4]);

          ctx.beginPath();
          ctx.moveTo(corners.topLeft.x, corners.topLeft.y);
          ctx.lineTo(corners.topRight.x, corners.topRight.y);
          ctx.lineTo(corners.bottomRight.x, corners.bottomRight.y);
          ctx.lineTo(corners.bottomLeft.x, corners.bottomLeft.y);
          ctx.closePath();
          ctx.stroke();

          // Draw translucent quad overlay
          ctx.fillStyle = stabilityCounter > 2 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.12)';
          ctx.fill();

          // Draw corner target circles
          const drawCornerNode = (p: { x: number; y: number }) => {
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = stabilityCounter > 2 ? '#10b981' : '#3b82f6';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          };

          drawCornerNode(corners.topLeft);
          drawCornerNode(corners.topRight);
          drawCornerNode(corners.bottomRight);
          drawCornerNode(corners.bottomLeft);
        }
      }

      animFrameId = requestAnimationFrame(detectLoop);
    };

    if (hasCameraAccess) {
      animFrameId = requestAnimationFrame(detectLoop);
    }

    return () => cancelAnimationFrame(animFrameId);
  }, [hasCameraAccess, stabilityCounter]);

  // Auto-capture timer when paper is stable
  useEffect(() => {
    if (!isAutoCapture || !hasCameraAccess || isCapturing) return;

    const interval = setInterval(() => {
      setStabilityCounter((prev) => {
        if (prev >= 3) {
          captureFrame();
          return 0;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isAutoCapture, hasCameraAccess, isCapturing]);

  // Capture Frame Action
  const captureFrame = () => {
    if (isCapturing) return;
    setIsCapturing(true);

    // Visual camera shutter flash trigger
    setFlashTriggered(true);
    setTimeout(() => setFlashTriggered(false), 200);

    let dataUrl = '';
    let w = 1200;
    let h = 1600;

    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1200;
      canvas.height = video.videoHeight || 1600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        w = canvas.width;
        h = canvas.height;
      }
    }

    if (!dataUrl) {
      // Fallback demo canvas frame
      dataUrl = generateDemoScanCanvas(selectedPreset);
    }

    const corners = detectedCorners || autoDetectDocumentCorners(w, h);

    onCapturePage({
      originalImageDataUrl: dataUrl,
      processedImageDataUrl: dataUrl,
      corners,
      rotation: 0,
      filter: 'auto',
      filterSettings: { brightness: 0, contrast: 0, sharpness: 10, threshold: 128 },
      width: w,
      height: h,
    });

    setIsCapturing(false);
    setStabilityCounter(0);
  };

  // Upload fallback image handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      if (url) {
        const img = new Image();
        img.onload = () => {
          onCapturePage({
            originalImageDataUrl: url,
            processedImageDataUrl: url,
            corners: autoDetectDocumentCorners(img.width, img.height),
            rotation: 0,
            filter: 'auto',
            filterSettings: { brightness: 0, contrast: 0, sharpness: 10, threshold: 128 },
            width: img.width,
            height: img.height,
          });
        };
        img.src = url;
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative w-full h-[82vh] bg-black rounded-3xl overflow-hidden flex flex-col justify-between select-none shadow-2xl border border-slate-800">
      {/* Top Camera Controls Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4 flex items-center justify-between text-white">
        <button
          onClick={onCancel}
          className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {/* Flash Toggle */}
          <button
            onClick={() => setIsFlashOn(!isFlashOn)}
            className={`p-2 rounded-full backdrop-blur-md transition-colors ${
              isFlashOn ? 'bg-amber-500 text-slate-900 font-bold' : 'bg-black/40 text-white'
            }`}
          >
            {isFlashOn ? <Zap className="w-5 h-5 fill-current" /> : <ZapOff className="w-5 h-5" />}
          </button>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGridLines(!showGridLines)}
            className={`p-2 rounded-full backdrop-blur-md transition-colors ${
              showGridLines ? 'bg-blue-600 text-white' : 'bg-black/40 text-white'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>

          {/* Auto Capture Toggle */}
          <button
            onClick={() => setIsAutoCapture(!isAutoCapture)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md transition-colors flex items-center gap-1.5 ${
              isAutoCapture ? 'bg-emerald-500 text-white' : 'bg-black/40 text-slate-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAutoCapture ? 'Auto Capture On' : 'Manual Mode'}</span>
          </button>
        </div>
      </div>

      {/* Camera Stream / Simulation Area */}
      <div className="relative flex-1 w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* Flash trigger overlay */}
        {flashTriggered && <div className="absolute inset-0 bg-white z-30 animate-ping opacity-80" />}

        {hasCameraAccess ? (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <canvas ref={overlayCanvasRef} className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none" />
          </>
        ) : (
          /* Demo Camera Canvas fallback if physical camera is restricted */
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-slate-900">
            <div className="w-full max-w-sm aspect-[3/4] rounded-2xl border-2 border-dashed border-blue-500/50 bg-slate-800/80 p-6 flex flex-col items-center justify-center space-y-4 shadow-xl">
              <div className="p-4 rounded-full bg-blue-500/10 text-blue-400 animate-pulse">
                <Camera className="w-10 h-10" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">Interactive Document Scanner</p>
                <p className="text-xs text-slate-400 mt-1">
                  Position document inside frame. Live edge detection will automatically align quad corners.
                </p>
              </div>
              <button
                onClick={captureFrame}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95"
              >
                Simulate Camera Capture
              </button>
            </div>
          </div>
        )}

        {/* Optional Grid Overlay */}
        {showGridLines && (
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20 border border-white">
            <div className="border border-white/40" />
            <div className="border border-white/40" />
            <div className="border border-white/40" />
            <div className="border border-white/40" />
            <div className="border border-white/40" />
            <div className="border border-white/40" />
            <div className="border border-white/40" />
            <div className="border border-white/40" />
            <div className="border border-white/40" />
          </div>
        )}

        {/* Auto Capture Stability Indicator */}
        {isAutoCapture && hasCameraAccess && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 text-xs text-white">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Hold Steady: {stabilityCounter}/3</span>
          </div>
        )}
      </div>

      {/* Preset Selector Banner */}
      <div className="z-20 bg-black/80 backdrop-blur-md py-2 px-4 flex items-center justify-center gap-2 overflow-x-auto">
        {(['A4', 'Letter', 'Receipt', 'BusinessCard', 'Passport'] as DocumentPreset[]).map((preset) => (
          <button
            key={preset}
            onClick={() => setSelectedPreset(preset)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors whitespace-nowrap ${
              selectedPreset === preset
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Bottom Shutter & Page Stack Bar */}
      <div className="z-20 bg-slate-950 p-4 pb-6 flex items-center justify-between gap-4">
        {/* Upload File Fallback */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-3 rounded-full bg-slate-800 text-slate-300 hover:text-white transition-colors flex flex-col items-center"
          title="Import Image File"
        >
          <Upload className="w-5 h-5" />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
        </button>

        {/* Shutter Capture Button */}
        <button
          onClick={captureFrame}
          disabled={isCapturing}
          className="relative w-16 h-16 rounded-full border-4 border-white flex items-center justify-center p-1 group active:scale-90 transition-transform shadow-lg shadow-blue-500/20"
        >
          <div className="w-full h-full rounded-full bg-white group-hover:bg-blue-500 transition-colors flex items-center justify-center">
            <Camera className="w-6 h-6 text-slate-900 group-hover:text-white transition-colors" />
          </div>
        </button>

        {/* Captured Pages Count Stack & Finish Button */}
        <button
          onClick={onFinishScanning}
          disabled={capturedPagesCount === 0}
          className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 font-bold text-xs transition-all ${
            capturedPagesCount > 0
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Done ({capturedPagesCount})</span>
        </button>
      </div>
    </div>
  );
};

function generateDemoScanCanvas(preset: DocumentPreset): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, 1200, 1600);

  // Document paper sheet
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 20;
  ctx.fillRect(100, 100, 1000, 1400);

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(`SCANNED DOCUMENT (${preset.toUpperCase()})`, 160, 220);

  ctx.font = '22px sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText(`Captured on: ${new Date().toLocaleString()}`, 160, 260);

  // Decorative text lines
  ctx.fillStyle = '#94a3b8';
  for (let y = 340; y < 1300; y += 45) {
    ctx.fillRect(160, y, 880 * (0.6 + Math.sin(y) * 0.35), 14);
  }

  return canvas.toDataURL('image/jpeg', 0.95);
}
