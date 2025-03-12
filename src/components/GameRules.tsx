import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import '../styles/GameRules.css';
import '../styles/ModalStyles.css';

interface GameRulesProps {
  show?: boolean;
  onHide?: () => void;
}

const GameRules: React.FC<GameRulesProps> = ({ show: propShow, onHide }) => {
  const [internalShow, setInternalShow] = React.useState(false);

  // 使用props中的show或内部状态
  const show = propShow !== undefined ? propShow : internalShow;
  
  // 处理关闭事件
  const handleClose = () => {
    if (onHide) {
      onHide();
    } else {
      setInternalShow(false);
    }
  };

  // 处理显示事件（仅在使用内部状态时）
  const handleShow = () => {
    if (propShow === undefined) {
      setInternalShow(true);
    }
  };

  return (
    <>
      {propShow === undefined && (
        <Button variant="kcd" className="kcd-button" onClick={handleShow}>
          游戏规则
        </Button>
      )}

      <Modal show={show} onHide={handleClose} size="lg" className="kcd-modal">
        <Modal.Header closeButton>
          <Modal.Title>Farkle 游戏规则</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>欢迎来到天国骰子</h4>
          <p>这是一款完全由AI编写的Farkle游戏，游戏应该还有不少bug，而且暂时还没有顾及到视觉体验，望海涵。</p>
          <p>如果您发现有bug或有任何好的建议，请WeChat联系我：mzz0606。</p>

          <h4>游戏目标</h4>
          <p>成为第一个达到目标分数（默认4,000分）的玩家。</p>
          
          <h4>下注规则</h4>
          <p>每局游戏开始时，玩家可以下注格罗申。下注金额会立即从玩家余额中扣除。</p>
          <p>如果玩家赢得游戏，将获得下注金额的两倍（即净赢得下注金额）；如果电脑赢得游戏，玩家将失去已下注的格罗申。</p>
          <p>玩家初始拥有50格罗申。如果格罗申用完，玩家可以通过下注0格罗申赚取特殊骰子进行出售，很快你就会东山再起。</p>
          
          <h4>游戏流程</h4>
          <p>玩家轮流掷骰子并收集分数。每个回合，玩家掷六个骰子并必须至少选择一个有效的得分组合。</p>
          
          <h4>得分组合</h4>
          <ul>
            <li>单个1 = 100分</li>
            <li>单个5 = 50分</li>
            <li>三个1 = 1000分</li>
            <li>三个2 = 200分</li>
            <li>三个3 = 300分</li>
            <li>三个4 = 400分</li>
            <li>三个5 = 500分</li>
            <li>三个6 = 600分</li>
            <li>四个相同 = 三个相同分数的两倍</li>
            <li>五个相同 = 三个相同分数的三倍</li>
            <li>六个相同 = 三个相同分数的四倍</li>
            <li>1-2-3-4-5（小顺子）= 500分</li>
            <li>2-3-4-5-6（大顺子）= 750分</li>
            <li>1-2-3-4-5-6（全顺）= 1500分</li>
          </ul>
          
          <h4>Farkle（无分）</h4>
          <p>如果玩家掷骰子后没有任何得分组合，这称为"Farkle"。玩家失去当前回合累积的所有分数，回合结束。</p>
          
          <h4>回合结束</h4>
          <p>玩家可以选择"锁定并结束回合"来保存当前回合的分数，或继续掷剩余的骰子来获取更多分数（但风险更大）。</p>
          
          <h4>游戏结束</h4>
          <p>当一名玩家达到目标分数后，游戏结束。</p>
        </Modal.Body>
        <Modal.Footer className="game-rules-footer">
          <Button variant="kcd" className="kcd-button" onClick={handleClose}>
            关闭
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default GameRules; 