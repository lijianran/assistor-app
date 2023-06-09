declare type TitleIndexDict = { [key: string]: string };

declare type Step = 0 | 1 | 2 | 3 | 4;
declare type TabKey = "成绩数据表" | "班级信息表" | "参数配置" | "计算结果";

/** 成绩表字段是否必选 */
declare interface ScoreTitleRequired {
  [key: string]: boolean;

  姓名: boolean;
  考号: boolean;
  班级: boolean;
  总分: boolean;
  语文: boolean;
  数学: boolean;
  英语: boolean;
  物理: boolean;
  化学: boolean;
  道法: boolean;
  历史: boolean;
  地理: boolean;
  生物: boolean;
}

/** 班级表字段是否必选 */
declare interface ClassTitleRequired {
  [key: string]: boolean;

  班级: boolean;
  语文: boolean;
  数学: boolean;
  英语: boolean;
  物理: boolean;
  化学: boolean;
  道法: boolean;
  历史: boolean;
  地理: boolean;
  生物: boolean;
  人数: boolean;
}

/** 成绩表字段索引 */
declare interface ScoreTitleIndex {
  [key: string]: string;

  姓名: string;
  考号: string;
  班级: string;
  总分: string;
  语文: string;
  数学: string;
  英语: string;
  物理: string;
  化学: string;
  道法: string;
  历史: string;
  地理: string;
  生物: string;
}

/** 班级表字段索引 */
declare interface ClassTitleIndex {
  [key: string]: string;

  班级: string;
  语文: string;
  数学: string;
  英语: string;
  物理: string;
  化学: string;
  道法: string;
  历史: string;
  地理: string;
  生物: string;
  人数: string;
}

/** 成绩统计 store */
declare type ScoreProps = {
  /**@name 当前步骤 */
  currentStep: Step;
  /**@name 当前tab */
  tabKey: TabKey;
  /**@name 打开表格配置 */
  openDrawer: boolean;

  /**@name 成绩表字段是否必选 */
  scoreTitleRequired: ScoreTitleRequired;
  /**@name 成绩表标题索引 */
  scoreTitleIndex: ScoreTitleIndex;
  /** 成绩表数据 */
  scoreColumns: any[];
  scoreTableData: any[];
  scoreTitleOptions: any[];

  /**@name 班级表字段是否必选 */
  classTitleRequired: ClassTitleRequired;
  /**@name 班级表标题索引 */
  classTitleIndex: ClassTitleIndex;

  classTitleOptions: any[];

  setCurrentStep: (val: Step) => void;
  nextStep: () => void;
  setTabKey: (val: TabKey) => void;
  setOpenDrawer: (val: boolean) => void;

  setScoreTitleIndex: (val: TitleIndexDict) => void;
  setScoreColumns: (val: any[]) => void;
  setScoreTableData: (val: any[]) => void;
  setScoreTitleOptions: (val: any[]) => void;
  setClassTitleOptions: (val: any[]) => void;

  setClassTitleIndex: (val: TitleIndexDict) => void;
};

/********************************** setting **********************************/

/** 科目总分 */
declare interface SubjectScore {
  [key: string]: number;

  语文: number;
  数学: number;
  英语: number;
  物理: number;
  化学: number;
  道法: number;
  历史: number;
  地理: number;
  生物: number;
}
declare type ScoreSetting = {
  subjectScore: SubjectScore;
  totalScore: number;
  kindGood: number;
  kindOk: number;
  class1: number;
  class2: number;
  classLimit: number;

  setSubjectScore: (val: SubjectScore) => void;
  setTotalScore: (val: number) => void;
  setKindGood: (val: number) => void;
  setKindOk: (val: number) => void;
  setClass1: (val: number) => void;
  setClass2: (val: number) => void;
  setClassLimit: (val: number) => void;
};
