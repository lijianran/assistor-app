import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/api/notification";

export async function sysNotifyToast(msg: string) {
  let permissionGranted = await isPermissionGranted();

  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === "granted";
  }
  if (permissionGranted) {
    console.log("permissionGranted: ", permissionGranted);

    sendNotification(msg);
    sendNotification({ title: "TAURI", body: "Tauri is awesome!" });
  }
}
