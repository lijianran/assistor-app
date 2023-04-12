import { Steps } from "antd";

function App() {
  // store
  const currentStep = useScoreStore((state) => state.currentStep);

  const stepItems = [
    {
      title: "步骤1",
      description: "上传成绩数据表",
    },
    {
      title: "步骤2",
      description: "上传班级信息表",
      // subTitle: "Left 00:00:08",
    },
    {
      title: "步骤3",
      description: "配置参数",
    },
    {
      title: "步骤4",
      description: "统计结果",
    },
  ];

  return <Steps current={currentStep} items={stepItems} type="default" />;
}

export default App;
