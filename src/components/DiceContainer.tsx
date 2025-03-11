import React from 'react';
import Die from './Die';
import { GamePhase, Die as DieType } from '../types';
import '../styles/DiceContainer.css';

interface DiceContainerProps {
  dice: DieType[];
  phase: GamePhase;
  onDieClick: (id: number) => void;
}

const DiceContainer: React.FC<DiceContainerProps> = ({ dice, phase, onDieClick }) => {
  const isSelectionPhase = phase === GamePhase.SELECT;
  
  // 只显示未锁定的骰子
  const visibleDice = dice.filter(die => !die.locked);

  return (
    <div className="dice-container">
      {visibleDice.map(die => (
        <Die
          key={die.id}
          id={die.id}
          value={die.value}
          type={die.type}
          selected={die.selected}
          locked={die.locked}
          onClick={() => onDieClick(die.id)}
        />
      ))}
    </div>
  );
};

export default DiceContainer; 