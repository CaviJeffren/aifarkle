import { Die, GamePhase, GameState } from '../types';
import { DiceType } from '../models/DiceModel';
import { calculateSelectionScore, hasValidSelection, isFarkle } from '../utils';

/**
 * 游戏管理器，负责处理游戏的通用逻辑
 */
export class GameManager {
  /**
   * 检查是否有可能的得分组合
   * @param dice 骰子数组
   * @returns 是否有可能的得分组合
   */
  static checkForPossibleScoring(dice: Die[]): boolean {
    // 只检查未锁定的骰子
    const unlockedDice = dice.filter(die => !die.locked);
    
    // 如果没有未锁定的骰子，返回 false
    if (unlockedDice.length === 0) {
      console.log('没有未锁定的骰子，返回false');
      return false;
    }

    // 调试信息
    console.log('检查可能的得分组合，未锁定的骰子:', unlockedDice.map(d => d.value).join(', '));

    // 1. 检查单个骰子是否有1或5 - 这是最基本的得分组合
    const hasOneOrFive = unlockedDice.some(die => die.value === 1 || die.value === 5);
    console.log('未锁定的骰子中是否有1或5:', hasOneOrFive);
    
    if (hasOneOrFive) {
      console.log('找到1或5，有效组合');
      return true;
    }

    // 2. 检查是否有三个或更多相同的数字
    const valueCounts: Record<number, number> = {};
    unlockedDice.forEach(die => {
      valueCounts[die.value] = (valueCounts[die.value] || 0) + 1;
    });
    
    console.log('未锁定骰子的点数统计:', valueCounts);
    
    for (let i = 1; i <= 6; i++) {
      if ((valueCounts[i] || 0) >= 3) {
        console.log(`找到三个或更多${i}，有效组合`);
        return true;
      }
    }

    // 3. 检查顺子
    // 只有当未锁定的骰子数量正好是5个时才检查小顺子和大顺子
    if (unlockedDice.length === 5) {
      const values = unlockedDice.map(die => die.value).sort((a, b) => a - b);
      const valuesStr = JSON.stringify(values);
      if (valuesStr === JSON.stringify([1, 2, 3, 4, 5]) || valuesStr === JSON.stringify([2, 3, 4, 5, 6])) {
        console.log('找到顺子，有效组合');
        return true;
      }
    }
    
    // 只有当未锁定的骰子数量正好是6个时才检查全顺和三对
    if (unlockedDice.length === 6) {
      const values = unlockedDice.map(die => die.value).sort((a, b) => a - b);
      if (JSON.stringify(values) === JSON.stringify([1, 2, 3, 4, 5, 6])) {
        console.log('找到全顺，有效组合');
        return true;
      }
      
      // 检查三对
      const pairCount = Object.values(valueCounts).filter(count => count === 2).length;
      if (pairCount === 3) {
        console.log('找到三对，有效组合');
        return true;
      }
    }

    console.log('没有找到有效组合，返回false');
    return false;
  }

