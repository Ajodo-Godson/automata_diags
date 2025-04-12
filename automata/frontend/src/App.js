import React from 'react';
import './App.css';
import Layout from './components/Layout';
import DFASimulator from './components/DFA_components/DFASimulator';

function App() {
  return (
    <Layout>
      <DFASimulator />
    </Layout>
  );
}

export default App;
