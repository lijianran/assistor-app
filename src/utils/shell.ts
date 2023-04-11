import { open } from "@tauri-apps/api/shell";
import { dirname } from "@tauri-apps/api/path";

// 打开路径
export async function openPath(path: string) {
  await open(path)
    .then()
    .catch((err) => {
      console.log(err);
      errorMessage("打开失败");
    });
}

// 打开路径所在的目录
export async function openPathDir(path: string) {
  const dir_path = await dirname(path);

  openPath(dir_path);
}
