import { Die } from '../types';
import { DiceType } from '../models/DiceModel';
import { calculateSelectionScore, hasValidSelection } from '../utils';

/**
 * 检查所有未锁定的骰子是否都是有效组合
 * @param dice 当前骰子状态
 * @returns 是否所有未锁定的骰子都是有效组合
 */
const checkAllUnlockedDiceValid = (dice: Die[]) => {
  const unlockedDice = dice.filter(die => !die.locked);
  
  // 选择所有未锁定的骰子
  const testAllDice = dice.map(die => ({ ...die }));
  unlockedDice.forEach(die => {
    const dieIndex = testAllDice.findIndex(d => d.id === die.id);
    testAllDice[dieIndex].selected = true;
  });
  
  // 计算所有未锁定骰子的分数
  const allUnlockedScore = calculateSelectionScore(testAllDice);
  
  // 如果所有未锁定骰子都是有效组合，返回true
  return allUnlockedScore > 0;
};

/**
 * 检查是否有顺子+额外骰子的组合
 * @param unlockedDice 未锁定的骰子
 * @returns 是否有顺子+额外骰子
 */
const hasStraightWithExtra = (unlockedDice: Die[]) => {
  // 检查是否有小顺子或大顺子
  const hasStraight = unlockedDice.length >= 5 && (
    // 检查小顺子 (1-2-3-4-5)
    [1, 2, 3, 4, 5].every(num => unlockedDice.some(die => die.value === num)) ||
    // 检查大顺子 (2-3-4-5-6)
    [2, 3, 4, 5, 6].every(num => unlockedDice.some(die => die.value === num))
  );
  
  // 如果有顺子，检查是否有额外的1或5
  if (hasStraight && unlockedDice.length > 5) {
    const extraDice = unlockedDice.filter(die => 
      (die.value === 1 && !unlockedDice.filter(d => d.value === 1).slice(0, 1).includes(die)) ||
      (die.value === 5 && !unlockedDice.filter(d => d.value === 5).slice(0, 1).includes(die))
    );
    return extraDice.length > 0;
  }
  
  return false;
};

/**
 * 检查是否有四连或更多连续相同的骰子
 * @param unlockedDice 未锁定的骰子
 * @returns 是否有四连或更多
 */
const hasFourOfAKind = (unlockedDice: Die[]) => {
  const counts = new Map<number, number>();
  unlockedDice.forEach(die => {
    counts.set(die.value, (counts.get(die.value) || 0) + 1);
  });
  
  return Array.from(counts.values()).some(count => count >= 4);
};

/**
 * 查找单个1或5的骰子索引
 * @param dice 所有骰子
 * @param unlockedDice 未锁定的骰子
 * @returns 单个1或5的骰子索引数组
 */
const findSingleOneOrFiveIndices = (dice: Die[], unlockedDice: Die[]): number[] => {
  // 找出所有1和5的骰子
  const onesAndFives = unlockedDice.filter(die => die.value === 1 || die.value === 5);
  
  // 如果没有1或5，返回空数组
  if (onesAndFives.length === 0) {
    return [];
  }
  
  // 优先选择1（价值100分），其次选择5（价值50分）
  const targetDie = onesAndFives.find(die => die.value === 1) || onesAndFives[0];
  
  // 返回这个骰子在原始数组中的索引
  return [dice.findIndex(die => die.id === targetDie.id)];
};

/**
 * 查找四连或更多以及1和5的组合
 * @param dice 所有骰子
 * @param unlockedDice 未锁定的骰子
 * @returns 包含四连和1或5的骰子索引数组，如果没有这样的组合则返回null
 */
