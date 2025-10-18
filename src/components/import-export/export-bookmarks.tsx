'use client';

import { useState } from 'react';
import { Download, Loader2, FileJson, FileSpreadsheet, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';

type ExportFormat = 'json' | 'csv' | 'html' | 'netscape_bookmark';

const formatOptions = [
  {
    value: 'json' as const,
    label: 'JSON',
    description: 'Structured data format',
    icon: FileJson,
  },
  {
    value: 'csv' as const,
    label: 'CSV',
    description: 'For Excel and spreadsheets',
    icon: FileSpreadsheet,
  },
  {
    value: 'html' as const,
    label: 'HTML (Netscape)',
    description: 'For browser import',
    icon: FileCode,
  },
];

export function ExportBookmarks() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Export options
  const [format, setFormat] = useState<ExportFormat>('json');
  const [includeTags, setIncludeTags] = useState(true);
  const [includeCollections, setIncludeCollections] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);

  const handleExport = async () => {
    setExporting(true);
    setError(null);

    try {
      const response = await fetch('/api/export/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          include_tags: includeTags,
          include_collections: includeCollections,
          include_metadata: includeMetadata,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Export işlemi başarısız oldu');
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch
        ? filenameMatch[1]
        : `bookmarks-${new Date().toISOString().split('T')[0]}.${format}`;

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="overflow-hidden border-none shadow-xl ring-1 ring-black/5">
      <CardHeader className="space-y-3 border-b border-border/60 bg-background/95 px-6 py-6">
        <CardTitle className="text-2xl font-semibold text-foreground">Export your library</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Create a fresh backup or move your bookmarks elsewhere. Choose the format that fits your
          workflow.
        </CardDescription>
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          <Download className="h-3 w-3" />
          One-click export
        </div>
      </CardHeader>
      <CardContent className="space-y-8 p-8">
        {/* Format Selection */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Export format
            </Label>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick how you’d like to use the exported data. You can re-run exports anytime.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {formatOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.value}
                  className={`
                    relative flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer
                    transition-all
                    ${format === option.value ? 'border-primary bg-primary/10 shadow-md' : 'border-border bg-background/80 hover:border-primary/50'}
                  `}
                  onClick={() => setFormat(option.value)}
                >
                  <input
                    type="radio"
                    name="format"
                    value={option.value}
                    checked={format === option.value}
                    onChange={() => setFormat(option.value)}
                    className="sr-only"
                  />
                  <Icon className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  {format === option.value && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Export Options */}
        <div className="grid gap-4 border-t pt-6 md:grid-cols-2">
          <div className="flex items-start justify-between gap-4 rounded-xl border bg-background/80 p-4 shadow-sm">
            <div>
              <Label htmlFor="include-tags" className="font-semibold">
                Include tags
              </Label>
              <p className="mt-1 text-sm text-muted-foreground">
                Attach associated tags so exports keep your taxonomy.
              </p>
            </div>
            <Switch
              id="include-tags"
              checked={includeTags}
              onCheckedChange={setIncludeTags}
              disabled={exporting || format === 'csv'}
            />
          </div>

          <div className="flex items-start justify-between gap-4 rounded-xl border bg-background/80 p-4 shadow-sm">
            <div>
              <Label htmlFor="include-collections" className="font-semibold">
                Include collections
              </Label>
              <p className="mt-1 text-sm text-muted-foreground">
                Keep collection relationships for easier re-importing.
              </p>
            </div>
            <Switch
              id="include-collections"
              checked={includeCollections}
              onCheckedChange={setIncludeCollections}
              disabled={exporting}
            />
          </div>

          {format === 'json' && (
            <div className="flex items-start justify-between gap-4 rounded-xl border bg-background/80 p-4 shadow-sm md:col-span-2">
              <div>
                <Label htmlFor="include-metadata" className="font-semibold">
                  Include metadata
                </Label>
                <p className="mt-1 text-sm text-muted-foreground">
                  Embed export timestamp and version details for audit trails.
                </p>
              </div>
              <Switch
                id="include-metadata"
                checked={includeMetadata}
                onCheckedChange={setIncludeMetadata}
                disabled={exporting}
              />
            </div>
          )}
        </div>

        {/* Format Info */}
        <Alert className="border-dashed">
          <AlertDescription className="text-sm">
            {format === 'json' && (
              <>
                <strong>JSON format:</strong> Includes all data in structured format. Ideal for backup
                and data analysis.
              </>
            )}
            {format === 'csv' && (
              <>
                <strong>CSV format:</strong> Can be opened in Excel and Google Sheets. Suitable for simple data
                analysis.
              </>
            )}
            {format === 'html' && (
              <>
                <strong>HTML format:</strong> Can be imported directly into Chrome, Firefox, Safari, and Edge. Use
                Netscape Bookmark Format.
              </>
            )}
          </AlertDescription>
        </Alert>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Export Button */}
        <Button onClick={handleExport} disabled={exporting} className="w-full" size="lg">
          {exporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Bookmarks
            </>
          )}
        </Button>

        {/* Info Text */}
        <p className="text-xs text-center text-muted-foreground">
          File will be downloaded automatically
        </p>
      </CardContent>
    </Card>
  );
}
