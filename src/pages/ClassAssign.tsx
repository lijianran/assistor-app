// 班级分配

import React from "react";
import {
  UploadOutlined,
  DownloadOutlined,
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
  Alert,
  Tabs,
  Form,
  InputNumber,
} from "antd";

import {
  omit,
  uniqBy,
  groupBy,
  forEach,
  countBy,
  meanBy,
  round,
} from "lodash-es";

import type { FormInstance } from "antd/es/form";
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
  const [params, setParams] = useState<any>({});

  const [assignTableData, setAssignTableData] = useState<any[]>([]);
  const [assignTableColumns, setAssignTableColumns] = useState<any[]>([]);

  const [inputItems, setInputItems] = useState<any>();
  const formRef = React.useRef<FormInstance>(null);

  useEffect(() => {
    const nessary_columns = ["抽签号码", "性别", "总分"];
    setTableColumns(
      nessary_columns.map((item) => ({
        title: item,
        dataIndex: item,
        key: item,
      }))
    );

    const assign_columns = ["抽签号码", "班级"];
    setAssignTableColumns(
      assign_columns.map((item) => ({
        title: item,
        dataIndex: item,
        key: item,
        align: "center",
      }))
    );
  }, []);

  // 检查输入班级是否重复
  function handleValidator(rule: any, value: any) {
    const values: any = formRef.current?.getFieldsValue();
    for (const key in values) {
      if (!value || rule.field === key) {
        continue;
      }
      if (Object.prototype.hasOwnProperty.call(values, key)) {
        const selectedIndex = values[key];
        if (selectedIndex === value) {
          return Promise.reject("班级重复");
        }
      }
    }

    return Promise.resolve();
  }

  // 步骤条
  const stepItems = [
    {
      title: "步骤1",
      description: "上传表格",
    },
    {
      title: "步骤2",
      description: "班级分配",
    },
    {
      title: "步骤3",
      description: "下载结果",
    },
  ];

  // 选择表格文件
  async function selectFile() {
    setButtonLoading(true);

    // 导出路径
    const documentDirPath = await getDocumentDir();
    const classShuffleDirPath = await joinPath(
      documentDirPath,
      "教务软件数据",
      "学生分班"
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

    if (!("抽签号码" in data.titleInit)) {
      messageApi.error("表格缺少【抽签号码】");
      return;
    }
    if (!("性别" in data.titleInit)) {
      messageApi.error("表格缺少【性别】");
      return;
    }
    if (!("总分" in data.titleInit)) {
      messageApi.error("表格缺少【总分】");
      return;
    }
    messageApi.success("读取成功");

    // 分配表
    let assignTableDataTemp: any[] = [];
    uniqBy(data.tableData, "抽签号码").forEach((item, index) => {
      assignTableDataTemp.push({
        key: index,
        抽签号码: item["抽签号码"],
        班级: "",
      });
    });
    setAssignTableData(assignTableDataTemp);

    // 输入框
    let inputItemsTemp: any = assignTableDataTemp.map((item, index) => (
      <Form.Item
        key={index}
        name={item["抽签号码"]}
        label={item["抽签号码"] + "号"}
        rules={[{ required: true }, { validator: handleValidator }]}
      >
        <InputNumber
          min={0}
          max={10000}
          placeholder="输入班级"
          addonAfter="班"
        />
      </Form.Item>
    ));
    setInputItems(inputItemsTemp);

    // data
    setTableColumns(data.columns);
    setTableData(data.tableData);

    if (currentStep < 1) {
      setCurrentStep(1);
      setTabKey("班级分配");
    }
  }

  const onFinish = (values: any) => {
    setParams(values);
    messageApi.success("分配成功");

    if (currentStep < 2) {
      setCurrentStep(2);
      setTabKey("下载结果");
    }
  };
  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
    messageApi.error("分配失败");
  };
  let inputForm = (
    <Form
      ref={formRef}
      name="basic"
      requiredMark="optional"
      labelCol={{ span: 4 }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      onValuesChange={(changedValues, allValues) => {
        // 同步更新表格
        setAssignTableData(
          assignTableData.map((item) => {
            if (allValues[item["抽签号码"]]) {
              return {
                key: item["key"],
                抽签号码: item["抽签号码"],
                班级: allValues[item["抽签号码"]],
              };
            } else {
              return item;
            }
          })
        );
      }}
    >
      <Row gutter={[16, 16]}>
        <Col sm={12}>
          <Card title="" bordered={true} hoverable>
            {currentStep > 0 && (
              <Alert message="按 tab 键下一个" type="success" />
            )}
            {currentStep <= 0 && <Alert message="请先上传表格" type="info" />}
            <br />
            {inputItems}
          </Card>
        </Col>
        <Col sm={12}>
          <Card title="" bordered={true} hoverable>
            <Table
              pagination={false}
              columns={assignTableColumns}
              dataSource={assignTableData}
            />
          </Card>
        </Col>
      </Row>
    </Form>
  );

  // tab
  const tabItems: TabsProps["items"] = [
    {
      key: "分班表格",
      label: `分班表格`,
      children: <Table columns={tableColumns} dataSource={tableData} />,
    },
    {
      key: "班级分配",
      label: `班级分配`,
      children: inputForm,
    },
    {
      key: "下载结果",
      label: `下载结果`,
      children: <ResultList name={"班级分配"} currentStep={currentStep} />,
    },
  ];

  // 分班
  async function assignClass() {
    let result = tableData.map((student) => {
      student["新班级"] = params[student["抽签号码"]];
      student = omit(student, "key");

      return student;
    });

    // 班级信息
    let classInfo: any[] = [];
    // 按班级分组
    const classes = groupBy(tableData, "新班级");
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

    // 导出路径
    const documentDirPath = await getDocumentDir();
    const saveDirPath = await joinPath(
      documentDirPath,
      "教务软件数据",
      "班级分配",
      timeDirName()
    );
    if (await isNotExist(saveDirPath)) {
      await createDirectory(saveDirPath);
    }

    // 班级表
    const path = await joinPath(saveDirPath, "分班表.xlsx");
    await writeExcelFile(path, result, Object.keys(result[0]));

    // 信息表
    const infoPath = await joinPath(saveDirPath, "信息表.xlsx");
    await writeExcelFile(infoPath, classInfo, Object.keys(classInfo[0]));

    // 分配表
    const table = assignTableData.map((item) => {
      item = omit(item, "key");
      return item;
    });
    const assignPath = await joinPath(saveDirPath, "分配表.xlsx");
    await writeExcelFile(assignPath, table, Object.keys(table[0]));

    // 打开路径
    openPath(saveDirPath);
    // 完成
    setCurrentStep(3);
  }

  return (
    <>
      {contextHolder}
      <Title>
        班级分配
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
          {tabKey === "班级分配" && (
            <div>
              <Button
                type="primary"
                disabled={currentStep < 1}
                icon={<SettingOutlined />}
                onClick={() => formRef.current?.submit()}
              >
                确认分配
              </Button>
            </div>
          )}
          {tabKey === "下载结果" && (
            <div>
              <Button
                type="primary"
                disabled={currentStep < 2}
                icon={<DownloadOutlined />}
                onClick={assignClass}
              >
                下载结果
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
