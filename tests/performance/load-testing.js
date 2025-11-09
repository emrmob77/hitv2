/**
 * Load Testing Script
 *
 * Simple load testing using autocannon (lightweight alternative to k6)
 * Install: npm install -D autocannon
 * Run: node tests/performance/load-testing.js
 */

const autocannon = require('autocannon');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// Test scenarios
const scenarios = [
  {
    name: 'Homepage Load Test',
    url: `${BASE_URL}/`,
    connections: 10,
    duration: 30,
  },
  {
    name: 'API - Bookmarks List',
    url: `${BASE_URL}/api/bookmarks`,
    connections: 20,
    duration: 30,
    headers: {
      'Content-Type': 'application/json',
      // Add auth header in production
    },
  },
  {
    name: 'API - Collections List',
    url: `${BASE_URL}/api/collections`,
    connections: 20,
    duration: 30,
  },
  {
    name: 'Dashboard Load Test',
    url: `${BASE_URL}/dashboard`,
    connections: 15,
    duration: 30,
  },
  {
    name: 'Affiliate Click Redirect',
    url: `${BASE_URL}/r/test-redirect`,
    connections: 50,
    duration: 20,
  },
];

async function runLoadTest(scenario) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Running: ${scenario.name}`);
  console.log(`URL: ${scenario.url}`);
  console.log(`Connections: ${scenario.connections}, Duration: ${scenario.duration}s`);
  console.log('='.repeat(60));

  const result = await autocannon({
    url: scenario.url,
    connections: scenario.connections,
    duration: scenario.duration,
    pipelining: 1,
    headers: scenario.headers || {},
  });

  console.log('\nResults:');
  console.log(`  Requests: ${result.requests.total}`);
  console.log(`  Throughput: ${(result.throughput.total / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Latency (avg): ${result.latency.mean.toFixed(2)} ms`);
  console.log(`  Latency (p99): ${result.latency.p99.toFixed(2)} ms`);
  console.log(`  Requests/sec (avg): ${result.requests.average.toFixed(2)}`);
  console.log(`  Errors: ${result.errors}`);
  console.log(`  Timeouts: ${result.timeouts}`);
  console.log(`  2xx: ${result['2xx']}`);
  console.log(`  4xx: ${result['4xx']}`);
  console.log(`  5xx: ${result['5xx']}`);

  // Performance assertions
  const assertions = {
    avgLatency: result.latency.mean < 200,
    p99Latency: result.latency.p99 < 500,
    errorRate: (result.errors / result.requests.total) < 0.01,
    successRate: (result['2xx'] / result.requests.total) > 0.95,
  };

  console.log('\nAssertions:');
  console.log(`  Avg Latency < 200ms: ${assertions.avgLatency ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`  P99 Latency < 500ms: ${assertions.p99Latency ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`  Error Rate < 1%: ${assertions.errorRate ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`  Success Rate > 95%: ${assertions.successRate ? '✓ PASS' : '✗ FAIL'}`);

  return {
    scenario: scenario.name,
    result,
    assertions,
    passed: Object.values(assertions).every(Boolean),
  };
}

async function main() {
  console.log('Starting Load Testing Suite');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Total Scenarios: ${scenarios.length}\n`);

  const results = [];

  for (const scenario of scenarios) {
    try {
      const result = await runLoadTest(scenario);
      results.push(result);

      // Wait between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`\nError running ${scenario.name}:`, error.message);
      results.push({
        scenario: scenario.name,
        error: error.message,
        passed: false,
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('LOAD TESTING SUMMARY');
  console.log('='.repeat(60));

  results.forEach((result, index) => {
    const status = result.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`${index + 1}. ${result.scenario}: ${status}`);
  });

  const totalPassed = results.filter(r => r.passed).length;
  const totalFailed = results.filter(r => !r.passed).length;

  console.log(`\nTotal: ${results.length} | Passed: ${totalPassed} | Failed: ${totalFailed}`);

  // Exit with error code if any tests failed
  process.exit(totalFailed > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runLoadTest, scenarios };
