// 骰子类型枚举
export enum DiceType {
  NORMAL = 'NORMAL',
  CAVIER_1 = 'CAVIER_1',
  CAVIER_2 = 'CAVIER_2',
  CAVIER_3 = 'CAVIER_3',
  CAVIER_4 = 'CAVIER_4',
  CAVIER_5 = 'CAVIER_5',
  CAVIER_6 = 'CAVIER_6',
  ADULT = 'ADULT',
  EVEN = 'EVEN',
  ODD = 'ODD',
  HEAVEN = 'HEAVEN',
  DEMON_LU = 'DEMON_LU',
  DEMON_XI = 'DEMON_XI',
  DEMON_FA = 'DEMON_FA',
  LUCKY = 'LUCKY',
  SMALL_LUCKY = 'SMALL_LUCKY',
  MINI = 'MINI',
  CLOTHED = 'CLOTHED',
  RIGGED = 'RIGGED',
  UNPOPULAR = 'UNPOPULAR',
  UNLUCKY = 'UNLUCKY',
  TRIPLE_THREE = 'TRIPLE_THREE',
  CAVI_C = 'KAVI_C',
  ANGEL_AN = 'ANGEL_AN',
  ANGEL_JI = 'ANGEL_JI',
  ANGEL_LA = 'ANGEL_LA',
  ANTIOCH = 'ANTIOCH',
  LOADED = 'LOADED'
}

// 骰子数据接口
export interface DiceData {
  type: DiceType;
  name: string;
  description: string;
  price: number;
  canBeSold: boolean;
  canBePurchased: boolean; // 是否可以在商店中购买
  dropRate: number; // 获胜后掉落几率 (0-1)
  maxOwned: number; // 最多可拥有数量
  backgroundColor: string;
  textColor: string;
  probabilities: {
    [key: number]: number;  // 键是点数(1-6)，值是概率
  };
}

