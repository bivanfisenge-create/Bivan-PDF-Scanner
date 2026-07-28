import { DocumentProject } from '../types';

/**
 * Creates realistic sample documents on canvas to pre-populate "My Documents"
 */
export function generateSampleDocuments(): DocumentProject[] {
  const invoiceDataUrl = drawInvoiceCanvas();
  const contractDataUrl = drawContractCanvas();
  const passportDataUrl = drawPassportCanvas();

  const sample1: DocumentProject = {
    id: 'doc_invoice_sample_1',
    title: 'Tax Invoice & Receipt #4829',
    createdAt: Date.now() - 3600000 * 4,
    updatedAt: Date.now() - 3600000 * 4,
    folderId: 'f_invoices',
    isFavorite: true,
    preset: 'Receipt',
    pageSize: 'A4',
    pdfQuality: 'high',
    margin: 'small',
    fileSizeBytes: 245000,
    pages: [
      {
        id: 'p_inv_1',
        originalImageDataUrl: invoiceDataUrl,
        processedImageDataUrl: invoiceDataUrl,
        rotation: 0,
        filter: 'auto',
        width: 800,
        height: 1100,
        filterSettings: { brightness: 0, contrast: 10, sharpness: 10, threshold: 128 },
        ocrText: `GLOBAL SERVICES CORP - INVOICE
Invoice No: INV-2026-4829
Date: July 28, 2026

Billed To:
Acme Technologies Inc.
100 Silicon Valley Way

DESCRIPTION                       QTY    AMOUNT
------------------------------------------------
1. Cloud Infrastructure Audit      1     $1,250.00
2. Enterprise Security Scan        1     $  850.00
3. System Integration Support      5 hrs $  625.00

------------------------------------------------
Subtotal:                                $2,725.00
Tax (8%):                                $  218.00
TOTAL DUE:                               $2,943.00

Payment Terms: Net 30 Days
Thank you for your business!`,
      },
    ],
  };

  const sample2: DocumentProject = {
    id: 'doc_contract_sample_2',
    title: 'Consulting Service Agreement',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    folderId: 'f_work',
    isFavorite: false,
    preset: 'A4',
    pageSize: 'A4',
    pdfQuality: 'high',
    margin: 'none',
    fileSizeBytes: 520000,
    pages: [
      {
        id: 'p_con_1',
        originalImageDataUrl: contractDataUrl,
        processedImageDataUrl: contractDataUrl,
        rotation: 0,
        filter: 'bw',
        width: 800,
        height: 1100,
        filterSettings: { brightness: 5, contrast: 15, sharpness: 20, threshold: 130 },
        ocrText: `MASTER SERVICES AGREEMENT

This Master Services Agreement ("Agreement") is entered into as of July 15, 2026, by and between Apex Dynamics LLC ("Company") and Vanguard Software Solutions ("Client").

1. SERVICES AND WORK ORDERS
Company shall perform the software development and document digitization services specified in applicable Statement of Work ("SOW").

2. CONFIDENTIALITY AND DATA PROTECTION
Each party agrees to maintain strict confidentiality regarding all non-public technical and financial data exchanged during the engagement. All data processed locally shall remain offline.

3. TERM AND TERMINATION
This Agreement shall commence on the Effective Date and continue for a period of twelve (12) months unless terminated earlier in accordance with Section 4.

IN WITNESS WHEREOF, the parties hereto have executed this Agreement.

Client Signature: J. Vance          Company Signature: E. Miller
Date: July 15, 2026                  Date: July 15, 2026`,
      },
    ],
  };

  const sample3: DocumentProject = {
    id: 'doc_passport_sample_3',
    title: 'Travel Passport & Visa ID',
    createdAt: Date.now() - 86400000 * 6,
    updatedAt: Date.now() - 86400000 * 6,
    folderId: 'f_personal',
    isFavorite: true,
    preset: 'Passport',
    pageSize: 'A4',
    pdfQuality: 'high',
    margin: 'medium',
    fileSizeBytes: 310000,
    pages: [
      {
        id: 'p_pas_1',
        originalImageDataUrl: passportDataUrl,
        processedImageDataUrl: passportDataUrl,
        rotation: 0,
        filter: 'color',
        width: 800,
        height: 550,
        filterSettings: { brightness: 0, contrast: 5, sharpness: 5, threshold: 128 },
        ocrText: `PASSPORT / PASSEPORT
Type: P   Country Code: USA   Passport No: 982104912
Surname: MORGAN
Given Names: ALEXANDRA JANE
Nationality: UNITED STATES OF AMERICA
Date of Birth: 14 APR 1994
Sex: F   Place of Birth: CALIFORNIA, U.S.A.
Date of Issue: 10 MAY 2022   Date of Expiry: 09 MAY 2032
Issuing Authority: UNITED STATES DEPARTMENT OF STATE

P<USAMORGAN<<ALEXANDRA<JANE<<<<<<<<<<<<<<<<<<
9821049122USA9404141F3205090<<<<<<<<<<<<<<04`,
      },
    ],
  };

  return [sample1, sample2, sample3];
}