  /**
   * 处理掷骰子的逻辑
   * @param gameState 当前游戏状态
   * @param initializeDiceWithConfig 初始化骰子的函数
   * @returns 更新后的游戏状态
   */
  static handleRoll(
    gameState: GameState,
    initializeDiceWithConfig: () => Die[]
  ): GameState {
    if (gameState.phase === GamePhase.ROLL) {
      const newDice = initializeDiceWithConfig();
      
      // 添加调试信息
      console.log('新投掷的骰子:', newDice.map(d => d.value).join(', '));
      
      // 检查新投掷的骰子中是否有1或5
      const hasOneOrFive = newDice.some(die => die.value === 1 || die.value === 5);
      console.log('新投掷的骰子中是否有1或5:', hasOneOrFive);
      
      // 检查所有未锁定的骰子中是否有1或5
      const allUnlockedDice = newDice.filter(die => !die.locked);
      const allUnlockedHasOneOrFive = allUnlockedDice.some(die => die.value === 1 || die.value === 5);
      console.log('所有未锁定的骰子中是否有1或5:', allUnlockedHasOneOrFive);
      
      // 检查是否有三个或更多相同的数字
      const valueCounts: Record<number, number> = {};
      allUnlockedDice.forEach(die => {
        valueCounts[die.value] = (valueCounts[die.value] || 0) + 1;
      });
      
      const hasThreeOrMore = Object.values(valueCounts).some(count => count >= 3);
      console.log('是否有三个或更多相同的数字:', hasThreeOrMore);
      
      // 如果有1或5，或者有三个或更多相同的数字，则认为有可能的得分组合
      const hasPossibleScoring = allUnlockedHasOneOrFive || hasThreeOrMore;
      
      console.log('是否有可能的得分组合:', hasPossibleScoring);

      if (!hasPossibleScoring) {
        return {
          ...gameState,
          dice: newDice,
          phase: GamePhase.END_TURN,
          isFarkle: true,
          players: gameState.players.map((player, idx) => ({
            ...player,
            turnScore: idx === gameState.currentPlayerIndex ? 0 : player.turnScore
          }))
        };
      }
      
      return {
        ...gameState,
        dice: newDice,
        phase: GamePhase.SELECT,
        rollCount: gameState.rollCount + 1
      };
    } else if (gameState.phase === GamePhase.SELECT) {
      // 获取当前选中的骰子分数
      const currentSelectionScore = calculateSelectionScore(gameState.dice);
      
      // 检查选中的骰子是否有效（得分大于0）
      if (currentSelectionScore <= 0) {
        return gameState;
      }
      
      // 获取未锁定的骰子数量
      const unlockedCount = gameState.dice.filter(die => !die.locked).length;
      
      // 将选中的骰子标记为锁定
      const updatedDice = gameState.dice.map(die => {
        if (die.selected) {
          return { ...die, selected: false, locked: true };
        }
        return die;
      });
      
      const newPlayers = gameState.players.map((player, idx) => {
        if (idx === gameState.currentPlayerIndex) {
          return {
            ...player,
            turnScore: player.turnScore + currentSelectionScore
          };
        }
        return player;
      });
      
      // 如果所有骰子都被锁定，重新初始化所有骰子
      if (unlockedCount === 0 || updatedDice.every(die => die.locked)) {
        return {
          ...gameState,
          dice: initializeDiceWithConfig(),
          players: newPlayers,
          phase: GamePhase.SELECT
        };
      }
      
      // 只为未锁定的骰子重新生成值
      const newDice = updatedDice.filter(die => !die.locked).map(die => ({
        ...die,
        value: this.rollDie(die.type),
        selected: false
      }));
      
      // 保留锁定的骰子
      const lockedDice = updatedDice.filter(die => die.locked);
      
      // 合并锁定的骰子和新骰子
      const allDice = [...lockedDice, ...newDice];
      
      // 添加调试信息
      console.log('新投掷的骰子:', newDice.map(d => d.value).join(', '));
      
      // 检查新投掷的骰子中是否有1或5
      const hasOneOrFive = newDice.some(die => die.value === 1 || die.value === 5);
      console.log('新投掷的骰子中是否有1或5:', hasOneOrFive);
      
      // 检查所有未锁定的骰子中是否有1或5
      const allUnlockedDice = allDice.filter(die => !die.locked);
      const allUnlockedHasOneOrFive = allUnlockedDice.some(die => die.value === 1 || die.value === 5);
      console.log('所有未锁定的骰子中是否有1或5:', allUnlockedHasOneOrFive);
      
      // 检查是否有三个或更多相同的数字
      const valueCounts: Record<number, number> = {};
      allUnlockedDice.forEach(die => {
        valueCounts[die.value] = (valueCounts[die.value] || 0) + 1;
      });
      
      const hasThreeOrMore = Object.values(valueCounts).some(count => count >= 3);
      console.log('是否有三个或更多相同的数字:', hasThreeOrMore);
      
      // 如果有1或5，或者有三个或更多相同的数字，则认为有可能的得分组合
      const hasPossibleScoring = allUnlockedHasOneOrFive || hasThreeOrMore;
      
      console.log('是否有可能的得分组合:', hasPossibleScoring);
      
      if (!hasPossibleScoring) {
        return {
          ...gameState,
          dice: allDice,
          phase: GamePhase.END_TURN,
          isFarkle: true,
          players: newPlayers.map((player, idx) => ({
            ...player,
            turnScore: idx === gameState.currentPlayerIndex ? 0 : player.turnScore
          }))
        };
      }
      
      return {
        ...gameState,
        dice: allDice,
        players: newPlayers,
        phase: GamePhase.SELECT,
        rollCount: gameState.rollCount + 1
      };
    } else {
      // 在END_TURN阶段，切换玩家并根据情况决定是否保留骰子状态
      const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
      
      // 如果是因为farkle而进入END_TURN阶段，保留骰子状态以便玩家看到farkle的情况
      if (gameState.isFarkle) {
        return {
          ...gameState,
          currentPlayerIndex: nextPlayerIndex,
          phase: GamePhase.ROLL,
          isFarkle: false, // 重置标记
          rollCount: 0
        };
      } else {
        // 否则，正常切换玩家并保留骰子状态
        return {
          ...gameState,
          currentPlayerIndex: nextPlayerIndex,
          phase: GamePhase.ROLL,
          // 保留骰子状态，但将所有骰子标记为未选中
          dice: gameState.dice.map(die => ({
            ...die,
            selected: false
          })),
          rollCount: 0
        };
      }
    }
  }

