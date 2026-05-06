import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Layout from './components/Layout';
import DFASimulatorNew from './components/DFA_components/DFASimulator';
import NFASimulator from './components/NFA_components/NFASimulator';
import PDASimulator from './components/PDA_components/PDASimulator';
import CFGSimulator from './components/CFG_components/CFGSimulator';
import TMSimulator from './components/TM_components/TMSimulator';
import TutorialHub from './components/Tutorial_components/TutorialHub';
import AppWalkthrough from './components/AppWalkthrough';

/** Deep-link for class demos, e.g. #demo=dfa:lexer_digits_plus or #demo=cfg:compiler_precedence_digits */
function readTutorialDemoFromHash() {
  if (typeof window === 'undefined') return null;
  const raw = window.location.hash.replace(/^#/, '');
  if (raw === 'challenge') return null;
  const sp = new URLSearchParams(raw);
  const demo = sp.get('demo');
  if (!demo) return null;
  const [kind, key] = demo.split(':');
  const map = { dfa: 'DFA', nfa: 'NFA', cfg: 'CFG' };
  const tab = map[(kind || '').toLowerCase()];
  if (!tab || !key) return null;
  return { tab, key };
}

function App() {
  const initialTutorialDemo = readTutorialDemoFromHash();
  const [currentAutomaton, setCurrentAutomaton] = useState(
    () => initialTutorialDemo?.tab || 'DFA'
  );
  const [challengeData, setChallengeData] = useState(null);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [tutorialDemoLoad, setTutorialDemoLoad] = useState(() => initialTutorialDemo);

  const consumeTutorialDemo = useCallback(() => {
    setTutorialDemoLoad(null);
  }, []);

  useEffect(() => {
    // Check if opened in challenge mode
    if (window.location.hash === '#challenge') {
      setTutorialDemoLoad(null);
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
        setTutorialDemoLoad(null);
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
        const d = readTutorialDemoFromHash();
        if (d) {
          setCurrentAutomaton(d.tab);
          setTutorialDemoLoad(d);
        } else {
          setTutorialDemoLoad(null);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <Layout
      currentAutomaton={currentAutomaton}
      setCurrentAutomaton={setCurrentAutomaton}
      onOpenGuide={() => setShowWalkthrough(true)}
    >
      {currentAutomaton === 'DFA' && (
        <DFASimulatorNew
          challenge={challengeData}
          tutorialDemoKey={tutorialDemoLoad?.tab === 'DFA' ? tutorialDemoLoad.key : null}
          onTutorialDemoConsumed={consumeTutorialDemo}
        />
      )}
      {currentAutomaton === 'NFA' && (
        <NFASimulator
          challenge={challengeData}
          tutorialDemoKey={tutorialDemoLoad?.tab === 'NFA' ? tutorialDemoLoad.key : null}
          onTutorialDemoConsumed={consumeTutorialDemo}
        />
      )}
      {currentAutomaton === 'PDA' && <PDASimulator challenge={challengeData} />}
      {currentAutomaton === 'CFG' && (
        <CFGSimulator
          challenge={challengeData}
          tutorialDemoKey={tutorialDemoLoad?.tab === 'CFG' ? tutorialDemoLoad.key : null}
          onTutorialDemoConsumed={consumeTutorialDemo}
        />
      )}
      {currentAutomaton === 'TM' && <TMSimulator challenge={challengeData} />}
      {currentAutomaton === 'Tutorial' && <TutorialHub />}
      <AppWalkthrough
        isOpen={showWalkthrough}
        onClose={() => setShowWalkthrough(false)}
        currentAutomaton={currentAutomaton}
        setCurrentAutomaton={setCurrentAutomaton}
      />
    </Layout>
  );
}

export default App;
