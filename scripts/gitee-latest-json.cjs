// 获取 gitee release info

const { exit } = require("process");
const { resolve } = require("path");
const { writeFileSync } = require("fs");
const { version } = require("../package.json");

// fetch 取代 axios：axios 1.x 走环境代理时重定向会报 ERR_INVALID_PROTOCOL
const getJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
};


const owner = "lijianran";
const repo = "updater";
const tag = "assistor-app-updater";

var latestJson = {
  version: `v${version}`,
  notes: "https://github.com/lijianran/assistor-app/releases/latest",
  pub_date: new Date().toISOString(),
  platforms: {
    "linux-x86_64": {
      signature: "",
      url: "",
    },
    "darwin-x86_64": {
      signature: "",
      url: "",
    },
    "darwin-aarch64": {
      signature: "",
      url: "",
    },
    "windows-x86_64": {
      signature: "",
      url: "",
    },
  },
};

async function getAllReleases() {
  const url = `https://gitee.com/api/v5/repos/${owner}/${repo}/releases`;
  return getJson(url);
}

async function getReleaseByTag() {
  const url = `https://gitee.com/api/v5/repos/${owner}/${repo}/releases/tags/${tag}`;
  return getJson(url);
}

const getSignature = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    console.log("getSignature failed:", res.status);
    exit(1);
  }
  return res.text();
};

async function generateLatestJson() {
  console.log("Gitee Updater:", "https://gitee.com/lijianran/updater");

  const release = await getReleaseByTag();

  for (const { name, browser_download_url } of release.assets) {
    if (!name || !browser_download_url) {
      continue;
    }
    // windows
    if (name.endsWith(".msi.zip")) {
      latestJson.platforms["windows-x86_64"].url = browser_download_url;
    } else if (name.endsWith(".msi.zip.sig")) {
      const signature = await getSignature(browser_download_url);
      latestJson.platforms["windows-x86_64"].signature = signature;
    }
    // macos x64
    else if (name.endsWith("x64.app.tar.gz")) {
      latestJson.platforms["darwin-x86_64"].url = browser_download_url;
    } else if (name.endsWith("x64.app.tar.gz.sig")) {
      const signature = await getSignature(browser_download_url);
      latestJson.platforms["darwin-x86_64"].signature = signature;
    }
    // macos aarch64
    else if (name.endsWith(".app.tar.gz")) {
      latestJson.platforms["darwin-aarch64"].url = browser_download_url;
    } else if (name.endsWith(".app.tar.gz.sig")) {
      const signature = await getSignature(browser_download_url);
      latestJson.platforms["darwin-aarch64"].signature = signature;
    }
    // linux
    else if (name.endsWith(".AppImage.tar.gz")) {
      latestJson.platforms["linux-x86_64"].url = browser_download_url;
    } else if (name.endsWith(".AppImage.tar.gz.sig")) {
      const signature = await getSignature(browser_download_url);
      latestJson.platforms["linux-x86_64"].signature = signature;
    }
  }

  // console.log(latestJson)
  // 移除没有产物的平台：tauri 解析 manifest 时任何空 url 都会失败(relative URL without a base)
  for (const k of Object.keys(latestJson.platforms)) {
    if (!latestJson.platforms[k].url || !latestJson.platforms[k].signature) {
      delete latestJson.platforms[k];
    }
  }
  const lastJsonFilePath = resolve(__dirname, "..", "latest.json");
  writeFileSync(lastJsonFilePath, JSON.stringify(latestJson, null, 2));
  console.log("Generate latest.json:", lastJsonFilePath);
}

generateLatestJson();
