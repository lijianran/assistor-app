import { orderBy } from "lodash-es";

export function mySort(data: any[], key: any[], order: any[]) {
  return orderBy(data, key, order);
}
