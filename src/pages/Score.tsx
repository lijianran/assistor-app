import React from "react";
import {
  UploadOutlined,
  DotChartOutlined,
  AreaChartOutlined,
  TableOutlined,
  QuestionCircleOutlined,
  BorderlessTableOutlined,
  SettingOutlined,
  FolderOpenOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
import { Tour, Button, Typography, Col, Row, Space, Table, Empty } from "antd";

import type { TabsProps, TourProps } from "antd";

import _ from "lodash";
import { emit } from "@tauri-apps/api/event";

import Steps from "../components/Score/Steps";
import TableTabs from "../components/Score/TableTabs";
import TitleDrawer from "../components/Score/TitleDrawer";
import ParamsSetting from "../components/Score/ParamsSetting";
import ScoreResultList from "../components/Score/ScoreResultList";

const { Title } = Typography;

// 获取表格数据
function getTableData(fileData: any[]) {
  const firstLine = fileData[0];

  let titleOptions = [];
  let titleInit: { [key: string]: string } = {};
  let columns = [];
  const keys = Object.keys(firstLine);
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];

    titleOptions.push({
      label: "第" + (index + 1) + "列【" + key + "】",
      value: key,
    });

    titleInit[key] = key;

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
  const {
    setCurrentStep,
    setOpenDrawer,
    setScoreTitleIndex,
    setClassTitleIndex,
    setScoreTitleOptions,
    setClassTitleOptions,
  } = useScoreStore.getState();

  const subjectScore = useScoreSettingStore((state) => state.subjectScore);
  const kindGood = useScoreSettingStore((state) => state.kindGood);
  const kindOk = useScoreSettingStore((state) => state.kindOk);

  // 表格数据
  const [scoreColumns, setScoreColumns] = useState<any[]>([]);
  const [scoreTableData, setScoreTableData] = useState<any[]>([]);

  const [classColumns, setClassColumns] = useState<any[]>([]);
  const [classTableData, setClassTableData] = useState<any[]>([]);

  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  // 选择表格文件
  async function selectFile() {
    setButtonLoading(true);
    const result = await selectOneExcelFile();
    if (!result) {
      setButtonLoading(false);
      return;
    }

    const fileData = await readExcelFile(result);
    setButtonLoading(false);

    if (!fileData) {
      errorMessage("读取失败");
      return;
    }
    const data = getTableData(fileData);
    successMessage("读取成功");

    if (tabKey === "成绩数据表") {
      // data
      setScoreColumns(data.columns);
      setScoreTableData(data.tableData);

      // store
      setScoreTitleIndex(data.titleInit);
      setScoreTitleOptions(data.titleOptions);

      setOpenDrawer(true);
    } else if (tabKey === "班级信息表") {
      // data
      setClassColumns(data.columns);
      setClassTableData(data.tableData);

      // store
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
    {
      key: "计算结果",
      label: `计算结果`,
      children: <ScoreResultList />,
      disabled: tabKey != "计算结果" && openDrawer,
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
    console.log(classTitleIndex);
    console.log(classTableData.slice(0, 10));

    const classInfoDict = _.keyBy(classTableData, classTitleIndex["班级"]);
    console.log("班级信息", classInfoDict);

    // 按班级分组
    const groups = _.groupBy(scoreTableData, (item) => {
      return item[scoreTitleIndex["班级"]];
    });
    console.log("分班级", groups);

    // 优秀和及格分数线
    let totalScore = 0;
    let goodScoreDict: { [key: string]: number } = {};
    let okScoreDict: { [key: string]: number } = {};
    _.forEach(subjectScore, (score, subject) => {
      if (scoreTitleIndex[subject] === "无") {
        return;
      }
      totalScore += score;
      goodScoreDict[subject] = _.floor((score * kindGood) / 100 + 0.5);
      okScoreDict[subject] = _.floor((score * kindOk) / 100 + 0.5);
    });
    goodScoreDict["总分"] = _.floor((totalScore * kindGood) / 100 + 0.5);
    okScoreDict["总分"] = _.floor((totalScore * kindOk) / 100 + 0.5);

    console.log("参数配置", subjectScore, kindGood, kindOk);
    console.log("优秀分数线", goodScoreDict);
    console.log("及格分数线", okScoreDict);

    // 分班级统计
    _.forEach(groups, (scores, className) => {
      // 按总分排序
      groups[className] = _.orderBy(
        scores,
        [scoreTitleIndex["总分"]],
        ["desc"]
      );
      // 班级有效人数
      if (!(className in classInfoDict)) {
        errorMessage("班级信息表中缺少班级: " + className);
        return;
      }
      const countNum = classInfoDict[className][classTitleIndex["人数"]];

      // 统计
      table[className] = { 班级: className };
      _.forEach(targetSubjuects, (subject) => {
        // 表中索引
        const index = scoreTitleIndex[subject];
        // 不统计
        if (index === "无") {
          return;
        }

        // 教师
        let teacherName;
        if (classTitleIndex[subject] in classInfoDict[className]) {
          teacherName = classInfoDict[className][classTitleIndex[subject]];
        } else {
          teacherName = "";
        }

        // 平均分
        const meanScore = _.mean(
          _.map(groups[className].slice(0, countNum), index)
        );

        // 统计优秀数据
        const goodNum = _.filter(groups[className], function (o) {
          // 达到优秀线
          return o[index] >= goodScoreDict[subject];
        }).length;
        const goodRatio = goodNum / countNum;

        // 统计及格数据
        const okNum = _.filter(groups[className], function (o) {
          // 达到及格线
          return o[index] >= okScoreDict[subject];
        }).length;
        const okRatio = okNum / countNum;

        // 综合数据
        const total = meanScore + okRatio * 100 + goodRatio * 100;

        if (subject !== "总分") {
          table[className][subject + "教师"] = teacherName;
        }
        table[className][subject + "平均分"] = _.round(meanScore, 2);
        table[className][subject + "优秀人数"] = goodNum;
        table[className][subject + "优秀率"] = goodRatio;
        table[className][subject + "及格人数"] = okNum;
        table[className][subject + "及格率"] = okRatio;
        table[className][subject + "综合"] = _.round(total, 2);
      });
    });

    console.log("统计", table);

    // 统计各项排名
    const sortTarget = ["平均分", "优秀率", "及格率", "综合"];
    _.forEach(targetSubjuects, (subject) => {
      // 表中索引
      const index = scoreTitleIndex[subject];
      if (index === "无") {
        return;
      }

      // 统计排名
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

    // 导出路径
    const documentDirPath = await getDocumentDir();
    const appFileDir = await joinPath(documentDirPath, "教务软件数据");
    if (await isNotExist(appFileDir)) {
      await createDirectory(appFileDir);
    }
    const scoreFileDir = await joinPath(appFileDir, "成绩统计");
    if (await isNotExist(scoreFileDir)) {
      await createDirectory(scoreFileDir);
    }
    const saveDirPath = await joinPath(scoreFileDir, timeDirName());
    if (await isNotExist(saveDirPath)) {
      await createDirectory(saveDirPath);
    }

    // 导出结果
    const suffix = [
      "教师",
      "平均分",
      "平均分排名",
      "优秀人数",
      "优秀率",
      "优秀率排名",
      "及格人数",
      "及格率",
      "及格率排名",
      "综合",
      "综合排名",
    ];
    _.forEach(targetSubjuects, async (subject) => {
      // 不导出
      if (scoreTitleIndex[subject] === "无") {
        return;
      }

      const data = _.values(table);

      // 转换为百分制
      const values = _.map(data, (dict) => {
        _.forOwn(dict, (value, key) => {
          if (
            _.isNumber(value) &&
            (key.endsWith("优秀率") || key.endsWith("及格率"))
          ) {
            dict[key] = _.round(value * 100, 2) + "%";
          }
        });
        return dict;
      });

      const filteredDictList = values.map((dict) =>
        _.pickBy(
          dict,
          (value, key) =>
            key.includes(subject) || key === scoreTitleIndex["班级"]
        )
      );
      const path = await joinPath(saveDirPath, subject + ".xlsx");
      const header = _.map(suffix, function (value) {
        return subject + value;
      });
      await writeExcelFile(path, filteredDictList, ["班级", ...header]);
    });
    // 打开路径
    openPath(saveDirPath);
    // 完成
    setCurrentStep(4);
  }

  return (
    <>
      <Title>
        成绩统计
        <Button
          type="text"
          shape="circle"
          icon={<QuestionCircleOutlined />}
          onClick={() => {}}
        />
      </Title>

      <Space direction="vertical" size={"large"} wrap>
        <Steps />

        <Row justify="space-between">
          {tabKey === "成绩数据表" && (
            <div>
              <Button
                onClick={selectFile}
                loading={buttonLoading}
                icon={<UploadOutlined />}
              >
                选择成绩表
              </Button>

              {scoreTableData.length != 0 && <TitleDrawer />}
            </div>
          )}
          {tabKey === "班级信息表" && (
            <div>
              <Button
                onClick={selectFile}
                loading={buttonLoading}
                icon={<UploadOutlined />}
                disabled={currentStep < 1}
              >
                选择班级表
              </Button>

              {classTableData.length != 0 && <TitleDrawer />}
            </div>
          )}
          {tabKey === "参数配置" && (
            <div>
              <Button
                type="primary"
                icon={<SettingOutlined />}
                disabled={currentStep < 2 || openDrawer}
                onClick={() => emit("save-score-setting")}
              >
                确认配置
              </Button>
            </div>
          )}
          {tabKey === "计算结果" && (
            <div>
              <Button
                type="primary"
                onClick={computeResult}
                icon={<AreaChartOutlined />}
                disabled={currentStep < 3 || openDrawer}
              >
                统计结果
              </Button>
            </div>
          )}
        </Row>

        <TableTabs items={tabItems} />
      </Space>
    </>
  );
}

export default App;
