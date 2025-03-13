import React from 'react';
import Game from './components/Game';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/KingdomComeTheme.css';
import './App.css';

// 添加挑战者模式的注释，实际逻辑将在Game组件中实现
// 挑战者模式：玩家可以挑战特殊的电脑对手，这些对手拥有特殊的骰子组合
// 每个挑战者都有自己的难度和特色，击败他们可以获得特殊奖励

function App() {
  return (
    <div className="App">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;700&display=swap" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap" />
      <Game />
    </div>
  );
}

export default App;
