import React from "react";
import { Steps } from "antd";

const description = "This is a description.";
function App({ current, items }: any) {
  return <Steps current={current} items={items} />;
}

export default App;
