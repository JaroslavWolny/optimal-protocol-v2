import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { useCallback } from 'react';

export const useHaptics = () => {
    const impact = useCallback(async (style = ImpactStyle.Medium) => {
        try {
            await Haptics.impact({ style });
        } catch (error) {
            console.error('Haptics impact failed:', error);
        }
    }, []);

    const heavyImpact = useCallback(async () => {
        try {
            await Haptics.impact({ style: ImpactStyle.Heavy });
        } catch (error) {
            console.error('Haptics heavy impact failed:', error);
        }
    }, []);

    const lightImpact = useCallback(async () => {
        try {
            await Haptics.impact({ style: ImpactStyle.Light });
        } catch (error) {
            console.error('Haptics light impact failed:', error);
        }
    }, []);

    const mediumImpact = useCallback(async () => {
        try {
            await Haptics.impact({ style: ImpactStyle.Medium });
        } catch (error) {
            console.error('Haptics medium impact failed:', error);
        }
    }, []);

    const notification = useCallback(async (type = NotificationType.Success) => {
        try {
            await Haptics.notification({ type });
        } catch (error) {
            console.error('Haptics notification failed:', error);
        }
    }, []);

    const vibrate = useCallback(async (duration = 300) => {
        try {
            await Haptics.vibrate({ duration });
        } catch (error) {
            console.error('Haptics vibrate failed:', error);
        }
    }, []);

    const selectionStart = useCallback(async () => {
        try {
            await Haptics.selectionStart();
        } catch (error) {
            console.error('Haptics selectionStart failed:', error);
        }
    }, []);

    const selectionChanged = useCallback(async () => {
        try {
            await Haptics.selectionChanged();
        } catch (error) {
            console.error('Haptics selectionChanged failed:', error);
        }
    }, []);

    const selectionEnd = useCallback(async () => {
        try {
            await Haptics.selectionEnd();
        } catch (error) {
            console.error('Haptics selectionEnd failed:', error);
        }
    }, []);

    return {
        impact,
        heavyImpact,
        lightImpact,
        mediumImpact,
        notification,
        vibrate,
        selectionStart,
        selectionChanged,
        selectionEnd,
    };
};
