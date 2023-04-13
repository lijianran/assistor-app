import React from "react";
import {
  UploadOutlined,
  DotChartOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Button, Typography, Col, Row, Space, Table, Empty } from "antd";

import type { TabsProps } from "antd";
import type { FormInstance } from "antd/es/form";

import _ from "lodash";
import { emit } from "@tauri-apps/api/event";

import Steps from "../components/Steps";
import TableTabs from "../components/TableTabs";
import TitleDrawer from "../components/TitleDrawer";
import ParamsSetting from "../components/ParamsSetting";

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

function App() {
  // store
  const currentStep = useScoreStore((state) => state.currentStep);
  const tabKey = useScoreStore((state) => state.tabKey);
  const openDrawer = useScoreStore((state) => state.openDrawer);
  const scoreTitleIndex = useScoreStore((state) => state.scoreTitleIndex);
  const classTitleIndex = useScoreStore((state) => state.classTitleIndex);
  const { setOpenDrawer, setScoreTitleIndex, setClassTitleIndex } =
    useScoreStore.getState();

  const subjectScore = useScoreSettingStore((state) => state.subjectScore);
  const kindGood = useScoreSettingStore((state) => state.kindGood);
  const kindOk = useScoreSettingStore((state) => state.kindOk);

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
  async function computeResult() {
    // 结果
    const table: any = {};

    const targetSubjuects = [
      "总分",
      "语文",
      "数学",
      "英语",
      "物理",
      "化学",
      "道法",
      "历史",
      "地理",
      "生物",
    ];

    console.log(scoreTitleIndex);
    console.log(scoreTableData.slice(0, 10));

    // 按班级分组
    const groups = _.groupBy(scoreTableData, (item) => {
      return item.班级;
    });
    console.log(groups);

    // 优秀和及格分数线
    let totalScore = 0;
    let goodScoreDict: { [key: string]: number } = {};
    let okScoreDict: { [key: string]: number } = {};
    _.forEach(subjectScore, (score, subject) => {
      if (scoreTitleIndex[subject] === -1) {
        return;
      }
      totalScore += score;
      goodScoreDict[subject] = _.floor((score * kindGood) / 100 + 0.5);
      okScoreDict[subject] = _.floor((score * kindOk) / 100 + 0.5);
    });
    goodScoreDict["总分"] = _.floor((totalScore * kindGood) / 100 + 0.5);
    okScoreDict["总分"] = _.floor((totalScore * kindOk) / 100 + 0.5);

    console.log(subjectScore, kindGood, kindOk);
    console.log("优秀", goodScoreDict);
    console.log("及格", okScoreDict);

    // 分班级统计
    _.forEach(groups, (scores, className) => {
      // 按总分排序
      groups[className] = _.orderBy(scores, ["总分"], ["desc"]);

      // 统计
      table[className] = { 班级: className };
      _.forEach(targetSubjuects, (subject) => {
        if (scoreTitleIndex[subject] === -1) {
          // 不统计
          return;
        }
        // 平均分
        const meanScore = _.mean(
          _.map(groups[className].slice(0, 55), subject)
        );
        // 统计优秀数据
        const goodNum = _.filter(groups[className], function (o) {
          return o[subject] >= goodScoreDict[subject];
        }).length;
        const goodRatio = goodNum / 55;
        // 统计及格数据
        const okNum = _.filter(groups[className], function (o) {
          return o[subject] >= okScoreDict[subject];
        }).length;
        const okRatio = okNum / 55;
        // 综合数据
        const total = meanScore + okRatio * 100 + goodRatio * 100;

        table[className][subject + "平均分"] = _.round(meanScore, 2);
        table[className][subject + "优秀人数"] = goodNum;
        table[className][subject + "优秀率"] = _.round(goodRatio, 2);
        table[className][subject + "及格人数"] = okNum;
        table[className][subject + "及格率"] = _.round(okRatio, 2);
        table[className][subject + "综合"] = _.round(total, 2);
      });
    });

    console.log("统计", table);

    // 统计排名
    const sortTarget = ["平均分", "优秀率", "及格率", "综合"];
    _.forEach(targetSubjuects, (subject) => {
      if (scoreTitleIndex[subject] === -1) {
        return;
      }

      _.forEach(sortTarget, (target) => {
        let rank = 0;
        let prev = -1;
        let offset = 0;

        // 平均分排名
        _.forEach(
          _.orderBy(table, [subject + target], ["desc"]),
          (item, index) => {
            if (item[subject + target] !== prev) {
              rank += offset + 1;
              offset = 0;
              prev = item[subject + target];
            } else {
              offset += 1;
            }

            table[item["班级"]][subject + target + "排名"] = rank;
          }
        );
      });
    });

    console.log("排名", table);
  }

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
}

export default App;