const findFourOfAKindWithOneOrFive = (dice: Die[], unlockedDice: Die[]): number[] | null => {
  // 统计每个点数的出现次数
  const valueCounts = new Map<number, number>();
  unlockedDice.forEach(die => {
    valueCounts.set(die.value, (valueCounts.get(die.value) || 0) + 1);
  });
  
  // 找到出现4次或更多的点数
  let fourOfAKindValue = 0;
  let fourOfAKindCount = 0;
  
  valueCounts.forEach((count, value) => {
    if (count >= 4 && (count > fourOfAKindCount || (count === fourOfAKindCount && value > fourOfAKindValue))) {
      fourOfAKindValue = value;
      fourOfAKindCount = count;
    }
  });
  
  // 如果没有四连，返回null
  if (fourOfAKindCount < 4) {
    return null;
  }
  
  // 检查是否有1或5（且不是四连的点数）
  const hasOne = fourOfAKindValue !== 1 && valueCounts.has(1) && (valueCounts.get(1) ?? 0) > 0;
  const hasFive = fourOfAKindValue !== 5 && valueCounts.has(5) && (valueCounts.get(5) ?? 0) > 0;
  
  // 如果没有1或5，返回null
  if (!hasOne && !hasFive) {
    return null;
  }
  
  // 选择所有四连的骰子和1或5
  const selectedIndices: number[] = [];
  
  // 先添加所有四连的骰子
  unlockedDice.forEach((die, index) => {
    if (die.value === fourOfAKindValue) {
      const dieIndex = dice.findIndex(d => d.id === die.id);
      if (dieIndex !== -1) {
        selectedIndices.push(dieIndex);
      }
    }
  });
  
  // 然后添加1或5（优先添加1）
  if (hasOne) {
    // 找到第一个值为1的骰子
    const oneIndex = unlockedDice.findIndex(die => die.value === 1);
    if (oneIndex !== -1) {
      const dieIndex = dice.findIndex(d => d.id === unlockedDice[oneIndex].id);
      if (dieIndex !== -1) {
        selectedIndices.push(dieIndex);
      }
    }
  } else if (hasFive) {
    // 找到第一个值为5的骰子
    const fiveIndex = unlockedDice.findIndex(die => die.value === 5);
    if (fiveIndex !== -1) {
      const dieIndex = dice.findIndex(d => d.id === unlockedDice[fiveIndex].id);
      if (dieIndex !== -1) {
        selectedIndices.push(dieIndex);
      }
    }
  }
  
  return selectedIndices.length > 0 ? selectedIndices : null;
};

/**
 * 电脑决策逻辑
 * @param dice 当前骰子状态
 * @param turnScore 当前回合分数
 * @param totalScore 总分
 * @param targetScore 目标分数
 * @param difficulty 难度
 * @returns 决策结果，包含是否继续掷骰子和选择的骰子索引
 */
