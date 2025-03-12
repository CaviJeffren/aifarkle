import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { DiceType, DICE_DATA, getDiceName } from '../models/DiceModel';
import '../styles/ModalStyles.css';

interface RewardDiceModalProps {
  show: boolean;
  onHide: () => void;
  rewardDice: DiceType | null;
}

const RewardDiceModal: React.FC<RewardDiceModalProps> = ({
  show,
  onHide,
  rewardDice
}) => {
  if (!rewardDice) return null;

  const diceData = DICE_DATA[rewardDice];
  
  return (
    <Modal show={show} onHide={onHide} centered className="kcd-modal">
      <Modal.Header closeButton>
        <Modal.Title>恭喜获得特殊骰子</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <h4 className="mb-4">恭喜你获得了一个特殊骰子！</h4>
        
        <div className="d-flex justify-content-center align-items-center mb-4">
          <div 
            className="reward-dice-container"
            style={{ 
              backgroundColor: diceData.backgroundColor,
              color: diceData.textColor,
              width: '80px',
              height: '80px',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '36px',
              fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              border: '2px solid #ccc'
            }}
          >
            {rewardDice.includes('CAVIER') ? rewardDice.charAt(rewardDice.length - 1) : '?'}
          </div>
        </div>
        
        <h5 className="dice-name mb-3">{getDiceName(rewardDice)}</h5>
        
        <p className="reward-message">
          这个特殊骰子已添加到你的收藏中，可以在骰子选择器中使用。
        </p>
      </Modal.Body>
      <Modal.Footer className="game-modal-footer">
        <Button variant="kcd" className="kcd-button" onClick={onHide}>
          太棒了！
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RewardDiceModal; 