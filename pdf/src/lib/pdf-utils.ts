import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

async function getPdfjs() {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf/pdf.worker.min.mjs';
  return pdfjsLib;
}

/** PDF 병합 */
export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  return mergedPdf.save();
}

/** PDF → 이미지 변환 */
export async function pdfToImages(
  file: File,
  format: 'png' | 'jpeg' = 'png',
  scale: number = 2
): Promise<{ blob: Blob; name: string }[]> {
  const pdfjsLib = await getPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const results: { blob: Blob; name: string }[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext('2d')!;
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (b) => resolve(b!),
        format === 'png' ? 'image/png' : 'image/jpeg',
        0.95
      );
    });

    const ext = format === 'png' ? 'png' : 'jpg';
    const baseName = file.name.replace('.pdf', '');
    results.push({ blob, name: `${baseName}_page${i}.${ext}` });
  }

  return results;
}

/** 이미지 → PDF 변환 */
export async function imagesToPDF(files: File[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    let image;

    if (file.type === 'image/png') {
      image = await pdfDoc.embedPng(arrayBuffer);
    } else {
      image = await pdfDoc.embedJpg(arrayBuffer);
    }

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  return pdfDoc.save();
}

/** PDF 분할 */
export async function splitPDF(
  file: File,
  pageRanges: string
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer);
  const totalPages = sourcePdf.getPageCount();

  const indices = parsePageRanges(pageRanges, totalPages);
  if (indices.length === 0) throw new Error('유효한 페이지 범위를 입력해주세요');

  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(sourcePdf, indices);
  pages.forEach((page) => newPdf.addPage(page));

  return newPdf.save();
}

/** 페이지 범위 파싱: "1-3, 5, 7-9" → [0, 1, 2, 4, 6, 7, 8] */
function parsePageRanges(input: string, totalPages: number): number[] {
  const indices: Set<number> = new Set();
  const parts = input.split(',').map((s) => s.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (isNaN(start) || isNaN(end)) continue;
      for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
        indices.add(i - 1);
      }
    } else {
      const page = parseInt(part, 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        indices.add(page - 1);
      }
    }
  }

  return Array.from(indices).sort((a, b) => a - b);
}

/** 다운로드 헬퍼 */
export function downloadBlob(data: Uint8Array | Blob, filename: string) {
  const blob = data instanceof Blob ? data : new Blob([data as unknown as BlobPart], { type: 'application/pdf' });
  saveAs(blob, filename);
}

/** 여러 이미지를 ZIP으로 다운로드 */
export async function downloadAsZip(
  images: { blob: Blob; name: string }[],
  zipName: string
) {
  const zip = new JSZip();
  images.forEach(({ blob, name }) => zip.file(name, blob));
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, zipName);
}

/** PDF → Excel 변환 (텍스트 기반 표 추출) */
export async function pdfToExcel(file: File): Promise<Blob> {
  const pdfjsLib = await getPdfjs();
  const XLSX = await import('xlsx');
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const workbook = XLSX.utils.book_new();

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // 텍스트 아이템을 Y좌표로 그룹화하여 행 구성
    const rows: Map<number, { x: number; text: string }[]> = new Map();
    for (const item of textContent.items) {
      if (!('str' in item) || !item.str.trim()) continue;
      const y = Math.round(item.transform[5]); // Y 좌표 반올림
      if (!rows.has(y)) rows.set(y, []);
      rows.get(y)!.push({ x: item.transform[4], text: item.str });
    }

    // Y좌표 내림차순 정렬 (PDF는 아래에서 위로), 각 행은 X좌표 오름차순
    const sortedRows = Array.from(rows.entries())
      .sort(([a], [b]) => b - a)
      .map(([, cells]) =>
        cells.sort((a, b) => a.x - b.x).map((c) => c.text)
      );

    if (sortedRows.length === 0) {
      sortedRows.push(['(빈 페이지)']);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(sortedRows);
    XLSX.utils.book_append_sheet(workbook, worksheet, `Page ${i}`);
  }

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/** PDF 페이지 수 가져오기 */
export async function getPDFPageCount(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  return pdf.getPageCount();
}
