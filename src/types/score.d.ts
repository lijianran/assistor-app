declare type TitleIndexDict = { [key: string]: number };

declare type Step = 0 | 1 | 2 | 3;
declare type TabKey = "成绩数据表" | "班级信息表" | "参数配置";

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
  [key: string]: number;

  姓名: number;
  考号: number;
  班级: number;
  总分: number;
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

/** 班级表字段索引 */
declare interface ClassTitleIndex {
  [key: string]: number;

  班级: number;
  语文: number;
  数学: number;
  英语: number;
  物理: number;
  化学: number;
  道法: number;
  历史: number;
  地理: number;
  生物: number;
  人数: number;
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
  /**@name 班级表字段是否必选 */
  classTitleRequired: ClassTitleRequired;
  /**@name 成绩表标题索引 */
  scoreTitleIndex: ScoreTitleIndex;
  /**@name 班级表标题索引 */
  classTitleIndex: ClassTitleIndex;

  setCurrentStep: (val: Step) => void;
  nextStep: () => void;
  setTabKey: (val: TabKey) => void;
  setOpenDrawer: (val: boolean) => void;
  setScoreTitleIndex: (val: TitleIndexDict) => void;
  setClassTitleIndex: (val: TitleIndexDict) => void;
};
