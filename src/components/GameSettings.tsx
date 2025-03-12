import React, { useState, useEffect } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import { GameSettings as GameSettingsType } from '../types';
import '../styles/GameSettings.css';
import '../styles/ModalStyles.css';

interface GameSettingsProps {
  show: boolean;
  onHide: () => void;
  onSave: (settings: GameSettingsType) => void;
  initialSettings: GameSettingsType;
}

// 根据难度设置目标分数
const getDifficultyTargetScore = (difficulty: string): number => {
  switch (difficulty) {
    case 'easy':
      return 2000;
    case 'medium':
      return 4000;
    case 'hard':
      return 10000;
    default:
      return 4000;
  }
};

const GameSettings: React.FC<GameSettingsProps> = ({
  show,
  onHide,
  onSave,
  initialSettings
}) => {
  const [computerDifficulty, setComputerDifficulty] = useState<'easy' | 'medium' | 'hard'>(initialSettings.computerDifficulty);
  
  // 当 initialSettings 变化时更新本地状态
  useEffect(() => {
    setComputerDifficulty(initialSettings.computerDifficulty);
  }, [initialSettings]);

  const handleSave = () => {
    // 根据难度设置目标分数
    const targetScore = getDifficultyTargetScore(computerDifficulty);
    
    onSave({
      targetScore,
      computerDifficulty
    });
    onHide();
  };
  
  const handleCancel = () => {
    // 取消时恢复原始设置
    setComputerDifficulty(initialSettings.computerDifficulty);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleCancel} centered className="kcd-modal">
      <Modal.Header closeButton>
        <Modal.Title>游戏设置</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-4">
            <Form.Label className="kcd-form-label">电脑难度</Form.Label>
            <div className="kcd-input-container">
              <Form.Select
                value={computerDifficulty}
                onChange={(e) => setComputerDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                className="kcd-input"
              >
                <option value="easy">简单 (目标分数: 2000)</option>
                <option value="medium">中等 (目标分数: 4000)</option>
                <option value="hard">困难 (目标分数: 10000)</option>
              </Form.Select>
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="game-settings-footer">
        <Button variant="kcd" className="kcd-button kcd-button-primary" onClick={handleSave}>
          保存
        </Button>
        <Button variant="kcd" className="kcd-button" onClick={handleCancel}>
          取消
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GameSettings; 