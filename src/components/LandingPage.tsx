import React, { useState } from 'react';
import { Container, Row, Col, Button, Image } from 'react-bootstrap';
import GameRules from './GameRules';
import GameSettings from './GameSettings';
import BettingPanel from './BettingPanel';
import ChallengerSelector, { Challenger } from './ChallengerSelector';
import { GameSettings as GameSettingsType } from '../types';
import '../styles/LandingPage.css';
import diceIcon from '../assets/dice-coin.png';

interface LandingPageProps {
  onStartGame: () => void;
  onSaveSettings: (settings: GameSettingsType) => void;
  onPlaceBet: (amount: number) => void;
  initialSettings: GameSettingsType;
  playerGroschen: number;
  onOpenDiceSelector: () => void;
  onOpenDiceShop: () => void;
  onStartChallengerGame?: (challenger: Challenger) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onStartGame,
  onSaveSettings,
  onPlaceBet,
  initialSettings,
  playerGroschen,
  onOpenDiceSelector,
  onOpenDiceShop,
  onStartChallengerGame
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showBetting, setShowBetting] = useState(false);
  const [showChallengerSelector, setShowChallengerSelector] = useState(false);
  const [settings, setSettings] = useState<GameSettingsType>(initialSettings);
  
  const handleStartClick = () => {
    setShowBetting(true);
  };
  
  const handlePlaceBet = (amount: number) => {
    onPlaceBet(amount);
    setShowBetting(false);
    onStartGame();
  };
  
  const handleSaveSettings = (newSettings: GameSettingsType) => {
    setSettings(newSettings);
    onSaveSettings(newSettings);
  };
  
  const handleChallengerClick = () => {
    setShowChallengerSelector(true);
  };
  
  const handleSelectChallenger = (challenger: Challenger) => {
    if (onStartChallengerGame) {
      onStartChallengerGame(challenger);
    }
    setShowChallengerSelector(false);
  };
  
  return (
    <Container className="landing-page">
      <Row className="justify-content-center">
        <Col md={8} className="text-center">
          <div className="landing-header">
            <div className="game-title-container">
              <Image 
                src={diceIcon} 
                alt="骰子金币" 
                className="dice-coin-icon" 
                width={80} 
                height={80}
              />
              <h1 className="game-title">天国骰子</h1>
            </div>
          </div>
          
          <div className="groschen-display landing-groschen">
            <p>玩家余额: <span className="groschen-amount">{playerGroschen}</span> 格罗申</p>
          </div>
          
          {showChallengerSelector ? (
            <ChallengerSelector 
              onSelectChallenger={handleSelectChallenger}
              onCancel={() => setShowChallengerSelector(false)}
            />
          ) : !showBetting ? (
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
                className="kcd-button kcd-button-secondary landing-button"
                onClick={handleChallengerClick}
              >
                挑战者
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
              <BettingPanel
                playerGroschen={playerGroschen}
                onPlaceBet={handlePlaceBet}
                computerDifficulty={settings.computerDifficulty}
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
        onSave={handleSaveSettings}
        initialSettings={settings}
      />
    </Container>
  );
};

export default LandingPage; 