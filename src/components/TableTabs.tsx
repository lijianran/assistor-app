import React from "react";
import { Tabs } from "antd";
import type { TabsProps } from "antd";

// const onChange = (key: string) => {
//   console.log(key);
// };

function App({ tabIndex, changeTab, items }: any) {
  return <Tabs defaultActiveKey={tabIndex} items={items} onChange={changeTab} />;
}

export default App;
