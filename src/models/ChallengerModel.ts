import { DiceType } from './DiceModel';
import { Challenger } from '../components/ChallengerSelector';

// 挑战者骰子配置
export interface ChallengerDiceConfig {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  diceTypes: DiceType[];
  targetScore: number; // 目标分数字段
  rewardDice: DiceType[]; // 奖励特殊骰子列表
  rewardProbability: number; // 获得奖励骰子的概率 (0-1)
}

// 挑战者数据
export const CHALLENGER_CONFIGS: { [key: string]: ChallengerDiceConfig } = {

  'tou-ge': {
    id: 'tou-ge',
    name: '头哥',
    description: '似乎是场子里最不聪明的那个',
    difficulty: 'easy',
    diceTypes: [
      DiceType.ODD,
      DiceType.ODD,
      DiceType.NORMAL,
      DiceType.NORMAL,
      DiceType.NORMAL,
      DiceType.NORMAL
    ],
    targetScore: 4000,
    rewardDice: [DiceType.ODD],
    rewardProbability: 0.7 // 70%概率获得
  },
  'real-gambler': {
    id: 'real-gambler',
    name: '真正的赌狗',
    description: '赌到天昏地暗',
    difficulty: 'hard',
    diceTypes: [
      DiceType.ANGEL_AN,
      DiceType.ANGEL_JI,
      DiceType.ANGEL_LA,
      DiceType.DEMON_LU,
      DiceType.DEMON_XI,
      DiceType.DEMON_FA
    ],
    targetScore: 4000,
    rewardDice: [DiceType.ANGEL_AN, DiceType.ANGEL_JI, DiceType.ANGEL_LA],
    rewardProbability: 0.2 // 20%概率获得
  },
  'dance-boss': {
    id: 'dance-boss',
    name: '舞场老板',
    description: '懂的都懂',
    difficulty: 'medium',
    diceTypes: [
      DiceType.CLOTHED,
      DiceType.CLOTHED,
      DiceType.CLOTHED,
      DiceType.CLOTHED,
      DiceType.CLOTHED,
      DiceType.CLOTHED
    ],
    targetScore: 4000,
    rewardDice: [DiceType.CLOTHED],
    rewardProbability: 0.3 // 30%概率获得
  },
  'cheater': {
    id: 'cheater',
    name: '手脚不太干净的人',
    description: '臭名远扬的出千高手',
    difficulty: 'medium',
    diceTypes: [
      DiceType.RIGGED,
      DiceType.RIGGED,
      DiceType.RIGGED,
      DiceType.RIGGED,
      DiceType.RIGGED,
      DiceType.RIGGED
    ],
    targetScore: 4000,
    rewardDice: [DiceType.RIGGED],
    rewardProbability: 0.4 // 40%概率获得
  },
  'a-san': {
    id: 'a-san',
    name: '阿三',
    description: '他就是阿三',
    difficulty: 'medium',
    diceTypes: [
      DiceType.TRIPLE_THREE,
      DiceType.TRIPLE_THREE,
      DiceType.TRIPLE_THREE,
      DiceType.TRIPLE_THREE,
      DiceType.TRIPLE_THREE,
      DiceType.TRIPLE_THREE
    ],
    targetScore: 3333,
    rewardDice: [DiceType.TRIPLE_THREE],
    rewardProbability: 0.33 // 33%概率获得
  },
  'malcolm': {
    id: 'malcolm',
    name: '马尔科姆',
    description: '只能说有点实力',
    difficulty: 'medium',
    diceTypes: [
      DiceType.MINI,
      DiceType.MINI,
      DiceType.MINI,
      DiceType.NORMAL,
      DiceType.NORMAL,
      DiceType.NORMAL
    ],
    targetScore: 6000,
    rewardDice: [DiceType.MINI],
    rewardProbability: 0.2 // 20%概率获得
  },
  'merchant': {
    id: 'merchant',
    name: '远方来的商人',
    description: '跋山涉水过来的商人，肯定有一些运气在上面',
    difficulty: 'medium',
    diceTypes: [
      DiceType.SMALL_LUCKY,
      DiceType.SMALL_LUCKY,
      DiceType.SMALL_LUCKY,
      DiceType.LUCKY,
      DiceType.LUCKY,
      DiceType.LUCKY
    ],
    targetScore: 6000,
    rewardDice: [DiceType.SMALL_LUCKY, DiceType.LUCKY],
    rewardProbability: 0.3 // 30%概率获得
  },
  'small-cavier': {
    id: 'small-cavier',
    name: '小卡维',
    description: '不知道实力如何',
    difficulty: 'medium',
    diceTypes: [
      DiceType.CAVI_C,
      DiceType.CAVI_C,
      DiceType.CAVI_C,
      DiceType.CAVI_C,
      DiceType.CAVI_C,
      DiceType.CAVI_C
    ],
    targetScore: 6000,
    rewardDice: [DiceType.CAVI_C],
    rewardProbability: 0.6 // 60%概率获得
  },
  'heaven-knight': {
    id: 'heaven-knight',
    name: '天国骑士团（new）',
    description: '手上拿着来自天国的骰子',
    difficulty: 'medium',
    diceTypes: [
      DiceType.HEAVEN,
      DiceType.HEAVEN,
      DiceType.HEAVEN,
      DiceType.HEAVEN,
      DiceType.HEAVEN,
      DiceType.HEAVEN
    ],
    targetScore: 8000,
    rewardDice: [DiceType.HEAVEN],
    rewardProbability: 0.4 // 40%概率获得
  },
  'alonso': {
    id: 'alonso',
    name: '阿隆索大人',
    description: '传说中的阿隆索大人',
    difficulty: 'medium',
    diceTypes: [
      DiceType.ADULT,
      DiceType.ADULT,
      DiceType.ADULT,
      DiceType.ADULT,
      DiceType.ADULT,
      DiceType.ADULT
    ],
    targetScore: 8000,
    rewardDice: [DiceType.ADULT],
    rewardProbability: 0.1 // 10%概率获得
  },
  'cavier': {
    id: 'cavier',
    name: '卡维尔',
    description: '你不可能战胜他。',
    difficulty: 'medium',
    diceTypes: [
      DiceType.CAVIER_1,
      DiceType.CAVIER_1,
      DiceType.CAVIER_1,
      DiceType.CAVIER_1,
      DiceType.CAVIER_1,
      DiceType.CAVIER_1
    ],
    targetScore: 8000, // 中等难度目标分数
    rewardDice: [DiceType.CAVIER_1, DiceType.CAVIER_2, DiceType.CAVIER_3, DiceType.CAVIER_4, DiceType.CAVIER_5, DiceType.CAVIER_6], // 奖励骰子
    rewardProbability: 0.25 // 25%概率获得
  }
};

