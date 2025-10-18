import { Metadata } from 'next';
import { ImportBookmarks } from '@/components/import-export/import-bookmarks';
import { ExportBookmarks } from '@/components/import-export/export-bookmarks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileInput,
  FileOutput,
  Info,
  ShieldCheck,
  Sparkles,
  Tags,
  FolderTree,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const metadata: Metadata = {
  title: 'Import/Export - HitTags',
  description: 'Import and export your bookmarks',
};

export default function ImportExportPage() {
  return (
    <div className="container max-w-6xl space-y-10 py-8">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            <Sparkles className="h-4 w-4" />
            Seamless bookmark migration
          </span>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Import & Export Hub</h1>
            <p className="text-base text-muted-foreground lg:text-lg">
              Bring your existing bookmarks into HitTags, clean them up in one flow, and keep a
              portable copy of your library for peace of mind.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border bg-background/80 p-4 shadow-sm">
              <div className="flex items-center gap-3 text-primary">
                <ShieldCheck className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-wide">Smart safeguards</p>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Automatic duplicate detection and privacy defaults keep your workspace organised
                while you import.
              </p>
            </div>
            <div className="rounded-2xl border bg-background/80 p-4 shadow-sm">
              <div className="flex items-center gap-3 text-primary">
                <Tags className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-wide">Context preserved</p>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Maintain folder structure, tags, and collections so everything lands where it
                belongs.
              </p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-background p-6 shadow-lg">
          <div className="relative space-y-5">
            <h2 className="text-lg font-semibold text-primary">Import checklist</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-primary/15 p-1 text-primary">
                  <FileInput className="h-4 w-4" />
                </div>
                Upload bookmark files from Chrome, Firefox, Safari, Edge, or Netscape HTML exports.
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-primary/15 p-1 text-primary">
                  <FolderTree className="h-4 w-4" />
                </div>
                Preview imported bookmarks, clean titles & descriptions, and map them to collections.
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-primary/15 p-1 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                Finalise privacy levels before saving everything to your workspace.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Supported Formats</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
            <li>
              <strong>Import:</strong> Chrome, Firefox, Safari, Edge HTML bookmark files
            </li>
            <li>
              <strong>Export:</strong> JSON, CSV, and HTML (Netscape Bookmark Format)
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="import" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 gap-2">
          <TabsTrigger
            value="import"
            className="flex items-center justify-center gap-2 rounded-xl border border-transparent bg-transparent py-3 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-primary/5 hover:text-primary focus-visible:ring-0 data-[state=active]:border-primary/40 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm [&_svg]:size-4"
          >
            <FileInput className="h-4 w-4" />
            Import bookmarks
          </TabsTrigger>
          <TabsTrigger
            value="export"
            className="flex items-center justify-center gap-2 rounded-xl border border-transparent bg-transparent py-3 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-primary/5 hover:text-primary focus-visible:ring-0 data-[state=active]:border-primary/40 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm [&_svg]:size-4"
          >
            <FileOutput className="h-4 w-4" />
            Export library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import">
          <ImportBookmarks />

          {/* Import Instructions */}
          <div className="mt-10 rounded-2xl border border-border/60 bg-background/95 p-8 shadow-sm">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold">How to export bookmarks from your browser</h3>
              <p className="text-sm text-muted-foreground">
                Follow the quick steps below to create an HTML file you can upload to HitTags.
              </p>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border bg-background/80 p-5 shadow-sm">
                <h4 className="text-sm font-semibold">🔵 Google Chrome</h4>
                <ol className="mt-3 list-decimal space-y-1 text-sm text-muted-foreground">
                  <li>Open Chrome &gt; Bookmarks &gt; Bookmark Manager.</li>
                  <li>Select the ⋮ menu in the top right corner.</li>
                  <li>Choose &quot;Export bookmarks&quot; and save the HTML file.</li>
                </ol>
              </div>

              <div className="rounded-xl border bg-background/80 p-5 shadow-sm">
                <h4 className="text-sm font-semibold">🦊 Mozilla Firefox</h4>
                <ol className="mt-3 list-decimal space-y-1 text-sm text-muted-foreground">
                  <li>Open Firefox &gt; Bookmarks &gt; Manage bookmarks.</li>
                  <li>Click &quot;Import and Backup&quot; &gt; Export bookmarks to HTML.</li>
                  <li>Save the generated HTML file.</li>
                </ol>
              </div>

              <div className="rounded-xl border bg-background/80 p-5 shadow-sm">
                <h4 className="text-sm font-semibold">🧭 Safari (macOS)</h4>
                <ol className="mt-3 list-decimal space-y-1 text-sm text-muted-foreground">
                  <li>Open Safari and choose File &gt; Export Bookmarks.</li>
                  <li>Select a destination and click Save to create the HTML file.</li>
                </ol>
              </div>

              <div className="rounded-xl border bg-background/80 p-5 shadow-sm">
                <h4 className="text-sm font-semibold">🌐 Microsoft Edge</h4>
                <ol className="mt-3 list-decimal space-y-1 text-sm text-muted-foreground">
                  <li>Open Edge &gt; Favorites &gt; Manage favorites.</li>
                  <li>Choose &quot;Export favorites&quot; from the ⋯ menu.</li>
                  <li>Download the HTML file to your computer.</li>
                </ol>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="export">
          <ExportBookmarks />

          {/* Export Instructions */}
          <div className="mt-10 rounded-2xl border border-border/60 bg-background/95 p-8 shadow-sm">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold">Make the most of exported files</h3>
              <p className="text-sm text-muted-foreground">
                Choose the best format for your workflow when backing up or sharing your bookmark
                library.
              </p>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border bg-background/80 p-5 shadow-sm">
                <h4 className="text-sm font-semibold">📄 JSON</h4>
                <p className="mt-3 text-sm text-muted-foreground">
                  Full fidelity backups with metadata, collections, and tags. Ideal for re-importing
                  or automation.
                </p>
              </div>
              <div className="rounded-xl border bg-background/80 p-5 shadow-sm">
                <h4 className="text-sm font-semibold">📊 CSV</h4>
                <p className="mt-3 text-sm text-muted-foreground">
                  Open in Excel or Sheets to audit content, share reports, or manipulate in bulk.
                </p>
              </div>
              <div className="rounded-xl border bg-background/80 p-5 shadow-sm">
                <h4 className="text-sm font-semibold">🌐 HTML</h4>
                <p className="mt-3 text-sm text-muted-foreground">
                  Ready for browsers that expect Netscape Bookmark Format—perfect for migrating
                  elsewhere.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
