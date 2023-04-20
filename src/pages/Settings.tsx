import React, { useState } from "react";
import { Space, Row, Button, Typography, Modal } from "antd";
import { emit, listen } from "@tauri-apps/api/event";
import { getVersion, getName, getTauriVersion } from "@tauri-apps/api/app";
import { type, arch, platform, version } from "@tauri-apps/api/os";

const { Text, Link } = Typography;

const App: React.FC = () => {
  // store
  const isCheckUpdate = useSettingsStore((state) => state.isCheckingUpdate);
  const { setIsCheckingUpdate } = useSettingsStore.getState();

  const [openSettings, setOpenSettings] = useState(false);
  const [appInfo, setAppInfo] = useState<any>({});

  const showModal = () => {
    setOpenSettings(true);
  };

  const handleOk = () => {
    setOpenSettings(false);
  };

  const handleCancel = () => {
    setOpenSettings(false);
  };

  async function getAppInfo() {
    appInfo.appName = await getName();
    appInfo.appVersion = await getVersion();
    appInfo.tauriVersion = await getTauriVersion();
    appInfo.platform = await platform();
    appInfo.os = await type();
    appInfo.osVersion = await version();
    appInfo.arch = await arch();

    console.log(appInfo);
  }

  function updateApp() {
    emit("update-app");
  }

  useEffect(() => {
    getAppInfo();

    listen("open-settings", () => {
      setIsCheckingUpdate(false);

      setOpenSettings(true);
    });
  }, []);

  return (
    <>
      <Modal
        title="设置"
        open={openSettings}
        onOk={handleOk}
        footer={null}
        onCancel={handleCancel}
        centered
      >
        <Space direction="vertical">
          <Space>
            <Text strong>当前版本:</Text>
            <Text strong>v{appInfo.appVersion}</Text>
            <Button
              size="small"
              type="primary"
              onClick={updateApp}
              loading={isCheckUpdate}
            >
              检查更新
            </Button>
          </Space>

          <Space>
            <Text strong>详情:</Text>
            <Link
              href="https://github.com/lijianran/assistor-app"
              target="_blank"
            >
              https://github.com/lijianran/assistor-app
            </Link>
          </Space>
        </Space>
      </Modal>
    </>
  );
};

export default App;
