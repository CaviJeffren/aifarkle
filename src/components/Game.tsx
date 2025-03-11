import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Modal } from 'react-bootstrap';
import DiceContainer from './DiceContainer';
import ScoreBoard from './ScoreBoard';
import GameControls from './GameControls';
import GameRules from './GameRules';
import GameSettings from './GameSettings';
import GameModal from './GameModal';
import BettingPanel from './BettingPanel';
import { 
  GamePhase, 
  GameState, 
  GameSettings as GameSettingsType,
  Die,
  DiceType,
  PlayerDiceConfig,
  DICE_CONFIGS,
  DICE_PRICES
} from '../types';
import { 
  initializeDice, 
  rerollSelectedDice, 
  hasValidSelection, 
  calculateSelectionScore,
  isFarkle
} from '../utils';
import { computerDecision } from '../ai/computerAI';
import { ComputerPlayer } from '../ai/computerPlayer';
import '../styles/Game.css';
import LandingPage from './LandingPage';
import DiceSelector from './DiceSelector';
import DiceShop from './DiceShop';
import LockedDiceContainer from './LockedDiceContainer';

const initialSettings: GameSettingsType = {
  targetScore: 4000,
  computerDifficulty: 'medium'
};

const initialState: GameState = {
  dice: initializeDice(),
  players: [
    { 
      name: '玩家', 
      score: 0, 
      turnScore: 0, 
      isComputer: false, 
      groschen: 100,
      ownedDice: [
        // 每种卡维尔测试骰子各6个
        ...Array(6).fill(DiceType.KAVIEL_1),
        ...Array(6).fill(DiceType.KAVIEL_2),
        ...Array(6).fill(DiceType.KAVIEL_3),
        ...Array(6).fill(DiceType.KAVIEL_4),
        ...Array(6).fill(DiceType.KAVIEL_5),
        ...Array(6).fill(DiceType.KAVIEL_6),
        DiceType.NORMAL
      ]
    },
    { 
      name: '电脑', 
      score: 0, 
      turnScore: 0, 
      isComputer: true, 
      groschen: 0,
      ownedDice: [DiceType.NORMAL]
    }
  ],
  currentPlayerIndex: 0,
  phase: GamePhase.BETTING,
  rollCount: 0,
  settings: {
    targetScore: 10000,
    computerDifficulty: 'medium'
  },
  winner: null,
  bet: 0,
  diceConfigs: {
    diceConfigs: Array(6).fill(DiceType.NORMAL)
  },
  isFarkle: false
};

const checkAllPossibleSelections = (unlockedDice: Array<Die>) => {
  // 如果没有未锁定的骰子，返回 false
  if (unlockedDice.length === 0) {
    return false;
  }

  // 1. 检查单个骰子（1或5）
  if (unlockedDice.some(die => die.value === 1 || die.value === 5)) {
    return true;
  }

  // 统计每个数字的出现次数
  const counts = new Array(7).fill(0);
  unlockedDice.forEach(die => counts[die.value]++);

  // 2. 检查三个或更多相同的数字
  for (let i = 1; i <= 6; i++) {
    if (counts[i] >= 3) {
      return true;
    }
  }

  // 3. 检查顺子
  if (unlockedDice.length >= 5) {
    // 小顺子 (1-2-3-4-5)
    if (counts[1] >= 1 && counts[2] >= 1 && counts[3] >= 1 && counts[4] >= 1 && counts[5] >= 1) {
      return true;
    }
    // 大顺子 (2-3-4-5-6)
    if (counts[2] >= 1 && counts[3] >= 1 && counts[4] >= 1 && counts[5] >= 1 && counts[6] >= 1) {
      return true;
    }
  }

  // 4. 检查三对（需要6个骰子）
  if (unlockedDice.length === 6) {
    let pairCount = 0;
    for (let i = 1; i <= 6; i++) {
      if (counts[i] === 2) {
        pairCount++;
      }
    }
    if (pairCount === 3) {
      return true;
    }
  }

  // 5. 检查所有可能的组合
  // 生成所有可能的选择组合
  const testAllCombinations = (dice: Array<Die>) => {
    const testDice = dice.map(die => ({...die, selected: false, type: die.type}));
    
    // 递归函数来测试所有可能的组合
    const testCombination = (index: number): boolean => {
      if (index === dice.length) {
        // 检查当前选择是否有效
        return hasValidSelection(testDice);
      }

      // 不选择当前骰子
      const notSelected = testCombination(index + 1);
      if (notSelected) return true;

      // 选择当前骰子
      testDice[index].selected = true;
      const selected = testCombination(index + 1);
      testDice[index].selected = false;

      return selected;
    };

    return testCombination(0);
  };

  // 最后，测试所有可能的组合
  return testAllCombinations(unlockedDice);
};

