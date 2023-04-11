import React from "react";
import { UploadOutlined, DotChartOutlined } from "@ant-design/icons";
import type { UploadProps, TabsProps } from "antd";
import { Button, Typography, Col, Row, Space, Table } from "antd";

import Steps from "../components/Steps";
import ScoreTable from "../components/ScoreTable";
import TableTabs from "../components/TableTabs";
import TitleDrawer from "../components/TitleDrawer";
import TitleForm from "../components/TitleForm";

import type { FormInstance } from "antd/es/form";

const { Title } = Typography;

const App: React.FC = () => {
  // 步骤条
  const [currentStep, setCurrentStep] = useState(0);
  const stepItems = [
    {
      title: "步骤1",
      description: "上传成绩数据表",
    },
    {
      title: "步骤2",
      description: "上传班级信息表",
      // subTitle: "Left 00:00:08",
    },
    {
      title: "步骤3",
      description: "配置参数",
    },
    {
      title: "步骤4",
      description: "统计结果",
    },
  ];

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

  // title 选择
  const [scoreTitleInit, setScoreTitleInit] = useState<{
    [key: string]: number;
  }>({
    姓名: -1,
    考号: -1,
    班级: -1,
    总分: -1,
    语文: -1,
    数学: -1,
    英语: -1,
    物理: -1,
    化学: -1,
    道法: -1,
    历史: -1,
    地理: -1,
    生物: -1,
  });
  const [classTitleInit, setClassTitleInit] = useState<{
    [key: string]: number;
  }>({
    班级: -1,
    语文: -1,
    数学: -1,
    英语: -1,
    物理: -1,
    化学: -1,
    道法: -1,
    历史: -1,
    地理: -1,
    生物: -1,
    人数: -1,
  });

  // 表格数据
  const [scoreColumns, setScoreColumns] = useState<any[]>([]);
  const [scoreTableData, setScoreTableData] = useState<any[]>([]);
  const [scoreTitleOptions, setScoreTitleOptions] = useState<any[]>([]);
  const scoreFormRef = React.useRef<FormInstance>(null);

  const [classColumns, setClassColumns] = useState<any[]>([]);
  const [classTableData, setClassTableData] = useState<any[]>([]);
  const [classTitleOptions, setClassTitleOptions] = useState<any[]>([]);
  const classFormRef = React.useRef<FormInstance>(null);

  // const [studentColumns, setStudentColumns] = useState<any[]>([]);
  // const [studentTableData, setStudentTableData] = useState<any[]>([]);

  // const [teacherColumns, setTeacherColumns] = useState<any[]>([]);
  // const [teacherTableData, setTeacherTableData] = useState<any[]>([]);

  let scoreData: Array<{ [key: string]: any }> = [];
  function getTableData() {
    const firstLine = scoreData[0];

    let titleOptions = [];
    let titleInit: { [key: string]: number } = {};
    let columns = [];
    const keys = Object.keys(firstLine);
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      console.log(key);

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
    for (let index = 0; index < scoreData.length; index++) {
      let element = scoreData[index];
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
  async function selectFile() {
    const result = await selectOneExcelFile();
    if (!result) return;

    scoreData = await readExcelFile(result);

    if (!scoreData) {
      errorMessage("读取失败");
      return;
    }

    const data = getTableData();

    if (tabIndex === "成绩数据表") {
      setScoreColumns(data.columns);
      setScoreTableData(data.tableData);
      setScoreTitleInit(data.titleInit);
      setScoreTitleOptions(data.titleOptions);
      if (currentStep < 1) {
        setCurrentStep(1);
      }
    } else if (tabIndex === "班级信息表") {
      setClassColumns(data.columns);
      setClassTableData(data.tableData);
      setClassTitleInit(data.titleInit);
      setClassTitleOptions(data.titleOptions);
      if (currentStep < 2) {
        setCurrentStep(2);
      }
    }
  }

  // 表格 tab
  const [tabIndex, setTabIndex] = useState("成绩数据表");
  const tabItems: TabsProps["items"] = [
    {
      key: "成绩数据表",
      label: `成绩数据表`,
      children: <Table columns={scoreColumns} dataSource={scoreTableData} />,
    },
    {
      key: "班级信息表",
      label: `班级信息表`,
      children: <Table columns={classColumns} dataSource={classTableData} />,
    },
  ];
  function changeTab(tabKey: string) {
    setTabIndex(tabKey);
  }

  return (
    <>
      <Title>成绩统计</Title>

      <Space direction="vertical" size={"large"} wrap>
        <Steps current={currentStep} items={stepItems} />

        <Row justify="space-between">
          <Col>
            {tabIndex === "成绩数据表" && (
              <div>
                <Button onClick={selectFile} icon={<UploadOutlined />}>
                  选择成绩表
                </Button>

                {currentStep > 0 && (
                  <TitleDrawer
                    titleOptions={scoreTitleOptions}
                    titleInit={scoreTitleInit}
                    formRef={scoreFormRef}
                  />
                )}
              </div>
            )}
            {tabIndex === "班级信息表" && (
              <Button
                onClick={selectFile}
                disabled={currentStep < 1}
                icon={<UploadOutlined />}
              >
                选择班级表
              </Button>
            )}

            {currentStep > 1 && (
              <TitleDrawer
                titleOptions={classTitleOptions}
                titleInit={classTitleInit}
                formRef={classFormRef}
              />
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

        <TableTabs tabIndex={tabIndex} changeTab={changeTab} items={tabItems} />
        {/* <ScoreTable /> */}
        {/* <Table columns={columns} dataSource={tableData} /> */}
      </Space>
    </>
  );
};

export default App;
