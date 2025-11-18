# Tutorial System Documentation

## Overview

The Tutorial System is an interactive learning feature that provides structured lessons and exercises for each automaton type (DFA, NFA, PDA, CFG, TM). It includes progress tracking, interactive exercises with immediate feedback, and comprehensive content coverage.

## Components

### 1. TutorialHub.jsx
The main component that orchestrates the tutorial experience.

**Features:**
- Sidebar navigation with lesson/exercise lists
- Progress tracking with visual indicators
- Automaton type selector
- Completion badges

**Props:**
- None (standalone component)

### 2. LessonViewer.jsx
Displays interactive lessons with step-by-step content.

**Features:**
- Multi-step lessons with navigation
- Example code blocks
- Key points and tips sections
- Progress indicators
- Completion tracking

**Props:**
- `lesson` (object): Lesson data
- `automatonType` (string): Type of automaton
- `onComplete` (function): Callback when lesson is completed
- `isCompleted` (boolean): Whether lesson is already completed

### 3. ExerciseViewer.jsx
Interactive exercise component with multiple question types.

**Features:**
- Multiple choice questions
- True/false questions
- Short answer questions
- Hint system
- Immediate feedback
- Score tracking

**Props:**
- `exercise` (object): Exercise data
- `automatonType` (string): Type of automaton
- `onComplete` (function): Callback when exercise is completed
- `isCompleted` (boolean): Whether exercise is already completed

## Data Structure

### Tutorial Data (tutorialData.js)

The content is organized by automaton type:

```javascript
{
  DFA: {
    description: "...",
    lessons: [...],
    exercises: [...]
  },
  NFA: { ... },
  PDA: { ... },
  CFG: { ... },
  TM: { ... }
}
```

### Lesson Object Structure

```javascript
{
  id: 'unique-id',
  title: 'Lesson Title',
  description: 'Brief description',
  steps: [
    {
      title: 'Step Title',
      content: 'Main content (supports \n\n for paragraphs)',
      example: {
        description: 'Example description',
        code: 'Code or pseudocode',
        visual: 'path/to/image.png'
      },
      keyPoints: ['Point 1', 'Point 2'],
      tips: ['Tip 1', 'Tip 2']
    }
  ]
}
```

### Exercise Object Structure

```javascript
{
  id: 'unique-id',
  title: 'Exercise Title',
  description: 'Brief description',
  questions: [
    {
      type: 'multiple-choice' | 'true-false' | 'short-answer',
      question: 'Question text',
      options: ['Option 1', 'Option 2'], // for multiple-choice/true-false
      correctAnswer: 'Correct answer',
      explanation: 'Explanation of the answer',
      hint: 'Optional hint',
      image: 'path/to/diagram.png' // optional
    }
  ]
}
```

## Adding New Content

### Adding a New Lesson

1. Open `tutorialData.js`
2. Navigate to the appropriate automaton type
3. Add a new lesson object to the `lessons` array:

```javascript
{
  id: 'dfa-3',
  title: 'Your New Lesson',
  description: 'What students will learn',
  steps: [
    {
      title: 'Step 1 Title',
      content: 'Your content here...',
      keyPoints: ['Key point 1', 'Key point 2']
    }
  ]
}
```

### Adding a New Exercise

1. Open `tutorialData.js`
2. Navigate to the appropriate automaton type
3. Add a new exercise object to the `exercises` array:

```javascript
{
  id: 'dfa-ex-3',
  title: 'Your New Exercise',
  description: 'What this exercise tests',
  questions: [
    {
      type: 'multiple-choice',
      question: 'Your question?',
      options: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
      correctAnswer: 'Answer 1',
      explanation: 'Why this is correct...',
      hint: 'Think about...'
    }
  ]
}
```

### Adding a New Automaton Type

1. Add new entry to `tutorialData` in `tutorialData.js`:

```javascript
NEW_TYPE: {
  description: 'Description of this automaton type',
  lessons: [],
  exercises: []
}
```

2. The tutorial system will automatically display it in the navigation

## Styling

Each component has its own CSS file in the `stylings/` directory:

- `TutorialHub.css`: Main layout and navigation
- `LessonViewer.css`: Lesson display and step navigation
- `ExerciseViewer.css`: Question types and feedback display

### Color Scheme

- Primary (Success): `#4CAF50` (Green)
- Tutorial Accent: `#2196F3` (Blue)
- Warning: `#FFC107` (Amber)
- Error: `#f44336` (Red)

## Progress Tracking

Progress is tracked in the `TutorialHub` component using React state:

- `completedLessons`: Set of completed lesson IDs
- `completedExercises`: Set of completed exercise IDs

IDs are formatted as: `{automatonType}-{itemId}` (e.g., "DFA-dfa-1")

### Persistence

Currently, progress is stored in component state and will reset on page reload. To add persistence:

1. Save state to localStorage:
```javascript
useEffect(() => {
  localStorage.setItem('completedLessons', JSON.stringify([...completedLessons]));
}, [completedLessons]);
```

2. Load state on mount:
```javascript
useEffect(() => {
  const saved = localStorage.getItem('completedLessons');
  if (saved) setCompletedLessons(new Set(JSON.parse(saved)));
}, []);
```

## Best Practices for Content

### Writing Lessons

1. **Start Simple**: Begin with basic concepts before advanced topics
2. **Use Examples**: Include concrete examples for every concept
3. **Break It Down**: Split complex topics into multiple steps
4. **Visual Aids**: Add diagrams where helpful
5. **Interactive**: Reference the simulator tools when relevant

### Writing Exercises

1. **Progressive Difficulty**: Start easy, increase difficulty
2. **Clear Questions**: Make questions unambiguous
3. **Good Explanations**: Explain why answers are correct/incorrect
4. **Helpful Hints**: Hints should guide without giving away the answer
5. **Variety**: Mix question types to keep engagement high

## Integration

The tutorial system is integrated into the main app through:

1. **App.js**: Imports and conditionally renders `TutorialHub`
2. **Layout.jsx**: Adds "Tutorial" button to navigation
3. **Layout.css**: Styling for tutorial button

## Future Enhancements

Potential improvements to consider:

1. **Progress Persistence**: Save progress to localStorage or backend
2. **User Accounts**: Track progress per user
3. **Certificates**: Award certificates for completion
4. **Advanced Exercises**: Code challenges that interact with simulators
5. **Video Content**: Embed video tutorials
6. **Quiz Mode**: Timed quizzes with leaderboards
7. **Adaptive Learning**: Adjust difficulty based on performance
8. **Interactive Diagrams**: Clickable, animated diagrams
9. **Community Features**: User-submitted questions/lessons
10. **Mobile Optimization**: Enhanced mobile experience

## Troubleshooting

### Lessons not showing
- Check that `tutorialData.js` is properly formatted
- Verify lesson IDs are unique
- Check console for JavaScript errors

### Progress not tracking
- Ensure `onComplete` callbacks are called
- Check that lesson/exercise IDs match the format: `{type}-{id}`

### Styling issues
- Clear browser cache
- Check for CSS conflicts with main app styles
- Verify all CSS files are imported

## Resources

- [React Documentation](https://react.dev)
- [Lucide React Icons](https://lucide.dev)
- [Automata Theory Resources](https://www.sipser.com/)

## Contributing

When adding new tutorial content:

1. Follow the existing data structure
2. Test lessons/exercises thoroughly
3. Ensure content is pedagogically sound
4. Check for spelling/grammar
5. Update this README if adding new features