const checkForPossibleScoring = (dice: Array<{id: number; value: number; selected: boolean; locked: boolean}>) => {
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
  const onesCount = unlockedDice.filter(die => die.value === 1).length;
  const fivesCount = unlockedDice.filter(die => die.value === 5).length;
  
  console.log(`未锁定的骰子中有 ${onesCount} 个1和 ${fivesCount} 个5`);
  
  if (onesCount > 0 || fivesCount > 0) {
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
};

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [showRules, setShowRules] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDiceSelector, setShowDiceSelector] = useState(false);
  const [showDiceShop, setShowDiceShop] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showGameScreen, setShowGameScreen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });
  const [selectionScore, setSelectionScore] = useState(0);
  const [isForfeitConfirmation, setIsForfeitConfirmation] = useState(false);
  
  // 获取当前玩家和计算机回合状态
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isComputerTurn = currentPlayer.isComputer;
  
  // 检查是否有选中的骰子
  const hasSelectedDice = gameState.dice.some(die => die.selected);
  
  // 处理骰子点击
  const handleDieClick = (id: number) => {
    if (gameState.phase !== GamePhase.SELECT || isComputerTurn) return;
    
    setGameState(prevState => {
      // 找到被点击的骰子
      const clickedDie = prevState.dice.find(die => die.id === id);
      
      // 如果骰子已经被锁定，直接返回当前状态
      if (!clickedDie || clickedDie.locked) {
        return prevState;
      }
      
      const newDice = prevState.dice.map(die => {
        if (die.id === id) {
          return { ...die, selected: !die.selected };
        }
        return die;
      });
      
      // 更新提示消息
      const selectedDice = newDice.filter(die => die.selected && !die.locked);
      const message = selectedDice.length > 0 ? 
        hasValidSelection(newDice) ? '选择要保留的骰子。' : '当前选择组合无分值。' 
        : '请选择要保留的骰子。';
      
      return { 
        ...prevState, 
        dice: newDice,
        message
      };
    });
  };
  
  // 计算选中骰子的分数
  useEffect(() => {
    const score = calculateSelectionScore(gameState.dice);
    setSelectionScore(score);
  }, [gameState.dice]);
  
  // 检查选择是否有效
  const isSelectionValid = hasValidSelection(gameState.dice);
  
  // 开始新游戏
  const handleStartGame = () => {
    setShowGameScreen(true);
    setGameState(prevState => ({
      ...initialState,
      phase: GamePhase.ROLL,
      settings: prevState.settings,
      diceConfigs: prevState.diceConfigs, // 保持用户的骰子配置
      dice: initializeDiceWithConfig(), // 使用配置初始化骰子
      players: [
        { 
          name: '玩家', 
          score: 0, 
          turnScore: 0, 
          isComputer: false, 
          groschen: prevState.players[0].groschen,
          ownedDice: prevState.players[0].ownedDice // 保持玩家拥有的骰子
        },
        { 
          name: '电脑', 
          score: 0, 
          turnScore: 0, 
          isComputer: true, 
          groschen: 0,
          ownedDice: [DiceType.NORMAL]
        }
      ],
      bet: prevState.bet
    }));
  };
  
  // 掷骰子
  const handleRoll = () => {
    if (gameState.phase === GamePhase.ROLL) {
      setGameState(prevState => {
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
            ...prevState,
            dice: newDice,
            phase: GamePhase.END_TURN,
            isFarkle: true,
            players: prevState.players.map((player, idx) => ({
              ...player,
              turnScore: idx === prevState.currentPlayerIndex ? 0 : player.turnScore
            }))
          };
        }
        
        return {
          ...prevState,
          dice: newDice,
          phase: GamePhase.SELECT,
          rollCount: prevState.rollCount + 1
        };
      });
    } else if (gameState.phase === GamePhase.SELECT) {
      setGameState(prevState => {
        const currentSelectionScore = calculateSelectionScore(prevState.dice);
        
        // 检查选中的骰子是否有效（得分大于0）
        if (currentSelectionScore <= 0) {
          // 如果选中的骰子无效，显示提示并返回当前状态
          setGameState(state => ({
            ...state,
            message: '无效的选择，请重新选择有效的骰子组合'
          }));
          return prevState;
        }
        
        // 获取未锁定的骰子数量
        const unlockedCount = prevState.dice.filter(die => !die.locked).length;
        
        // 将选中的骰子标记为锁定
        const updatedDice = prevState.dice.map(die => {
          if (die.selected) {
            return { ...die, selected: false, locked: true };
          }
          return die;
        });
        
        const newPlayers = prevState.players.map((player, idx) => {
          if (idx === prevState.currentPlayerIndex) {
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
            ...prevState,
            dice: initializeDiceWithConfig(),
            players: newPlayers,
            phase: GamePhase.SELECT
          };
        }
        
        // 只为未锁定的骰子重新生成值
        const newDice = updatedDice.filter(die => !die.locked).map(die => ({
          ...die,
          value: rollDie(die.type),
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
            ...prevState,
            dice: allDice,
            phase: GamePhase.END_TURN,
            isFarkle: true,
            players: newPlayers.map((player, idx) => ({
              ...player,
              turnScore: idx === prevState.currentPlayerIndex ? 0 : player.turnScore
            }))
          };
        }
        
        return {
          ...prevState,
          dice: allDice,
          players: newPlayers,
          phase: GamePhase.SELECT,
          rollCount: prevState.rollCount + 1
        };
      });
    } else {
      // 在END_TURN阶段，切换玩家并根据情况决定是否保留骰子状态
      setGameState(prevState => {
        const nextPlayerIndex = (prevState.currentPlayerIndex + 1) % prevState.players.length;
        
        // 如果是因为farkle而进入END_TURN阶段，保留骰子状态以便玩家看到farkle的情况
        if (prevState.isFarkle) {
          return {
            ...prevState,
            currentPlayerIndex: nextPlayerIndex,
            phase: GamePhase.ROLL,
            isFarkle: false, // 重置标记
            rollCount: 0
          };
        } else {
          // 否则，正常切换玩家并初始化新的骰子
          return {
            ...prevState,
            currentPlayerIndex: nextPlayerIndex,
            phase: GamePhase.ROLL,
            // 保留骰子状态，但将所有骰子标记为未选中
            dice: prevState.dice.map((die: any) => ({ ...die, selected: false })),
            rollCount: 0
          };
        }
      });
    }
  };
  
  /**
   * 统一的分数计算和更新方法
   * @param dice 当前骰子状态
   * @param playerIndex 玩家索引
   * @param endTurn 是否结束回合
   * @returns 更新后的游戏状态
   */
  const calculateAndUpdateScore = (dice: Die[], playerIndex: number, endTurn: boolean = false) => {
    return (prevState: GameState) => {
      // 计算选中骰子的分数
      const selectedDice = dice.filter(die => die.selected && !die.locked);
      const selectionScore = selectedDice.length > 0 ? calculateSelectionScore(selectedDice) : 0;
      
      console.log(`玩家${playerIndex + 1}选中的骰子分数:`, selectionScore);
      console.log(`玩家${playerIndex + 1}当前回合分数:`, prevState.players[playerIndex].turnScore);
      console.log(`玩家${playerIndex + 1}当前总分:`, prevState.players[playerIndex].score);
      
      // 更新玩家数组
      const newPlayers = [...prevState.players];
      
      if (endTurn) {
        // 结束回合：总分 = 当前总分 + 回合得分 + 选择得分
        const totalTurnScore = newPlayers[playerIndex].turnScore + selectionScore;
        const totalScore = newPlayers[playerIndex].score + totalTurnScore;
        
        newPlayers[playerIndex] = {
          ...newPlayers[playerIndex],
          score: totalScore,
          turnScore: 0
        };
        
        // 将选中的骰子标记为锁定
        const updatedDice = prevState.dice.map(die => {
          if (die.selected) {
            return { ...die, selected: false, locked: true };
          }
          return die;
        });
        
        // 检查游戏是否结束
        const isGameOver = totalScore >= prevState.settings.targetScore;
        
        if (isGameOver) {
          console.log('游戏结束前格罗申:', newPlayers[0].groschen);
          console.log('下注金额:', prevState.bet);
          
          // 结算下注
          if (playerIndex === 0) {
            // 玩家赢了，获得下注金额的两倍
            const winAmount = prevState.bet * 2;
            newPlayers[0] = {
              ...newPlayers[0],
              groschen: newPlayers[0].groschen + winAmount
            };
            console.log('玩家获胜，增加格罗申:', winAmount);
            console.log('结算后格罗申:', newPlayers[0].groschen);
          }
          // 如果电脑赢了，玩家已经在下注时扣除了格罗申，不需要额外操作
          
          // 显示游戏结束弹窗
          const winner = newPlayers[playerIndex];
          let content = `${winner.name}获得胜利！\n最终得分：${winner.score}分\n`;
          
          if (playerIndex === 0) {
            content += `赢得${prevState.bet * 2}格罗申\n当前余额：${newPlayers[0].groschen}格罗申`;
          } else {
            content += `输掉${prevState.bet}格罗申\n当前余额：${newPlayers[0].groschen}格罗申`;
          }
          
          setModalContent({
            title: '游戏结束',
            content: content
          });
          setShowModal(true);
          
          return {
            ...prevState,
            players: newPlayers,
            dice: updatedDice,
            phase: GamePhase.GAME_OVER,
            winner: winner,
            bet: 0 // 重置下注金额
          };
        }
        
        // 游戏未结束，切换到下一个玩家
        const nextPlayerIndex = (playerIndex + 1) % prevState.players.length;
        const playerName = playerIndex === 0 ? "玩家" : "电脑";
        
        return {
          ...prevState,
          players: newPlayers,
          dice: updatedDice,
          message: `${playerName}结束回合，获得 ${totalTurnScore} 分，总分 ${totalScore}...`,
          currentPlayerIndex: nextPlayerIndex,
          phase: GamePhase.ROLL,
          rollCount: 0
        };
      } else {
        // 继续回合：回合得分 += 选择得分
        newPlayers[playerIndex] = {
          ...newPlayers[playerIndex],
          turnScore: newPlayers[playerIndex].turnScore + selectionScore
        };
        
        // 更新骰子状态
        return {
          ...prevState,
          players: newPlayers,
          dice: prevState.dice.map(die => {
            if (die.selected) {
              return { ...die, selected: false, locked: true };
            }
            return die;
          }),
          message: `选择得分：${selectionScore}，回合得分：${newPlayers[playerIndex].turnScore}`
        };
      }
    };
  };

  // 修改 handleBank 函数
  const handleBank = () => {
    if (gameState.phase !== GamePhase.SELECT) return;
    
    // 使用统一的分数计算方法
    setGameState(calculateAndUpdateScore(gameState.dice, gameState.currentPlayerIndex, true));
  };
  
  // 保存游戏设置
  const handleSaveSettings = (settings: GameSettingsType) => {
    setGameState(prevState => ({
      ...prevState,
      settings
    }));
  };
  
  // 电脑AI逻辑 - 优化版本
  const computerPlay = useCallback(() => {
    if (!currentPlayer.isComputer) return;

    const executeComputerAction = () => {
      if (gameState.phase === GamePhase.ROLL) {
        setGameState(prevState => ({
          ...prevState,
          message: '电脑正在掷骰子...'
        }));
        setTimeout(() => handleRoll(), 1000);
      } else if (gameState.phase === GamePhase.SELECT) {
        try {
          // 使用 ComputerPlayer 类处理电脑的回合
          const selectDice = (diceIndices: number[]) => {
            // 先更新骰子的选中状态
            setGameState(prevState => ({
              ...prevState,
              dice: prevState.dice.map((die, idx) => ({
                ...die,
                selected: diceIndices.includes(idx) || (die.selected && !die.locked)
              })),
              message: `电脑正在思考...选择了第 ${diceIndices.length} 个骰子`
            }));
          };

          // 使用 ComputerPlayer 执行电脑回合
          ComputerPlayer.executeComputerTurn(
            gameState.dice,
            currentPlayer.turnScore,
            currentPlayer.score,
            gameState.settings.targetScore,
            gameState.settings.computerDifficulty,
            selectDice,
            handleRoll,
            () => {
              // 确保骰子选中状态更新后再计算分数
              setTimeout(() => {
                setGameState(prevState => {
                  // 先获取更新后的骰子状态
                  const updatedDice = prevState.dice;
                  console.log('电脑结束回合时的骰子状态:', updatedDice.map(d => ({
                    value: d.value,
                    selected: d.selected,
                    locked: d.locked
                  })));
                  
                  // 使用统一的分数计算方法
                  return calculateAndUpdateScore(updatedDice, prevState.currentPlayerIndex, true)(prevState);
                });
              }, 100);
            }
          );
        } catch (error) {
          console.error("电脑AI错误:", error);
          handleBank(); // 出错时直接结束回合
        }
      } else if (gameState.phase === GamePhase.END_TURN) {
        handleRoll();
      }
    };

    // 使用单个延时来执行动作
    const timeoutId = setTimeout(executeComputerAction, 1000);
    return () => clearTimeout(timeoutId);
  }, [currentPlayer, gameState.phase, gameState.settings.targetScore, gameState.settings.computerDifficulty]);

  // 当轮到电脑时自动执行
  useEffect(() => {
    if (isComputerTurn && gameState.phase !== GamePhase.GAME_OVER) {
      computerPlay();
    }
  }, [isComputerTurn, gameState.phase, computerPlay]);
  
  // 在 Game 组件中添加处理下注的函数
  const handlePlaceBet = (amount: number) => {
    console.log('下注前格罗申:', gameState.players[0].groschen);
    console.log('下注金额:', amount);
    
    setGameState(prevState => {
      const newGroschen = prevState.players[0].groschen - amount;
      console.log('下注后格罗申:', newGroschen);
      
      const newPlayers = [...prevState.players];
      newPlayers[0] = {
        ...newPlayers[0],
        groschen: newGroschen
      };
      
      return {
        ...prevState,
        bet: amount,
        players: newPlayers
      };
    });
    
    // 下注后直接开始游戏
    setShowGameScreen(true);
    setGameState(prevState => ({
      ...initialState,
      phase: GamePhase.ROLL,
      settings: prevState.settings,
      diceConfigs: prevState.diceConfigs, // 保持用户的骰子配置
      dice: initializeDiceWithConfig(),
      bet: amount,
      players: [
        { 
          name: '玩家', 
          score: 0, 
          turnScore: 0, 
          isComputer: false, 
          groschen: prevState.players[0].groschen,
          ownedDice: prevState.players[0].ownedDice // 保持玩家拥有的骰子
        },
        { 
          name: '电脑', 
          score: 0, 
          turnScore: 0, 
          isComputer: true, 
          groschen: 0,
          ownedDice: [DiceType.NORMAL]
        }
      ]
    }));
  };

  // 检查玩家格罗申是否用完，如果用完则重置
  useEffect(() => {
    if (gameState.phase === GamePhase.BETTING && gameState.players[0].groschen <= 0) {
      setModalContent({
        title: '格罗申用完',
        content: '您的格罗申已用完，已为您重置为50格罗申。'
      });
      setShowModal(true);
      
      setGameState(prevState => ({
        ...prevState,
        players: [
          { ...prevState.players[0], groschen: 50 },
          { ...prevState.players[1] }
        ]
      }));
    }
  }, [gameState.phase, gameState.players]);

  // 处理放弃游戏
  const handleForfeit = () => {
    setModalContent({
      title: '确认放弃',
      content: `您确定要放弃本局游戏吗？\n您将损失已投注的 ${gameState.bet} 格罗申。`
    });
    setShowModal(true);
    setIsForfeitConfirmation(true);
  };

  // 确认放弃游戏
  const handleConfirmForfeit = () => {
    setShowModal(false);
    setIsForfeitConfirmation(false);
    
    // 返回首页
    setShowGameScreen(false);
    
    // 重置游戏状态，但保留玩家的格罗申（已扣除下注金额）
    setGameState(prevState => ({
      ...initialState,
      phase: GamePhase.BETTING,
      diceConfigs: prevState.diceConfigs,
      players: [
        { 
          ...initialState.players[0], 
          groschen: prevState.players[0].groschen,
          ownedDice: prevState.players[0].ownedDice
        },
        { ...initialState.players[1] }
      ],
      settings: prevState.settings
    }));
  };

  // 处理关闭游戏结束弹窗
  const handleCloseModal = () => {
    setShowModal(false);
    
    // 如果是放弃确认弹窗，则重置状态
    if (isForfeitConfirmation) {
      setIsForfeitConfirmation(false);
      return;
    }
    
    // 如果游戏已结束，返回首页并保持玩家的格罗申余额
    if (gameState.phase === GamePhase.GAME_OVER) {
      console.log('游戏结束时的格罗申:', gameState.players[0].groschen);
      
      setGameState(prevState => {
        console.log('重置游戏时的格罗申:', prevState.players[0].groschen);
        return {
          ...initialState,
          phase: GamePhase.BETTING,
          diceConfigs: prevState.diceConfigs, // 保持用户的骰子配置
          players: [
            { 
              ...initialState.players[0], 
              groschen: prevState.players[0].groschen,
              ownedDice: prevState.players[0].ownedDice // 保持玩家拥有的骰子
            },
            { ...initialState.players[1] }
          ],
          settings: prevState.settings
        };
      });
      setShowGameScreen(false);
    }
  };

  // 处理骰子配置保存
  const handleSaveDiceConfig = (config: PlayerDiceConfig) => {
    setGameState(prevState => ({
      ...prevState,
      diceConfigs: config
    }));
  };

  // 处理购买骰子
  const handleBuyDice = (diceType: DiceType) => {
    setGameState(prevState => {
      const player = prevState.players[0]; // 玩家
      const price = DICE_PRICES[diceType];
      
      // 检查玩家是否有足够的格罗申
      if (player.groschen < price) {
        return prevState;
      }
      
      // 更新玩家的骰子列表和格罗申余额
      const updatedPlayer = {
        ...player,
        ownedDice: [...player.ownedDice, diceType], // 添加一个新的骰子
        groschen: player.groschen - price
      };
      
      const updatedPlayers = [...prevState.players];
      updatedPlayers[0] = updatedPlayer;
      
      return {
        ...prevState,
        players: updatedPlayers
      };
    });
  };

  // 处理出售骰子
  const handleSellDice = (diceType: DiceType) => {
    setGameState(prevState => {
      const player = prevState.players[0]; // 玩家
      const price = DICE_PRICES[diceType];
      const sellPrice = Math.floor(price * 0.7); // 出售价格为原价的70%
      
      // 计算已使用的该类型骰子数量
      const usedCount = prevState.diceConfigs.diceConfigs.filter(type => type === diceType).length;
      
      // 计算拥有的该类型骰子数量
      const ownedCount = player.ownedDice.filter(type => type === diceType).length;
      
      // 检查是否有可出售的骰子（拥有数量大于使用数量）
      if (ownedCount <= usedCount) {
        return prevState;
      }
      
      // 找到第一个可以出售的该类型骰子的索引
      const indexToRemove = player.ownedDice.findIndex((type, index) => {
        // 如果是目标类型，检查它是否是"多余"的（超过使用数量的部分）
        if (type === diceType) {
          // 计算到当前索引为止，该类型骰子的数量
          const countUpToIndex = player.ownedDice.slice(0, index + 1).filter(t => t === diceType).length;
          // 如果数量大于使用数量，说明这个骰子是可以出售的
          return countUpToIndex > usedCount;
        }
        return false;
      });
      
      if (indexToRemove === -1) {
        return prevState;
      }
      
      // 更新玩家的骰子列表和格罗申余额
      const updatedOwnedDice = [...player.ownedDice];
      updatedOwnedDice.splice(indexToRemove, 1); // 移除一个骰子
      
      const updatedPlayer = {
        ...player,
        ownedDice: updatedOwnedDice,
        groschen: player.groschen + sellPrice
      };
      
      const updatedPlayers = [...prevState.players];
      updatedPlayers[0] = updatedPlayer;
      
      return {
        ...prevState,
        players: updatedPlayers
      };
    });
  };

  // 返回到首页
  const handleReturnToHome = () => {
    setShowGameScreen(false);
  };

  // 修改掷骰子函数以支持特殊骰子
  const rollDie = (type: DiceType): number => {
    const probabilities = DICE_CONFIGS[type].probabilities;
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

  // 修改初始化骰子函数
  const initializeDiceWithConfig = () => {
    return Array(6).fill(null).map((_, index) => ({
      id: Math.random(),
      value: rollDie(gameState.currentPlayerIndex === 0 ? gameState.diceConfigs.diceConfigs[index] : DiceType.NORMAL),
      selected: false,
      locked: false,
      type: gameState.currentPlayerIndex === 0 ? gameState.diceConfigs.diceConfigs[index] : DiceType.NORMAL
    }));
  };

  return (
    <>
      {!showGameScreen && (
        <LandingPage
          onStartGame={handleStartGame}
          onSaveSettings={handleSaveSettings}
          onPlaceBet={handlePlaceBet}
          initialSettings={gameState.settings}
          playerGroschen={gameState.players[0].groschen}
          onOpenDiceSelector={() => setShowDiceSelector(true)}
          onOpenDiceShop={() => setShowDiceShop(true)}
        />
      )}

      {showGameScreen && (
        <Container className="game-container">
          <Row className="header">
            <Col>
              <h1>天国骰子</h1>
              <div className="header-buttons">
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  className="forfeit-button"
                  onClick={handleForfeit}
                >
                  放弃
                </Button>
              </div>
            </Col>
          </Row>

          <Row className="main-content">
            <Col xs={12}>
              <div className="total-scores-panel">
                <div className="total-scores-row">
                  <div className={`total-score-item ${gameState.currentPlayerIndex === 0 ? 'current-turn' : ''}`}>
                    <div className="total-score-label">玩家总分</div>
                    <div className="total-score-value">{gameState.players[0].score}</div>
                  </div>
                  <div className={`total-score-item ${gameState.currentPlayerIndex === 1 ? 'current-turn' : ''}`}>
                    <div className="total-score-label">电脑总分</div>
                    <div className="total-score-value">{gameState.players[1].score}</div>
                  </div>
                </div>
              </div>
              
              <DiceContainer 
                dice={gameState.dice} 
                phase={gameState.phase} 
                onDieClick={handleDieClick} 
              />
              
              <LockedDiceContainer dice={gameState.dice} />
              
              <div className="score-panel">
                <div className="score-row">
                  <div className="score-item">
                    <div className="score-label">回合得分</div>
                    <div className="score-value">{currentPlayer.turnScore}</div>
                  </div>
                  <div className="score-item">
                    <div className="score-label">选择得分</div>
                    <div className="score-value">{selectionScore}</div>
                  </div>
                </div>
              </div>
              
              <GameControls 
                phase={gameState.phase}
                onRoll={handleRoll}
                onBank={handleBank}
                onNewGame={handleStartGame}
                selectionScore={selectionScore}
                isSelectionValid={hasValidSelection(gameState.dice)}
                isComputerTurn={isComputerTurn}
                hasSelectedDice={hasSelectedDice}
              />
            </Col>
          </Row>

          <GameModal
            show={showModal}
            onHide={handleCloseModal}
            title={modalContent.title}
            content={modalContent.content}
            onConfirm={isForfeitConfirmation ? handleConfirmForfeit : undefined}
            showConfirmButton={isForfeitConfirmation}
          />
        </Container>
      )}

      <DiceSelector
        show={showDiceSelector}
        onHide={() => setShowDiceSelector(false)}
        currentConfig={gameState.diceConfigs}
        onSave={handleSaveDiceConfig}
        ownedDice={gameState.players[0].ownedDice}
        onSellDice={handleSellDice}
      />

      <DiceShop
        show={showDiceShop}
        onHide={() => setShowDiceShop(false)}
        playerGroschen={gameState.players[0].groschen}
        ownedDice={gameState.players[0].ownedDice}
        onBuyDice={handleBuyDice}
      />
    </>
  );
};

export default Game; 