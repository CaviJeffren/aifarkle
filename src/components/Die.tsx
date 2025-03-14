import React from 'react';
import { DiceType, DICE_DATA } from '../models/DiceModel';
import '../styles/Die.css';

interface DieProps {
  id: number;
  value: number;
  type: DiceType;
  selected: boolean;
  locked: boolean;
  onClick: () => void;
}

const Die: React.FC<DieProps> = ({ value, type, selected, locked, onClick }) => {
  const diceData = DICE_DATA[type];
  
  const style = {
    backgroundColor: diceData.backgroundColor,
    color: diceData.textColor,
    border: selected ? '2px solid #4CAF50' : locked ? '2px solid #f44336' : '2px solid #ccc',
    cursor: locked ? 'not-allowed' : 'pointer',
    opacity: locked ? 0.7 : 1,
    transform: selected ? 'translateY(-8px)' : 'translateY(0)',
    boxShadow: selected 
      ? '0 0 15px #4CAF50, 0 8px 10px rgba(0,0,0,0.3)' 
      : locked 
        ? '0 0 10px #f44336' 
        : '0 2px 5px rgba(0,0,0,0.2)',
  };

  // 点数样式，使用骰子的textColor
  const dotStyle = {
    backgroundColor: diceData.textColor
  };

  const getDieFace = (value: number) => {
    switch (value) {
      case 1:
        return (
          <div className="die-dots">
            <span className="dot center" style={dotStyle}></span>
          </div>
        );
      case 2:
        return (
          <div className="die-dots">
            <span className="dot top-left" style={dotStyle}></span>
            <span className="dot bottom-right" style={dotStyle}></span>
          </div>
        );
      case 3:
        return (
          <div className="die-dots">
            <span className="dot top-left" style={dotStyle}></span>
            <span className="dot center" style={dotStyle}></span>
            <span className="dot bottom-right" style={dotStyle}></span>
          </div>
        );
      case 4:
        return (
          <div className="die-dots">
            <span className="dot top-left" style={dotStyle}></span>
            <span className="dot top-right" style={dotStyle}></span>
            <span className="dot bottom-left" style={dotStyle}></span>
            <span className="dot bottom-right" style={dotStyle}></span>
          </div>
        );
      case 5:
        return (
          <div className="die-dots">
            <span className="dot top-left" style={dotStyle}></span>
            <span className="dot top-right" style={dotStyle}></span>
            <span className="dot center" style={dotStyle}></span>
            <span className="dot bottom-left" style={dotStyle}></span>
            <span className="dot bottom-right" style={dotStyle}></span>
          </div>
        );
      case 6:
        return (
          <div className="die-dots">
            <span className="dot top-left" style={dotStyle}></span>
            <span className="dot top-right" style={dotStyle}></span>
            <span className="dot middle-left" style={dotStyle}></span>
            <span className="dot middle-right" style={dotStyle}></span>
            <span className="dot bottom-left" style={dotStyle}></span>
            <span className="dot bottom-right" style={dotStyle}></span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={`die ${selected ? 'selected' : ''} ${locked ? 'locked' : ''}`}
      onClick={locked ? undefined : onClick}
      style={style}
    >
      {getDieFace(value)}
    </div>
  );
};

export default Die; 