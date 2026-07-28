import { jsPDF } from 'jspdf';
import { DocumentProject, PageSize, PDFMargin, PDFQuality } from '../types';

/**
 * Generates a PDF file from a DocumentProject and returns a Blob and Data URL.
 */
export async function generatePDF(project: DocumentProject): Promise<{ blob: Blob; dataUrl: string }> {
  const pageSize: PageSize = project.pageSize || 'A4';
  const quality: PDFQuality = project.pdfQuality || 'high';
  const margin: PDFMargin = project.margin || 'none';

  // Determine jsPDF format string
  let jsPdfFormat: string | [number, number] = 'a4';
  if (pageSize === 'Letter') jsPdfFormat = 'letter';
  if (pageSize === 'Legal') jsPdfFormat = 'legal';

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: jsPdfFormat,
    compress: quality === 'small',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Determine margins in points
  let marginPt = 0;
  if (margin === 'small') marginPt = 14; // ~5mm
  if (margin === 'medium') marginPt = 28; // ~10mm

  const drawWidth = pageWidth - marginPt * 2;
  const drawHeight = pageHeight - marginPt * 2;

  // Determine image JPEG compression ratio
  let jpegQuality = 0.92;
  if (quality === 'medium') jpegQuality = 0.75;
  if (quality === 'small') jpegQuality = 0.5;

  for (let i = 0; i < project.pages.length; i++) {
    const page = project.pages[i];
    if (i > 0) {
      doc.addPage(jsPdfFormat, 'portrait');
    }

    const imgDataUrl = page.processedImageDataUrl || page.originalImageDataUrl;

    // Load image to get original aspect ratio
    const imgObj = await loadImage(imgDataUrl);
    let renderWidth = drawWidth;
    let renderHeight = (imgObj.height * renderWidth) / imgObj.width;

    if (renderHeight > drawHeight) {
      renderHeight = drawHeight;
      renderWidth = (imgObj.width * renderHeight) / imgObj.height;
    }

    const posX = marginPt + (drawWidth - renderWidth) / 2;
    const posY = marginPt + (drawHeight - renderHeight) / 2;

    doc.addImage(
      imgDataUrl,
      'JPEG',
      posX,
      posY,
      renderWidth,
      renderHeight,
      `img_${i}`,
      quality === 'small' ? 'FAST' : 'SLOW'
    );

    // If page has OCR text, embed invisible text layer for PDF text searchability
    if (page.ocrText && page.ocrText.trim().length > 0) {
      doc.setTextColor(255, 255, 255); // Invisible text layer over image
      doc.setFontSize(8);
      const lines = doc.splitTextToSize(page.ocrText, drawWidth);
      let lineY = posY + 12;
      for (const line of lines.slice(0, 40)) {
        if (lineY < posY + renderHeight - 10) {
          doc.text(line, posX + 5, lineY);
          lineY += 10;
        }
      }
    }
  }

  // Set Document Title Metadata
  doc.setProperties({
    title: project.title || 'Scanned Document',
    subject: 'PDF Scanner Export',
    author: 'PDF Scanner Mobile',
    keywords: 'scan, pdf, document, ocr',
    creator: 'PDF Scanner Client Engine',
  });

  const pdfArrayBuffer = doc.output('arraybuffer');
  const blob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
  const dataUrl = doc.output('dataurlstring');

  return { blob, dataUrl };
}

/**
 * Downloads a document as a PDF file
 */
export async function downloadPDF(project: DocumentProject): Promise<number> {
  const { blob } = await generatePDF(project);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFilename(project.title)}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return blob.size;
}

/**
 * Downloads a page or document as JPG images
 */
export async function downloadImage(project: DocumentProject, pageIndex: number = 0, format: 'jpg' | 'png' = 'jpg') {
  const page = project.pages[pageIndex] || project.pages[0];
  if (!page) return;

  const a = document.createElement('a');
  a.href = page.processedImageDataUrl || page.originalImageDataUrl;
  a.download = `${sanitizeFilename(project.title)}_page_${pageIndex + 1}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Exports extracted OCR text as a TXT file
 */
export function downloadText(project: DocumentProject) {
  const fullText = project.pages
    .map((p, idx) => `=== PAGE ${idx + 1} ===\n\n${p.ocrText || '(No OCR text extracted)'}\n\n`)
    .join('\n');

  const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFilename(project.title)}_text.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50) || 'Scanned_Document';
}
