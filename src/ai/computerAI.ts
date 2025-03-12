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
  
  // 根据难度设置基础风险阈值
  const baseRiskThresholds = {
    easy: 0.2,    // 降低基础风险阈值
    medium: 0.35,
    hard: 0.5
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
    
    // 如果锁定了5个或6个骰子，强制重掷
    if (bestSelection.diceCount >= 5) {
      return true;
    }
    
    // 1. 根据剩余骰子数量调整风险
    if (unlockedCount >= 4) {
      riskThreshold += 0.1; // 降低继续掷骰子的倾向
    } else if (unlockedCount <= 2) {
      riskThreshold -= 0.4; // 更倾向于锁定分数
    }
    
    // 2. 根据当前回合分数调整风险
    if (potentialScore >= 750) {
      riskThreshold -= 0.4; // 更保守地保护高分
    } else if (potentialScore >= 500) {
      riskThreshold -= 0.3; // 中高分也倾向于保守
    } else if (potentialScore <= 200) {
      riskThreshold += 0.1; // 低分时稍微激进一点
    }
    
    // 3. 根据对手情况调整风险
    if (isOpponentClose) {
      // 对手接近胜利时的策略调整
      if (unlockedCount <= 2) {
        // 剩余骰子少且对手接近胜利时，根据当前分数决定策略
        if (potentialScore >= 400) {
          riskThreshold -= 0.3; // 有较高分数时更倾向于锁定
        } else {
          riskThreshold += 0.2; // 分数不高时适度冒险
        }
      } else {
        riskThreshold += 0.2; // 对手接近胜利且有足够骰子时适度激进
      }
    }
    
    // 4. 根据当前选择的分值调整风险
    if (bestSelection.score >= 500) {
      // 高分组合时的特殊处理
      if (unlockedCount >= 4) {
        return Math.random() > 0.7; // 30%概率继续掷骰子
      }
      return Math.random() > 0.9; // 否则10%概率继续掷骰子
    }
    
    // 5. 特殊情况处理
    if (isOpponentClose && potentialScore < 400 && unlockedCount > 2) {
      return Math.random() > 0.3; // 70%概率继续尝试
    }
    
    // 6. 根据难度调整最终决策
    const finalThreshold = Math.min(0.8, Math.max(0.1, riskThreshold));
    const riskFactor = Math.random();
    
    // 7. 如果是困难模式，增加连续掷骰子的倾向，但在剩余骰子少时更保守
    if (difficulty === 'hard') {
      if (unlockedCount <= 2) {
        return riskFactor < finalThreshold * 0.6; // 剩余骰子少时更保守
      } else if (potentialScore >= 500) {
        return riskFactor < 0.2; // 高分时非常保守
      } else if (riskFactor < 0.2) {
        return true; // 保持少许激进性
      }
    }
    
    return riskFactor < finalThreshold;
  };
  
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
    
    // 选择所有这个点数的骰子
    const fourOfAKindIndices = unlockedDice
      .filter(die => die.value === maxValue)
      .map(die => dice.findIndex(d => d.id === die.id));
    
    return { shouldRoll: shouldRoll(), selectedDiceIndices: fourOfAKindIndices };
  }
  
  return { shouldRoll: shouldRoll(), selectedDiceIndices: bestSelection.indices };
}; 