// 骰子数据集合
export const DICE_DATA: { [key in DiceType]: DiceData } = {
  [DiceType.NORMAL]: {
    type: DiceType.NORMAL,
    name: '普通骰子',
    description: '标准的六面骰子，每个点数概率相等',
    price: 0, // 普通骰子免费
    canBeSold: false, // 普通骰子不能出售
    canBePurchased: true, // 普通骰子可以购买
    dropRate: 0, // 普通骰子不会作为奖励掉落
    maxOwned: 999, // 普通骰子数量不限
    backgroundColor: '#ffffff',
    textColor: '#000000',
    probabilities: {
      1: 1/6,
      2: 1/6,
      3: 1/6,
      4: 1/6,
      5: 1/6,
      6: 1/6
    }
  },
  [DiceType.CAVIER_1]: {
    type: DiceType.CAVIER_1,
    name: '卡维尔的测试骰子1',
    description: '这个骰子……好像有点bug',
    price: 20,
    canBeSold: true,
    canBePurchased: false, // 只能通过获胜奖励获得
    dropRate: 0.001, // 0.1%几率获得
    maxOwned: 1,
    backgroundColor: '#e74c3c',
    textColor: '#000000',
    probabilities: {
      1: 1,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0
    }
  },
  [DiceType.CAVIER_2]: {
    type: DiceType.CAVIER_2,
    name: '卡维尔的测试骰子2',
    description: '这个骰子……好像有点bug',
    price: 20,
    canBeSold: true,
    canBePurchased: false, // 只能通过获胜奖励获得
    dropRate: 0.002, // 0.2%几率获得
    maxOwned: 1,
    backgroundColor: '#e67e22',
    textColor: '#000000',
    probabilities: {
      1: 0,
      2: 1,
      3: 0,
      4: 0,
      5: 0,
      6: 0
    }
  },
  [DiceType.CAVIER_3]: {
    type: DiceType.CAVIER_3,
    name: '卡维尔的测试骰子3',
    description: '这个骰子……好像有点bug',
    price: 20,
    canBeSold: true,
    canBePurchased: false, // 只能通过获胜奖励获得
    dropRate: 0.003, // 0.3%几率获得
    maxOwned: 1,
    backgroundColor: '#f1c40f',
    textColor: '#000000',
    probabilities: {
      1: 0,
      2: 0,
      3: 1,
      4: 0,
      5: 0,
      6: 0
    }
  },
  [DiceType.CAVIER_4]: {
    type: DiceType.CAVIER_4,
    name: '卡维尔的测试骰子4',
    description: '这个骰子……好像有点bug',
    price: 20,
    canBeSold: true,
    canBePurchased: false, // 只能通过获胜奖励获得
    dropRate: 0.004, // 0.4%几率获得
    maxOwned: 1,
    backgroundColor: '#2ecc71',
    textColor: '#000000',
    probabilities: {
      1: 0,
      2: 0,
      3: 0,
      4: 1,
      5: 0,
      6: 0
    }
  },
  [DiceType.CAVIER_5]: {
    type: DiceType.CAVIER_5,
    name: '卡维尔的测试骰子5',
    description: '这个骰子……好像有点bug',
    price: 20,
    canBeSold: true,
    canBePurchased: false, // 只能通过获胜奖励获得
    dropRate: 0.001, // 0.5%几率获得
    maxOwned: 1,
    backgroundColor: '#3498db',
    textColor: '#000000',
    probabilities: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 1,
      6: 0
    }
  },
  [DiceType.CAVIER_6]: {
    type: DiceType.CAVIER_6,
    name: '卡维尔的测试骰子6',
    description: '这个骰子……好像有点bug',
    price: 20,
    canBeSold: true,
    canBePurchased: false, // 只能通过获胜奖励获得
    dropRate: 0.006, // 0.6%几率获得
    maxOwned: 1,
    backgroundColor: '#9b59b6',
    textColor: '#000000',
    probabilities: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 1
    }
  },
  [DiceType.ADULT]: {
    type: DiceType.ADULT,
    name: '大人的骰子',
    description: '某个大人掉落的骰子，也许有什么特殊效果',
    price: 600,
    canBeSold: true,
    canBePurchased: false,
    dropRate: 0.0005, // 0.05%几率获得
    maxOwned: 6,
    backgroundColor: '#8e44ad',
    textColor: '#000000',
    probabilities: {
      1: 0.385,
      2: 0.077,
      3: 0.077,
      4: 0.077,
      5: 0.154,
      6: 0.23
    }
  },
  [DiceType.EVEN]: {
    type: DiceType.EVEN,
    name: '偶数骰子',
    description: '更容易出偶数的骰子',
    price: 88,
    canBeSold: true,
    canBePurchased: true,
    dropRate: 0.09, // 9%几率获得
    maxOwned: 99,
    backgroundColor: '#3498db',
    textColor: '#000000',
    probabilities: {
      1: 0.067,
      2: 0.267,
      3: 0.067,
      4: 0.267,
      5: 0.067,
      6: 0.267
    }
  },
  [DiceType.ODD]: {
    type: DiceType.ODD,
    name: '奇数骰子',
    description: '更容易出奇数的骰子',
    price: 99,
    canBeSold: true,
    canBePurchased: true,
    dropRate: 0.08, // 8%几率获得
    maxOwned: 99,
    backgroundColor: '#e74c3c',
    textColor: '#000000',
    probabilities: {
      1: 0.217,
      2: 0.117,
      3: 0.217,
      4: 0.117,
      5: 0.217,
      6: 0.117
    }
  },
  [DiceType.HEAVEN]: {
    type: DiceType.HEAVEN,
    name: '天国骰子',
    description: '传说中的天国骰子，请你不要卖掉它',
    price: 10000,
    canBeSold: false,
    canBePurchased: false,
    dropRate: 0.0004, // 0.04%几率获得
    maxOwned: 4,
    backgroundColor: '#000000',
    textColor: '#ffffff',
    probabilities: {
      1: 0.368,
      2: 0.105,
      3: 0.105,
      4: 0.105,
      5: 0.105,
      6: 0.211
    }
  },
  [DiceType.ANGEL_AN]: {
    type: DiceType.ANGEL_AN,
    name: '安骰子',
    description: '天使三骰之"安"，容易出6',
    price: 111,
    canBeSold: true,
    canBePurchased: false,
    dropRate: 0.01, // 1%几率获得
    maxOwned: 1,
    backgroundColor: '#e6f7ff', // 浅蓝色背景
    textColor: '#0066cc', // 深蓝色文字
    probabilities: {
      1: 0.13,
      2: 0.13,
      3: 0.13,
      4: 0.13,
      5: 0.214,
      6: 0.266
    }
  },
  [DiceType.ANGEL_JI]: {
    type: DiceType.ANGEL_JI,
    name: '吉骰子',
    description: '天使三骰之"吉"，容易出6',
    price: 222,
    canBeSold: true,
    canBePurchased: false,
    dropRate: 0.02, // 2%几率获得
    maxOwned: 1,
    backgroundColor: '#fff1e6', // 浅橙色背景
    textColor: '#cc6600', // 深橙色文字
    probabilities: {
      1: 0.13,
      2: 0.13,
      3: 0.13,
      4: 0.13,
      5: 0.214,
      6: 0.266
    }
  },
  [DiceType.ANGEL_LA]: {
    type: DiceType.ANGEL_LA,
    name: '拉骰子',
    description: '天使三骰之"拉"，容易出6',
    price: 333,
    canBeSold: true,
    canBePurchased: false,
    dropRate: 0.03, // 3%几率获得
    maxOwned: 1,
    backgroundColor: '#f0e6ff', // 浅紫色背景
    textColor: '#6600cc', // 深紫色文字
    probabilities: {
      1: 0.13,
      2: 0.13,
      3: 0.13,
      4: 0.13,
      5: 0.214,
      6: 0.266
    }
  },
  [DiceType.DEMON_LU]: {
    type: DiceType.DEMON_LU,
    name: '卢骰子',
    description: '恶魔三骰之"卢"，容易出6',
    price: 111,
    canBeSold: true,
    canBePurchased: false,
    dropRate: 0.01, // 1%几率获得
    maxOwned: 1,
    backgroundColor: '#c0392b',
    textColor: '#000000',
    probabilities: {
      1: 0.13,
      2: 0.13,
      3: 0.13,
      4: 0.13,
      5: 0.13,
      6: 0.348
    }
  },
  [DiceType.DEMON_XI]: {
    type: DiceType.DEMON_XI,
    name: '西骰子',
    description: '恶魔三骰之"西"，容易出6',
    price: 222,
    canBeSold: true,
    canBePurchased: false,
    dropRate: 0.02, // 2%几率获得
    maxOwned: 1,
    backgroundColor: '#c0392b',
    textColor: '#000000',
    probabilities: {
      1: 0.13,
      2: 0.13,
      3: 0.13,
      4: 0.13,
      5: 0.13,
      6: 0.348
    }
  },
  [DiceType.DEMON_FA]: {
    type: DiceType.DEMON_FA,
    name: '法骰子',
    description: '恶魔三骰之"法"，容易出6',
    price: 333,
    canBeSold: true,
    canBePurchased: false,
    dropRate: 0.03, // 3%几率获得
    maxOwned: 1,
    backgroundColor: '#c0392b',
    textColor: '#000000',
    probabilities: {
      1: 0.13,
      2: 0.13,
      3: 0.13,
      4: 0.13,
      5: 0.13,
      6: 0.348
    }
  },
  [DiceType.LUCKY]: {
    type: DiceType.LUCKY,
    name: '幸运之骰',
    description: '容易出1和5，但数量有限',
    price: 777,
    canBeSold: true,
    canBePurchased: false,
    dropRate: 0.007, // 0.7%几率获得
    maxOwned: 3,
    backgroundColor: '#2ecc71',
    textColor: '#000000',
    probabilities: {
      1: 0.333,
      2: 0,
      3: 0.056,
      4: 0.056,
      5: 0.333,
      6: 0.222
    }
  },
  [DiceType.SMALL_LUCKY]: {
    type: DiceType.SMALL_LUCKY,
    name: '小幸运骰子',
    description: '容易出1和5，但数量有限',
    price: 77,
    canBeSold: true,
    canBePurchased: true,
    dropRate: 0.07, // 7%几率获得
    maxOwned: 3,
    backgroundColor: '#2ecc71',
    textColor: '#000000',
    probabilities: {
      1: 0.273,
      2: 0.045,
      3: 0.091,
      4: 0.136,
      5: 0.182,
      6: 0.273
    }
  },
  [DiceType.MINI]: {
    type: DiceType.MINI,
    name: 'mini骰子',
    description: '名称与外观不符，容易出1和6',
    price: 216,
    canBeSold: true,
    canBePurchased: true,
    dropRate: 0.05, // 5%几率获得
    maxOwned: 2,
    backgroundColor: '#95a5a6',
    textColor: '#000000',
    probabilities: {
      1: 0.222,
      2: 0.111,
      3: 0.111,
      4: 0.111,
      5: 0.111,
      6: 0.333
    }
  },
  [DiceType.CLOTHED]: {
    type: DiceType.CLOTHED,
    name: '穿衣骰子',
    description: '容易出156，让人穿衣服',
    price: 50,
    canBeSold: true,
    canBePurchased: false,
    dropRate: 0.05, // 5%几率获得
    maxOwned: 99,
    backgroundColor: '#e67e22',
    textColor: '#ffffff',
    probabilities: {
      1: 0.25,
      2: 0.125,
      3: 0.125,
      4: 0.125,
      5: 0.188,
      6: 0.188
    }
  },
  [DiceType.RIGGED]: {
    type: DiceType.RIGGED,
    name: '动过手脚的骰子',
    description: '最基础的出千骰子，容易出2',
    price: 50,
    canBeSold: true,
    canBePurchased: true,
    dropRate: 0.1, // 10%几率获得
    maxOwned: 99,
    backgroundColor: '#7f8c8d',
    textColor: '#000000',
    probabilities: {
      1: 0.23,
      2: 0.374,
      3: 0.083,
      4: 0.083,
      5: 0.147,
      6: 0.083
    }
  },
  [DiceType.UNPOPULAR]: {
    type: DiceType.UNPOPULAR,
    name: '不受欢迎的骰子',
    description: '被人嫌弃，也许好用？',
    price: 15,
    canBeSold: true,
    canBePurchased: true,
    dropRate: 0.1, // 10%几率获得
    maxOwned: 99,
    backgroundColor: '#bdc3c7',
    textColor: '#000000',
    probabilities: {
      1: 0.091,
      2: 0.273,
      3: 0.182,
      4: 0.182,
      5: 0.182,
      6: 0.091
    }
  },
  [DiceType.UNLUCKY]: {
    type: DiceType.UNLUCKY,
    name: '厄运骰子',
    description: '最好不要用这玩意',
    price: 555,
    canBeSold: true,
    canBePurchased: false,
    dropRate: 0.05, // 5%几率获得
    maxOwned: 99,
    backgroundColor: '#34495e',
    textColor: '#ffffff',
    probabilities: {
      1: 0.045,
      2: 0.227,
      3: 0.227,
      4: 0.227,
      5: 0.227,
      6: 0.045
    }
  },
  [DiceType.TRIPLE_THREE]: {
    type: DiceType.TRIPLE_THREE,
    name: '三圣一骰子',
    description: '3！3！3！',
    price: 333,
    canBeSold: true,
    canBePurchased: true,
    dropRate: 0.03, // 3%几率获得
    maxOwned: 99,
    backgroundColor: '#16a085',
    textColor: '#000000',
    probabilities: {
      1: 0.182,
      2: 0.227,
      3: 0.455,
      4: 0.045,
      5: 0.045,
      6: 0.045
    }
  },
  [DiceType.CAVI_C]: {
    type: DiceType.CAVI_C,
    name: '卡维的C测骰子',
    description: '不知道有什么用',
    price: 20,
    canBeSold: true,
    canBePurchased: true,
    dropRate: 0.1, // 10%几率获得
    maxOwned: 99,
    backgroundColor: '#1abc9c',
    textColor: '#000000',
    probabilities: {
      1: 0.111,
      2: 0.444,
      3: 0.111,
      4: 0.111,
      5: 0.111,
      6: 0.111
    }
  },
  [DiceType.ANTIOCH]: {
    type: DiceType.ANTIOCH,
    name: '圣安提阿克斯的骰子',
    description: '好像6个面都是3，但也只有3个',
    price: 3333,
    canBeSold: true,
    canBePurchased: true,
    dropRate: 0.03, // 3%几率获得
    maxOwned: 3,
    backgroundColor: '#9A582D',
    textColor: '#683C28',
    probabilities: {
      1: 0,
      2: 0,
      3: 1,
      4: 0,
      5: 0,
      6: 0
    }
  },
  [DiceType.LOADED]: {
    type: DiceType.LOADED,
    name: '灌铅骰子',
    description: '5的那一面被加了重量',
    price: 1111,
    canBeSold: true,
    canBePurchased: false,
    dropRate: 0.01, // 1%几率获得
    maxOwned: 2,
    backgroundColor: '#34495e',
    textColor: '#000000',
    probabilities: {
      1: 0.61,
      2: 0.08,
      3: 0.08,
      4: 0.08,
      5: 0.08,
      6: 0.08
    }
  }
};

