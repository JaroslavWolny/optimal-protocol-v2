import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useHabitsData = (toast) => {
    const [habits, setHabits] = useState([]);
    const [history, setHistory] = useState({});
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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

    // Fetch Data & Merge Conflict Resolution
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

            // Fetch Profile Status (for Permadeath)
            const { data: profileData } = await supabase
                .from('profiles')
                .select('status, streak, avatar_stage')
                .eq('id', userId)
                .single();

            if (profileData) {
                setUser(prev => ({ ...prev, ...profileData }));
            }

        } catch (err) {
            console.error("Error fetching data:", err);
            toast.error("SYNC FAILED", "Could not retrieve protocol data.");
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // Auth Listener & Initial Load
    useEffect(() => {
        if (!supabase) {
            console.warn("Supabase not configured. Falling back to local state (ephemeral).");

            const isDemo = localStorage.getItem('demo_mode');
            if (isDemo) {
                setUser({ id: 'offline-user', email: 'operator@offline.local', status: 'ALIVE' });

                // Load local data
                try {
                    const localHabits = JSON.parse(localStorage.getItem('habits_def') || '[]');
                    const localHistory = JSON.parse(localStorage.getItem('habit_history') || '{}');
                    setHabits(localHabits);
                    setHistory(localHistory);
                } catch (e) {
                    console.error("Failed to load local data", e);
                }
            }

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

    // Persistence Helper for Offline Mode
    const persistLocal = (newHabits, newHistory) => {
        if (!supabase) {
            if (newHabits) localStorage.setItem('habits_def', JSON.stringify(newHabits));
            if (newHistory) localStorage.setItem('habit_history', JSON.stringify(newHistory));
        }
    };

    // Actions
    const addHabit = useCallback(async (text, category = 'training') => {
        if (!user) return;

        // Optimistic Update
        const tempId = crypto.randomUUID();
        const newHabit = { id: tempId, user_id: user.id, title: text, category, frequency: 'daily' };

        setHabits(prev => {
            const next = [...prev, newHabit];
            persistLocal(next, null);
            return next;
        });

        if (!supabase) return true; // Offline success

        // Sync
        const { data, error } = await supabase.from('habits').insert({
            user_id: user.id,
            title: text,
            category
        }).select().single();

        if (data) {
            // Replace temp ID with real ID
            setHabits(prev => prev.map(h => h.id === tempId ? data : h));
            return true;
        } else if (error) {
            console.error("Error adding habit:", error);
            toast.error("UPLOAD FAILED", "Could not save new protocol.");
            // Rollback
            setHabits(prev => prev.filter(h => h.id !== tempId));
            return false;
        }
    }, [user, toast]);

    const editHabit = useCallback(async (id, newText) => {
        setHabits(prev => {
            const next = prev.map(h => h.id === id ? { ...h, title: newText } : h);
            persistLocal(next, null);
            return next;
        });

        if (!supabase) return true;

        const { error } = await supabase.from('habits').update({ title: newText }).eq('id', id);
        if (error) {
            console.error("Error updating habit:", error);
            toast.error("UPDATE FAILED", "Changes not saved to cloud.");
            return false;
        }
        return true;
    }, [toast]);

    const deleteHabit = useCallback(async (id) => {
        setHabits(prev => {
            const next = prev.filter(h => h.id !== id);
            persistLocal(next, null);
            return next;
        });

        if (!supabase) return true;

        const { error } = await supabase.from('habits').delete().eq('id', id);
        if (error) {
            console.error("Error deleting habit:", error);
            toast.error("DELETE FAILED", "Protocol persists in cloud.");
            return false;
        }
        return true;
    }, [toast]);

    const toggleCompletion = useCallback(async (habitId, dateString) => {
        // Determine if currently completed
        const isCompleted = history[dateString]?.includes(habitId);

        // Optimistic Update
        setHistory(prev => {
            const dayLogs = prev[dateString] || [];
            let nextHistory;
            if (isCompleted) {
                nextHistory = { ...prev, [dateString]: dayLogs.filter(id => id !== habitId) };
            } else {
                nextHistory = { ...prev, [dateString]: [...dayLogs, habitId] };
            }
            persistLocal(null, nextHistory);
            return nextHistory;
        });

        if (!supabase) return !isCompleted;

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
                return false;
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
                return false;
            }
        }

        return !isCompleted; // Return new state
    }, [history, user, toast]);

    const setHabitsBulk = useCallback(async (newHabitsList) => {
        if (!user) return;

        const habitsToInsert = newHabitsList.map(h => ({
            user_id: user.id,
            title: h.text || h.title,
            category: h.category,
            frequency: 'daily'
        }));

        if (!supabase) {
            // Offline Bulk Set
            // We need to give them IDs
            const offlineHabits = habitsToInsert.map(h => ({ ...h, id: crypto.randomUUID() }));
            setHabits(offlineHabits);
            persistLocal(offlineHabits, null);
            toast.success("OFFLINE PROTOCOL", "Directives stored locally.");
            return true;
        }

        const { data, error } = await supabase.from('habits').insert(habitsToInsert).select();

        if (data) {
            setHabits(data);
            toast.success("PROTOCOL INITIATED", "New directives received.");
            return true;
        } else if (error) {
            console.error("Error bulk setting habits:", error);
            toast.error("INITIATION FAILED", "Could not load protocol.");
            return false;
        }
    }, [user, toast]);

    return {
        habits,
        history,
        user,
        loading,
        addHabit,
        editHabit,
        deleteHabit,
        toggleCompletion,
        setHabitsBulk,
        setHabits // Exposed for edge cases if needed
    };
};
