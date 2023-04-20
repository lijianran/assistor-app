import React, { useState } from "react";
import { Space, Row, Button, Typography, Modal, message } from "antd";

import {
  checkUpdate as tauriCheckUpdate,
  installUpdate,
  onUpdaterEvent,
} from "@tauri-apps/api/updater";
import { relaunch } from "@tauri-apps/api/process";
import { listen } from "@tauri-apps/api/event";
import { getVersion } from "@tauri-apps/api/app";

const { Text, Link } = Typography;

interface UpdateManifest {
  version: string;
  date: string;
  body: string;
}

const App: React.FC = () => {
  // store
  // const isCheckUpdate = useSettingsStore((state) => state.isCheckingUpdate);
  const { setIsCheckingUpdate } = useSettingsStore.getState();

  const [updaterListen, setUpdaterListen] = useState<any>();
  const [openUpdate, setOpenUpdate] = useState(false);
  const [isDownload, setIsDownload] = useState(false);
  const [appVersion, setAppVersion] = useState<string>("");
  const [updateManifest, setUpdateManifest] = useState<UpdateManifest>({
    version: "",
    date: "",
    body: "",
  });

  const [messageApi, contextHolder] = message.useMessage();

  const startUpdate = async () => {
    // 开始更新
    setIsDownload(true);

    const unListen = await onUpdaterEvent(({ error, status }) => {
      if (error) {
        messageApi.error(status + ": " + error);
        setIsDownload(false);
        // 取消监听
        updaterListen();
      }
    });
    setUpdaterListen(unListen);

    // windows 更新并重启
    await installUpdate();

    // linux mac 重启
    messageApi.success("更新成功，即将重启");
    setTimeout(() => relaunch(), 1000 * 3);
  };

  const handleOk = () => {
    startUpdate();
  };

  const handleCancel = () => {
    setOpenUpdate(false);

    // setInterval(checkUpdate, 1000 * 60 * 60 * 12);
  };

  async function getAppInfo() {
    setAppVersion(await getVersion());
  }

  const checkUpdate = async (hideMessage = true) => {
    setIsCheckingUpdate(true);

    await tauriCheckUpdate()
      .then((res) => {
        if (res.shouldUpdate) {
          if (!res.manifest) {
            if (!hideMessage) {
              messageApi.warning("没有发现符合当前系统的新版本");
            }
            return;
          }
          setUpdateManifest(res.manifest);
          // console.log("updateManifest", res.manifest);

          setOpenUpdate(true);
        } else {
          if (!hideMessage) {
            messageApi.success("当前已经是最新版本 🥳");
          }
        }
      })
      .catch((err) => {
        console.log(err);
        if (!hideMessage) {
          messageApi.warning("获取新版本失败，请稍后重试");
        }
      });

    setIsCheckingUpdate(false);
  };

  useEffect(() => {
    getAppInfo();

    checkUpdate();

    listen("update-app", () => checkUpdate(false));
  }, []);

  return (
    <>
      {contextHolder}
      <Modal
        title="发现新版本可用 🥳"
        open={openUpdate}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel} disabled={isDownload}>
            稍后更新
          </Button>,
          <Button
            key="ok"
            type="primary"
            onClick={handleOk}
            loading={isDownload}
          >
            {isDownload ? "正在更新" : "立即更新"}
          </Button>,
        ]}
        width={400}
        zIndex={1001}
        closable={false}
        maskClosable={false}
        keyboard={false}
        centered
      >
        <Space direction="vertical">
          <Space>
            <Text strong>更新版本:</Text>
            <Text>v{appVersion}</Text>👉
            <Text>v{updateManifest.version}</Text>
          </Space>

          <Space>
            <Text strong>更新时间:</Text>
            <Text>{updateManifest.date.slice(0, 10)}</Text>
          </Space>

          <Space>
            <Text strong>更新详情:</Text>
            <Link
              href="https://github.com/lijianran/assistor-app"
              target="_blank"
            >
              Github
            </Link>
          </Space>
        </Space>
      </Modal>
    </>
  );
};

export default App;
