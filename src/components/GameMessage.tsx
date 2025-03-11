import React from 'react';
import { Alert } from 'react-bootstrap';
import '../styles/GameMessage.css';

interface GameMessageProps {
  message: string;
}

const GameMessage: React.FC<GameMessageProps> = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="game-message">
      <Alert variant="info">
        {message}
      </Alert>
    </div>
  );
};

export default GameMessage; 