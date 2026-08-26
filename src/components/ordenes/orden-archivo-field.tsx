'use client';

import { useRef, useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  ImageIcon,
  Paperclip,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const ACCEPT = '.pdf,.xlsx,.xls,image/*';

type OrdenArchivoFieldProps = {
  id: string;
  file: File | null;
  archivoPath?: string | null;
  onFileChange: (file: File | null) => void;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileNameFromPath(path: string): string {
  const segment = path.split('/').pop() ?? path;
  const dash = segment.indexOf('-');
  return dash >= 0 ? segment.slice(dash + 1) : segment;
}

function fileIconForName(name: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith('.pdf')) return FileText;
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) return FileSpreadsheet;
  if (/\.(jpe?g|png|gif|webp|bmp|svg)$/.test(lower)) return ImageIcon;
  return Paperclip;
}

export function OrdenArchivoField({
  id,
  file,
  archivoPath,
  onFileChange,
}: OrdenArchivoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const savedName = archivoPath ? fileNameFromPath(archivoPath) : null;
  const displayName = file?.name ?? savedName;
  const hasSelection = !!file;
  const hasSaved = !!savedName && !file;
  const DisplayIcon = displayName ? fileIconForName(displayName) : Upload;

  const pickFile = () => inputRef.current?.click();

  const setFile = (next: File | null) => {
    onFileChange(next);
    if (inputRef.current) inputRef.current.value = '';
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pickFile();
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>Documento adjunto</Label>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={onInputChange}
      />

      {displayName ? (
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5',
            hasSelection && 'border-primary/40 bg-primary/5'
          )}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background">
            <DisplayIcon className="size-4 text-muted-foreground" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">
              {hasSelection && file
                ? `${formatFileSize(file.size)} · se sube al guardar`
                : hasSaved
                  ? 'Adjunto actual · elegí otro para reemplazarlo'
                  : null}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {hasSelection ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Quitar archivo seleccionado"
                onClick={() => setFile(null)}
              >
                <X className="size-4" />
              </Button>
            ) : (
              <Button type="button" variant="outline" size="sm" onClick={pickFile}>
                Reemplazar
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label="Elegir documento adjunto"
          onClick={pickFile}
          onKeyDown={onKeyDown}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setDragOver(false);
            }
          }}
          onDrop={onDrop}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center transition-colors',
            'hover:border-primary/50 hover:bg-muted/40',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            dragOver && 'border-primary bg-primary/5'
          )}
        >
          <div className="flex size-10 items-center justify-center rounded-full border bg-background">
            <Upload className="size-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Arrastrá un archivo o hacé clic para elegir
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, Excel o imagen · opcional
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
