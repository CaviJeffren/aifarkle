import React, { useState } from 'react';
import { Modal, Button, Card, Row, Col, ListGroup, Alert } from 'react-bootstrap';
import { DiceType, DICE_CONFIGS, PlayerDiceConfig, DICE_PRICES } from '../types';
import '../styles/ModalStyles.css';
import '../styles/DiceSelector.css';

interface DiceSelectorProps {
  show: boolean;
  onHide: () => void;
  currentConfig: PlayerDiceConfig;
  onSave: (config: PlayerDiceConfig) => void;
  ownedDice: DiceType[];
  onSellDice: (diceType: DiceType) => void;
}

const DiceSelector: React.FC<DiceSelectorProps> = ({
  show,
  onHide,
  currentConfig,
  onSave,
  ownedDice,
  onSellDice
}) => {
  const [selectedDice, setSelectedDice] = useState<DiceType[]>(currentConfig.diceConfigs);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [sellMode, setSellMode] = useState<boolean>(false);

  // 计算每种骰子已拥有的数量
  const countOwnedDice = (diceType: DiceType) => {
    return ownedDice.filter(type => type === diceType).length;
  };

  // 计算每种骰子已使用的数量
  const countUsedDice = (diceType: DiceType) => {
    return selectedDice.filter(type => type === diceType).length;
  };

  const handleDiceSelect = (position: number) => {
    setSelectedPosition(position);
    setMessage(null);
  };

  const handleDiceTypeSelect = (type: DiceType) => {
    if (selectedPosition !== null) {
      // 检查玩家是否拥有足够的这种骰子
      const usedCount = countUsedDice(type);
      const ownedCount = countOwnedDice(type);
      
      // 普通骰子不受限制
      if (type !== DiceType.NORMAL && usedCount >= ownedCount) {
        setMessage(`你只拥有 ${ownedCount} 个 ${DICE_CONFIGS[type].name}，已全部使用`);
        return;
      }

      const newConfig = [...selectedDice];
      newConfig[selectedPosition] = type;
      setSelectedDice(newConfig);
      setSelectedPosition(null); // 选择后重置位置
      setMessage(null);
    }
  };

  const handleSave = () => {
    onSave({ diceConfigs: selectedDice });
    onHide();
  };

  const handleSellDice = (diceType: DiceType) => {
    // 检查骰子是否正在使用中
    if (selectedDice.includes(diceType)) {
      setMessage(`无法出售正在使用中的骰子`);
      return;
    }

    // 普通骰子不能出售
    if (diceType === DiceType.NORMAL) {
      setMessage(`普通骰子不能出售`);
      return;
    }

    onSellDice(diceType);
    setMessage(`成功出售 ${DICE_CONFIGS[diceType].name}，获得 ${Math.floor(DICE_PRICES[diceType] * 0.7)} 格罗申`);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" className="kcd-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          {sellMode ? "出售骰子" : "选择骰子"}
          <Button 
            variant="link" 
            className="ml-3" 
            onClick={() => setSellMode(!sellMode)}
            style={{ fontSize: '0.8rem' }}
          >
            切换到{sellMode ? "选择" : "出售"}模式
          </Button>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="dice-selector-body">
        {message && (
          <Alert variant={message.includes('成功') ? 'success' : 'danger'} className="mb-3">
            {message}
          </Alert>
        )}

        {!sellMode ? (
          <>
            <h5 className="mb-3">选择骰子位置</h5>
            <div className="mb-4">
              <Row>
                {selectedDice.slice(0, 3).map((type, index) => (
                  <Col key={index} xs={4} className="mb-3">
                    <Button 
                      variant={selectedPosition === index ? "kcd" : "outline-secondary"} 
                      className={`w-100 position-relative dice-position-btn ${selectedPosition === index ? 'kcd-button' : ''}`}
                      onClick={() => handleDiceSelect(index)}
                    >
                      <div className="d-flex flex-column align-items-center">
                        <div 
                          className="dice-preview mb-2" 
                          style={{ 
                            backgroundColor: DICE_CONFIGS[type].backgroundColor,
                            color: DICE_CONFIGS[type].textColor,
                            width: '35px',
                            height: '35px',
                            borderRadius: '6px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            border: '2px solid #ccc',
                            fontSize: '0.9rem'
                          }}
                        >
                          {index + 1}
                        </div>
                        <div className="dice-name">{DICE_CONFIGS[type].name}</div>
                      </div>
                    </Button>
                  </Col>
                ))}
              </Row>
              <Row>
                {selectedDice.slice(3, 6).map((type, index) => (
                  <Col key={index + 3} xs={4} className="mb-3">
                    <Button 
                      variant={selectedPosition === index + 3 ? "kcd" : "outline-secondary"} 
                      className={`w-100 position-relative dice-position-btn ${selectedPosition === index + 3 ? 'kcd-button' : ''}`}
                      onClick={() => handleDiceSelect(index + 3)}
                    >
                      <div className="d-flex flex-column align-items-center">
                        <div 
                          className="dice-preview mb-2" 
                          style={{ 
                            backgroundColor: DICE_CONFIGS[type].backgroundColor,
                            color: DICE_CONFIGS[type].textColor,
                            width: '35px',
                            height: '35px',
                            borderRadius: '6px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            border: '2px solid #ccc',
                            fontSize: '0.9rem'
                          }}
                        >
                          {index + 4}
                        </div>
                        <div className="dice-name">{DICE_CONFIGS[type].name}</div>
                      </div>
                    </Button>
                  </Col>
                ))}
              </Row>
            </div>

            {selectedPosition !== null && (
              <>
                <h5 className="mb-3">选择骰子类型</h5>
                <ListGroup className="mb-4 dice-type-list">
                  {Object.values(DiceType)
                    .filter(diceType => {
                      // 普通骰子始终可用
                      if (diceType === DiceType.NORMAL) return true;
                      // 其他类型的骰子只有玩家拥有时才显示
                      return countOwnedDice(diceType) > 0;
                    })
                    .map((diceType) => {
                      const usedCount = countUsedDice(diceType);
                      const ownedCount = countOwnedDice(diceType);
                      const isAvailable = diceType === DiceType.NORMAL || usedCount < ownedCount;
                      
                      return (
                        <ListGroup.Item 
                          key={diceType}
                          action
                          active={selectedDice[selectedPosition] === diceType}
                          disabled={!isAvailable}
                          onClick={() => isAvailable && handleDiceTypeSelect(diceType)}
                          className="d-flex justify-content-between align-items-center dice-type-item"
                        >
                          <div className="d-flex align-items-center">
                            <div 
                              style={{ 
                                backgroundColor: DICE_CONFIGS[diceType].backgroundColor,
                                color: DICE_CONFIGS[diceType].textColor,
                                width: '25px',
                                height: '25px',
                                borderRadius: '4px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: '8px',
                                border: '1px solid #ccc',
                                fontSize: '0.8rem'
                              }}
                            >
                              {diceType.includes('KAVIEL') ? diceType.charAt(diceType.length - 1) : '?'}
                            </div>
                            <div>
                              <div className="dice-type-name">{DICE_CONFIGS[diceType].name}</div>
                              <small className="dice-type-desc">{DICE_CONFIGS[diceType].description}</small>
                            </div>
                          </div>
                          <div className="dice-count">
                            <small className="text-muted">
                              已用 {usedCount}/{ownedCount}
                            </small>
                          </div>
                        </ListGroup.Item>
                      );
                    })}
                </ListGroup>
              </>
            )}
          </>
        ) : (
          <>
            <h5 className="mb-3">出售骰子</h5>
            <p className="text-muted small">出售骰子可获得原价的70%格罗申。正在使用中的骰子无法出售。</p>
            <ListGroup className="mb-4 dice-sell-list">
              {Object.values(DiceType)
                .filter(diceType => diceType !== DiceType.NORMAL)
                .map((diceType) => {
                  const ownedCount = countOwnedDice(diceType);
                  const usedCount = countUsedDice(diceType);
                  const availableToSell = ownedCount > usedCount;
                  
                  if (ownedCount === 0) return null;
                  
                  return (
                    <ListGroup.Item 
                      key={diceType}
                      className="d-flex justify-content-between align-items-center dice-sell-item"
                    >
                      <div className="d-flex align-items-center">
                        <div 
                          style={{ 
                            backgroundColor: DICE_CONFIGS[diceType].backgroundColor,
                            color: DICE_CONFIGS[diceType].textColor,
                            width: '25px',
                            height: '25px',
                            borderRadius: '4px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: '8px',
                            border: '1px solid #ccc',
                            fontSize: '0.8rem'
                          }}
                        >
                          {diceType.includes('KAVIEL') ? diceType.charAt(diceType.length - 1) : '?'}
                        </div>
                        <div>
                          <div className="dice-type-name">{DICE_CONFIGS[diceType].name}</div>
                          <small className="text-muted">售价: {Math.floor(DICE_PRICES[diceType] * 0.7)} 格罗申</small>
                          <div>
                            <small className="text-muted">
                              拥有: {ownedCount} 个 (已用 {usedCount} 个)
                            </small>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        disabled={!availableToSell}
                        onClick={() => availableToSell && handleSellDice(diceType)}
                      >
                        {availableToSell ? "出售" : "使用中"}
                      </Button>
                    </ListGroup.Item>
                  );
                }).filter(Boolean)}
            </ListGroup>
          </>
        )}
      </Modal.Body>
      <Modal.Footer className="game-rules-footer">
        {!sellMode && (
          <div className="modal-buttons-container">
            <Button variant="kcd" className="kcd-button kcd-button-primary" onClick={handleSave}>
              保存
            </Button>
            <Button variant="kcd" className="kcd-button" onClick={onHide}>
              取消
            </Button>
          </div>
        )}
        {sellMode && (
          <Button variant="kcd" className="kcd-button" onClick={onHide}>
            关闭
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default DiceSelector; 