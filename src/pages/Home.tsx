import Calendar from "../components/Home/Calendar";
import CurrentTime from "../components/Home/CurrentTime";
import { Typography, Timeline, Space } from "antd";

const { Title } = Typography;

const HomeLog = [
  "打包上线测试 2023-04-14",
  "完成成绩统计功能 2023-04-13",
  "开始进行教务软件重构开发 2023-04-10",
];

function App() {
  let logItems: any[] = [];
  for (let i = 0; i < HomeLog.length; i++) {
    logItems.push({ children: HomeLog[i] });
  }

  return (
    <>
      <Title>欢迎使用教务软件</Title>

      <Space align="start" size="large">
        <Space direction="vertical" size="large">
          <CurrentTime />
          <Timeline items={logItems.slice(0, 5)} />
        </Space>

        <Calendar />
      </Space>
    </>
  );
}

export default App;
