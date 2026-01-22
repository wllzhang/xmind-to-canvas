/**
 * Version Synchronization Script
 * 
 * This script centralizes version management across the project:
 * - Reads plugin version from package.json (single source of truth)
 * - Reads minAppVersion mapping from versions.json
 * - Updates manifest.json with synchronized versions
 * 
 * Usage:
 *   npm run sync-versions
 * 
 * The script is automatically run before build/dev commands.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Read package.json for plugin version
const packageJson = JSON.parse(
  readFileSync(join(rootDir, 'package.json'), 'utf-8')
);

// Read versions.json for minAppVersion mapping
const versionsJson = JSON.parse(
  readFileSync(join(rootDir, 'versions.json'), 'utf-8')
);

// Read current manifest.json
const manifestJson = JSON.parse(
  readFileSync(join(rootDir, 'manifest.json'), 'utf-8')
);

// Get plugin version from package.json
const pluginVersion = packageJson.version;

// Get minAppVersion from versions.json (fallback to current if not found)
const minAppVersion = versionsJson[pluginVersion] || manifestJson.minAppVersion;

if (!versionsJson[pluginVersion]) {
  console.warn(
    `Warning: Version ${pluginVersion} not found in versions.json. Using current minAppVersion: ${minAppVersion}`
  );
}

// Update manifest.json
manifestJson.version = pluginVersion;
manifestJson.minAppVersion = minAppVersion;

// Write updated manifest.json
writeFileSync(
  join(rootDir, 'manifest.json'),
  JSON.stringify(manifestJson, null, 2) + '\n',
  'utf-8'
);

console.log(`✓ Synced versions:`);
console.log(`  Plugin version: ${pluginVersion}`);
console.log(`  Min app version: ${minAppVersion}`);

