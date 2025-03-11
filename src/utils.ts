import { Die, DiceType } from './types';

// 生成1-6之间的随机数
export const rollDie = (): number => {
  return Math.floor(Math.random() * 6) + 1;
};

// 初始化骰子
export const initializeDice = (count: number = 6): Die[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    value: rollDie(),
    selected: false,
    locked: false,
    type: DiceType.NORMAL // 默认使用普通骰子
  }));
};

// 重新掷未锁定的骰子
export const rerollSelectedDice = (dice: Die[]): Die[] => {
  return dice.map(die => {
    if (!die.locked) {
      return { ...die, value: rollDie(), selected: false };
    }
    return die;
  });
};

// 检查是否为顺子
export const checkStraight = (dice: Die[]): number => {
  const values = dice
    .filter(die => die.selected && !die.locked)
    .map(die => die.value)
    .sort((a, b) => a - b);

  // 检查全顺 123456
  if (values.length === 6 && JSON.stringify(values) === JSON.stringify([1, 2, 3, 4, 5, 6])) {
    return 1500;
  }

  if (values.length !== 5) return 0;

  // 检查12345
  if (JSON.stringify(values) === JSON.stringify([1, 2, 3, 4, 5])) {
    return 500;
  }
  // 检查23456
  if (JSON.stringify(values) === JSON.stringify([2, 3, 4, 5, 6])) {
    return 750;
  }

  return 0;
};

// 检查是否有可选的组合
export const hasValidSelection = (dice: Die[]): boolean => {
  const selectedDice = dice.filter(die => die.selected && !die.locked);
  
  // 如果没有选中的骰子，返回 false
  if (selectedDice.length === 0) return false;

  // 检查是否所有选中的骰子都能构成有效组合
  let validDiceCount = 0;

  // 检查全顺 123456
  const values = selectedDice.map(die => die.value).sort((a, b) => a - b);
  if (values.length === 6 && JSON.stringify(values) === JSON.stringify([1, 2, 3, 4, 5, 6])) {
    return true;
  }

  // 检查标准顺子 12345 或 23456
  if (values.length >= 5) {
    // 检查是否包含12345
    const has12345 = [1, 2, 3, 4, 5].every(v => values.includes(v));
    if (has12345) {
      // 检查剩余的骰子是否都是1或5
      const remainingValues = values.filter(v => {
        // 不是顺子12345中的数字，或者是顺子中的数字但出现了多次
        return (v !== 1 && v !== 2 && v !== 3 && v !== 4 && v !== 5) || 
               (v === 1 && values.filter(x => x === 1).length > 1) || 
               (v === 2 && values.filter(x => x === 2).length > 1) || 
               (v === 3 && values.filter(x => x === 3).length > 1) || 
               (v === 4 && values.filter(x => x === 4).length > 1) || 
               (v === 5 && values.filter(x => x === 5).length > 1);
      });
      
      // 剩余的骰子必须都是1或5才有效
      const allRemainingValid = remainingValues.every(v => v === 1 || v === 5);
      
      if (allRemainingValid) {
        return true;
      }
    }

    // 检查是否包含23456
    const has23456 = [2, 3, 4, 5, 6].every(v => values.includes(v));
    if (has23456) {
      // 检查剩余的骰子是否都是1或5
      const remainingValues = values.filter(v => {
        // 不是顺子23456中的数字，或者是顺子中的数字但出现了多次
        return (v !== 2 && v !== 3 && v !== 4 && v !== 5 && v !== 6) || 
               (v === 2 && values.filter(x => x === 2).length > 1) || 
               (v === 3 && values.filter(x => x === 3).length > 1) || 
               (v === 4 && values.filter(x => x === 4).length > 1) || 
               (v === 5 && values.filter(x => x === 5).length > 1) || 
               (v === 6 && values.filter(x => x === 6).length > 1);
      });
      
      // 剩余的骰子必须都是1或5才有效
      const allRemainingValid = remainingValues.every(v => v === 1 || v === 5);
      
      if (allRemainingValid) {
        return true;
      }
    }
  }

  // 统计每个点数的数量
  const counts = new Map<number, number>();
  selectedDice.forEach(die => {
    counts.set(die.value, (counts.get(die.value) || 0) + 1);
  });

  // 检查三个或以上相同的数字
  Array.from(counts.entries()).forEach(([value, count]) => {
    if (count >= 3) {
      // 所有连子都是有效的，无论是3个、4个、5个还是6个
      validDiceCount += count;
    } else {
      // 检查1和5
      if (value === 1 || value === 5) {
        validDiceCount += count;
      }
    }
  });

  // 所有选中的骰子都必须是有效组合的一部分
  return validDiceCount === selectedDice.length;
};

