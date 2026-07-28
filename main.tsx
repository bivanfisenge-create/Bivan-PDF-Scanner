import React, { useState } from 'react';
import { DocumentFolder, DocumentProject } from '../types';
import { downloadImage, downloadPDF, downloadText } from '../utils/pdfUtils';
import { mergeDocumentProjects, exportBatchAsZip } from '../utils/batchUtils';
import { BatchFilterModal } from './BatchFilterModal';
import { GoogleDriveModal } from './GoogleDriveModal';
import { 
  FolderCheck, 
  Search, 
  Plus, 
  Star, 
  Trash2, 
  Lock, 
  MoreVertical, 
  FileText, 
  Download, 
  Share2, 
  Copy, 
  Edit3, 
  Clock, 
  SortAsc, 
  Folder,
  FolderPlus,
  X,
  Layers,
  Sparkles,
  CheckSquare,
  Square,
  CloudUpload,
  Archive,
  Wand2,
  Check
} from 'lucide-react';

interface MyDocumentsScreenProps {
  projects: DocumentProject[];
  folders: DocumentFolder[];
  onSelectProject: (project: DocumentProject) => void;
  onDeleteProject: (id: string) => void;
  onSaveSingleProject: (project: DocumentProject) => void;
  onCreateFolder: (name: string, color?: string) => void;
  onOpenOCR: (project: DocumentProject) => void;
  onNewScan: () => void;
}

