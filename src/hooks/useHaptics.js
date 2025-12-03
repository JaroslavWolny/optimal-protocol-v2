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

    const success = useCallback(async () => {
        try {
            await Haptics.notification({ type: NotificationType.Success });
        } catch (error) {
            console.error('Haptics success failed:', error);
        }
    }, []);

    const error = useCallback(async () => {
        try {
            await Haptics.notification({ type: NotificationType.Error });
        } catch (err) {
            console.error('Haptics error failed:', err);
        }
    }, []);

    return { impact, success, error };
};
