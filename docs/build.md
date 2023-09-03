# windows 构建发布

## git 拉代码

防止文件 LF -> CRLF

```bash
git config --global core.autocrlf false
```

## Rust

https://www.rust-lang.org/tools/install

换下载源，新建：`~\.cargo\config.toml`

```toml
[source.crates-io]
replace-with = 'ustc'

[source.ustc]
registry = "git://mirrors.ustc.edu.cn/crates.io-index"
```

## nvm-windows

https://github.com/coreybutler/nvm-windows

```bash
nvm install 16
nvm use 16
npm install -g pnpm
```

## powershell 使用 pnpm

https://www.cnblogs.com/liusixiang/p/17320853.html

```bash
# 以管理员身份运行 powershell
set-executionpolicy remotesigned
```

## 构建

```bash
pnpm install
pnpm tauri dev
```

## Release

发布新版本

更新 src-tauri\resources\dev\home_log.txt 主页日志

```bash
pnpm release
```

## WixTools 与 NSIS

https://github.com/tauri-apps/tauri/issues/7338

## 发布

密钥：`~\.tauri\assistor-app.key`

```bash
scripts\build.cmd
```

更新完成 gitee release

```bash
node .\scripts\gitee-latest-json.cjs
```

更新 latest.json 到 release
