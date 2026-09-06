// 成绩统计

import {
  UploadOutlined,
  AreaChartOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { message, Button, Typography, Row, Col, Space, Table } from "antd";

import type { TabsProps, TourProps } from "antd";

import {
  groupBy,
  orderBy,
  forEach,
  mean,
  map,
  filter,
  round,
  values,
  max,
} from "lodash-es";

import { emit } from "@tauri-apps/api/event";
import { useLocation } from "react-router-dom";

import Steps from "../components/Score/Steps";
import TableTabs from "../components/Score/TableTabs";
import TitleDrawer from "../components/Score/TitleDrawer";
import ParamsSetting from "../components/Score/ParamsSetting";
import ScoreResultList from "../components/Score/ScoreResultList";

const { Title } = Typography;

function App() {
  // store
  const currentStep = useScoreStore((state) => state.currentStep);
  const tabKey = useScoreStore((state) => state.tabKey);
  const openDrawer = useScoreStore((state) => state.openDrawer);
  const scoreTitleIndex = useScoreStore((state) => state.scoreTitleIndex);
  const classTitleIndex = useScoreStore((state) => state.classTitleIndex);
  const {
    setCurrentStep,
    setTabKey,
    setOpenDrawer,
    setScoreTitleIndex,
    setClassTitleIndex,
    setScoreTitleOptions,
    setClassTitleOptions,
  } = useScoreStore.getState();

  // message
  const [messageApi, contextHolder] = message.useMessage();

  const subjectScore = useScoreSettingStore((state) => state.subjectScore);
  const totalScore = useScoreSettingStore((state) => state.totalScore);

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
      messageApi.error("读取失败");
      return;
    }
    const data = getTableData(fileData);
    messageApi.success("读取成功");

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
      children: (
        <Table
          columns={scoreColumns}
          dataSource={scoreTableData}
          scroll={{ x: true }}
        />
      ),
      disabled: tabKey != "成绩数据表" && openDrawer,
    },
    {
      key: "班级信息表",
      label: `班级信息表`,
      children: (
        <Table
          columns={classColumns}
          dataSource={classTableData}
          scroll={{ x: true }}
        />
      ),
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
    if (!totalScore) {
      messageApi.error("请先在参数配置中录入单科总分");
      return;
    }

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

    // 班级信息表: 班级 -> { 人数, 班主任, 各科教师 }
    const classInfoDict: any = {};
    forEach(classTableData, (row) => {
      const className = String(row[classTitleIndex["班级"]]);
      const info: any = {
        人数: Number(row[classTitleIndex["人数"]]) || 0,
        班主任:
          classTitleIndex["班主任"] !== "无"
            ? String(row[classTitleIndex["班主任"]] ?? "")
            : "",
      };
      forEach(targetSubjuects, (subject) => {
        const index = classTitleIndex[subject];
        info[subject] = index !== "无" ? String(row[index] ?? "") : "";
      });
      classInfoDict[className] = info;
    });

    // 学生成绩（空值默认为 0 分）
    const students = map(scoreTableData, (row) => {
      const stu: any = { 班级: String(row[scoreTitleIndex["班级"]]) };
      forEach(targetSubjuects, (subject) => {
        const index = scoreTitleIndex[subject];
        stu[subject] = index !== "无" ? Number(row[index]) || 0 : 0;
      });
      return stu;
    });

    // 按班级分组，组内按总分从高到低排序
    const groups = groupBy(students, "班级");
    forEach(groups, (list, className) => {
      groups[className] = orderBy(list, ["总分"], ["desc"]);
    });

    // 成绩表中存在的学科（含总分）
    const subjects = filter(
      targetSubjuects,
      (subject) => scoreTitleIndex[subject] !== "无"
    );

    // 单科满分检查：满分必须为正数且不低于成绩最高分；最高分不足满分60%时提醒
    for (const subject of subjects) {
      const fullScore = subject === "总分" ? totalScore : subjectScore[subject];
      const maxScore = max(map(students, subject)) ?? 0;
      if (!fullScore || fullScore <= 0) {
        messageApi.error(`${subject}：单科总分未配置，请先到参数配置中填写`);
        return;
      }
      if (maxScore > fullScore) {
        messageApi.error(`${subject}：成绩表最高分 ${maxScore} 分，超过单科总分 ${fullScore} 分，请检查参数配置`);
        return;
      }
      if (maxScore < fullScore * 0.6) {
        messageApi.warning(`${subject}：配置单科总分 ${fullScore} 分，但该科成绩表最高分仅 ${maxScore} 分（不满满分的60%），及格率、优秀率将全为 0，请确认参数配置是否正确`);
      }
    }

    // 分班级统计一分四率
    const table: any = {};
    forEach(groups, (scores, className) => {
      const classInfo = classInfoDict[className];
      if (!classInfo) {
        messageApi.error("班级信息表中缺少班级: " + className);
        return;
      }
      const countNum = classInfo["人数"];
      // 按总分排序后取前 countNum 名学生
      const topList = scores.slice(0, countNum);

      table[className] = { 班级: className, 人数: countNum };
      forEach(subjects, (subject) => {
        // 单科总分（总分学科用配置的总分）
        const fullScore =
          subject === "总分" ? totalScore : subjectScore[subject];
        // 人平分：前 countNum 名学生的平均分
        const meanScore = mean(map(topList, subject));
        // 优秀/及格/低分人数（统计全班学生，空值按 0 分）
        const goodNum = filter(
          scores,
          (o) => o[subject] >= (fullScore * 80) / 100
        ).length;
        const okNum = filter(
          scores,
          (o) => o[subject] >= (fullScore * 60) / 100
        ).length;
        const lowNum = filter(
          scores,
          (o) => o[subject] < (fullScore * 40) / 100
        ).length;

        const row = table[className];
        row[subject + "教师"] =
          subject === "总分" ? classInfo["班主任"] : classInfo[subject];
        row[subject + "平均分"] = round(meanScore, 2);
        row[subject + "得分率"] = round((meanScore / fullScore) * 100, 2);
        row[subject + "优秀人数"] = goodNum;
        row[subject + "优秀率"] = round((goodNum / countNum) * 100, 2);
        row[subject + "及格人数"] = okNum;
        row[subject + "及格率"] = round((okNum / countNum) * 100, 2);
        row[subject + "低分人数"] = lowNum;
        row[subject + "低分率"] = round((lowNum / countNum) * 100, 2);
        // 四率和 = 人平分 + 优秀率×100 + 及格率×100 + 得分率×100 - 低分率×100
        row[subject + "四率和"] = round(
          row[subject + "平均分"] +
            row[subject + "优秀率"] +
            row[subject + "及格率"] +
            row[subject + "得分率"] -
            row[subject + "低分率"],
          2
        );
      });
    });

    // 各项排名（并列同名次）
    function rankTable(key: string, order: "asc" | "desc") {
      let rank = 0;
      let prev: any = -1;
      let offset = 0;
      forEach(orderBy(values(table), [key], [order]), (item) => {
        if (item[key] !== prev) {
          rank += offset + 1;
          offset = 0;
          prev = item[key];
        } else {
          offset += 1;
        }
        table[item["班级"]][key + "排名"] = rank;
      });
    }
    forEach(subjects, (subject) => {
      forEach(["平均分", "得分率", "优秀率", "及格率", "四率和"], (target) => {
        rankTable(subject + target, "desc");
      });
      // ponytail: 低分率越低越好，故升序排名（与四率和方向一致）
      rankTable(subject + "低分率", "asc");
    });

    // 班主任四率和 = 总分人平分 + 总分得分率 + 总分及格率（与样表一致）
    forEach(values(table), (row) => {
      row["班主任四率和"] = round(
        row["总分平均分"] + row["总分得分率"] + row["总分及格率"],
        2
      );
    });
    rankTable("班主任四率和", "desc");

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

    // 行按班级排序
    const rows = orderBy(
      values(table),
      [(row) => Number(row["班级"]) || row["班级"]],
      ["asc"]
    );

    // 百分数
    const formatRatio = (value: number) => round(value, 2) + "%";

    // 1. 分学科单科统计表（每个学科含总分一张表）
    forEach(subjects, async (subject) => {
      const header = [
        "班级",
        "人数",
        subject + "教师",
        subject + "平均分",
        subject + "平均分排名",
        subject + "得分率",
        subject + "得分率排名",
        subject + "优秀人数",
        subject + "优秀率",
        subject + "优秀率排名",
        subject + "及格人数",
        subject + "及格率",
        subject + "及格率排名",
        subject + "低分人数",
        subject + "低分率",
        subject + "低分率排名",
        subject + "四率和",
        "排名",
      ];
      const data = map(rows, (row) => ({
        班级: row["班级"],
        人数: row["人数"],
        [subject + "教师"]: row[subject + "教师"],
        [subject + "平均分"]: row[subject + "平均分"],
        [subject + "平均分排名"]: row[subject + "平均分排名"],
        [subject + "得分率"]: formatRatio(row[subject + "得分率"]),
        [subject + "得分率排名"]: row[subject + "得分率排名"],
        [subject + "优秀人数"]: row[subject + "优秀人数"],
        [subject + "优秀率"]: formatRatio(row[subject + "优秀率"]),
        [subject + "优秀率排名"]: row[subject + "优秀率排名"],
        [subject + "及格人数"]: row[subject + "及格人数"],
        [subject + "及格率"]: formatRatio(row[subject + "及格率"]),
        [subject + "及格率排名"]: row[subject + "及格率排名"],
        [subject + "低分人数"]: row[subject + "低分人数"],
        [subject + "低分率"]: formatRatio(row[subject + "低分率"]),
        [subject + "低分率排名"]: row[subject + "低分率排名"],
        [subject + "四率和"]: row[subject + "四率和"],
        排名: row[subject + "四率和排名"],
      }));
      const path = await joinPath(saveDirPath, subject + ".xlsx");
      await writeExcelFile(path, data, header);
    });

    // 2. 各班各学科一分四率汇总表
    const summaryHeader = ["班级", "人数"];
    forEach(subjects, (subject) => {
      summaryHeader.push(
        subject + "教师",
        subject + "平均分",
        subject + "得分率",
        subject + "优秀率",
        subject + "及格率",
        subject + "低分率",
        subject + "四率和",
        subject + "排名"
      );
    });
    const summaryData = map(rows, (row) => {
      const item: any = { 班级: row["班级"], 人数: row["人数"] };
      forEach(subjects, (subject) => {
        item[subject + "教师"] = row[subject + "教师"];
        item[subject + "平均分"] = row[subject + "平均分"];
        item[subject + "得分率"] = formatRatio(row[subject + "得分率"]);
        item[subject + "优秀率"] = formatRatio(row[subject + "优秀率"]);
        item[subject + "及格率"] = formatRatio(row[subject + "及格率"]);
        item[subject + "低分率"] = formatRatio(row[subject + "低分率"]);
        item[subject + "四率和"] = row[subject + "四率和"];
        item[subject + "排名"] = row[subject + "四率和排名"];
      });
      return item;
    });
    await writeExcelFile(
      await joinPath(saveDirPath, "汇总表.xlsx"),
      summaryData,
      summaryHeader
    );

    // 3. 总排名表（人数、班级、教师、四率和、排名，如样表）
    const rankSubjects = filter(subjects, (subject) => subject !== "总分");
    const rankHeader = ["人数", "班级"];
    forEach(rankSubjects, (subject) => {
      rankHeader.push(subject + "教师", subject + "四率和", subject + "排名");
    });
    rankHeader.push("班主任", "班主任四率和", "班主任排名");
    const rankData = map(rows, (row) => {
      const item: any = { 人数: row["人数"], 班级: row["班级"] };
      forEach(rankSubjects, (subject) => {
        item[subject + "教师"] = row[subject + "教师"];
        item[subject + "四率和"] = row[subject + "四率和"];
        item[subject + "排名"] = row[subject + "四率和排名"];
      });
      item["班主任"] = row["总分教师"];
      item["班主任四率和"] = row["班主任四率和"];
      item["班主任排名"] = row["班主任四率和排名"];
      return item;
    });
    await writeExcelFile(
      await joinPath(saveDirPath, "总排名表.xlsx"),
      rankData,
      rankHeader
    );

    // 打开路径
    openPath(saveDirPath);
    // 完成
    setCurrentStep(4);
  }

  const location = useLocation();
  useEffect(() => {
    setCurrentStep(0);
    setTabKey("成绩数据表");
  }, [location]);
  return (
    <>
      {contextHolder}
      <Title>
        成绩统计
        <Button
          type="text"
          shape="circle"
          icon={<QuestionCircleOutlined />}
          onClick={openDocsFolder}
        />
      </Title>

      <Row gutter={[0, 24]}>
        <Col span={24}>
          <Steps />
        </Col>

        <Col span={24}>
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
        </Col>

        <Col span={24}>
          <TableTabs items={tabItems} />
        </Col>
      </Row>
    </>
  );
}

export default App;
