import React, { createContext, useContext, useCallback } from 'react';
import { useToast } from './ToastContext';
import { useHaptics } from '../hooks/useHaptics';
import { NotificationType } from '@capacitor/haptics';
import { useHabitsData } from '../hooks/useHabitsData';

const HabitsContext = createContext();

export const useHabits = () => {
    const context = useContext(HabitsContext);
    if (!context) {
        throw new Error('useHabits must be used within a HabitsProvider');
    }
    return context;
};

export const HabitsProvider = ({ children }) => {
    const toast = useToast();
    const { lightImpact, mediumImpact, heavyImpact, notification } = useHaptics();

    // Data Logic extracted to hook
    const {
        habits,
        history,
        user,
        loading,
        addHabit: addHabitData,
        editHabit: editHabitData,
        deleteHabit: deleteHabitData,
        toggleCompletion: toggleCompletionData,
        setHabitsBulk: setHabitsBulkData
    } = useHabitsData(toast);

    // Haptic feedback helper
    const triggerHaptic = useCallback((type = 'light') => {
        switch (type) {
            case 'light':
                lightImpact();
                break;
            case 'medium':
                mediumImpact();
                break;
            case 'heavy':
                heavyImpact();
                break;
            case 'success':
                notification(NotificationType.Success);
                break;
            case 'error':
                notification(NotificationType.Error);
                break;
            default:
                lightImpact();
        }
    }, [lightImpact, mediumImpact, heavyImpact, notification]);

    // Wrappers with Haptics
    const addHabit = async (text, category) => {
        triggerHaptic('light');
        await addHabitData(text, category);
    };

    const editHabit = async (id, newText) => {
        await editHabitData(id, newText);
    };

    const deleteHabit = async (id) => {
        triggerHaptic('medium');
        await deleteHabitData(id);
    };

    const toggleCompletion = async (habitId, dateString) => {
        return await toggleCompletionData(habitId, dateString);
    };

    const setHabitsBulk = async (newHabitsList) => {
        await setHabitsBulkData(newHabitsList);
    };

    return (
        <HabitsContext.Provider value={{
            habits,
            history,
            user,
            loading,
            addHabit,
            editHabit,
            deleteHabit,
            toggleCompletion,
            setHabitsBulk,
            triggerHaptic
        }}>
            {children}
        </HabitsContext.Provider>
    );
};
