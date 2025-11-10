/**
 * Memory Profiling Script
 *
 * Monitors memory usage during critical operations
 * Run: node tests/performance/memory-profiling.js
 */

const v8 = require('v8');
const fs = require('fs');
const path = require('path');

class MemoryProfiler {
  constructor(name) {
    this.name = name;
    this.snapshots = [];
    this.startMemory = null;
  }

  start() {
    // Force garbage collection if available (run with --expose-gc)
    if (global.gc) {
      global.gc();
    }

    this.startMemory = process.memoryUsage();
    console.log(`\n[${this.name}] Starting memory profiling...`);
    this.logMemory('Initial', this.startMemory);
  }

  snapshot(label) {
    const memory = process.memoryUsage();
    this.snapshots.push({ label, memory, timestamp: Date.now() });
    this.logMemory(label, memory);
  }

  logMemory(label, memory) {
    console.log(`  ${label}:`);
    console.log(`    Heap Used: ${this.formatBytes(memory.heapUsed)}`);
    console.log(`    Heap Total: ${this.formatBytes(memory.heapTotal)}`);
    console.log(`    External: ${this.formatBytes(memory.external)}`);
    console.log(`    RSS: ${this.formatBytes(memory.rss)}`);
  }

  formatBytes(bytes) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  end() {
    const endMemory = process.memoryUsage();
    const memoryDelta = {
      heapUsed: endMemory.heapUsed - this.startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - this.startMemory.heapTotal,
      external: endMemory.external - this.startMemory.external,
      rss: endMemory.rss - this.startMemory.rss,
    };

    console.log(`\n[${this.name}] Memory Delta:`);
    console.log(`  Heap Used: ${this.formatBytes(memoryDelta.heapUsed)}`);
    console.log(`  Heap Total: ${this.formatBytes(memoryDelta.heapTotal)}`);
    console.log(`  External: ${this.formatBytes(memoryDelta.external)}`);
    console.log(`  RSS: ${this.formatBytes(memoryDelta.rss)}`);

    // Check for potential memory leaks
    const heapIncreaseMB = memoryDelta.heapUsed / 1024 / 1024;
    if (heapIncreaseMB > 50) {
      console.log(`\n  ⚠️  WARNING: Significant heap increase detected (${heapIncreaseMB.toFixed(2)} MB)`);
      console.log('     This may indicate a memory leak');
    }

    return {
      name: this.name,
      startMemory: this.startMemory,
      endMemory,
      delta: memoryDelta,
      snapshots: this.snapshots,
    };
  }

  takeHeapSnapshot(filename) {
    const snapshotPath = path.join(__dirname, '../../.performance', filename);

    // Ensure directory exists
    const dir = path.dirname(snapshotPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const snapshotStream = v8.writeHeapSnapshot(snapshotPath);
    console.log(`  Heap snapshot saved to: ${snapshotPath}`);
    return snapshotPath;
  }
}

// Example profiling scenarios
async function profileArrayOperations() {
  const profiler = new MemoryProfiler('Array Operations');
  profiler.start();

  // Simulate large array operations
  const largeArray = [];
  for (let i = 0; i < 100000; i++) {
    largeArray.push({ id: i, name: `Item ${i}`, data: new Array(100).fill(i) });
  }
  profiler.snapshot('After creating 100k objects');

  // Filter operation
  const filtered = largeArray.filter(item => item.id % 2 === 0);
  profiler.snapshot('After filtering 50k objects');

  // Map operation
  const mapped = filtered.map(item => ({ ...item, processed: true }));
  profiler.snapshot('After mapping 50k objects');

  return profiler.end();
}

async function profileDataProcessing() {
  const profiler = new MemoryProfiler('Data Processing');
  profiler.start();

  // Simulate processing bookmarks with metadata
  const bookmarks = [];
  for (let i = 0; i < 10000; i++) {
    bookmarks.push({
      id: `bookmark-${i}`,
      url: `https://example.com/${i}`,
      title: `Bookmark ${i}`,
      description: `Description for bookmark ${i}`.repeat(10),
      tags: Array.from({ length: 5 }, (_, j) => `tag${j}`),
      metadata: {
        clicks: Math.floor(Math.random() * 1000),
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
    });
  }
  profiler.snapshot('After creating 10k bookmarks');

  // Group by tags
  const tagGroups = {};
  bookmarks.forEach(bookmark => {
    bookmark.tags.forEach(tag => {
      if (!tagGroups[tag]) {
        tagGroups[tag] = [];
      }
      tagGroups[tag].push(bookmark);
    });
  });
  profiler.snapshot('After grouping by tags');

  // Calculate statistics
  const stats = Object.keys(tagGroups).map(tag => ({
    tag,
    count: tagGroups[tag].length,
    totalClicks: tagGroups[tag].reduce((sum, b) => sum + b.metadata.clicks, 0),
  }));
  profiler.snapshot('After calculating statistics');

  return profiler.end();
}

async function profileStringOperations() {
  const profiler = new MemoryProfiler('String Operations');
  profiler.start();

  // Simulate markdown/HTML processing
  const texts = [];
  for (let i = 0; i < 1000; i++) {
    const text = `# Heading ${i}\n\n`.repeat(10) +
                 `This is paragraph ${i} with **bold** and *italic* text.\n\n`.repeat(50);
    texts.push(text);
  }
  profiler.snapshot('After creating 1k large text strings');

  // Process strings
  const processed = texts.map(text => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>');
  });
  profiler.snapshot('After processing text');

  return profiler.end();
}

async function main() {
  console.log('='.repeat(60));
  console.log('MEMORY PROFILING SUITE');
  console.log('='.repeat(60));
  console.log('Note: Run with --expose-gc for accurate results');
  console.log('      node --expose-gc tests/performance/memory-profiling.js');

  const results = [];

  // Run profiling scenarios
  results.push(await profileArrayOperations());
  await new Promise(resolve => setTimeout(resolve, 1000));

  results.push(await profileDataProcessing());
  await new Promise(resolve => setTimeout(resolve, 1000));

  results.push(await profileStringOperations());

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('MEMORY PROFILING SUMMARY');
  console.log('='.repeat(60));

  results.forEach(result => {
    const heapDeltaMB = result.delta.heapUsed / 1024 / 1024;
    const status = heapDeltaMB > 50 ? '⚠️  WARNING' : '✓ OK';
    console.log(`${result.name}: ${status} (Heap: ${heapDeltaMB.toFixed(2)} MB)`);
  });

  console.log('\nNote: Heap snapshots can be analyzed in Chrome DevTools');
  console.log('      1. Open Chrome DevTools');
  console.log('      2. Go to Memory tab');
  console.log('      3. Click "Load" and select .heapsnapshot file');
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { MemoryProfiler };
