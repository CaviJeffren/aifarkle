import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Modal, Form, Alert } from 'react-bootstrap';
import DiceContainer from './DiceContainer';
import ScoreBoard from './ScoreBoard';
import GameControls from './GameControls';
import GameRules from './GameRules';
import GameSettings from './GameSettings';
import GameModal from './GameModal';
import BettingPanel from './BettingPanel';
import RewardDiceModal from './RewardDiceModal';
import { 
  GamePhase, 
  GameState, 
  GameSettings as GameSettingsType,
  Die,
  PlayerDiceConfig,
  Player,
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
import { 
  getUserData, 
  saveUserData, 
  updateUserGroschen, 
  updateUserOwnedDice, 
  updateUserDiceConfigs,
  isLocalStorageAvailable
} from '../services/LocalStorageService';
import { GroschenService } from '../services/GroschenService';
import {
  DiceType,
  DICE_DATA, 
  getDiceName, 
  getDicePrice, 
  getDiceSellPrice, 
  getDiceProbabilities,
  rollDice as rollDiceByType,
  getRandomRewardDice,
  getDiceMaxOwned
} from '../models/DiceModel';
import { Challenger } from './ChallengerSelector';
import {
  getChallengerDiceConfig,
  getChallengerName,
  getChallengerDifficulty,
  getChallengerTargetScore,
  getRandomChallengerRewardDice
} from '../models/ChallengerModel';

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
      groschen: 50,
      ownedDice: Array(6).fill(DiceType.NORMAL)
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
  settings: initialSettings,
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
  
  // 特殊规则：检测224436组合，如果是这个组合则视为farkle
  if (unlockedDice.length === 6) {
    const values = unlockedDice.map(die => die.value).sort((a, b) => a - b);
    if (JSON.stringify(values) === JSON.stringify([2, 2, 3, 4, 4, 6])) {
      console.log('检测到特殊组合224436，视为farkle');
      return false;
    }
  }

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

// 挑战者模式相关类型
interface ChallengerMode {
  isActive: boolean;
  challenger: Challenger | null;
  challengerDiceConfig: DiceType[]; // 挑战者的骰子配置
  challengerTargetScore: number; // 挑战者的目标分数
}

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    // 尝试从本地存储加载用户数据
    const userData = getUserData();
    
    if (userData) {
      // 如果有本地存储的数据，使用它来初始化游戏状态
      return {
        ...initialState,
        players: [
          {
            ...initialState.players[0],
            groschen: userData.groschen,
            ownedDice: userData.ownedDice
          },
          initialState.players[1]
        ],
        diceConfigs: userData.diceConfigs,
        settings: userData.gameSettings || initialSettings // 使用存储的游戏设置或默认设置
      };
    }
    
    // 如果没有用户数据，这是新用户，保存默认设置到本地存储
    saveUserData(
      initialState.players[0], 
      initialState.diceConfigs, 
      initialSettings
    );
    console.log('新用户创建，保存默认游戏设置到本地存储:', initialSettings);
    
    // 否则使用默认初始状态
    return initialState;
  });
  const [showRules, setShowRules] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDiceSelector, setShowDiceSelector] = useState(false);
  const [showDiceShop, setShowDiceShop] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showGameScreen, setShowGameScreen] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });
  const [selectionScore, setSelectionScore] = useState(0);
  const [isForfeitConfirmation, setIsForfeitConfirmation] = useState(false);
  const [rewardDice, setRewardDice] = useState<DiceType | null>(null);
  
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
    // 重置挑战者模式
    setChallengerMode({
      isActive: false,
      challenger: null,
      challengerDiceConfig: [],
      challengerTargetScore: 0
    });
    
    setShowGameScreen(true);
    setGameState(prevState => {
      const newState = {
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
      };
      
      // 使用 GroschenService 保存用户数据
      GroschenService.setGroschen(
        newState.players[0],
        newState.diceConfigs,
        newState.players[0].groschen,
        '开始新游戏',
        newState.settings
      );
      
      return newState;
    });
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
          const newInitializedDice = initializeDiceWithConfig();
          
          // 检查新掷出的骰子是否构成farkle
          const hasPossibleScoring = checkForPossibleScoring(newInitializedDice);
          
          if (!hasPossibleScoring) {
            return {
              ...prevState,
              dice: newInitializedDice,
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
            dice: newInitializedDice,
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
        const isGameOver = totalScore >= (challengerMode.isActive ? challengerMode.challengerTargetScore : prevState.settings.targetScore);
        
        if (isGameOver) {
          console.log('游戏结束前格罗申:', newPlayers[0].groschen);
          console.log('下注金额:', prevState.bet);
          
          // 获取获胜者
          const winner = newPlayers[playerIndex];
          
          // 处理下注奖励
          if (!challengerMode.isActive && playerIndex === 0) {
            // 玩家获胜，获得下注金额的两倍
            const betReward = prevState.bet * 2;
            newPlayers[0] = {
              ...newPlayers[0],
              groschen: newPlayers[0].groschen + betReward
            };
            
            // 立即保存玩家的格罗申数据到本地存储
            updateUserGroschen(newPlayers[0].groschen);
            
            console.log('玩家获胜，获得下注奖励:', betReward);
            console.log('更新后的格罗申:', newPlayers[0].groschen);
          }
          
          // 处理游戏结束逻辑
          setTimeout(() => handleGameOver(playerIndex), 100);
          
          // 尝试获得特殊骰子 - 仅在非挑战者模式下
          if (playerIndex === 0 && !challengerMode.isActive) {
            const rewardDiceType = getRandomRewardDice();
            
            if (rewardDiceType) {
              // 检查玩家是否已经达到该骰子的最大拥有数量
              const ownedCount = newPlayers[0].ownedDice.filter(type => type === rewardDiceType).length;
              const maxOwned = getDiceMaxOwned(rewardDiceType);
              
              if (ownedCount < maxOwned) {
                // 玩家获得了特殊骰子
                newPlayers[0] = {
                  ...newPlayers[0],
                  ownedDice: [...newPlayers[0].ownedDice, rewardDiceType]
                };
                
                // 立即保存玩家的骰子数据到本地存储
                updateUserOwnedDice(newPlayers[0].ownedDice);
                
                // 设置奖励骰子状态，用于显示弹窗
                setRewardDice(rewardDiceType);
              }
            }
          }
          
          return {
            ...prevState,
            players: newPlayers,
            dice: updatedDice,
            phase: GamePhase.GAME_OVER,
            winner: winner
          };
        }
        
        // 游戏未结束，切换到下一个玩家
        const nextPlayerIndex = (playerIndex + 1) % prevState.players.length;
        const playerName = prevState.players[playerIndex].name;
        
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
    setGameState(prevState => {
      const newState = {
        ...prevState,
        settings
      };
      
      // 保存游戏设置到本地存储，确保传递 settings 参数
      saveUserData(newState.players[0], newState.diceConfigs, settings);
      
      return newState;
    });
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
            challengerMode.isActive ? challengerMode.challengerTargetScore : gameState.settings.targetScore,
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
    
    // 重置挑战者模式
    setChallengerMode({
      isActive: false,
      challenger: null,
      challengerDiceConfig: [],
      challengerTargetScore: 0
    });
    
    setGameState(prevState => {
      // 使用 GroschenService 减少格罗申
      const updatedPlayer = GroschenService.reduceGroschen(
        prevState.players[0],
        prevState.diceConfigs,
        amount,
        '下注',
        prevState.settings
      );
      
      const newPlayers = [...prevState.players];
      newPlayers[0] = updatedPlayer;
      
      return {
        ...prevState,
        bet: amount,
        players: newPlayers
      };
    });
    
    // 下注后直接开始游戏
    setShowGameScreen(true);
    setGameState(prevState => {
      const newState = {
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
      };
      
      // 使用 GroschenService 保存用户数据
      GroschenService.setGroschen(
        newState.players[0],
        newState.diceConfigs,
        newState.players[0].groschen,
        '开始新游戏',
        newState.settings
      );
      
      return newState;
    });
  };

  // 处理放弃游戏
  const handleForfeit = () => {
    setModalContent({
      title: '确认放弃',
      content: `您确定要放弃本局游戏吗？\n您将损失已投注的 ${gameState.bet} 格罗申。`
    });
    setShowModal(true);
    setIsForfeitConfirmation(true);
  };

  // 处理确认放弃游戏
  const handleConfirmForfeit = () => {
    setShowModal(false);
    setIsForfeitConfirmation(false);
    
    // 返回首页
    setShowGameScreen(false);
    
    // 重置游戏状态，但保留玩家的格罗申（已扣除下注金额）
    setGameState(prevState => {
      const newState = {
        ...initialState,
        phase: GamePhase.BETTING,
        diceConfigs: prevState.diceConfigs, // 保持用户的骰子配置
        players: [
          { 
            ...initialState.players[0], 
            groschen: prevState.players[0].groschen, // 保持当前格罗申（下注时已扣除）
            ownedDice: prevState.players[0].ownedDice // 保持玩家拥有的骰子
          },
          { ...initialState.players[1] }
        ],
        settings: prevState.settings
      };
      
      // 使用 GroschenService 保存用户数据，但不改变格罗申数量
      GroschenService.setGroschen(
        newState.players[0],
        newState.diceConfigs,
        newState.players[0].groschen,
        '放弃游戏',
        prevState.settings
      );
      
      return newState;
    });
  };

  // 处理关闭游戏结束弹窗
  const handleCloseModal = () => {
    setShowModal(false);
    
    // 如果是放弃确认弹窗，则重置状态
    if (isForfeitConfirmation) {
      setIsForfeitConfirmation(false);
      return;
    }
    
    // 如果游戏已结束
    if (gameState.phase === GamePhase.GAME_OVER) {
      console.log('游戏结束时的格罗申:', gameState.players[0].groschen);
      
      // 如果玩家获得了特殊骰子，显示恭喜获得特殊骰子的弹窗
      if (rewardDice) {
        setShowRewardModal(true);
        return; // 不立即返回首页，等待玩家关闭恭喜获得特殊骰子的弹窗
      }
      
      // 如果没有获得特殊骰子，直接返回首页并重置游戏状态
      resetGameAndReturnToHome();
    }
  };
  
  // 处理关闭恭喜获得特殊骰子弹窗
  const handleCloseRewardModal = () => {
    setShowRewardModal(false);
    setRewardDice(null); // 重置奖励骰子状态
    
    // 返回首页并重置游戏状态
    resetGameAndReturnToHome();
  };
  
  // 修改游戏结束后的重置逻辑
  const resetGameAndReturnToHome = () => {
    setGameState(prevState => {
      console.log('重置游戏时的格罗申:', prevState.players[0].groschen);
      
      const newState = {
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
      
      // 使用 GroschenService 保存用户数据
      GroschenService.setGroschen(
        newState.players[0],
        newState.diceConfigs,
        newState.players[0].groschen,
        '游戏结束重置',
        prevState.settings
      );
      
      return newState;
    });
    
    // 重置挑战者模式
    setChallengerMode({
      isActive: false,
      challenger: null,
      challengerDiceConfig: [],
      challengerTargetScore: 0
    });
    
    setShowGameScreen(false);
  };

  // 处理骰子配置保存
  const handleSaveDiceConfig = (config: PlayerDiceConfig) => {
    setGameState(prevState => {
      const newState = {
        ...prevState,
        diceConfigs: config
      };
      
      // 使用 GroschenService 保存用户数据
      GroschenService.setGroschen(
        newState.players[0],
        config,
        newState.players[0].groschen,
        '保存骰子配置',
        prevState.settings
      );
      
      return newState;
    });
  };

  // 处理购买骰子
  const handleBuyDice = (diceType: DiceType) => {
    const price = getDicePrice(diceType);
    
    // 检查玩家是否有足够的格罗申
    if (gameState.players[0].groschen < price) {
      setModalContent({
        title: '格罗申不足',
        content: `您没有足够的格罗申购买这个骰子。需要 ${price} 格罗申。`
      });
      setShowModal(true);
      return;
    }
    
    // 检查玩家是否已经拥有最大数量的这种骰子
    const ownedCount = gameState.players[0].ownedDice.filter(type => type === diceType).length;
    const maxOwned = getDiceMaxOwned(diceType);
    if (ownedCount >= maxOwned) {
      setModalContent({
        title: '已达到最大数量',
        content: `您已经拥有最大数量(${maxOwned})的这种骰子。`
      });
      setShowModal(true);
      return;
    }
    
    // 更新玩家的骰子列表
    const updatedOwnedDice = [...gameState.players[0].ownedDice, diceType]; // 添加一个新的骰子
    
    // 使用GroschenService减少格罗申并更新玩家状态
    const updatedPlayer = GroschenService.reduceGroschen(
      gameState.players[0],
      gameState.diceConfigs,
      price,
      `购买骰子: ${getDiceName(diceType)}`,
      gameState.settings
    );
    
    // 手动更新拥有的骰子列表，因为reduceGroschen不会更新这个
    const playerWithUpdatedDice = {
      ...updatedPlayer,
      ownedDice: updatedOwnedDice
    };
    
    setGameState(prevState => {
      const updatedPlayers = [...prevState.players];
      updatedPlayers[0] = playerWithUpdatedDice;
      
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
      const sellPrice = getDiceSellPrice(diceType); // 出售价格已经是原价的70%
      
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
      
      // 更新玩家的骰子列表
      const updatedOwnedDice = [...player.ownedDice];
      updatedOwnedDice.splice(indexToRemove, 1); // 移除一个骰子
      
      // 使用 GroschenService 增加格罗申并更新骰子
      const updatedPlayer = GroschenService.addGroschen(
        {
          ...player,
          ownedDice: updatedOwnedDice
        },
        prevState.diceConfigs,
        sellPrice,
        `出售骰子: ${getDiceName(diceType)}`,
        prevState.settings
      );
      
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
    // 直接使用DiceModel中的rollDiceByType函数
    return rollDiceByType(type);
  };

  // 修改初始化骰子函数
  const initializeDiceWithConfig = () => {
    // 如果是挑战者模式且当前是电脑回合，使用挑战者的骰子配置
    if (challengerMode.isActive && gameState.currentPlayerIndex === 1) {
      return Array(6).fill(null).map((_, index) => ({
        id: Math.random(),
        value: rollDie(challengerMode.challengerDiceConfig[index]),
        selected: false,
        locked: false,
        type: challengerMode.challengerDiceConfig[index]
      }));
    } else {
      // 否则使用玩家的骰子配置，确保电脑始终使用普通骰子
      return Array(6).fill(null).map((_, index) => ({
        id: Math.random(),
        value: rollDie(gameState.currentPlayerIndex === 0 ? gameState.diceConfigs.diceConfigs[index] : DiceType.NORMAL),
        selected: false,
        locked: false,
        type: gameState.currentPlayerIndex === 0 ? gameState.diceConfigs.diceConfigs[index] : DiceType.NORMAL
      }));
    }
  };

  // 在格罗申数量变化时保存到本地存储
  useEffect(() => {
    if (gameState.phase !== GamePhase.START) {
      updateUserGroschen(gameState.players[0].groschen);
    }
  }, [gameState.players[0].groschen]);

  // 在拥有的骰子变化时保存到本地存储
  useEffect(() => {
    if (gameState.phase !== GamePhase.START) {
      updateUserOwnedDice(gameState.players[0].ownedDice);
    }
  }, [gameState.players[0].ownedDice]);

  // 在骰子配置变化时保存到本地存储
  useEffect(() => {
    if (gameState.phase !== GamePhase.START) {
      updateUserDiceConfigs(gameState.diceConfigs);
    }
  }, [gameState.diceConfigs]);

  // 在游戏结束时保存完整的用户数据
  useEffect(() => {
    if (gameState.phase === GamePhase.GAME_OVER) {
      saveUserData(gameState.players[0], gameState.diceConfigs);
    }
  }, [gameState.phase]);

  // 添加挑战者模式状态
  const [challengerMode, setChallengerMode] = useState<ChallengerMode>({
    isActive: false,
    challenger: null,
    challengerDiceConfig: [],
    challengerTargetScore: 0
  });
  
  // 修改处理挑战者游戏开始的函数
  const handleStartChallengerGame = (challenger: Challenger) => {
    // 使用ChallengerModel获取挑战者骰子配置
    const challengerDiceConfig = getChallengerDiceConfig(challenger.id);
    
    // 从挑战者模型中获取目标分数
    const challengerTargetScore = getChallengerTargetScore(challenger.id);
    
    // 设置挑战者模式
    setChallengerMode({
      isActive: true,
      challenger,
      challengerDiceConfig,
      challengerTargetScore
    });
    
    // 只修改电脑难度，不修改目标分数
    const newSettings = {
      ...gameState.settings,
      computerDifficulty: challenger.difficulty
    };
    
    // 更新游戏状态
    setGameState(prevState => {
      // 创建新的游戏状态
      const newState = {
        ...initialState,
        phase: GamePhase.ROLL,
        settings: newSettings,
        diceConfigs: prevState.diceConfigs, // 保持用户的骰子配置
        dice: initializeDiceWithConfig(), // 使用配置初始化骰子
        players: [
          { 
            name: '玩家', 
            score: 0, 
            turnScore: 0, 
            isComputer: false, 
            groschen: prevState.players[0].groschen, // 保持玩家的格罗申不变
            ownedDice: prevState.players[0].ownedDice // 保持玩家拥有的骰子
          },
          { 
            name: challenger.name, // 使用挑战者名称
            score: 0, 
            turnScore: 0, 
            isComputer: true, 
            groschen: 0,
            ownedDice: [DiceType.NORMAL]
          }
        ],
        bet: 0 // 挑战者模式不需要下注格罗申
      };
      
      // 挑战者模式不扣除格罗申
      return newState;
    });
    
    // 显示游戏界面
    setShowGameScreen(true);
  };

  // 处理游戏结束
  const handleGameOver = (playerIndex: number) => {
    // 创建游戏结束消息
    const player = gameState.players[playerIndex];
    const finalScore = player.score;
    let content = `${player.name}获得胜利！`;
    
    // 处理下注奖励
    if (!challengerMode.isActive) {
      if (playerIndex === 0) {
        // 玩家获胜，获得下注金额的两倍
        // 注意：这里不再更新玩家的格罗申，只显示信息
        const betReward = gameState.bet * 2;
        content += `赢得${betReward}格罗申\n当前余额：${gameState.players[0].groschen+betReward}格罗申`;
        
        // 重置下注金额
        setGameState(prevState => ({
          ...prevState,
          bet: 0 // 重置下注金额
        }));
      } else {
        // 电脑获胜，玩家输掉下注金额
        content += `输掉${gameState.bet}格罗申\n当前余额：${gameState.players[0].groschen}格罗申`;
        
        // 下注金额已在开始游戏时扣除，不需要再次扣除
        setGameState(prevState => ({
          ...prevState,
          bet: 0 // 重置下注金额
        }));
      }
    }
    // 挑战者模式下的处理
    else if (challengerMode.isActive && challengerMode.challenger) {
      if (playerIndex === 0) {
        // 玩家获胜，有机会获得挑战者的特殊骰子
        const rewardDiceType = getRandomChallengerRewardDice(challengerMode.challenger.id);
        
        if (rewardDiceType) {
          // 检查玩家是否已经达到该骰子的最大拥有数量
          const ownedCount = gameState.players[0].ownedDice.filter(type => type === rewardDiceType).length;
          const maxOwned = getDiceMaxOwned(rewardDiceType);
          
          if (ownedCount < maxOwned) {
            // 玩家获得了特殊骰子
            setGameState(prevState => {
              const newPlayers = [...prevState.players];
              newPlayers[0] = {
                ...newPlayers[0],
                ownedDice: [...newPlayers[0].ownedDice, rewardDiceType]
              };
              
              // 立即保存玩家的骰子数据到本地存储
              updateUserOwnedDice(newPlayers[0].ownedDice);
              
              return {
                ...prevState,
                players: newPlayers
              };
            });
            
            // 设置奖励骰子状态，用于显示弹窗
            setRewardDice(rewardDiceType);
            
            content += `恭喜！你战胜了${challengerMode.challenger.name}，获得了特殊骰子：${getDiceName(rewardDiceType)}！\n`;
          } else {
            content += `恭喜！你战胜了${challengerMode.challenger.name}！\n`;
          }
        } else {
          content += `恭喜！你战胜了${challengerMode.challenger.name}！\n`;
        }
      } else {
        content += `${challengerMode.challenger.name}获胜，再接再厉！\n`;
      }
    }
    
    // 使用现有的模态框状态
    setModalContent({
      title: '游戏结束',
      content: content
    });
    setShowModal(true);
    
    // 更新游戏状态
    setGameState(prevState => ({
      ...prevState,
      phase: GamePhase.GAME_OVER,
      winner: gameState.players[playerIndex]
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
          onStartChallengerGame={handleStartChallengerGame}
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
                    <div className="total-score-label">{gameState.players[1].name}总分</div>
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
          
          {/* 恭喜获得特殊骰子弹窗 */}
          <RewardDiceModal
            show={showRewardModal}
            onHide={handleCloseRewardModal}
            rewardDice={rewardDice}
          />
        </Container>
      )}

      <DiceSelector
        show={showDiceSelector}
        onHide={() => setShowDiceSelector(false)}
        currentConfig={gameState.diceConfigs}
        onSave={handleSaveDiceConfig}
        ownedDice={gameState.players[0].ownedDice}
      />

      <DiceShop
        show={showDiceShop}
        onHide={() => setShowDiceShop(false)}
        playerGroschen={gameState.players[0].groschen}
        ownedDice={gameState.players[0].ownedDice}
        onBuyDice={handleBuyDice}
        onSellDice={handleSellDice}
        currentConfig={gameState.diceConfigs}
      />
    </>
  );
};

export default Game; 