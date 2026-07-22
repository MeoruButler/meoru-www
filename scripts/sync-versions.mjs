#!/usr/bin/env node

/**
 * 모든 앱 package.json의 버전을 동기화하는 스크립트
 *
 * 사용법:
 *   node scripts/sync-versions.mjs          # root 버전으로 동기화
 *   node scripts/sync-versions.mjs 1.2.0    # 지정된 버전으로 동기화
 *   node scripts/sync-versions.mjs --check  # 버전 동기화 상태 확인만
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const APPS_DIR = join(ROOT_DIR, 'apps');

/**
 * package.json 파일을 읽고 파싱
 */
function readPackageJson(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * package.json 파일에 쓰기 (포맷 유지)
 */
function writePackageJson(filePath, data) {
  const content = JSON.stringify(data, null, 2) + '\n';
  writeFileSync(filePath, content, 'utf-8');
}

/**
 * apps 폴더의 모든 package.json 경로 찾기
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
          // package.json이 없는 폴더는 무시
        }
      }
    }
  } catch (error) {
    console.error('apps 폴더를 읽을 수 없습니다:', error.message);
    process.exit(1);
  }

  return packages;
}

/**
 * 버전 동기화 상태 확인
 */
function checkVersions() {
  const rootPackageJson = readPackageJson(join(ROOT_DIR, 'package.json'));
  const rootVersion = rootPackageJson.version;
  const appsPackages = findAppsPackageJsons();

  console.log('\n📦 버전 동기화 상태 확인\n');
  console.log(`   Root: ${rootVersion}`);
  console.log('   ─────────────────────────');

  let allSynced = true;

  for (const { name, path } of appsPackages) {
    const pkg = readPackageJson(path);
    const isSynced = pkg.version === rootVersion;
    const icon = isSynced ? '✓' : '✗';
    const status = isSynced ? '' : ` (현재: ${pkg.version})`;

    console.log(`   ${icon} ${name}: ${pkg.version}${status}`);

    if (!isSynced) {
      allSynced = false;
    }
  }

  console.log('');

  if (allSynced) {
    console.log('✅ 모든 앱 버전이 동기화되어 있습니다.\n');
  } else {
    console.log('⚠️  버전이 동기화되지 않은 앱이 있습니다.\n');
    console.log('   동기화하려면: node scripts/sync-versions.mjs\n');
  }

  return allSynced;
}

/**
 * 버전 동기화 실행
 */
function syncVersions(targetVersion) {
  const rootPackageJsonPath = join(ROOT_DIR, 'package.json');
  const rootPackageJson = readPackageJson(rootPackageJsonPath);
  const currentVersion = rootPackageJson.version;
  const newVersion = targetVersion || currentVersion;

  console.log('\n🔄 버전 동기화 시작\n');
  console.log(`   대상 버전: ${newVersion}`);
  console.log('   ─────────────────────────');

  // root package.json 업데이트 (새 버전이 지정된 경우)
  if (targetVersion && targetVersion !== currentVersion) {
    rootPackageJson.version = newVersion;
    writePackageJson(rootPackageJsonPath, rootPackageJson);
    console.log(`   ✓ root: ${currentVersion} → ${newVersion}`);
  } else {
    console.log(`   ✓ root: ${currentVersion} (유지)`);
  }

  // apps 폴더의 package.json 업데이트
  const appsPackages = findAppsPackageJsons();

  for (const { name, path } of appsPackages) {
    const pkg = readPackageJson(path);
    const oldVersion = pkg.version;

    if (oldVersion !== newVersion) {
      pkg.version = newVersion;
      writePackageJson(path, pkg);
      console.log(`   ✓ ${name}: ${oldVersion} → ${newVersion}`);
    } else {
      console.log(`   ✓ ${name}: ${oldVersion} (유지)`);
    }
  }

  console.log('\n✅ 버전 동기화 완료!\n');
}

/**
 * 메인 함수
 */
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--check') || args.includes('-c')) {
    const allSynced = checkVersions();
    process.exit(allSynced ? 0 : 1);
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
사용법:
  node scripts/sync-versions.mjs              root 버전으로 동기화
  node scripts/sync-versions.mjs <version>    지정된 버전으로 동기화
  node scripts/sync-versions.mjs --check      버전 동기화 상태 확인
  node scripts/sync-versions.mjs --help       도움말 표시

예시:
  node scripts/sync-versions.mjs 1.2.0
  node scripts/sync-versions.mjs 2.0.0-beta.1
`);
    process.exit(0);
  }

  const targetVersion = args[0];

  // 버전 형식 검증 (지정된 경우)
  if (targetVersion && !/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(targetVersion)) {
    console.error(`\n❌ 잘못된 버전 형식: ${targetVersion}`);
    console.error('   올바른 형식: 1.2.3 또는 1.2.3-beta.1\n');
    process.exit(1);
  }

  syncVersions(targetVersion);
}

main();
