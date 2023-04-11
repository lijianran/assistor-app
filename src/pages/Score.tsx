import React from "react";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { Button, message, Upload } from "antd";
import { Typography } from "antd";
import { Col, Row, Space } from "antd";
import Calendar from "../components/Calendar";
import TimeLine from "../components/TimeLine";

const { Title } = Typography;

const props: UploadProps = {
  name: "file",
  action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
  headers: {
    authorization: "authorization-text",
  },
  onChange(info) {
    if (info.file.status !== "uploading") {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === "done") {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
};

async function selectFile(e: any) {
  const result = await selectOneExcelFile();
  if (!result) return;

  console.log(result);
  readExcelFile(result);
}

const App: React.FC = () => {
  return (
    <>
      <Title>成绩统计</Title>

      {/* <Upload {...props}> */}
      <Space wrap>
        <Button onClick={selectFile} type="primary" icon={<UploadOutlined />}>
          选择文件
        </Button>
      </Space>

      {/* </Upload> */}
    </>
  );
};

export default App;