  /**
   * 处理结束回合并保存分数
   * @param gameState 当前游戏状态
   * @returns 更新后的游戏状态
   */
  static handleBank(gameState: GameState): GameState {
    if (gameState.phase !== GamePhase.SELECT) return gameState;
    
    // 先计算选中骰子的分数
    const score = calculateSelectionScore(gameState.dice);
    
    // 将选中的骰子标记为锁定
    const updatedDice = gameState.dice.map(die => {
      if (die.selected) {
        return { ...die, selected: false, locked: true };
      }
      return die;
    });
    
    const currentPlayerIndex = gameState.currentPlayerIndex;
    const nextPlayerIndex = (currentPlayerIndex + 1) % gameState.players.length;
    
    const newPlayers = [...gameState.players];
    newPlayers[currentPlayerIndex] = {
      ...newPlayers[currentPlayerIndex],
      score: newPlayers[currentPlayerIndex].score + newPlayers[currentPlayerIndex].turnScore + score,
      turnScore: 0
    };
    
    // 检查游戏是否结束
    const isGameOver = newPlayers[currentPlayerIndex].score >= gameState.settings.targetScore;
    
    if (isGameOver) {
      console.log('游戏结束前格罗申:', newPlayers[0].groschen);
      console.log('下注金额:', gameState.bet);
      
      // 结算下注
      if (currentPlayerIndex === 0) {
        // 玩家赢了，获得下注金额的两倍
        const winAmount = gameState.bet * 2;
        newPlayers[0] = {
          ...newPlayers[0],
          groschen: newPlayers[0].groschen + winAmount
        };
        console.log('玩家获胜，增加格罗申:', winAmount);
        console.log('结算后格罗申:', newPlayers[0].groschen);
      }
      // 如果电脑赢了，玩家已经在下注时扣除了格罗申，不需要额外操作
      
      return {
        ...gameState,
        players: newPlayers,
        phase: GamePhase.GAME_OVER,
        winner: newPlayers[currentPlayerIndex],
        bet: 0 // 重置下注金额
      };
    }
    
    // 修改：在结束回合时，保留骰子状态，而不是初始化新的骰子
    return {
      ...gameState,
      players: newPlayers,
      currentPlayerIndex: nextPlayerIndex,
      phase: GamePhase.ROLL,
      // 保留骰子状态，但将所有骰子标记为未选中
      dice: updatedDice,
      rollCount: 0
    };
  }

  /**
   * 生成1-6之间的随机数，根据骰子类型调整概率
   * @param type 骰子类型
   * @returns 骰子点数
   */
  private static rollDie(type: DiceType): number {
    // 这里可以根据骰子类型调整概率
    return Math.floor(Math.random() * 6) + 1;
  }
} 