export const MyDocumentsScreen: React.FC<MyDocumentsScreenProps> = ({
  projects,
  folders,
  onSelectProject,
  onDeleteProject,
  onSaveSingleProject,
  onCreateFolder,
  onOpenOCR,
  onNewScan,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | 'all' | 'favorites'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [activeMenuProjectId, setActiveMenuProjectId] = useState<string | null>(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState<string>('');

  // Batch Mode States
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [showBatchFilterModal, setShowBatchFilterModal] = useState<boolean>(false);
  const [showDriveModal, setShowDriveModal] = useState<boolean>(false);
  const [driveModalTargetProjects, setDriveModalTargetProjects] = useState<DocumentProject[]>([]);


  // Filter projects by search query and selected folder
  const filteredProjects = projects.filter((p) => {
    // Search query match in title or OCR text
    const query = searchQuery.toLowerCase().trim();
    const titleMatch = p.title.toLowerCase().includes(query);
    const ocrMatch = p.pages.some((page) => page.ocrText?.toLowerCase().includes(query));
    const matchesSearch = !query || titleMatch || ocrMatch;

    if (!matchesSearch) return false;

    if (selectedFolderId === 'favorites') return p.isFavorite;
    if (selectedFolderId !== 'all') return p.folderId === selectedFolderId;

    return true;
  });

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'name') return a.title.localeCompare(b.title);
    if (sortBy === 'size') return (b.fileSizeBytes || 0) - (a.fileSizeBytes || 0);
    return b.updatedAt - a.updatedAt; // Default: newest first
  });

  // Toggle favorite
  const handleToggleFavorite = (p: DocumentProject) => {
    onSaveSingleProject({ ...p, isFavorite: !p.isFavorite });
  };

  // Rename document
  const handleRename = (p: DocumentProject) => {
    setRenameTargetId(p.id);
    setRenameTitle(p.title);
    setActiveMenuProjectId(null);
  };

  const handleSaveRename = () => {
    if (!renameTargetId) return;
    const project = projects.find((p) => p.id === renameTargetId);
    if (project && renameTitle.trim()) {
      onSaveSingleProject({ ...project, title: renameTitle.trim(), updatedAt: Date.now() });
    }
    setRenameTargetId(null);
  };

  // Duplicate document
  const handleDuplicate = (p: DocumentProject) => {
    const duplicate: DocumentProject = {
      ...p,
      id: `doc_dup_${Date.now()}`,
      title: `${p.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    onSaveSingleProject(duplicate);
    setActiveMenuProjectId(null);
  };

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolderModal(false);
    }
  };

  // Batch Selection Handlers
  const toggleSelectProject = (id: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProjectIds.length === sortedProjects.length) {
      setSelectedProjectIds([]);
    } else {
      setSelectedProjectIds(sortedProjects.map((p) => p.id));
    }
  };

  const selectedProjects = projects.filter((p) => selectedProjectIds.includes(p.id));

  const handleBatchMerge = () => {
    if (selectedProjects.length < 2) {
      alert('Please select at least 2 documents to merge.');
      return;
    }
    const merged = mergeDocumentProjects(selectedProjects);
    onSaveSingleProject(merged);
    setSelectedProjectIds([]);
    setIsBatchMode(false);
    onSelectProject(merged);
  };

  const handleBatchExportZip = async () => {
    if (selectedProjects.length === 0) return;
    try {
      await exportBatchAsZip(selectedProjects);
    } catch (err) {
      console.error('ZIP export error:', err);
      alert('Failed to generate ZIP export.');
    }
  };

  const handleBatchDriveUpload = () => {
    if (selectedProjects.length === 0) return;
    setDriveModalTargetProjects(selectedProjects);
    setShowDriveModal(true);
  };

  const handleBatchDelete = () => {
    if (selectedProjects.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedProjects.length} document(s)?`)) {
      selectedProjectIds.forEach((id) => onDeleteProject(id));
      setSelectedProjectIds([]);
      setIsBatchMode(false);
    }
  };

  const handleBatchFilterSuccess = (updatedProjects: DocumentProject[]) => {
    updatedProjects.forEach((p) => onSaveSingleProject(p));
  };


  return (
    <div className="space-y-4 pb-16">
      {/* Search Bar & Batch Mode Controls */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search document title or scanned text..."
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Selector & Batch Mode Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsBatchMode(!isBatchMode);
              if (isBatchMode) setSelectedProjectIds([]);
            }}
            className={`px-3 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
              isBatchMode
                ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>{isBatchMode ? 'Cancel Batch' : 'Batch Select'}</span>
          </button>

          {isBatchMode && (
            <button
              onClick={toggleSelectAll}
              className="px-3 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-200"
            >
              {selectedProjectIds.length === sortedProjects.length ? 'Deselect All' : 'Select All'}
            </button>
          )}

          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-bold shadow-xs">
            <SortAsc className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent outline-none cursor-pointer"
            >
              <option value="date" className="dark:bg-slate-900">Date (Newest)</option>
              <option value="name" className="dark:bg-slate-900">Name (A-Z)</option>
              <option value="size" className="dark:bg-slate-900">File Size</option>
            </select>
          </div>

          <button
            onClick={() => setShowNewFolderModal(true)}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title="Create Folder"
          >
            <FolderPlus className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Folder Tabs Scroll Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedFolderId('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            selectedFolderId === 'all'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          All Scans ({projects.length})
        </button>

        <button
          onClick={() => setSelectedFolderId('favorites')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1 ${
            selectedFolderId === 'favorites'
              ? 'bg-amber-500 text-slate-900 shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>Favorites ({projects.filter((p) => p.isFavorite).length})</span>
        </button>

        {folders.map((f) => {
          const count = projects.filter((p) => p.folderId === f.id).length;
          const isSelected = selectedFolderId === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedFolderId(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>{f.name} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* Document List */}
      {sortedProjects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <FolderCheck className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No matching documents found.</p>
          <p className="text-xs text-slate-400">Try adjusting your search query or start a new document scan!</p>
          <button
            onClick={onNewScan}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20"
          >
            Start New Scan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {sortedProjects.map((project) => {
            const firstPage = project.pages[0];
            const thumbUrl = firstPage?.processedImageDataUrl || firstPage?.originalImageDataUrl;
            const folderName = folders.find((f) => f.id === project.folderId)?.name;
            const isSelected = selectedProjectIds.includes(project.id);

            return (
              <div
                key={project.id}
                onClick={() => {
                  if (isBatchMode) toggleSelectProject(project.id);
                }}
                className={`group relative bg-white dark:bg-slate-900 border rounded-2xl p-3.5 shadow-sm transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-purple-600 dark:border-purple-500 bg-purple-50/20 dark:bg-purple-950/20 ring-2 ring-purple-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-500/50'
                }`}
              >
                {/* Batch Checkbox Overlay */}
                {isBatchMode && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectProject(project.id);
                    }}
                    className="absolute top-3 left-3 z-20 cursor-pointer"
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                          : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-transparent'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {/* Thumbnail */}
                  <div
                    onClick={(e) => {
                      if (!isBatchMode) onSelectProject(project);
                    }}
                    className="w-20 aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 relative cursor-pointer"
                  >
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <FileText className="w-6 h-6" />
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-900/80 text-white text-[9px] font-bold">
                      {project.pages?.length || 1} pg
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-1">
                      <h4
                        onClick={() => {
                          if (!isBatchMode) onSelectProject(project);
                        }}
                        className="text-xs font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                      >
                        {project.title}
                      </h4>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(project);
                        }}
                        className="p-1 text-slate-300 hover:text-amber-500 transition-colors shrink-0"
                      >
                        <Star className={`w-4 h-4 ${project.isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{project.pageSize || 'A4'}</span>
                    </div>

                    {folderName && (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        📁 {folderName}
                      </span>
                    )}

                    {project.pages[0]?.ocrText && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                        "{project.pages[0].ocrText.slice(0, 50)}..."
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSelectProject(project)}
                      className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-500/20 transition-colors"
                    >
                      Open Studio
                    </button>

                    <button
                      onClick={() => onOpenOCR(project)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition-colors"
                    >
                      OCR
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => downloadPDF(project)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleRename(project)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 transition-colors"
                      title="Rename Document"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteProject(project.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create New Folder</h3>
              <button onClick={() => setShowNewFolderModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolderSubmit} className="space-y-3">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder Name (e.g. Invoices, Contracts)..."
                autoFocus
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Document Modal */}
      {renameTargetId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Rename Document</h3>
              <button onClick={() => setRenameTargetId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                placeholder="Enter new title..."
                autoFocus
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setRenameTargetId(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveRename}
                  className="flex-1 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md shadow-purple-500/20"
                >
                  Save Title
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STICKY/FLOATING BATCH ACTION BAR */}
      {selectedProjectIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 max-w-lg w-[92vw]">
          <div className="pr-2 border-r border-slate-700 shrink-0">
            <span className="text-xs font-extrabold text-purple-400 block">{selectedProjectIds.length} Selected</span>
            <span className="text-[10px] text-slate-400 font-medium">Batch Action</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {/* Merge into 1 PDF */}
            <button
              onClick={handleBatchMerge}
              className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-transform active:scale-95 shadow-xs"
              title="Merge selected documents into 1 document"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Merge</span>
            </button>

            {/* Batch Filter */}
            <button
              onClick={() => setShowBatchFilterModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-transform active:scale-95 shadow-xs"
              title="Apply filter to all pages in selected documents"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>

            {/* Google Drive Upload */}
            <button
              onClick={handleBatchDriveUpload}
              className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-transform active:scale-95 shadow-xs"
              title="Upload selected documents to Google Drive"
            >
              <CloudUpload className="w-3.5 h-3.5" />
              <span>Drive</span>
            </button>

            {/* ZIP Export */}
            <button
              onClick={handleBatchExportZip}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 shrink-0 transition-transform active:scale-95 border border-slate-700"
              title="Export all selected documents in a ZIP archive"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>ZIP</span>
            </button>

            {/* Delete */}
            <button
              onClick={handleBatchDelete}
              className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-xs shrink-0 transition-colors"
              title="Delete selected documents"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Batch Filter Modal */}
      <BatchFilterModal
        isOpen={showBatchFilterModal}
        onClose={() => setShowBatchFilterModal(false)}
        selectedProjects={selectedProjects}
        onBatchFilterSuccess={handleBatchFilterSuccess}
      />

      {/* Google Drive Modal */}
      <GoogleDriveModal
        isOpen={showDriveModal}
        onClose={() => setShowDriveModal(false)}
        targetProjects={driveModalTargetProjects}
      />
    </div>
  );
};
