import { Die } from '../types';
import { DiceType } from '../models/DiceModel';
import { calculateSelectionScore, hasValidSelection } from '../utils';
import { computerDecision } from './computerAI';

/**
 * 电脑玩家的游戏流程控制
 */
export class ComputerPlayer {
  /**
   * 执行电脑的回合
   * @param dice 当前骰子状态
   * @param turnScore 当前回合分数
   * @param totalScore 总分
   * @param targetScore 目标分数
   * @param difficulty 难度
   * @param onSelectDice 选择骰子的回调函数
   * @param onRoll 掷骰子的回调函数
   * @param onBank 结束回合的回调函数
   */
  static executeComputerTurn(
    dice: Die[],
    turnScore: number,
    totalScore: number,
    targetScore: number,
    difficulty: 'easy' | 'medium' | 'hard',
    onSelectDice: (diceIndices: number[]) => void,
    onRoll: () => void,
    onBank: () => void
  ): void {
    // 获取电脑的决策
    const { shouldRoll, selectedDiceIndices } = computerDecision(
      dice,
      turnScore,
      totalScore,
      targetScore,
      difficulty
    );

    // 如果没有可选的骰子，直接执行决策
    if (selectedDiceIndices.length === 0) {
      setTimeout(() => {
        if (shouldRoll) {
          onRoll();
        } else {
          onBank();
        }
      }, 1500);
      return;
    }

    // 一颗一颗地选择骰子
    let currentIndex = 0;
    const selectNextDie = () => {
      if (currentIndex < selectedDiceIndices.length) {
        const dieIndex = selectedDiceIndices[currentIndex];
        onSelectDice([dieIndex]); // 每次只选择一个骰子
        currentIndex++;
        setTimeout(selectNextDie, 800);
      } else {
        // 所有骰子选择完毕后，等待一会儿再执行决策
        setTimeout(() => {
          if (shouldRoll) {
            onRoll();
          } else {
            onBank();
          }
        }, 1000);
      }
    };

    // 开始选择第一颗骰子
    setTimeout(selectNextDie, 1000);
  }

  /**
   * 分析游戏局势并提供消息
   * @param dice 当前骰子状态
   * @param turnScore 当前回合分数
   * @param totalScore 总分
   * @param targetScore 目标分数
   * @param difficulty 难度
   * @param phase 游戏阶段
   * @returns 分析消息
   */
  static analyzeGameState(
    dice: Die[],
    turnScore: number,
    totalScore: number,
    targetScore: number,
    difficulty: 'easy' | 'medium' | 'hard',
    phase: string
  ): string {
    if (phase === 'ROLL') {
      return '电脑正在掷骰子...';
    }

    const { shouldRoll, selectedDiceIndices } = computerDecision(
      dice,
      turnScore,
      totalScore,
      targetScore,
      difficulty
    );

    if (selectedDiceIndices.length === 0) {
      return '电脑没有可选的骰子...';
    }

    if (shouldRoll) {
      return '电脑决定继续掷骰子...';
    } else {
      return '电脑决定结束回合...';
    }
  }
} 