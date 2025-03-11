import React from 'react';
import Game from './components/Game';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/KingdomComeTheme.css';
import './App.css';

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
