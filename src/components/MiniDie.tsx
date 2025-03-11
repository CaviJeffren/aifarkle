import React from 'react';
import { DICE_CONFIGS, DiceType } from '../types';
import '../styles/MiniDie.css';

interface MiniDieProps {
  id: number;
  value: number;
  type: DiceType;
}

const MiniDie: React.FC<MiniDieProps> = ({ value, type }) => {
  const diceConfig = DICE_CONFIGS[type];
  
  const style = {
    backgroundColor: diceConfig.backgroundColor,
    color: diceConfig.textColor,
    border: '2px solid #ccc',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  };

  const getDieFace = (value: number) => {
    switch (value) {
      case 1:
        return (
          <div className="mini-die-dots">
            <span className="mini-dot center"></span>
          </div>
        );
      case 2:
        return (
          <div className="mini-die-dots">
            <span className="mini-dot top-left"></span>
            <span className="mini-dot bottom-right"></span>
          </div>
        );
      case 3:
        return (
          <div className="mini-die-dots">
            <span className="mini-dot top-left"></span>
            <span className="mini-dot center"></span>
            <span className="mini-dot bottom-right"></span>
          </div>
        );
      case 4:
        return (
          <div className="mini-die-dots">
            <span className="mini-dot top-left"></span>
            <span className="mini-dot top-right"></span>
            <span className="mini-dot bottom-left"></span>
            <span className="mini-dot bottom-right"></span>
          </div>
        );
      case 5:
        return (
          <div className="mini-die-dots">
            <span className="mini-dot top-left"></span>
            <span className="mini-dot top-right"></span>
            <span className="mini-dot center"></span>
            <span className="mini-dot bottom-left"></span>
            <span className="mini-dot bottom-right"></span>
          </div>
        );
      case 6:
        return (
          <div className="mini-die-dots">
            <span className="mini-dot top-left"></span>
            <span className="mini-dot top-right"></span>
            <span className="mini-dot middle-left"></span>
            <span className="mini-dot middle-right"></span>
            <span className="mini-dot bottom-left"></span>
            <span className="mini-dot bottom-right"></span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="mini-die"
      style={style}
    >
      {getDieFace(value)}
    </div>
  );
};

export default MiniDie; 