import React, { useState, useEffect } from 'react';
import './App.css';
import Layout from './components/Layout';
import DFASimulatorNew from './components/DFA_components/DFASimulator';
import NFASimulator from './components/NFA_components/NFASimulator';
import PDASimulator from './components/PDA_components/PDASimulator';
import CFGSimulator from './components/CFG_components/CFGSimulator';
import TMSimulator from './components/TM_components/TMSimulator';
import TutorialHub from './components/Tutorial_components/TutorialHub';

function App() {
  const [currentAutomaton, setCurrentAutomaton] = useState('DFA');
  const [challengeData, setChallengeData] = useState(null);

  useEffect(() => {
    // Check if opened in challenge mode
    if (window.location.hash === '#challenge') {
      const storedChallenge = sessionStorage.getItem('simulatorChallenge');
      if (storedChallenge) {
        try {
          const challenge = JSON.parse(storedChallenge);
          setChallengeData(challenge);
          setCurrentAutomaton(challenge.type);
        } catch (error) {
          console.error('Error parsing challenge data:', error);
        }
      }
    }

    // Listen for hash changes
    const handleHashChange = () => {
      if (window.location.hash === '#challenge') {
        const storedChallenge = sessionStorage.getItem('simulatorChallenge');
        if (storedChallenge) {
          try {
            const challenge = JSON.parse(storedChallenge);
            setChallengeData(challenge);
            setCurrentAutomaton(challenge.type);
          } catch (error) {
            console.error('Error parsing challenge data:', error);
          }
        }
      } else {
        setChallengeData(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <Layout currentAutomaton={currentAutomaton} setCurrentAutomaton={setCurrentAutomaton}>
      {currentAutomaton === 'DFA' && <DFASimulatorNew challenge={challengeData} />}
      {currentAutomaton === 'NFA' && <NFASimulator challenge={challengeData} />}
      {currentAutomaton === 'PDA' && <PDASimulator challenge={challengeData} />}
      {currentAutomaton === 'CFG' && <CFGSimulator challenge={challengeData} />}
      {currentAutomaton === 'TM' && <TMSimulator challenge={challengeData} />}
      {currentAutomaton === 'Tutorial' && <TutorialHub />}
    </Layout>
  );
}

export default App;
