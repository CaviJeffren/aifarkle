import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import '../styles/BettingPanel.css';

interface BettingPanelProps {
  playerGroschen: number;
  onPlaceBet: (amount: number) => void;
}

const BettingPanel: React.FC<BettingPanelProps> = ({
  playerGroschen,
  onPlaceBet
}) => {
  const [betAmount, setBetAmount] = useState(10);
  const maxBet = Math.min(playerGroschen, 50);
  
  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= maxBet) {
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
      
      <Form>
        <Form.Group>
          <Form.Label>下注金额 (1-{maxBet})</Form.Label>
          <Row className="align-items-center">
            <Col xs={8}>
              <Form.Range
                min={1}
                max={maxBet}
                value={betAmount}
                onChange={handleBetChange}
                className="kcd-range"
              />
            </Col>
            <Col xs={4}>
              <Form.Control
                type="number"
                min={1}
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
          disabled={betAmount <= 0 || betAmount > playerGroschen}
        >
          确认下注
        </Button>
      </Form>
    </div>
  );
};

export default BettingPanel; 