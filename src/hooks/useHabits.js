import { useState, useEffect } from 'react';
import { soundManager } from '../utils/SoundManager';

export function useHabits() {
    const [habits, setHabits] = useState(() => {
        const saved = localStorage.getItem('habits_def');
        return saved ? JSON.parse(saved) : [];
    });

    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('habit_history');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('habits_def', JSON.stringify(habits));
    }, [habits]);

    useEffect(() => {
        localStorage.setItem('habit_history', JSON.stringify(history));
    }, [history]);

    const triggerHaptic = (type = 'light') => {
        if (navigator.vibrate) {
            const patterns = {
                light: 10,
                medium: 20,
                heavy: 40,
                success: [10, 30, 10]
            };
            navigator.vibrate(patterns[type] || 10);
        }
    };

    const addHabit = (text, category = 'training') => {
        setHabits([...habits, { id: Date.now(), text, category }]);
        triggerHaptic('light');
    };

    const editHabit = (id, newText) => {
        setHabits(habits.map(h => h.id === id ? { ...h, text: newText } : h));
    };

    const deleteHabit = (id) => {
        setHabits(habits.filter(h => h.id !== id));
        triggerHaptic('medium');
    };

    return {
        habits,
        setHabits,
        history,
        setHistory,
        addHabit,
        editHabit,
        deleteHabit,
        triggerHaptic
    };
}
