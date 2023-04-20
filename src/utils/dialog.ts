import { open } from "@tauri-apps/api/dialog";
import { homeDir, desktopDir } from "@tauri-apps/api/path";

async function openSelect(
  default_path = "",
  multiple = false,
  directory = false,
  select_name = "File",
  extensions = ["*"]
) {
  if (!default_path) {
    default_path = await desktopDir();
  }
  const selected = await open({
    multiple: multiple,
    directory: directory,
    filters: [
      {
        name: select_name,
        extensions: extensions,
      },
    ],
    defaultPath: default_path,
  });

  if (selected) {
    return selected;
  } else {
    return "";
  }
}

export async function selectOneExcelFile(default_path = "") {
  const selected = await openSelect(default_path, false, false, "Excel", [
    "xlsx",
    "xls",
  ]);

  if (selected) {
    return selected as string;
  } else {
    return "";
  }
}

export async function selectOneImageFile(default_path = "") {
  const selected = await openSelect(default_path, false, false, "Image", [
    "png",
    "jpg",
    "jpeg",
  ]);

  if (selected) {
    return selected as string;
  } else {
    return "";
  }
}

export async function selectOneImageFiles(default_path = "") {
  const selected = await openSelect(default_path, true, false, "Image", [
    "png",
    "jpg",
    "jpeg",
  ]);

  if (selected) {
    return selected as string[];
  } else {
    return [];
  }
}

export async function selectOneRuleFile(default_path = "") {
  const selected = await openSelect(default_path, false, false, "Image", [
    "yaml",
    "yml",
  ]);

  if (selected) {
    return selected as string;
  } else {
    return "";
  }
}

export async function selectDirectory(default_path = "") {
  const selected = await openSelect(default_path, false, true, "Directory", []);

  if (selected) {
    return selected as string;
  } else {
    return "";
  }
}
