import React from 'react';
import { Player } from '../types';
import '../styles/ScoreBoard.css';

interface ScoreBoardProps {
  players: Player[];
  currentPlayerIndex: number;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ 
  players, 
  currentPlayerIndex
}) => {
  return (
    <div className="score-board">
      <h2>分数</h2>
      <div className="scores">
        {players.map((player, index) => (
          <div 
            key={index} 
            className={`player-score ${index === currentPlayerIndex ? 'current' : ''}`}
          >
            <div className="player-name">
              {player.name} {player.isComputer && '(电脑)'}
              {index === currentPlayerIndex && <span className="current-indicator">当前回合</span>}
            </div>
            <div className="score">{player.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreBoard; 