import { useState, useEffect, useMemo } from 'react';
import { useHabits } from './useHabits';

export function useGamification() {
    const { history, habits } = useHabits();

    const [hardcoreMode, setHardcoreMode] = useState(() => {
        const saved = localStorage.getItem('hardcore_mode');
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        localStorage.setItem('hardcore_mode', JSON.stringify(hardcoreMode));
    }, [hardcoreMode]);

    const getTodayStr = () => {
        const date = new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const today = getTodayStr();

    const calculateStreak = () => {
        let currentStreak = 0;
        const todayDate = new Date();

        for (let i = 0; i < 365; i++) {
            const d = new Date();
            d.setDate(todayDate.getDate() - i);
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            const completedIds = history[dateStr] || [];
            const endOfDay = new Date(d);
            endOfDay.setHours(23, 59, 59, 999);

            const relevantHabits = habits.filter(h => {
                if (i === 0) return true;
                if (typeof h.id !== 'number') return true;
                return h.id <= endOfDay.getTime();
            });

            if (relevantHabits.length === 0) {
                if (i === 0) continue;
                break;
            }

            const allCompleted = relevantHabits.every(h => completedIds.includes(h.id));

            if (allCompleted) {
                currentStreak++;
            } else if (i === 0) {
                continue;
            } else {
                break;
            }
        }
        return currentStreak;
    };

    // OPTIMIZATION: Memoize streak calculation to prevent heavy logic on every render
    const streak = useMemo(() => calculateStreak(), [history, habits]);

    // Permadeath Check - DEPRECATED
    // Logic moved to Server-Side Edge Function (monitor-vital-signs)
    // The client now only reflects the state (streak 0) if the server killed the user.


    const calculateHabitStreak = (habitId) => {
        let streak = 0;
        const todayDate = new Date();

        for (let i = 0; i < 365; i++) {
            const d = new Date();
            d.setDate(todayDate.getDate() - i);
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            const endOfDay = new Date(d);
            endOfDay.setHours(23, 59, 59, 999);
            if (typeof habitId === 'number' && habitId > endOfDay.getTime()) {
                break;
            }

            const isCompleted = (history[dateStr] || []).includes(habitId);

            if (isCompleted) {
                streak++;
            } else {
                if (i === 0) continue;
                break;
            }
        }
        return streak;
    };

    return {
        streak,
        calculateHabitStreak,
        hardcoreMode,
        setHardcoreMode,
        today
    };
}
