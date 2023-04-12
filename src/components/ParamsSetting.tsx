import React from "react";
import { listen } from "@tauri-apps/api/event";
import { Col, Form, InputNumber, Row, Card } from "antd";

import type { FormInstance } from "antd/es/form";

function App() {
  // store
  const currentStep = useScoreStore((state) => state.currentStep);
  const { setCurrentStep } = useScoreStore.getState();

  const subjectScore = useScoreSettingStore((state) => state.subjectScore);
  const totalScore = useScoreSettingStore((state) => state.totalScore);
  const kindGood = useScoreSettingStore((state) => state.kindGood);
  const kindOk = useScoreSettingStore((state) => state.kindOk);
  const { setSubjectScore, setTotalScore, setKindGood, setKindOk } =
    useScoreSettingStore.getState();

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

  const settingFormRef = React.useRef<FormInstance>(null);

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
    if (currentStep < 2) {
      setCurrentStep(3);
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
        }}
        validateMessages={{ required: "请配置 '${name}'" }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Card title="" bordered={true} hoverable>
              {scoreInputItems}
            </Card>
          </Col>
          <Col span={12}>
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
            </Card>
          </Col>
        </Row>
      </Form>
    </>
  );
}

export default App;
