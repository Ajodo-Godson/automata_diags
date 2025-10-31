import React, { useState } from 'react';
import './App.css';
import Layout from './components/Layout';
import DFASimulatorNew from './components/DFA_components/DFASimulator';
import NFASimulator from './components/NFA_components/NFASimulator';
import PDASimulator from './components/PDA_components/PDASimulator';
import CFGSimulator from './components/CFG_components/CFGSimulator';
import TMSimulator from './components/TM_components/TMSimulator';

function App() {
  const [currentAutomaton, setCurrentAutomaton] = useState('DFA');

  return (
    <Layout currentAutomaton={currentAutomaton} setCurrentAutomaton={setCurrentAutomaton}>
      {currentAutomaton === 'DFA' && <DFASimulatorNew />}
      {currentAutomaton === 'NFA' && <NFASimulator />}
      {currentAutomaton === 'PDA' && <PDASimulator />}
      {currentAutomaton === 'CFG' && <CFGSimulator />}
      {currentAutomaton === 'TM' && <TMSimulator />}
    </Layout>
  );
}

export default App;
