// Main Tutorial Data - imports all automaton-specific tutorials

import { dfaTutorial } from './tutorialData/dfaTutorial.js';
import { nfaTutorial } from './tutorialData/nfaTutorial.js';
import { pdaTutorial } from './tutorialData/pdaTutorial.js';
import { cfgTutorial } from './tutorialData/cfgTutorial.js';
import { tmTutorial } from './tutorialData/tmTutorial.js';

export const tutorialData = {
    DFA: dfaTutorial,
    NFA: nfaTutorial,
    PDA: pdaTutorial,
    CFG: cfgTutorial,
    TM: tmTutorial
};

export default tutorialData;
