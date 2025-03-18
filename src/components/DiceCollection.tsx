import React, { useState } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { DiceSet, DICE_SETS } from '../models/DiceSetsConfig';
import { DiceType, DICE_DATA, getDiceName, getDiceMaxOwned } from '../models/DiceModel';
import { useUserOwnedDice } from '../hooks/useUserOwnedDice';
import './DiceCollection.css';

interface DiceSetDetailProps {
  diceSet: DiceSet;
  ownedDices: DiceType[];
  onBack: () => void;
}

const DiceSetDetail: React.FC<DiceSetDetailProps> = ({ diceSet, ownedDices, onBack }) => {
  const [selectedDice, setSelectedDice] = useState<DiceType | null>(null);
  
  // 修改完成逻辑：检查每个骰子类型在ownedDices中的数量是否大于等于在diceSet.dices中的数量
  const isComplete = diceSet.dices.every(diceType => {
    // 计算该类型在diceSet中需要的数量
    const requiredCount = diceSet.dices.filter(d => d === diceType).length;
    // 计算玩家拥有该类型的数量
    const ownedCount = ownedDices.filter(d => d === diceType).length;
    // 只有当玩家拥有的数量大于等于需要的数量时才返回true
    return ownedCount >= requiredCount;
  });

  const handleDiceClick = (dice: DiceType) => {
    if (isComplete && ownedDices.includes(dice)) {
      setSelectedDice(selectedDice === dice ? null : dice);
    }
  };

  // 获取骰子显示内容
  const getDiceDisplay = (dice: DiceType) => {
    if (dice.includes('CAVIER')) {
      return dice.charAt(dice.length - 1);
    }
    
    // 检查是否有100%概率的点数
    const probabilities = DICE_DATA[dice].probabilities;
    for (const [point, prob] of Object.entries(probabilities)) {
      if (prob === 1) {
        return point;
      }
    }
    
    return '?';
  };

  return (
    <div className="dice-set-detail">
      <div className="dice-set-detail-header">
        <h4>{diceSet.name}</h4>
      </div>
      <p className="dice-set-description">{diceSet.description}</p>
      
      <Card className={`dice-set-card ${isComplete ? 'completed' : ''}`}>
        <Card.Body>
          <div className="dice-set-grid">
            {diceSet.dices.map((dice, index) => {
              // 计算该类型已经显示的骰子数量
              const diceType = dice;
              const displayedCount = diceSet.dices.slice(0, index).filter(d => d === diceType).length;
              const ownedCount = ownedDices.filter(d => d === diceType).length;
              // 只有当已显示数量小于拥有数量时，才显示为拥有状态
              const isOwned = displayedCount < ownedCount;
              
              return (
                <div key={index} className="dice-item">
                  <div 
                    className={`detail-dice-slot ${isOwned ? 'owned' : ''} ${selectedDice === dice ? 'selected' : ''}`}
                    style={{ 
                      backgroundColor: isOwned ? DICE_DATA[dice].backgroundColor : 'rgba(0, 0, 0, 0.1)',
                      color: isOwned ? DICE_DATA[dice].textColor : 'var(--kcd-wood-dark)',
                      border: `2px solid ${isOwned ? DICE_DATA[dice].backgroundColor : 'var(--kcd-wood-light)'}`,
                      cursor: isComplete && isOwned ? 'pointer' : 'default'
                    }}
                    onClick={() => handleDiceClick(dice)}
                  >
                    {isOwned ? getDiceDisplay(dice) : '?'}
                  </div>
                  <div className={`dice-name-label ${isOwned ? 'owned' : 'not-owned'}`}>
                    {isOwned ? getDiceName(dice) : '待收集'}
                  </div>
                </div>
              );
            })}
          </div>
          {isComplete && selectedDice && (
            <div className="probability-info">
              <h6>{getDiceName(selectedDice)}的点数概率：</h6>
              <div className="probability-grid">
                {Object.entries(DICE_DATA[selectedDice].probabilities).map(([number, prob]) => (
                  <div key={number} className="probability-item">
                    {number}点: {(prob * 100).toFixed(1)}%
                  </div>
                ))}
              </div>
              <div className="dice-max-owned">
                <p>拥有上限: {getDiceMaxOwned(selectedDice)}</p>
              </div>
            </div>
          )}
          <div className="completion-status">
            {isComplete ? (
              <span className="complete-text">已收集完成！点击骰子查看骰子详情</span>
            ) : (
              <span className="incomplete-text">继续收集骰子以完成收藏</span>
            )}
          </div>
          <div className="back-button-container">
            <Button variant="link" className="text-back-button" onClick={onBack}>
              返回
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

interface DiceSetCardProps {
  diceSet: DiceSet;
  ownedDices: DiceType[];
  onClick: () => void;
}

const DiceSetSummaryCard: React.FC<DiceSetCardProps> = ({ diceSet, ownedDices, onClick }) => {
  // 修改完成逻辑：检查每个骰子类型在ownedDices中的数量是否大于等于在diceSet.dices中的数量
  const isComplete = diceSet.dices.every(diceType => {
    // 计算该类型在diceSet中需要的数量
    const requiredCount = diceSet.dices.filter(d => d === diceType).length;
    // 计算玩家拥有该类型的数量
    const ownedCount = ownedDices.filter(d => d === diceType).length;
    // 只有当玩家拥有的数量大于等于需要的数量时才返回true
    return ownedCount >= requiredCount;
  });
  
  // 计算收集进度：对于每种骰子类型，计算已收集数量（不超过需要的数量）的总和
  let collectedCount = 0;
  const totalRequired = diceSet.dices.length;
  
  // 获取diceSet中的唯一骰子类型
  const uniqueDiceTypes = Array.from(new Set(diceSet.dices));
  
  // 对于每种类型，计算已收集的有效数量
  uniqueDiceTypes.forEach(diceType => {
    const requiredCount = diceSet.dices.filter(d => d === diceType).length;
    const ownedCount = ownedDices.filter(d => d === diceType).length;
    // 添加到总收集数量中，但不超过需要的数量
    collectedCount += Math.min(ownedCount, requiredCount);
  });
  
  const progress = collectedCount;
  
  // 选择一个代表性骰子来显示
  const representativeDice = diceSet.dices[0]; // 默认使用第一个骰子作为代表
  const isOwned = ownedDices.includes(representativeDice);

  // 获取骰子显示内容
  const getDiceDisplay = (dice: DiceType) => {
    if (dice.includes('CAVIER')) {
      return dice.charAt(dice.length - 1);
    }
    
    // 检查是否有100%概率的点数
    const probabilities = DICE_DATA[dice].probabilities;
    for (const [point, prob] of Object.entries(probabilities)) {
      if (prob === 1) {
        return point;
      }
    }
    
    return '?';
  };

  return (
    <Card className={`dice-set-summary-card ${isComplete ? 'completed' : ''}`} onClick={onClick}>
      <Card.Body>
        <div className="dice-set-summary-content">
          <div 
            className={`representative-dice ${isOwned ? 'owned' : ''}`}
            style={{ 
              backgroundColor: isOwned ? DICE_DATA[representativeDice].backgroundColor : 'rgba(0, 0, 0, 0.1)',
              color: isOwned ? DICE_DATA[representativeDice].textColor : 'var(--kcd-wood-dark)',
              border: `2px solid ${isOwned ? DICE_DATA[representativeDice].backgroundColor : 'var(--kcd-wood-light)'}`,
            }}
          >
            {isOwned ? getDiceDisplay(representativeDice) : '?'}
          </div>
          <div className="dice-set-info">
            <h5 className="dice-set-title">{diceSet.name}</h5>
            <div className="dice-set-progress-bar">
              <div 
                className="progress-fill" 
                style={{width: `${(progress / diceSet.dices.length) * 100}%`}}
              ></div>
            </div>
            <div className="dice-set-progress-text">
              {progress}/{diceSet.dices.length} 已收集
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export const DiceCollection: React.FC = () => {
  const { ownedDice } = useUserOwnedDice();
  const [selectedSet, setSelectedSet] = useState<DiceSet | null>(null);

  // 判断一个骰子套是否应该显示
  const shouldShowDiceSet = (diceSet: DiceSet): boolean => {
    // 如果不是隐藏的骰子套，直接显示
    if (!diceSet.isHidden) {
      return true;
    }
    
    // 如果是隐藏的骰子套，检查玩家是否拥有至少一个套中的骰子
    // 如果有，则解锁显示
    return diceSet.dices.some(dice => ownedDice.includes(dice));
  };

  const handleSetClick = (diceSet: DiceSet) => {
    setSelectedSet(diceSet);
  };

  const handleBack = () => {
    setSelectedSet(null);
  };

  // 过滤出应该显示的骰子套
  const visibleDiceSets = DICE_SETS.filter(diceSet => shouldShowDiceSet(diceSet));

  if (selectedSet) {
    return <DiceSetDetail diceSet={selectedSet} ownedDices={ownedDice} onBack={handleBack} />;
  }

  return (
    <div className="dice-collection">
      {visibleDiceSets.length > 0 ? (
        <Row xs={1} md={2} className="g-1">
          {visibleDiceSets.map((diceSet) => (
            <Col key={diceSet.id} className="mb-1">
              <DiceSetSummaryCard
                diceSet={diceSet}
                ownedDices={ownedDice}
                onClick={() => handleSetClick(diceSet)}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <div className="no-dice-sets-message">
          <p>尚未解锁任何骰子套。继续收集骰子以解锁隐藏套装！</p>
        </div>
      )}
    </div>
  );
};