//App.js
import React from 'react';
import './App.css';
import MapComponent from './MapComponent';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>The Ultimate Map App</h1>
      </header>
      <main>
        <MapComponent />
      </main>
    </div>
  );
}

export default App;