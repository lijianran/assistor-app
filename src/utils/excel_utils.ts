import * as XLSX from "xlsx";
import {
  readBinaryFile,
  writeBinaryFile,
  BaseDirectory,
} from "@tauri-apps/api/fs";

export async function readExcelFile(filePath: string) {
  const contents = await readBinaryFile(filePath);

  const workbook = XLSX.read(contents);

  let resData: any[] = [];
  // 遍历每张工作表进行读取（这里默认只读取第一张表）
  for (const sheet in workbook.Sheets) {
    if (workbook.Sheets.hasOwnProperty(sheet)) {
      // 利用 sheet_to_json 方法将 excel 转成 json 数据
      resData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
      break; // 如果只取第一张表，就取消注释这行
    }
  }

  return resData;
}

export async function writeExcelFile(
  filePath: string,
  data: any[],
  header: string[]
) {
  const sheet = XLSX.utils.json_to_sheet(data, { header });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Sheet1");

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

  await writeBinaryFile(filePath, buffer);
}
