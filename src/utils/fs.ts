import { removeFile } from '@tauri-apps/api/fs'

// 删除文件
export async function deleteFile(file_path: string) {
  await removeFile(file_path)
}
