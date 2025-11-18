import React, { useState, useEffect } from 'react';
import './stylings/LessonViewer.css';
import { CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';

const LessonViewer = ({ lesson, automatonType, onComplete, isCompleted }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isCompleting, setIsCompleting] = useState(false);

    // Reset currentStep when lesson changes
    useEffect(() => {
        setCurrentStep(0);
        setIsCompleting(false);
    }, [lesson?.id]);

    const handleNext = () => {
        if (lesson && lesson.steps && currentStep < lesson.steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else if (onComplete && !isCompleting) {
            setIsCompleting(true);
            onComplete();
            // Reset after a short delay to prevent rapid clicks
            setTimeout(() => setIsCompleting(false), 500);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Handle undefined lesson
    if (!lesson || !lesson.steps || lesson.steps.length === 0) {
        return (
            <div className="lesson-viewer">
                <div className="error-message">
                    <p>No lesson content available.</p>
                </div>
            </div>
        );
    }

    const step = lesson.steps[currentStep];

    return (
        <div className="lesson-viewer">
            <div className="lesson-header">
                <div>
                    <h1>{lesson.title}</h1>
                    <p className="lesson-description">{lesson.description}</p>
                </div>
                {isCompleted && (
                    <div className="completion-badge">
                        <CheckCircle size={24} />
                        <span>Completed</span>
                    </div>
                )}
            </div>

            <div className="lesson-progress">
                <span className="step-indicator">
                    Step {currentStep + 1} of {lesson.steps.length}
                </span>
                <div className="step-progress-bar">
                    <div 
                        className="step-progress-fill"
                        style={{ width: `${((currentStep + 1) / lesson.steps.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="lesson-content">
                <h2>{step?.title || 'Lesson Step'}</h2>
                <div className="step-text">
                    {step?.content || 'Loading content...'}
                </div>

                {step?.example && (
                    <div className="example-box">
                        <h3>Example:</h3>
                        <div className="example-content">
                            {step.example?.description && <p>{step.example.description}</p>}
                            {step.example?.code && (
                                <pre className="code-block">
                                    <code>{step.example.code}</code>
                                </pre>
                            )}
                            {step.example?.visual && (
                                <div className="visual-example">
                                    <img src={step.example.visual} alt="Example visualization" />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step?.keyPoints && step.keyPoints.length > 0 && (
                    <div className="key-points">
                        <h3>Key Points:</h3>
                        <ul>
                            {step.keyPoints.map((point, idx) => (
                                <li key={idx}>{point}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {step?.tips && step.tips.length > 0 && (
                    <div className="tips-box">
                        <h3>💡 Tips:</h3>
                        <ul>
                            {step.tips.map((tip, idx) => (
                                <li key={idx}>{tip}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="lesson-navigation">
                <button
                    className="nav-btn prev-btn"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                >
                    <ChevronLeft size={20} />
                    Previous
                </button>

                <div className="step-dots">
                    {lesson.steps.map((_, idx) => (
                        <button
                            key={idx}
                            className={`step-dot ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
                            onClick={() => setCurrentStep(idx)}
                        />
                    ))}
                </div>

                <button
                    className="nav-btn next-btn"
                    onClick={handleNext}
                    disabled={isCompleting}
                >
                    {currentStep < lesson.steps.length - 1 ? (
                        <>
                            Next
                            <ChevronRight size={20} />
                        </>
                    ) : (
                        <>
                            {isCompleting ? 'Completing...' : (isCompleted ? 'Finish' : 'Complete Lesson')}
                            <CheckCircle size={20} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default LessonViewer;

