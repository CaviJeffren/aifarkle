import { Player, PlayerDiceConfig, GameSettings } from '../types';
import { DiceType } from '../models/DiceModel';

// 检查 localStorage 是否可用
export const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = 'test_localStorage';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.error('localStorage 不可用:', e);
    return false;
  }
};

// 本地存储的键名
const STORAGE_KEYS = {
  USER_ID: 'farkle_user_id',
  USER_DATA: 'farkle_user_data',
  DICE_CONFIG: 'farkle_dice_config',
  GAME_SETTINGS: 'farkle_game_settings'
};

// 用户数据接口
interface UserData {
  groschen: number;
  ownedDice: DiceType[];
  diceConfigs: PlayerDiceConfig;
  gameSettings?: GameSettings;
}

/**
 * 生成唯一的用户ID
 */
const generateUserId = (): string => {
  return 'user_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * 获取或创建用户ID
 */
export const getUserId = (): string => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage 不可用，返回临时用户ID');
    return generateUserId();
  }

  let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  if (!userId) {
    userId = generateUserId();
    try {
      localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
      console.log('创建新用户ID:', userId);
    } catch (e) {
      console.error('保存用户ID时出错:', e);
    }
  } else {
    console.log('获取已存在的用户ID:', userId);
  }
  return userId;
};

/**
 * 保存用户数据到本地存储
 */
export const saveUserData = (player: Player, diceConfigs: PlayerDiceConfig, gameSettings?: GameSettings): void => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage 不可用，无法保存用户数据');
    return;
  }

  try {
    const userId = getUserId();
    const userData: UserData = {
      groschen: player.groschen,
      ownedDice: player.ownedDice,
      diceConfigs: diceConfigs
    };
    
    // 如果提供了游戏设置，则保存
    if (gameSettings) {
      userData.gameSettings = gameSettings;
    }
    
    const userDataString = JSON.stringify(userData);
    localStorage.setItem(`${STORAGE_KEYS.USER_DATA}_${userId}`, userDataString);
    console.log('用户数据已保存到本地存储', userData);
    console.log('存储键:', `${STORAGE_KEYS.USER_DATA}_${userId}`);
    console.log('存储值:', userDataString);
  } catch (e) {
    console.error('保存用户数据时出错:', e);
  }
};

/**
 * 从本地存储获取用户数据
 */
export const getUserData = (): UserData | null => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage 不可用，无法获取用户数据');
    return null;
  }

  try {
    const userId = getUserId();
    const storageKey = `${STORAGE_KEYS.USER_DATA}_${userId}`;
    const userDataString = localStorage.getItem(storageKey);
    
    console.log('尝试获取用户数据，存储键:', storageKey);
    
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        console.log('从本地存储获取用户数据成功:', userData);
        return userData;
      } catch (error) {
        console.error('解析用户数据时出错:', error);
        return null;
      }
    } else {
      console.log('本地存储中没有找到用户数据');
      return null;
    }
  } catch (e) {
    console.error('获取用户数据时出错:', e);
    return null;
  }
};

/**
 * 更新用户的格罗申数量
 */
export const updateUserGroschen = (groschen: number): void => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage 不可用，无法更新格罗申');
    return;
  }

  try {
    const userData = getUserData();
    if (userData) {
      userData.groschen = groschen;
      const userId = getUserId();
      localStorage.setItem(`${STORAGE_KEYS.USER_DATA}_${userId}`, JSON.stringify(userData));
      console.log('用户格罗申已更新:', groschen);
    } else {
      console.warn('无法更新格罗申，用户数据不存在');
    }
  } catch (e) {
    console.error('更新格罗申时出错:', e);
  }
};

/**
 * 更新用户拥有的骰子
 */
export const updateUserOwnedDice = (ownedDice: DiceType[]): void => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage 不可用，无法更新拥有的骰子');
    return;
  }

  try {
    const userData = getUserData();
    if (userData) {
      userData.ownedDice = ownedDice;
      const userId = getUserId();
      localStorage.setItem(`${STORAGE_KEYS.USER_DATA}_${userId}`, JSON.stringify(userData));
      console.log('用户拥有的骰子已更新:', ownedDice);
    } else {
      console.warn('无法更新拥有的骰子，用户数据不存在');
    }
  } catch (e) {
    console.error('更新拥有的骰子时出错:', e);
  }
};

