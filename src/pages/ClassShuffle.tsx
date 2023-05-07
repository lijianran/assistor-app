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

import { groupBy, orderBy, forEach, omit, flattenDeep } from "lodash-es";

import type { FormInstance } from "antd/es/form";
import type { TabsProps } from "antd";

import ResultList from "../components/Class/ResultList";

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

  // 打开文档
  async function openDocsFolder() {
    const docsPath = await getResourcePath("resources", "docs", "学生分班");

    openPath(docsPath);
  }

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

  useEffect(() => {
    let data = [];
    let columns = [];
    const nessary_columns = ["学籍号", "班级", "姓名", "总分", "性别"];
    for (let index = 0; index < nessary_columns.length; index++) {
      const column = nessary_columns[index];
      columns.push({
        key: column,
        title: column,
        dataIndex: column,
      });

      data.push({
        key: index,
        学籍号: "xxxx",
        班级: "xxxx",
        姓名: "xxxx",
        总分: "xxxx",
        性别: "xxxx",
      });
    }
    setTableColumns(columns);
    setTableData(data);
  }, []);

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
    学籍号: true,
    班级: true,
    姓名: true,
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
      children: <Table columns={tableColumns} dataSource={tableData} />,
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

    // 按班级分组
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
      groups[gender] = orderBy(students, [params["总分"]], ["desc"]);
      console.log("总分排序", gender, students);
      forEach(students, (student, index) => {
        student = omit(student, "key");

        if (flag) {
          classList[index % classNum].push({
            班级号: (index % classNum) + 1,
            ...student,
          });
        } else {
          classList[classNum - 1 - (index % classNum)].push({
            班级号: classNum - (index % classNum),
            ...student,
          });
        }
        if (index % classNum === 0) {
          flag = !flag;
        }
      });
    });

    console.log("分班级", classList);

    forEach(classList, (classItem, index) => {
      // 按总分排序
      classList[index] = orderBy(classItem, [params["总分"]], ["desc"]);
    });

    console.log("排序", classList);

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
    const table = flattenDeep(classList);
    console.log("结果", table);
    const path = await joinPath(saveDirPath, "分班结果.xlsx");

    await writeExcelFile(path, table, Object.keys(table[0]));

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

      <Space direction="vertical" size={"large"} wrap>
        <Steps current={currentStep} items={stepItems} type="default" />
        <Row justify="space-between">
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
        </Row>

        <Tabs
          activeKey={tabKey}
          items={tabItems}
          onTabClick={(key) => {
            setTabKey(key);
          }}
        />
      </Space>
    </>
  );
}

export default App;
