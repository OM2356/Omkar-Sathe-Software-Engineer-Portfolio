import type { PortfolioDataBundle } from '../types/portfolio';
import { SKILL_CATEGORIES } from '../data/defaultPortfolio';

function sanitizePdfText(input: string): string {
  return input
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\s+/g, ' ')
    .trim();
}

function wrapText(text: string, maxChars: number): string[] {
  const words = sanitizePdfText(text).split(' ');
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    if (!w) continue;
    if ((current + ' ' + w).trim().length > maxChars) {
      if (current) lines.push(current);
      current = w;
    } else {
      current = (current + ' ' + w).trim();
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Builds a standards-compliant, multi-page PDF document directly in browser memory
 * from live portfolio data so recruiters always get an accurate downloadable PDF
 * even before a custom PDF file is uploaded in Admin.
 */
export function generatePortfolioResumePdf(data: PortfolioDataBundle): Blob {
  const { profile, education, skills, projects, experiences, certifications, achievements } = data;

  type LineItem = { text: string; size: number; bold?: boolean; gapBefore?: number };
  const rows: LineItem[] = [];

  rows.push({ text: profile.name.toUpperCase(), size: 18, bold: true });
  rows.push({ text: `${profile.title} | ${profile.educationSummary}`, size: 11, bold: true, gapBefore: 4 });
  rows.push({
    text: [profile.location, profile.email, profile.githubUrl || 'GitHub: Editable in Portfolio', profile.linkedinUrl || 'LinkedIn: Editable in Portfolio']
      .filter(Boolean)
      .join('  |  '),
    size: 9,
    gapBefore: 3,
  });

  rows.push({ text: 'PROFESSIONAL SUMMARY', size: 11, bold: true, gapBefore: 14 });
  wrapText(profile.bio, 92).forEach((l) => rows.push({ text: l, size: 9.5 }));
  wrapText(`Career Goal: ${profile.careerGoal}`, 92).forEach((l) => rows.push({ text: l, size: 9.5 }));

  rows.push({ text: 'EDUCATION', size: 11, bold: true, gapBefore: 12 });
  education.forEach((edu) => {
    rows.push({ text: `${edu.degree} (${edu.period})`, size: 10, bold: true, gapBefore: 4 });
    rows.push({ text: `${edu.institution} - ${edu.location}`, size: 9.5 });
    if (edu.coursework.length > 0) {
      wrapText(`Coursework: ${edu.coursework.join(', ')}`, 92).forEach((l) => rows.push({ text: l, size: 9 }));
    }
  });

  rows.push({ text: 'TECHNICAL SKILLS', size: 11, bold: true, gapBefore: 12 });
  SKILL_CATEGORIES.forEach((cat) => {
    const items = skills.filter((s) => s.category === cat).map((s) => s.name);
    if (items.length > 0) {
      wrapText(`${cat}: ${items.join(', ')}`, 92).forEach((l) => rows.push({ text: l, size: 9.5 }));
    }
  });

  rows.push({ text: 'PROJECTS', size: 11, bold: true, gapBefore: 12 });
  projects.forEach((proj) => {
    rows.push({ text: `${proj.title} [${proj.technologies.join(', ')}]`, size: 10, bold: true, gapBefore: 5 });
    wrapText(proj.description, 92).forEach((l) => rows.push({ text: l, size: 9.5 }));
    if (proj.liveUrl) {
      rows.push({ text: `Live Demo: ${proj.liveUrl}`, size: 9 });
    }
  });

  rows.push({ text: 'EXPERIENCE & ENGINEERING TRACKS', size: 11, bold: true, gapBefore: 12 });
  experiences.forEach((exp) => {
    rows.push({ text: `${exp.role} - ${exp.organization} (${exp.period})`, size: 10, bold: true, gapBefore: 4 });
    wrapText(exp.description, 92).forEach((l) => rows.push({ text: l, size: 9.5 }));
  });

  rows.push({ text: 'CERTIFICATIONS & ACHIEVEMENTS', size: 11, bold: true, gapBefore: 12 });
  certifications.forEach((cert) => {
    rows.push({ text: `Certification: ${cert.title} - ${cert.issuer} (${cert.issueDate})`, size: 9.5, gapBefore: 3 });
  });
  achievements.forEach((ach) => {
    wrapText(`Achievement (${ach.category}): ${ach.title} - ${ach.description}`, 92).forEach((l) =>
      rows.push({ text: l, size: 9.5 }),
    );
  });

  // Paginate into PDF content streams (Letter 612 x 792)
  const pages: string[][] = [[]];
  let y = 748;
  for (const row of rows) {
    const step = row.size + 4 + (row.gapBefore || 0);
    if (y - step < 48) {
      pages.push([]);
      y = 748;
    }
    y -= row.gapBefore || 0;
    const fontKey = row.bold ? '/F2' : '/F1';
    const lineCmd = `BT ${fontKey} ${row.size} Tf 48 ${y.toFixed(1)} Td (${sanitizePdfText(row.text)}) Tj ET`;
    pages[pages.length - 1].push(lineCmd);
    y -= row.size + 4;
  }

  // Assemble valid PDF objects
  const objects: string[] = [];
  const pageObjIds: number[] = [];

  // 1: Catalog, 2: Pages, 3: Font Helvetica, 4: Font Helvetica-Bold
  objects.push('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj');
  objects.push(''); // placeholder for 2 0 obj
  objects.push('3 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj');
  objects.push('4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj');

  let nextId = 5;
  for (const pageLines of pages) {
    const contentStream = pageLines.join('\n');
    const contentId = nextId++;
    const pageId = nextId++;
    objects.push(
      `${contentId} 0 obj << /Length ${contentStream.length} >> stream\n${contentStream}\nendstream endobj`,
    );
    objects.push(
      `${pageId} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >> endobj`,
    );
    pageObjIds.push(pageId);
  }

  objects[1] = `2 0 obj << /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageObjIds.length} >> endobj`;

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj + '\n';
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

export function triggerResumeDownload(data: PortfolioDataBundle): void {
  if (data.resumeMeta.fileUrl) {
    const link = document.createElement('a');
    link.href = data.resumeMeta.fileUrl;
    link.download = data.resumeMeta.fileName || 'Omkar_Sathe_Resume.pdf';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  const blob = generatePortfolioResumePdf(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Omkar_Sathe_Resume.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
