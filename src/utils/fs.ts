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
