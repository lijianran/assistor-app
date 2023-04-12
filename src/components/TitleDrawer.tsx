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

const { Option } = Select;

function App({ titleOptions, formRef, titleInit }: any) {
  // store
  const tabKey = useScoreStore((state) => state.tabKey);
  const currentStep = useScoreStore((state) => state.currentStep);
  const openDrawer = useScoreStore((state) => state.openDrawer);
  const {
    scoreTitleRequired,
    classTitleRequired,
    setCurrentStep,
    setTabKey,
    setOpenDrawer,
  } = useScoreStore.getState();

  const showDrawer = () => {
    // setOpen(true);
    setOpenDrawer(true);
  };

  const onClose = () => {
    // setOpen(false);
  };

  const submitData = () => {
    formRef.current.submit();
  };

  const onFinish = (values: any) => {
    // console.log("Success:", values);
    // console.log(formRef.current.getFieldsValue());

    // setOpen(false);
    setOpenDrawer(false);
    // nextStep();
    if (tabKey === "成绩数据表") {
      if (currentStep < 1) {
        setCurrentStep(1);
        setTabKey("班级信息表");
      }
    }
    if (tabKey === "班级信息表") {
      if (currentStep < 2) {
        setCurrentStep(2);
        setTabKey("参数配置");
      }
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  function handleValidator(rule: any, value: any) {
    const values: any = formRef.current.getFieldsValue();

    if (tabKey === "成绩数据表") {
      if (scoreTitleRequired[rule.field] && value === -1) {
        return Promise.reject("必选字段");
      }
    }
    if (tabKey === "班级信息表") {
      if (classTitleRequired[rule.field] && value === -1) {
        return Promise.reject("必选字段");
      }
    }

    for (const key in values) {
      if (value === -1 || rule.field === key) {
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

  let titleDict: any = {};
  if (tabKey === "成绩数据表") {
    titleDict = scoreTitleRequired;
  }
  if (tabKey === "班级信息表") {
    titleDict = classTitleRequired;
  }
  const selectItems = Object.keys(titleDict).map((item: any) => (
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

  const validateMessages = {
    required: "'${name}' 是必选字段",
  };

  return (
    <>
      <Button type="primary" onClick={showDrawer} icon={<PlusOutlined />}>
        配置
      </Button>
      <Drawer
        title={"配置" + tabKey}
        mask={false}
        // width={500}
        closable={false}
        onClose={onClose}
        open={openDrawer}
        bodyStyle={{ paddingBottom: 80 }}
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
          {selectItems}
        </Form>
      </Drawer>
    </>
  );
}

export default App;
