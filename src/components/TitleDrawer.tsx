import React, { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Space,
} from "antd";

import TitleForm from "../components/TitleForm";

const { Option } = Select;

function App({ titleOptions, formRef, titleInit }: any) {
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    // setOpen(false);
  };

  const submitData = () => {
    formRef.current.submit();
  };

  const onFinish = (values: any) => {
    console.log("Success:", values);

    console.log(formRef.current.getFieldsValue());

    setOpen(false);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  //   const optionItems = titleOptions.map((item: any) => (
  //     <Option key={item.value}>{item.label}</Option>
  //   ));

  //   const titleDict: { [key: string]: string } = {
  //     姓名: "name",
  //     考号: "id",
  //     班级: "class",
  //     总分: "total",
  //     语文: "chinese",
  //     数学: "math",
  //     英语: "english",
  //     物理: "wuli",
  //     化学: "huaxue",
  //     道法: "daofa",
  //     历史: "lishi",
  //     地理: "dili",
  //     生物: "shengwu",
  //   };
  const titleDict = [
    { label: "姓名", value: "name" },
    { label: "考号", value: "id" },
    { label: "班级", value: "class", required: true },
    { label: "总分", value: "total" },
    { label: "语文", value: "chinese" },
    { label: "数学", value: "math" },
    { label: "英语", value: "english" },
    { label: "物理", value: "wuli" },
    { label: "化学", value: "huaxue" },
    { label: "道法", value: "daofa" },
    { label: "历史", value: "lishi" },
    { label: "地理", value: "dili" },
    { label: "生物", value: "shengwu" },
  ];
  const titleList = [
    "姓名",
    "考号",
    "班级",
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
  const selectItems = titleDict.map((item: any) => (
    <Form.Item
      key={item.label}
      name={item.label}
      label={item.label}
      //   required={item.required}
      rules={[{ required: item.required }]}
    >
      <Select allowClear>
        {/* <Option key={-1} value={-1}>
          无
        </Option> */}
        {titleOptions.map((item: any) => (
          <Option key={item.value} value={item.value}>
            {item.label}
          </Option>
        ))}
      </Select>
    </Form.Item>
  ));

  const validateMessages = {
    required: "'${name}' 是必选字段",
  };

  return (
    <>
      <Button type="primary" onClick={showDrawer} icon={<PlusOutlined />}>
        配置
      </Button>
      <Drawer
        title="配置成绩表"
        // width={500}
        closable={false}
        onClose={onClose}
        open={open}
        // bodyStyle={{ paddingBottom: 80 }}
        // placement="bottom"
        extra={
          <Space>
            {/* <Button onClick={onClose}>Cancel</Button> */}
            <Button onClick={submitData} type="primary">
              确认
            </Button>
          </Space>
        }
      >
        <Form
          ref={formRef}
          name="basic"
          labelCol={{ span: 4 }}
          // wrapperCol={{ span: 12 }}
          style={{ maxWidth: 600 }}
          //   initialValues={{ remember: true }}
          initialValues={titleInit}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          validateMessages={validateMessages}
        >
          {/* <Form.Item name="gender" label="Gender" rules={[{ required: false }]}>
            <Select
              placeholder=""
              //   onChange={onGenderChange}
              allowClear
            >
              {optionItems}
            </Select>
          </Form.Item> */}
          {selectItems}

          {/* <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password />
          </Form.Item> */}

          {/* <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item> */}
        </Form>
      </Drawer>
    </>
  );
}

export default App;
