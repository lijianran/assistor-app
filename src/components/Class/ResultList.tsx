import { Tag, Button, List } from "antd";
import { FileEntry } from "@tauri-apps/api/fs";

interface DataType {
  name?: string;
  path?: string;
  index: number;
}

function App({ name, currentStep }: any) {
  const [initLoading, setInitLoading] = useState(true);
  const [cache, setCache] = useState<DataType[]>([]);

  async function getFolderData() {
    const documentDirPath = await getDocumentDir();
    const appFileDir = await joinPath(documentDirPath, "教务软件数据");
    if (await isNotExist(appFileDir)) {
      await createDirectory(appFileDir);
    }
    const resultDir = await joinPath(appFileDir, name);
    if (await isNotExist(resultDir)) {
      await createDirectory(resultDir);
    }

    const entries = await readDirectoryData(resultDir);
    processEntries(entries);
  }

  function processEntries(entries: FileEntry[]) {
    let temp = [];
    for (const entry of entries) {
      if (entry.children) {
        // processEntries(entry.children);
        // console.log(entry.name, entry.path, entry.children?.length);
        temp.push({
          name: entry.name,
          path: entry.path,
        });
      }
    }

    temp = orderBy(temp, ["name"], ["desc"]);
    temp.map((item, index) => {
      item.index = index;
    });
    setCache(temp);
    setInitLoading(false);
  }

  useEffect(() => {
    getFolderData();
  }, [currentStep]);

  return (
    <List
      loading={initLoading}
      dataSource={cache}
      pagination={{
        onChange: (page) => {
          // console.log(page);
        },
        pageSize: 3,
      }}
      renderItem={(item, index) => (
        <List.Item
          actions={[
            <Button type="link" onClick={() => openPath(item.path!)}>
              打开
            </Button>,
          ]}
        >
          <List.Item.Meta
            title={
              <div>
                {item.name}
                {item.index === 0 && (
                  <Tag bordered={false} color="red">
                    New
                  </Tag>
                )}
              </div>
            }
            description={item.path}
          />
        </List.Item>
      )}
    />
  );
}

export default App;
