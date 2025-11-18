import React, { useState } from 'react';
import './stylings/TutorialHub.css';
import LessonViewer from './LessonViewer';
import ExerciseViewer from './ExerciseViewer';
import { tutorialData } from './tutorialData';
import { BookOpen, Award, CheckCircle, Circle, ChevronRight } from 'lucide-react';

const TutorialHub = () => {
    const [selectedAutomaton, setSelectedAutomaton] = useState('DFA');
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [completedLessons, setCompletedLessons] = useState(new Set());
    const [completedExercises, setCompletedExercises] = useState(new Set());

    const handleLessonComplete = (lessonId) => {
        setCompletedLessons(new Set([...completedLessons, lessonId]));
    };

    const handleExerciseComplete = (exerciseId) => {
        setCompletedExercises(new Set([...completedExercises, exerciseId]));
    };

    const currentData = tutorialData[selectedAutomaton] || { lessons: [], exercises: [], description: '' };

    // Calculate progress with safety checks
    const totalLessons = currentData?.lessons?.length || 0;
    const completedLessonsCount = currentData?.lessons ? currentData.lessons.filter(l => 
        completedLessons.has(`${selectedAutomaton}-${l.id}`)
    ).length : 0;
    const totalExercises = currentData?.exercises?.length || 0;
    const completedExercisesCount = currentData?.exercises ? currentData.exercises.filter(e => 
        completedExercises.has(`${selectedAutomaton}-${e.id}`)
    ).length : 0;

    return (
        <div className="tutorial-hub">
            {/* Top Header Bar */}
            <div className="tutorial-header">
                <div className="header-left">
                    <BookOpen size={28} />
                    <div>
                        <h1>Automata Theory Learning Hub</h1>
                        <p>Master computational models step by step</p>
                    </div>
                </div>
                
                {/* Progress Cards in Header */}
                <div className="header-progress">
                    <div className="progress-card">
                        <div className="progress-card-icon">📚</div>
                        <div className="progress-card-info">
                            <span className="progress-label">Lessons</span>
                            <span className="progress-value">{completedLessonsCount}/{totalLessons}</span>
                        </div>
                        <div className="circular-progress">
                            <svg width="50" height="50">
                                <circle cx="25" cy="25" r="20" fill="none" stroke="#e0e0e0" strokeWidth="4" />
                                <circle 
                                    cx="25" cy="25" r="20" fill="none" 
                                    stroke="#667eea" strokeWidth="4"
                                    strokeDasharray={`${2 * Math.PI * 20}`}
                                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - (completedLessonsCount / totalLessons || 0))}`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 25 25)"
                                />
                            </svg>
                            <span className="progress-percentage">{Math.round((completedLessonsCount / totalLessons || 0) * 100)}%</span>
                        </div>
                    </div>
                    
                    <div className="progress-card">
                        <div className="progress-card-icon">🏆</div>
                        <div className="progress-card-info">
                            <span className="progress-label">Exercises</span>
                            <span className="progress-value">{completedExercisesCount}/{totalExercises}</span>
                        </div>
                        <div className="circular-progress">
                            <svg width="50" height="50">
                                <circle cx="25" cy="25" r="20" fill="none" stroke="#e0e0e0" strokeWidth="4" />
                                <circle 
                                    cx="25" cy="25" r="20" fill="none" 
                                    stroke="#764ba2" strokeWidth="4"
                                    strokeDasharray={`${2 * Math.PI * 20}`}
                                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - (completedExercisesCount / totalExercises || 0))}`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 25 25)"
                                />
                            </svg>
                            <span className="progress-percentage">{Math.round((completedExercisesCount / totalExercises || 0) * 100)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Container with Sidebar and Content */}
            <div className="tutorial-main">
                {/* Sidebar Navigation */}
                <div className="tutorial-sidebar">
                    {/* Automaton Type Selector - Card Grid */}
                    <div className="automaton-selector">
                        <h3>Choose Your Topic</h3>
                        <div className="automaton-grid">
                            {Object.keys(tutorialData).map(type => (
                                <button
                                    key={type}
                                    className={`automaton-card ${selectedAutomaton === type ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedAutomaton(type);
                                        setSelectedLesson(null);
                                        setSelectedExercise(null);
                                    }}
                                >
                                    <span className="automaton-name">{type}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Combined Content List - Tabs Style */}
                    <div className="content-section">
                        <div className="content-tabs">
                            <div className="tab-header">
                                <h3>📖 Learning Materials</h3>
                                <span className="topic-badge">{selectedAutomaton}</span>
                            </div>
                        </div>

                        {/* Lessons */}
                        <div className="content-group">
                            <div className="group-header">
                                <BookOpen size={16} />
                                <span>Lessons ({currentData?.lessons?.length || 0})</span>
                            </div>
                            <div className="content-items">
                                {currentData?.lessons && currentData.lessons.map((lesson) => {
                                    const lessonId = `${selectedAutomaton}-${lesson.id}`;
                                    const isCompleted = completedLessons.has(lessonId);
                                    return (
                                        <button
                                            key={lesson.id}
                                            className={`content-item ${selectedLesson?.id === lesson.id ? 'active' : ''}`}
                                            onClick={() => {
                                                setSelectedLesson(lesson);
                                                setSelectedExercise(null);
                                            }}
                                        >
                                            {isCompleted ? <CheckCircle size={16} /> : <Circle size={16} />}
                                            <span>{lesson.title}</span>
                                            <ChevronRight size={16} className="chevron" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Exercises */}
                        <div className="content-group">
                            <div className="group-header">
                                <Award size={16} />
                                <span>Exercises ({currentData?.exercises?.length || 0})</span>
                            </div>
                            <div className="content-items">
                                {currentData?.exercises && currentData.exercises.map((exercise) => {
                                    const exerciseId = `${selectedAutomaton}-${exercise.id}`;
                                    const isCompleted = completedExercises.has(exerciseId);
                                    return (
                                        <button
                                            key={exercise.id}
                                            className={`content-item ${selectedExercise?.id === exercise.id ? 'active' : ''}`}
                                            onClick={() => {
                                                setSelectedExercise(exercise);
                                                setSelectedLesson(null);
                                            }}
                                        >
                                            {isCompleted ? <CheckCircle size={16} /> : <Circle size={16} />}
                                            <span>{exercise.title}</span>
                                            <ChevronRight size={16} className="chevron" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="tutorial-content">
                {!selectedLesson && !selectedExercise && (
                    <div className="welcome-screen">
                        <BookOpen size={64} />
                        <h2>Welcome to {selectedAutomaton} Tutorials</h2>
                        <p>{currentData?.description || 'Learn about this automaton type.'}</p>
                        <div className="quick-start">
                            <h3>Quick Start</h3>
                            <ul>
                                <li>Select a lesson from the sidebar to start learning</li>
                                <li>Complete exercises to test your understanding</li>
                                <li>Track your progress as you go</li>
                            </ul>
                        </div>
                    </div>
                )}

                {selectedLesson && (
                    <LessonViewer
                        lesson={selectedLesson}
                        automatonType={selectedAutomaton}
                        onComplete={() => handleLessonComplete(`${selectedAutomaton}-${selectedLesson.id}`)}
                        isCompleted={completedLessons.has(`${selectedAutomaton}-${selectedLesson.id}`)}
                    />
                )}

                {selectedExercise && (
                    <ExerciseViewer
                        exercise={selectedExercise}
                        automatonType={selectedAutomaton}
                        onComplete={() => handleExerciseComplete(`${selectedAutomaton}-${selectedExercise.id}`)}
                        isCompleted={completedExercises.has(`${selectedAutomaton}-${selectedExercise.id}`)}
                    />
                )}
                </div>
            </div>
        </div>
    );
};

export default TutorialHub;

