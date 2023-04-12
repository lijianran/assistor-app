import React from "react";
import {
  UploadOutlined,
  DotChartOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Button, Typography, Col, Row, Space, Table, Empty } from "antd";

import Steps from "../components/Steps";
import TableTabs from "../components/TableTabs";
import TitleDrawer from "../components/TitleDrawer";
import ParamsSetting from "../components/ParamsSetting";

import { emit } from "@tauri-apps/api/event";

import type { TabsProps } from "antd";
import type { FormInstance } from "antd/es/form";

const { Title } = Typography;

// 获取表格数据
function getTableData(fileData: any[]) {
  const firstLine = fileData[0];

  let titleOptions = [];
  let titleInit: { [key: string]: number } = {};
  let columns = [];
  const keys = Object.keys(firstLine);
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];

    titleOptions.push({
      label: "第" + (index + 1) + "列【" + key + "】",
      value: index,
    });

    titleInit[key] = index;

    columns.push({
      title: key,
      dataIndex: key,
      key: key,
    });
  }

  let tableData = [];
  for (let index = 0; index < fileData.length; index++) {
    let element = fileData[index];
    element["key"] = index + 1;
    tableData.push(element);
  }

  return {
    columns: columns,
    tableData: tableData,
    titleInit: titleInit,
    titleOptions: titleOptions,
  };
}

const App: React.FC = () => {
  // const title_dict = {
  //   姓名: "name",
  //   考号: "id",
  //   班级: "class",
  //   总分: "total",
  //   语文: "chinese",
  //   数学: "math",
  //   英语: "english",
  //   物理: "wuli",
  //   化学: "huaxue",
  //   道法: "daofa",
  //   历史: "lishi",
  //   地理: "dili",
  //   生物: "shengwu",
  // };

  // store
  const currentStep = useScoreStore((state) => state.currentStep);
  const tabKey = useScoreStore((state) => state.tabKey);
  const openDrawer = useScoreStore((state) => state.openDrawer);
  const scoreTitleIndex = useScoreStore((state) => state.scoreTitleIndex);
  const classTitleIndex = useScoreStore((state) => state.classTitleIndex);
  const { setOpenDrawer, setScoreTitleIndex, setClassTitleIndex } =
    useScoreStore.getState();

  // 表格数据
  const [scoreColumns, setScoreColumns] = useState<any[]>([]);
  const [scoreTableData, setScoreTableData] = useState<any[]>([]);
  const [scoreTitleOptions, setScoreTitleOptions] = useState<any[]>([]);
  const scoreFormRef = React.useRef<FormInstance>(null);

  const [classColumns, setClassColumns] = useState<any[]>([]);
  const [classTableData, setClassTableData] = useState<any[]>([]);
  const [classTitleOptions, setClassTitleOptions] = useState<any[]>([]);
  const classFormRef = React.useRef<FormInstance>(null);

  // 选择表格文件
  async function selectFile() {
    const result = await selectOneExcelFile();
    if (!result) return;

    const fileData = await readExcelFile(result);

    if (!fileData) {
      errorMessage("读取失败");
      return;
    }
    const data = getTableData(fileData);
    successMessage("读取成功");

    if (tabKey === "成绩数据表") {
      setScoreColumns(data.columns);
      setScoreTableData(data.tableData);

      // setScoreTitleInit(data.titleInit);
      setScoreTitleIndex(data.titleInit);

      setScoreTitleOptions(data.titleOptions);

      setOpenDrawer(true);
    } else if (tabKey === "班级信息表") {
      setClassColumns(data.columns);
      setClassTableData(data.tableData);

      // setClassTitleInit(data.titleInit);
      setClassTitleIndex(data.titleInit);

      setClassTitleOptions(data.titleOptions);

      setOpenDrawer(true);
    }
  }

  // 表格 tab
  const tabItems: TabsProps["items"] = [
    {
      key: "成绩数据表",
      label: `成绩数据表`,
      children: <Table columns={scoreColumns} dataSource={scoreTableData} />,
      disabled: tabKey != "成绩数据表" && openDrawer,
    },
    {
      key: "班级信息表",
      label: `班级信息表`,
      children: <Table columns={classColumns} dataSource={classTableData} />,
      disabled: tabKey != "班级信息表" && openDrawer,
    },
    {
      key: "参数配置",
      label: `参数配置`,
      children: <ParamsSetting />,
      disabled: tabKey != "参数配置" && openDrawer,
    },
  ];

  // 计算结果
  function computeResult() {}

  return (
    <>
      <Title>成绩统计</Title>

      <Space direction="vertical" size={"large"} wrap>
        <Steps />

        <Row justify="space-between">
          <Col>
            {tabKey === "成绩数据表" && (
              <div>
                <Button
                  onClick={selectFile}
                  icon={<UploadOutlined />}
                  disabled={openDrawer}
                >
                  选择成绩表
                </Button>

                {scoreTableData.length != 0 && (
                  <TitleDrawer
                    titleOptions={scoreTitleOptions}
                    titleInit={scoreTitleIndex}
                    // titleDict={scoreTitleDict}
                    formRef={scoreFormRef}
                  />
                )}
              </div>
            )}
            {tabKey === "班级信息表" && (
              <div>
                <Button
                  onClick={selectFile}
                  disabled={currentStep < 1 || openDrawer}
                  icon={<UploadOutlined />}
                >
                  选择班级表
                </Button>
                {classTableData.length != 0 && (
                  <TitleDrawer
                    titleOptions={classTitleOptions}
                    titleInit={classTitleIndex}
                    // titleDict={classTitleDict}
                    formRef={classFormRef}
                  />
                )}
              </div>
            )}
            {tabKey === "参数配置" && (
              <div>
                <Button
                  disabled={currentStep < 2 || openDrawer}
                  icon={<SettingOutlined />}
                  onClick={() => emit("save-score-setting")}
                >
                  确认配置
                </Button>
              </div>
            )}
          </Col>
          <Col>
            {currentStep === 3 && (
              <Button
                onClick={computeResult}
                type="primary"
                icon={<DotChartOutlined />}
              >
                统计结果
              </Button>
            )}
          </Col>
        </Row>

        <TableTabs items={tabItems} />
      </Space>
    </>
  );
};

export default App;
