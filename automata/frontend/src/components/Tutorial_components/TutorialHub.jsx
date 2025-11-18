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
            {/* Sidebar Navigation */}
            <div className="tutorial-sidebar">
                <h2 className="tutorial-title">
                    <BookOpen size={24} />
                    Learn Automata Theory
                </h2>

                {/* Automaton Type Selector */}
                <div className="automaton-selector">
                    <h3>Select Topic</h3>
                    {Object.keys(tutorialData).map(type => (
                        <button
                            key={type}
                            className={`automaton-btn ${selectedAutomaton === type ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedAutomaton(type);
                                setSelectedLesson(null);
                                setSelectedExercise(null);
                            }}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Progress Section */}
                <div className="progress-section">
                    <h3>
                        <Award size={18} />
                        Progress
                    </h3>
                    <div className="progress-item">
                        <span>Lessons: {completedLessonsCount}/{totalLessons}</span>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{ width: `${(completedLessonsCount / totalLessons) * 100}%` }}
                            />
                        </div>
                    </div>
                    <div className="progress-item">
                        <span>Exercises: {completedExercisesCount}/{totalExercises}</span>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{ width: `${(completedExercisesCount / totalExercises) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Lessons List */}
                <div className="content-list">
                    <h3>Lessons</h3>
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

                {/* Exercises List */}
                <div className="content-list">
                    <h3>Exercises</h3>
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
    );
};

export default TutorialHub;

