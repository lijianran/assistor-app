import React from "react";
import {
  UploadOutlined,
  DotChartOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import type { UploadProps, TabsProps } from "antd";
import { Button, Typography, Col, Row, Space, Table, Empty } from "antd";

import Steps from "../components/Steps";
import ScoreTable from "../components/ScoreTable";
import TableTabs from "../components/TableTabs";
import TitleDrawer from "../components/TitleDrawer";
import TitleForm from "../components/TitleForm";

import type { FormInstance } from "antd/es/form";

const { Title } = Typography;

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
  // 步骤条
  // const [currentStep, setCurrentStep] = useState(0);

  const title_dict = {
    姓名: "name",
    考号: "id",
    班级: "class",
    总分: "total",
    语文: "chinese",
    数学: "math",
    英语: "english",
    物理: "wuli",
    化学: "huaxue",
    道法: "daofa",
    历史: "lishi",
    地理: "dili",
    生物: "shengwu",
  };

  // store
  const currentStep = useScoreStore((state) => state.currentStep);
  const tabKey = useScoreStore((state) => state.tabKey);
  const openDrawer = useScoreStore((state) => state.openDrawer);
  const scoreTitleIndex = useScoreStore((state) => state.scoreTitleIndex);
  const classTitleIndex = useScoreStore((state) => state.classTitleIndex);
  const {
    setCurrentStep,
    setOpenDrawer,
    setScoreTitleIndex,
    setClassTitleIndex,
  } = useScoreStore.getState();

  // const scoreTitleDict = [
  //   { label: "姓名", value: "name" },
  //   { label: "考号", value: "id" },
  //   { label: "班级", value: "class", required: true },
  //   { label: "总分", value: "total" },
  //   { label: "语文", value: "chinese" },
  //   { label: "数学", value: "math" },
  //   { label: "英语", value: "english" },
  //   { label: "物理", value: "wuli" },
  //   { label: "化学", value: "huaxue" },
  //   { label: "道法", value: "daofa" },
  //   { label: "历史", value: "lishi" },
  //   { label: "地理", value: "dili" },
  //   { label: "生物", value: "shengwu" },
  // ];
  // const classTitleDict = [
  //   { label: "班级", value: "class", required: true },
  //   { label: "语文", value: "chinese" },
  //   { label: "数学", value: "math" },
  //   { label: "英语", value: "english" },
  //   { label: "物理", value: "wuli" },
  //   { label: "化学", value: "huaxue" },
  //   { label: "道法", value: "daofa" },
  //   { label: "历史", value: "lishi" },
  //   { label: "地理", value: "dili" },
  //   { label: "生物", value: "shengwu" },
  //   { label: "人数", value: "count", required: true },
  // ];

  // 表格数据
  const [scoreColumns, setScoreColumns] = useState<any[]>([]);
  const [scoreTableData, setScoreTableData] = useState<any[]>([]);
  const [scoreTitleOptions, setScoreTitleOptions] = useState<any[]>([]);
  const scoreFormRef = React.useRef<FormInstance>(null);

  const [classColumns, setClassColumns] = useState<any[]>([]);
  const [classTableData, setClassTableData] = useState<any[]>([]);
  const [classTitleOptions, setClassTitleOptions] = useState<any[]>([]);
  const classFormRef = React.useRef<FormInstance>(null);

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
      // if (currentStep < 1) {
      //   setCurrentStep(1);
      // }
    } else if (tabKey === "班级信息表") {
      setClassColumns(data.columns);
      setClassTableData(data.tableData);

      // setClassTitleInit(data.titleInit);
      setClassTitleIndex(data.titleInit);

      setClassTitleOptions(data.titleOptions);

      setOpenDrawer(true);
      // if (currentStep < 2) {
      //   setCurrentStep(2);
      // }
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
      children: <Empty />,
      disabled: tabKey != "参数配置" && openDrawer,
    },
  ];

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
                >
                  配置
                </Button>
              </div>
            )}
          </Col>
          <Col>
            {currentStep === 3 && (
              <Button
                onClick={selectFile}
                type="primary"
                icon={<DotChartOutlined />}
              >
                统计结果
              </Button>
            )}
          </Col>
        </Row>

        {/* <Button
          onClick={selectFile}
          type="primary"
          disabled={currentStep == 0}
          icon={<UploadOutlined />}
        >
          {tabIndex === "成绩表" && "选择成绩表"}
          {tabIndex === "人数表" && "选择人数表"}
          {tabIndex === "教师表" && "选择教师表"}
        </Button> */}

        <TableTabs items={tabItems} />
        {/* <ScoreTable /> */}
        {/* <Table columns={columns} dataSource={tableData} /> */}
      </Space>
    </>
  );
};

export default App;
