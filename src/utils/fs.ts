import {
  exists,
  createDir,
  removeFile,
  readTextFile,
  readDir,
  BaseDirectory,
} from "@tauri-apps/api/fs";

// 是否存在
export async function isNotExist(path: string) {
  const isExist = await exists(path);
  return !isExist;
}

// 创建目录
export async function createDirectory(path: string) {
  await createDir(path);
}

// 删除文件
export async function deleteFile(file_path: string) {
  await removeFile(file_path);
}

// 读取文本文件
export async function readTextFileData(file_path: string) {
  const contents = await readTextFile(file_path);
  return contents;
}

// 读取目录信息
export async function readDirectoryData(path: string) {
  const entries = await readDir(path, { recursive: true });
  return entries;
}

// 打开文档目录
export async function openDocsFolder() {
  const docsPath = await getResourcePath("resources", "docs");

  openPath(docsPath);
}

// 结果目录
export async function getResultFolder(name: string) {
  const documentDirPath = await getDocumentDir();
  const resultDirPath = await joinPath(documentDirPath, "教务软件数据", name);
  if (await isNotExist(resultDirPath)) {
    await createDirectory(resultDirPath);
  }
  return resultDirPath;
}

// 导出路径
export async function getSaveFolder(name: string) {
  const documentDirPath = await getDocumentDir();
  const saveDirPath = await joinPath(
    documentDirPath,
    "教务软件数据",
    name,
    timeDirName()
  );
  if (await isNotExist(saveDirPath)) {
    await createDirectory(saveDirPath);
  }
  return saveDirPath;
}
