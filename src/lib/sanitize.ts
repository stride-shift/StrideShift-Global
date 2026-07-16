import DOMPurify from 'dompurify';

/**
 * Sanitize HTML before it reaches dangerouslySetInnerHTML. Today the inputs
 * are developer/admin-controlled (solution titles with <em>/<br> markup), but
 * sanitizing at the sink means a future move to user-editable content can't
 * introduce stored XSS.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}
