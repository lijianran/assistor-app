import React from "react";
import { Timeline, Space } from "antd";
import { Col, Row } from "antd";

import CurrentTime from "./CurrentTime";

// const App: React.FC = () => (
function App() {
  return (
    <>
      <Space direction="vertical" size="large">
        <CurrentTime />
        {/* <Row> */}
        <Timeline
          items={[
            {
              children: "Create a services site 2015-09-01",
            },
            {
              children: "Solve initial network problems 2015-09-01",
            },
            {
              children: "Technical testing 2015-09-01",
            },
            {
              children: "Network problems being solved 2015-09-01 Network problems being solved 2015-09-01Network problems being solved 2015-09-01",
            },
            // {
            //   children: "Network problems being solved 2015-09-01",
            // },
            // {
            //   children: "Network problems being solved 2015-09-01",
            // },
            // {
            //   children: "Network problems being solved 2015-09-01",
            // },
            // {
            //   children: "Network problems being solved 2015-09-01",
            // },
            // {
            //   children: "Network problems being solved 2015-09-01",
            // },
            // {
            //   children: "Network problems being solved 2015-09-01",
            // },
          ]}
        />
        {/* </Row> */}
      </Space>
    </>
  );
}

export default App;
