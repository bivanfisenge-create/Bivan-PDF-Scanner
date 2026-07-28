export type DocumentPreset = 'A4' | 'Letter' | 'Receipt' | 'BusinessCard' | 'Passport';

export type FilterType = 
  | 'original' 
  | 'auto' 
  | 'bw' 
  | 'color' 
  | 'highContrast' 
  | 'grayscale' 
  | 'brighten' 
  | 'sharpen';

export type PageSize = 'A4' | 'Letter' | 'Legal';
export type PDFQuality = 'high' | 'medium' | 'small';
export type PDFMargin = 'none' | 'small' | 'medium';

export interface Point {
  x: number; // Percentage 0-100 or relative coordinate
  y: number;
}

export interface QuadCorners {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
}

export interface ScannedPage {
  id: string;
  originalImageDataUrl: string;
  processedImageDataUrl: string;
  corners?: QuadCorners;
  rotation: number; // 0, 90, 180, 270
  filter: FilterType;
  filterSettings: {
    brightness: number; // -100 to 100
    contrast: number;   // -100 to 100
    sharpness: number;  // 0 to 100
    threshold: number;  // 0 to 255
  };
  ocrText?: string;
  ocrLanguage?: string;
  width: number;
  height: number;
}

export interface DocumentFolder {
  id: string;
  name: string;
  createdAt: number;
  color?: string;
}

export interface DocumentProject {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  folderId?: string;
  isFavorite: boolean;
  pages: ScannedPage[];
  preset: DocumentPreset;
  pageSize: PageSize;
  pdfQuality: PDFQuality;
  margin: PDFMargin;
  isLocked?: boolean;
  passwordHash?: string;
  fileSizeBytes?: number;
}

export interface AppSettings {
  autoCapture: boolean;
  flashDefault: boolean;
  saveOriginalImages: boolean;
  defaultPageSize: PageSize;
  defaultQuality: PDFQuality;
  compressionLevel: number; // 1-10
  theme: 'light' | 'dark' | 'system';
  language: string;
  appPinEnabled: boolean;
  appPinCode?: string;
  useBiometrics: boolean;
  gridLines: boolean;
  hapticFeedback: boolean;
}

export type AppView = 
  | 'home' 
  | 'camera' 
  | 'crop' 
  | 'filter' 
  | 'ocr' 
  | 'studio' 
  | 'myDocs' 
  | 'settings';