// 获取所有挑战者数据
export const getAllChallengers = (): Challenger[] => {
  return Object.values(CHALLENGER_CONFIGS).map(config => ({
    id: config.id,
    name: config.name,
    description: config.description,
    difficulty: config.difficulty,
    targetScore: config.targetScore // 添加目标分数到挑战者数据
  }));
};

// 获取挑战者骰子配置
export const getChallengerDiceConfig = (challengerId: string): DiceType[] => {
  const config = CHALLENGER_CONFIGS[challengerId];
  return config ? config.diceTypes : Array(6).fill(DiceType.NORMAL);
};

// 获取挑战者名称
export const getChallengerName = (challengerId: string): string => {
  const config = CHALLENGER_CONFIGS[challengerId];
  return config ? config.name : '未知挑战者';
};

// 获取挑战者难度
export const getChallengerDifficulty = (challengerId: string): 'easy' | 'medium' | 'hard' => {
  const config = CHALLENGER_CONFIGS[challengerId];
  return config ? config.difficulty : 'medium';
};

// 获取挑战者目标分数
export const getChallengerTargetScore = (challengerId: string): number => {
  const config = CHALLENGER_CONFIGS[challengerId];
  return config ? config.targetScore : 4000; // 默认目标分数为4000
};

// 获取挑战者奖励骰子
export const getChallengerRewardDice = (challengerId: string): DiceType[] => {
  const config = CHALLENGER_CONFIGS[challengerId];
  return config ? config.rewardDice : [];
};

// 获取挑战者奖励概率
export const getChallengerRewardProbability = (challengerId: string): number => {
  const config = CHALLENGER_CONFIGS[challengerId];
  return config ? config.rewardProbability : 0;
};

// 随机获取挑战者奖励骰子
export const getRandomChallengerRewardDice = (challengerId: string): DiceType | null => {
  const config = CHALLENGER_CONFIGS[challengerId];
  if (!config || !config.rewardDice.length) return null;
  
  // 根据概率决定是否获得奖励
  if (Math.random() > config.rewardProbability) return null;
  
  // 随机选择一个奖励骰子
  const randomIndex = Math.floor(Math.random() * config.rewardDice.length);
  return config.rewardDice[randomIndex];
}; 