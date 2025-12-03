import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './ToastContext';


import { useHaptics } from '../hooks/useHaptics';
import { NotificationType } from '@capacitor/haptics';

const HabitsContext = createContext();

export const useHabits = () => {
    const context = useContext(HabitsContext);
    if (!context) {
        throw new Error('useHabits must be used within a HabitsProvider');
    }
    return context;
};

export const HabitsProvider = ({ children }) => {
    const [habits, setHabits] = useState([]);
    const [history, setHistory] = useState({});
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    const { lightImpact, mediumImpact, heavyImpact, notification } = useHaptics();

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

    const syncLocalToCloud = async (userId, localHabits, localHistory) => {
        // 1. Insert Habits
        const habitIdMap = {}; // Old ID -> New UUID

        for (const h of localHabits) {
            const { data } = await supabase.from('habits').insert({
                user_id: userId,
                title: h.text || h.title, // Handle legacy 'text' field
                category: h.category,
                frequency: 'daily'
            }).select().single();

            if (data) {
                habitIdMap[h.id] = data.id;
            }
        }

        // 2. Insert Logs
        const logsToInsert = [];
        Object.entries(localHistory).forEach(([date, habitIds]) => {
            habitIds.forEach(oldId => {
                if (habitIdMap[oldId]) {
                    logsToInsert.push({
                        user_id: userId,
                        habit_id: habitIdMap[oldId],
                        date_string: date,
                        completed_at: new Date().toISOString() // Approximate
                    });
                }
            });
        });

        if (logsToInsert.length > 0) {
            await supabase.from('logs').insert(logsToInsert);
        }
    };

    // 2. Fetch Data & Merge Conflict Resolution
    const fetchData = useCallback(async (userId) => {
        setLoading(true);
        try {
            // Fetch Habits
            const { data: cloudHabits, error: habitsError } = await supabase
                .from('habits')
                .select('*')
                .order('created_at', { ascending: true });

            if (habitsError) throw habitsError;

            // Fetch Logs (History)
            const { data: cloudLogs, error: logsError } = await supabase
                .from('logs')
                .select('*');

            if (logsError) throw logsError;

            // Process Logs into History Object
            const cloudHistory = {};
            cloudLogs.forEach(log => {
                if (!cloudHistory[log.date_string]) {
                    cloudHistory[log.date_string] = [];
                }
                cloudHistory[log.date_string].push(log.habit_id);
            });

            // --- CONFLICT RESOLUTION / MERGE ---
            // Check if we have local data to merge (on first login)
            const localHabits = JSON.parse(localStorage.getItem('habits_def') || '[]');
            const localHistory = JSON.parse(localStorage.getItem('habit_history') || '{}');
            const hasLocalData = localHabits.length > 0 || Object.keys(localHistory).length > 0;

            if (hasLocalData && cloudHabits.length === 0) {
                // Case: User has local data but new cloud account -> Upload Local to Cloud
                console.log("Syncing local data to cloud...");
                toast.info("SYNCING", "Uploading local data to neural cloud...");
                await syncLocalToCloud(userId, localHabits, localHistory);

                // Re-fetch to get the IDs generated/confirmed
                const { data: newHabits } = await supabase.from('habits').select('*').order('created_at', { ascending: true });
                const { data: newLogs } = await supabase.from('logs').select('*');

                const newHistory = {};
                newLogs.forEach(log => {
                    if (!newHistory[log.date_string]) newHistory[log.date_string] = [];
                    newHistory[log.date_string].push(log.habit_id);
                });

                setHabits(newHabits || []);
                setHistory(newHistory);

                // Clear local storage to avoid re-syncing
                localStorage.removeItem('habits_def');
                localStorage.removeItem('habit_history');
                toast.success("SYNC COMPLETE", "Neural link established.");
            } else {
                // If we just fetched cloud data, update state
                setHabits(cloudHabits || []);
                setHistory(cloudHistory);
            }

        } catch (err) {
            console.error("Error fetching data:", err);
            toast.error("SYNC FAILED", "Could not retrieve protocol data.");
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // 1. Auth Listener & Initial Load
    useEffect(() => {
        if (!supabase) {
            console.warn("Supabase not configured. Falling back to local state (ephemeral).");
            toast.error("SYSTEM ERROR", "Supabase configuration missing.");
            setLoading(false);
            return;
        }

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchData(session.user.id);
            } else {
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchData(session.user.id);
            } else {
                setHabits([]);
                setHistory({});
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [fetchData, toast]);

    // 3. Actions (Optimistic UI)

    const addHabit = async (text, category = 'training') => {
        if (!user) return;

        // Optimistic Update
        const tempId = crypto.randomUUID();
        const newHabit = { id: tempId, user_id: user.id, title: text, category, frequency: 'daily' };

        setHabits(prev => [...prev, newHabit]);
        triggerHaptic('light');

        // Sync
        const { data, error } = await supabase.from('habits').insert({
            user_id: user.id,
            title: text,
            category
        }).select().single();

        if (data) {
            // Replace temp ID with real ID
            setHabits(prev => prev.map(h => h.id === tempId ? data : h));
        } else if (error) {
            console.error("Error adding habit:", error);
            toast.error("UPLOAD FAILED", "Could not save new protocol.");
            // Rollback
            setHabits(prev => prev.filter(h => h.id !== tempId));
        }
    };

    const editHabit = async (id, newText) => {
        setHabits(prev => prev.map(h => h.id === id ? { ...h, title: newText } : h));

        const { error } = await supabase.from('habits').update({ title: newText }).eq('id', id);
        if (error) {
            console.error("Error updating habit:", error);
            toast.error("UPDATE FAILED", "Changes not saved to cloud.");
        }
    };

    const deleteHabit = async (id) => {
        setHabits(prev => prev.filter(h => h.id !== id));
        triggerHaptic('medium');

        const { error } = await supabase.from('habits').delete().eq('id', id);
        if (error) {
            console.error("Error deleting habit:", error);
            toast.error("DELETE FAILED", "Protocol persists in cloud.");
        }
    };

    const toggleCompletion = async (habitId, dateString) => {
        // Determine if currently completed
        const isCompleted = history[dateString]?.includes(habitId);

        // Optimistic Update
        setHistory(prev => {
            const dayLogs = prev[dateString] || [];
            if (isCompleted) {
                return { ...prev, [dateString]: dayLogs.filter(id => id !== habitId) };
            } else {
                return { ...prev, [dateString]: [...dayLogs, habitId] };
            }
        });

        // Sync
        if (isCompleted) {
            // Remove log
            const { error } = await supabase
                .from('logs')
                .delete()
                .match({ habit_id: habitId, date_string: dateString });

            if (error) {
                console.error("Error removing log:", error);
                toast.error("SYNC ERROR", "Completion status mismatch.");
            }
        } else {
            // Add log
            const { error } = await supabase.from('logs').insert({
                user_id: user.id,
                habit_id: habitId,
                date_string: dateString,
                completed_at: new Date().toISOString()
            });
            if (error) {
                console.error("Error adding log:", error);
                toast.error("SYNC ERROR", "Completion status mismatch.");
            }
        }

        return !isCompleted; // Return new state
    };

    // Bulk set habits (for Protocol Selector)
    const setHabitsBulk = async (newHabitsList) => {
        if (!user) return;

        const habitsToInsert = newHabitsList.map(h => ({
            user_id: user.id,
            title: h.text || h.title,
            category: h.category,
            frequency: 'daily'
        }));

        const { data, error } = await supabase.from('habits').insert(habitsToInsert).select();

        if (data) {
            setHabits(data);
            toast.success("PROTOCOL INITIATED", "New directives received.");
        } else if (error) {
            console.error("Error bulk setting habits:", error);
            toast.error("INITIATION FAILED", "Could not load protocol.");
        }
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
