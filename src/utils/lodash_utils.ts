import _ from "lodash";

export function orderBy(data: any[], key: any[], order: any[]) {
  return _.orderBy(data, key, order);
}
