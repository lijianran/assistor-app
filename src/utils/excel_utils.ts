// import { read, write, utils } from "xlsx";
import {
  readBinaryFile,
  writeBinaryFile,
  BaseDirectory,
} from "@tauri-apps/api/fs";

export async function readExcelFile(filePath: string) {
  const contents = await readBinaryFile(filePath);
  let resData: any[] = [];

  import("xlsx").then((XLSX) => {
    const workbook = XLSX.read(contents);

    // 遍历每张工作表进行读取（这里默认只读取第一张表）
    for (const sheet in workbook.Sheets) {
      if (workbook.Sheets.hasOwnProperty(sheet)) {
        // 利用 sheet_to_json 方法将 excel 转成 json 数据
        resData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
        break; // 如果只取第一张表，就取消注释这行
      }
    }
  });

  return resData;
}

export async function writeExcelFile(
  filePath: string,
  data: any[],
  header: string[]
) {
  let buffer: any;
  import("xlsx").then((XLSX) => {
    const sheet = XLSX.utils.json_to_sheet(data, { header });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Sheet1");

    buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
  });
  await writeBinaryFile(filePath, buffer);
}

// 获取表格数据
export function getTableData(fileData: any[]) {
  const firstLine = fileData[0];

  let titleOptions = [];
  let titleInit: { [key: string]: string } = {};
  let columns = [];
  const keys = Object.keys(firstLine);
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];

    titleOptions.push({
      label: "第" + (index + 1) + "列【" + key + "】",
      value: key,
    });

    titleInit[key] = key;

    columns.push({
      title: key,
      dataIndex: key,
      key: key,
    });
  }

  let tableData = [];
  for (let index = 0; index < fileData.length; index++) {
    let element = fileData[index];
    element["key"] = index + 1;
    tableData.push(element);
  }

  return {
    columns: columns,
    tableData: tableData,
    titleInit: titleInit,
    titleOptions: titleOptions,
  };
}
