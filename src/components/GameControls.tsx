import React from 'react';
import { Button } from 'react-bootstrap';
import { GamePhase } from '../types';
import '../styles/GameControls.css';

interface GameControlsProps {
  phase: GamePhase;
  onRoll: () => void;
  onBank: () => void;
  onNewGame: () => void;
  selectionScore: number;
  isSelectionValid: boolean;
  isComputerTurn: boolean;
  hasSelectedDice: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  phase,
  onRoll,
  onBank,
  onNewGame,
  selectionScore,
  isSelectionValid,
  isComputerTurn,
  hasSelectedDice
}) => {
  // 对方回合时显示提示文字
  if (isComputerTurn && (phase === GamePhase.ROLL || phase === GamePhase.SELECT || phase === GamePhase.END_TURN)) {
    return (
      <div className="game-controls">
        <div className="computer-turn-message">
          <div className="message-content">
            <div className="spinner"></div>
            <span>对手正在行动...</span>
          </div>
        </div>
      </div>
    );
  }

  const renderControls = () => {
    switch (phase) {
      case GamePhase.START:
        return (
          <Button variant="kcd" className="kcd-button kcd-button-primary" onClick={onNewGame}>
            开始游戏
          </Button>
        );
      case GamePhase.ROLL:
        return (
          <Button 
            variant="kcd" 
            className="kcd-button"
            onClick={onRoll}
          >
            掷骰子
          </Button>
        );
      case GamePhase.SELECT:
        return (
          <div className="selection-controls">
            <div className="buttons">
              <Button 
                variant="kcd" 
                className="kcd-button"
                onClick={onRoll}
                disabled={!hasSelectedDice || !isSelectionValid}
              >
                锁定并重掷
              </Button>
              <Button 
                variant="kcd" 
                className="kcd-button kcd-button-primary"
                onClick={onBank}
                disabled={!hasSelectedDice || !isSelectionValid}
              >
                锁定并结束回合
              </Button>
            </div>
          </div>
        );
      case GamePhase.END_TURN:
        return (
          <Button 
            variant="kcd" 
            className="kcd-button"
            onClick={onRoll}
          >
            结束回合
          </Button>
        );
      case GamePhase.GAME_OVER:
        return (
          <Button variant="kcd" className="kcd-button kcd-button-primary" onClick={onNewGame}>
            再来一局
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="game-controls">
      {renderControls()}
    </div>
  );
};

export default GameControls; 