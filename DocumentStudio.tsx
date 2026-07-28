import React from 'react';
import { AppView, DocumentProject } from '../types';
import { 
  Camera, 
  Image as ImageIcon, 
  FolderCheck, 
  Settings, 
  Sparkles, 
  Lock, 
  FileText, 
  Clock, 
  ChevronRight,
  Plus,
  ShieldAlert,
  Zap,
  HardDrive
} from 'lucide-react';

interface HomeScreenProps {
  setCurrentView: (view: AppView) => void;
  recentProjects: DocumentProject[];
  onSelectProject: (project: DocumentProject) => void;
  onImportGallery: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNewScanWithPreset: (preset: 'A4' | 'Letter' | 'Receipt' | 'BusinessCard' | 'Passport') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  setCurrentView,
  recentProjects,
  onSelectProject,
  onImportGallery,
  onNewScanWithPreset,
}) => {
  const hiddenFileInputRef = React.useRef<HTMLInputElement>(null);

  // Calculate total pages and estimated storage saved
  const totalDocuments = recentProjects.length;
  const totalPages = recentProjects.reduce((acc, curr) => acc + (curr.pages?.length || 0), 0);
  const totalStorageKb = Math.round(
    recentProjects.reduce((acc, curr) => acc + (curr.fileSizeBytes || 250000), 0) / 1024
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Privacy Guarantee Badge */}
      <div className="bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between gap-3 text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-sm shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
              100% On-Device Privacy Guaranteed
            </h2>
            <p className="text-xs opacity-90 mt-0.5">
              No cloud uploads, no advertisements, no tracking. Everything works completely offline.
            </p>
          </div>
        </div>
      </div>

      {/* Hidden File Input for Gallery Import */}
      <input
        type="file"
        ref={hiddenFileInputRef}
        onChange={onImportGallery}
        accept="image/*,.pdf"
        multiple
        className="hidden"
      />

      {/* ---------------- MAIN 4 BUTTONS GRID (GEOMETRIC BALANCE Theme) ---------------- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Quick Actions
          </h3>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Privacy Shield Active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {/* 1. Scan New Document */}
          <button
            onClick={() => setCurrentView('camera')}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col items-center gap-3 cursor-pointer transition-all hover:bg-blue-50/60 dark:hover:bg-slate-800/80 hover:border-blue-500 shadow-xs hover:shadow-md text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 transition-transform group-hover:scale-105">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Scan New</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">Camera & Edge Detection</p>
            </div>
          </button>

          {/* 2. Import Gallery */}
          <button
            onClick={() => hiddenFileInputRef.current?.click()}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col items-center gap-3 cursor-pointer transition-all hover:bg-purple-50/60 dark:hover:bg-slate-800/80 hover:border-purple-500 shadow-xs hover:shadow-md text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/25 transition-transform group-hover:scale-105">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Import Photos</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">Gallery & PDF Files</p>
            </div>
          </button>

          {/* 3. My Documents / Folders */}
          <button
            onClick={() => setCurrentView('myDocs')}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col items-center gap-3 cursor-pointer transition-all hover:bg-emerald-50/60 dark:hover:bg-slate-800/80 hover:border-emerald-500 shadow-xs hover:shadow-md text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 transition-transform group-hover:scale-105">
              <FolderCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Folders & Docs</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
                {totalDocuments} Saved
              </p>
            </div>
          </button>

          {/* 4. Settings */}
          <button
            onClick={() => setCurrentView('settings')}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col items-center gap-3 cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-slate-400 shadow-xs hover:shadow-md text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-600 flex items-center justify-center text-white shadow-md shadow-slate-500/25 transition-transform group-hover:scale-105">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Settings</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">PDF & App Options</p>
            </div>
          </button>
        </div>
      </div>

      {/* Quick Document Scanner Presets */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Quick Document Format Presets
        </h4>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { label: 'A4 Document', preset: 'A4', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
            { label: 'Receipt', preset: 'Receipt', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
            { label: 'Business Card', preset: 'BusinessCard', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
            { label: 'Passport / ID', preset: 'Passport', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
            { label: 'US Letter', preset: 'Letter', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
          ].map((item) => (
            <button
              key={item.preset}
              onClick={() => onNewScanWithPreset(item.preset as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-transform active:scale-95 border border-transparent ${item.color} hover:border-current`}
            >
              + {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Documents Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Recent Scans</h3>
          </div>
          <button
            onClick={() => setCurrentView('myDocs')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            View All ({recentProjects.length})
          </button>
        </div>

        {recentProjects.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">No scanned documents yet.</p>
            <p className="text-xs text-slate-400">Tap "Scan Document" above to capture your first page!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentProjects.slice(0, 3).map((project) => {
              const firstPage = project.pages[0];
              const thumbUrl = firstPage?.processedImageDataUrl || firstPage?.originalImageDataUrl;

              return (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 hover:border-blue-500/50 cursor-pointer shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative mb-2.5">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <FileText className="w-8 h-8" />
                      </div>
                    )}
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-medium backdrop-blur-sm">
                      {project.pages?.length || 1} pg
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {project.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-center">
          <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1" />
          <p className="text-base font-extrabold text-slate-900 dark:text-white">{totalDocuments}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total Documents</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-center">
          <FileText className="w-4 h-4 text-blue-500 mx-auto mb-1" />
          <p className="text-base font-extrabold text-slate-900 dark:text-white">{totalPages}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Pages Processed</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-center">
          <HardDrive className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
          <p className="text-base font-extrabold text-slate-900 dark:text-white">{totalStorageKb} KB</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Local Storage</p>
        </div>
      </div>

      {/* Floating Scan Action Button (Geometric Balance Theme) */}
      <button
        onClick={() => setCurrentView('camera')}
        className="fixed bottom-6 right-6 sm:absolute sm:bottom-6 sm:right-6 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white shadow-xl shadow-blue-600/35 flex items-center justify-center z-40 transition-all hover:scale-110"
        title="Quick Scan Document"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
};
