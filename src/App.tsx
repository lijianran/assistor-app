import {
  CrownOutlined,
  DotChartOutlined,
  InfoCircleOutlined,
  MergeCellsOutlined,
  QuestionCircleOutlined,
  TabletOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { ProLayout, PageContainer, ProCard } from "@ant-design/pro-components";
import { Button, Result } from "antd";
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { emit } from "@tauri-apps/api/event";
import { isRegistered, register } from "@tauri-apps/api/globalShortcut";

// import Home from "../App";
// import ErrorPage from "./error-page";

export default () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.addEventListener("keydown", (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const isCtrlPressed = event.ctrlKey || event.metaKey;

      if (!isCtrlPressed) {
        return;
      }

      if (key === "r") {
        navigate(0);
        event.preventDefault();
      } else if (key === "e") {
        navigate("/");
      } else if (key === "d") {
        emit("open_devtools");
      } else {
        return;
      }
    });
  });
  // const [pathname, setPathname] = useState("/");

  return (
    <div
      id="test-pro-layout"
      style={{
        height: "100vh",
      }}
    >
      <ProLayout
        title="功能菜单"
        fixSiderbar
        route={{
          path: "/",
          routes: [
            {
              path: "/",
              name: "主页",
              icon: <CrownOutlined />,
              // access: "canAdmin",
              // component: <Home />,
            },
            {
              path: "/score",
              name: "成绩统计",
              icon: <DotChartOutlined />,
              // access: "canAdmin",
              // component: <Home />,
            },
            {
              name: "测试二级菜单",
              icon: <TabletOutlined />,
              path: "/list",
              component: "./ListTableList",
              routes: [
                {
                  path: "/list/sub-page2",
                  name: "二级列表页面",
                  icon: <CrownOutlined />,
                  component: "./Welcome",
                },
                {
                  path: "/list/sub-page3",
                  name: "三级列表页面",
                  icon: <CrownOutlined />,
                  component: "./Welcome",
                },
              ],
            },
          ],
        }}
        location={{
          pathname: location.pathname,
        }}
        waterMarkProps={{
          content: "Pro Layout",
        }}
        // avatarProps={{
        //   icon: <UserOutlined />,
        //   size: "small",
        //   title: "lijianran",
        // }}
        // actionsRender={() => [
        //   <InfoCircleOutlined key="InfoCircleOutlined" />,
        //   <QuestionCircleOutlined key="QuestionCircleOutlined" />,
        //   <MergeCellsOutlined key="MergeCellsOutlined" />,
        // ]}
        // menuFooterRender={(props: any) => {
        //   if (props?.collapsed) return undefined;
        //   return (
        //     <p
        //       style={{
        //         textAlign: "center",
        //         color: "rgba(0,0,0,0.6)",
        //         paddingBlockStart: 12,
        //       }}
        //     >
        //       Power by Ant Design
        //     </p>
        //   );
        // }}
        onMenuHeaderClick={(e: any) => console.log(e)}
        menuItemRender={(item: any, dom: any) => (
          <Link to={item.path}>{dom}</Link>
        )}
      >
        <Outlet />
      </ProLayout>
    </div>
  );
};
