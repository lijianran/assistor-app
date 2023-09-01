// 学生分班

import React from "react";
import {
  UploadOutlined,
  AreaChartOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  message,
  Button,
  Typography,
  Row,
  Col,
  Card,
  Space,
  Steps,
  Table,
  Empty,
  Tabs,
  Form,
  Select,
  InputNumber,
} from "antd";

import {
  groupBy,
  orderBy,
  forEach,
  omit,
  countBy,
  meanBy,
  round,
  flattenDeep,
} from "lodash-es";

import type { FormInstance } from "antd/es/form";
import type { TabsProps } from "antd";

import ResultList from "../../components/Class/ResultList";

const { Title } = Typography;
const { Option } = Select;

function App() {
  // message
  const [messageApi, contextHolder] = message.useMessage();

  const [tabKey, setTabKey] = useState("成绩表格");
  const [currentStep, setCurrentStep] = useState(0);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  const [tableData, setTableData] = useState<any[]>([]);
  const [tableColumns, setTableColumns] = useState<any[]>([]);
  const [titleOptions, setTitleOptions] = useState<any[]>([]);
  const [titleInit, setTitleInit] = useState<any>({});
  const [params, setParams] = useState<any>({});

  const stepItems = [
    {
      title: "步骤1",
      description: "上传表格",
    },
    {
      title: "步骤2",
      description: "配置参数",
    },
    {
      title: "步骤3",
      description: "进行分班",
    },
  ];

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

    // data
    setTableColumns(data.columns);
    setTableData(data.tableData);

    setTitleOptions(data.titleOptions);
    setTitleInit(data.titleInit);

    if (currentStep < 1) {
      setCurrentStep(1);
      setTabKey("参数配置");
    }
  }

  // 配置参数
  const settingFormRef = React.useRef<FormInstance>(null);

  function handleValidator(rule: any, value: any) {
    if (value === -1) {
      return Promise.reject("必选字段");
    }

    const values: any = settingFormRef.current?.getFieldsValue();
    for (const key in values) {
      if (value === "无" || rule.field === key) {
        continue;
      }
      if (Object.prototype.hasOwnProperty.call(values, key)) {
        const selectedIndex = values[key];
        if (selectedIndex === value) {
          return Promise.reject("重复选择");
        }
      }
    }

    return Promise.resolve();
  }
  const onFinish = (values: any) => {
    console.log("Success:", values);

    setParams(values);
    messageApi.success("配置成功");

    if (currentStep < 2) {
      setCurrentStep(2);
      setTabKey("分班结果");
    }
  };
  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
    messageApi.error("参数配置失败");
  };
  const titleDict: { [key: string]: boolean } = {
    总分: true,
    性别: true,
  };
  let selectItems = Object.keys(titleDict).map((item: string) => (
    <Form.Item
      key={item}
      name={item}
      label={item}
      rules={[{ required: titleDict[item] }, { validator: handleValidator }]}
    >
      <Select>
        <Option key={-1} value={-1}>
          无
        </Option>
        {titleOptions.map((item: any) => (
          <Option key={item.value} value={item.value}>
            {item.label}
          </Option>
        ))}
      </Select>
    </Form.Item>
  ));
  let paramsConfig = (
    <Form
      ref={settingFormRef}
      name="basic"
      layout="vertical"
      requiredMark="optional"
      initialValues={titleInit}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Row gutter={[16, 16]}>
        <Col sm={12}>
          <Card title="" bordered={true} hoverable>
            {selectItems}
          </Card>
        </Col>
        <Col sm={12}>
          <Card title="" bordered={true} hoverable>
            <Form.Item
              name="分班数量"
              label="分班数量"
              rules={[{ required: true }]}
            >
              <InputNumber
                min={1}
                max={99}
                placeholder="分班数量"
                addonAfter="个"
              />
            </Form.Item>
          </Card>
        </Col>
      </Row>
    </Form>
  );

  // tab
  const tabItems: TabsProps["items"] = [
    {
      key: "成绩表格",
      label: `成绩表格`,
      children: (
        <Table
          columns={tableColumns}
          dataSource={tableData}
          scroll={{ x: true }}
        />
      ),
    },
    {
      key: "参数配置",
      label: `参数配置`,
      children: paramsConfig,
    },
    {
      key: "分班结果",
      label: `分班结果`,
      children: <ResultList name={"学生分班"} currentStep={currentStep} />,
    },
  ];

  // 分班
  async function shuffleClass() {
    // 分班
    let classList: any[] = [];
    const classNum = params["分班数量"];
    for (let index = 0; index < classNum; index++) {
      classList[index] = [];
    }

    // 按性别分组
    const groups = groupBy(tableData, (item) => {
      return item[params["性别"]];
    });
    console.log("性别分组", groups);

    // 分班
    forEach(groups, (students, gender) => {
      let flag = true;
      if (gender === "男") {
        flag = true;
      } else if (gender === "女") {
        flag = false;
      } else {
        messageApi.error("性别字段错误");
        return;
      }

      // 按总分排序
      students = orderBy(students, [params["总分"]], ["desc"]);
      console.log("总分排序", gender, students);
      forEach(students, (student, index) => {
        student = omit(student, "key");

        if (flag) {
          classList[index % classNum].push({
            抽签号码: (index % classNum) + 1,
            ...student,
          });
        } else {
          classList[classNum - 1 - (index % classNum)].push({
            抽签号码: classNum - (index % classNum),
            ...student,
          });
        }
        if ((index + 1) % classNum === 0) {
          flag = !flag;
        }
      });
    });

    console.log("分班级", classList);

    // 班级信息
    let classInfo: any[] = [];

    forEach(classList, (classItem, index) => {
      // 按总分排序
      classList[index] = orderBy(classItem, [params["总分"]], ["desc"]);

      // 统计班级信息
      const countResult = countBy(classList[index], params["性别"]);
      classInfo.push({
        抽签号码: index + 1,
        人数: classList[index].length,
        男生: countResult["男"],
        女生: countResult["女"],
        均分: round(meanBy(classList[index], params["总分"]), 2),
      });
    });

    console.log("排序", classList);
    console.log("班级信息", classInfo);

    // 导出路径
    const documentDirPath = await getDocumentDir();
    const saveDirPath = await joinPath(
      documentDirPath,
      "教务软件数据",
      "学生分班",
      timeDirName()
    );
    if (await isNotExist(saveDirPath)) {
      await createDirectory(saveDirPath);
    }

    // 结果
    const result = flattenDeep(classList).map((student) => ({
      ...student,
      总分: student[params["总分"]],
      性别: student[params["性别"]],
    }));
    console.log("结果", result);
    const path = await joinPath(saveDirPath, "分班表.xlsx");
    const infoPath = await joinPath(saveDirPath, "信息表.xlsx");

    await writeExcelFile(path, result, Object.keys(result[0]));
    await writeExcelFile(infoPath, classInfo, Object.keys(classInfo[0]));

    messageApi.success("分班成功");
    // 打开路径
    openPath(saveDirPath);
    // 完成
    setCurrentStep(3);
  }

  return (
    <>
      {contextHolder}
      <Title>
        学生分班
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
          {tabKey === "成绩表格" && (
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
          {tabKey === "参数配置" && (
            <div>
              <Button
                type="primary"
                disabled={currentStep < 1}
                icon={<SettingOutlined />}
                onClick={() => settingFormRef.current?.submit()}
              >
                确认配置
              </Button>
            </div>
          )}
          {tabKey === "分班结果" && (
            <div>
              <Button
                type="primary"
                disabled={currentStep < 2}
                icon={<AreaChartOutlined />}
                onClick={shuffleClass}
              >
                开始分班
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
