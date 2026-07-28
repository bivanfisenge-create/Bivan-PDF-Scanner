import { AppSettings, DocumentFolder, DocumentProject } from '../types';
import { generateSampleDocuments } from './sampleDocGenerator';

const STORAGE_KEYS = {
  PROJECTS: 'pdf_scanner_projects_v1',
  FOLDERS: 'pdf_scanner_folders_v1',
  SETTINGS: 'pdf_scanner_settings_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  autoCapture: true,
  flashDefault: false,
  saveOriginalImages: true,
  defaultPageSize: 'A4',
  defaultQuality: 'high',
  compressionLevel: 8,
  theme: 'light',
  language: 'en',
  appPinEnabled: false,
  appPinCode: '',
  useBiometrics: true,
  gridLines: true,
  hapticFeedback: true,
};

/**
 * Loads all saved document projects from LocalStorage
 */
export function getSavedProjects(): DocumentProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) {
      // Initialize with sample high-quality scanned documents
      const sampleDocs = generateSampleDocuments();
      saveProjects(sampleDocs);
      return sampleDocs;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse saved projects:', e);
    return [];
  }
}

/**
 * Saves all document projects to LocalStorage
 */
export function saveProjects(projects: DocumentProject[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('LocalStorage save projects error:', e);
  }
}

/**
 * Saves or updates a single project
 */
export function saveSingleProject(project: DocumentProject) {
  const projects = getSavedProjects();
  const index = projects.findIndex((p) => p.id === project.id);
  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.unshift(project);
  }
  saveProjects(projects);
}

/**
 * Deletes a project by ID
 */
export function deleteProject(id: string) {
  const projects = getSavedProjects().filter((p) => p.id !== id);
  saveProjects(projects);
}

/**
 * Loads folders
 */
export function getSavedFolders(): DocumentFolder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FOLDERS);
    if (!raw) {
      const defaultFolders: DocumentFolder[] = [
        { id: 'f_invoices', name: 'Invoices & Receipts', createdAt: Date.now() - 86400000 * 2, color: '#3b82f6' },
        { id: 'f_work', name: 'Contracts & Work', createdAt: Date.now() - 86400000 * 5, color: '#10b981' },
        { id: 'f_personal', name: 'Personal ID & Passports', createdAt: Date.now() - 86400000 * 10, color: '#f59e0b' },
      ];
      saveFolders(defaultFolders);
      return defaultFolders;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveFolders(folders: DocumentFolder[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
  } catch (e) {
    console.error('Save folders error:', e);
  }
}

/**
 * Loads app settings
 */
export function getAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(settings: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Save app settings error:', e);
  }
}

/**
 * Clears stored document cache
 */
export function clearAllAppData() {
  localStorage.removeItem(STORAGE_KEYS.PROJECTS);
  localStorage.removeItem(STORAGE_KEYS.FOLDERS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
}
