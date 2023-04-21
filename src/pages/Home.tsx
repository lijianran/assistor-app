import Calendar from "../components/Home/Calendar";
import CurrentTime from "../components/Home/CurrentTime";
import { Typography, Timeline, Space } from "antd";

const { Title } = Typography;

function App() {
  const [logItems, setLogItems] = useState<any[]>([]);
  async function getHomeLog() {
    const logPath = await getResourcePath("resources", "dev", "home_log.txt");
    const logData = await readTextFileData(logPath);
    const logList = logData.split(/[\n,]/g).filter((item) => item !== "");

    let items: any[] = [];
    for (let i = 0; i < logList.length; i++) {
      items.push({ children: logList[i] });
    }
    setLogItems(items);
  }

  useEffect(() => {
    getHomeLog();
  });

  return (
    <>
      <Title>欢迎使用教务软件</Title>

      <Space align="start" size="large">
        <Space direction="vertical" size="large">
          <CurrentTime />
          <Timeline items={logItems.slice(0, 8)} />
        </Space>

        <Calendar />
      </Space>
    </>
  );
}

export default App;
