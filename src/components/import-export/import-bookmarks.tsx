'use client';

import { useState } from 'react';
import { Upload, Loader2, CheckCircle2, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImportOnboarding } from './import-onboarding';

interface ImportResult {
  success: boolean;
  message: string;
  parse_result: {
    source_type: string;
    total_count: number;
    parse_errors: Array<{ line: number; error: string }>;
  };
  import_result: {
    progress: {
      total: number;
      processed: number;
      successful: number;
      failed: number;
      skipped: number;
      duplicates: number;
    };
    imported_bookmark_ids: string[];
    created_tag_ids: string[];
    created_collection_ids: string[];
    errors: Array<{ url: string; error: string }>;
  };
}

export function ImportBookmarks() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Import options
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [autoTag, setAutoTag] = useState(true);
  const [preserveFolders, setPreserveFolders] = useState(true);
  const [defaultPrivacy, setDefaultPrivacy] = useState<'public' | 'private' | 'subscribers'>(
    'public'
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.endsWith('.html') && !selectedFile.name.endsWith('.htm')) {
        setError('Please select a valid HTML bookmark file.');
        return;
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size too large. Maximum 10MB.');
        return;
      }

      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setImporting(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append(
        'options',
        JSON.stringify({
          skip_duplicates: skipDuplicates,
          auto_tag: autoTag,
          preserve_folders: preserveFolders,
          default_privacy: defaultPrivacy,
        })
      );

      const response = await fetch('/api/import/bookmarks', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import işlemi başarısız oldu');
      }

      setResult(data);

      // Show onboarding if import was successful
      if (data.success && data.import_result.imported_bookmark_ids.length > 0) {
        setShowOnboarding(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setImporting(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <Card className="overflow-hidden border-none shadow-xl ring-1 ring-black/5">
      <CardHeader className="space-y-3 border-b border-border/60 bg-background/95 px-6 py-6">
        <CardTitle className="text-2xl font-semibold text-foreground">Import bookmarks</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Upload your browser export, clean up titles and privacy, then drop them straight into
          your HitTags library.
        </CardDescription>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-medium uppercase tracking-wide text-primary">
            <Upload className="h-3 w-3" /> HTML support
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-medium uppercase tracking-wide text-primary">
            <CheckCircle2 className="h-3 w-3" /> Duplicate check
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 font-medium uppercase tracking-wide text-primary">
            <span className="flex h-2.5 w-2.5 items-center justify-center">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
            Guided setup
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-10 p-8">
        {/* File Upload */}
        {!result && (
          <div className="space-y-10">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-start">
              <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-dashed bg-muted/50 p-8 text-center transition hover:border-primary/60">
                <input
                  type="file"
                  accept=".html,.htm"
                  onChange={handleFileChange}
                  className="hidden"
                  id="bookmark-file"
                  disabled={importing}
                />
                <label htmlFor="bookmark-file" className="flex flex-1 cursor-pointer flex-col items-center justify-center">
                  <Upload className="mb-6 h-12 w-12 text-muted-foreground" />
                  <div className="space-y-2">
                    <p className="text-base font-semibold">
                      {file ? file.name : 'Drop your bookmark export here'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      HTML bookmark files up to 10MB. You’ll be able to review every link before saving.
                    </p>
                  </div>
                  {file && (
                    <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-background px-4 py-1 text-xs font-medium shadow-sm">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                      Ready to import
                    </div>
                  )}
                </label>
                <p className="mt-6 text-xs text-muted-foreground">
                  We never modify your original file. Everything happens inside your workspace.
                </p>
              </div>

              <div className="rounded-2xl border bg-muted/30 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Import preferences
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Configure how we handle duplicates, folders, and privacy during the import process.
                </p>

                <div className="mt-6 space-y-5">
                  <div className="flex items-start justify-between gap-4 rounded-xl border bg-background/80 p-4 shadow-sm">
                    <div>
                      <Label htmlFor="skip-duplicates" className="font-semibold">
                        Skip duplicates
                      </Label>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Ignore bookmarks that already exist in your library.
                      </p>
                    </div>
                    <Switch
                      id="skip-duplicates"
                      checked={skipDuplicates}
                      onCheckedChange={setSkipDuplicates}
                      disabled={importing}
                    />
                  </div>

                  <div className="flex items-start justify-between gap-4 rounded-xl border bg-background/80 p-4 shadow-sm">
                    <div>
                      <Label htmlFor="auto-tag" className="font-semibold">
                        Automatic tags
                      </Label>
                      <p className="mt-1 text-sm text-muted-foreground">
                        We’ll create tags from your folder names to maintain context.
                      </p>
                    </div>
                    <Switch
                      id="auto-tag"
                      checked={autoTag}
                      onCheckedChange={setAutoTag}
                      disabled={importing}
                    />
                  </div>

                  <div className="flex items-start justify-between gap-4 rounded-xl border bg-background/80 p-4 shadow-sm">
                    <div>
                      <Label htmlFor="preserve-folders" className="font-semibold">
                        Preserve folders
                      </Label>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Convert folders into HitTags collections automatically.
                      </p>
                    </div>
                    <Switch
                      id="preserve-folders"
                      checked={preserveFolders}
                      onCheckedChange={setPreserveFolders}
                      disabled={importing}
                    />
                  </div>

                  <div className="space-y-2 rounded-xl border bg-background/80 p-4 shadow-sm">
                    <Label htmlFor="privacy-select" className="font-semibold">
                      Default privacy
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      You’ll be able to adjust items individually during review.
                    </p>
                    <Select
                      value={defaultPrivacy}
                      onValueChange={(value: any) => setDefaultPrivacy(value)}
                      disabled={importing}
                    >
                      <SelectTrigger id="privacy-select" className="mt-3">
                        <SelectValue placeholder="Select privacy level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="subscribers">Subscribers Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Import Button */}
              <Button
                onClick={handleImport}
                disabled={!file || importing}
                className="w-full lg:w-auto"
                size="lg"
              >
                {importing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing…
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Start import
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                You’ll review and edit every imported bookmark before it goes live.
              </p>
            </div>
          </div>
        )}

        {/* Import Result */}
        {result && (
          <div className="space-y-8">
            <div
              className={`rounded-2xl border p-6 shadow-sm ${
                result.success ? 'border-green-200 bg-green-50/70' : 'border-red-200 bg-red-50/70'
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle2 className="mt-1 h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="mt-1 h-6 w-6 text-red-600" />
                  )}
                  <div>
                    <p className="text-base font-semibold text-neutral-900">{result.message}</p>
                    <p className="mt-1 text-sm text-neutral-600">
                      Review the summary below, then continue to the guided editor.
                    </p>
                  </div>
                </div>
                <Button onClick={() => setShowOnboarding(true)} className="gap-2">
                  Review &amp; clean bookmarks
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border bg-background/80 p-5 text-center shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  New bookmarks
                </p>
                <p className="mt-2 text-3xl font-bold text-primary">
                  {result.import_result.imported_bookmark_ids.length}
                </p>
              </div>
              <div className="rounded-2xl border bg-background/80 p-5 text-center shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  New tags created
                </p>
                <p className="mt-2 text-3xl font-bold text-primary">
                  {result.import_result.created_tag_ids.length}
                </p>
              </div>
              <div className="rounded-2xl border bg-background/80 p-5 text-center shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  New collections
                </p>
                <p className="mt-2 text-3xl font-bold text-primary">
                  {result.import_result.created_collection_ids.length}
                </p>
              </div>
            </div>

            {/* Errors */}
            {result.import_result.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-2">
                    Some bookmarks could not be imported ({result.import_result.errors.length})
                  </p>
                  <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
                    {result.import_result.errors.map((err, i) => (
                      <li key={i} className="truncate">
                        {err.url}: {err.error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => setShowOnboarding(true)} className="gap-2">
                Continue to editor
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button onClick={resetForm} variant="outline">
                Start over
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Onboarding Dialog */}
      {result && (
        <ImportOnboarding
          open={showOnboarding}
          bookmarkIds={result.import_result.imported_bookmark_ids}
          onComplete={() => {
            setShowOnboarding(false);
            router.push('/dashboard/bookmarks');
          }}
          onCancel={() => setShowOnboarding(false)}
        />
      )}
    </Card>
  );
}
