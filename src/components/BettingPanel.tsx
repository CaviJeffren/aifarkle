import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import '../styles/BettingPanel.css';

interface BettingPanelProps {
  playerGroschen: number;
  onPlaceBet: (amount: number) => void;
  computerDifficulty: 'easy' | 'medium' | 'hard';
}

// 根据电脑难度设置下注上限
const getDifficultyMaxBet = (difficulty: string): number => {
  switch (difficulty) {
    case 'easy':
      return 15;
    case 'medium':
      return 40;
    case 'hard':
      return 100;
    default:
      return 50;
  }
};

const BettingPanel: React.FC<BettingPanelProps> = ({
  playerGroschen,
  onPlaceBet,
  computerDifficulty
}) => {
  const difficultyMaxBet = getDifficultyMaxBet(computerDifficulty);
  const [betAmount, setBetAmount] = useState(Math.min(10, difficultyMaxBet, playerGroschen));
  const maxBet = Math.min(playerGroschen, difficultyMaxBet);
  
  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= maxBet) {
      setBetAmount(value);
    }
  };
  
  const handlePlaceBet = () => {
    onPlaceBet(betAmount);
  };
  
  return (
    <div className="betting-panel">
      <h3>下注</h3>
      <p>当前格罗申: {playerGroschen}</p>
      <p className="text-muted small">
        {computerDifficulty === 'easy' ? '简单模式' : computerDifficulty === 'medium' ? '中等模式' : '困难模式'}
        下注上限: {difficultyMaxBet} 格罗申
      </p>
      
      <Form>
        <Form.Group>
          <Form.Label>下注金额 (0-{maxBet})</Form.Label>
          <Row className="align-items-center">
            <Col xs={8}>
              <Form.Range
                min={0}
                max={maxBet}
                value={betAmount}
                onChange={handleBetChange}
                className="kcd-range"
              />
            </Col>
            <Col xs={4}>
              <Form.Control
                type="number"
                min={0}
                max={maxBet}
                value={betAmount}
                onChange={handleBetChange}
                className="kcd-input"
              />
            </Col>
          </Row>
        </Form.Group>
        
        <Button 
          variant="kcd" 
          className="kcd-button kcd-button-primary mt-3"
          onClick={handlePlaceBet}
          disabled={betAmount < 0 || betAmount > playerGroschen}
        >
          确认下注
        </Button>
      </Form>
    </div>
  );
};

export default BettingPanel; 