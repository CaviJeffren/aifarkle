import React from 'react';
import { DiceType, DICE_DATA } from '../models/DiceModel';
import '../styles/MiniDie.css';

interface MiniDieProps {
  id: number;
  value: number;
  type: DiceType;
}

const MiniDie: React.FC<MiniDieProps> = ({ value, type }) => {
  const diceData = DICE_DATA[type];
  
  const style = {
    backgroundColor: diceData.backgroundColor,
    color: diceData.textColor,
    border: '2px solid #ccc',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  };

  // 点数样式，使用骰子的textColor
  const dotStyle = {
    backgroundColor: diceData.textColor
  };

  const getDieFace = (value: number) => {
    switch (value) {
      case 1:
        return (
          <div className="mini-die-dots">
            <span className="mini-dot center" style={dotStyle}></span>
          </div>
        );
      case 2:
        return (
          <div className="mini-die-dots">
            <span className="mini-dot top-left" style={dotStyle}></span>
            <span className="mini-dot bottom-right" style={dotStyle}></span>
          </div>
        );
      case 3:
        return (
          <div className="mini-die-dots">
            <span className="mini-dot top-left" style={dotStyle}></span>
            <span className="mini-dot center" style={dotStyle}></span>
            <span className="mini-dot bottom-right" style={dotStyle}></span>
          </div>
        );
      case 4:
        return (
          <div className="mini-die-dots">
            <span className="mini-dot top-left" style={dotStyle}></span>
            <span className="mini-dot top-right" style={dotStyle}></span>
            <span className="mini-dot bottom-left" style={dotStyle}></span>
            <span className="mini-dot bottom-right" style={dotStyle}></span>
          </div>
        );
      case 5:
        return (
          <div className="mini-die-dots">
            <span className="mini-dot top-left" style={dotStyle}></span>
            <span className="mini-dot top-right" style={dotStyle}></span>
            <span className="mini-dot center" style={dotStyle}></span>
            <span className="mini-dot bottom-left" style={dotStyle}></span>
            <span className="mini-dot bottom-right" style={dotStyle}></span>
          </div>
        );
      case 6:
        return (
          <div className="mini-die-dots">
            <span className="mini-dot top-left" style={dotStyle}></span>
            <span className="mini-dot top-right" style={dotStyle}></span>
            <span className="mini-dot middle-left" style={dotStyle}></span>
            <span className="mini-dot middle-right" style={dotStyle}></span>
            <span className="mini-dot bottom-left" style={dotStyle}></span>
            <span className="mini-dot bottom-right" style={dotStyle}></span>
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