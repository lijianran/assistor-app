import React from "react";
import { listen } from "@tauri-apps/api/event";
import { Space, Col, Form, InputNumber, Row, Card, Alert } from "antd";

import type { FormInstance } from "antd/es/form";

function App() {
  // store
  const currentStep = useScoreStore((state) => state.currentStep);
  const { setCurrentStep, setTabKey } = useScoreStore.getState();

  const subjectScore = useScoreSettingStore((state) => state.subjectScore);
  const totalScore = useScoreSettingStore((state) => state.totalScore);
  const { setSubjectScore, setTotalScore } = useScoreSettingStore.getState();
  const scoreTitleIndex = useScoreStore((state) => state.scoreTitleIndex);

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

  // 更新总分（只累计成绩表中存在的科目）
  function updateTotalScore() {
    const scores = settingFormRef.current?.getFieldsValue();

    let total = 0;
    for (const key in subjectScore) {
      if (scoreTitleIndex[key] === "无") {
        continue;
      }
      if (Object.prototype.hasOwnProperty.call(scores, key)) {
        const score = scores[key];
        total += score;
      }
    }
    settingFormRef.current?.setFieldValue("总分", total);
  }

  useEffect(() => {
    // 打开参数配置时按成绩表实际科目刷新总分
    updateTotalScore();
    // 保存参数设置
    listen("save-score-setting", (event) => {
      console.log("save-score-setting", event);
      settingFormRef.current?.submit();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFinish = (values: any) => {
    console.log("Success:", values);

    let scoreDict = {} as SubjectScore;
    let total = 0;
    for (const key in values) {
      if (Object.prototype.hasOwnProperty.call(values, key)) {
        const score = values[key];
        if (key in subjectScore) {
          scoreDict[key] = score;
          if (scoreTitleIndex[key] !== "无") {
            total += score;
          }
        }
      }
    }
    setSubjectScore(scoreDict);
    setTotalScore(total);
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
        }}
        validateMessages={{ required: "请配置 '${name}'" }}
      >
        <Row gutter={[16, 16]}>
          <Col sm={12}>
            <Card title="单科总分" bordered={true} hoverable>
              {scoreInputItems}
            </Card>
          </Col>
          <Col sm={12}>
            <Card title="总分" bordered={true} hoverable>
              <Form.Item name="总分" label="总分" rules={[{ required: true }]}>
                <InputNumber
                  min={0}
                  max={1000}
                  placeholder="总分"
                  addonAfter="分"
                  readOnly
                />
              </Form.Item>
              <Alert
                type="info"
                showIcon
                message="统计规则"
                description={
                  <div>
                    <p>人平分：按总分从高到低取班级人数统计各科平均分</p>
                    <p>得分率：人平分 ÷ 单科总分</p>
                    <p>优秀率：单科分数 ≥ 单科总分的 80%</p>
                    <p>及格率：单科分数 ≥ 单科总分的 60%</p>
                    <p>低分率：单科分数 &lt; 单科总分的 40%</p>
                    <p>四率和：人平分 + 优秀率×100 + 及格率×100 + 得分率×100 - 低分率×100</p>
                  </div>
                }
              />
            </Card>
          </Col>
        </Row>
      </Form>
    </>
  );
}

export default App;