// 辅助函数：获取骰子名称
export const getDiceName = (type: DiceType): string => {
  return DICE_DATA[type].name;
};

// 辅助函数：获取骰子描述
export const getDiceDescription = (type: DiceType): string => {
  return DICE_DATA[type].description;
};

// 辅助函数：获取骰子价格
export const getDicePrice = (type: DiceType): number => {
  return DICE_DATA[type].price;
};

// 辅助函数：获取骰子是否可出售
export const isDiceSellable = (type: DiceType): boolean => {
  return DICE_DATA[type].canBeSold;
};

// 辅助函数：获取骰子背景颜色
export const getDiceBackgroundColor = (type: DiceType): string => {
  return DICE_DATA[type].backgroundColor;
};

// 辅助函数：获取骰子文本颜色
export const getDiceTextColor = (type: DiceType): string => {
  return DICE_DATA[type].textColor;
};

// 辅助函数：获取骰子点数概率
export const getDiceProbabilities = (type: DiceType): { [key: number]: number } => {
  return DICE_DATA[type].probabilities;
};

// 辅助函数：获取骰子出售价格（原价的70%）
export const getDiceSellPrice = (type: DiceType): number => {
  return Math.floor(DICE_DATA[type].price * 0.7);
};

// 辅助函数：根据骰子类型和随机数生成骰子点数
export const rollDice = (type: DiceType): number => {
  const probabilities = DICE_DATA[type].probabilities;
  const random = Math.random();
  let sum = 0;
  
  for (let i = 1; i <= 6; i++) {
    sum += probabilities[i];
    if (random < sum) {
      return i;
    }
  }
  
  return 6; // 默认返回6
};

