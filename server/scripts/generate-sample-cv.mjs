/**
 * Generates a valid one-page PDF (correct xref offsets) so the site has a
 * working demo CV out of the box. Output: server/uploads/cv/sample-cv.pdf
 *
 *   node scripts/generate-sample-cv.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'uploads', 'cv');
const OUT = path.join(OUT_DIR, 'sample-cv.pdf');

const esc = (s) => s.replace(/([\\()])/g, '\\$1');

const lines = [
  ['H1', 'ALEX MERCER — VIDEO EDITOR & MOTION DESIGNER'],
  ['SUB', 'Short-form retention · Long-form storytelling · VFX & motion graphics'],
  ['H2', 'EXPERIENCE'],
  ['TXT', 'Freelance Video Editor (2023 - Present)'],
  ['TXT', '  350+ delivered edits for creators, agencies and brands.'],
  ['TXT', '  Retention-driven short-form: hooks, pacing, captions, sound design.'],
  ['TXT', 'Motion Graphics & VFX Editor (2024 - Present)'],
  ['TXT', '  Automated title/lower-third template systems (-60% production time).'],
  ['TXT', '  Tracking, clean-up, screen comps and particle work for branded content.'],
  ['H2', 'SOFTWARE'],
  ['TXT', 'Adobe Premiere Pro (expert) · CapCut (expert) · After Effects (advanced)'],
  ['TXT', 'DaVinci Resolve (intermediate) · Photoshop (advanced) · Audition (intermediate)'],
  ['H2', 'SELECTED RESULTS'],
  ['TXT', '12M+ views generated · 350+ projects edited · +42% average retention lift'],
  ['H2', 'WORKFLOW'],
  ['TXT', 'Brief & alignment > Assembly cut > Story/retention pass > Polish > Delivery'],
  ['H2', 'CONTACT'],
  ['TXT', 'hello@yourdomain.com · Remote (EU / US time zones)'],
];

let y = 780;
const content = lines
  .map(([kind, text]) => {
    const size = kind === 'H1' ? 17 : kind === 'SUB' ? 10.5 : kind === 'H2' ? 12.5 : 10.5;
    const font = kind === 'H1' || kind === 'H2' ? '/F2' : '/F1';
    const color = kind === 'H1' || kind === 'H2' ? '0.086 0.522 0.243' : '0.15 0.17 0.21';
    const gap = kind === 'H1' ? 34 : kind === 'SUB' ? 30 : kind === 'H2' ? 26 : 15;
    y -= gap;
    const block = `BT ${font} ${size} Tf ${color} rg 56 ${y} Td (${esc(text)}) Tj ET`;
    if (kind === 'H1' || kind === 'H2') {
      const rule = `0.13 0.77 0.37 RG 1 w 56 ${y - 5} m 539 ${y - 5} l S`;
      return `${block}\n${rule}`;
    }
    return block;
  })
  .join('\n');

const stream = `0.97 0.98 0.99 rg 40 40 515 800 re f\n${content}`;

const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
  `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`,
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
];

let pdf = '%PDF-1.4\n';
const offsets = [];
objects.forEach((obj, i) => {
  offsets.push(Buffer.byteLength(pdf, "latin1"));
  pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
});

const xrefStart = Buffer.byteLength(pdf, "latin1");
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
offsets.forEach((o) => {
  pdf += `${String(o).padStart(10, '0')} 00000 n \n`;
});
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, Buffer.from(pdf, 'latin1'));
console.log(`wrote ${OUT} (${Buffer.byteLength(pdf, "latin1")} bytes)`);
