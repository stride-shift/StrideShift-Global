import type { BlogBlock } from '@/hooks/useSiteContent';

/**
 * Parse an uploaded document (.txt, .md, .docx, .pdf) into a structured blog
 * post — body blocks, title, excerpt and an estimated reading time.
 * Heavy parsers (mammoth, pdfjs) are dynamically imported so they only load
 * when a file is actually imported.
 */

export interface ImportedBlog {
  title: string;
  excerpt: string;
  body: BlogBlock[];
  readingMinutes: number;
}

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

function readingMinutes(body: BlogBlock[]): number {
  const words = body.reduce(
    (n, b) => n + b.text.split(/\s+/).filter(Boolean).length,
    0
  );
  return Math.max(1, Math.round(words / 200));
}

function makeExcerpt(body: BlogBlock[]): string {
  const firstPara = body.find((b) => b.type === 'p' && b.text.length > 40) || body.find((b) => b.type === 'p');
  const text = firstPara?.text || '';
  if (text.length <= 200) return text;
  return text.slice(0, 200).replace(/\s+\S*$/, '') + '…';
}

/* ---- HTML → blocks (used for .docx) ---- */
function parseHtmlToBlocks(html: string): BlogBlock[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const blocks: BlogBlock[] = [];
  for (const node of Array.from(doc.body.children)) {
    const tag = node.tagName.toLowerCase();
    const text = clean(node.textContent || '');
    if (tag === 'h1' || tag === 'h2') {
      if (text) blocks.push({ type: 'h2', text });
    } else if (/^h[3-6]$/.test(tag)) {
      if (text) blocks.push({ type: 'h3', text });
    } else if (tag === 'blockquote') {
      if (text) blocks.push({ type: 'quote', text });
    } else if (tag === 'ul' || tag === 'ol') {
      for (const li of Array.from(node.querySelectorAll('li'))) {
        const t = clean(li.textContent || '');
        if (t) blocks.push({ type: 'p', text: `• ${t}` });
      }
    } else if (text) {
      blocks.push({ type: 'p', text });
    }
  }
  return blocks;
}

/* ---- plain text / markdown → blocks ---- */
function parseTextToBlocks(text: string): BlogBlock[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: BlogBlock[] = [];
  let para: string[] = [];

  const flush = () => {
    if (!para.length) return;
    const joined = clean(para.join(' '));
    para = [];
    if (!joined) return;
    // A lone short line with no terminal punctuation reads as a heading.
    if (
      joined.length <= 70 &&
      joined.split(' ').length <= 12 &&
      !/[.!?:,;]$/.test(joined)
    ) {
      blocks.push({ type: 'h2', text: joined });
    } else {
      blocks.push({ type: 'p', text: joined });
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    const md = line.match(/^(#{1,6})\s+(.*)/);
    if (md) {
      flush();
      blocks.push({ type: md[1].length <= 2 ? 'h2' : 'h3', text: clean(md[2]) });
      continue;
    }
    if (line.startsWith('>')) {
      flush();
      blocks.push({ type: 'quote', text: clean(line.replace(/^>+\s?/, '')) });
      continue;
    }
    para.push(line);
  }
  flush();
  return blocks;
}

async function extractDocx(file: File): Promise<BlogBlock[]> {
  const mammoth = await import('mammoth/mammoth.browser');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return parseHtmlToBlocks(result.value);
}

async function extractPdf(file: File): Promise<BlogBlock[]> {
  const pdfjs: any = await import('pdfjs-dist');
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const data = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data }).promise;
  let text = '';
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    for (const item of content.items as any[]) {
      text += item.str;
      text += item.hasEOL ? '\n' : ' ';
    }
    text += '\n\n';
  }
  return parseTextToBlocks(text);
}

export async function importBlogFile(file: File): Promise<ImportedBlog> {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  let body: BlogBlock[];

  if (ext === 'docx') {
    body = await extractDocx(file);
  } else if (ext === 'pdf') {
    body = await extractPdf(file);
  } else if (ext === 'txt' || ext === 'md' || ext === 'markdown') {
    body = parseTextToBlocks(await file.text());
  } else if (ext === 'doc') {
    throw new Error('Legacy .doc files are not supported — please save as .docx, .pdf or .txt.');
  } else {
    throw new Error(`Unsupported file type ".${ext}". Use .txt, .md, .docx or .pdf.`);
  }

  body = body.filter((b) => b.text.trim().length > 0);
  if (!body.length) {
    throw new Error('No readable text found in that file.');
  }

  // Title = first heading, else the filename.
  const firstHeading = body.find((b) => b.type === 'h2' || b.type === 'h3');
  const title = firstHeading
    ? firstHeading.text
    : file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();

  // Drop the heading we promoted to the title so it isn't repeated.
  if (firstHeading) body = body.filter((b) => b !== firstHeading);

  return {
    title: title || 'Untitled post',
    excerpt: makeExcerpt(body),
    body: body.length ? body : [{ type: 'p', text: '' }],
    readingMinutes: readingMinutes(body),
  };
}
