import React, { useState } from 'react';
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

const GameSettings: React.FC<GameSettingsProps> = ({
  show,
  onHide,
  onSave,
  initialSettings
}) => {
  const [settings, setSettings] = useState<GameSettingsType>(initialSettings);

  const handleSave = () => {
    onSave(settings);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered className="kcd-modal">
      <Modal.Header closeButton>
        <Modal.Title>游戏设置</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-4">
            <Form.Label className="kcd-form-label">目标分数</Form.Label>
            <div className="kcd-input-container">
              <Form.Control
                type="number"
                min={1000}
                max={20000}
                step={500}
                value={settings.targetScore}
                onChange={(e) => setSettings({
                  ...settings,
                  targetScore: parseInt(e.target.value)
                })}
                className="kcd-input"
              />
            </div>
          </Form.Group>
          
          <Form.Group className="mb-4">
            <Form.Label className="kcd-form-label">电脑难度</Form.Label>
            <div className="kcd-input-container">
              <Form.Select
                value={settings.computerDifficulty}
                onChange={(e) => setSettings({
                  ...settings,
                  computerDifficulty: e.target.value as 'easy' | 'medium' | 'hard'
                })}
                className="kcd-input"
              >
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
              </Form.Select>
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="game-settings-footer">
        <Button variant="kcd" className="kcd-button" onClick={onHide}>
          取消
        </Button>
        <Button variant="kcd" className="kcd-button kcd-button-primary" onClick={handleSave}>
          保存
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GameSettings; 