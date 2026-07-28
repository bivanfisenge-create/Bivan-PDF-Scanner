import React, { useEffect, useState } from 'react';
import { AppSettings, AppView, DocumentFolder, DocumentPreset, DocumentProject, ScannedPage } from './types';
import { getAppSettings, getSavedFolders, getSavedProjects, saveAppSettings, saveFolders, saveProjects, saveSingleProject } from './utils/storageUtils';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { CameraScanner } from './components/CameraScanner';
import { CropPerspectiveScreen } from './components/CropPerspectiveScreen';
import { FilterScreen } from './components/FilterScreen';
import { OCRScreen } from './components/OCRScreen';
import { DocumentStudio } from './components/DocumentStudio';
import { MyDocumentsScreen } from './components/MyDocumentsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { SecurityLockModal } from './components/SecurityLockModal';
import { autoDetectDocumentCorners } from './utils/canvasUtils';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [projects, setProjects] = useState<DocumentProject[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());

  const [activeProject, setActiveProject] = useState<DocumentProject | null>(null);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Initial Data Load
  useEffect(() => {
    const savedProjects = getSavedProjects();
    const savedFolders = getSavedFolders();
    setProjects(savedProjects);
    setFolders(savedFolders);

    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    }

    if (settings.appPinEnabled) {
      setIsLocked(true);
    }
  }, []);

  // Save Settings whenever updated
  useEffect(() => {
    saveAppSettings(settings);
  }, [settings]);

  // Save Projects whenever updated
  const handleSaveProjectsState = (updatedList: DocumentProject[]) => {
    setProjects(updatedList);
    saveProjects(updatedList);
  };

  const handleSaveSingleProjectState = (updatedProject: DocumentProject) => {
    saveSingleProject(updatedProject);
    const updatedList = getSavedProjects();
    setProjects(updatedList);
    if (activeProject?.id === updatedProject.id) {
      setActiveProject(updatedProject);
    }
  };

  const handleDeleteProjectState = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    handleSaveProjectsState(updated);
    if (activeProject?.id === id) {
      setActiveProject(null);
      setCurrentView('myDocs');
    }
  };

  // Create Folder
  const handleCreateFolder = (name: string, color?: string) => {
    const newFolder: DocumentFolder = {
      id: `f_${Date.now()}`,
      name,
      createdAt: Date.now(),
      color: color || '#3b82f6',
    };
    const updated = [...folders, newFolder];
    setFolders(updated);
    saveFolders(updated);
  };

  // Launch New Scan Project
  const handleStartNewScan = (preset: DocumentPreset = 'A4') => {
    const newDoc: DocumentProject = {
      id: `doc_${Date.now()}`,
      title: `Scan ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isFavorite: false,
      pages: [],
      preset,
      pageSize: settings.defaultPageSize,
      pdfQuality: settings.defaultQuality,
      margin: 'none',
    };

    setActiveProject(newDoc);
    setActivePageIndex(0);
    setCurrentView('camera');
  };

  // Camera Captured Page Handler
  const handleCapturedPage = (pagePartial: Partial<ScannedPage>) => {
    if (!activeProject) return;

    const newPage: ScannedPage = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      originalImageDataUrl: pagePartial.originalImageDataUrl || '',
      processedImageDataUrl: pagePartial.processedImageDataUrl || pagePartial.originalImageDataUrl || '',
      corners: pagePartial.corners || autoDetectDocumentCorners(pagePartial.width || 800, pagePartial.height || 1000),
      rotation: 0,
      filter: 'auto',
      filterSettings: { brightness: 0, contrast: 0, sharpness: 10, threshold: 128 },
      width: pagePartial.width || 800,
      height: pagePartial.height || 1000,
    };

    const updatedPages = [...activeProject.pages, newPage];
    const updatedDoc = { ...activeProject, pages: updatedPages, updatedAt: Date.now() };

    setActiveProject(updatedDoc);
    setActivePageIndex(updatedPages.length - 1);
    handleSaveSingleProjectState(updatedDoc);
  };

  // Import Gallery Images Handler
  const handleImportGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newDoc: DocumentProject = {
      id: `doc_import_${Date.now()}`,
      title: `Imported Scans ${new Date().toLocaleDateString()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isFavorite: false,
      pages: [],
      preset: 'A4',
      pageSize: settings.defaultPageSize,
      pdfQuality: settings.defaultQuality,
      margin: 'none',
    };

    let loadedCount = 0;
    Array.from(files).forEach((file: File, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        if (url) {
          const img = new Image();
          img.onload = () => {
            const page: ScannedPage = {
              id: `p_imp_${Date.now()}_${index}`,
              originalImageDataUrl: url,
              processedImageDataUrl: url,
              corners: autoDetectDocumentCorners(img.width, img.height),
              rotation: 0,
              filter: 'auto',
              filterSettings: { brightness: 0, contrast: 0, sharpness: 10, threshold: 128 },
              width: img.width,
              height: img.height,
            };

            newDoc.pages.push(page);
            loadedCount++;

            if (loadedCount === files.length) {
              handleSaveSingleProjectState(newDoc);
              setActiveProject(newDoc);
              setActivePageIndex(0);
              setCurrentView('crop');
            }
          };
          img.src = url;
        }
      };
      reader.readAsDataURL(file as File);
    });
  };

  // Complete Scanning Step -> Go to Perspective Crop or Studio
  const handleFinishScanning = () => {
    if (!activeProject || activeProject.pages.length === 0) {
      setCurrentView('home');
      return;
    }
    setCurrentView('crop');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 transition-colors">
      {/* Security Pin Lock Overlay */}
      {isLocked && (
        <SecurityLockModal
          settings={settings}
          onUnlockSuccess={() => setIsLocked(false)}
        />
      )}

      {/* Main Container - Geometric Balance Phone Mockup Frame or Full Width */}
      <div
        className={`w-full transition-all duration-300 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden relative ${
          isPhoneFrame
            ? 'max-w-[360px] sm:max-w-[380px] rounded-none sm:rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.12)] border-0 sm:border-[8px] border-slate-800 min-h-screen sm:min-h-[820px]'
            : 'max-w-5xl rounded-none sm:rounded-2xl shadow-xl border-0 sm:border border-slate-200 dark:border-slate-800 min-h-screen'
        }`}
      >
        {/* Hardware Notch for Phone Frame */}
        {isPhoneFrame && (
          <div className="w-[140px] h-[26px] bg-slate-800 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-[18px] z-40 hidden sm:block pointer-events-none shadow-xs" />
        )}

        {/* Header Navigation */}
        <Header
          currentView={currentView}
          setCurrentView={setCurrentView}
          settings={settings}
          setSettings={setSettings}
          isPhoneFrame={isPhoneFrame}
          setIsPhoneFrame={setIsPhoneFrame}
          isLocked={isLocked}
          setIsLocked={setIsLocked}
        />

        {/* View Router Stage */}
        <main className="p-4 sm:p-5">
          {currentView === 'home' && (
            <HomeScreen
              setCurrentView={setCurrentView}
              recentProjects={projects}
              onSelectProject={(project) => {
                setActiveProject(project);
                setActivePageIndex(0);
                setCurrentView('studio');
              }}
              onImportGallery={handleImportGallery}
              onNewScanWithPreset={(preset) => handleStartNewScan(preset)}
            />
          )}

          {currentView === 'camera' && (
            <CameraScanner
              onCapturePage={handleCapturedPage}
              capturedPagesCount={activeProject?.pages.length || 0}
              onFinishScanning={handleFinishScanning}
              onCancel={() => setCurrentView('home')}
              settings={settings}
              defaultPreset={activeProject?.preset || 'A4'}
            />
          )}

          {currentView === 'crop' && activeProject?.pages[activePageIndex] && (
            <CropPerspectiveScreen
              page={activeProject.pages[activePageIndex]}
              onSaveCrop={(updatedPage) => {
                const updatedPages = [...activeProject.pages];
                updatedPages[activePageIndex] = updatedPage;
                const updatedDoc = { ...activeProject, pages: updatedPages, updatedAt: Date.now() };
                handleSaveSingleProjectState(updatedDoc);
                setCurrentView('filter');
              }}
              onCancel={() => setCurrentView('studio')}
            />
          )}

          {currentView === 'filter' && activeProject?.pages[activePageIndex] && (
            <FilterScreen
              page={activeProject.pages[activePageIndex]}
              onSaveFilter={(updatedPage) => {
                const updatedPages = [...activeProject.pages];
                updatedPages[activePageIndex] = updatedPage;
                const updatedDoc = { ...activeProject, pages: updatedPages, updatedAt: Date.now() };
                handleSaveSingleProjectState(updatedDoc);
              }}
              onProceedToStudio={() => setCurrentView('studio')}
              totalPagesCount={activeProject.pages.length}
              currentPageIndex={activePageIndex}
              onSelectPageIndex={(idx) => setActivePageIndex(idx)}
            />
          )}

          {currentView === 'ocr' && activeProject?.pages[activePageIndex] && (
            <OCRScreen
              page={activeProject.pages[activePageIndex]}
              onUpdateOCRText={(text) => {
                const updatedPages = [...activeProject.pages];
                updatedPages[activePageIndex] = { ...updatedPages[activePageIndex], ocrText: text };
                const updatedDoc = { ...activeProject, pages: updatedPages, updatedAt: Date.now() };
                handleSaveSingleProjectState(updatedDoc);
              }}
              onBack={() => setCurrentView('studio')}
            />
          )}

          {currentView === 'studio' && activeProject && (
            <DocumentStudio
              project={activeProject}
              onUpdateProject={(updated) => handleSaveSingleProjectState(updated)}
              onAddMorePages={() => setCurrentView('camera')}
              onEditCropPage={(idx) => {
                setActivePageIndex(idx);
                setCurrentView('crop');
              }}
              onEditFilterPage={(idx) => {
                setActivePageIndex(idx);
                setCurrentView('filter');
              }}
              onOCRPage={(idx) => {
                setActivePageIndex(idx);
                setCurrentView('ocr');
              }}
              onFinishStudio={() => setCurrentView('myDocs')}
              folders={folders}
            />
          )}

          {currentView === 'myDocs' && (
            <MyDocumentsScreen
              projects={projects}
              folders={folders}
              onSelectProject={(project) => {
                setActiveProject(project);
                setActivePageIndex(0);
                setCurrentView('studio');
              }}
              onDeleteProject={handleDeleteProjectState}
              onSaveSingleProject={handleSaveSingleProjectState}
              onCreateFolder={handleCreateFolder}
              onOpenOCR={(project) => {
                setActiveProject(project);
                setActivePageIndex(0);
                setCurrentView('ocr');
              }}
              onNewScan={() => handleStartNewScan('A4')}
            />
          )}

          {currentView === 'settings' && (
            <SettingsScreen
              settings={settings}
              setSettings={setSettings}
              onResetData={() => {
                setProjects([]);
                setFolders([]);
                setCurrentView('home');
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
