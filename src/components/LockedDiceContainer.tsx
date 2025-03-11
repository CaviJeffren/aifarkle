import React from 'react';
import { Die as DieType } from '../types';
import MiniDie from './MiniDie';
import '../styles/LockedDiceContainer.css';

interface LockedDiceContainerProps {
  dice: DieType[];
}

const LockedDiceContainer: React.FC<LockedDiceContainerProps> = ({ dice }) => {
  // 过滤出已锁定的骰子
  const lockedDice = dice.filter(die => die.locked);

  return (
    <div className="locked-dice-container">
      <div className="locked-dice-area">
        {lockedDice.map(die => (
          <MiniDie
            key={die.id}
            id={die.id}
            value={die.value}
            type={die.type}
          />
        ))}
      </div>
    </div>
  );
};

export default LockedDiceContainer; 