/**
 * Draws realistic invoice image on HTML Canvas
 */
function drawInvoiceCanvas(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1100;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Crisp document background with slight paper texture tint
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 800, 1100);

  // Border frame
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 760, 1060);

  // Header band
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(50, 60, 700, 90);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('GLOBAL SERVICES CORP', 80, 115);
  ctx.font = '16px sans-serif';
  ctx.fillText('Official Tax Invoice & Payment Receipt', 80, 138);

  // Invoice Meta
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('Invoice #: INV-2026-4829', 520, 185);
  ctx.font = '15px sans-serif';
  ctx.fillText('Date: July 28, 2026', 520, 210);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('BILLED TO:', 70, 200);
  ctx.font = '15px sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('Acme Technologies Inc.', 70, 222);
  ctx.fillText('100 Silicon Valley Way, Suite 400', 70, 242);

  // Table header
  ctx.fillStyle = '#334155';
  ctx.fillRect(50, 290, 700, 40);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('DESCRIPTION', 70, 315);
  ctx.fillText('QTY', 480, 315);
  ctx.fillText('RATE', 560, 315);
  ctx.fillText('AMOUNT', 670, 315);

  // Table rows
  const items = [
    { desc: '1. Cloud Infrastructure Security Audit', qty: '1', rate: '$1,250.00', amt: '$1,250.00' },
    { desc: '2. Local Automated Edge Detection Module', qty: '1', rate: '$850.00', amt: '$850.00' },
    { desc: '3. Offline OCR & PDF Compression Engine', qty: '5 hrs', rate: '$125.00', amt: '$625.00' },
  ];

  let y = 370;
  ctx.fillStyle = '#1e293b';
  ctx.font = '15px sans-serif';
  items.forEach((item, idx) => {
    ctx.fillText(item.desc, 70, y);
    ctx.fillText(item.qty, 485, y);
    ctx.fillText(item.rate, 560, y);
    ctx.fillText(item.amt, 670, y);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, y + 15);
    ctx.lineTo(750, y + 15);
    ctx.stroke();

    y += 50;
  });

  // Totals box
  y += 20;
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(450, y, 300, 130);
  ctx.strokeStyle = '#cbd5e1';
  ctx.strokeRect(450, y, 300, 130);

  ctx.fillStyle = '#334155';
  ctx.font = '15px sans-serif';
  ctx.fillText('Subtotal:', 470, y + 30);
  ctx.fillText('$2,725.00', 660, y + 30);

  ctx.fillText('Tax (8%):', 470, y + 60);
  ctx.fillText('$218.00', 660, y + 60);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('TOTAL DUE:', 470, y + 100);
  ctx.fillText('$2,943.00', 650, y + 100);

  // Stamp
  ctx.save();
  ctx.translate(220, y + 50);
  ctx.rotate(-0.15);
  ctx.strokeStyle = '#16a34a';
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, 160, 50);
  ctx.fillStyle = '#16a34a';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('PAID IN FULL', 10, 34);
  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.92);
}

