// 游戏中使用的类型定义

// 骰子状态
export interface Die {
  id: number;
  value: number;
  selected: boolean;
  locked: boolean;
  type: DiceType;
}

// 玩家状态
export interface Player {
  name: string;
  score: number;
  turnScore: number;
  isComputer: boolean;
  groschen: number; // 格罗申余额
  ownedDice: DiceType[]; // 玩家拥有的骰子类型列表
}

// 游戏状态
export enum GamePhase {
  START = 'START',
  BETTING = 'BETTING', // 新增下注阶段
  ROLL = 'ROLL',
  SELECT = 'SELECT',
  END_TURN = 'END_TURN',
  GAME_OVER = 'GAME_OVER',
}

// 游戏设置
export interface GameSettings {
  targetScore: number;
  computerDifficulty: 'easy' | 'medium' | 'hard';
}

// 骰子类型
export enum DiceType {
  NORMAL = 'NORMAL',
  LUCKY = 'LUCKY',
  CURSED = 'CURSED',
  BALANCED = 'BALANCED',
  EXTREME = 'EXTREME',
  KAVIEL_1 = 'KAVIEL_1',
  KAVIEL_2 = 'KAVIEL_2',
  KAVIEL_3 = 'KAVIEL_3',
  KAVIEL_4 = 'KAVIEL_4',
  KAVIEL_5 = 'KAVIEL_5',
  KAVIEL_6 = 'KAVIEL_6'
}

// 骰子配置
export interface DiceConfig {
  type: DiceType;
  name: string;
  description: string;
  backgroundColor: string;
  textColor: string;
  probabilities: {
    [key: number]: number;  // 键是点数(1-6)，值是概率
  };
}

// 玩家的骰子配置
export interface PlayerDiceConfig {
  diceConfigs: DiceType[]; // 长度为6的数组，表示每个骰子的类型
}

// 游戏状态
export interface GameState {
  dice: Die[];
  players: Player[];
  currentPlayerIndex: number;
  phase: GamePhase;
  rollCount: number;
  settings: GameSettings;
  winner: Player | null;
  bet: number; // 当前下注金额
  diceConfigs: PlayerDiceConfig;
  isFarkle: boolean; // 标记是否因为farkle而进入END_TURN阶段
}

// 骰子定义
export const DICE_CONFIGS: { [key in DiceType]: DiceConfig } = {
  [DiceType.NORMAL]: {
    type: DiceType.NORMAL,
    name: '普通骰子',
    description: '标准的六面骰子，每个点数概率相等',
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
  [DiceType.LUCKY]: {
    type: DiceType.LUCKY,
    name: '幸运骰子',
    description: '更容易掷出高点数',
    backgroundColor: '#ffd700',
    textColor: '#000000',
    probabilities: {
      1: 0.1,
      2: 0.1,
      3: 0.15,
      4: 0.2,
      5: 0.2,
      6: 0.25
    }
  },
  [DiceType.CURSED]: {
    type: DiceType.CURSED,
    name: '诅咒骰子',
    description: '更容易掷出低点数',
    backgroundColor: '#800080',
    textColor: '#ffffff',
    probabilities: {
      1: 0.25,
      2: 0.2,
      3: 0.2,
      4: 0.15,
      5: 0.1,
      6: 0.1
    }
  },
  [DiceType.BALANCED]: {
    type: DiceType.BALANCED,
    name: '平衡骰子',
    description: '中间点数概率更高',
    backgroundColor: '#87ceeb',
    textColor: '#000000',
    probabilities: {
      1: 0.1,
      2: 0.15,
      3: 0.25,
      4: 0.25,
      5: 0.15,
      6: 0.1
    }
  },
  [DiceType.EXTREME]: {
    type: DiceType.EXTREME,
    name: '极端骰子',
    description: '只会掷出1或6',
    backgroundColor: '#ff4500',
    textColor: '#ffffff',
    probabilities: {
      1: 0.5,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0.5
    }
  },
  [DiceType.KAVIEL_1]: {
    type: DiceType.KAVIEL_1,
    name: '卡维尔的测试骰子1',
    description: '这个骰子……好像有点bug',
    backgroundColor: '#e74c3c',
    textColor: '#ffffff',
    probabilities: {
      1: 1,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0
    }
  },
  [DiceType.KAVIEL_2]: {
    type: DiceType.KAVIEL_2,
    name: '卡维尔的测试骰子2',
    description: '这个骰子……好像有点bug',
    backgroundColor: '#e67e22',
    textColor: '#ffffff',
    probabilities: {
      1: 0,
      2: 1,
      3: 0,
      4: 0,
      5: 0,
      6: 0
    }
  },
  [DiceType.KAVIEL_3]: {
    type: DiceType.KAVIEL_3,
    name: '卡维尔的测试骰子3',
    description: '这个骰子……好像有点bug',
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
  [DiceType.KAVIEL_4]: {
    type: DiceType.KAVIEL_4,
    name: '卡维尔的测试骰子4',
    description: '这个骰子……好像有点bug',
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
  [DiceType.KAVIEL_5]: {
    type: DiceType.KAVIEL_5,
    name: '卡维尔的测试骰子5',
    description: '这个骰子……好像有点bug',
    backgroundColor: '#3498db',
    textColor: '#ffffff',
    probabilities: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 1,
      6: 0
    }
  },
  [DiceType.KAVIEL_6]: {
    type: DiceType.KAVIEL_6,
    name: '卡维尔的测试骰子6',
    description: '这个骰子……好像有点bug',
    backgroundColor: '#9b59b6',
    textColor: '#ffffff',
    probabilities: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 1
    }
  }
};

// 骰子价格
export const DICE_PRICES: { [key in DiceType]: number } = {
  [DiceType.NORMAL]: 0, // 普通骰子免费
  [DiceType.LUCKY]: 50,
  [DiceType.CURSED]: 40,
  [DiceType.BALANCED]: 30,
  [DiceType.EXTREME]: 60,
  [DiceType.KAVIEL_1]: 20,
  [DiceType.KAVIEL_2]: 20,
  [DiceType.KAVIEL_3]: 20,
  [DiceType.KAVIEL_4]: 20,
  [DiceType.KAVIEL_5]: 20,
  [DiceType.KAVIEL_6]: 20
}; 