// 辅助函数：获取骰子是否可购买
export const isDicePurchasable = (type: DiceType): boolean => {
  return DICE_DATA[type].canBePurchased;
};

// 辅助函数：获取骰子掉落几率
export const getDiceDropRate = (type: DiceType): number => {
  return DICE_DATA[type].dropRate;
};

// 辅助函数：获取骰子最大拥有数量
export const getDiceMaxOwned = (type: DiceType): number => {
  return DICE_DATA[type].maxOwned;
};

// 辅助函数：随机选择一个骰子类型作为奖励
export const getRandomRewardDice = (): DiceType | null => {
  // 过滤出有掉落几率的骰子
  const droppableDice = Object.values(DiceType).filter(type => DICE_DATA[type].dropRate > 0);
  
  if (droppableDice.length === 0) return null;
  
  // 根据掉落几率随机选择
  const random = Math.random();
  let cumulativeProbability = 0;
  
  // 创建一个包含骰子类型和对应掉落几率的数组
  const diceWithProbabilities = droppableDice.map(type => ({
    type,
    probability: DICE_DATA[type].dropRate
  }));
  
  // 归一化概率，确保总和为1
  const totalProbability = diceWithProbabilities.reduce((sum, dice) => sum + dice.probability, 0);
  const normalizedDice = diceWithProbabilities.map(dice => ({
    ...dice,
    probability: dice.probability / totalProbability
  }));
  
  // 根据归一化后的概率选择骰子
  for (const dice of normalizedDice) {
    cumulativeProbability += dice.probability;
    if (random <= cumulativeProbability) {
      return dice.type;
    }
  }
  
  // 如果没有选中任何骰子，返回第一个
  return normalizedDice[0].type;
}; 