import { useState, useEffect } from 'react';
import { DiceType } from '../models/DiceModel';
import { getUserData } from '../services/LocalStorageService';

export const useUserOwnedDice = () => {
  const [ownedDice, setOwnedDice] = useState<DiceType[]>([]);

  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      setOwnedDice(userData.ownedDice);
    }
  }, []);

  const updateOwnedDice = (newOwnedDice: DiceType[]) => {
    setOwnedDice(newOwnedDice);
  };

  return {
    ownedDice,
    updateOwnedDice
  };
}; 