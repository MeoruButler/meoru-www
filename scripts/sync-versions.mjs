#!/usr/bin/env node

/**
 * Synchronize package.json versions across all applications.
 *
 * Usage:
 *   node scripts/sync-versions.mjs          # Synchronize with the root version
 *   node scripts/sync-versions.mjs 1.2.0    # Synchronize with a specified version
 *   node scripts/sync-versions.mjs --check  # Check synchronization only
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const APPS_DIR = join(ROOT_DIR, 'apps');

/**
 * Read and parse a package.json file.
 */
function readPackageJson(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Write a package.json file while preserving its formatting.
 */
function writePackageJson(filePath, data) {
  const content = JSON.stringify(data, null, 2) + '\n';
  writeFileSync(filePath, content, 'utf-8');
}

/**
 * Find every package.json file under apps.
 */
function findAppsPackageJsons() {
  const packages = [];

  try {
    const apps = readdirSync(APPS_DIR);

    for (const app of apps) {
      const appPath = join(APPS_DIR, app);

      if (statSync(appPath).isDirectory()) {
        const packageJsonPath = join(appPath, 'package.json');

        try {
          statSync(packageJsonPath);
          packages.push({
            name: app,
            path: packageJsonPath,
          });
        } catch {
          // Ignore directories without a package.json file.
        }
      }
    }
  } catch (error) {
    console.error('Unable to read the apps directory:', error.message);
    process.exit(1);
  }

  return packages;
}

/**
 * Check version synchronization.
 */
function checkVersions() {
  const rootPackageJson = readPackageJson(join(ROOT_DIR, 'package.json'));
  const rootVersion = rootPackageJson.version;
  const appsPackages = findAppsPackageJsons();

  console.log('\n📦 Version synchronization check\n');
  console.log(`   Root: ${rootVersion}`);
  console.log('   ─────────────────────────');

  let allSynced = true;

  for (const { name, path } of appsPackages) {
    const pkg = readPackageJson(path);
    const isSynced = pkg.version === rootVersion;
    const icon = isSynced ? '✓' : '✗';
    const status = isSynced ? '' : ` (current: ${pkg.version})`;

    console.log(`   ${icon} ${name}: ${pkg.version}${status}`);

    if (!isSynced) {
      allSynced = false;
    }
  }

  console.log('');

  if (allSynced) {
    console.log('✅ All application versions are synchronized.\n');
  } else {
    console.log('⚠️  Some application versions are not synchronized.\n');
    console.log('   Run to synchronize: node scripts/sync-versions.mjs\n');
  }

  return allSynced;
}

/**
 * Synchronize versions.
 */
function syncVersions(targetVersion) {
  const rootPackageJsonPath = join(ROOT_DIR, 'package.json');
  const rootPackageJson = readPackageJson(rootPackageJsonPath);
  const currentVersion = rootPackageJson.version;
  const newVersion = targetVersion || currentVersion;

  console.log('\n🔄 Starting version synchronization\n');
  console.log(`   Target version: ${newVersion}`);
  console.log('   ─────────────────────────');

  // Update the root package.json when a new version is specified.
  if (targetVersion && targetVersion !== currentVersion) {
    rootPackageJson.version = newVersion;
    writePackageJson(rootPackageJsonPath, rootPackageJson);
    console.log(`   ✓ root: ${currentVersion} → ${newVersion}`);
  } else {
    console.log(`   ✓ root: ${currentVersion} (unchanged)`);
  }

  // Update package.json files under apps.
  const appsPackages = findAppsPackageJsons();

  for (const { name, path } of appsPackages) {
    const pkg = readPackageJson(path);
    const oldVersion = pkg.version;

    if (oldVersion !== newVersion) {
      pkg.version = newVersion;
      writePackageJson(path, pkg);
      console.log(`   ✓ ${name}: ${oldVersion} → ${newVersion}`);
    } else {
      console.log(`   ✓ ${name}: ${oldVersion} (unchanged)`);
    }
  }

  console.log('\n✅ Version synchronization complete.\n');
}

/**
 * Main entry point.
 */
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--check') || args.includes('-c')) {
    const allSynced = checkVersions();
    process.exit(allSynced ? 0 : 1);
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage:
  node scripts/sync-versions.mjs              Synchronize with the root version
  node scripts/sync-versions.mjs <version>    Synchronize with a specified version
  node scripts/sync-versions.mjs --check      Check version synchronization
  node scripts/sync-versions.mjs --help       Show help

Examples:
  node scripts/sync-versions.mjs 1.2.0
  node scripts/sync-versions.mjs 2.0.0-beta.1
`);
    process.exit(0);
  }

  const targetVersion = args[0];

  // Validate the version format when provided.
  if (targetVersion && !/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(targetVersion)) {
    console.error(`\n❌ Invalid version format: ${targetVersion}`);
    console.error('   Expected format: 1.2.3 or 1.2.3-beta.1\n');
    process.exit(1);
  }

  syncVersions(targetVersion);
}

main();
