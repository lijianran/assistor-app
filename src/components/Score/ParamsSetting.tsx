import React from "react";
import { listen } from "@tauri-apps/api/event";
import { Space, Col, Form, InputNumber, Row, Card } from "antd";

import type { FormInstance } from "antd/es/form";

function App() {
  // store
  const currentStep = useScoreStore((state) => state.currentStep);
  const { setCurrentStep, setTabKey } = useScoreStore.getState();

  const subjectScore = useScoreSettingStore((state) => state.subjectScore);
  const totalScore = useScoreSettingStore((state) => state.totalScore);
  const kindGood = useScoreSettingStore((state) => state.kindGood);
  const kindOk = useScoreSettingStore((state) => state.kindOk);
  const class1 = useScoreSettingStore((state) => state.class1);
  const class2 = useScoreSettingStore((state) => state.class2);
  const classLimit = useScoreSettingStore((state) => state.classLimit);
  const {
    setSubjectScore,
    setTotalScore,
    setKindGood,
    setKindOk,
    setClass1,
    setClass2,
    setClassLimit,
  } = useScoreSettingStore.getState();

  // 表格
  const settingFormRef = React.useRef<FormInstance>(null);

  // 单项分数
  const scoreInputItems = Object.keys(subjectScore).map((subject) => (
    <Form.Item
      key={subject}
      name={subject}
      label={subject}
      rules={[{ required: true }]}
    >
      <InputNumber
        min={0}
        max={200}
        placeholder={subject + "总分"}
        addonAfter="分"
        onChange={updateTotalScore}
      />
    </Form.Item>
  ));

  // 更新总分
  function updateTotalScore() {
    const scores = settingFormRef.current?.getFieldsValue();

    let total = 0;
    for (const key in subjectScore) {
      if (Object.prototype.hasOwnProperty.call(scores, key)) {
        const score = scores[key];
        total += score;
      }
    }
    settingFormRef.current?.setFieldValue("总分", total);
  }

  useEffect(() => {
    // 保存参数设置
    listen("save-score-setting", (event) => {
      console.log("save-score-setting", event);
      settingFormRef.current?.submit();
    });
  });

  const onFinish = (values: any) => {
    console.log("Success:", values);

    let scoreDict = {} as SubjectScore;
    for (const key in values) {
      if (Object.prototype.hasOwnProperty.call(values, key)) {
        const score = values[key];
        if (key in subjectScore) {
          scoreDict[key] = score;
        }
      }
    }
    setSubjectScore(scoreDict);
    setTotalScore(values["总分"]);
    setKindGood(values["优秀"]);
    setKindOk(values["及格"]);
    setClass1(values["一类尖子生"]);
    setClass2(values["二类尖子生"]);
    setClassLimit(values["尖子生范围"]);
    if (currentStep < 3) {
      setCurrentStep(3);
      setTabKey("计算结果");
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <>
      <Form
        ref={settingFormRef}
        name="basic"
        requiredMark="optional"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        initialValues={{
          ...subjectScore,
          总分: totalScore,
          优秀: kindGood,
          及格: kindOk,
          一类尖子生: class1,
          二类尖子生: class2,
          尖子生范围: classLimit,
        }}
        validateMessages={{ required: "请配置 '${name}'" }}
      >
        <Row gutter={[16, 16]}>
          <Col sm={12}>
            <Card title="" bordered={true} hoverable>
              {scoreInputItems}
            </Card>
          </Col>
          <Col sm={12}>
            <Card title="" bordered={true} hoverable>
              <Form.Item name="总分" label="总分" rules={[{ required: true }]}>
                <InputNumber
                  min={0}
                  max={100}
                  placeholder="总分"
                  addonAfter="分"
                  readOnly
                />
              </Form.Item>
              <Form.Item name="优秀" label="优秀" rules={[{ required: true }]}>
                <InputNumber
                  min={0}
                  max={100}
                  placeholder="优秀"
                  addonAfter="%"
                />
              </Form.Item>
              <Form.Item name="及格" label="及格" rules={[{ required: true }]}>
                <InputNumber
                  min={0}
                  max={100}
                  placeholder="及格"
                  addonAfter="%"
                />
              </Form.Item>
              <Form.Item
                name="一类尖子生"
                label="一类尖子生"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={0}
                  max={10000}
                  placeholder="一类尖子生个数"
                  addonAfter="个"
                />
              </Form.Item>
              <Form.Item
                name="二类尖子生"
                label="二类尖子生"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={0}
                  max={10000}
                  placeholder="二类尖子生个数"
                  addonAfter="个"
                />
              </Form.Item>
              <Form.Item
                name="尖子生范围"
                label="尖子生范围"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={0}
                  max={10000}
                  placeholder="尖子生范围"
                  addonAfter="个"
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </>
  );
}

export default App;
