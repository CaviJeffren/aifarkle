import { DiceType } from './DiceModel';

export interface DiceSet {
  id: string;
  name: string;
  description: string;
  dices: DiceType[];
  isHidden?: boolean; // 是否隐藏，默认为false（不隐藏）
}

export const DICE_SETS: DiceSet[] = [
  {
    id: 'cavier-set',
    name: '卡维尔的测试骰子',
    description: '如果你能收集完成……那么你已经无敌了',
    dices: [
      DiceType.CAVIER_1,
      DiceType.CAVIER_2,
      DiceType.CAVIER_3,
      DiceType.CAVIER_4,
      DiceType.CAVIER_5,
      DiceType.CAVIER_6
    ],
    isHidden: true // 明确标记为不隐藏
  },
  {
    id: 'odd-set',
    name: '奇数套',
    description: '收集所有奇数骰子',
    dices: [
      DiceType.ODD,
      DiceType.ODD,
      DiceType.ODD,
      DiceType.ODD,
      DiceType.ODD,
      DiceType.ODD
    ],
    isHidden: false
  },
  {
    id: 'even-set',
    name: '偶数套',
    description: '收集所有偶数骰子',
    dices: [
      DiceType.EVEN,
      DiceType.EVEN,
      DiceType.EVEN,
      DiceType.EVEN,
      DiceType.EVEN,
      DiceType.EVEN
    ],
    isHidden: false // 明确标记为不隐藏
  },
  {
    id: 'mini-set',
    name: '迷你组合',
    description: '舞场老板喜欢使用的骰子组合',
    dices: [
      DiceType.MINI,
      DiceType.MINI,
      DiceType.MINI,
    ],
    isHidden: false
  },
  {
    id: 'clothed-set',
    name: '穿衣套',
    description: '舞场老板喜欢使用的骰子组合',
    dices: [
      DiceType.CLOTHED,
      DiceType.CLOTHED,
      DiceType.CLOTHED,
      DiceType.CLOTHED,
      DiceType.CLOTHED,
      DiceType.CLOTHED
    ],
    isHidden: false
  },
  {
    id: 'rigged-set',
    name: '老千',
    description: '这些骰子似乎都被动过手脚...',
    dices: [
      DiceType.RIGGED,
      DiceType.RIGGED,
      DiceType.RIGGED,
      DiceType.RIGGED,
      DiceType.RIGGED,
      DiceType.RIGGED
    ],
    isHidden: false
  },
  {
    id: 'lucky-set',
    name: '幸运套',
    description: '收集所有带有幸运属性的骰子',
    dices: [
      DiceType.SMALL_LUCKY,
      DiceType.SMALL_LUCKY,
      DiceType.SMALL_LUCKY,
      DiceType.LUCKY,
      DiceType.LUCKY,
      DiceType.LUCKY,
    ],
    isHidden: true // 设置为隐藏
  },
  {
    id: 'gambler-set',
    name: '天使与恶魔',
    description: '所谓赌狗，一念成魔，一念成佛',
    dices: [
      DiceType.ANGEL_AN,
      DiceType.ANGEL_JI,
      DiceType.ANGEL_LA,
      DiceType.DEMON_LU,
      DiceType.DEMON_XI,
      DiceType.DEMON_FA
    ],
    isHidden: false
  },
  {
    id: 'triple-three-set',
    name: '3！3！3！',
    description: '3是最完美的数字',
    dices: [
      DiceType.ANTIOCH,
      DiceType.ANTIOCH,
      DiceType.ANTIOCH,
      DiceType.TRIPLE_THREE,
      DiceType.TRIPLE_THREE,
      DiceType.TRIPLE_THREE
    ],
    isHidden: false
  },
  {
    id: 'loaded-set',
    name: '灌铅骰子',
    description: '高级的出千手段',
    dices: [
      DiceType.LOADED,
    ],
    isHidden: true
  },
  {
    id: 'heaven-knight-set',
    name: '天国的骑士',
    description: '代表着天国的荣誉',
    dices: [
      DiceType.HEAVEN,
      DiceType.KNIGHT,
      DiceType.KNIGHT,
      DiceType.KNIGHT,
      DiceType.KNIGHT,
      DiceType.KNIGHT
    ],
    isHidden: true
  },
  {
    id: 'adult-set',
    name: '大人',
    description: '阿隆索大人专用的骰子组合',
    dices: [
      DiceType.ADULT,
      DiceType.ADULT,
      DiceType.ADULT,
      DiceType.ADULT,
      DiceType.ADULT,
      DiceType.ADULT
    ],
    isHidden: true
  },
  {
    id: 'low-set',
    name: '鸡肋',
    description: '食之无味，弃之可惜',
    dices: [
      DiceType.UNLUCKY,
      DiceType.CAVI_C,
      DiceType.UNPOPULAR,
    ],
    isHidden: true
  }
]; 