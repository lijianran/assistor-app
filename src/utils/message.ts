import { message } from "antd";

export function infoMessage(msg: string) {
  message.info(msg);
}

export function successMessage(msg: string) {
  message.success(msg);
}

export function errorMessage(msg: string) {
  message.error(msg);
}
