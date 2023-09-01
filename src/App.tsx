import {
  CrownOutlined,
  DotChartOutlined,
  TeamOutlined,
  UserOutlined,
  TabletOutlined,
  UserSwitchOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  MergeCellsOutlined,
  ReloadOutlined,
  SettingOutlined,
  InsertRowLeftOutlined,
} from "@ant-design/icons";

import { ProLayout, PageContainer, ProCard } from "@ant-design/pro-components";
import { emit } from "@tauri-apps/api/event";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

// import { emit } from "@tauri-apps/api/event";

export default () => {
  const location = useLocation();
  const navigate = useNavigate();

  function flush() {
    navigate(0);
  }

  function goHome() {
    navigate("/");
  }

  function openSettings() {
    emit("open-settings");
  }

  useEffect(() => {
    window.addEventListener("keydown", (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const isCtrlPressed = event.ctrlKey || event.metaKey;

      if (!isCtrlPressed) {
        return;
      }

      if (key === "r") {
        flush();
        event.preventDefault();
      } else if (key === "e") {
        goHome();
      } else {
        return;
      }
    });
  });
  // const [pathname, setPathname] = useState("/");

  return (
    // <div
    //   id="test-pro-layout"
    //   style={{
    //     height: "100vh",
    //   }}
    // >
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
            name: "班级管理",
            icon: <TeamOutlined />,
            path: "/class",
            routes: [
              {
                path: "/class/shuffle",
                name: "1. 学生分班",
                icon: <TeamOutlined />,
              },
              {
                path: "/class/assign",
                name: "2. 班级分配",
                icon: <CrownOutlined />,
              },
              {
                path: "/class/adjust",
                name: "3. 分班调整",
                icon: <CrownOutlined />,
              },
            ],
          },
          {
            name: "办公工具",
            icon: <InsertRowLeftOutlined />,
            path: "/tools",
            routes: [
              {
                path: "/tools/table_group",
                name: "表格分组",
              },
            ],
          },
        ],
      }}
      location={{
        pathname: location.pathname,
      }}
      waterMarkProps={{
        content: "Assistor",
      }}
      // avatarProps={{
      //   icon: <UserOutlined />,
      //   size: "small",
      //   title: "User",
      // }}
      actionsRender={() => [
        <ReloadOutlined name="test" key="ReloadOutlined" onClick={flush} />,
        <InfoCircleOutlined key="InfoCircleOutlined" onClick={openSettings} />,
        <QuestionCircleOutlined
          key="QuestionCircleOutlined"
          onClick={openDocsFolder}
        />,
        // <MergeCellsOutlined key="MergeCellsOutlined" />,
        // <SettingOutlined onClick={openSettings} />,
      ]}
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
      onMenuHeaderClick={(e: any) => goHome()}
      menuItemRender={(item: any, dom: any) => (
        <Link to={item.path}>{dom}</Link>
      )}
    >
      <Outlet />
    </ProLayout>
    // </div>
  );
};
