// 构建测试版：版本号 = 当前版本-test.日期.提交号，关闭自动更新，仅出 NSIS 安装包，窗口标题带 TEST 标识
// 构建完自动还原被临时修改的文件，不会污染 git 工作区
const { execSync } = require('child_process')
const { readFileSync, writeFileSync } = require('fs')
const { resolve } = require('path')

const root = resolve(__dirname, '..')
const files = {
  'package.json': resolve(root, 'package.json'),
  'src-tauri/Cargo.toml': resolve(root, 'src-tauri/Cargo.toml'),
  'src-tauri/tauri.conf.json': resolve(root, 'src-tauri/tauri.conf.json'),
}

const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
const sha = execSync('git rev-parse --short HEAD').toString().trim()
const originals = Object.fromEntries(Object.entries(files).map(([k, p]) => [k, readFileSync(p, 'utf8')]))

let testVersion
try {
  const pkg = JSON.parse(originals['package.json'])
  testVersion = `${pkg.version}-test.${date}.${sha}`
  pkg.version = testVersion
  writeFileSync(files['package.json'], JSON.stringify(pkg, null, 2) + '\n')

  const cargo = originals['src-tauri/Cargo.toml']
  if (!cargo.includes('features = ["api-all", "updater"]')) {
    throw new Error('Cargo.toml 里没找到 updater feature，中止构建')
  }
  writeFileSync(files['src-tauri/Cargo.toml'], cargo.replace('features = ["api-all", "updater"]', 'features = ["api-all"]'))

  const conf = JSON.parse(originals['src-tauri/tauri.conf.json'])
  conf.tauri.updater.active = false
  conf.tauri.bundle.targets = ['nsis']
  conf.tauri.windows[0].title = `${conf.tauri.windows[0].title} TEST ${testVersion}`
  writeFileSync(files['src-tauri/tauri.conf.json'], JSON.stringify(conf, null, 2) + '\n')

  console.log(`\n===== 构建测试版 ${testVersion} =====\n`)
  execSync('pnpm tauri build', { stdio: 'inherit', cwd: root })
  console.log(`\n===== 完成，安装包：${resolve(root, 'src-tauri/target/release/bundle/nsis', `assistor-app_${testVersion}_x64-setup.exe`)} =====`)
} finally {
  for (const [k, p] of Object.entries(files)) writeFileSync(p, originals[k])
  console.log('已还原 package.json / Cargo.toml / tauri.conf.json')
}
