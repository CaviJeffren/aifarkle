import React, { useState } from 'react';
import { Modal, Button, ListGroup, Alert } from 'react-bootstrap';
import { DiceType, DICE_CONFIGS, DICE_PRICES } from '../types';
import '../styles/ModalStyles.css';
import GameModal from './GameModal';

interface DiceShopProps {
  show: boolean;
  onHide: () => void;
  playerGroschen: number;
  ownedDice: DiceType[];
  onBuyDice: (diceType: DiceType) => void;
}

const DiceShop: React.FC<DiceShopProps> = ({
  show,
  onHide,
  playerGroschen,
  ownedDice,
  onBuyDice
}) => {
  const [message, setMessage] = useState<string | null>(null);
  const [confirmDice, setConfirmDice] = useState<DiceType | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleBuyClick = (diceType: DiceType) => {
    const price = DICE_PRICES[diceType];
    
    if (playerGroschen < price) {
      setMessage('格罗申不足，无法购买');
      return;
    }
    
    setConfirmDice(diceType);
    setShowConfirm(true);
  };

  const handleConfirmBuy = () => {
    if (!confirmDice) return;
    
    onBuyDice(confirmDice);
    setMessage(`成功购买 ${DICE_CONFIGS[confirmDice].name}`);
    setShowConfirm(false);
    setConfirmDice(null);
  };

  // 过滤掉普通骰子，因为它是免费的
  const shopDice = Object.values(DiceType).filter(type => type !== DiceType.NORMAL);

  // 计算每种骰子已拥有的数量
  const countOwnedDice = (diceType: DiceType) => {
    return ownedDice.filter(type => type === diceType).length;
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" className="kcd-modal">
        <Modal.Header closeButton>
          <Modal.Title>骰子商店</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <h4>可用格罗申: {playerGroschen}</h4>
          </div>
          
          {message && (
            <Alert variant={message.includes('成功') ? 'success' : 'danger'} className="mb-3">
              {message}
            </Alert>
          )}
          
          <h4>可购买的骰子</h4>
          <ListGroup className="mb-4">
            {shopDice.map((diceType) => {
              const ownedCount = countOwnedDice(diceType);
              return (
                <ListGroup.Item 
                  key={diceType}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div className="d-flex align-items-center">
                    <div 
                      style={{ 
                        backgroundColor: DICE_CONFIGS[diceType].backgroundColor,
                        color: DICE_CONFIGS[diceType].textColor,
                        width: '30px',
                        height: '30px',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: '10px',
                        border: '1px solid #ccc'
                      }}
                    >
                      {diceType.includes('KAVIEL') ? diceType.charAt(diceType.length - 1) : '?'}
                    </div>
                    <div>
                      <div className="font-weight-bold">{DICE_CONFIGS[diceType].name}</div>
                      <small className="text-muted">{DICE_CONFIGS[diceType].description}</small>
                      <div>
                        <small>已拥有: {ownedCount} 个</small>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex flex-column align-items-end">
                    <span className="text-primary font-weight-bold">{DICE_PRICES[diceType]} 格罗申</span>
                    <Button 
                      variant="kcd" 
                      size="sm"
                      className="mt-2 kcd-button"
                      onClick={() => handleBuyClick(diceType)}
                      disabled={playerGroschen < DICE_PRICES[diceType]}
                    >
                      购买
                    </Button>
                  </div>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer className="game-rules-footer">
          <Button variant="kcd" className="kcd-button" onClick={onHide}>
            关闭
          </Button>
        </Modal.Footer>
      </Modal>

      <GameModal
        show={showConfirm}
        onHide={() => setShowConfirm(false)}
        title="确认购买"
        content={confirmDice ? `确定要购买 ${DICE_CONFIGS[confirmDice].name} 吗？价格: ${DICE_PRICES[confirmDice]} 格罗申` : ''}
        onConfirm={handleConfirmBuy}
        showConfirmButton={true}
      />
    </>
  );
};

export default DiceShop; 