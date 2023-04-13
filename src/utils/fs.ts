import { exists, createDir, removeFile } from "@tauri-apps/api/fs";

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
