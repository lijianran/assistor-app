import { create } from "zustand";

function initScoreTitle() {
  return <ScoreTitleIndex>{
    姓名: -1,
    考号: -1,
    班级: -1,
    总分: -1,
    语文: -1,
    数学: -1,
    英语: -1,
    物理: -1,
    化学: -1,
    道法: -1,
    历史: -1,
    地理: -1,
    生物: -1,
  };
}
function initClassTitle() {
  return <ClassTitleIndex>{
    班级: -1,
    语文: -1,
    数学: -1,
    英语: -1,
    物理: -1,
    化学: -1,
    道法: -1,
    历史: -1,
    地理: -1,
    生物: -1,
    人数: -1,
  };
}

const titleRequireDict = <ScoreTitleRequired>{
  姓名: false,
  考号: false,
  班级: true,
  总分: true,
  语文: false,
  数学: false,
  英语: false,
  物理: false,
  化学: false,
  道法: false,
  历史: false,
  地理: false,
  生物: false,
};

const classRequireDict = <ClassTitleRequired>{
  班级: true,
  人数: true,
  语文: false,
  数学: false,
  英语: false,
  物理: false,
  化学: false,
  道法: false,
  历史: false,
  地理: false,
  生物: false,
};

const tabStepMap = {
  成绩数据表: 0,
  班级信息表: 1,
  参数配置: 2,
};

export const useScoreStore = create<ScoreProps>((set, get) => ({
  currentStep: 0,
  tabKey: "成绩数据表",
  openDrawer: false,

  scoreTitleRequired: titleRequireDict,
  classTitleRequired: classRequireDict,
  scoreTitleIndex: initScoreTitle(),
  classTitleIndex: initClassTitle(),

  setCurrentStep(val) {
    set({ currentStep: val });
  },
  nextStep() {
    // const step = get().currentStep + 1;
    const step = tabStepMap[get().tabKey] + 1;
    set({ currentStep: step as Step });
  },
  setTabKey: (val) => {
    set({ tabKey: val });
  },
  setOpenDrawer(val) {
    set({ openDrawer: val });
  },
  setScoreTitleIndex: (val) => {
    let titleIndex = initScoreTitle();
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        titleIndex[key] = val[key];
      }
    }
    set({ scoreTitleIndex: titleIndex });
  },
  setClassTitleIndex: (val) => {
    let titleIndex = initClassTitle();
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        titleIndex[key] = val[key];
      }
    }
    set({ classTitleIndex: titleIndex });
  },
}));
