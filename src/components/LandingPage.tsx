import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import GameRules from './GameRules';
import GameSettings from './GameSettings';
import BettingPanel from './BettingPanel';
import { GameSettings as GameSettingsType } from '../types';
import '../styles/LandingPage.css';

interface LandingPageProps {
  onStartGame: () => void;
  onSaveSettings: (settings: GameSettingsType) => void;
  onPlaceBet: (amount: number) => void;
  initialSettings: GameSettingsType;
  playerGroschen: number;
  onOpenDiceSelector: () => void;
  onOpenDiceShop: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onStartGame,
  onSaveSettings,
  onPlaceBet,
  initialSettings,
  playerGroschen,
  onOpenDiceSelector,
  onOpenDiceShop
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showBetting, setShowBetting] = useState(false);
  
  const handleStartClick = () => {
    setShowBetting(true);
  };
  
  const handlePlaceBet = (amount: number) => {
    onPlaceBet(amount);
    setShowBetting(false);
    onStartGame();
  };
  
  return (
    <Container className="landing-page">
      <Row className="justify-content-center">
        <Col md={8} className="text-center">
          <div className="landing-header">
            <h1>天国骰子</h1>
          </div>
          
          <div className="groschen-display landing-groschen">
            <p>玩家余额: <span className="groschen-amount">{playerGroschen}</span> 格罗申</p>
          </div>
          
          {!showBetting ? (
            <div className="landing-buttons">
              <Button 
                variant="kcd" 
                className="kcd-button kcd-button-primary landing-button"
                onClick={handleStartClick}
              >
                开始游戏
              </Button>
              
              <Button 
                variant="kcd" 
                className="kcd-button landing-button"
                onClick={onOpenDiceSelector}
              >
                选择骰子
              </Button>
              
              <Button 
                variant="kcd" 
                className="kcd-button landing-button"
                onClick={onOpenDiceShop}
              >
                骰子商店
              </Button>
              
              <Button 
                variant="kcd" 
                className="kcd-button landing-button"
                onClick={() => setShowSettings(true)}
              >
                游戏设置
              </Button>
              
              <GameRules />
            </div>
          ) : (
            <div className="betting-container">
              <h3>请选择下注金额</h3>
              <BettingPanel
                playerGroschen={playerGroschen}
                onPlaceBet={handlePlaceBet}
              />
              <Button 
                variant="kcd" 
                className="kcd-button mt-3"
                onClick={() => setShowBetting(false)}
              >
                返回
              </Button>
            </div>
          )}
        </Col>
      </Row>
      
      <GameSettings
        show={showSettings}
        onHide={() => setShowSettings(false)}
        onSave={onSaveSettings}
        initialSettings={initialSettings}
      />
    </Container>
  );
};

export default LandingPage; 