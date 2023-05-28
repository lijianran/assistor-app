import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

function initScoreTitle() {
  return <ScoreTitleIndex>{
    姓名: "无",
    考号: "无",
    班级: "无",
    总分: "无",
    语文: "无",
    数学: "无",
    英语: "无",
    物理: "无",
    化学: "无",
    道法: "无",
    历史: "无",
    地理: "无",
    生物: "无",
  };
}
function initClassTitle() {
  return <ClassTitleIndex>{
    班级: "无",
    语文: "无",
    数学: "无",
    英语: "无",
    物理: "无",
    化学: "无",
    道法: "无",
    历史: "无",
    地理: "无",
    生物: "无",
    人数: "无",
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
  计算结果: 3,
};

export const useScoreStore = create<ScoreProps>((set, get) => ({
  currentStep: 0,
  tabKey: "成绩数据表",
  openDrawer: false,

  scoreTitleRequired: titleRequireDict,
  scoreTitleIndex: initScoreTitle(),
  scoreColumns: [],
  scoreTableData: [],
  scoreTitleOptions: [],

  classTitleRequired: classRequireDict,
  classTitleIndex: initClassTitle(),
  classTitleOptions: [],

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
      if (key in titleIndex) {
        titleIndex[key] = val[key];
      }
    }
    set({ scoreTitleIndex: titleIndex });
  },
  setScoreColumns(val) {
    set({ scoreColumns: val });
  },
  setScoreTableData(val) {
    set({ scoreTableData: val });
  },
  setScoreTitleOptions(val) {
    set({ scoreTitleOptions: val });
  },
  setClassTitleOptions(val) {
    set({ classTitleOptions: val });
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

// const scoreTitleDict = [
//   { label: "姓名", value: "name" },
//   { label: "考号", value: "id" },
//   { label: "班级", value: "class", required: true },
//   { label: "总分", value: "total", required: true },
//   { label: "语文", value: "chinese" },
//   { label: "数学", value: "math" },
//   { label: "英语", value: "english" },
//   { label: "物理", value: "wuli" },
//   { label: "化学", value: "huaxue" },
//   { label: "道法", value: "daofa" },
//   { label: "历史", value: "lishi" },
//   { label: "地理", value: "dili" },
//   { label: "生物", value: "shengwu" },
// ];
// const classTitleDict = [
//   { label: "班级", value: "class", required: true },
//   { label: "语文", value: "chinese" },
//   { label: "数学", value: "math" },
//   { label: "英语", value: "english" },
//   { label: "物理", value: "wuli" },
//   { label: "化学", value: "huaxue" },
//   { label: "道法", value: "daofa" },
//   { label: "历史", value: "lishi" },
//   { label: "地理", value: "dili" },
//   { label: "生物", value: "shengwu" },
//   { label: "人数", value: "count", required: true },
// ];

function initSubjectScore() {
  return <SubjectScore>{
    语文: 120,
    数学: 120,
    英语: 120,
    物理: 60,
    化学: 50,
    道法: 60,
    历史: 60,
    地理: 50,
    生物: 50,
  };
}
export const useScoreSettingStore = create<
  ScoreSetting,
  [["zustand/devtools", never], ["zustand/persist", ScoreSetting]]
>(
  devtools(
    persist(
      (set, get) => ({
        subjectScore: initSubjectScore(),
        totalScore: 690,
        kindGood: 80,
        kindOk: 60,
        class1: 330,
        class2: 660,
        classLimit: 1200,

        setSubjectScore: (val) => {
          set({ subjectScore: val });
        },
        setTotalScore(val) {
          set({ totalScore: val });
        },
        setKindGood(val) {
          set({ kindGood: val });
        },
        setKindOk(val) {
          set({ kindOk: val });
        },
        setClass1(val) {
          set({ class1: val });
        },
        setClass2(val) {
          set({ class2: val });
        },
        setClassLimit(val) {
          set({ classLimit: val });
        },
      }),
      {
        name: "score-storage",
        // getStorage: () => localStorage,
      }
    )
  )
);
