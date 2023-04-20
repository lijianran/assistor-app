// 获取 gitee release info

const { exit } = require("process");
const { resolve } = require("path");
const { writeFileSync } = require("fs");
const { version } = require("../package.json");
const axios = require("axios").default;

const owner = "lijianran";
const repo = "updater";
const tag = "assistor-app-updater";

var latestJson = {
  version: `v${version}`,
  notes: "https://github.com/lijianran/assistor-app/releases/latest",
  pub_date: new Date().toISOString(),
  platforms: {
    "darwin-x86_64": {
      signature: "",
      url: "",
    },
    "darwin-aarch64": {
      signature: "",
      url: "",
    },
    "linux-x86_64": {
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

  const res = await axios.get(url);
  return res.data;
}

async function getReleaseByTag() {
  const url = `https://gitee.com/api/v5/repos/${owner}/${repo}/releases/tags/${tag}`;

  const res = await axios.get(url);
  return res.data;
}

const getSignature = async (url) => {
  const res = await axios.get(url).catch((err) => {
    console.log("getSignature failed:", err.response.status);
    exit(1);
  });
  return res.data;
};

async function generateLatestJson() {
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
    else if (name.endsWith("aarch64.app.tar.gz")) {
      latestJson.platforms["darwin-aarch64"].url = browser_download_url;
    } else if (name.endsWith("aarch64.app.tar.gz.sig")) {
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
  const lastJsonFilePath = resolve(__dirname, "..", "latest.json");
  writeFileSync(lastJsonFilePath, JSON.stringify(latestJson, null, 2));
  console.log("Generate latest.json:", lastJsonFilePath);
}

generateLatestJson();