// 计算选中骰子的分数
export const calculateSelectionScore = (dice: Die[]): number => {
  const selectedDice = dice.filter(die => die.selected && !die.locked);
  
  // 如果选择无效，返回0分
  if (!hasValidSelection(dice)) {
    return 0;
  }

  // 检查全顺 123456
  const values = selectedDice.map(die => die.value).sort((a, b) => a - b);
  if (values.length === 6 && JSON.stringify(values) === JSON.stringify([1, 2, 3, 4, 5, 6])) {
    return 1500;
  }

  // 检查标准顺子 12345 或 23456
  if (values.length >= 5) {
    // 检查是否包含12345
    const has12345 = [1, 2, 3, 4, 5].every(v => values.includes(v));
    if (has12345) {
      // 计算剩余的1和5的分数
      let remainingScore = 0;
      // 统计每个点数的出现次数
      const counts: Record<number, number> = {};
      values.forEach(v => {
        counts[v] = (counts[v] || 0) + 1;
      });
      
      // 对于1和5，只有超过1次的才计入剩余分数
      if (counts[1] > 1) remainingScore += (counts[1] - 1) * 100;
      if (counts[5] > 1) remainingScore += (counts[5] - 1) * 50;
      
      return 500 + remainingScore;
    }

    // 检查是否包含23456
    const has23456 = [2, 3, 4, 5, 6].every(v => values.includes(v));
    if (has23456) {
      // 计算剩余的1和5的分数
      let remainingScore = 0;
      // 统计每个点数的出现次数
      const counts: Record<number, number> = {};
      values.forEach(v => {
        counts[v] = (counts[v] || 0) + 1;
      });
      
      // 对于1和5，计入剩余分数
      if (counts[1]) remainingScore += counts[1] * 100;
      if (counts[5] > 1) remainingScore += (counts[5] - 1) * 50;
      
      return 750 + remainingScore;
    }
  }

  // 统计每个点数的数量
  const counts = new Map<number, number>();
  selectedDice.forEach(die => {
    const count = (counts.get(die.value) || 0) + 1;
    counts.set(die.value, count);
  });

  let score = 0;
  
  // 处理连子得分
  Array.from(counts.entries()).forEach(([value, count]) => {
    // 处理三个或更多相同点数的情况
    if (count >= 3) {
      // 计算基础分数
      let baseScore = 0;
      if (value === 1) {
        // 1的基础分是1000分（三个1）
        baseScore = 1000;
      } else {
        // 其他数字的基础分是数字值 * 100（三个相同）
        baseScore = value * 100;
      }
      
      // 计算倍数：每多一个相同点数，分数翻倍
      // 3个相同 = 1倍基础分，4个相同 = 2倍基础分，5个相同 = 4倍基础分，6个相同 = 8倍基础分
      const multiplier = Math.pow(2, count - 3);
      score += baseScore * multiplier;
    } 
    // 处理剩余的1和5（如果有的话）
    else if (value === 1) {
      score += count * 100;
    } else if (value === 5) {
      score += count * 50;
    }
  });

  return score;
};

// 检查是否为Farkle（没有可选择的组合）
export const isFarkle = (dice: Die[]): boolean => {
  const unlockedDice = dice.filter(die => !die.locked);
  
  // 如果没有未锁定的骰子，不是 Farkle
  if (unlockedDice.length === 0) return false;
  
  // 如果只剩一个骰子，只要是1或5就不是 Farkle
  if (unlockedDice.length === 1) {
    return !(unlockedDice[0].value === 1 || unlockedDice[0].value === 5);
  }
  
  // 检查是否有1或5
  if (unlockedDice.some(die => die.value === 1 || die.value === 5)) {
    return false;
  }
  
  // 统计每个点数的数量
  const valueCounts: Record<number, number> = {};
  unlockedDice.forEach(die => {
    valueCounts[die.value] = (valueCounts[die.value] || 0) + 1;
  });
  
  // 检查是否有三个或更多相同的数字
  if (Object.values(valueCounts).some(count => count >= 3)) {
    return false;
  }
  
  // 检查是否有全顺（1-6）
  if (unlockedDice.length === 6) {
    const values = unlockedDice.map(die => die.value).sort((a, b) => a - b);
    if (JSON.stringify(values) === JSON.stringify([1, 2, 3, 4, 5, 6])) {
      return false;
    }
  }
  
  // 检查连续的数字
  const values = new Set(unlockedDice.map(die => die.value));
  if (values.size >= 3) { // 至少需要3个不同的数字才能形成连续
    for (let i = 1; i <= 4; i++) { // 1-6范围内，连续3个数字的起始点最大为4
      // 检查从i开始的连续3个数字
      if (values.has(i) && values.has(i + 1) && values.has(i + 2)) {
        return false;
      }
    }
  }
  
  return true;
};

// 电脑决策逻辑已移至 src/ai/computerAI.ts 