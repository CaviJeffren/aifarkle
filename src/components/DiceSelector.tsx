import React, { useState, useEffect } from 'react';
import { Modal, Button, Card, Row, Col, ListGroup, Alert, Tabs, Tab } from 'react-bootstrap';
import { PlayerDiceConfig } from '../types';
import { 
  DiceType, 
  DICE_DATA, 
  getDiceName, 
  getDiceDescription, 
  getDicePrice, 
  getDiceSellPrice,
  isDiceSellable
} from '../models/DiceModel';
import '../styles/ModalStyles.css';
import '../styles/DiceSelector.css';
import { updateUserDiceConfigs } from '../services/LocalStorageService';
import GameModal from './GameModal';
import { DiceCollection } from './DiceCollection';

interface DiceSelectorProps {
  show: boolean;
  onHide: () => void;
  currentConfig: PlayerDiceConfig;
  onSave: (config: PlayerDiceConfig) => void;
  ownedDice: DiceType[];
}

const DiceSelector: React.FC<DiceSelectorProps> = ({
  show,
  onHide,
  currentConfig,
  onSave,
  ownedDice
}) => {
  const [selectedDice, setSelectedDice] = useState<DiceType[]>(currentConfig.diceConfigs);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('selector');

  // 当 currentConfig 变化时更新 selectedDice
  useEffect(() => {
    setSelectedDice(currentConfig.diceConfigs);
  }, [currentConfig]);

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
        setMessage(`你只拥有 ${ownedCount} 个 ${getDiceName(type)}，已全部使用`);
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
    const newConfig = { diceConfigs: selectedDice };
    onSave(newConfig);
    // 保存到本地存储
    updateUserDiceConfigs(newConfig);
    console.log('骰子配置已保存到本地存储:', newConfig);
    onHide();
  };

  const handleCancel = () => {
    // 取消时恢复原始配置
    setSelectedDice(currentConfig.diceConfigs);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleCancel} size="lg" className="kcd-modal">
      <Modal.Header closeButton>
        <Modal.Title>骰子收藏</Modal.Title>
      </Modal.Header>
      <Modal.Body className="dice-selector-body">
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => k && setActiveTab(k)}
          className="mb-4 kcd-tabs"
        >
          <Tab eventKey="selector" title="选择骰子">
            {message && (
              <Alert variant={message.includes('成功') ? 'success' : 'danger'} className="mb-3">
                {message}
              </Alert>
            )}

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
                            backgroundColor: DICE_DATA[type].backgroundColor,
                            color: DICE_DATA[type].textColor,
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
                        <div className="dice-name">{getDiceName(type)}</div>
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
                            backgroundColor: DICE_DATA[type].backgroundColor,
                            color: DICE_DATA[type].textColor,
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
                        <div className="dice-name">{getDiceName(type)}</div>
                      </div>
                    </Button>
                  </Col>
                ))}
              </Row>
            </div>

            {selectedPosition !== null && (
              <>
                <h5 className="mb-3">选择骰子组合</h5>
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
                                backgroundColor: DICE_DATA[diceType].backgroundColor,
                                color: DICE_DATA[diceType].textColor,
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
                              {diceType.includes('CAVIER') ? diceType.charAt(diceType.length - 1) : '?'}
                            </div>
                            <div>
                              <div className="dice-type-name">{getDiceName(diceType)}</div>
                              <small className="dice-type-desc">{getDiceDescription(diceType)}</small>
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
          </Tab>
          <Tab eventKey="collection" title="骰子收藏">
            <DiceCollection />
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer className="game-rules-footer">
        <div className="modal-buttons-container">
          {activeTab === 'selector' && (
            <>
              <Button variant="kcd" className="kcd-button kcd-button-primary" onClick={handleSave}>
                保存
              </Button>
              <Button variant="kcd" className="kcd-button" onClick={handleCancel}>
                取消
              </Button>
            </>
          )}
          {activeTab === 'collection' && (
            <Button variant="kcd" className="kcd-button" onClick={handleCancel}>
              关闭
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default DiceSelector; 