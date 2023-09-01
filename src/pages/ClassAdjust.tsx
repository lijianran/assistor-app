// 分班调整

import {
  QuestionCircleOutlined,
  UploadOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import {
  message,
  Button,
  Typography,
  Row,
  Col,
  Space,
  Steps,
  Table,
  Tabs,
  InputNumber,
} from "antd";

import {
  omit,
  filter,
  uniqBy,
  includes,
  groupBy,
  forEach,
  countBy,
  meanBy,
  round,
  random,
  cloneDeep,
} from "lodash-es";

import type { TabsProps } from "antd";

import ResultList from "../components/Class/ResultList";

const { Title } = Typography;

function App() {
  // message
  const [messageApi, contextHolder] = message.useMessage();

  const [tabKey, setTabKey] = useState("分班表格");
  const [currentStep, setCurrentStep] = useState(0);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  const [tableData, setTableData] = useState<any[]>([]);
  const [tableColumns, setTableColumns] = useState<any[]>([]);
  const [scoreLimit, setScoreLimit] = useState<number>(5);

  useEffect(() => {
    const nessary_columns = ["性别", "总分", "新班级", "目标班级"];

    setTableColumns(
      nessary_columns.map((item) => ({
        title: item,
        dataIndex: item,
        key: item,
      }))
    );
  }, []);

  // 步骤条
  const stepItems = [
    {
      title: "步骤1",
      description: "上传表格",
    },
    {
      title: "步骤2",
      description: "分班调整",
    },
  ];

  // 选择分班表格
  async function selectFile() {
    setButtonLoading(true);

    // 导出路径
    const documentDirPath = await getDocumentDir();
    const classShuffleDirPath = await joinPath(
      documentDirPath,
      "教务软件数据",
      "班级分配"
    );
    if (await isNotExist(classShuffleDirPath)) {
      await createDirectory(classShuffleDirPath);
    }

    const result = await selectOneExcelFile(classShuffleDirPath);
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

    if (!("性别" in data.titleInit)) {
      messageApi.error("表格缺少【性别】");
      return;
    }
    if (!("总分" in data.titleInit)) {
      messageApi.error("表格缺少【总分】");
      return;
    }
    if (!("新班级" in data.titleInit)) {
      messageApi.error("表格缺少【新班级】");
      return;
    }
    if (!("目标班级" in data.titleInit)) {
      messageApi.error("表格缺少【目标班级】");
      return;
    }
    messageApi.success("读取成功");

    // data
    setTableColumns(data.columns);
    setTableData(data.tableData);

    if (currentStep < 1) {
      setCurrentStep(1);
      setTabKey("分班调整");
    }
  }

  // tab
  const tabItems: TabsProps["items"] = [
    {
      key: "分班表格",
      label: `分班表格`,
      children: (
        <Table
          columns={tableColumns}
          dataSource={tableData}
          scroll={{ x: true }}
        />
      ),
    },
    {
      key: "分班调整",
      label: `分班调整`,
      children: <ResultList name={"分班调整"} currentStep={currentStep} />,
    },
  ];

  // 分班函数
  function swap_student(data: any, student: any, targets: any) {
    const randomIndex = random(0, targets.length - 1);
    const stuIndex = targets[randomIndex]["key"] - 1;
    const targetClass = targets[randomIndex]["最终班级"];

    data[stuIndex]["最终班级"] = student["最终班级"];
    data[stuIndex]["备注"] = "换出";
    student["最终班级"] = targetClass;
    student["备注"] = "成功";
  }
  function try_swap(data: any, student: any, target: any) {
    const score = student["总分"];
    const gender = student["性别"];
    let targetStudents;

    // 相同总分 相同性别
    targetStudents = filter(data, function (o) {
      return (
        !o["目标班级"] &&
        o["最终班级"] == target &&
        o["总分"] === score &&
        o["性别"] === gender
      );
    });
    if (targetStudents.length) {
      swap_student(data, student, targetStudents);
      return true;
    }

    // 相同总分 不考虑性别
    targetStudents = filter(data, function (o) {
      return !o["目标班级"] && o["最终班级"] == target && o["总分"] === score;
    });
    if (targetStudents.length) {
      swap_student(data, student, targetStudents);
      return true;
    }

    // 相差 5 分 相同性别
    targetStudents = filter(data, function (o) {
      return (
        !o["目标班级"] &&
        o["最终班级"] == target &&
        o["总分"] >= score - scoreLimit &&
        o["总分"] <= score + scoreLimit &&
        o["性别"] === gender
      );
    });
    if (targetStudents.length) {
      swap_student(data, student, targetStudents);
      return true;
    }

    // 相差 5 分 不考虑性别
    targetStudents = filter(data, function (o) {
      return (
        !o["目标班级"] &&
        o["最终班级"] == target &&
        o["总分"] >= score - scoreLimit &&
        o["总分"] <= score + scoreLimit
      );
    });
    if (targetStudents.length) {
      swap_student(data, student, targetStudents);
      return true;
    }

    // 调整失败
    if (student["目标班级"]) {
      student["备注"] = "调整失败";
    }
    return false;
  }
  function try_again(data: any, student: any, target: any) {
    // 全校总分差不多的学生中

    // 相差 5 分 相同性别
    let targetStudents;
    targetStudents = filter(data, function (o) {
      return (
        !o["目标班级"] &&
        o["总分"] >= student["总分"] - scoreLimit &&
        o["总分"] <= student["总分"] + scoreLimit &&
        o["性别"] === student["性别"]
      );
    });
    for (let index = 0; index < targetStudents.length; index++) {
      const stuIndex = targetStudents[index]["key"] - 1;

      // 尝试替换到目标班级中
      if (try_swap(data, data[stuIndex], target)) {
        // 再次调整
        try_swap(data, student, target);
        return;
      }
    }

    // 相差 5 分 不考虑性别
    targetStudents = filter(data, function (o) {
      return (
        !o["目标班级"] &&
        o["总分"] >= student["总分"] - scoreLimit &&
        o["总分"] <= student["总分"] + scoreLimit &&
        o["性别"] === student["性别"]
      );
    });
    for (let index = 0; index < targetStudents.length; index++) {
      const stuIndex = targetStudents[index]["key"] - 1;

      // 尝试替换到目标班级中
      if (try_swap(data, data[stuIndex], target)) {
        // 再次调整
        try_swap(data, student, target);
        return;
      }
    }
  }

  // 分班调整
  async function adjustClass() {
    // let data = cloneDeep(tableData);
    let data = tableData.map((item) => ({ ...item, 最终班级: item["新班级"] }));
    const classNameList = uniqBy(data, "新班级").map((item) => item["新班级"]);

    forEach(data, (student) => {
      const target = cloneDeep(student["目标班级"]);

      if (!target) {
        return;
      }
      if (target === student["最终班级"]) {
        student["备注"] = "成功";
        return;
      }
      if (!includes(classNameList, target)) {
        messageApi.error(`目标班级 ${target} 不存在`);
        student["备注"] = "目标班级不存在";
        return;
      }

      // 尝试调班
      if (try_swap(data, student, target)) {
        // 调整成功
        return;
      }
      // 再次尝试
      try_again(data, student, target);
    });

    data = data.map((student) => {
      student = omit(student, "key");
      if (!student["备注"]) {
        student["备注"] = "";
      }

      return student;
    });

    // 班级信息
    let classInfo: any[] = [];
    // 按班级分组
    const classes = groupBy(data, "最终班级");
    forEach(classes, (classData, className) => {
      // 统计班级信息
      const countResult = countBy(classData, "性别");
      classInfo.push({
        班级: className,
        人数: classData.length,
        男生: countResult["男"],
        女生: countResult["女"],
        均分: round(meanBy(classData, "总分"), 2),
      });
    });

    // 调班信息
    let adjustInfo: any[] = [];
    // 统计班级信息
    const countResult = countBy(data, "备注");
    const successCount = countResult["成功"];
    const failedCount = countResult["调整失败"];
    const swapoutCount = countResult["换出"];
    const totalCount = successCount + failedCount;
    const successRatio = round(successCount / totalCount, 2);
    adjustInfo.push({ key: "总数", value: totalCount });
    adjustInfo.push({ key: "成功", value: successCount });
    adjustInfo.push({ key: "调整失败", value: failedCount });
    adjustInfo.push({ key: "换出", value: swapoutCount });
    adjustInfo.push({ key: "成功率", value: successRatio });

    // 导出路径
    const documentDirPath = await getDocumentDir();
    const saveDirPath = await joinPath(
      documentDirPath,
      "教务软件数据",
      "分班调整",
      timeDirName()
    );
    if (await isNotExist(saveDirPath)) {
      await createDirectory(saveDirPath);
    }

    // 分班表
    const path = await joinPath(saveDirPath, "分班表.xlsx");
    await writeExcelFile(path, data, Object.keys(data[0]));

    // 信息表
    const infoPath = await joinPath(saveDirPath, "信息表.xlsx");
    await writeExcelFile(infoPath, classInfo, Object.keys(classInfo[0]));

    // 调整表
    const adjustPath = await joinPath(saveDirPath, "调整表.xlsx");
    await writeExcelFile(adjustPath, adjustInfo, Object.keys(adjustInfo[0]));

    // 打开路径
    openPath(saveDirPath);
    // 完成
    setCurrentStep(2);
  }

  return (
    <>
      {contextHolder}
      <Title>
        分班调整
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
          {tabKey === "分班表格" && (
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
          {tabKey === "分班调整" && (
            <div>
              <Button
                type="primary"
                disabled={currentStep < 1 || !scoreLimit}
                icon={<UserSwitchOutlined />}
                onClick={adjustClass}
              >
                开始调整
              </Button>
              <InputNumber
                min={1}
                max={9}
                defaultValue={scoreLimit}
                onChange={(value) => {
                  setScoreLimit(value as number);
                }}
                style={{ width: "200px" }}
                placeholder="1 ~ 9"
                addonBefore="阈值"
                addonAfter="分"
                required
              />
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
