import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './stylings/ExerciseViewer.css';
import { CheckCircle, XCircle, AlertCircle, Lightbulb, ExternalLink, Play } from 'lucide-react';

const ExerciseViewer = ({ exercise, automatonType, onComplete, isCompleted }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [challengeResults, setChallengeResults] = useState(null);
    const [showAllHints, setShowAllHints] = useState(false);

    // Reset state when exercise changes
    useEffect(() => {
        setCurrentQuestion(0);
        setAnswers({});
        setShowResults(false);
        setShowHint(false);
        setChallengeResults(null);
        setShowAllHints(false);
        // Clear any previous challenge data from sessionStorage
        sessionStorage.removeItem('simulatorChallenge');
    }, [exercise?.id]);

    // Listen for challenge results from simulator window
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data.type === 'CHALLENGE_RESULT') {
                setChallengeResults(event.data.results);
                setShowResults(true);
                
                // If perfect score, mark as correct in answers for this specific question
                if (event.data.results.passed === event.data.results.total) {
                    setAnswers(prev => ({
                        ...prev,
                        [currentQuestion]: true
                    }));
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [currentQuestion]);

    // Handle undefined exercise - check early
    if (!exercise || !exercise.questions || exercise.questions.length === 0) {
        return (
            <div className="exercise-viewer">
                <div className="error-message">
                    <p>No exercise content available.</p>
                </div>
            </div>
        );
    }

    const question = exercise.questions[currentQuestion] || {};
    const userAnswer = answers[currentQuestion];

    const handleAnswer = (answer) => {
        setAnswers({
            ...answers,
            [currentQuestion]: answer
        });
        setShowHint(false);
    };

    const checkAnswer = () => {
        setShowResults(true);
    };

    const handleNext = () => {
        if (exercise && exercise.questions && currentQuestion < exercise.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setShowResults(false);
            setShowHint(false);
            setChallengeResults(null);
            setShowAllHints(false);
            // Clear challenge data when moving to next question
            sessionStorage.removeItem('simulatorChallenge');
        } else if (exercise && exercise.questions) {
            // Exercise completed - call onComplete regardless of score
            if (onComplete) {
                onComplete();
            }
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
            setShowResults(false);
            setShowHint(false);
            setChallengeResults(null);
            setShowAllHints(false);
            // Clear challenge data when moving to previous question
            sessionStorage.removeItem('simulatorChallenge');
        }
    };

    const handleOpenSimulator = () => {
        if (question?.type === 'hands-on' && question.challenge) {
            const challengeData = {
                type: question.simulatorType,
                challenge: question.challenge,
                questionId: `${exercise.id}-${currentQuestion}`,
                returnTo: 'tutorial'
            };
            // Store in sessionStorage so simulator can access it
            sessionStorage.setItem('simulatorChallenge', JSON.stringify(challengeData));
            // Open simulator in new window
            window.open(`${window.location.origin}${window.location.pathname}#challenge`, 'simulator-challenge', 'width=1400,height=900');
        }
    };

    const isCorrect = (idx) => {
        const q = exercise.questions[idx];
        const ans = answers[idx];
        if (!q || ans === undefined) return false;
        
        if (q.type === 'hands-on') {
            return ans === true;
        }
        return ans === q.correctAnswer;
    };

    const correctCount = exercise && exercise.questions ? 
        exercise.questions.reduce((count, _, idx) => count + (isCorrect(idx) ? 1 : 0), 0) : 0;

    return (
        <div className="exercise-viewer">
            <div className="exercise-header">
                <div>
                    <h1>{exercise.title}</h1>
                    <div className="exercise-description">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{exercise.description}</ReactMarkdown>
                    </div>
                </div>
                {isCompleted && (
                    <div className="completion-badge">
                        <CheckCircle size={24} />
                        <span>Completed</span>
                    </div>
                )}
            </div>

            <div className="exercise-progress">
                <span className="question-indicator">
                    Question {currentQuestion + 1} of {exercise.questions.length}
                </span>
                <div className="score-indicator">
                    Correct: {correctCount}/{exercise.questions.length}
                </div>
            </div>

            <div className="exercise-content">
                <div className="question-box">
                    <h2>Question {currentQuestion + 1}</h2>
                    <div className="question-text">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {question?.question || 'Loading question...'}
                        </ReactMarkdown>
                    </div>

                    {question?.image && (
                        <div className="question-image">
                            <img src={question.image} alt="Question diagram" />
                        </div>
                    )}

                    {question?.type === 'multiple-choice' && question?.options && (
                        <div className="answer-options">
                            {question.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    className={`option-btn ${userAnswer === option ? 'selected' : ''} 
                                               ${showResults && option === question.correctAnswer ? 'correct' : ''}
                                               ${showResults && userAnswer === option && userAnswer !== question.correctAnswer ? 'incorrect' : ''}`}
                                    onClick={() => handleAnswer(option)}
                                    disabled={showResults}
                                >
                                    <span className="option-label">{String.fromCharCode(65 + idx)}.</span>
                                    <span className="option-text">{option}</span>
                                    {showResults && option === question.correctAnswer && (
                                        <CheckCircle size={20} className="status-icon" />
                                    )}
                                    {showResults && userAnswer === option && userAnswer !== question.correctAnswer && (
                                        <XCircle size={20} className="status-icon" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {question?.type === 'true-false' && (
                        <div className="answer-options">
                            {['True', 'False'].map((option) => (
                                <button
                                    key={option}
                                    className={`option-btn ${userAnswer === option ? 'selected' : ''}
                                               ${showResults && option === question.correctAnswer ? 'correct' : ''}
                                               ${showResults && userAnswer === option && userAnswer !== question.correctAnswer ? 'incorrect' : ''}`}
                                    onClick={() => handleAnswer(option)}
                                    disabled={showResults}
                                >
                                    <span className="option-text">{option}</span>
                                    {showResults && option === question.correctAnswer && (
                                        <CheckCircle size={20} className="status-icon" />
                                    )}
                                    {showResults && userAnswer === option && userAnswer !== question.correctAnswer && (
                                        <XCircle size={20} className="status-icon" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {question?.type === 'short-answer' && (
                        <div className="short-answer-box">
                            <textarea
                                className="answer-input"
                                value={userAnswer || ''}
                                onChange={(e) => handleAnswer(e.target.value)}
                                placeholder="Type your answer here..."
                                disabled={showResults}
                                rows={4}
                            />
                        </div>
                    )}

                    {question?.type === 'hands-on' && question?.challenge && (
                        <div className="hands-on-question">
                            <div className="challenge-description">
                                <h3> Hands-On Challenge</h3>
                                <p>{question.challenge.description}</p>
                            </div>

                            <div className="challenge-test-cases">
                                <h4>Test Cases Your {question.simulatorType} Must Pass:</h4>
                                <table className="test-cases-table">
                                    <thead>
                                        <tr>
                                            <th>Input</th>
                                            <th>Should Accept?</th>
                                            <th>Description</th>
                                            {challengeResults && <th>Result</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {question.challenge.testCases.map((testCase, idx) => (
                                            <tr key={idx} className={challengeResults?.results?.[idx]?.passed ? 'test-pass' : challengeResults?.results?.[idx] ? 'test-fail' : ''}>
                                                <td><code>{testCase.input || 'ε (empty)'}</code></td>
                                                <td className={testCase.expected ? 'expected-accept' : 'expected-reject'}>
                                                    {testCase.expected ? '✓ Accept' : '✗ Reject'}
                                                </td>
                                                <td>{testCase.description}</td>
                                                {challengeResults && challengeResults.results && (
                                                    <td className={challengeResults.results[idx]?.passed ? 'result-pass' : 'result-fail'}>
                                                        {challengeResults.results[idx]?.passed ? (
                                                            <span className="pass-icon"><CheckCircle size={16} /> Pass</span>
                                                        ) : (
                                                            <span className="fail-icon"><XCircle size={16} /> Fail</span>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {question.challenge.hints && question.challenge.hints.length > 0 && (
                                <div className="challenge-hints">
                                    <button 
                                        className="hints-toggle-btn"
                                        onClick={() => setShowAllHints(!showAllHints)}
                                    >
                                        <Lightbulb size={18} />
                                        {showAllHints ? 'Hide Hints' : `Show Hints (${question.challenge.hints.length})`}
                                    </button>
                                    {showAllHints && (
                                        <div className="hints-list">
                                            {question.challenge.hints.map((hint, idx) => (
                                                <div key={idx} className="hint-item">
                                                    <strong>Hint {idx + 1}:</strong> {hint}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="challenge-actions-box">
                                <button 
                                    className="action-btn simulator-btn"
                                    onClick={handleOpenSimulator}
                                >
                                    <ExternalLink size={18} />
                                    Open {question.simulatorType} Simulator
                                </button>

                                {challengeResults ? (
                                    <div className={`challenge-feedback ${challengeResults.passed === challengeResults.total ? 'all-pass' : 'some-fail'}`}>
                                        <div className="feedback-header">
                                            {challengeResults.passed === challengeResults.total ? (
                                                <>
                                                    <CheckCircle size={32} />
                                                    <h3>🎉 Perfect! All Tests Passed!</h3>
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle size={32} />
                                                    <h3>Keep Trying!</h3>
                                                </>
                                            )}
                                        </div>
                                        <p className="score-text">
                                            Passed {challengeResults.passed} out of {challengeResults.total} test cases 
                                            ({challengeResults.percentage}%)
                                        </p>
                                        {challengeResults.passed === challengeResults.total && (
                                            <p className="success-message">
                                                Excellent work! Your automaton correctly handles all test cases.
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="challenge-instructions">
                                        <Play size={20} />
                                        <p>
                                            <strong>How it works:</strong><br/>
                                            1. Click "Open Simulator" to build your {question.simulatorType}<br/>
                                            2. Click "Validate Challenge" in the simulator when ready<br/>
                                            3. Results will appear here automatically
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {showResults && question && question.type !== 'hands-on' && (
                    <div className={`feedback-box ${isCorrect(currentQuestion) ? 'correct' : 'incorrect'}`}>
                        <div className="feedback-header">
                            {isCorrect(currentQuestion) ? (
                                <>
                                    <CheckCircle size={24} />
                                    <h3>Correct!</h3>
                                </>
                            ) : (
                                <>
                                    <XCircle size={24} />
                                    <h3>Not quite right</h3>
                                </>
                            )}
                        </div>
                        <p className="explanation">{question.explanation || 'No explanation available.'}</p>
                    </div>
                )}

                {!showResults && question?.hint && (
                    <div className="hint-section">
                        {!showHint ? (
                            <button 
                                className="hint-btn"
                                onClick={() => setShowHint(true)}
                            >
                                <Lightbulb size={18} />
                                Show Hint
                            </button>
                        ) : (
                            <div className="hint-box">
                                <AlertCircle size={20} />
                                <p>{question.hint}</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="exercise-actions">
                    <button
                        className="action-btn secondary"
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0}
                    >
                        Previous Question
                    </button>

                    {question?.type === 'hands-on' ? (
                        challengeResults && challengeResults.passed === challengeResults.total ? (
                            <button
                                className="action-btn primary"
                                onClick={handleNext}
                            >
                                {currentQuestion < exercise.questions.length - 1 
                                    ? 'Next Question' 
                                    : 'Finish Exercise'}
                            </button>
                        ) : null
                    ) : !showResults ? (
                        <button
                            className="action-btn primary"
                            onClick={checkAnswer}
                            disabled={!userAnswer}
                        >
                            Check Answer
                        </button>
                    ) : (
                        <button
                            className="action-btn primary"
                            onClick={handleNext}
                        >
                            {currentQuestion < exercise.questions.length - 1 
                                ? 'Next Question' 
                                : 'Finish Exercise'}
                        </button>
                    )}
                </div>
            </div>

            {/* Summary at the end */}
            {currentQuestion === exercise.questions.length - 1 && showResults && (
                <div className="exercise-summary">
                    <h3>Exercise Summary</h3>
                    <p>
                        You got {correctCount} out of {exercise.questions.length} questions correct!
                    </p>
                    {correctCount === exercise.questions.length && (
                        <p className="perfect-score">🎉 Perfect score! Great job!</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExerciseViewer;