function drawContractCanvas(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1100;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 800, 1100);

  ctx.fillStyle = '#09090b';
  ctx.font = 'bold 26px serif';
  ctx.fillText('MASTER SERVICES AGREEMENT', 200, 100);

  ctx.font = '16px serif';
  ctx.fillStyle = '#27272a';
  
  const paragraph1 = 'This Master Services Agreement ("Agreement") is entered into as of July 15, 2026, by and between Apex Dynamics LLC ("Company") and Vanguard Software Solutions ("Client").';
  ctx.fillText(paragraph1.slice(0, 70), 80, 160);
  ctx.fillText(paragraph1.slice(70), 80, 185);

  ctx.font = 'bold 18px serif';
  ctx.fillText('1. SERVICES AND WORK ORDERS', 80, 240);
  ctx.font = '15px serif';
  ctx.fillText('Company shall perform software development, high-speed document scanning,', 80, 270);
  ctx.fillText('edge-detection perspective correction, and OCR extraction services.', 80, 295);

  ctx.font = 'bold 18px serif';
  ctx.fillText('2. PRIVACY & SECURITY GUARANTEE', 80, 350);
  ctx.font = '15px serif';
  ctx.fillText('All scanned documents, images, and text extractions are processed strictly on', 80, 380);
  ctx.fillText('the client device. No server uploads or tracking are conducted.', 80, 405);

  ctx.font = 'bold 18px serif';
  ctx.fillText('3. TERM AND TERMINATION', 80, 460);
  ctx.font = '15px serif';
  ctx.fillText('This Agreement shall commence on the Effective Date and continue until', 80, 490);
  ctx.fillText('terminated by either party upon thirty (30) days written notice.', 80, 515);

  // Signatures
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 750);
  ctx.lineTo(340, 750);
  ctx.moveTo(460, 750);
  ctx.lineTo(720, 750);
  ctx.stroke();

  // Cursive signature simulation
  ctx.font = 'italic 24px cursive';
  ctx.fillStyle = '#1e3a8a';
  ctx.fillText('J. Vance', 120, 740);
  ctx.fillText('E. Miller', 500, 740);

  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#52525b';
  ctx.fillText('Client Signature & Date', 80, 775);
  ctx.fillText('Company Representative & Date', 460, 775);

  return canvas.toDataURL('image/jpeg', 0.92);
}

function drawPassportCanvas(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 550;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Passport card background
  ctx.fillStyle = '#eff6ff';
  ctx.fillRect(0, 0, 800, 550);

  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(30, 30, 740, 70);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('PASSPORT / PASSEPORT', 60, 72);
  ctx.font = '14px sans-serif';
  ctx.fillText('UNITED STATES OF AMERICA', 500, 72);

  // Photo Box
  ctx.fillStyle = '#dbeafe';
  ctx.fillRect(60, 130, 180, 230);
  ctx.strokeStyle = '#3b82f6';
  ctx.strokeRect(60, 130, 180, 230);

  // Avatar Icon Silhouette
  ctx.fillStyle = '#93c5fd';
  ctx.beginPath();
  ctx.arc(150, 200, 45, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(150, 320, 70, Math.PI, 0);
  ctx.fill();

  // Passport Fields
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('SURNAME / NOM', 270, 145);
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('MORGAN', 270, 168);

  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('GIVEN NAMES / PRENOMS', 270, 200);
  ctx.font = 'bold 17px sans-serif';
  ctx.fillText('ALEXANDRA JANE', 270, 222);

  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('NATIONALITY', 270, 255);
  ctx.font = '16px sans-serif';
  ctx.fillText('UNITED STATES OF AMERICA', 270, 275);

  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('DATE OF BIRTH', 270, 310);
  ctx.font = '16px sans-serif';
  ctx.fillText('14 APR 1994', 270, 330);

  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('PASSPORT NO.', 540, 145);
  ctx.font = 'bold 18px sans-serif';
  ctx.fillStyle = '#dc2626';
  ctx.fillText('982104912', 540, 168);

  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('EXPIRY DATE', 540, 310);
  ctx.font = '16px sans-serif';
  ctx.fillText('09 MAY 2032', 540, 330);

  // MRZ Zone (Machine Readable Zone)
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(30, 390, 740, 120);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('P<USAMORGAN<<ALEXANDRA<JANE<<<<<<<<<<<<<<<<<<', 50, 435);
  ctx.fillText('9821049122USA9404141F3205090<<<<<<<<<<<<<<04', 50, 480);

  return canvas.toDataURL('image/jpeg', 0.92);
}
