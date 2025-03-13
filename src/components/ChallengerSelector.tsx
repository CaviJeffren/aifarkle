import React, { useState } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { getAllChallengers } from '../models/ChallengerModel';
import '../styles/ChallengerSelector.css';

// 挑战者类型定义
export interface Challenger {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  targetScore: number; // 目标分数
}

interface ChallengerSelectorProps {
  onSelectChallenger: (challenger: Challenger) => void;
  onCancel: () => void;
}

const ChallengerSelector: React.FC<ChallengerSelectorProps> = ({ 
  onSelectChallenger, 
  onCancel 
}) => {
  const [selectedChallengerId, setSelectedChallengerId] = useState<string | null>(null);
  
  // 从挑战者模型中获取所有挑战者数据
  const challengers = getAllChallengers();
  
  const handleSelect = () => {
    const selected = challengers.find(c => c.id === selectedChallengerId);
    if (selected) {
      onSelectChallenger(selected);
    }
  };
  
  return (
    <Container className="challenger-selector">
      <Row className="justify-content-center mb-3">
        <Col md={10} className="text-center">
          <h2 className="challenger-title">选择挑战者</h2>
          <p className="challenger-subtitle">战胜挑战者有机会获得他的特殊骰子奖励！</p>
        </Col>
      </Row>
      
      <Row className="challenger-cards">
        {challengers.map(challenger => (
          <Col md={6} lg={3} key={challenger.id} className="mb-3">
            <Card 
              className={`challenger-card ${selectedChallengerId === challenger.id ? 'selected' : ''}`}
              onClick={() => setSelectedChallengerId(challenger.id)}
            >
              <Card.Body>
                <Card.Title className="challenger-name">{challenger.name}</Card.Title>
                <Card.Text className="challenger-description">
                  {challenger.description}
                </Card.Text>
                <Card.Text className="target-score">
                  <strong>目标分数:</strong> {challenger.targetScore}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      
      <Row className="justify-content-center mt-4">
        <Col md={6} className="text-center action-buttons">
          <Button 
            variant="kcd" 
            className="kcd-button kcd-button-primary challenge-btn"
            onClick={handleSelect}
            disabled={!selectedChallengerId}
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