export const computerDecision = (
  dice: Die[],
  turnScore: number,
  totalScore: number,
  targetScore: number,
  difficulty: 'easy' | 'medium' | 'hard'
): { shouldRoll: boolean; selectedDiceIndices: number[] } => {
  const unlockedDice = dice.filter(die => !die.locked);
  const bestSelections: { indices: number[]; score: number; diceCount: number }[] = [];
  
  // 检查所有可能的选择组合
  for (let i = 1; i < (1 << unlockedDice.length); i++) {
    const testAllDice = dice.map(die => ({ ...die }));
    const selectedIndices: number[] = [];
    
    // 构建测试选择
    unlockedDice.forEach((die, index) => {
      if (i & (1 << index)) {
        const dieIndex = dice.findIndex(d => d.id === die.id);
        testAllDice[dieIndex].selected = true;
        selectedIndices.push(dieIndex);
      }
    });
    
    const score = calculateSelectionScore(testAllDice);
    if (score > 0) {
      bestSelections.push({ 
        indices: selectedIndices, 
        score: score,
        diceCount: selectedIndices.length 
      });
    }
  }
  
  // 如果没有可选的组合，返回空
  if (bestSelections.length === 0) {
    return { shouldRoll: false, selectedDiceIndices: [] };
  }
  
  // 优化选择策略：优先选择能锁定更多骰子的组合
  bestSelections.sort((a, b) => {
    // 首先按照锁定骰子数量排序（降序）
    if (b.diceCount !== a.diceCount) {
      return b.diceCount - a.diceCount;
    }
    // 其次按照分数排序（降序）
    return b.score - a.score;
  });
  
  const bestSelection = bestSelections[0];
  
  // 新增：检查锁定选中的骰子后是否能达到目标分数
  // 如果当前总分 + 当前回合分数 + 选中骰子的分数 >= 目标分数，则直接结束回合
  if (totalScore + turnScore + bestSelection.score >= targetScore) {
    console.log('电脑检测到可以获胜，选择结束回合');
    return { shouldRoll: false, selectedDiceIndices: bestSelection.indices };
  }
  
  // 如果所有未锁定的骰子都是有效组合，一定要选择锁定并重掷
  if (checkAllUnlockedDiceValid(dice)) {
    const allIndices = unlockedDice.map(die => dice.findIndex(d => d.id === die.id));
    return { shouldRoll: true, selectedDiceIndices: allIndices };
  }
  
  // 如果有顺子+额外骰子，选择所有未锁定的骰子
  if (hasStraightWithExtra(unlockedDice) || unlockedDice.length === 6) {
    // 检查选择所有骰子是否有效
    const testAllDice = dice.map(die => ({ ...die }));
    unlockedDice.forEach(die => {
      const dieIndex = testAllDice.findIndex(d => d.id === die.id);
      testAllDice[dieIndex].selected = true;
    });
    
    const allDiceScore = calculateSelectionScore(testAllDice);
    if (allDiceScore > 0) {
      const allIndices = unlockedDice.map(die => dice.findIndex(d => d.id === die.id));
      return { shouldRoll: true, selectedDiceIndices: allIndices };
    }
  }
  
  // 根据难度设置基础风险阈值
  const baseRiskThresholds = {
    easy: 0.3,    // 提高基础风险阈值，增加重掷概率
    medium: 0.45,  // 提高中等难度的风险阈值
    hard: 0.5     // 提高困难难度的风险阈值
  };
  
  // 计算当前回合总分
  const potentialScore = turnScore + bestSelection.score;
  
  // 决策是否继续掷骰子
  const shouldRoll = () => {
    // 如果可以直接获胜，就结束回合
    if (totalScore + potentialScore >= targetScore) {
      return false;
    }

    // 计算玩家分数差距（假设玩家是对手）
    const opponentScore = targetScore - (totalScore + potentialScore);
    const isOpponentClose = opponentScore <= 1000; // 对手接近胜利
    
    // 计算动态风险系数
    let riskThreshold = baseRiskThresholds[difficulty];
    const unlockedCount = dice.filter(die => !die.locked).length;
    
    // 检查是否所有骰子都被锁定
    const allLocked = unlockedCount === 0;
    
    // 如果所有骰子都被锁定，强制重掷
    if (allLocked) {
      return true;
    }
    
    // 1. 根据剩余骰子数量调整风险 - 增强重掷偏好
    if (unlockedCount >= 4) {
      // 当未锁定骰子大于4个时，大幅增加重掷概率
      riskThreshold += 0.25; // 原来是0.1，现在增加到0.25
      
      // 对于困难模式，当未锁定骰子大于4个时，额外增加重掷概率
      if (difficulty === 'hard' && unlockedCount >= 5) {
        riskThreshold += 0.15;
      }
    } else if (unlockedCount === 3) {
      riskThreshold += 0.05; // 轻微增加重掷概率
    } else if (unlockedCount <= 2) {
      // 优化1：当未锁定骰子小于等于2个时，大幅降低重掷倾向
      riskThreshold -= 0.45; // 原来是-0.3，现在增加到-0.45
      
      // 根据难度进一步调整
      if (difficulty === 'easy') {
        riskThreshold -= 0.1; // 简单模式更保守
      } else if (difficulty === 'hard' && potentialScore < 300) {
        riskThreshold -= 0.05; // 困难模式在低分时稍微保守一点
      }
    }
    
    // 2. 根据当前回合分数调整风险
    if (potentialScore >= 750) {
      riskThreshold -= 0.35; // 更保守地保护高分，但比原来的0.4更温和
    } else if (potentialScore >= 500) {
      riskThreshold -= 0.25; // 中高分也倾向于保守，但比原来的0.3更温和
    } else if (potentialScore <= 200) {
      riskThreshold += 0.15; // 低分时更激进一点，原来是0.1
    }
    
    // 3. 根据对手情况调整风险
    if (isOpponentClose) {
      // 对手接近胜利时的策略调整
      if (unlockedCount <= 2) {
        // 剩余骰子少且对手接近胜利时，根据当前分数决定策略
        if (potentialScore >= 400) {
          riskThreshold -= 0.3; // 有较高分数时更倾向于锁定，比原来的0.25更保守
        } else {
          riskThreshold += 0.2; // 分数不高时激进，但比原来的0.25更保守
        }
      } else {
        riskThreshold += 0.25; // 对手接近胜利且有足够骰子时更激进，原来是0.2
      }
    }
    
    // 4. 根据当前选择的分值调整风险
    if (bestSelection.score >= 500) {
      // 高分组合时的特殊处理
      if (unlockedCount >= 4) {
        return Math.random() > 0.7; // 30%概率继续掷骰子
      }
      return Math.random() > 0.85; // 否则15%概率继续掷骰子，比原来的20%更保守
    }
    
    // 5. 特殊情况处理
    if (isOpponentClose && potentialScore < 400 && unlockedCount > 2) {
      return Math.random() > 0.25; // 75%概率继续尝试，原来是70%
    }
    
    // 6. 根据难度调整最终决策
    const finalThreshold = Math.min(0.85, Math.max(0.15, riskThreshold)); // 扩大阈值范围
    const riskFactor = Math.random();
    
    // 7. 如果是困难模式，增加连续掷骰子的倾向，但在剩余骰子少时更保守
    if (difficulty === 'hard') {
      if (unlockedCount <= 2) {
        return riskFactor < finalThreshold * 0.5; // 剩余骰子少时更保守，比原来的0.7更保守
      } else if (potentialScore >= 500) {
        return riskFactor < 0.2; // 高分时保守，比原来的0.3更保守
      } else if (riskFactor < 0.3) { // 原来是0.2
        return true; // 保持更高的激进性
      }
    }
    
    return riskFactor < finalThreshold;
  };
  
  // 新增策略：检查是否有四连+1或5的组合
  const fourOfAKindWithOneOrFive = findFourOfAKindWithOneOrFive(dice, unlockedDice);
  if (fourOfAKindWithOneOrFive) {
    // 使用现有的shouldRoll逻辑决定是否重掷
    return { shouldRoll: shouldRoll(), selectedDiceIndices: fourOfAKindWithOneOrFive };
  }
  
  // 新增策略：当骰子数量≥5且没有高分组合时，考虑只取走单个1或5
  if (unlockedDice.length >= 5 && bestSelection.score < 300) {
    // 检查是否有1或5
    const hasOneOrFive = unlockedDice.some(die => die.value === 1 || die.value === 5);
    
    if (hasOneOrFive) {
      // 根据难度决定是否采用这个策略
      const useThisStrategy = Math.random() < (
        difficulty === 'easy' ? 0.5 :
        difficulty === 'medium' ? 0.7 :
        0.95 // 困难模式
      );
      
      if (useThisStrategy) {
        const singleOneOrFiveIndices = findSingleOneOrFiveIndices(dice, unlockedDice);
        if (singleOneOrFiveIndices.length > 0) {
          return { shouldRoll: true, selectedDiceIndices: singleOneOrFiveIndices };
        }
      }
    }
  }
  
  // 如果有四连或更多，优先选择它们
  if (hasFourOfAKind(unlockedDice)) {
    const valueCounts = new Map<number, number>();
    unlockedDice.forEach(die => {
      valueCounts.set(die.value, (valueCounts.get(die.value) || 0) + 1);
    });
    
    // 找到数量最多的点数
    let maxValue = 0;
    let maxCount = 0;
    valueCounts.forEach((count, value) => {
      if (count >= 4 && (count > maxCount || (count === maxCount && value > maxValue))) {
        maxValue = value;
        maxCount = count;
      }
    });
    
    // 检查是否有1或5（且不是四连的点数）
    const hasOne = maxValue !== 1 && valueCounts.has(1) && (valueCounts.get(1) ?? 0) > 0;
    const hasFive = maxValue !== 5 && valueCounts.has(5) && (valueCounts.get(5) ?? 0) > 0;
    
    // 如果有1或5，选择四连加1或5
    if (hasOne || hasFive) {
      const selectedIndices: number[] = [];
      
      // 先添加所有四连的骰子
      unlockedDice.forEach(die => {
        if (die.value === maxValue) {
          selectedIndices.push(dice.findIndex(d => d.id === die.id));
        }
      });
      
      // 然后添加1或5（优先添加1）
      if (hasOne) {
        const oneIndex = unlockedDice.findIndex(die => die.value === 1);
        if (oneIndex !== -1) {
          selectedIndices.push(dice.findIndex(d => d.id === unlockedDice[oneIndex].id));
        }
      } else if (hasFive) {
        const fiveIndex = unlockedDice.findIndex(die => die.value === 5);
        if (fiveIndex !== -1) {
          selectedIndices.push(dice.findIndex(d => d.id === unlockedDice[fiveIndex].id));
        }
      }
      
      return { shouldRoll: shouldRoll(), selectedDiceIndices: selectedIndices };
    }
    
    // 如果没有1或5，只选择四连
    const fourOfAKindIndices = unlockedDice
      .filter(die => die.value === maxValue)
      .map(die => dice.findIndex(d => d.id === die.id));
    
    return { shouldRoll: shouldRoll(), selectedDiceIndices: fourOfAKindIndices };
  }
  
  return { shouldRoll: shouldRoll(), selectedDiceIndices: bestSelection.indices };
}; 