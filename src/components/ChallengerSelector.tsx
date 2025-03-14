import React, { useState } from 'react';
import { Container, Row, Col, Button, Card, Badge } from 'react-bootstrap';
import { getAllChallengers, getChallengerBetAmount } from '../models/ChallengerModel';
import '../styles/ChallengerSelector.css';

// 挑战者类型定义
export interface Challenger {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  targetScore: number; // 目标分数
  betAmount?: number; // 下注金额
}

interface ChallengerSelectorProps {
  onSelectChallenger: (challenger: Challenger) => void;
  onCancel: () => void;
  playerGroschen: number; // 玩家当前的格罗申数量
}

const ChallengerSelector: React.FC<ChallengerSelectorProps> = ({ 
  onSelectChallenger, 
  onCancel,
  playerGroschen
}) => {
  const [selectedChallengerId, setSelectedChallengerId] = useState<string | null>(null);
  
  // 从挑战者模型中获取所有挑战者数据
  const challengers = getAllChallengers().map(challenger => ({
    ...challenger,
    betAmount: getChallengerBetAmount(challenger.id)
  }));
  
  const handleSelect = () => {
    const selected = challengers.find(c => c.id === selectedChallengerId);
    if (selected) {
      onSelectChallenger(selected);
    }
  };

  // 检查是否有足够的格罗申挑战
  const canChallenge = (betAmount: number) => {
    return playerGroschen >= betAmount;
  };
  
  // 获取选中的挑战者
  const selectedChallenger = challengers.find(c => c.id === selectedChallengerId);
  
  return (
    <Container className="challenger-selector">
      <Row className="justify-content-center mb-3">
        <Col md={10} className="text-center">
          <h2 className="challenger-title">选择挑战者</h2>
          <p className="challenger-subtitle">战胜挑战者除了能赢得下注金额外，还有机会获得他的特殊骰子作为奖励！</p>
          <p className="challenger-subtitle">你当前的格罗申: <Badge bg="warning" text="dark">{playerGroschen}</Badge></p>
        </Col>
      </Row>
      
      <Row className="challenger-cards">
        {challengers.map(challenger => {
          const hasEnoughGroschen = canChallenge(challenger.betAmount || 0);
          
          return (
            <Col md={6} lg={3} key={challenger.id} className="mb-3">
              <Card 
                className={`challenger-card ${selectedChallengerId === challenger.id ? 'selected' : ''} ${!hasEnoughGroschen ? 'disabled' : ''}`}
                onClick={() => hasEnoughGroschen && setSelectedChallengerId(challenger.id)}
              >
                <Card.Body>
                  <Card.Title className="challenger-name">{challenger.name}</Card.Title>
                  <Card.Text className="challenger-description">
                    {challenger.description}
                  </Card.Text>
                  <div className="challenger-info-row">
                    <Card.Text className="target-score">
                      <strong>目标分数:</strong> {challenger.targetScore}
                    </Card.Text>
                    <Card.Text className="bet-amount">
                      <strong>下注金额:</strong> <Badge bg={hasEnoughGroschen ? "success" : "danger"}>{challenger.betAmount}</Badge>
                    </Card.Text>
                  </div>
                  {!hasEnoughGroschen && (
                    <Card.Text className="insufficient-funds text-danger">
                      格罗申不足!
                    </Card.Text>
                  )}
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
      
      <Row className="justify-content-center mt-4">
        <Col md={6} className="text-center action-buttons">
          <Button 
            variant="kcd" 
            className="kcd-button kcd-button-primary challenge-btn"
            onClick={handleSelect}
            disabled={!selectedChallengerId || !selectedChallenger || !canChallenge(selectedChallenger.betAmount || 0)}
          >
            开始挑战
          </Button>
          <Button 
            variant="kcd" 
            className="kcd-button return-btn"
            onClick={onCancel}
          >
            返回
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default ChallengerSelector; 