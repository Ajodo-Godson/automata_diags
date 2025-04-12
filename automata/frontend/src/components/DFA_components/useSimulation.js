import { useState } from 'react';

export const useSimulation = (dfa) => {
    const [currentStep, setCurrentStep] = useState(-1);
    const [simulationSteps, setSimulationSteps] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1000);

    // Simulation logic will go here
    // For now, we'll return empty values
    return {
        currentStep,
        simulationSteps,
        isPlaying,
        playbackSpeed,
        setCurrentStep,
        setSimulationSteps,
        setIsPlaying,
        setPlaybackSpeed,
    };
}; 