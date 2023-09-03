// 表格分组

import {
  QuestionCircleOutlined,
  UploadOutlined,
  CopyOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import {
  message,
  Button,
  Typography,
  Row,
  Col,
  Steps,
  Table,
  Tabs,
  Select,
} from "antd";

import { omit, groupBy, forEach } from "lodash-es";

import type { TabsProps } from "antd";

import ResultList from "../../components/Class/ResultList";

const { Title, Text } = Typography;

function App() {
  // message
  const [messageApi, contextHolder] = message.useMessage();

  const [tabKey, setTabKey] = useState("表格数据");
  const [currentStep, setCurrentStep] = useState(0);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  const [tableData, setTableData] = useState<any[]>([]);
  const [tableColumns, setTableColumns] = useState<any[]>([]);

  const [selectColumns, setSelectColumns] = useState<any[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string | undefined>(undefined);

  const [groupInfoData, setGroupInfoData] = useState<any[]>([]);
  const [groupInfoColumns, setGroupInfoColumns] = useState<any[]>([]);

  const [groupTableData, setGroupTableData] = useState<any>({});

  useEffect(() => {
    getResultFolder("表格分组");
  }, []);

  // 步骤条
  const stepItems = [
    {
      title: "步骤1",
      description: "上传表格",
    },
    {
      title: "步骤2",
      description: "表格分组",
    },
    {
      title: "步骤3",
      description: "分组结果",
    },
  ];

  // 选择表格
  async function selectFile() {
    setButtonLoading(true);

    // 导出路径
    const result = await selectOneExcelFile();
    if (!result) {
      setButtonLoading(false);
      return;
    }

    const fileData = await readExcelFile(result);
    setButtonLoading(false);

    if (!fileData) {
      messageApi.error("读取失败");
      return;
    }
    // 解析数据
    const data = getTableData(fileData);
    messageApi.success("读取成功");
    setSelectedColumn(undefined);
    setGroupInfoData([]);

    // data
    setTableColumns(data.columns);
    setTableData(data.tableData);

    // select column to group
    let columns_temp = [];
    for (let index = 0; index < data.columns.length; index++) {
      const column_name = data.columns[index]["title"];
      columns_temp.push({
        value: column_name,
        label: column_name,
      });
    }
    setSelectColumns(columns_temp);

    setCurrentStep(1);
    setTabKey("数据分组");
  }

  // 分组
  async function groupTable(column: string) {
    const group_list = groupBy(tableData, column);

    let groupInfo: any[] = [];
    forEach(group_list, (group, name) => {
      groupInfo.push({
        key: name,
        column: name,
        count: group.length,
      });
    });
    setGroupTableData(group_list);

    setGroupInfoColumns([
      {
        title: column,
        dataIndex: "column",
        key: "column",
      },
      {
        title: "数量",
        dataIndex: "count",
        key: "count",
      },
    ]);
    setGroupInfoData(groupInfo);
    setSelectedColumn(column);
  }

  // 确认分组
  async function splitTable() {
    setCurrentStep(2);
    setTabKey("分组结果");
  }

  // 选择一列分组
  let selectColumn = (
    <Row>
      <Col span={24}>
        <Row gutter={16}>
          <Col span={12}>
            <Select
              value={selectedColumn}
              placeholder="请选择要分组的一列"
              style={{ width: "100%" }}
              onChange={groupTable}
              options={selectColumns}
            />
          </Col>
          <Col span={12}>
            <Row justify="end">
              <Text>
                类别: {groupInfoData.length} / 总数: {tableData.length}
              </Text>
            </Row>
          </Col>
        </Row>
        <Table columns={groupInfoColumns} dataSource={groupInfoData} />
      </Col>
    </Row>
  );

  // 保存结果
  async function saveTables() {
    setCurrentStep(2);
    // 导出路径
    const saveDirPath = await getSaveFolder("表格分组");

    forEach(groupTableData, async (group, name) => {
      const table = group.map((item: any) => {
        item = omit(item, "key");
        return item;
      });
      const path = await joinPath(saveDirPath, name + ".xlsx");
      await writeExcelFile(path, table, Object.keys(table[0]));
    });

    // 打开路径
    openPath(saveDirPath);
    // 完成
    setCurrentStep(3);
  }

  // tab
  const tabItems: TabsProps["items"] = [
    {
      key: "表格数据",
      label: `表格数据`,
      children: (
        <Table
          columns={tableColumns}
          dataSource={tableData}
          scroll={{ x: true }}
        />
      ),
    },
    {
      key: "数据分组",
      label: `数据分组`,
      children: selectColumn,
    },
    {
      key: "分组结果",
      label: `分组结果`,
      children: <ResultList name={"表格分组"} currentStep={currentStep} />,
    },
  ];

  return (
    <>
      {contextHolder}
      <Title>
        表格分组
        <Button
          type="text"
          shape="circle"
          icon={<QuestionCircleOutlined />}
          onClick={openDocsFolder}
        />
      </Title>

      <Row gutter={[0, 24]}>
        <Col span={24}>
          <Steps current={currentStep} items={stepItems} type="default" />
        </Col>

        <Col span={24}>
          {tabKey === "表格数据" && (
            <div>
              <Button
                type="primary"
                loading={buttonLoading}
                icon={<UploadOutlined />}
                onClick={selectFile}
              >
                上传表格
              </Button>
            </div>
          )}
          {tabKey === "数据分组" && (
            <div>
              <Button
                type="primary"
                disabled={currentStep < 1 || !selectedColumn}
                icon={<CopyOutlined />}
                onClick={splitTable}
              >
                确认分组
              </Button>
            </div>
          )}
          {tabKey === "分组结果" && (
            <div>
              <Button
                type="primary"
                disabled={currentStep < 2}
                icon={<FolderOpenOutlined />}
                onClick={saveTables}
              >
                下载结果
              </Button>
            </div>
          )}
        </Col>

        <Col span={24}>
          <Tabs
            activeKey={tabKey}
            items={tabItems}
            onTabClick={(key) => {
              setTabKey(key);
            }}
          />
        </Col>
      </Row>
    </>
  );
}

export default App;
