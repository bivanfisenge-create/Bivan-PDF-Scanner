import React, { useEffect, useState } from 'react';
import { FilterType, ScannedPage } from '../types';
import { applyImageFilter } from '../utils/canvasUtils';
import { 
  Wand2, 
  Sliders, 
  Check, 
  RotateCcw, 
  ArrowRight, 
  FileText,
  Sun,
  Contrast,
  Sparkles,
  Layers
} from 'lucide-react';

interface FilterScreenProps {
  page: ScannedPage;
  onSaveFilter: (updatedPage: ScannedPage) => void;
  onProceedToStudio: () => void;
  totalPagesCount: number;
  currentPageIndex: number;
  onSelectPageIndex: (idx: number) => void;
}

export const FILTER_PRESETS: { id: FilterType; label: string; desc: string }[] = [
  { id: 'auto', label: 'Auto Magic', desc: 'Auto shadow removal & paper whitening' },
  { id: 'bw', label: 'Black & White', desc: 'High-contrast crisp black text' },
  { id: 'color', label: 'Color Document', desc: 'Vivid colors with flattened background' },
  { id: 'highContrast', label: 'High Contrast', desc: 'Maximum legibility for faded ink' },
  { id: 'grayscale', label: 'Grayscale', desc: 'Smooth monochrome 256 levels' },
  { id: 'brighten', label: 'Brighten', desc: 'Shadow reduction & light boost' },
  { id: 'sharpen', label: 'Sharpen Text', desc: 'Sharpen handwriting & low-light scan' },
  { id: 'original', label: 'Original', desc: 'Raw unedited camera photo' },
];

export const FilterScreen: React.FC<FilterScreenProps> = ({
  page,
  onSaveFilter,
  onProceedToStudio,
  totalPagesCount,
  currentPageIndex,
  onSelectPageIndex,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>(page.filter || 'auto');
  const [brightness, setBrightness] = useState<number>(page.filterSettings?.brightness || 0);
  const [contrast, setContrast] = useState<number>(page.filterSettings?.contrast || 0);
  const [sharpness, setSharpness] = useState<number>(page.filterSettings?.sharpness || 0);
  const [threshold, setThreshold] = useState<number>(page.filterSettings?.threshold || 128);

  const [previewUrl, setPreviewUrl] = useState<string>(
    page.processedImageDataUrl || page.originalImageDataUrl
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showAdvancedSliders, setShowAdvancedSliders] = useState<boolean>(false);

  // Re-apply filter when settings change
  useEffect(() => {
    let isMounted = true;
    const updatePreview = async () => {
      setIsProcessing(true);
      const filtered = await applyImageFilter(
        page.originalImageDataUrl,
        selectedFilter,
        { brightness, contrast, sharpness, threshold }
      );
      if (isMounted) {
        setPreviewUrl(filtered);
        setIsProcessing(false);
      }
    };

    updatePreview();

    return () => {
      isMounted = false;
    };
  }, [page.originalImageDataUrl, selectedFilter, brightness, contrast, sharpness, threshold]);

  const handleApply = () => {
    onSaveFilter({
      ...page,
      filter: selectedFilter,
      processedImageDataUrl: previewUrl,
      filterSettings: {
        brightness,
        contrast,
        sharpness,
        threshold,
      },
    });
    onProceedToStudio();
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header with Multi-page selector */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Image Filter</h3>
            <p className="text-xs text-slate-500">Remove shadows & enhance text sharpness</p>
          </div>
        </div>

        {totalPagesCount > 1 && (
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Page {currentPageIndex + 1} of {totalPagesCount}
            </span>
          </div>
        )}
      </div>

      {/* Main Image Preview Stage */}
      <div className="relative w-full aspect-[3/4] max-h-[52vh] bg-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-800 flex items-center justify-center p-2">
        {isProcessing && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs z-20 flex items-center justify-center text-white text-xs font-semibold gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>Applying Filter...</span>
          </div>
        )}

        <img
          src={previewUrl}
          alt="Filter Preview"
          className="max-w-full max-h-full object-contain rounded-lg shadow-md"
        />
      </div>

      {/* Filter Presets Scroll Row */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enhancement Presets</span>
          <button
            onClick={() => setShowAdvancedSliders(!showAdvancedSliders)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showAdvancedSliders ? 'Hide Tuning Sliders' : 'Fine-Tune Sliders'}</span>
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {FILTER_PRESETS.map((preset) => {
            const isSelected = selectedFilter === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setSelectedFilter(preset.id)}
                className={`flex-col min-w-[110px] p-2.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">{preset.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>
                <p className={`text-[10px] line-clamp-2 leading-snug ${isSelected ? 'opacity-90' : 'text-slate-400'}`}>
                  {preset.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Tuning Sliders Panel */}
      {showAdvancedSliders && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-sm">
          {/* Brightness */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Sun className="w-3.5 h-3.5" /> Brightness
              </span>
              <span className="text-blue-600 dark:text-blue-400">{brightness}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Contrast */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Contrast className="w-3.5 h-3.5" /> Contrast
              </span>
              <span className="text-blue-600 dark:text-blue-400">{contrast}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* B&W Threshold */}
          {selectedFilter === 'bw' && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-400">B&W Binarization Threshold</span>
                <span className="text-blue-600 dark:text-blue-400">{threshold}</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          )}

          <button
            onClick={() => {
              setBrightness(0);
              setContrast(0);
              setThreshold(128);
              setSharpness(0);
            }}
            className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset Sliders
          </button>
        </div>
      )}

      {/* Save & Finish Action */}
      <button
        onClick={handleApply}
        className="w-full py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
      >
        <span>Save Filter & Continue</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
