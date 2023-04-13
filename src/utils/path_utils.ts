import {
  join,
  appCacheDir,
  appConfigDir,
  appDataDir,
  appLocalDataDir,
  appLogDir,
  audioDir,
  cacheDir,
  configDir,
  desktopDir,
  dataDir,
  documentDir,
  downloadDir,
  homeDir,
  pictureDir,
  videoDir,
  publicDir,
  localDataDir,
} from "@tauri-apps/api/path";

/** 拼接路径 */
export async function joinPath(...paths: string[]) {
  const path = await join(...paths);
  return path;
}

export async function getAppCacheDir() {
  const appCacheDirPath = await appCacheDir();
  return appCacheDirPath;
}

export async function getAppConfigDir() {
  const appConfigDirPath = await appConfigDir();
  return appConfigDirPath;
}

export async function getAppDataDir() {
  const appDataDirPath = await appDataDir();
  return appDataDirPath;
}

export async function getAppLocalDataDir() {
  const appLocalDataDirPath = await appLocalDataDir();
  return appLocalDataDirPath;
}

export async function getAppLogDir() {
  const appLogDirPath = await appLogDir();
  return appLogDirPath;
}

export async function getAudioDir() {
  const audioDirPath = await audioDir();
  return audioDirPath;
}

export async function getCacheDir() {
  const cacheDirPath = await cacheDir();
  return cacheDirPath;
}

export async function getConfigDir() {
  const configDirPath = await configDir();
  return configDirPath;
}

export async function getDesktopDir() {
  const desktopDirPath = await desktopDir();
  return desktopDirPath;
}

export async function getDataDir() {
  const dataDirPath = await dataDir();
  return dataDirPath;
}

export async function getDocumentDir() {
  const documentDirPath = await documentDir();
  return documentDirPath;
}

export async function getDownloadDir() {
  const downloadDirPath = await downloadDir();
  return downloadDirPath;
}

export async function getHomeDir() {
  const homeDirPath = await homeDir();
  return homeDirPath;
}

export async function getPictureDir() {
  const pictureDirPath = await pictureDir();
  return pictureDirPath;
}

export async function getVideoDir() {
  const videoDirPath = await videoDir();
  return videoDirPath;
}

export async function getPublicDir() {
  const publicDirPath = await publicDir();
  return publicDirPath;
}

export async function getLocalDataDir() {
  const localDataDirPath = await localDataDir();
  return localDataDirPath;
}
