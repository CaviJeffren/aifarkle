// 游戏中使用的类型定义
import { DiceType, DiceData, DICE_DATA, getDicePrice, getDiceSellPrice } from './models/DiceModel';

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

// 导出骰子类型和相关函数，方便其他文件使用
export { getDicePrice, getDiceSellPrice }; 