/**
 * 更新用户的骰子配置
 */
export const updateUserDiceConfigs = (diceConfigs: PlayerDiceConfig): void => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage 不可用，无法更新骰子配置');
    return;
  }

  try {
    const userData = getUserData();
    if (userData) {
      userData.diceConfigs = diceConfigs;
      const userId = getUserId();
      localStorage.setItem(`${STORAGE_KEYS.USER_DATA}_${userId}`, JSON.stringify(userData));
      console.log('用户骰子配置已更新:', diceConfigs);
    } else {
      console.warn('无法更新骰子配置，用户数据不存在');
      // 如果用户数据不存在，创建一个新的用户数据
      const newUserData: UserData = {
        groschen: 50, // 默认值
        ownedDice: [DiceType.NORMAL], // 默认值
        diceConfigs: diceConfigs
      };
      const userId = getUserId();
      localStorage.setItem(`${STORAGE_KEYS.USER_DATA}_${userId}`, JSON.stringify(newUserData));
      console.log('创建新用户数据并更新骰子配置:', newUserData);
    }
  } catch (e) {
    console.error('更新骰子配置时出错:', e);
  }
};

/**
 * 更新用户的游戏设置
 */
export const updateUserGameSettings = (gameSettings: GameSettings): void => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage 不可用，无法更新游戏设置');
    return;
  }

  try {
    const userData = getUserData();
    if (userData) {
      userData.gameSettings = gameSettings;
      const userId = getUserId();
      localStorage.setItem(`${STORAGE_KEYS.USER_DATA}_${userId}`, JSON.stringify(userData));
      console.log('用户游戏设置已更新:', gameSettings);
    } else {
      console.warn('无法更新游戏设置，用户数据不存在');
      // 如果用户数据不存在，创建一个新的用户数据
      const newUserData: UserData = {
        groschen: 50, // 默认值
        ownedDice: [DiceType.NORMAL], // 默认值
        diceConfigs: { diceConfigs: Array(6).fill(DiceType.NORMAL) }, // 默认值
        gameSettings: gameSettings
      };
      const userId = getUserId();
      localStorage.setItem(`${STORAGE_KEYS.USER_DATA}_${userId}`, JSON.stringify(newUserData));
      console.log('创建新用户数据并更新游戏设置:', newUserData);
    }
  } catch (e) {
    console.error('更新游戏设置时出错:', e);
  }
};

/**
 * 清除用户数据
 */
export const clearUserData = (): void => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage 不可用，无法清除用户数据');
    return;
  }

  try {
    const userId = getUserId();
    localStorage.removeItem(`${STORAGE_KEYS.USER_DATA}_${userId}`);
    console.log('用户数据已清除');
  } catch (e) {
    console.error('清除用户数据时出错:', e);
  }
};

/**
 * 将本地存储的用户数据绑定到注册用户
 * 这个函数将在未来实现用户注册登录功能时使用
 */
export const bindLocalDataToRegisteredUser = (registeredUserId: string): void => {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage 不可用，无法绑定用户数据');
    return;
  }

  try {
    const localUserId = getUserId();
    const userDataString = localStorage.getItem(`${STORAGE_KEYS.USER_DATA}_${localUserId}`);
    
    if (userDataString) {
      // 将本地数据复制到注册用户的存储中
      localStorage.setItem(`${STORAGE_KEYS.USER_DATA}_${registeredUserId}`, userDataString);
      // 更新当前用户ID
      localStorage.setItem(STORAGE_KEYS.USER_ID, registeredUserId);
      console.log('本地数据已绑定到注册用户:', registeredUserId);
    } else {
      console.warn('无法绑定用户数据，本地数据不存在');
    }
  } catch (e) {
    console.error('绑定用户数据时出错:', e);
  }
}; 