import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

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
  scoreTitleIndex: initScoreTitle(),
  scoreColumns: [],
  scoreTableData: [],
  scoreTitleOptions: [],

  classTitleRequired: classRequireDict,
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
  setScoreColumns(val) {
    set({ scoreColumns: val });
  },
  setScoreTableData(val) {
    set({ scoreTableData: val });
  },
  setScoreTitleOptions(val) {
    set({ scoreTitleOptions: val });
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
      }),
      {
        name: "score-storage",
        // getStorage: () => localStorage,
      }
    )
  )
);
