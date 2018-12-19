import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import FileInput from './FileInput.js';
import LargeFileInput from './LargeFileInput.js';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
        <main>
          <FileInput />
          <LargeFileInput />
        </main>
      </div>
    );
  }
}

export default App;
