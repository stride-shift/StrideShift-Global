import { useRef, useState } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface ImageUploadProps {
  /** Current image URL */
  value: string;
  /** Called with the new URL after a successful upload (or manual paste) */
  onChange: (url: string) => void;
  /** Folder inside the `media` bucket, e.g. 'hero' or 'team' */
  folder?: string;
  label?: string;
  /** Compact variant for inline use (e.g. team rows) */
  compact?: boolean;
}

/**
 * Upload an image from the user's computer to Supabase Storage (`media` bucket)
 * and return the public URL. Also accepts a pasted URL. Falls back to a
 * data-URL preview (browser-only) when Supabase isn't configured.
 */
const ImageUpload = ({ value, onChange, folder = 'uploads', label, compact }: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Image must be under 8 MB.');
      return;
    }

    const supa = getSupabase();
    if (!supa || !isSupabaseConfigured()) {
      // No backend — embed as a data URL so the preview still works locally.
      const reader = new FileReader();
      reader.onload = () => onChange(String(reader.result));
      reader.readAsDataURL(file);
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supa.storage
        .from('media')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (upErr) throw upErr;
      const { data } = supa.storage.from('media').getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (e: any) {
      setError(
        e?.message ||
          'Upload failed. Make sure the `media` storage bucket exists (run supabase/migration.sql).'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={compact ? '' : 'space-y-2'}>
      {label && <span className="text-sm font-medium text-stride-text-strong">{label}</span>}
      <div className="flex items-start gap-3">
        {/* Preview */}
        <div
          className={`${compact ? 'w-16 h-16' : 'w-24 h-24'} rounded-lg border border-stride-border bg-stride-bg bg-cover bg-center flex-shrink-0 relative overflow-hidden`}
          style={{ backgroundImage: value ? `url(${value})` : undefined }}
        >
          {!value && (
            <div className="absolute inset-0 flex items-center justify-center text-stride-text-muted/40">
              <Upload className="w-5 h-5" />
            </div>
          )}
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-stride-navy/80 text-white flex items-center justify-center hover:bg-stride-navy"
              aria-label="Clear image"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex-grow space-y-2 min-w-0">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = '';
            }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-stride-navy text-white text-sm font-medium hover:bg-stride-navy-dark transition-colors disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              {uploading ? 'Uploading…' : 'Upload from computer'}
            </button>
          </div>
          {!compact && (
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="…or paste an image URL"
              className="w-full px-3 py-2 rounded-md border border-stride-border bg-stride-bg-elev text-stride-text-strong focus:outline-none focus:ring-2 focus:ring-stride-accent text-sm"
            />
          )}
          {error && <p className="text-xs text-amber-600 dark:text-amber-400">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
