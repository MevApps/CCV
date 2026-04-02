#!/usr/bin/env node

/**
 * Claude Code Visualizer — CLI Entry Point
 *
 * Usage:  ccv [options]
 *
 * Launches the CCV web interface for visual project management
 * of Claude Code CLI missions.
 */

const { resolve, join } = require('path');
const { existsSync, mkdirSync, rmSync } = require('fs');
const { homedir } = require('os');
const { execSync, spawn } = require('child_process');

// --- Argument Parsing ---

const args = process.argv.slice(2);
const flags = {};

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--port':
      flags.port = Number(args[++i]);
      break;
    case '--no-open':
      flags.noOpen = true;
      break;
    case '--config':
      flags.config = args[++i];
      break;
    case '--reset':
      flags.reset = true;
      break;
    case '--version':
    case '-v':
      console.log(require('../package.json').version);
      process.exit(0);
    case '--help':
    case '-h':
      printHelp();
      process.exit(0);
    default:
      console.error(`Unknown option: ${args[i]}`);
      console.error('Run "ccv --help" for usage information.');
      process.exit(1);
  }
}

function printHelp() {
  console.log(`
Claude Code Visualizer (CCV)

USAGE:  ccv [options]

OPTIONS:
  --port <number>    Server port (default: 3117)
  --no-open          Don't auto-open browser
  --config <path>    Custom config file path
  --reset            Reset database and settings
  --version, -v      Show version
  --help, -h         Show help

EXAMPLES:
  ccv                        Start on default port, open browser
  ccv --port 8080            Custom port
  ccv --no-open              Start server without opening browser
`);
}

// --- First Run / Environment Validation ---

const ccvDir = join(homedir(), '.ccv');
const dbPath = join(ccvDir, 'data.db');

// Handle --reset
if (flags.reset) {
  if (existsSync(ccvDir)) {
    rmSync(ccvDir, { recursive: true });
    console.log('Reset complete. Removed ~/.ccv/');
  }
}

// Create ~/.ccv/ if needed
if (!existsSync(ccvDir)) {
  mkdirSync(ccvDir, { recursive: true });
  console.log('Created ~/.ccv/');
}

// Validate Claude Code CLI
let cliAvailable = false;
try {
  execSync('claude --version', { stdio: 'pipe' });
  cliAvailable = true;
} catch {
  console.warn('\n⚠  Claude Code CLI not found.');
  console.warn('   Install it: npm install -g @anthropic-ai/claude-code');
  console.warn('   Or set the path in Settings after launch.\n');
}

// --- Start Server ---

const port = flags.port || 3117;

console.log(`
  Claude Code Visualizer
  ─────────────────────
  Port:     ${port}
  Database: ${dbPath}
  CLI:      ${cliAvailable ? 'Available' : 'Not found'}
`);

// Set environment variables for Next.js
process.env.PORT = String(port);
process.env.CCV_DB_PATH = dbPath;

// Start Next.js
const nextBin = resolve(__dirname, '..', 'node_modules', '.bin', 'next');
const server = spawn(nextBin, ['start', '--port', String(port)], {
  cwd: resolve(__dirname, '..'),
  stdio: 'inherit',
  env: { ...process.env },
});

server.on('error', (err) => {
  console.error('Failed to start server:', err.message);
  console.error('Try running "npm run build" first.');
  process.exit(1);
});

// Open browser (unless --no-open)
if (!flags.noOpen) {
  setTimeout(() => {
    const url = `http://localhost:${port}`;
    const platform = process.platform;
    try {
      if (platform === 'darwin') {
        execSync(`open "${url}"`, { stdio: 'pipe' });
      } else if (platform === 'win32') {
        execSync(`start "" "${url}"`, { stdio: 'pipe' });
      } else {
        execSync(`xdg-open "${url}"`, { stdio: 'pipe' });
      }
    } catch {
      console.log(`  Open in browser: ${url}\n`);
    }
  }, 2000);
}

// Handle shutdown
process.on('SIGINT', () => {
  server.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.kill('SIGTERM');
  process.exit(0);
});
