import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import '../styles/ModalStyles.css';

interface GameModalProps {
  show: boolean;
  onHide: () => void;
  title: string;
  content: string;
  onConfirm?: () => void;
  showConfirmButton?: boolean;
}

const GameModal: React.FC<GameModalProps> = ({
  show,
  onHide,
  title,
  content,
  onConfirm,
  showConfirmButton = false
}) => {
  // 处理确认按钮点击
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered className="kcd-modal">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{content}</p>
      </Modal.Body>
      <Modal.Footer className="game-modal-footer">
        {showConfirmButton ? (
          <div className="modal-buttons-container">
            <Button variant="kcd" className="kcd-button kcd-button-primary" onClick={handleConfirm}>
              确认
            </Button>
            <Button variant="kcd" className="kcd-button" onClick={onHide}>
              取消
            </Button>
          </div>
        ) : (
          <Button variant="kcd" className="kcd-button" onClick={onHide}>
            确定
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default GameModal; 