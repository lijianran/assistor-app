import React from "react";
import { Tabs } from "antd";
import type { TabsProps } from "antd";

function App({ items }: any) {
  // store
  const tabKey = useScoreStore((state) => state.tabKey);
  const { setTabKey } = useScoreStore.getState();

  function changeTab(key: string) {
    setTabKey(key as TabKey);
  }

  return <Tabs activeKey={tabKey} items={items} onTabClick={changeTab} />;
}

export default App;
