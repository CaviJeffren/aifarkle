import { Player, PlayerDiceConfig } from '../types';
import { DiceType } from '../models/DiceModel';
import { saveUserData } from './LocalStorageService';

/**
 * 格罗申服务 - 统一处理格罗申的增减和数据保存
 */
export class GroschenService {
  /**
   * 增加格罗申
   * @param player 玩家
   * @param diceConfigs 骰子配置
   * @param amount 增加的数量
   * @param reason 增加原因（用于日志）
   * @param gameSettings 可选的游戏设置
   * @returns 更新后的玩家对象
   */
  static addGroschen(
    player: Player, 
    diceConfigs: PlayerDiceConfig, 
    amount: number, 
    reason: string = '未指定',
    gameSettings?: any
  ): Player {
    if (amount <= 0) {
      console.warn('增加格罗申的数量必须大于0');
      return player;
    }

    const updatedPlayer = {
      ...player,
      groschen: player.groschen + amount
    };

    console.log(`格罗申增加: +${amount} (${reason}), 当前余额: ${updatedPlayer.groschen}`);
    
    // 保存数据，如果有游戏设置则一并保存
    saveUserData(updatedPlayer, diceConfigs, gameSettings);
    
    return updatedPlayer;
  }

  /**
   * 减少格罗申
   * @param player 玩家
   * @param diceConfigs 骰子配置
   * @param amount 减少的数量
   * @param reason 减少原因（用于日志）
   * @param gameSettings 可选的游戏设置
   * @returns 更新后的玩家对象
   */
  static reduceGroschen(
    player: Player, 
    diceConfigs: PlayerDiceConfig, 
    amount: number, 
    reason: string = '未指定',
    gameSettings?: any
  ): Player {
    if (amount <= 0) {
      console.warn('减少格罗申的数量必须大于0');
      return player;
    }

    const updatedPlayer = {
      ...player,
      groschen: Math.max(0, player.groschen - amount) // 确保格罗申不会小于0
    };

    console.log(`格罗申减少: -${amount} (${reason}), 当前余额: ${updatedPlayer.groschen}`);
    
    // 保存数据，如果有游戏设置则一并保存
    saveUserData(updatedPlayer, diceConfigs, gameSettings);
    
    return updatedPlayer;
  }

  /**
   * 设置格罗申数量
   * @param player 玩家
   * @param diceConfigs 骰子配置
   * @param amount 设置的数量
   * @param reason 设置原因（用于日志）
   * @param gameSettings 可选的游戏设置
   * @returns 更新后的玩家对象
   */
  static setGroschen(
    player: Player, 
    diceConfigs: PlayerDiceConfig, 
    amount: number, 
    reason: string = '未指定',
    gameSettings?: any
  ): Player {
    if (amount < 0) {
      console.warn('设置的格罗申数量不能小于0');
      amount = 0;
    }

    const updatedPlayer = {
      ...player,
      groschen: amount
    };

    console.log(`格罗申设置为: ${amount} (${reason})`);
    
    // 保存数据，如果有游戏设置则一并保存
    saveUserData(updatedPlayer, diceConfigs, gameSettings);
    
    return updatedPlayer;
  }

  /**
   * 更新玩家拥有的骰子
   * @param player 玩家
   * @param diceConfigs 骰子配置
   * @param ownedDice 新的骰子列表
   * @param reason 更新原因（用于日志）
   * @param gameSettings 可选的游戏设置
   * @returns 更新后的玩家对象
   */
  static updateOwnedDice(
    player: Player, 
    diceConfigs: PlayerDiceConfig, 
    ownedDice: DiceType[], 
    reason: string = '未指定',
    gameSettings?: any
  ): Player {
    const updatedPlayer = {
      ...player,
      ownedDice: ownedDice
    };

    console.log(`骰子更新 (${reason}), 当前拥有: ${ownedDice.length}个`);
    
    // 保存数据，如果有游戏设置则一并保存
    saveUserData(updatedPlayer, diceConfigs, gameSettings);
    
    return updatedPlayer;
  }
} 