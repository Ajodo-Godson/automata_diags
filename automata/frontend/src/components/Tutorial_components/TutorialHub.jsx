import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './stylings/TutorialHub.css';
import LessonViewer from './LessonViewer';
import ExerciseViewer from './ExerciseViewer';
import { tutorialData } from './tutorialData';
import { Award, BookOpen, Check } from 'lucide-react';

const MACHINE_BLURB = {
    DFA: 'Deterministic finite automata',
    NFA: 'Nondeterministic finite automata',
    PDA: 'Pushdown automata',
    CFG: 'Context-free grammars',
    TM: 'Turing machines',
};

/** A thin progress bar. The old hub drew two SVG donuts that clipped. */
function Progress({ label, done, total }) {
    const pct = total ? Math.round((done / total) * 100) : 0;
    return (
        <div className="tut-progress">
            <div className="tut-progress-head">
                <span className="eyebrow">{label}</span>
                <span className="tut-progress-count">
                    {done}/{total}
                </span>
            </div>
            <div
                className="tut-progress-track"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${label} progress`}
            >
                <div className="tut-progress-fill" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

const TutorialHub = () => {
    const [machine, setMachine] = useState('DFA');
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [doneLessons, setDoneLessons] = useState(new Set());
    const [doneExercises, setDoneExercises] = useState(new Set());

    const data = tutorialData[machine] || { lessons: [], exercises: [], description: '' };
    const lessons = data.lessons || [];
    const exercises = data.exercises || [];

    const lessonsDone = lessons.filter((l) => doneLessons.has(`${machine}-${l.id}`)).length;
    const exercisesDone = exercises.filter((e) => doneExercises.has(`${machine}-${e.id}`)).length;

    const selectMachine = (type) => {
        setMachine(type);
        setSelectedLesson(null);
        setSelectedExercise(null);
    };

    const renderItem = (item, kind) => {
        const id = `${machine}-${item.id}`;
        const isDone = kind === 'lesson' ? doneLessons.has(id) : doneExercises.has(id);
        const isActive =
            kind === 'lesson'
                ? selectedLesson?.id === item.id
                : selectedExercise?.id === item.id;

        return (
            <li key={item.id}>
                <button
                    type="button"
                    className={`tut-item ${isActive ? 'is-active' : ''}`}
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => {
                        if (kind === 'lesson') {
                            setSelectedLesson(item);
                            setSelectedExercise(null);
                        } else {
                            setSelectedExercise(item);
                            setSelectedLesson(null);
                        }
                    }}
                >
                    <span className={`tut-check ${isDone ? 'is-done' : ''}`} aria-hidden="true">
                        {isDone && <Check size={11} strokeWidth={3} />}
                    </span>
                    <span className="tut-item-title">{item.title}</span>
                </button>
            </li>
        );
    };

    return (
        <div className="tut">
            <aside className="tut-sidebar" data-tour="tutorial-sidebar">
                <div className="tut-machines" role="tablist" aria-label="Topic">
                    {Object.keys(tutorialData).map((type) => (
                        <button
                            key={type}
                            type="button"
                            role="tab"
                            aria-selected={machine === type}
                            className={`tut-machine ${machine === type ? 'is-active' : ''}`}
                            onClick={() => selectMachine(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <div className="tut-progress-group">
                    <Progress label="Lessons" done={lessonsDone} total={lessons.length} />
                    <Progress label="Exercises" done={exercisesDone} total={exercises.length} />
                </div>

                <nav className="tut-nav">
                    <section className="tut-group">
                        <h2 className="tut-group-title">
                            <BookOpen size={13} aria-hidden="true" />
                            Lessons
                            <span className="tut-group-count">{lessons.length}</span>
                        </h2>
                        <ul className="tut-list">
                            {lessons.length === 0 ? (
                                <li className="hint tut-empty">No lessons yet.</li>
                            ) : (
                                lessons.map((l) => renderItem(l, 'lesson'))
                            )}
                        </ul>
                    </section>

                    <section className="tut-group">
                        <h2 className="tut-group-title">
                            <Award size={13} aria-hidden="true" />
                            Exercises
                            <span className="tut-group-count">{exercises.length}</span>
                        </h2>
                        <ul className="tut-list">
                            {exercises.length === 0 ? (
                                <li className="hint tut-empty">No exercises yet.</li>
                            ) : (
                                exercises.map((e) => renderItem(e, 'exercise'))
                            )}
                        </ul>
                    </section>
                </nav>
            </aside>

            <div className="tut-content" data-tour="tutorial-content">
                {!selectedLesson && !selectedExercise && (
                    <div className="tut-intro">
                        <p className="eyebrow">{machine}</p>
                        <h1 className="tut-intro-title">{MACHINE_BLURB[machine] || machine}</h1>
                        <div className="tut-prose">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {data.description || 'Learn about this machine.'}
                            </ReactMarkdown>
                        </div>
                        <p className="hint tut-intro-hint">
                            Pick a lesson on the left to begin, or jump straight to an exercise.
                        </p>
                    </div>
                )}

                {selectedLesson && (
                    <LessonViewer
                        lesson={selectedLesson}
                        automatonType={machine}
                        onComplete={() =>
                            setDoneLessons(
                                (prev) => new Set([...prev, `${machine}-${selectedLesson.id}`])
                            )
                        }
                        isCompleted={doneLessons.has(`${machine}-${selectedLesson.id}`)}
                    />
                )}

                {selectedExercise && (
                    <ExerciseViewer
                        exercise={selectedExercise}
                        automatonType={machine}
                        onComplete={() =>
                            setDoneExercises(
                                (prev) => new Set([...prev, `${machine}-${selectedExercise.id}`])
                            )
                        }
                        isCompleted={doneExercises.has(`${machine}-${selectedExercise.id}`)}
                    />
                )}
            </div>
        </div>
    );
};

export default TutorialHub;
