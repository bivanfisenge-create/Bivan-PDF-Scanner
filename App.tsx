import React, { useEffect, useState } from 'react';
import { ScannedPage } from '../types';
import { OCRProgress, performLocalOCR } from '../utils/ocrUtils';
import { downloadText } from '../utils/pdfUtils';
import { 
  FileText, 
  Copy, 
  Check, 
  Search, 
  Share2, 
  Download, 
  Sparkles, 
  Languages, 
  RefreshCw,
  X
} from 'lucide-react';

interface OCRScreenProps {
  page: ScannedPage;
  onUpdateOCRText: (text: string) => void;
  onBack: () => void;
}

export const SUPPORTED_LANGUAGES = [
  { code: 'eng', name: 'English' },
  { code: 'spa', name: 'Spanish (Español)' },
  { code: 'fra', name: 'French (Français)' },
  { code: 'deu', name: 'German (Deutsch)' },
  { code: 'jpn', name: 'Japanese (日本語)' },
  { code: 'chi_sim', name: 'Chinese Simplified (简体中文)' },
  { code: 'hin', name: 'Hindi (हिंदी)' },
  { code: 'ara', name: 'Arabic (العربية)' },
];

export const OCRScreen: React.FC<OCRScreenProps> = ({
  page,
  onUpdateOCRText,
  onBack,
}) => {
  const [extractedText, setExtractedText] = useState<string>(page.ocrText || '');
  const [selectedLang, setSelectedLang] = useState<string>(page.ocrLanguage || 'eng');
  const [isRecognizing, setIsRecognizing] = useState<boolean>(false);
  const [ocrProgress, setOcrProgress] = useState<OCRProgress>({ status: '', progress: 0 });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Trigger OCR on mount if text not yet extracted
  useEffect(() => {
    if (!page.ocrText) {
      runOCR();
    }
  }, []);

  const runOCR = async () => {
    setIsRecognizing(true);
    setOcrProgress({ status: 'Initializing Tesseract Engine...', progress: 0.1 });

    const imgUrl = page.processedImageDataUrl || page.originalImageDataUrl;
    const result = await performLocalOCR(imgUrl, selectedLang, (prog) => setOcrProgress(prog));

    setExtractedText(result);
    onUpdateOCRText(result);
    setIsRecognizing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Scanned OCR Text',
          text: extractedText,
        });
      } catch (e) {}
    } else {
      handleCopy();
    }
  };

  const handleExportTXT = () => {
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OCR_Extraction_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Highlight search query
  const getHighlightedText = () => {
    if (!searchQuery.trim()) return extractedText;
    const parts = extractedText.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={i} className="bg-amber-300 dark:bg-amber-500 text-slate-900 rounded-sm px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top bar with Language Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">OCR Text Recognizer</h3>
            <p className="text-xs text-slate-500">Offline multi-language text extraction</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Languages className="w-4 h-4 text-slate-500" />
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={runOCR}
            disabled={isRecognizing}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            title="Re-run OCR"
          >
            <RefreshCw className={`w-4 h-4 ${isRecognizing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* OCR Progress Bar */}
      {isRecognizing && (
        <div className="bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between text-xs font-bold text-blue-700 dark:text-blue-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-500" />
              {ocrProgress.status || 'Extracting Text...'}
            </span>
            <span>{Math.round(ocrProgress.progress * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-blue-200 dark:bg-blue-950 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.max(5, ocrProgress.progress * 100)}%` }}
              className="h-full bg-blue-600 transition-all duration-300"
            />
          </div>
        </div>
      )}

      {/* Live Text Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search extracted text..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Extracted Text Content Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recognized Text</span>
          <span className="text-[11px] text-slate-400 font-medium">
            {extractedText.split(/\s+/).filter(Boolean).length} words
          </span>
        </div>

        <textarea
          value={extractedText}
          onChange={(e) => {
            setExtractedText(e.target.value);
            onUpdateOCRText(e.target.value);
          }}
          rows={10}
          placeholder="Extracted text will appear here..."
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed outline-none focus:border-blue-500 resize-y"
        />
      </div>

      {/* Action Toolbar */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={handleCopy}
          className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
        >
          {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-blue-500" />}
          <span>{isCopied ? 'Copied!' : 'Copy Text'}</span>
        </button>

        <button
          onClick={handleExportTXT}
          className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Download className="w-4 h-4 text-purple-500" />
          <span>Export TXT</span>
        </button>

        <button
          onClick={handleShare}
          className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Share2 className="w-4 h-4 text-emerald-500" />
          <span>Share Text</span>
        </button>
      </div>

      <button
        onClick={onBack}
        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all text-center"
      >
        Done & Back to Studio
      </button>
    </div>
  );
};
