import React, { useState } from 'react';
import './App.css';
import Layout from './components/Layout';
import DFASimulator from './components/DFA_components/DFASimulator';
import PDASimulator from './components/PDA_components/PDASimulator';
import CFGSimulator from './components/CFG_components/CFGSimulator';
import TMSimulator from './components/TM_components/TMSimulator';

function App() {
  const [automata, setAutomata] = useState('DFA');

  const renderSim = () => {
    switch (automata) {
      case 'PDA':
        return <PDASimulator />;
      case 'TM':
        return <TMSimulator />;
      case 'CFG':
        return <CFGSimulator />;
      default:
        return <DFASimulator />;
    }
  };

  return (
    <Layout automata={automata} setAutomata={setAutomata}>
      {renderSim()}
    </Layout>
  );
}

export default App;
