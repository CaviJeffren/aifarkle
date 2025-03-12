import React, { useState } from 'react';
import { Modal, Button, ListGroup, Alert, Nav, Tab } from 'react-bootstrap';
import { 
  DiceType, 
  DICE_DATA, 
  getDiceName, 
  getDiceDescription, 
  getDicePrice, 
  isDicePurchasable,
  getDiceMaxOwned,
  getDiceSellPrice,
  isDiceSellable
} from '../models/DiceModel';
import '../styles/ModalStyles.css';
import GameModal from './GameModal';
import { updateUserGroschen, updateUserOwnedDice } from '../services/LocalStorageService';

interface DiceShopProps {
  show: boolean;
  onHide: () => void;
  playerGroschen: number;
  ownedDice: DiceType[];
  onBuyDice: (diceType: DiceType) => void;
  onSellDice: (diceType: DiceType) => void;
  currentConfig?: { diceConfigs: DiceType[] };
}

const DiceShop: React.FC<DiceShopProps> = ({
  show,
  onHide,
  playerGroschen,
  ownedDice,
  onBuyDice,
  onSellDice,
  currentConfig = { diceConfigs: [] }
}) => {
  const [message, setMessage] = useState<string | null>(null);
  const [confirmDice, setConfirmDice] = useState<DiceType | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'buy' | 'sell'>('buy');
  const [activeTab, setActiveTab] = useState<string>('buy');

  const handleBuyClick = (diceType: DiceType) => {
    const price = getDicePrice(diceType);
    const ownedCount = countOwnedDice(diceType);
    const maxOwned = getDiceMaxOwned(diceType);
    
    if (playerGroschen < price) {
      setMessage('格罗申不足，无法购买');
      return;
    }
    
    if (ownedCount >= maxOwned) {
      setMessage(`已达到 ${getDiceName(diceType)} 的最大拥有数量 (${maxOwned})`);
      return;
    }
    
    setConfirmDice(diceType);
    setConfirmAction('buy');
    setShowConfirm(true);
  };

  const handleSellClick = (diceType: DiceType) => {
    // 检查骰子是否正在使用中
    const usedCount = currentConfig.diceConfigs.filter(d => d === diceType).length;
    const ownedCount = ownedDice.filter(d => d === diceType).length;
    
    if (ownedCount <= usedCount) {
      setMessage(`无法出售正在使用中的骰子`);
      return;
    }
    
    setConfirmDice(diceType);
    setConfirmAction('sell');
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (!confirmDice) return;
    
    if (confirmAction === 'buy') {
      onBuyDice(confirmDice);
      
      // 更新本地存储
      const price = getDicePrice(confirmDice);
      updateUserGroschen(playerGroschen - price);
      updateUserOwnedDice([...ownedDice, confirmDice]);
      
      setMessage(`成功购买 ${getDiceName(confirmDice)}`);
    } else {
      onSellDice(confirmDice);
      setMessage(`成功出售 ${getDiceName(confirmDice)}，获得 ${getDiceSellPrice(confirmDice)} 格罗申`);
    }
    
    setShowConfirm(false);
    setConfirmDice(null);
  };

  // 过滤掉不可购买的骰子
  const shopDice = Object.values(DiceType).filter(type => 
    type !== DiceType.NORMAL && isDicePurchasable(type)
  );

  // 过滤可出售的骰子
  const sellableDice = Object.values(DiceType).filter(type => 
    type !== DiceType.NORMAL && 
    isDiceSellable(type) && 
    ownedDice.includes(type)
  );

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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Tab.Container id="shop-tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'buy')}>
              <Nav variant="tabs" className="mb-3">
                <Nav.Item>
                  <Nav.Link eventKey="buy">购买骰子</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="sell">出售骰子</Nav.Link>
                </Nav.Item>
              </Nav>
              <div className="ml-auto">
                <span style={{ fontSize: '0.9rem', color: '#666' }}>可用格罗申: <strong>{playerGroschen}</strong></span>
              </div>
            </Tab.Container>
          </div>
          
          {message && (
            <Alert variant={message.includes('成功') ? 'success' : 'danger'} className="mb-3">
              {message}
            </Alert>
          )}
          
          <Tab.Content>
            <Tab.Pane eventKey="buy" active={activeTab === 'buy'}>
              <ListGroup className="mb-4">
                {shopDice.map((diceType) => {
                  const ownedCount = countOwnedDice(diceType);
                  const maxOwned = getDiceMaxOwned(diceType);
                  const isMaxReached = ownedCount >= maxOwned;
                  
                  return (
                    <ListGroup.Item 
                      key={diceType}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div className="d-flex align-items-center">
                        <div 
                          style={{ 
                            backgroundColor: DICE_DATA[diceType].backgroundColor,
                            color: DICE_DATA[diceType].textColor,
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
                          {diceType.includes('CAVIER') ? diceType.charAt(diceType.length - 1) : '?'}
                        </div>
                        <div>
                          <div className="font-weight-bold">{getDiceName(diceType)}</div>
                          <small className="text-muted">{getDiceDescription(diceType)}</small>
                          <div>
                            <small>已拥有: {ownedCount}/{maxOwned} 个</small>
                            {isMaxReached && <small className="text-danger ml-2">（已达上限）</small>}
                          </div>
                        </div>
                      </div>
                      <div className="d-flex flex-column align-items-end">
                        <span className="text-primary font-weight-bold">{getDicePrice(diceType)} 格罗申</span>
                        <Button 
                          variant="kcd" 
                          size="sm"
                          className="mt-2 kcd-button"
                          onClick={() => handleBuyClick(diceType)}
                          disabled={playerGroschen < getDicePrice(diceType) || isMaxReached}
                        >
                          {isMaxReached ? '已达上限' : '购买'}
                        </Button>
                      </div>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            </Tab.Pane>
            
            <Tab.Pane eventKey="sell" active={activeTab === 'sell'}>
              <p className="text-muted small mb-3">出售骰子可获得原价的70%格罗申。正在使用中的骰子无法出售。</p>
              <ListGroup className="mb-4">
                {sellableDice.map((diceType) => {
                  const count = ownedDice.filter(d => d === diceType).length;
                  const usedCount = currentConfig.diceConfigs.filter(d => d === diceType).length;
                  
                  // 如果玩家没有这种骰子，不显示
                  if (count === 0) return null;
                  
                  return (
                    <ListGroup.Item 
                      key={diceType}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div className="d-flex align-items-center">
                        <div 
                          style={{ 
                            backgroundColor: DICE_DATA[diceType].backgroundColor,
                            color: DICE_DATA[diceType].textColor,
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
                          {diceType.includes('CAVIER') ? diceType.charAt(diceType.length - 1) : '?'}
                        </div>
                        <div>
                          <div className="font-weight-bold">{getDiceName(diceType)}</div>
                          <small className="text-muted">{getDiceDescription(diceType)}</small>
                          <div>
                            <small>拥有: {count} 个 (已用 {usedCount} 个)</small>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex flex-column align-items-end">
                        <span className="text-success font-weight-bold">{getDiceSellPrice(diceType)} 格罗申</span>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          className="mt-2"
                          disabled={count <= usedCount}
                          onClick={() => count > usedCount && handleSellClick(diceType)}
                        >
                          {count > usedCount ? "出售" : "使用中"}
                        </Button>
                      </div>
                    </ListGroup.Item>
                  );
                })}
                {sellableDice.length === 0 && (
                  <Alert variant="info">
                    您没有可出售的骰子
                  </Alert>
                )}
              </ListGroup>
            </Tab.Pane>
          </Tab.Content>
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
        title={confirmAction === 'buy' ? "确认购买" : "确认出售"}
        content={confirmDice ? 
          confirmAction === 'buy' ? 
            `确定要购买 ${getDiceName(confirmDice)} 吗？价格: ${getDicePrice(confirmDice)} 格罗申` : 
            `确定要出售 ${getDiceName(confirmDice)} 吗？您将获得 ${getDiceSellPrice(confirmDice)} 格罗申。`
          : ''
        }
        onConfirm={handleConfirm}
        showConfirmButton={true}
      />
    </>
  );
};

export default DiceShop; 