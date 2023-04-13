import dayjs from "dayjs";

export function currentTime() {
  return dayjs(`${new Date()}`).format("YYYY-MM-DD HH:mm:ss");
}

export function timeDirName() {
  return dayjs(`${new Date()}`).format("YYYYMMDDHHmmss");
}
